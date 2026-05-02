import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CircleHelp,
  Handshake,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  Star,
  UserRound,
} from "lucide-react";
import { supabase } from "./supabase";

const emptyPitchForm = {
  startup_name: "",
  industry: "",
  short_description: "",
  funding_goal: "",
  traction: "",
  status: "draft",
};

const validSections = [
  "Overview",
  "Profile",
  "Pitches",
  "Watchlist",
  "Discover",
  "Investor Interest",
  "Deals",
  "Analytics",
  "Verification",
  "Settings",
  "Help Center",
];

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return "AU";

  const clean = nameOrEmail.trim();

  if (clean.includes("@")) {
    return clean.slice(0, 2).toUpperCase();
  }

  return clean
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatStatus(status) {
  if (!status) return "Draft";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [selectedSection, setSelectedSection] = useState("Overview");

  const [profile, setProfile] = useState({
    full_name: "AngelPort User",
    role: "Founder",
    headline: "",
    bio: "",
    verification_status: "Not Verified",
  });

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    role: "Founder",
    headline: "",
    bio: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [pitches, setPitches] = useState([]);
  const [interests, setInterests] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  const [pitchForm, setPitchForm] = useState(emptyPitchForm);
  const [editingPitchId, setEditingPitchId] = useState(null);
  const [pitchSaving, setPitchSaving] = useState(false);
  const [pitchMessage, setPitchMessage] = useState("");

const user = session?.user || null;
const email = user?.email || "";

const role = profile.role || user?.user_metadata?.role || "Founder";
const isFounder = role === "Founder" || role === "Both";
const isInvestor = role === "Investor" || role === "Both";

const publicPitches = pitches.filter(
  (pitch) => pitch.status === "public"
).length;

const draftPitches = pitches.filter(
  (pitch) => pitch.status === "draft"
).length;

const latestPitch = pitches[0];

const unreviewedInterests = interests.filter(
  (interest) => !interest.reviewed
).length;

const reviewedInterests = interests.filter(
  (interest) => interest.reviewed
).length;

const profileCompletion = useMemo(() => {
  let score = 0;

  if (profile.full_name) score += 25;
  if (profile.role) score += 25;
  if (profile.headline) score += 25;
  if (profile.bio) score += 25;

  return score;
}, [profile]);

const navItems = [
  { icon: LayoutDashboard, label: "Overview", show: true },
  { icon: UserRound, label: "Profile", show: true },
  { icon: BriefcaseBusiness, label: "Pitches", show: isFounder },
  { icon: Star, label: "Watchlist", show: isInvestor },
  { icon: Search, label: "Discover", show: isInvestor },
  { icon: Mail, label: "Investor Interest", show: isFounder },
  { icon: Handshake, label: "Deals", show: true },
  { icon: BarChart3, label: "Analytics", show: true },
  { icon: BadgeCheck, label: "Verification", show: true },
  { icon: Settings, label: "Settings", show: true },
  { icon: CircleHelp, label: "Help Center", show: true },
].filter((item) => item.show);

useEffect(() => {
  let mounted = true;

  async function loadSession() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session load error:", error.message);
      }

      if (!mounted) return;

      if (!data?.session) {
        setSession(null);
        setLoadingSession(false);
        navigate("/login");
        return;
      }

      setSession(data.session);
      setLoadingSession(false);
    } catch (error) {
      console.error("Unexpected session error:", error);
      if (mounted) {
        setSession(null);
        setLoadingSession(false);
        navigate("/login");
      }
    }
  }

  loadSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, nextSession) => {
    if (!mounted) return;

    setSession(nextSession);
    setLoadingSession(false);

    if (!nextSession) {
      navigate("/login");
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, [navigate]);

  useEffect(() => {
    if (!user) return;

    async function loadWatchlist() {
      const { data, error } = await supabase
        .from("pitch_watchlist")
        .select(
          `
          id,
          pitch_id,
          created_at,
          pitches (
            id,
            startup_name,
            industry,
            short_description,
            funding_goal,
            traction,
            status
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Watchlist load error:", error.message);
        return;
      }

      setWatchlist(data || []);
    }

    loadWatchlist();
  }, [user]);

  useEffect(() => {
    if (!navItems.some((item) => item.label === selectedSection)) {
      if (selectedSection !== "Discover") {
        setSelectedSection("Overview");
      }
    }
  }, [navItems, selectedSection]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!user) return;

    setProfileSaving(true);
    setProfileMessage("");

    const cleanProfile = {
      full_name: profileForm.full_name.trim() || "AngelPort User",
      role: profileForm.role,
      headline: profileForm.headline.trim(),
      bio: profileForm.bio.trim(),
      verification_status: profile.verification_status || "Not Verified",
    };

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        full_name: cleanProfile.full_name,
        role: cleanProfile.role,
        headline: cleanProfile.headline,
        bio: cleanProfile.bio,
      },
    });

    if (metadataError) {
      setProfileMessage(metadataError.message);
      setProfileSaving(false);
      return;
    }

    const { error: profileError } = await supabase.from("user_profiles").upsert({
      id: user.id,
      full_name: cleanProfile.full_name,
      role: cleanProfile.role,
      headline: cleanProfile.headline,
      bio: cleanProfile.bio,
      verification_status: cleanProfile.verification_status,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Profile save error:", profileError.message);
    }

    setProfile(cleanProfile);
    setProfileMessage("Profile updated.");
    setProfileSaving(false);
  }

  async function handleSavePitch(e) {
    e.preventDefault();
    if (!user) return;

    setPitchSaving(true);
    setPitchMessage("");

    const payload = {
      owner_id: user.id,
      startup_name: pitchForm.startup_name.trim(),
      industry: pitchForm.industry.trim(),
      short_description: pitchForm.short_description.trim(),
      funding_goal: pitchForm.funding_goal.trim(),
      traction: pitchForm.traction.trim(),
      status: pitchForm.status,
    };

    if (!payload.startup_name || !payload.short_description) {
      setPitchMessage("Startup name and short description are required.");
      setPitchSaving(false);
      return;
    }

    if (editingPitchId) {
      const { data, error } = await supabase
        .from("pitches")
        .update(payload)
        .eq("id", editingPitchId)
        .eq("owner_id", user.id)
        .select()
        .single();

      if (error) {
        setPitchMessage(error.message);
        setPitchSaving(false);
        return;
      }

      setPitches((prev) =>
        prev.map((pitch) => (pitch.id === editingPitchId ? data : pitch))
      );

      setPitchMessage("Pitch updated.");
    } else {
      const { data, error } = await supabase
        .from("pitches")
        .insert(payload)
        .select()
        .single();

      if (error) {
        setPitchMessage(error.message);
        setPitchSaving(false);
        return;
      }

      setPitches((prev) => [data, ...prev]);
      setPitchMessage("Pitch created.");
    }

    setPitchForm(emptyPitchForm);
    setEditingPitchId(null);
    setPitchSaving(false);
  }

  function handleEditPitch(pitch) {
    setEditingPitchId(pitch.id);
    setPitchForm({
      startup_name: pitch.startup_name || "",
      industry: pitch.industry || "",
      short_description: pitch.short_description || "",
      funding_goal: pitch.funding_goal || "",
      traction: pitch.traction || "",
      status: pitch.status || "draft",
    });
  }

  function handleCancelPitchEdit() {
    setEditingPitchId(null);
    setPitchForm(emptyPitchForm);
    setPitchMessage("");
  }

  async function handleDeletePitch(pitchId) {
    if (!user) return;

    const { error } = await supabase
      .from("pitches")
      .delete()
      .eq("id", pitchId)
      .eq("owner_id", user.id);

    if (error) {
      setPitchMessage(error.message);
      return;
    }

    setPitches((prev) => prev.filter((pitch) => pitch.id !== pitchId));

    if (editingPitchId === pitchId) {
      handleCancelPitchEdit();
    }
  }

  async function handleMarkInterestReviewed(interestId) {
    if (!user) return;

    const { data, error } = await supabase
      .from("pitch_interests")
      .update({
        reviewed: true,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", interestId)
      .eq("founder_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Review update error:", error.message);
      return;
    }

    setInterests((prev) =>
      prev.map((interest) =>
        interest.id === interestId
          ? {
              ...interest,
              reviewed: data.reviewed,
              reviewed_at: data.reviewed_at,
            }
          : interest
      )
    );
  }

  async function handleRemoveWatchlistItem(watchlistId) {
    if (!user) return;

    const { error } = await supabase
      .from("pitch_watchlist")
      .delete()
      .eq("id", watchlistId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Watchlist remove error:", error.message);
      return;
    }

    setWatchlist((prev) => prev.filter((item) => item.id !== watchlistId));
  }

  const founderStats = [
    {
      icon: BriefcaseBusiness,
      label: "Active Pitches",
      value: String(pitches.length).padStart(2, "0"),
      sub: `${publicPitches} public, ${draftPitches} drafts`,
      target: "Pitches",
    },
    {
      icon: Mail,
      label: "New Interest",
      value: String(unreviewedInterests).padStart(2, "0"),
      sub:
        unreviewedInterests === 1
          ? "1 new request"
          : `${unreviewedInterests} new requests`,
      target: "Investor Interest",
    },
    {
      icon: Star,
      label: "Public Visibility",
      value: String(publicPitches).padStart(2, "0"),
      sub:
        publicPitches > 0
          ? "public pitches live"
          : "publish a pitch first",
      target: "Pitches",
    },
    {
      icon: BadgeCheck,
      label: "Profile Completion",
      value: `${profileCompletion}%`,
      sub: profileCompletion === 100 ? "profile ready" : "finish setup",
      target: "Profile",
    },
  ];

  const investorStats = [
    {
      icon: Search,
      label: "Saved Startups",
      value: String(watchlist.length).padStart(2, "0"),
      sub:
        watchlist.length === 1
          ? "1 saved pitch"
          : `${watchlist.length} saved pitches`,
      target: "Watchlist",
    },
    {
      icon: Star,
      label: "Discover",
      value: "Live",
      sub: "browse public pitches",
      target: "Discover",
    },
    {
      icon: BadgeCheck,
      label: "Profile Completion",
      value: `${profileCompletion}%`,
      sub: profileCompletion === 100 ? "profile ready" : "finish setup",
      target: "Profile",
    },
  ];

  const stats = isFounder ? founderStats : investorStats;

  const activity = [
    isFounder
      ? pitches.length > 0
        ? `You have ${pitches.length} saved pitch${
            pitches.length === 1 ? "" : "es"
          }.`
        : "Create your first pitch to begin."
      : watchlist.length > 0
        ? `You have ${watchlist.length} saved pitch${
            watchlist.length === 1 ? "" : "es"
          } in your watchlist.`
        : "Save your first public pitch to begin.",

    isFounder
      ? publicPitches > 0
        ? `${publicPitches} pitch${
            publicPitches === 1 ? " is" : "es are"
          } marked public.`
        : "No public pitches yet."
      : "Use Discover to find public startup pitches.",

    isFounder
      ? unreviewedInterests > 0
        ? `${unreviewedInterests} new investor interest request${
            unreviewedInterests === 1 ? "" : "s"
          } waiting for review.`
        : reviewedInterests > 0
          ? "All investor interest has been reviewed."
          : "No investor interest yet."
      : "Contact founders from public pitch pages.",

    `Your profile is ${profileCompletion}% complete.`,
  ];

  function renderOverview() {
    return (
      <>
        <section className="dashboard-hero-grid">
          <div className="dashboard-hero-card">
            <div className="dashboard-pill">Signed In</div>
            <h1>Dashboard</h1>
            <p>
              Welcome back to AngelPort. Manage your profile, startup pitches,
              investor conversations, and account tools from one place.
            </p>

            <div className="dashboard-actions">
              {isFounder ? (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setSelectedSection("Pitches")}
                >
                  Create Pitch
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => navigate("/discover")}
                >
                  Discover Pitches
                </button>
              )}

              <button
                type="button"
                className="secondary-btn"
                onClick={() => setSelectedSection("Profile")}
              >
                Edit Profile
              </button>
            </div>
          </div>

          <div className="dashboard-account-card">
            <div className="account-card-row">
              <div className="user-avatar large-avatar">
                {getInitials(profile.full_name || email)}
              </div>
              <div>
                <p>Account</p>
                <h2>{email}</h2>
              </div>
            </div>

            <p>{profile.full_name}</p>
            <span className="account-role-chip">{role}</span>
          </div>
        </section>

        <section className="dashboard-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <button
                key={stat.label}
                type="button"
                className="dashboard-stat-card"
                onClick={() => {
                  if (stat.target === "Discover") {
                    navigate("/discover");
                    return;
                  }

                  setSelectedSection(stat.target);
                }}
              >
                <div className="dashboard-stat-top">
                  <div className="dashboard-stat-icon">
                    <Icon size={22} />
                  </div>
                  <span>{stat.label}</span>
                </div>

                <h3>{stat.value}</h3>
                <p>{stat.sub}</p>
              </button>
            );
          })}
        </section>

        <section className="dashboard-content-grid">
          <div className="dashboard-panel large">
            <div className="dashboard-panel-head">
              <h3>Recent Activity</h3>
              <span>Today</span>
            </div>

            <div className="activity-list">
              {activity.map((item) => (
                <div className="activity-item" key={item}>
                  <div className="activity-dot" />
                  <div className="activity-text">{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h3>{isFounder ? "Founder Focus" : "Investor Focus"}</h3>
              <span>Overview</span>
            </div>

            <div className="focus-list">
              {isFounder ? (
                <>
                  <div className="focus-row">
                    <strong>Public Pitch</strong>
                    <span>
                      {publicPitches > 0
                        ? `${publicPitches} public pitch live`
                        : "No public pitch yet"}
                    </span>
                  </div>

                  <div className="focus-row">
                    <strong>Latest Pitch</strong>
                    <span>
                      {latestPitch
                        ? `${latestPitch.startup_name} • ${latestPitch.status}`
                        : "Create your first pitch"}
                    </span>
                  </div>

                  <div className="focus-row">
                    <strong>Trust Status</strong>
                    <span>{profileCompletion}% profile completion</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="focus-row">
                    <strong>Watchlist</strong>
                    <span>
                      {watchlist.length > 0
                        ? `${watchlist.length} saved pitch${
                            watchlist.length === 1 ? "" : "es"
                          }`
                        : "No saved pitches yet"}
                    </span>
                  </div>

                  <div className="focus-row">
                    <strong>Discover</strong>
                    <span>Browse public startup opportunities</span>
                  </div>

                  <div className="focus-row">
                    <strong>Trust Status</strong>
                    <span>{profileCompletion}% profile completion</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  function renderProfile() {
    return (
      <section className="dashboard-content-grid">
        <form className="dashboard-panel large" onSubmit={handleSaveProfile}>
          <div className="dashboard-panel-head">
            <h3>Edit Profile</h3>
            <span>Live</span>
          </div>

          <div className="field-group">
            <label>Full Name</label>
            <input
              className="waitlist-input"
              value={profileForm.full_name}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  full_name: e.target.value,
                }))
              }
              placeholder="Your full name"
            />
          </div>

          <div className="field-group">
            <label>Role</label>
            <select
              className="waitlist-input"
              value={profileForm.role}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  role: e.target.value,
                }))
              }
            >
              <option>Founder</option>
              <option>Investor</option>
              <option>Both</option>
            </select>
          </div>

          <div className="field-group">
            <label>Headline</label>
            <input
              className="waitlist-input"
              value={profileForm.headline}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  headline: e.target.value,
                }))
              }
              placeholder="Example: Founder building clean energy tools"
            />
          </div>

          <div className="field-group">
            <label>Bio</label>
            <textarea
              className="waitlist-input"
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  bio: e.target.value,
                }))
              }
              placeholder="Short public bio"
              rows={5}
            />
          </div>

          {profileMessage ? <p className="auth-message">{profileMessage}</p> : null}

          <button className="primary-btn full-btn" disabled={profileSaving}>
            {profileSaving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <div className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h3>Current Identity</h3>
            <span>Preview</span>
          </div>

          <div className="focus-list">
            <div className="focus-row">
              <strong>Full Name</strong>
              <span>{profile.full_name}</span>
            </div>

            <div className="focus-row">
              <strong>Email</strong>
              <span>{email}</span>
            </div>

            <div className="focus-row">
              <strong>Role</strong>
              <span>{role}</span>
            </div>

            <div className="focus-row">
              <strong>Headline</strong>
              <span>{profile.headline || "No headline yet"}</span>
            </div>

            <div className="focus-row">
              <strong>Verification</strong>
              <span>{profile.verification_status || "Not Verified"}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderPitches() {
    return (
      <section className="dashboard-content-grid">
        <form className="dashboard-panel large" onSubmit={handleSavePitch}>
          <div className="dashboard-panel-head">
            <h3>{editingPitchId ? "Edit Pitch" : "Create Pitch"}</h3>
            <span>Founder Tool</span>
          </div>

          <div className="field-group">
            <label>Startup Name</label>
            <input
              className="waitlist-input"
              value={pitchForm.startup_name}
              onChange={(e) =>
                setPitchForm((prev) => ({
                  ...prev,
                  startup_name: e.target.value,
                }))
              }
              placeholder="Example: SolarGrid AI"
            />
          </div>

          <div className="field-group">
            <label>Industry</label>
            <input
              className="waitlist-input"
              value={pitchForm.industry}
              onChange={(e) =>
                setPitchForm((prev) => ({
                  ...prev,
                  industry: e.target.value,
                }))
              }
              placeholder="Example: Clean Energy, AI, Fintech"
            />
          </div>

          <div className="field-group">
            <label>Short Description</label>
            <textarea
              className="waitlist-input"
              value={pitchForm.short_description}
              onChange={(e) =>
                setPitchForm((prev) => ({
                  ...prev,
                  short_description: e.target.value,
                }))
              }
              placeholder="Briefly explain what your startup does"
              rows={4}
            />
          </div>

          <div className="field-group">
            <label>Funding Goal</label>
            <input
              className="waitlist-input"
              value={pitchForm.funding_goal}
              onChange={(e) =>
                setPitchForm((prev) => ({
                  ...prev,
                  funding_goal: e.target.value,
                }))
              }
              placeholder="Example: $500k seed round"
            />
          </div>

          <div className="field-group">
            <label>Traction</label>
            <textarea
              className="waitlist-input"
              value={pitchForm.traction}
              onChange={(e) =>
                setPitchForm((prev) => ({
                  ...prev,
                  traction: e.target.value,
                }))
              }
              placeholder="Revenue, users, pilots, waitlist, partnerships, etc."
              rows={4}
            />
          </div>

          <div className="field-group">
            <label>Status</label>
            <select
              className="waitlist-input"
              value={pitchForm.status}
              onChange={(e) =>
                setPitchForm((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
            >
              <option value="draft">Draft</option>
              <option value="public">Public</option>
            </select>
          </div>

          {pitchMessage ? <p className="auth-message">{pitchMessage}</p> : null}

          <div className="pitch-actions">
            <button className="primary-btn" disabled={pitchSaving}>
              {pitchSaving
                ? "Saving..."
                : editingPitchId
                  ? "Update Pitch"
                  : "Create Pitch"}
            </button>

            {editingPitchId ? (
              <button
                type="button"
                className="secondary-btn"
                onClick={handleCancelPitchEdit}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h3>My Pitches</h3>
            <span>{pitches.length}</span>
          </div>

          {pitches.length === 0 ? (
            <div className="focus-list">
              <div className="focus-row">
                <strong>No pitches yet</strong>
                <span>Create your first startup pitch to see it here.</span>
              </div>
            </div>
          ) : (
            <div className="focus-list">
              {pitches.map((pitch) => (
                <div key={pitch.id} className="focus-row pitch-list-item">
                  <div className="pitch-list-top">
                    <strong>{pitch.startup_name}</strong>
                    <span className="pitch-status-badge">
                      {formatStatus(pitch.status)}
                    </span>
                  </div>

                  <span>{pitch.short_description}</span>

                  <span>
                    {pitch.industry || "No industry"}
                    {pitch.funding_goal ? ` • ${pitch.funding_goal}` : ""}
                  </span>

                  <span>{pitch.traction || "No traction listed"}</span>

                  <div className="pitch-actions">
                    <button
                      type="button"
                      className="secondary-btn pitch-edit-btn"
                      onClick={() => handleEditPitch(pitch)}
                    >
                      Edit Pitch
                    </button>

                    {pitch.status === "public" ? (
                      <Link
                        to={`/pitch/${pitch.id}`}
                        className="secondary-btn pitch-edit-btn"
                      >
                        View Public Page
                      </Link>
                    ) : null}

                    <button
                      type="button"
                      className="secondary-btn pitch-delete-btn"
                      onClick={() => handleDeletePitch(pitch.id)}
                    >
                      Delete Pitch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderWatchlist() {
    return (
      <section className="dashboard-content-grid">
        <div className="dashboard-panel large">
          <div className="dashboard-panel-head">
            <h3>Saved Watchlist</h3>
            <span>{watchlist.length}</span>
          </div>

          {watchlist.length === 0 ? (
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot" />
                <div className="activity-text">
                  No saved pitches yet. Open Discover and save public pitches to
                  track them here.
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-dot" />
                <div className="activity-text">
                  Watchlist helps investors keep track of startups they may want
                  to revisit.
                </div>
              </div>
            </div>
          ) : (
            <div className="focus-list">
              {watchlist.map((item) => {
                const savedPitch = item.pitches;

                return (
                  <div key={item.id} className="focus-row pitch-list-item">
                    <div className="pitch-list-top">
                      <strong>{savedPitch?.startup_name || "Unknown pitch"}</strong>
                      <span className="pitch-status-badge">Saved</span>
                    </div>

                    <span>
                      {savedPitch?.short_description || "No description available."}
                    </span>

                    <span>
                      {savedPitch?.industry || "No industry"}
                      {savedPitch?.funding_goal
                        ? ` • ${savedPitch.funding_goal}`
                        : ""}
                    </span>

                    <div className="pitch-actions">
                      {savedPitch?.id ? (
                        <Link
                          to={`/pitch/${savedPitch.id}`}
                          className="secondary-btn pitch-edit-btn"
                        >
                          View Pitch
                        </Link>
                      ) : null}

                      <button
                        type="button"
                        className="secondary-btn pitch-delete-btn"
                        onClick={() => handleRemoveWatchlistItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h3>Watchlist Status</h3>
            <span>Live</span>
          </div>

          <div className="focus-list">
            <div className="focus-row">
              <strong>Saved Pitches</strong>
              <span>{watchlist.length}</span>
            </div>

            <div className="focus-row">
              <strong>Source</strong>
              <span>Save to Watchlist button</span>
            </div>

            <div className="focus-row">
              <strong>Next Step</strong>
              <span>Add notes or investor categories later.</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderInvestorInterest() {
    return (
      <section className="dashboard-content-grid">
        <div className="dashboard-panel large">
          <div className="dashboard-panel-head">
            <h3>Investor Interest</h3>
            <span>{interests.length}</span>
          </div>

          {interests.length === 0 ? (
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot" />
                <div className="activity-text">
                  No investor interest yet. Public pitches will appear in
                  Discover.
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-dot" />
                <div className="activity-text">
                  When someone clicks Contact Founder, it will show here.
                </div>
              </div>
            </div>
          ) : (
            <div className="focus-list">
              {interests.map((interest) => (
                <div key={interest.id} className="focus-row pitch-list-item">
                  <div className="pitch-list-top">
                    <strong>
                      {interest.interested_name || "AngelPort User"}
                    </strong>

                    <span className="pitch-status-badge">
                      {interest.reviewed ? "Reviewed" : "Interested"}
                    </span>
                  </div>

                  <span>{interest.interested_email || "No email saved"}</span>

                  <span>
                    Pitch: {interest.pitches?.startup_name || "Unknown pitch"}
                  </span>

                  <span>
                    {interest.message ||
                      "I am interested in learning more about this pitch."}
                  </span>

                  <div className="pitch-actions">
                    {interest.interested_email ? (
                      <a
                        className="secondary-btn pitch-edit-btn"
                        href={`mailto:${
                          interest.interested_email
                        }?subject=AngelPort pitch follow-up&body=Hi ${
                          interest.interested_name || "there"
                        },%0D%0A%0D%0AThanks for your interest in my pitch on AngelPort.`}
                      >
                        Reply by Email
                      </a>
                    ) : null}

                    {!interest.reviewed ? (
                      <button
                        type="button"
                        className="secondary-btn pitch-edit-btn"
                        onClick={() => handleMarkInterestReviewed(interest.id)}
                      >
                        Mark as Reviewed
                      </button>
                    ) : (
                      <span>Reviewed by founder</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h3>Interest Status</h3>
            <span>Live</span>
          </div>

          <div className="focus-list">
            <div className="focus-row">
              <strong>New Interest</strong>
              <span>{unreviewedInterests}</span>
            </div>

            <div className="focus-row">
              <strong>Reviewed</strong>
              <span>{reviewedInterests}</span>
            </div>

            <div className="focus-row">
              <strong>Total Interest</strong>
              <span>{interests.length}</span>
            </div>

            <div className="focus-row">
              <strong>Next Step</strong>
              <span>Build direct messaging or email follow-up next.</span>
            </div>

            <div className="focus-row">
              <strong>Source</strong>
              <span>Contact Founder button</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderSimplePanel(title, subtitle, rows = []) {
    return (
      <section className="dashboard-content-grid">
        <div className="dashboard-panel large">
          <div className="dashboard-panel-head">
            <h3>{title}</h3>
            <span>Coming Next</span>
          </div>

          <p className="pitch-detail-muted">{subtitle}</p>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h3>Status</h3>
            <span>Planned</span>
          </div>

          <div className="focus-list">
            {rows.map((row) => (
              <div className="focus-row" key={row.label}>
                <strong>{row.label}</strong>
                <span>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderMainContent() {
    switch (selectedSection) {
      case "Profile":
        return renderProfile();

      case "Pitches":
        return isFounder ? renderPitches() : renderOverview();

      case "Watchlist":
        return isInvestor ? renderWatchlist() : renderOverview();

      case "Investor Interest":
        return isFounder ? renderInvestorInterest() : renderOverview();

      case "Deals":
        return renderSimplePanel(
          "Deals",
          "Deal tracking will help founders and investors manage discussions, offers, and funding progress.",
          [
            { label: "Current Status", value: "Planned" },
            { label: "Best Next Step", value: "Add offer tracking later" },
          ]
        );

      case "Analytics":
        return renderSimplePanel(
          "Analytics",
          "Analytics will show profile completion, public pitch visibility, interest activity, and saved pitch trends.",
          [
            { label: "Profile Completion", value: `${profileCompletion}%` },
            { label: "Public Pitches", value: String(publicPitches) },
            { label: "Saved Watchlist", value: String(watchlist.length) },
          ]
        );

      case "Verification":
        return renderSimplePanel(
          "Verification",
          "Verification tools will help make AngelPort safer for founders and investors.",
          [
            { label: "Identity", value: profile.verification_status || "Not Verified" },
            { label: "Future Feature", value: "ID and business verification" },
          ]
        );

      case "Settings":
        return renderSimplePanel(
          "Settings",
          "Account settings and platform preferences will live here.",
          [
            { label: "Email", value: email },
            { label: "Role", value: role },
          ]
        );

      case "Help Center":
        return renderSimplePanel(
          "Help Center",
          "Help articles, founder tips, investor tips, and platform guidance will live here.",
          [
            { label: "Support", value: "Coming soon" },
            { label: "Guides", value: "Coming soon" },
          ]
        );

      case "Overview":
      default:
        return renderOverview();
    }
  }

  if (loadingSession) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img
            src="/angelport-icon.png"
            alt="AngelPort logo"
            className="brand-logo-img"
          />

          <div className="sidebar-brand-text">
            <h2>AngelPort</h2>
            <p>Workspace</p>
          </div>
        </div>

        <div className="sidebar-profile-card">
          <div className="user-avatar">{getInitials(profile.full_name || email)}</div>
          <div>
            <strong>{profile.full_name}</strong>
            <span>{role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = selectedSection === item.label;

            return (
              <button
                key={item.label}
                type="button"
                className={`sidebar-link ${active ? "active" : ""}`}
                onClick={() => {
                  if (item.label === "Discover") {
                    navigate("/discover");
                    return;
                  }

                  setSelectedSection(item.label);
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button type="button" className="sidebar-link signout-link" onClick={handleSignOut}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button type="button" className="menu-button">
              <Menu size={24} />
            </button>

            <Link to="/" className="back-home-link">
              ← Back to Home
            </Link>
          </div>

          <div className="dashboard-topbar-right">
            <span className="dashboard-role-badge">{role}</span>
            <span className="dashboard-email-pill">{email}</span>
          </div>
        </header>

        {renderMainContent()}
      </main>
    </div>
  );
}