import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faBolt } from "@fortawesome/free-solid-svg-icons";

function Navbar({ darkMode, setDarkMode }) {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <div className="logo-badge">
          <FontAwesomeIcon icon={faBolt} />
        </div>
        <span className="logo-text">Suman<span className="logo-accent">.dev</span></span>
      </Link>

      <div className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/task">Tasks</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </div>

      {/* Speedtest-style sliding switch */}
      <div
        className={`speedtest-toggle ${darkMode ? "active-dark" : "active-light"}`}
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
    </nav>
  );
}

export default Navbar;