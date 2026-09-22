import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faMapMarkerAlt,
  faPaperPlane,
  faSpinner,
  faUser,
  faCommentDots,
  faLock,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { sendContactMessage } from "../services/api";

function Contact() {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Keep form data in sync if authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: user.email || prev.email || "",
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessNotice("");

    const trimmedName = formData.name.trim();
    const trimmedEmail = (isAuthenticated && user?.email ? user.email : formData.email).trim().toLowerCase();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address so Jay can reach you.");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (!trimmedMessage) {
      setErrorMessage("Please write a message to send.");
      return;
    }

    setSubmitting(true);

    try {
      await sendContactMessage({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });

      setSuccessNotice(
        `Thank you, ${trimmedName}! Your message has been sent to Jay. He will reply to you at ${trimmedEmail}.`
      );

      Swal.fire({
        icon: "success",
        title: "Message Delivered!",
        html: `
          <p>Thank you, <b>${trimmedName}</b>!</p>
          <p style="font-size: 13.5px; color: #64748b; margin-top: 8px;">
            Your message was delivered directly to Jay's inbox. He can reply to you at <b>${trimmedEmail}</b>.
          </p>
        `,
        confirmButtonColor: "#2563eb",
      });

      setFormData((prev) => ({
        name: isAuthenticated && user?.name ? user.name : "",
        email: isAuthenticated && user?.email ? user.email : "",
        message: "",
      }));
    } catch (err) {
      const errText = err.message || "Failed to deliver your message. Please try again.";
      setErrorMessage(errText);
      Swal.fire({
        icon: "error",
        title: "Delivery Failed",
        text: errText,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="card contact-main-card">
        <div className="contact-layout-split">
          {/* Left Info Column */}
          <div className="contact-info-panel">
            <span className="section-eyebrow">
              <FontAwesomeIcon icon={faCommentDots} /> Open Communications
            </span>
            <h2 className="section-title">Get in Touch</h2>
            <p className="contact-desc">
              Whether you want to discuss a software project, collaborate on Machine Learning coursework, or explore full-stack development opportunities, Jay is just a message away.
            </p>

            <div className="contact-channel-list">
              <div className="contact-channel-item">
                <div className="channel-icon-box">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div>
                  <span className="channel-label">Direct Inbox</span>
                  <span className="channel-val">jayyypatelll333@gmail.com</span>
                </div>
              </div>

              <div className="contact-channel-item">
                <div className="channel-icon-box">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div>
                  <span className="channel-label">Campus</span>
                  <span className="channel-val">CSPIT · CHARUSAT University</span>
                </div>
              </div>

              <div className="contact-channel-item">
                <div className="channel-icon-box">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div>
                  <span className="channel-label">Turnaround</span>
                  <span className="channel-val">Replies within 24 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="contact-form-panel">
            <h3 className="form-panel-title">Send a Direct Message</h3>

            {errorMessage && (
              <div className="auth-error-banner" role="alert">
                ⚠️ {errorMessage}
              </div>
            )}

            {successNotice && (
              <div className="clean-success-banner">
                ✅ {successNotice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="clean-contact-form">
              <div className="form-row-2">
                <div className="input-group">
                  <label htmlFor="contact-name">
                    <FontAwesomeIcon icon={faUser} /> Your Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Alex Smith"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="contact-email">
                    <FontAwesomeIcon icon={faEnvelope} /> Your Email
                    {isAuthenticated && user?.email && (
                      <span className="logged-in-tag">
                        <FontAwesomeIcon icon={faCheckCircle} /> (Verified)
                      </span>
                    )}
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={isAuthenticated && user?.email ? user.email : formData.email}
                    onChange={handleChange}
                    disabled={submitting || (isAuthenticated && Boolean(user?.email))}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="contact-message">
                  <FontAwesomeIcon icon={faCommentDots} /> Your Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="4"
                  placeholder="Write your note, feedback, or inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </div>

              <button type="submit" className="contact-send-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Sending Message...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} /> Send Message to Jay
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;