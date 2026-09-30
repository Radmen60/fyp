import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { RecycleIcon, MailIcon } from '../icons.jsx';

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__mark"><img src="/logo.png" alt="SWEET" /></span>
          <div>
            <p className="footer__title">SWEET Exchange</p>
            <p className="footer__tagline">Smart Waste Exchange and Eco-Trading</p>
          </div>
        </div>

        <div className="footer__col">
          <p className="footer__heading">Product</p>
          <Link to="/">Home</Link>
          <Link to="/materials">Browse materials</Link>
          {user ? <Link to="/dashboard">Dashboard</Link> : <Link to="/register">Create an account</Link>}
        </div>

        <div className="footer__col">
          <p className="footer__heading">Account</p>
          {user ? (
            <>
              <Link to="/matches">Bids</Link>
              <Link to="/history">Transaction history</Link>
              <Link to="/profile">Profile</Link>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/forgot-password">Forgot password</Link>
            </>
          )}
        </div>

        <div className="footer__col">
          <p className="footer__heading">Legal</p>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <a href="mailto:support@sweetexchange.example"><MailIcon size={13} className="icon-inline" />support@sweetexchange.example</a>
        </div>
      </div>

      <div className="footer__bottom">
        <span><RecycleIcon size={14} className="icon-inline" />© {year} SWEET Exchange. All rights reserved.</span>
        <span className="footer__credit">Built to keep usable materials out of landfills.</span>
      </div>
    </footer>
  );
}
