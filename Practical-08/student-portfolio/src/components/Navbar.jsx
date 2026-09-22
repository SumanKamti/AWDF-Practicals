import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faBolt,
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

function Navbar({ darkMode, setDarkMode }) {
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner-wrapper">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <div className="logo-badge">
            <FontAwesomeIcon icon={faBolt} />
          </div>
          <span className="logo-text">
            Suman<span className="logo-accent">.dev</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className={`nav-links ${mobileMenuOpen ? "mobile-nav-open" : ""}`}>
          <NavLink to="/" end onClick={closeMobileMenu}>
            Home
          </NavLink>
          <NavLink to="/projects" onClick={closeMobileMenu}>
            Projects
          </NavLink>
          <NavLink to="/task" onClick={closeMobileMenu}>
            Tasks
          </NavLink>
          <NavLink to="/contact" onClick={closeMobileMenu}>
            Contact
          </NavLink>
        </div>

        <div className="navbar-right-cluster">
          {/* Auth Section */}
          {isAuthenticated && user ? (
            <div className="navbar-user-profile">
              <span className="user-nav-badge" title={`Logged in as ${user.email}`}>
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="user-nav-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} />
                )}
                <span className="user-name-label">{user.name || user.email.split("@")[0]}</span>
              </span>
              <button
                type="button"
                className="nav-auth-btn nav-logout-btn"
                onClick={() => {
                  closeMobileMenu();
                  logout(true);
                }}
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
              onClick={() => {
                closeMobileMenu();
                openLoginModal();
              }}
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

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;