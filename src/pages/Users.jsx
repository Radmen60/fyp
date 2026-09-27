import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { UserAddIcon } from '../icons.jsx';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then(setUsers).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="panel-header"><h2><UserAddIcon size={18} className="icon-inline" />Users</h2><p>{users.length} registered</p></div>
      {error && <div className="banner banner--error">{error}</div>}
      {loading ? (
        <p className="loading-state">Loading…</p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>{u.address}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
