import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabase";
import "./index.css";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Founder");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data?.user) {
      setMessage("Account created. Check your email if confirmation is required.");
    } else {
      setMessage("Signup submitted.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="legal-back">← Back to Home</Link>
        <h1>Create Account</h1>
        <p className="auth-subtext">Join AngelPort as a founder or investor.</p>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="field-group">
            <label>Full Name</label>
            <input
              type="text"
              className="waitlist-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              className="waitlist-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
            <div className="field-group">
  <label>I am joining as</label>
  <select
    className="waitlist-input"
    value={role}
    onChange={(e) => setRole(e.target.value)}
  >
    <option>Founder</option>
    <option>Investor</option>
    <option>Both</option>
  </select>
</div>
          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              className="waitlist-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>

          {message ? <p className="auth-message">{message}</p> : null}

          <button type="submit" className="primary-btn full-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}