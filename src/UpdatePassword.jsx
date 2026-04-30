import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function UpdatePassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Checking reset link...");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepareRecoverySession() {
      setMessage("Checking reset link...");

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setReady(false);
          setMessage(error.message);
          return;
        }

        setReady(true);
        setMessage("");
        return;
      }

      const hashParams = new URLSearchParams(
        window.location.hash.replace("#", "")
      );

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setReady(false);
          setMessage(error.message);
          return;
        }

        setReady(true);
        setMessage("");
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setReady(true);
        setMessage("");
        return;
      }

      setReady(false);
      setMessage(
        "No reset session found. Please open this page from the password reset email link."
      );
    }

    prepareRecoverySession();
  }, []);

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setMessage("");

    if (!ready) {
      setMessage(
        "No reset session found. Please use the reset link from your email."
      );
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Password updated. Redirecting to login...");

    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate("/login");
    }, 900);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/login" className="back-home-link">
          ← Back to Login
        </Link>

        <h1>Update Password</h1>
        <p>Enter your new AngelPort password.</p>

        <form onSubmit={handleUpdatePassword} className="waitlist-form">
          <div className="field-group">
            <label>New Password</label>
            <input
              type="password"
              className="waitlist-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
            />
          </div>

          <div className="field-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="waitlist-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>

          {message ? <p className="auth-message">{message}</p> : null}

          <button
            type="submit"
            className="primary-btn full-btn"
            disabled={saving || !ready}
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}