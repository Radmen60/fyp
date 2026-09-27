import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { AnalyticsIcon, BoxIcon, RecycleIcon, WalletIcon } from '../icons.jsx';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="page"><div className="banner banner--error">{error}</div></div>;
  if (!stats) return <div className="page"><p className="loading-state">Loading stats…</p></div>;

  const maxCount = Math.max(1, ...stats.by_category.map((c) => c.count));

  return (
    <div className="page">
      <div className="panel-header"><h2><AnalyticsIcon size={18} className="icon-inline" />Landfill diversion stats</h2></div>

      <div className="stat-row">
        <div className="stat-tile">
          <span className="icon-badge"><BoxIcon size={16} /></span>
          <div className="stat-tile__value">{stats.total_listed}</div>
          <div className="stat-tile__label">Materials listed</div>
        </div>
        <div className="stat-tile stat-tile--good">
          <span className="icon-badge"><RecycleIcon size={16} /></span>
          <div className="stat-tile__value">{stats.total_collected}</div>
          <div className="stat-tile__label">Collected / diverted</div>
        </div>
        <div className="stat-tile stat-tile--warn">
          <span className="icon-badge icon-badge--blue"><WalletIcon size={16} /></span>
          <div className="stat-tile__value">${Number(stats.value_diverted).toFixed(0)}</div>
          <div className="stat-tile__label">Value diverted</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>By category</h3>
        <div className="bar-chart">
          {stats.by_category.map((c) => (
            <div className="bar-chart__row" key={c.category}>
              <span>{c.category}</span>
              <div className="bar-chart__track">
                <div className="bar-chart__fill" style={{ width: `${(c.count / maxCount) * 100}%` }} />
              </div>
              <span>{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>By status</h3>
        <div className="bar-chart">
          {stats.by_status.map((s) => (
            <div className="bar-chart__row" key={s.status}>
              <span>{s.status}</span>
              <div className="bar-chart__track">
                <div className="bar-chart__fill" style={{ width: `${(s.count / maxCount) * 100}%` }} />
              </div>
              <span>{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
