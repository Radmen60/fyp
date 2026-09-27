import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import BidRow from '../components/BidRow.jsx';
import BidForm from '../components/BidForm.jsx';
import { BoxIcon, RecycleIcon, WalletIcon, UserIcon, Box2Icon, TargetIcon, GavelIcon } from '../icons.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [biddingOn, setBiddingOn] = useState(null); // material_id currently showing a bid form

  async function load() {
    try {
      setData(await api.getDashboard());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAcceptBid(bidId) {
    try { await api.acceptBid(bidId); await load(); } catch (err) { setError(err.message); }
  }
  async function handleRejectBid(bidId) {
    try { await api.rejectBid(bidId); await load(); } catch (err) { setError(err.message); }
  }
  async function handleWithdrawBid(bidId) {
    try { await api.withdrawBid(bidId); await load(); } catch (err) { setError(err.message); }
  }
  async function handleComplete(bidId) {
    try { await api.completeBid(bidId); await load(); } catch (err) { setError(err.message); }
  }

  if (error) return <div className="page"><div className="banner banner--error">{error}</div></div>;
  if (!data) return <div className="page"><p className="loading-state">Loading dashboard…</p></div>;

  return (
    <div className="page">
      <div className="panel-header">
        <div>
          <h2>Welcome back, {user.name}</h2>
          <p>
            {data.role_group === 'admin' && 'System-wide overview.'}
            {data.role_group === 'producer' && 'Your listings and the bids coming in on them.'}
            {data.role_group === 'processor' && 'Materials recommended to you — place a bid on anything you want.'}
          </p>
        </div>
        <Link to="/materials/add" className="btn btn--primary"><Box2Icon size={15} /> List a material</Link>
      </div>

      {data.role_group === 'admin' && (
        <>
          <div className="stat-row">
            <div className="stat-tile">
              <span className="icon-badge"><BoxIcon size={16} /></span>
              <div className="stat-tile__value">{data.stats.total_listed}</div>
              <div className="stat-tile__label">Materials listed</div>
            </div>
            <div className="stat-tile stat-tile--good">
              <span className="icon-badge"><RecycleIcon size={16} /></span>
              <div className="stat-tile__value">{data.stats.total_collected}</div>
              <div className="stat-tile__label">Collected</div>
            </div>
            <div className="stat-tile stat-tile--warn">
              <span className="icon-badge icon-badge--blue"><WalletIcon size={16} /></span>
              <div className="stat-tile__value">${Number(data.stats.value_diverted).toFixed(0)}</div>
              <div className="stat-tile__label">Value diverted</div>
            </div>
            <div className="stat-tile">
              <span className="icon-badge"><UserIcon size={16} /></span>
              <div className="stat-tile__value">{data.user_count}</div>
              <div className="stat-tile__label">Registered users</div>
            </div>
          </div>

          <section style={{ marginBottom: 32 }}>
            <div className="panel-header"><h2><BoxIcon size={18} className="icon-inline" />Recent listings</h2></div>
            {data.materials.length === 0 ? <p className="empty-state">Nothing listed yet.</p> : (
              <div className="material-grid">{data.materials.map((m) => <MaterialCard key={m.id} material={m} />)}</div>
            )}
          </section>

          <section>
            <div className="panel-header"><h2><GavelIcon size={18} className="icon-inline" />Recent bids</h2></div>
            {data.bids.length === 0 ? <p className="empty-state">No bids yet.</p> : (
              data.bids.map((b) => (
                <BidRow key={b.id} bid={b} viewerRole="owner" onAccept={handleAcceptBid} onReject={handleRejectBid} onComplete={handleComplete} />
              ))
            )}
          </section>
        </>
      )}

      {data.role_group === 'producer' && (
        <>
          <section style={{ marginBottom: 32 }}>
            <div className="panel-header"><h2><BoxIcon size={18} className="icon-inline" />Your materials</h2></div>
            {data.materials.length === 0 ? <p className="empty-state">You haven't listed anything yet.</p> : (
              <div className="material-grid">{data.materials.map((m) => <MaterialCard key={m.id} material={m} />)}</div>
            )}
          </section>

          <section>
            <div className="panel-header"><h2><GavelIcon size={18} className="icon-inline" />Bids received</h2></div>
            {data.bids_received.length === 0 ? (
              <p className="empty-state">No bids yet — once a processor bids on your listing, it'll show up here for you to accept or reject.</p>
            ) : (
              data.bids_received.map((b) => (
                <BidRow key={b.id} bid={b} viewerRole="owner" onAccept={handleAcceptBid} onReject={handleRejectBid} onComplete={handleComplete} />
              ))
            )}
          </section>
        </>
      )}

      {data.role_group === 'processor' && (
        <>
          <section style={{ marginBottom: 32 }}>
            <div className="panel-header">
              <h2><TargetIcon size={18} className="icon-inline" />Recommended for you</h2>
            </div>
            {data.recommended.length === 0 ? (
              <p className="empty-state">Nothing recommended yet — check back once more materials matching your categories are listed.</p>
            ) : (
              <div className="material-grid">
                {data.recommended.map((m) => (
                  <div key={m.match_id} className="recommended-card">
                    <div className="recommended-card__title">
                      <Link to={`/materials/${m.material_id}`}>{m.title}</Link>
                    </div>
                    <p className="recommended-card__meta">
                      {m.category} · {m.quantity} {m.unit} · {m.condition} · ${Number(m.estimated_value).toFixed(2)}
                    </p>
                    <p className="recommended-card__meta">Listed by {m.owner_name} · score {Number(m.score).toFixed(2)}</p>
                    {biddingOn === m.material_id ? (
                      <BidForm
                        material={{ id: m.material_id, estimated_value: m.estimated_value }}
                        onPlaced={() => { setBiddingOn(null); load(); }}
                      />
                    ) : (
                      <button className="btn btn--primary btn--small" onClick={() => setBiddingOn(m.material_id)}>
                        <GavelIcon size={14} /> Place a bid
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="panel-header"><h2><GavelIcon size={18} className="icon-inline" />Your bids</h2></div>
            {data.my_bids.length === 0 ? (
              <p className="empty-state">You haven't placed any bids yet.</p>
            ) : (
              data.my_bids.map((b) => (
                <BidRow key={b.id} bid={b} viewerRole="bidder" onWithdraw={handleWithdrawBid} onComplete={handleComplete} />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
