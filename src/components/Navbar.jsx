import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DashboardIcon, BoxIcon, Box2Icon, GavelIcon, UserIcon, AnalyticsIcon, LoginIcon, LogoutIcon, UserAddIcon } from '../icons.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__brand">
        <span className="navbar__mark"><img src="/logo.png" alt="SWEET" /></span>
        SWEET Exchange
      </NavLink>

      <nav className="navbar__links">
        {user ? (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
              <DashboardIcon size={16} /> Dashboard
            </NavLink>
            <NavLink to="/materials" className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
              <BoxIcon size={16} /> Materials
            </NavLink>
            <NavLink to="/materials/add" className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
              <Box2Icon size={16} /> List a material
            </NavLink>
            <NavLink to="/matches" className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
              <GavelIcon size={16} /> Bids
            </NavLink>
            {user.role === 'admin' && (
              <>
                <NavLink to="/users" className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
                  <UserAddIcon size={16} /> Users
                </NavLink>
                <NavLink to="/stats" className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
                  <AnalyticsIcon size={16} /> Stats
                </NavLink>
              </>
            )}
            <NavLink to="/profile" className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
              <UserIcon size={16} /> Profile
            </NavLink>
            <span className="navbar__user"><UserIcon size={14} />{user.name}</span>
            <button className="navbar__link" onClick={handleLogout}><LogoutIcon size={16} /> Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
              <LoginIcon size={16} /> Log in
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
              <UserAddIcon size={16} /> Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
