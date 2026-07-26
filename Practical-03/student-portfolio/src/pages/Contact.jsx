import { useState } from "react";

function Contact() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="card">

      <h2>Contact Me</h2>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <h3>Preview</h3>

      <p>Name : {name}</p>

      <p>Email : {email}</p>

    </div>
  );
}

export default Contact;