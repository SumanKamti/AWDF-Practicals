import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import "./App.css";

function App() {

    const [darkMode, setDarkMode] = useState(false);

    return (

        <div className={darkMode ? "dark" : "light"}>

            <Navbar
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />

            <main className="main-content">

                <Routes>

                    <Route path="/" element={<Home />} />

                    <Route path="/projects" element={<Projects />} />

                    <Route path="/contact" element={<Contact />} />

                    <Route path="*" element={<NotFound />} />

                </Routes>

            </main>

            <Footer />

        </div>

    );

}

export default App;