import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import BidRow from '../components/BidRow.jsx';
import { GavelIcon } from '../icons.jsx';

export default function Matches() {
  const { user } = useAuth();
  const isBidder = user?.role && ['waste_collector', 'recycler', 'organisation'].includes(user.role);
  const [bids, setBids] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = isBidder ? await api.getMyBids() : await api.getReceivedBids();
      setBids(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAccept(id) { try { await api.acceptBid(id); await load(); } catch (err) { setError(err.message); } }
  async function handleReject(id) { try { await api.rejectBid(id); await load(); } catch (err) { setError(err.message); } }
  async function handleWithdraw(id) { try { await api.withdrawBid(id); await load(); } catch (err) { setError(err.message); } }
  async function handleComplete(id) { try { await api.completeBid(id); await load(); } catch (err) { setError(err.message); } }

  return (
    <div className="page">
      <div className="panel-header">
        <h2><GavelIcon size={18} className="icon-inline" />{isBidder ? 'Your bids' : 'Bids received'}</h2>
      </div>
      {error && <div className="banner banner--error">{error}</div>}
      {loading ? (
        <p className="loading-state">Loading…</p>
      ) : bids.length === 0 ? (
        <p className="empty-state">{isBidder ? "You haven't placed any bids yet." : 'No bids yet.'}</p>
      ) : (
        bids.map((b) => (
          <BidRow
            key={b.id}
            bid={b}
            viewerRole={isBidder ? 'bidder' : 'owner'}
            onAccept={handleAccept}
            onReject={handleReject}
            onWithdraw={handleWithdraw}
            onComplete={handleComplete}
          />
        ))
      )}
    </div>
  );
}
