import { MailIcon, PhoneIcon, LocationPinIcon, UserIcon } from '../icons.jsx';

// Shown once a bid is accepted, so the two parties can actually arrange
// collection. `person` is whatever subset of {name, email, phone, address}
// the backend chose to reveal — fields are omitted (not just blanked) until
// the bid reaches 'accepted', so this only ever renders what's allowed.
export default function ContactCard({ person, heading = 'Contact details' }) {
  if (!person) return null;
  return (
    <div className="contact-card">
      <p className="contact-card__heading">{heading}</p>
      <p className="contact-card__row"><UserIcon size={15} className="icon-inline" />{person.name}</p>
      {person.email && <p className="contact-card__row"><MailIcon size={15} className="icon-inline" />{person.email}</p>}
      {person.phone && <p className="contact-card__row"><PhoneIcon size={15} className="icon-inline" />{person.phone}</p>}
      {person.address && <p className="contact-card__row"><LocationPinIcon size={15} className="icon-inline" />{person.address}</p>}
    </div>
  );
}
