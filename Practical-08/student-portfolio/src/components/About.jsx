import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faBrain,
  faDatabase,
  faShieldAlt,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

function About() {
  const pillars = [
    {
      icon: faCode,
      title: "Frontend Engineering",
      tag: "Client Layer",
      desc: "Architecting responsive single-page applications with React 19, CSS design tokens, smooth micro-interactions, and accessible UX.",
      techs: ["React 19", "JavaScript (ES6+)", "HTML5/CSS3", "Vite"],
    },
    {
      icon: faDatabase,
      title: "Cloud & Backend Architecture",
      tag: "Server Layer",
      desc: "Building scalable RESTful microservices with Node.js & Express, utilizing MongoDB Atlas clusters for real-time document persistence.",
      techs: ["Node.js", "Express 5", "MongoDB Atlas", "Mongoose ODM"],
    },
    {
      icon: faShieldAlt,
      title: "Security & Authentication",
      tag: "Auth & AuthZ",
      desc: "Implementing enterprise-grade user isolation with JWT bearer tokens, bcrypt password hashing, Google OAuth 2.0 GIS, and OTP recovery.",
      techs: ["JWT", "Google OAuth", "bcrypt", "Nodemailer OTP"],
    },
    {
      icon: faBrain,
      title: "AI & Machine Learning",
      tag: "Intelligent Systems",
      desc: "Exploring predictive data models, neural architectures, data exploration pipelines, and Python scientific computational workflows.",
      techs: ["Python", "Machine Learning", "Data Analytics", "Algorithms"],
    },
  ];

  return (
    <section className="card about-card">
      <div className="section-header-wrap">
        <div>
          <span className="section-eyebrow">
            <FontAwesomeIcon icon={faGraduationCap} /> Academic & Professional Focus
          </span>
          <h2 className="section-title">Engineering Discipline</h2>
        </div>
        <span className="badge-univ">CSPIT · 5th Semester</span>
      </div>

      <p className="about-text">
        Undergraduate student in Computer Engineering specializing in Artificial Intelligence & Machine Learning at CHARUSAT University. Dedicated to delivering clean, performant codebases and modern, intuitive digital experiences.
      </p>

      <div className="bento-grid">
        {pillars.map((pillar, i) => (
          <div key={i} className="bento-item">
            <div className="bento-top">
              <div className="bento-icon-box">
                <FontAwesomeIcon icon={pillar.icon} />
              </div>
              <span className="bento-tag">{pillar.tag}</span>
            </div>
            <h3 className="bento-title">{pillar.title}</h3>
            <p className="bento-desc">{pillar.desc}</p>
            <div className="bento-tech-pills">
              {pillar.techs.map((t) => (
                <span key={t} className="bento-tech-pill">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default About;