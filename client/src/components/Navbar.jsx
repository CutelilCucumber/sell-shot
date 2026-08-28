import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ flaggedCount = 0 }) {
  const { user, logout, offloadingCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/');
  }

  function isActive(path) {
    return location.pathname.startsWith(path) ? 'navbar__link--active' : '';
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        <span className="navbar__brand-mark">◈</span>
        <span className="navbar__brand-name">Offload</span>
      </Link>
      <nav className="navbar__links">
        {user ? (
          <>
            <Link to="/items" className={`navbar__link ${isActive('/items')}`}>
              My Items
            </Link>
            <Link to="/listings" className={`navbar__link ${isActive('/listings')}`}>
              Listings
              {flaggedCount > 0 && (
                <span className="navbar__badge">{flaggedCount}</span>
              )}
            </Link>
            {offloadingCount > 0 && (
              <span className="navbar__offloading" aria-label={`${offloadingCount} offloading${offloadingCount !== 1 ? 's' : ''} in progress`}>
                <span className="navbar__offloading-icon">◈</span>
                <span className="navbar__offloading-count">{offloadingCount}</span>
              </span>
            )}
            <Link to="/items/new" className="navbar__cta">+ New Item</Link>
            <button className="navbar__ghost" onClick={handleLogout}>Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__link">Sign in</Link>
            <Link to="/register" className="navbar__cta">Get started</Link>
          </>
        )}
      </nav>
    </header>
  );
}
