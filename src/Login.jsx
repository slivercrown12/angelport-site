import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import "./index.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Login successful.");
    setTimeout(() => {
    navigate("/");
    }   , 800);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="legal-back">← Back to Home</Link>
        <h1>Login</h1>
        <p className="auth-subtext">Access your AngelPort account.</p>

        <form onSubmit={handleLogin} className="auth-form">
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
            <label>Password</label>
            <input
              type="password"
              className="waitlist-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>

          {message ? <p className="auth-message">{message}</p> : null}

          <button type="submit" className="primary-btn full-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}