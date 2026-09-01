import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faEnvelope } from "@fortawesome/free-solid-svg-icons";

function Header() {
  return (
    <header className="hero-header">
      <div className="hero-pill-badge">
        <span className="live-dot" /> CSPIT · CHARUSAT University
      </div>
      <h1 className="hero-name">Suman Kamti</h1>
      <p className="hero-role">AI & ML Engineering Student · Full-Stack Developer</p>

      <div className="hero-cta-buttons">
        <Link to="/task" className="hero-btn primary-hero-btn">
          Task Manager <FontAwesomeIcon icon={faArrowRight} />
        </Link>
        <Link to="/contact" className="hero-btn secondary-hero-btn">
          <FontAwesomeIcon icon={faEnvelope} /> Contact
        </Link>
      </div>
    </header>
  );
}

export default Header;