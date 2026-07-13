import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Footer from "./components/Footer";

function App() {

  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Python"
  ];

  return (
    <>
      <Header
        name="Suman Kamti"
        role="AI & ML Student"
      />

      <About />

      <Skills skillList={skills} />

      <Footer />
    </>
  );

}

export default App;