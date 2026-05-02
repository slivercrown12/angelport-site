import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const roleOptions = [
  {
    value: "Founder",
    title: "Founder",
    description: "Create pitches, publish startup ideas, and track investor interest.",
  },
  {
    value: "Investor",
    title: "Investor",
    description: "Discover public startup pitches, save ideas, and contact founders.",
  },
  {
    value: "Both",
    title: "Both",
    description: "Create your own pitches and also explore other startup opportunities.",
  },
];

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Founder");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function getRedirectPath(selectedRole) {
    if (selectedRole === "Founder") return "/dashboard?section=Pitches";
    if (selectedRole === "Investor") return "/dashboard?section=Watchlist";
    return "/dashboard";
  }

  async function handleSignup(e) {
    e.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    if (!data.session) {
      setMessage("Account created. Check your email to confirm your account.");
      return;
    }

    navigate(getRedirectPath(role));
  }

  return (
    <div className="auth-page">
      <div className="auth-card signup-card-wide">
        <Link to="/" className="back-home-link">
          ← Back to Home
        </Link>

        <h1>Create Account</h1>
        <p>Choose how you want to use AngelPort.</p>

        <form onSubmit={handleSignup} className="waitlist-form">
          <div className="field-group">
            <label>Full Name</label>
            <input
              type="text"
              className="waitlist-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="field-group">
            <label>Account Type</label>

            <div className="onboarding-role-grid">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`onboarding-role-card ${
                    role === option.value ? "active" : ""
                  }`}
                  onClick={() => setRole(option.value)}
                >
                  <span>{option.title}</span>
                  <p>{option.description}</p>
                </button>
              ))}
            </div>
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
            {loading ? "Creating Account..." : `Create ${role} Account`}
          </button>
        </form>

        <p className="auth-bottom-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}