import Header from "../components/Header";
import About from "../components/About";
import Skills from "../components/Skills";

function Home() {

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
                role="AI & ML Student | CHARUSAT"
            />

            <About />

            <Skills skillList={skills} />
        </>
    );
}

export default Home;