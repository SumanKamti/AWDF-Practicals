import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faMapMarkerAlt, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <div className="contact-container">
      <div className="card contact-main-card">
        <h2 className="section-title">Get in Touch</h2>
        <p className="section-subtitle">Let's connect for projects, practicals, or collaborations.</p>

        <div className="contact-quick-links">
          <div className="contact-pill-item">
            <FontAwesomeIcon icon={faEnvelope} className="pill-icon" />
            <span>sumankamti@gmail.com</span>
          </div>
          <div className="contact-pill-item">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="pill-icon" />
            <span>CSPIT, CHARUSAT University</span>
          </div>
        </div>

        {submitted && (
          <div className="clean-success-banner">
            ✅ Message received! Thank you, <strong>{formData.name}</strong>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="clean-contact-form">
          <div className="form-row-2">
            <div className="input-group">
              <label>Name</label>
              <input
                name="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Message</label>
            <textarea
              name="message"
              rows="3"
              placeholder="Your message here..."
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="contact-send-btn">
            <FontAwesomeIcon icon={faPaperPlane} /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;