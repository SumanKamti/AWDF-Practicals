import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Footer from "./components/Footer";

import "./App.css";

function App() {

  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Python"
  ];

  return (
    <div className="container">
      <div className="portfolio-title">
        <h2>My Portfolio</h2>
        <p>Advanced Web Development Framework - Practical 1</p>
      </div>
      <Header
        name="Suman Kamti"
        role="AI & ML Student | CHARUSAT"
      />
      <About />
      <Skills skillList={skills} />
      <Footer />
    </div>
  );
}

export default App;