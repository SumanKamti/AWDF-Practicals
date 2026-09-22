import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
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
  faKey,
  faArrowLeft,
  faShieldAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { forgotPassword, resetPassword } from "../services/api";

function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    register,
    loginWithGoogle,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Forgot Password / OTP State
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [devOtpNotice, setDevOtpNotice] = useState("");

  const googleBtnRef = useRef(null);
  const [isGoogleRendered, setIsGoogleRendered] = useState(false);

  // Reset fields when opening modal or switching modes
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setShowPassword(false);
    setForgotStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setDevOtpNotice("");
  }, [isAuthModalOpen, authModalMode]);

  // Initialize Google Identity Services when modal opens
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!isAuthModalOpen || !clientId) {
      setIsGoogleRendered(false);
      return;
    }

    let intervalId;
    const setupGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response.credential) {
                setSubmitting(true);
                setErrorMessage("");
                try {
                  await loginWithGoogle(response.credential);
                } catch (err) {
                  setErrorMessage(err.message || "Google sign-in failed");
                } finally {
                  setSubmitting(false);
                }
              }
            },
          });

          googleBtnRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "pill",
            logo_alignment: "left",
          });
          setIsGoogleRendered(true);
        } catch (err) {
          console.error("Failed to render Google Identity Services button:", err);
          setIsGoogleRendered(false);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      intervalId = setInterval(() => {
        if (window.google?.accounts?.id) {
          setupGoogle();
          clearInterval(intervalId);
        }
      }, 250);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthModalOpen, authModalMode, loginWithGoogle]);

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

  const handleGoogleBtnClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      Swal.fire({
        icon: "info",
        title: "Google Client ID Setup",
        html: `
          <div style="text-align: left; font-size: 13px; line-height: 1.6;">
            <p>To enable <b>Continue with Google</b>:</p>
            <ol style="margin-top: 8px; padding-left: 18px;">
              <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Google Cloud Console &rarr; Credentials</a>.</li>
              <li>Create an <b>OAuth 2.0 Client ID</b> (Application type: <b>Web application</b>).</li>
              <li>Add <code>http://localhost:5173</code> to <b>Authorized JavaScript origins</b>.</li>
              <li>Copy the Client ID and add it into:
                <br/><code>frontend/.env</code>: <code>VITE_GOOGLE_CLIENT_ID=your_id_here</code>
                <br/><code>backend/.env</code>: <code>GOOGLE_CLIENT_ID=your_id_here</code>
              </li>
              <li>Restart both servers.</li>
            </ol>
          </div>
        `,
        confirmButtonText: "Got it!",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setDevOtpNotice("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    if (forgotStep === 1) {
      setSubmitting(true);
      try {
        const res = await forgotPassword(trimmedEmail);
        setForgotStep(2);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "OTP sent to your email!",
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
        });
        if (res.devOtp) {
          setDevOtpNotice(`Simulated OTP for testing: ${res.devOtp}`);
        }
      } catch (err) {
        setErrorMessage(err.message || "Failed to send verification code.");
      } finally {
        setSubmitting(false);
      }
    } else {
      const trimmedOtp = otp.trim();
      if (!trimmedOtp || trimmedOtp.length !== 6) {
        setErrorMessage("Please enter the 6-digit verification code.");
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setErrorMessage("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMessage("New passwords do not match.");
        return;
      }

      setSubmitting(true);
      try {
        await resetPassword(trimmedEmail, trimmedOtp, newPassword);
        Swal.fire({
          icon: "success",
          title: "Password Reset Successfully!",
          text: "Your password has been updated. Please log in with your new credentials.",
          confirmButtonColor: "#2563eb",
        });
        setAuthModalMode("login");
        setForgotStep(1);
        setPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setOtp("");
      } catch (err) {
        setErrorMessage(err.message || "Failed to reset password. Please check your code.");
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
              icon={
                authModalMode === "forgot"
                  ? faKey
                  : authModalMode === "login"
                  ? faSignInAlt
                  : faUserPlus
              }
            />
          </div>
          <h2>
            {authModalMode === "forgot"
              ? "Reset Password"
              : authModalMode === "login"
              ? "Welcome Back"
              : "Create Your Account"}
          </h2>
          <p>
            {authModalMode === "forgot"
              ? forgotStep === 1
                ? "Enter your registered email to receive a 6-digit verification code."
                : `Enter the 6-digit verification code sent to your email and set a new password.`
              : authModalMode === "login"
              ? "Log in to access your JWT-protected task management system."
              : "Register to manage personal tasks and track MongoDB audit logs."}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs (only in login / register) */}
        {authModalMode !== "forgot" ? (
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
        ) : (
          <div className="auth-forgot-step-indicator">
            <span className={`step-dot ${forgotStep === 1 ? "active" : "done"}`}>
              1. Enter Email
            </span>
            <span className="step-arrow">&rarr;</span>
            <span className={`step-dot ${forgotStep === 2 ? "active" : ""}`}>
              2. Verify & Reset
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {authModalMode === "forgot" ? (
          /* FORGOT PASSWORD FORM */
          <form className="auth-form" onSubmit={handleForgotSubmit}>
            {forgotStep === 1 ? (
              <div className="auth-input-group">
                <label htmlFor="forgot-email">Registered Email Address</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faEnvelope} className="field-icon" />
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="auth-info-banner">
                  📧 We sent a code to <strong>{email}</strong>. Please check your <strong>Inbox</strong> and <strong>Spam / Junk</strong> folder.
                </div>
                <div className="auth-input-group">
                  <label htmlFor="forgot-otp">6-Digit Verification Code</label>
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faShieldAlt} className="field-icon" />
                    <input
                      id="forgot-otp"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      disabled={submitting}
                      className="otp-input-field"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="forgot-new-password">New Password</label>
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="field-icon" />
                    <input
                      id="forgot-new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <div className="auth-input-group">
                  <label htmlFor="forgot-confirm-password">Confirm New Password</label>
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="field-icon" />
                    <input
                      id="forgot-confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {devOtpNotice && (
              <div className="auth-dev-otp-box">
                <span>{devOtpNotice}</span>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Processing...
                </>
              ) : forgotStep === 1 ? (
                <>
                  <FontAwesomeIcon icon={faKey} /> Send Verification Code
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} /> Reset & Save Password
                </>
              )}
            </button>

            <div className="auth-footer-prompt">
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setAuthModalMode("login");
                  setForgotStep(1);
                  setErrorMessage("");
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Back to Log In
              </button>
            </div>
          </form>
        ) : (
          /* STANDARD LOGIN & REGISTER FORM */
          <>
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
                <div className="auth-label-row">
                  <label htmlFor="auth-password">Password</label>
                  {authModalMode === "login" && (
                    <button
                      type="button"
                      className="auth-forgot-link-btn"
                      onClick={() => {
                        setAuthModalMode("forgot");
                        setErrorMessage("");
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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

            {/* Social Auth Separator */}
            <div className="auth-separator">
              <span>OR</span>
            </div>

            {/* Continue with Google Section */}
            <div className="google-auth-container">
              <div ref={googleBtnRef} className="google-rendered-btn-slot"></div>
              {!isGoogleRendered && (
                <button
                  type="button"
                  className="google-signin-custom-btn"
                  onClick={handleGoogleBtnClick}
                  disabled={submitting}
                >
                  <svg className="google-svg-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              )}
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
