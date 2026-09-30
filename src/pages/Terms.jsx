export default function Terms() {
  return (
    <div className="page page--narrow">
      <div className="card">
        <h2 style={{ marginBottom: 14 }}>Terms of Service</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Last updated: {new Date().getFullYear()}</p>

        <p>
          SWEET Exchange connects people and organisations who have spare materials
          with recyclers, collectors, and organisations who can put them to use.
          By creating an account, you agree to the points below.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>1. What we provide</h3>
        <p>
          SWEET Exchange is a listing and matching platform. We estimate a
          material's value and suggest likely matches, but we don't inspect
          materials, verify condition, guarantee collection, or handle
          payment between parties. Arranging pickup, payment, and any
          in-person handover is between the buyer and seller directly.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>2. Accurate listings</h3>
        <p>
          Please describe materials honestly — category, condition, and
          quantity should reflect what a buyer will actually receive.
          Misleading listings may be removed.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>3. Contact information</h3>
        <p>
          Your name, email, phone, and address are only shared with another
          user once you've accepted (or had accepted) a bid with them — never
          before. Use that information respectfully and only for arranging
          the transaction you agreed to.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>4. No warranty</h3>
        <p>
          This platform is provided as-is, without warranty of any kind. We
          aren't liable for the condition of materials exchanged, missed
          collections, or disputes between users.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>5. Changes</h3>
        <p>
          These terms may be updated from time to time as the platform
          evolves. Continued use after a change means you accept the updated
          terms.
        </p>
      </div>
    </div>
  );
}
