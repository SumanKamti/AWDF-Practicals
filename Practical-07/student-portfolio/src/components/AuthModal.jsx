import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEnvelope,
  faLock,
  faUser,
  faSignInAlt,
  faUserPlus,
  faEye,
  faEyeSlash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset fields when opening modal or switching modes
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setShowPassword(false);
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (authModalMode === "register") {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setErrorMessage("Please enter your name.");
        return;
      }
      if (trimmedPassword.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }
      if (trimmedPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }

      setSubmitting(true);
      try {
        await register(trimmedName, trimmedEmail, trimmedPassword);
      } catch (err) {
        setErrorMessage(err.message || "Registration failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setSubmitting(true);
      try {
        await login(trimmedEmail, trimmedPassword);
      } catch (err) {
        setErrorMessage(err.message || "Invalid credentials. Please check and try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={closeAuthModal}
          aria-label="Close modal"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="auth-header">
          <div className="auth-icon-badge">
            <FontAwesomeIcon
              icon={authModalMode === "login" ? faSignInAlt : faUserPlus}
            />
          </div>
          <h2>
            {authModalMode === "login"
              ? "Welcome Back"
              : "Create Your Account"}
          </h2>
          <p>
            {authModalMode === "login"
              ? "Log in to access your JWT-protected task management system."
              : "Register to manage personal tasks and track MongoDB audit logs."}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="auth-mode-switch">
          <button
            type="button"
            className={`auth-switch-btn ${
              authModalMode === "login" ? "active" : ""
            }`}
            onClick={() => setAuthModalMode("login")}
          >
            <FontAwesomeIcon icon={faSignInAlt} /> Log In
          </button>
          <button
            type="button"
            className={`auth-switch-btn ${
              authModalMode === "register" ? "active" : ""
            }`}
            onClick={() => setAuthModalMode("register")}
          >
            <FontAwesomeIcon icon={faUserPlus} /> Register
          </button>
        </div>

        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {authModalMode === "register" && (
            <div className="auth-input-group">
              <label htmlFor="auth-name">Full Name</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faUser} className="field-icon" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Suman Kamti"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faEnvelope} className="field-icon" />
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faLock} className="field-icon" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  authModalMode === "register"
                    ? "At least 6 characters"
                    : "Enter your password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {authModalMode === "register" && (
            <div className="auth-input-group">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faLock} className="field-icon" />
                <input
                  id="auth-confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Processing...
              </>
            ) : authModalMode === "login" ? (
              <>
                <FontAwesomeIcon icon={faSignInAlt} /> Log In
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUserPlus} /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          {authModalMode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                className="text-link-btn"
                onClick={() => setAuthModalMode("register")}
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="text-link-btn"
                onClick={() => setAuthModalMode("login")}
              >
                Log in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
