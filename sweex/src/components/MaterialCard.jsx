import { Link } from 'react-router-dom';
import { BoxIcon } from '../icons.jsx';

const STATUS_LABEL = { available: 'Available', matched: 'Matched', collected: 'Collected' };

export default function MaterialCard({ material }) {
  return (
    <Link to={`/materials/${material.id}`} className="material-card">
      <div className="material-card__top">
        <span className="material-card__title"><BoxIcon size={16} color="var(--purple)" />{material.title}</span>
        <span className="material-card__value">${Number(material.estimated_value).toFixed(2)}</span>
      </div>
      <span className={`badge badge--${material.status}`}>{STATUS_LABEL[material.status] || material.status}</span>
      <p className="material-card__meta">
        {material.category} · {material.quantity} {material.unit} · {material.condition}
      </p>
      <p className="material-card__meta">{material.address || 'Location on file'}</p>
      <p className="material-card__meta">Listed by {material.owner_name}</p>
    </Link>
  );
}
