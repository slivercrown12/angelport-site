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
  const [founderProfiles, setFounderProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function loadPublicPitches() {
      setLoading(true);

      const { data: pitchData, error: pitchError } = await supabase
        .from("pitches")
        .select(
          "id, owner_id, startup_name, industry, short_description, funding_goal, traction, status, created_at"
        )
        .eq("status", "public")
        .order("created_at", { ascending: false });

      if (pitchError) {
        console.error("Public pitch load error:", pitchError.message);
        setPitches([]);
        setFounderProfiles({});
        setLoading(false);
        return;
      }

      const publicPitches = pitchData || [];
      setPitches(publicPitches);

      const founderIds = [
        ...new Set(
          publicPitches
            .map((pitch) => pitch.owner_id)
            .filter(Boolean)
        ),
      ];

      if (founderIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("id, full_name, role, verification_status")
          .in("id", founderIds);

        if (profileError) {
          console.error("Founder profile load error:", profileError.message);
          setFounderProfiles({});
        } else {
          const profileMap = {};

          (profileData || []).forEach((profile) => {
            profileMap[profile.id] = profile;
          });

          setFounderProfiles(profileMap);
        }
      } else {
        setFounderProfiles({});
      }

      setLoading(false);
    }

    loadPublicPitches();
  }, []);

  const filteredPitches = useMemo(() => {
    const text = searchText.trim().toLowerCase();

    if (!text) return pitches;

    return pitches.filter((pitch) => {
      const founder = founderProfiles[pitch.owner_id];

      return (
        pitch.startup_name?.toLowerCase().includes(text) ||
        pitch.industry?.toLowerCase().includes(text) ||
        pitch.short_description?.toLowerCase().includes(text) ||
        pitch.traction?.toLowerCase().includes(text) ||
        founder?.full_name?.toLowerCase().includes(text) ||
        founder?.verification_status?.toLowerCase().includes(text)
      );
    });
  }, [pitches, searchText, founderProfiles]);

  const verifiedCount = pitches.filter((pitch) => {
    const founder = founderProfiles[pitch.owner_id];
    return founder?.verification_status === "Verified";
  }).length;

  return (
    <div className="discover-page">
      <header className="discover-topbar">
        <Link to="/" className="discover-brand">
          <img
            src="/angelport-icon.png"
            alt="AngelPort logo"
            className="brand-logo-img"
          />

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
              placeholder="Search startups, industries, founders, verification..."
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
              <span className="dashboard-stat-label">Verified Founders</span>
            </div>

            <div className="dashboard-stat-value">{verifiedCount}</div>
            <div className="dashboard-stat-sub">verified public founders</div>
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
            filteredPitches.map((pitch) => {
              const founder = founderProfiles[pitch.owner_id];
              const founderStatus =
                founder?.verification_status || "Not Verified";
              const isVerified = founderStatus === "Verified";

              return (
                <article key={pitch.id} className="discover-pitch-card">
                  <div className="discover-card-top">
                    <div>
                      <div className="discover-card-badges">
                        <span className="pitch-status-badge">Public</span>

                        {isVerified ? (
                          <span className="verified-founder-badge small-badge">
                            <BadgeCheck size={15} />
                            Verified Founder
                          </span>
                        ) : (
                          <span className="unverified-founder-badge small-badge">
                            {founderStatus}
                          </span>
                        )}
                      </div>

                      <h3>{pitch.startup_name}</h3>
                    </div>

                    <BriefcaseBusiness size={18} />
                  </div>

                  <p className="discover-description">
                    {pitch.short_description}
                  </p>

                  <div className="discover-meta">
                    <span>{pitch.industry || "No industry listed"}</span>
                    {pitch.funding_goal ? (
                      <span>{pitch.funding_goal}</span>
                    ) : null}
                  </div>

                  <div className="discover-founder-mini">
                    <strong>Founder</strong>
                    <span>{founder?.full_name || "AngelPort Founder"}</span>
                  </div>

                  {pitch.traction ? (
                    <div className="discover-traction">
                      <strong>Traction</strong>
                      <p>{pitch.traction}</p>
                    </div>
                  ) : null}

                  <Link
                    to={`/pitch/${pitch.id}`}
                    className="primary-btn discover-detail-btn"
                  >
                    View Pitch Details
                  </Link>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}