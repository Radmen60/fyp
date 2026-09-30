export default function Privacy() {
  return (
    <div className="page page--narrow">
      <div className="card">
        <h2 style={{ marginBottom: 14 }}>Privacy Policy</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Last updated: {new Date().getFullYear()}</p>

        <h3 style={{ fontSize: 15, marginBottom: 8 }}>What we collect</h3>
        <p>
          Your name, email, and location (address or coordinates) when you
          register; phone number if you choose to add one; and the details
          of any materials you list or bids you place.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>How it's used</h3>
        <p>
          Your location powers the matching algorithm (distance to nearby
          materials or recipients). Your contact details are stored so they
          can be shared with the other party in a transaction — but only
          once a bid between you has been accepted. Before that, no other
          user can see your email, phone, or exact address.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>Address lookups</h3>
        <p>
          Turning a typed address into map coordinates (and back) uses
          OpenStreetMap's free Nominatim service. Only the address text or
          coordinates you provide are sent to it — no other account details.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>What we don't do</h3>
        <p>
          We don't sell your data, and we don't share it with anyone outside
          a transaction you've actually agreed to. There are no third-party
          advertisers on this platform.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>Your account</h3>
        <p>
          You can update your details, phone, address, or preferred
          categories at any time from your Profile page.
        </p>
      </div>
    </div>
  );
}
