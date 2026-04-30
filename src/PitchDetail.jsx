import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Handshake,
  Sparkles,
} from "lucide-react";
import { supabase } from "./supabase";

export default function PitchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [interestSaving, setInterestSaving] = useState(false);
  const [interestMessage, setInterestMessage] = useState("");

  useEffect(() => {
    async function loadPitch() {
      setLoading(true);
      setErrorText("");

      const { data, error } = await supabase
        .from("pitches")
        .select(
          "id, owner_id, startup_name, industry, short_description, funding_goal, traction, status, created_at"
        )
        .eq("id", id)
        .eq("status", "public")
        .maybeSingle();

      if (error) {
        setErrorText(error.message);
        setPitch(null);
        setLoading(false);
        return;
      }

      setPitch(data);
      setLoading(false);
    }

    loadPitch();
  }, [id]);

  async function handleContactFounder() {
    setInterestMessage("");

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session?.user) {
      setInterestMessage("Please log in before contacting a founder.");
      setTimeout(() => {
        navigate("/login");
      }, 900);
      return;
    }

    if (!pitch) return;

    if (session.user.id === pitch.owner_id) {
      setInterestMessage("This is your own pitch.");
      return;
    }

    setInterestSaving(true);

const interestedName =
  session.user.user_metadata?.full_name ||
  session.user.user_metadata?.name ||
  "AngelPort User";

const { error } = await supabase.from("pitch_interests").insert({
  pitch_id: pitch.id,
  founder_id: pitch.owner_id,
  interested_user_id: session.user.id,
  interested_email: session.user.email,
  interested_name: interestedName,
  message: "I am interested in learning more about this pitch.",
});

    if (error) {
      setInterestSaving(false);

      if (error.code === "23505") {
        setInterestMessage("You already expressed interest in this pitch.");
        return;
      }

      setInterestMessage(error.message);
      return;
    }

    setInterestSaving(false);
    setInterestMessage("Interest sent. The founder will be able to see this later.");
  }

  if (loading) {
    return (
      <div className="pitch-detail-page">
        <div className="pitch-detail-shell">
          <Link to="/discover" className="back-home-link">
            ← Back to Discover
          </Link>

          <div className="dashboard-panel">
            <h1>Loading pitch...</h1>
            <p className="pitch-detail-muted">
              Please wait while AngelPort loads this public pitch.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (errorText || !pitch) {
    return (
      <div className="pitch-detail-page">
        <div className="pitch-detail-shell">
          <Link to="/discover" className="back-home-link">
            ← Back to Discover
          </Link>

          <div className="dashboard-panel">
            <h1>Pitch not found</h1>
            <p className="pitch-detail-muted">
              This pitch may not exist, or it may still be private.
            </p>

            {errorText ? <p className="auth-message">{errorText}</p> : null}

            <Link to="/discover" className="primary-btn">
              View Public Pitches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pitch-detail-page">
      <header className="discover-topbar">
        <Link to="/discover" className="discover-brand">
          <div className="sidebar-logo">A</div>
          <div>
            <h1>AngelPort</h1>
            <p>Pitch Detail</p>
          </div>
        </Link>

        <div className="discover-actions">
          <Link to="/discover" className="secondary-btn">
            Discover
          </Link>
          <Link to="/dashboard" className="primary-btn">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="pitch-detail-shell">
        <Link to="/discover" className="back-home-link pitch-detail-back">
          <ArrowLeft size={18} />
          Back to Discover
        </Link>

        <section className="pitch-detail-hero">
          <div className="pitch-detail-main-card">
            <div className="dashboard-pill">Public Pitch</div>

            <h1>{pitch.startup_name}</h1>

            <p className="pitch-detail-description">
              {pitch.short_description}
            </p>

            <div className="discover-meta pitch-detail-meta">
              <span>{pitch.industry || "No industry listed"}</span>
              {pitch.funding_goal ? <span>{pitch.funding_goal}</span> : null}
              <span>{pitch.status}</span>
            </div>

            <div className="pitch-detail-actions">
              <button
                className="primary-btn"
                type="button"
                onClick={handleContactFounder}
                disabled={interestSaving}
              >
                {interestSaving ? "Sending..." : "Contact Founder"}
              </button>

              <button className="secondary-btn" type="button">
                Save to Watchlist
              </button>
            </div>

            {interestMessage ? (
              <p className="auth-message">{interestMessage}</p>
            ) : null}

            <p className="pitch-detail-note">
              Contact Founder now saves investor interest to Supabase.
              Watchlist tools can be added next.
            </p>
          </div>

          <aside className="pitch-detail-side-card">
            <div className="dashboard-panel-head">
              <h3>Pitch Snapshot</h3>
              <span>Live</span>
            </div>

            <div className="focus-list">
              <div className="focus-row">
                <strong>Visibility</strong>
                <span>Public</span>
              </div>

              <div className="focus-row">
                <strong>Industry</strong>
                <span>{pitch.industry || "Not listed"}</span>
              </div>

              <div className="focus-row">
                <strong>Funding Goal</strong>
                <span>{pitch.funding_goal || "Not listed"}</span>
              </div>
            </div>
          </aside>
        </section>

        <section className="pitch-detail-grid">
          <div className="dashboard-panel large">
            <div className="dashboard-panel-head">
              <h3>Traction</h3>
              <span>Founder submitted</span>
            </div>

            <p className="pitch-detail-long-text">
              {pitch.traction || "No traction details listed yet."}
            </p>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h3>Investor Readiness</h3>
              <span>Overview</span>
            </div>

            <div className="focus-list">
              <div className="focus-row">
                <strong>
                  <BriefcaseBusiness size={17} /> Business Summary
                </strong>
                <span>Public description available</span>
              </div>

              <div className="focus-row">
                <strong>
                  <Sparkles size={17} /> Discovery Status
                </strong>
                <span>Visible in AngelPort Discover</span>
              </div>

              <div className="focus-row">
                <strong>
                  <BadgeCheck size={17} /> Trust Layer
                </strong>
                <span>Verification tools can be added later</span>
              </div>

              <div className="focus-row">
                <strong>
                  <Handshake size={17} /> Deal Flow
                </strong>
                <span>Interest tracking is now active</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}