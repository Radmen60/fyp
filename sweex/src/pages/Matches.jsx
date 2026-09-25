import { useEffect, useState } from 'react';
import { api } from '../api.js';
import MatchRow from '../components/MatchRow.jsx';
import { TargetIcon } from '../icons.jsx';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setMatches(await api.getMatches());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAction(id, action) {
    try {
      await api.updateMatch(id, action);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="panel-header"><h2><TargetIcon size={18} className="icon-inline" />Matches</h2></div>
      {error && <div className="banner banner--error">{error}</div>}
      {loading ? (
        <p className="loading-state">Loading matches…</p>
      ) : matches.length === 0 ? (
        <p className="empty-state">No matches yet.</p>
      ) : (
        matches.map((m) => <MatchRow key={m.id} match={m} onAction={handleAction} />)
      )}
    </div>
  );
}
