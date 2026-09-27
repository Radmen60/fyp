import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import LocationMap from '../components/LocationMap.jsx';
import BidRow from '../components/BidRow.jsx';
import BidForm from '../components/BidForm.jsx';
import ContactCard from '../components/ContactCard.jsx';
import { SearchIcon, TargetIcon, Box2Icon, LocationPinIcon, GavelIcon, CrossIcon } from '../icons.jsx';

export default function MaterialDetail() {
  const { id } = useParams();
  const routerLocation = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(routerLocation.state?.message || '');
  const [finding, setFinding] = useState(false);

  async function load() {
    try {
      setData(await api.getMaterial(id));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleFindMatches() {
    setFinding(true);
    setError('');
    try {
      const res = await api.findMatches(id);
      setMessage(res.message);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setFinding(false);
    }
  }

  async function handleAcceptBid(bidId) {
    try {
      const res = await api.acceptBid(bidId);
      setMessage(res.message);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRejectBid(bidId) {
    try {
      await api.rejectBid(bidId);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleWithdrawBid(bidId) {
    try {
      await api.withdrawBid(bidId);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleComplete(bidId) {
    try {
      const res = await api.completeBid(bidId);
      setMessage(res.message);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !data) return <div className="page"><div className="banner banner--error">{error}</div></div>;
  if (!data) return <div className="page"><p className="loading-state">Loading…</p></div>;

  const { material, matches, bids, my_bid, seller_contact, is_owner, is_admin, can_bid } = data;

  return (
    <div className="page">
      {message && <div className="banner banner--success">{message}</div>}
      {error && <div className="banner banner--error">{error}</div>}

      <div className="card">
        <div className="material-detail__header">
          <div>
            <h2><Box2Icon size={20} className="icon-inline" />{material.title}</h2>
            <span className={`badge badge--${material.status}`} style={{ marginTop: 8 }}>{material.status}</span>
          </div>
          <div className="material-detail__value">${Number(material.estimated_value).toFixed(2)}</div>
        </div>

        <p className="material-detail__desc">{material.description || 'No description provided.'}</p>

        <div className="material-detail__specs">
          <div className="spec"><span>Category</span>{material.category}</div>
          <div className="spec"><span>Quantity</span>{material.quantity} {material.unit}</div>
          <div className="spec"><span>Condition</span>{material.condition}</div>
          <div className="spec"><span>Listed by</span>{material.owner_name}</div>
          <div className="spec"><span>Address</span><LocationPinIcon size={12} className="icon-inline" />{material.address || '—'}</div>
        </div>

        <LocationMap lat={material.latitude} lng={material.longitude} label={material.title} />

        {(is_owner || is_admin) && (
          <button className="btn btn--primary" onClick={handleFindMatches} disabled={finding}>
            <SearchIcon size={15} /> {finding ? 'Searching…' : 'Find matches'}
          </button>
        )}

        {/* Non-owner, eligible processor: place or manage their own bid */}
        {!is_owner && !is_admin && can_bid && !my_bid && (
          <BidForm material={material} onPlaced={(res) => { setMessage(res.message); load(); }} />
        )}
        {!is_owner && !is_admin && my_bid && (
          <div className="bid-form">
            <p style={{ margin: 0 }}>
              <GavelIcon size={15} className="icon-inline" />
              Your bid: <strong>${Number(my_bid.amount).toFixed(2)}</strong>{' '}
              <span className={`badge badge--${my_bid.status}`}>{my_bid.status}</span>
            </p>
            {my_bid.status === 'pending' && (
              <button className="btn btn--small" onClick={() => handleWithdrawBid(my_bid.id)} style={{ alignSelf: 'flex-start' }}>
                <CrossIcon size={14} /> Withdraw bid
              </button>
            )}
            {my_bid.status === 'accepted' && material.status !== 'collected' && (
              <button className="btn btn--small btn--good" onClick={() => handleComplete(my_bid.id)} style={{ alignSelf: 'flex-start' }}>
                Mark collected
              </button>
            )}
            {my_bid.status === 'accepted' && seller_contact && (
              <ContactCard person={seller_contact} heading="Seller contact details" />
            )}
          </div>
        )}
      </div>

      {/* Owner/admin: who the algorithm recommended this to */}
      {(is_owner || is_admin) && matches.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <div className="panel-header"><h2><TargetIcon size={18} className="icon-inline" />Recommended to</h2></div>
          <div className="material-grid">
            {matches.map((m) => (
              <div key={m.id} className="recommended-card">
                <span className="recommended-card__title">{m.matched_user_name}</span>
                <p className="recommended-card__meta">{m.matched_user_role} · score {Number(m.score).toFixed(2)}
                  {m.distance_km != null && ` · ${Number(m.distance_km).toFixed(1)} km away`}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Owner/admin: bids received, with accept/reject */}
      {(is_owner || is_admin) && (
        <section style={{ marginTop: 28 }}>
          <div className="panel-header"><h2><GavelIcon size={18} className="icon-inline" />Bids received</h2></div>
          {bids.length === 0 ? (
            <p className="empty-state">No bids yet.</p>
          ) : (
            bids.map((b) => (
              <BidRow
                key={b.id}
                bid={{ ...b, material_title: material.title, material_id: material.id, material_status: material.status }}
                viewerRole="owner"
                onAccept={handleAcceptBid}
                onReject={handleRejectBid}
                onComplete={handleComplete}
              />
            ))
          )}
        </section>
      )}
    </div>
  );
}
