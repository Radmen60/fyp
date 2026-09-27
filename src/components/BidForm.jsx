import { useState } from 'react';
import { api } from '../api.js';
import { GavelIcon } from '../icons.jsx';

export default function BidForm({ material, onPlaced }) {
  const [amount, setAmount] = useState(material.estimated_value ? String(material.estimated_value) : '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.placeBid(material.id, { amount, message });
      onPlaced(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="bid-form" onSubmit={handleSubmit}>
      {error && <p className="form-note form-note--error">{error}</p>}
      <div className="field-row">
        <div className="field">
          Your bid ($)
          <input type="number" step="any" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </div>
      <div className="field">
        Message to the seller (optional)
        <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Can collect this weekend" />
      </div>
      <button className="btn btn--primary" disabled={busy}>
        <GavelIcon size={15} /> {busy ? 'Submitting…' : 'Place bid'}
      </button>
    </form>
  );
}
