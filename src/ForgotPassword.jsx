import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password reset email sent. Check your inbox.");
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/login" className="back-home-link">
          ← Back to Login
        </Link>

        <h1>Forgot Password</h1>
        <p>Enter your email and we’ll send you a password reset link.</p>

        <form onSubmit={handleReset} className="waitlist-form">
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

          {message ? <p className="auth-message">{message}</p> : null}

          <button type="submit" className="primary-btn full-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}