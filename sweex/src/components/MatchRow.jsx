import { Link } from 'react-router-dom';
import { TickIcon, CrossIcon, RecycleIcon, TargetIcon } from '../icons.jsx';

const NEXT_ACTIONS = {
  proposed: [
    { action: 'accept', label: 'Accept', cls: 'btn--good', Icon: TickIcon },
    { action: 'reject', label: 'Reject', cls: 'btn--danger', Icon: CrossIcon },
  ],
  accepted: [{ action: 'complete', label: 'Mark collected', cls: 'btn--good', Icon: RecycleIcon }],
  rejected: [],
  completed: [],
};

export default function MatchRow({ match, onAction }) {
  const actions = NEXT_ACTIONS[match.status] || [];
  return (
    <div className="match-row">
      <div className="match-row__main">
        <span className="match-row__title">
          <TargetIcon size={15} className="icon-inline" />
          <Link to={`/materials/${match.material_id}`}>{match.material_title}</Link>
          {' '}↔ {match.matched_user_name}
        </span>
        <span className="match-row__meta">
          Score {Number(match.score).toFixed(2)}
          {match.distance_km != null && ` · ${Number(match.distance_km).toFixed(1)} km away`}
        </span>
      </div>
      <div className="match-row__actions">
        <span className={`badge badge--${match.status}`}>{match.status}</span>
        {actions.map((a) => (
          <button key={a.action} className={`btn btn--small ${a.cls}`} onClick={() => onAction(match.id, a.action)}>
            <a.Icon size={14} /> {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
