import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faCode,
  faServer,
  faDatabase,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";

function Skills() {
  const categories = [
    {
      name: "Frontend & UI Engineering",
      icon: faCode,
      skills: ["React 19", "JavaScript (ES6+)", "Modern CSS3 / CSS Grid", "Vite Bundler", "Responsive Web Design"],
    },
    {
      name: "Backend & Systems",
      icon: faServer,
      skills: ["Node.js Runtime", "Express 5 Framework", "RESTful APIs", "JWT Authentication", "CORS Middleware"],
    },
    {
      name: "Cloud & Data Persistence",
      icon: faDatabase,
      skills: ["MongoDB Atlas", "Mongoose ODM", "Google Identity OAuth", "Nodemailer SMTP", "Activity Audit Logs"],
    },
    {
      name: "Tooling & Ecosystem",
      icon: faWrench,
      skills: ["Git Version Control", "GitHub Workflows", "jsPDF & AutoTable", "SweetAlert2 UI", "Postman API Testing"],
    },
  ];

  return (
    <section className="card skills-card">
      <div className="section-header-wrap">
        <div>
          <span className="section-eyebrow">
            <FontAwesomeIcon icon={faLayerGroup} /> Technical Arsenal
          </span>
          <h2 className="section-title">Core Competencies & Stack</h2>
        </div>
      </div>

      <div className="skills-matrix">
        {categories.map((cat, idx) => (
          <div key={idx} className="skill-category-block">
            <div className="category-header">
              <span className="category-icon-halo">
                <FontAwesomeIcon icon={cat.icon} />
              </span>
              <h4>{cat.name}</h4>
            </div>
            <div className="category-pills">
              {cat.skills.map((skill) => (
                <div key={skill} className="skill-tag-item">
                  <span className="skill-dot" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;