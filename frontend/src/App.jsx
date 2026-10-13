import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import LoadingFallback from "./components/LoadingFallback";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Task from "./pages/Task";
import NotFound from "./pages/NotFound";

// Practical 8: Route-based code splitting with React.lazy
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));

import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("portfolio_theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("portfolio_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark-body");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark-body");
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <div className={`app-wrapper ${darkMode ? "dark" : "light"}`}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="main-content">
          <Suspense fallback={<LoadingFallback message="Loading page component..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/task" element={<Task />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
        <AuthModal />
      </div>
    </AuthProvider>
  );
}

export default App;