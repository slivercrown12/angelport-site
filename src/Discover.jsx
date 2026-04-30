import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Search,
  Sparkles,
} from "lucide-react";
import { supabase } from "./supabase";

export default function Discover() {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function loadPublicPitches() {
      setLoading(true);

      const { data, error } = await supabase
        .from("pitches")
        .select(
          "id, startup_name, industry, short_description, funding_goal, traction, status, created_at"
        )
        .eq("status", "public")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Public pitch load error:", error.message);
        setPitches([]);
        setLoading(false);
        return;
      }

      setPitches(data || []);
      setLoading(false);
    }

    loadPublicPitches();
  }, []);

  const filteredPitches = useMemo(() => {
    const text = searchText.trim().toLowerCase();

    if (!text) return pitches;

    return pitches.filter((pitch) => {
      return (
        pitch.startup_name?.toLowerCase().includes(text) ||
        pitch.industry?.toLowerCase().includes(text) ||
        pitch.short_description?.toLowerCase().includes(text) ||
        pitch.traction?.toLowerCase().includes(text)
      );
    });
  }, [pitches, searchText]);

  return (
    <div className="discover-page">
      <header className="discover-topbar">
        <Link to="/" className="discover-brand">
          <div className="sidebar-logo">A</div>
          <div>
            <h1>AngelPort</h1>
            <p>Public Pitch Discovery</p>
          </div>
        </Link>

        <div className="discover-actions">
          <Link to="/" className="secondary-btn">
            Home
          </Link>
          <Link to="/dashboard" className="primary-btn">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="discover-main">
        <section className="discover-hero">
          <div>
            <div className="dashboard-pill">Public Discovery</div>
            <h2>Explore public startup pitches.</h2>
            <p>
              Browse founder-submitted public pitches. Draft pitches stay private
              inside each founder dashboard.
            </p>
          </div>

          <div className="discover-search-card">
            <div className="discover-search-icon">
              <Search size={18} />
            </div>
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search startups, industries, traction..."
            />
          </div>
        </section>

        <section className="discover-summary-grid">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-top">
              <span className="dashboard-stat-icon">
                <BriefcaseBusiness size={18} />
              </span>
              <span className="dashboard-stat-label">Public Pitches</span>
            </div>
            <div className="dashboard-stat-value">{pitches.length}</div>
            <div className="dashboard-stat-sub">visible startup pitches</div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-top">
              <span className="dashboard-stat-icon">
                <Sparkles size={18} />
              </span>
              <span className="dashboard-stat-label">Search Results</span>
            </div>
            <div className="dashboard-stat-value">{filteredPitches.length}</div>
            <div className="dashboard-stat-sub">matching current search</div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-top">
              <span className="dashboard-stat-icon">
                <BadgeCheck size={18} />
              </span>
              <span className="dashboard-stat-label">Visibility</span>
            </div>
            <div className="dashboard-stat-value">Live</div>
            <div className="dashboard-stat-sub">public pitches only</div>
          </div>
        </section>

        <section className="discover-grid">
          {loading ? (
            <div className="discover-empty">
              <h3>Loading public pitches...</h3>
              <p>Please wait while AngelPort loads the public pitch feed.</p>
            </div>
          ) : filteredPitches.length === 0 ? (
            <div className="discover-empty">
              <h3>No public pitches found</h3>
              <p>
                Create a pitch in your dashboard and set its status to Public to
                make it appear here.
              </p>
              <Link to="/dashboard" className="primary-btn">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            filteredPitches.map((pitch) => (
              <article key={pitch.id} className="discover-pitch-card">
                <div className="discover-card-top">
                  <div>
                    <span className="pitch-status-badge">Public</span>
                    <h3>{pitch.startup_name}</h3>
                  </div>
                  <BriefcaseBusiness size={18} />
                </div>

                <p className="discover-description">
                  {pitch.short_description}
                </p>

                <div className="discover-meta">
                  <span>{pitch.industry || "No industry listed"}</span>
                  {pitch.funding_goal ? <span>{pitch.funding_goal}</span> : null}
                </div>

                {pitch.traction ? (
                  <div className="discover-traction">
                    <strong>Traction</strong>
                    <p>{pitch.traction}</p>
                  </div>
                ) : null}
                <Link to={`/pitch/${pitch.id}`} className="primary-btn discover-detail-btn">
  View Pitch Details
</Link>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}