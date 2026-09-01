import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faBolt,
  faUser,
  faSignOutAlt,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

function Navbar({ darkMode, setDarkMode }) {
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <div className="logo-badge">
          <FontAwesomeIcon icon={faBolt} />
        </div>
        <span className="logo-text">
          Suman<span className="logo-accent">.dev</span>
        </span>
      </Link>

      <div className="nav-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/task">Tasks</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </div>

      <div className="navbar-right-cluster">
        {/* Auth Section */}
        {isAuthenticated && user ? (
          <div className="navbar-user-profile">
            <span className="user-nav-badge" title={`Logged in as ${user.email}`}>
              <FontAwesomeIcon icon={faUser} />
              <span className="user-name-label">{user.name || user.email.split("@")[0]}</span>
            </span>
            <button
              type="button"
              className="nav-auth-btn nav-logout-btn"
              onClick={() => logout(true)}
              title="Log out of account"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span className="btn-text">Logout</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="nav-auth-btn nav-login-btn"
            onClick={openLoginModal}
            title="Log in to account"
          >
            <FontAwesomeIcon icon={faSignInAlt} />
            <span className="btn-text">Log In</span>
          </button>
        )}

        {/* Speedtest-style sliding switch */}
        <div
          className={`speedtest-toggle ${
            darkMode ? "active-dark" : "active-light"
          }`}
          onClick={() => setDarkMode(!darkMode)}
          role="button"
          tabIndex={0}
          aria-label="Toggle light and dark theme"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="toggle-track">
            <span className={`toggle-icon sun-icon ${!darkMode ? "active" : ""}`}>
              <FontAwesomeIcon icon={faSun} />
            </span>
            <span className={`toggle-icon moon-icon ${darkMode ? "active" : ""}`}>
              <FontAwesomeIcon icon={faMoon} />
            </span>
            <div className="toggle-thumb" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;