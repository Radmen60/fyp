import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { BoxIcon, TargetIcon, HandTruckIcon } from '../icons.jsx';

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <section className="landing-hero">
        <img src="/logo.png" alt="SWEET — Smart Waste Exchange and Eco-Trading" className="landing-hero__logo" />
        <h1>Someone nearby needs exactly what you're throwing out.</h1>
        <p>
          List spare materials — cardboard, offcuts, e-waste, furniture — and get matched
          with recyclers, collectors, and organisations who'll put them to use instead of
          a landfill.
        </p>
        <div className="landing-hero__actions">
          <Link to="/register" className="btn btn--primary">Create an account</Link>
          <Link to="/login" className="btn">Log in</Link>
        </div>
      </section>

      <div className="landing-steps">
        <div className="card">
          <h3><span className="icon-badge"><BoxIcon size={18} /></span>List what you have</h3>
          <p>Describe the material, its condition and quantity. We estimate its value on the spot.</p>
        </div>
        <div className="card">
          <h3><span className="icon-badge icon-badge--blue"><TargetIcon size={18} /></span>Get matched</h3>
          <p>We score nearby recyclers, collectors and organisations by category fit and distance.</p>
        </div>
        <div className="card">
          <h3><span className="icon-badge"><HandTruckIcon size={18} /></span>Arrange the handover</h3>
          <p>Accept a match, agree on collection, then mark it complete once it's diverted.</p>
        </div>
      </div>
    </>
  );
}
