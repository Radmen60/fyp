import { Link } from 'react-router-dom';
import { TickIcon, CrossIcon, RecycleIcon, GavelIcon } from '../icons.jsx';
import ContactCard from './ContactCard.jsx';

const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected', withdrawn: 'Withdrawn' };

// viewerRole: 'owner' — I listed the material, this bid came in on it.
//             'bidder' — I placed this bid on someone else's material.
export default function BidRow({ bid, viewerRole, onAccept, onReject, onWithdraw, onComplete }) {
  const isDone = bid.material_status === 'collected';
  const counterpart =
    viewerRole === 'owner'
      ? { name: bid.bidder_name, email: bid.bidder_email, phone: bid.bidder_phone, address: bid.bidder_address }
      : { name: bid.owner_name, email: bid.owner_email, phone: bid.owner_phone, address: bid.material_address };

  return (
    <div className="bid-row">
      <div className="bid-row__main">
        <p className="bid-row__title">
          <GavelIcon size={15} className="icon-inline" />
          <Link to={`/materials/${bid.material_id}`}>{bid.material_title}</Link>
          {viewerRole === 'owner' ? ` — bid from ${bid.bidder_name}` : ''}
        </p>
        <p className="bid-row__meta">
          Bid <strong>${Number(bid.amount).toFixed(2)}</strong>
          {bid.estimated_value != null && ` (listed at $${Number(bid.estimated_value).toFixed(2)})`}
          {viewerRole === 'owner' && bid.bidder_role ? ` · ${bid.bidder_role}` : ''}
        </p>
        {bid.message && <p className="bid-row__message">&ldquo;{bid.message}&rdquo;</p>}

        {bid.status === 'accepted' && (
          <ContactCard
            person={counterpart}
            heading={viewerRole === 'owner' ? 'Buyer contact details' : 'Seller contact details'}
          />
        )}
      </div>

      <div className="bid-row__actions">
        <span className={`badge badge--${bid.status}`}>
          {isDone ? 'Collected' : STATUS_LABEL[bid.status] || bid.status}
        </span>

        {viewerRole === 'owner' && bid.status === 'pending' && (
          <>
            <button className="btn btn--small btn--good" onClick={() => onAccept(bid.id)}><TickIcon size={14} /> Accept</button>
            <button className="btn btn--small btn--danger" onClick={() => onReject(bid.id)}><CrossIcon size={14} /> Reject</button>
          </>
        )}

        {viewerRole === 'bidder' && bid.status === 'pending' && (
          <button className="btn btn--small" onClick={() => onWithdraw(bid.id)}><CrossIcon size={14} /> Withdraw</button>
        )}

        {bid.status === 'accepted' && !isDone && (
          <button className="btn btn--small btn--good" onClick={() => onComplete(bid.id)}><RecycleIcon size={14} /> Mark collected</button>
        )}
      </div>
    </div>
  );
}
