import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faHeart } from "@fortawesome/free-solid-svg-icons";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-bolt">
              <FontAwesomeIcon icon={faBolt} />
            </span>
            <span className="footer-logo-text">Suman.dev</span>
          </div>
          <p className="footer-tagline">
            Computer Engineering · AI & ML Specialization · CSPIT, CHARUSAT
          </p>
        </div>

        <div className="footer-nav">
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/task">Task Manager</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-badges">
          <span className="footer-tech-badge">React 19</span>
          <span className="footer-tech-badge">Node.js</span>
          <span className="footer-tech-badge">Express 5</span>
          <span className="footer-tech-badge">MongoDB Atlas</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Suman Kamti. Built for Advanced Web Development Frameworks Practical-08.</p>
      </div>
    </footer>
  );
}

export default Footer;