import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEnvelope,
  faTasks,
  faCode,
  faFolderOpen,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

function Header() {
  return (
    <header className="hero-header">
      <div className="hero-glow-aura" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-pill-badge">
          <span className="live-dot" /> CSPIT · CHARUSAT University
        </div>
        <h1 className="hero-name">
          Suman Kamti
        </h1>
        <p className="hero-tagline">
          Crafting <span className="text-highlight">High-Performance</span> Web Applications & Machine Learning Systems
        </p>
        <p className="hero-role">
          AI & ML Engineering Student · Full-Stack React & Node.js Developer
        </p>

        {/* Quick Hero Metrics Counter Bar */}
        <div className="hero-metrics-bar">
          <div className="hero-metric-item">
            <span className="metric-val">4+</span>
            <span className="metric-lbl">Full-Stack Apps</span>
          </div>
          <div className="hero-metric-divider" />
          <div className="hero-metric-item">
            <span className="metric-val">10+</span>
            <span className="metric-lbl">Core Techs</span>
          </div>
          <div className="hero-metric-divider" />
          <div className="hero-metric-item">
            <span className="metric-val">100%</span>
            <span className="metric-lbl">Cloud Synced</span>
          </div>
        </div>

        <div className="hero-cta-buttons">
          <Link to="/task" className="hero-btn primary-hero-btn">
            <FontAwesomeIcon icon={faTasks} /> Task Manager <FontAwesomeIcon icon={faArrowRight} />
          </Link>
          <Link to="/projects" className="hero-btn secondary-hero-btn">
            <FontAwesomeIcon icon={faFolderOpen} /> View Projects
          </Link>
          <Link to="/contact" className="hero-btn tertiary-hero-btn">
            <FontAwesomeIcon icon={faEnvelope} /> Contact
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;