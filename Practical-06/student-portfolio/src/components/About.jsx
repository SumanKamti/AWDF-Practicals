import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faBrain, faDatabase, faLayerGroup } from "@fortawesome/free-solid-svg-icons";

function About() {
  const highlights = [
    { icon: faCode, title: "Frontend", desc: "React, JavaScript, HTML, CSS" },
    { icon: faDatabase, title: "Backend", desc: "Node.js, Express, MongoDB Atlas" },
    { icon: faBrain, title: "AI & ML", desc: "Python, Data Analysis, Modeling" },
    { icon: faLayerGroup, title: "Practicals", desc: "Full-Stack CRUD & REST APIs" },
  ];

  return (
    <section className="card about-card">
      <h2 className="section-title">About</h2>
      <p className="about-text">
        Computer Engineering student passionate about full-stack web applications, cloud databases, and modern interactive UI.
      </p>

      <div className="about-grid">
        {highlights.map((h, i) => (
          <div key={i} className="about-mini-card">
            <FontAwesomeIcon icon={h.icon} className="about-icon" />
            <div>
              <strong>{h.title}</strong>
              <span>{h.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default About;