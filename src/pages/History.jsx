import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ReceiptIcon, ClockIcon } from '../icons.jsx';

const PROCESSOR_ROLES = ['waste_collector', 'recycler', 'organisation'];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function History() {
  const { user } = useAuth();
  const isProcessor = user?.role && PROCESSOR_ROLES.includes(user.role);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Admins see every completed deal via /received (it returns all bids for admins);
        // everyone else sees their own side of the transaction.
        const data = user.role === 'admin' || !isProcessor ? await api.getReceivedBids() : await api.getMyBids();
        const completed = data
          .filter((b) => b.status === 'accepted' && b.material_status === 'collected')
          .sort((a, b) => new Date(b.completed_at || b.responded_at) - new Date(a.completed_at || a.responded_at));
        setRows(completed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, isProcessor]);

  const totalValue = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <div className="page">
      <div className="panel-header">
        <div>
          <h2><ReceiptIcon size={18} className="icon-inline" />Transaction history</h2>
          <p>{rows.length} completed {rows.length === 1 ? 'transaction' : 'transactions'}{rows.length > 0 ? ` · $${totalValue.toFixed(2)} total` : ''}</p>
        </div>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      {loading ? (
        <p className="loading-state">Loading history…</p>
      ) : rows.length === 0 ? (
        <p className="empty-state">
          <ClockIcon size={14} className="icon-inline" />
          No completed transactions yet — they'll show up here once a bid is accepted and marked collected.
        </p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Material</th>
                {user.role === 'admin' ? (
                  <>
                    <th>Seller</th>
                    <th>Buyer</th>
                  </>
                ) : (
                  <th>{isProcessor ? 'Seller' : 'Buyer'}</th>
                )}
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.completed_at || r.responded_at)}</td>
                  <td><Link to={`/materials/${r.material_id}`}>{r.material_title}</Link></td>
                  {user.role === 'admin' ? (
                    <>
                      <td>{r.owner_name}</td>
                      <td>{r.bidder_name}</td>
                    </>
                  ) : (
                    <td>{isProcessor ? r.owner_name : r.bidder_name}</td>
                  )}
                  <td>${Number(r.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
