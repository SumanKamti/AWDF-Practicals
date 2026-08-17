import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faStar,
  faCodeBranch,
  faExternalLinkAlt,
  faTasks,
  faSync,
  faFolderOpen,
  faCode,
} from "@fortawesome/free-solid-svg-icons";

const GITHUB_USERNAME = "SumanKamti";

const INITIAL_PROJECTS = [
  {
    id: 1,
    name: "FullStack-Task-Manager",
    desc: "Full-stack MERN task management application with status tabs (Ongoing, Complete, Incomplete), PDF export, and MongoDB activity audit trail.",
    lang: "React / Node.js",
    stars: 5,
    forks: 2,
    url: "/task",
    isInternal: true,
  },
  {
    id: 2,
    name: "AWDF-Practicals",
    desc: "Advanced Web Development Frameworks practicals repository for CSPIT 5th Sem covering React SPAs, Express REST APIs, and MongoDB Atlas.",
    lang: "JavaScript",
    stars: 4,
    forks: 1,
    url: `https://github.com/${GITHUB_USERNAME}/AWDF-Practicals`,
  },
  {
    id: 3,
    name: "React-Student-Portfolio",
    desc: "Responsive personal developer portfolio with modern speedtest-style light/dark themes, clean UI, and dynamic routing.",
    lang: "React",
    stars: 3,
    forks: 1,
    url: `https://github.com/${GITHUB_USERNAME}`,
  },
  {
    id: 4,
    name: "AIML-DeepLearning-Lab",
    desc: "Artificial Intelligence and Machine Learning laboratory implementations, model training notebooks, and data analysis algorithms.",
    lang: "Python",
    stars: 6,
    forks: 2,
    url: `https://github.com/${GITHUB_USERNAME}`,
  },
  {
    id: 5,
    name: "Node-Express-REST-APIs",
    desc: "Modular Express.js backend services with Mongoose schemas, CORS middleware, validation, and automated error handling.",
    lang: "Node.js",
    stars: 3,
    forks: 0,
    url: `https://github.com/${GITHUB_USERNAME}`,
  },
  {
    id: 6,
    name: "MongoDB-Atlas-Integration",
    desc: "Cloud database cluster integration with MongoDB Atlas, Mongoose ODM dual-mode connector, and activity audit logging.",
    lang: "MongoDB",
    stars: 2,
    forks: 1,
    url: `https://github.com/${GITHUB_USERNAME}`,
  },
];

export default function Projects() {
  const [repos, setRepos] = useState(INITIAL_PROJECTS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLang, setSelectedLang] = useState("All");

  const languages = ["All", "React", "JavaScript", "Python", "Node.js", "MongoDB"];

  const filtered = repos.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lang.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLang =
      selectedLang === "All" || p.lang.toLowerCase().includes(selectedLang.toLowerCase());

    return matchesSearch && matchesLang;
  });

  const fetchLiveGitHub = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=12&sort=updated`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      if (res.ok) {
        const text = await res.text();
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length > 0) {
          const liveList = data.map((r) => ({
            id: r.id,
            name: r.name,
            desc: r.description || "Coursework and development repository on GitHub.",
            lang: r.language || "JavaScript",
            stars: r.stargazers_count || 0,
            forks: r.forks_count || 0,
            url: r.html_url,
          }));
          setRepos([INITIAL_PROJECTS[0], ...liveList]);
        }
      }
    } catch {
      // Fallback stays in place seamlessly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveGitHub();
  }, []);

  return (
    <div className="projects-container">
      {/* Featured Banner: Practical 6 */}
      <div className="featured-banner card">
        <div className="featured-banner-text">
          <span className="featured-pill">🌟 Featured Practical 6</span>
          <h2>Full-Stack Task Manager</h2>
          <p>
            React 19, Express 5 REST API & MongoDB Atlas with status tabs, PDF reports, and audit logs.
          </p>
        </div>
        <Link to="/task" className="launch-btn">
          <FontAwesomeIcon icon={faTasks} /> Launch App
        </Link>
      </div>

      {/* Projects Grid Section */}
      <div className="card projects-card">
        <div className="projects-top-bar">
          <div>
            <h2 className="section-title">
              <FontAwesomeIcon icon={faFolderOpen} /> My GitHub Projects
            </h2>
            <p className="section-subtitle">
              Repositories by <strong>github.com/{GITHUB_USERNAME}</strong>
            </p>
          </div>

          <div className="projects-header-actions">
            <button
              type="button"
              className="refresh-repos-btn"
              onClick={fetchLiveGitHub}
              disabled={loading}
              title="Sync with GitHub"
            >
              <FontAwesomeIcon icon={faSync} spin={loading} /> {loading ? "Syncing..." : "Sync GitHub"}
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="projects-filter-bar">
          <div className="projects-search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search repositories..."
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Language Filter Pills */}
          <div className="lang-filter-pills">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                className={`lang-pill ${selectedLang === lang ? "active" : ""}`}
                onClick={() => setSelectedLang(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filtered.length === 0 ? (
            <div className="empty-projects-state">
              <p>No matching repositories found for "{searchTerm}".</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedLang("All");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="project-card-item">
                <div className="project-card-header">
                  <h3>{item.name}</h3>
                  <span className="lang-tag">{item.lang}</span>
                </div>

                <p className="project-desc">{item.desc}</p>

                <div className="project-card-footer">
                  <div className="project-metrics">
                    <span>
                      <FontAwesomeIcon icon={faStar} /> {item.stars}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faCodeBranch} /> {item.forks}
                    </span>
                  </div>

                  {item.isInternal ? (
                    <Link to={item.url} className="view-link internal-link">
                      Launch App →
                    </Link>
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-link"
                    >
                      View Repository <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
