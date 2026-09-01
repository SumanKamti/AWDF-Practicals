function Skills() {
  const skills = [
    "React.js",
    "JavaScript (ES6+)",
    "Node.js",
    "Express.js",
    "MongoDB Atlas",
    "REST APIs",
    "HTML5 / CSS3",
    "Python",
    "Git",
    "Vite",
  ];

  return (
    <section className="card skills-card">
      <h2 className="section-title">Technical Skills</h2>
      <div className="skills-pill-wrapper">
        {skills.map((skill) => (
          <span key={skill} className="skill-pill">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}

export default Skills;