function Skills({ skillList }) {
  return (
    <section className="card">
      <h2>Technical Skills</h2>

      <div className="skills">
        {skillList.map((skill) => (
          <span className="skill" key={skill}>
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}

export default Skills;