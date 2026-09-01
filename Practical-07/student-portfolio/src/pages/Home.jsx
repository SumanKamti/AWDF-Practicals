import Header from "../components/Header";
import About from "../components/About";
import Skills from "../components/Skills";

function Home() {
  return (
    <div className="home-container">
      <Header />
      <About />
      <Skills />
    </div>
  );
}

export default Home;