import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/');
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
            <Link
              to="/items"
              className={`navbar__link ${location.pathname.startsWith('/items') ? 'navbar__link--active' : ''}`}
            >
              My Items
            </Link>
            <Link to="/items/new" className="navbar__cta">
              + New Item
            </Link>
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
