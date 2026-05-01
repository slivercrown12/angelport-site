import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BadgeCheck,
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

const navItems = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: UserRound, label: "Profile" },
  { icon: BriefcaseBusiness, label: "Pitches" },
  { icon: Mail, label: "Messages" },
  { icon: Handshake, label: "Deals" },
  { icon: BarChart3, label: "Analytics" },
  { icon: BadgeCheck, label: "Verification" },
];

const bottomItems = [
  { icon: Settings, label: "Settings" },
  { icon: CircleHelp, label: "Help Center" },
];

const emptyPitchForm = {
  startup_name: "",
  industry: "",
  short_description: "",
  funding_goal: "",
  traction: "",
  status: "draft",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(true);
  const [session, setSession] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Overview");

  const [profileName, setProfileName] = useState("");
  const [profileRole, setProfileRole] = useState("Founder");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [pitches, setPitches] = useState([]);
  const [pitchForm, setPitchForm] = useState(emptyPitchForm);
  const [editingPitchId, setEditingPitchId] = useState(null);
  const [pitchSaving, setPitchSaving] = useState(false);
  const [pitchMessage, setPitchMessage] = useState("");
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/login");
        return;
      }

      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (!newSession) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session?.user) return;

    setProfileName(
      session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        ""
    );

    setProfileRole(
      session.user.user_metadata?.role ||
        session.user.user_metadata?.user_role ||
        "Founder"
    );
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;

    async function loadPitches() {
      const { data, error } = await supabase
        .from("pitches")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Pitch load error:", error.message);
        return;
      }

      setPitches(data || []);
    }

    loadPitches();
  }, [session]);

  useEffect(() => {
  if (!session?.user) return;

  async function loadInterests() {
    const { data, error } = await supabase
      .from("pitch_interests")
.select(
  `
  id,
  pitch_id,
  interested_email,
  interested_name,
  message,
  reviewed,
  reviewed_at,
  created_at,
  pitches (
    startup_name,
    industry
  )
  `
)
      .eq("founder_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Interest load error:", error.message);
      return;
    }

    setInterests(data || []);
  }

  loadInterests();
}, [session]);

  const email = session?.user?.email || "No email";

  const fullName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    "AngelPort User";

  const role =
    session?.user?.user_metadata?.role ||
    session?.user?.user_metadata?.user_role ||
    "Founder";

  const initials = useMemo(() => {
    const parts = fullName.trim().split(" ").filter(Boolean);

    if (parts.length === 0) return "AP";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [fullName]);

  const roleText = String(role).toLowerCase();
  const isFounder = roleText.includes("founder") || roleText.includes("both");

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

  const profileCompletionItems = [
    fullName && fullName !== "AngelPort User",
    email && email !== "No email",
    role,
    pitches.length > 0,
  ];

  const profileCompletion = Math.round(
    (profileCompletionItems.filter(Boolean).length /
      profileCompletionItems.length) *
      100
  );

  const stats = isFounder
    ? [
        {
          icon: BriefcaseBusiness,
          label: "Active Pitches",
          value: String(pitches.length).padStart(2, "0"),
          sub: `${publicPitches} public, ${draftPitches} draft${
            draftPitches === 1 ? "" : "s"
          }`,
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
  target: "Messages",
},
        {
          icon: Star,
          label: "Public Visibility",
          value: String(publicPitches).padStart(2, "0"),
          sub:
            publicPitches > 0 ? "public pitches live" : "publish a pitch first",
          target: "Pitches",
        },
        {
          icon: BadgeCheck,
          label: "Profile Completion",
          value: `${profileCompletion}%`,
          sub: profileCompletion === 100 ? "profile ready" : "finish setup",
          target: "Profile",
        },
      ]
    : [
        {
          icon: Search,
          label: "Saved Startups",
          value: "00",
          sub: "watchlist coming soon",
          target: "Pitches",
        },
        {
          icon: Mail,
          label: "Unread Messages",
          value: "00",
          sub: "messages coming soon",
          target: "Messages",
        },
        {
          icon: Handshake,
          label: "Tracked Deals",
          value: "00",
          sub: "deal tools coming soon",
          target: "Deals",
        },
        {
          icon: BadgeCheck,
          label: "Profile Completion",
          value: `${profileCompletion}%`,
          sub: profileCompletion === 100 ? "profile ready" : "finish setup",
          target: "Profile",
        },
      ];

  const activity = [
    pitches.length > 0
      ? `You have ${pitches.length} saved pitch${
          pitches.length === 1 ? "" : "es"
        }.`
      : "Create your first pitch to begin.",
    publicPitches > 0
      ? `${publicPitches} pitch${
          publicPitches === 1 ? " is" : "es are"
        } marked public.`
      : "No public pitches yet.",
   unreviewedInterests > 0
  ? `${unreviewedInterests} new investor interest request${
      unreviewedInterests === 1 ? "" : "s"
    } waiting for review.`
  : reviewedInterests > 0
    ? "All investor interest has been reviewed."
    : "No investor interest yet.",

  `Your profile is ${profileCompletion}% complete.`,,
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");

    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: profileName,
        role: profileRole,
      },
    });

    if (error) {
      setProfileSaving(false);
      setProfileMessage(error.message);
      return;
    }

    if (data?.user && session) {
      setSession({
        ...session,
        user: data.user,
      });
    }

    setProfileSaving(false);
    setProfileMessage("Profile updated.");
  }

  function handlePitchChange(e) {
    const { name, value } = e.target;

    setPitchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetPitchForm() {
    setEditingPitchId(null);
    setPitchForm(emptyPitchForm);
  }

  function handlePitchEdit(pitch) {
    setEditingPitchId(pitch.id);
    setPitchMessage("");

    setPitchForm({
      startup_name: pitch.startup_name || "",
      industry: pitch.industry || "",
      short_description: pitch.short_description || "",
      funding_goal: pitch.funding_goal || "",
      traction: pitch.traction || "",
      status: pitch.status || "draft",
    });
  }

  async function handlePitchSave(e) {
    e.preventDefault();

    if (!session?.user) {
      setPitchMessage("You must be signed in to save a pitch.");
      return;
    }

    setPitchSaving(true);
    setPitchMessage("");

    const pitchData = {
      startup_name: pitchForm.startup_name,
      industry: pitchForm.industry || null,
      short_description: pitchForm.short_description,
      funding_goal: pitchForm.funding_goal || null,
      traction: pitchForm.traction || null,
      status: pitchForm.status,
    };

    if (editingPitchId) {
      const { data, error } = await supabase
        .from("pitches")
        .update(pitchData)
        .eq("id", editingPitchId)
        .eq("owner_id", session.user.id)
        .select()
        .single();

      if (error) {
        setPitchSaving(false);
        setPitchMessage(error.message);
        return;
      }

      setPitches((prev) =>
        prev.map((pitch) => (pitch.id === editingPitchId ? data : pitch))
      );

      resetPitchForm();
      setPitchSaving(false);
      setPitchMessage("Pitch updated.");
      return;
    }

    const payload = {
      owner_id: session.user.id,
      ...pitchData,
    };

    const { data, error } = await supabase
      .from("pitches")
      .insert(payload)
      .select()
      .single();

    if (error) {
      setPitchSaving(false);
      setPitchMessage(error.message);
      return;
    }

    setPitches((prev) => [data, ...prev]);
    resetPitchForm();
    setPitchSaving(false);
    setPitchMessage("Pitch saved.");
  }

  async function handlePitchDelete(pitchId) {
    if (!session?.user) return;

    const { error } = await supabase
      .from("pitches")
      .delete()
      .eq("id", pitchId)
      .eq("owner_id", session.user.id);

    if (error) {
      setPitchMessage(error.message);
      return;
    }

    setPitches((prev) => prev.filter((pitch) => pitch.id !== pitchId));

    if (editingPitchId === pitchId) {
      resetPitchForm();
    }

    setPitchMessage("Pitch deleted.");
  }
  async function handleMarkInterestReviewed(interestId) {
  if (!session?.user) return;

  const { data, error } = await supabase
    .from("pitch_interests")
    .update({
      reviewed: true,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", interestId)
    .eq("founder_id", session.user.id)
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

  function renderOverview() {
    return (
      <>
        <section className="dashboard-hero">
          <div className="dashboard-hero-left">
            <div className="dashboard-pill">Signed In</div>
            <h1>Dashboard</h1>
            <p>
              Welcome back to AngelPort. Manage your profile, startup pitches,
              investor conversations, and account tools from one place.
            </p>

            <div className="dashboard-quick-actions">
              {isFounder ? (
                <>
                  <button
                    className="primary-btn"
                    onClick={() => setSelectedSection("Pitches")}
                  >
                    Create Pitch
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => setSelectedSection("Profile")}
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="primary-btn"
                    onClick={() => setSelectedSection("Pitches")}
                  >
                    Explore Startups
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => setSelectedSection("Deals")}
                  >
                    View Watchlist
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="dashboard-account-card">
            <div className="dashboard-account-top">
              <div className="dashboard-account-avatar">{initials}</div>
              <div>
                <p className="mini-label">Account</p>
                <h3>{email}</h3>
              </div>
            </div>

            <p>{fullName}</p>
            <div className="account-role-chip">{role}</div>
          </div>
        </section>

        <section className="dashboard-stats-grid">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                className="dashboard-stat-card"
                onClick={() => setSelectedSection(item.target)}
              >
                <div className="dashboard-stat-top">
                  <span className="dashboard-stat-icon">
                    <Icon size={18} strokeWidth={2.2} />
                  </span>
                  <span className="dashboard-stat-label">{item.label}</span>
                </div>

                <div className="dashboard-stat-value">{item.value}</div>
                <div className="dashboard-stat-sub">{item.sub}</div>
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
              {activity.map((item, index) => (
                <div key={index} className="activity-item">
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
                        ? `${publicPitches} public pitch${
                            publicPitches === 1 ? "" : "es"
                          } live`
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
                    <strong>Saved Opportunities</strong>
                    <span>Watchlist coming soon</span>
                  </div>

                  <div className="focus-row">
                    <strong>Founder Replies</strong>
                    <span>Inbox tools coming soon</span>
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
        <div className="dashboard-panel large">
          <div className="dashboard-panel-head">
            <h3>Edit Profile</h3>
            <span>Live</span>
          </div>

          <form onSubmit={handleProfileSave} className="waitlist-form">
            <div className="field-group">
              <label>Full Name</label>
              <input
                type="text"
                className="waitlist-input"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="field-group">
              <label>Role</label>
              <select
                className="waitlist-input"
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
              >
                <option>Founder</option>
                <option>Investor</option>
                <option>Both</option>
              </select>
            </div>

            {profileMessage ? (
              <p className="auth-message">{profileMessage}</p>
            ) : null}

            <button
              type="submit"
              className="primary-btn"
              disabled={profileSaving}
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h3>Current Identity</h3>
            <span>Preview</span>
          </div>

          <div className="focus-list">
            <div className="focus-row">
              <strong>Full Name</strong>
              <span>{profileName || "No name yet"}</span>
            </div>

            <div className="focus-row">
              <strong>Email</strong>
              <span>{email}</span>
            </div>

            <div className="focus-row">
              <strong>Role</strong>
              <span>{profileRole}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderPitches() {
    return (
      <section className="dashboard-content-grid">
        <div className="dashboard-panel large">
          <div className="dashboard-panel-head">
            <h3>{editingPitchId ? "Edit Pitch" : "Create Pitch"}</h3>
            <span>{editingPitchId ? "Editing" : "Founder Tool"}</span>
          </div>

          <form onSubmit={handlePitchSave} className="waitlist-form">
            <div className="field-group">
              <label>Startup Name</label>
              <input
                name="startup_name"
                type="text"
                className="waitlist-input"
                value={pitchForm.startup_name}
                onChange={handlePitchChange}
                placeholder="Example: SolarGrid AI"
                required
              />
            </div>

            <div className="field-group">
              <label>Industry</label>
              <input
                name="industry"
                type="text"
                className="waitlist-input"
                value={pitchForm.industry}
                onChange={handlePitchChange}
                placeholder="Example: Clean Energy, AI, Fintech"
              />
            </div>

            <div className="field-group">
              <label>Short Description</label>
              <textarea
                name="short_description"
                className="waitlist-input"
                value={pitchForm.short_description}
                onChange={handlePitchChange}
                placeholder="Briefly explain what your startup does"
                rows="4"
                required
              />
            </div>

            <div className="field-group">
              <label>Funding Goal</label>
              <input
                name="funding_goal"
                type="text"
                className="waitlist-input"
                value={pitchForm.funding_goal}
                onChange={handlePitchChange}
                placeholder="Example: $500k seed round"
              />
            </div>

            <div className="field-group">
              <label>Traction</label>
              <textarea
                name="traction"
                className="waitlist-input"
                value={pitchForm.traction}
                onChange={handlePitchChange}
                placeholder="Revenue, users, pilots, waitlist, partnerships, etc."
                rows="4"
              />
            </div>

            <div className="field-group">
              <label>Status</label>
              <select
                name="status"
                className="waitlist-input"
                value={pitchForm.status}
                onChange={handlePitchChange}
              >
                <option value="draft">Draft</option>
                <option value="public">Public</option>
              </select>
            </div>

            {pitchMessage ? (
              <p className="auth-message">{pitchMessage}</p>
            ) : null}

            <div className="pitch-form-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={pitchSaving}
              >
                {pitchSaving
                  ? editingPitchId
                    ? "Updating Pitch..."
                    : "Saving Pitch..."
                  : editingPitchId
                    ? "Update Pitch"
                    : "Save Pitch"}
              </button>

              {editingPitchId ? (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetPitchForm}
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

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
                    <span className="pitch-status-badge">{pitch.status}</span>
                  </div>

                  <span>{pitch.short_description}</span>

                  <span>
                    {pitch.industry || "No industry"}
                    {pitch.funding_goal ? ` • ${pitch.funding_goal}` : ""}
                  </span>

                  {pitch.traction ? <span>{pitch.traction}</span> : null}

                  <div className="pitch-actions">
                    <button
                      type="button"
                      className="secondary-btn pitch-edit-btn"
                      onClick={() => handlePitchEdit(pitch)}
                    >
                      Edit Pitch
                    </button>

                    <button
                      type="button"
                      className="secondary-btn pitch-delete-btn"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Delete "${pitch.startup_name}"? This cannot be undone.`
                        );

                        if (confirmed) {
                          handlePitchDelete(pitch.id);
                        }
                      }}
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
function renderMessages() {
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
                No investor interest yet. Public pitches will appear in Discover.
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
          <h3>Message Status</h3>
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

  function renderDeals() {
    return (
      <section className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Tracked Deals</h3>
          <p>Monitor active investor conversations and offer progress.</p>
        </div>

        <div className="dashboard-card">
          <h3>Current Status</h3>
          <p>No finalized deal pipeline yet.</p>
        </div>

        <div className="dashboard-card">
          <h3>Negotiation Notes</h3>
          <p>Future deal notes and milestone tracking can live here.</p>
        </div>

        <div className="dashboard-card">
          <h3>Trust Layer</h3>
          <p>Verification and identity tools support safer deal flow.</p>
        </div>
      </section>
    );
  }

  function renderAnalytics() {
    return (
      <section className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">Total Pitches</span>
          </div>
          <div className="dashboard-stat-value">{pitches.length}</div>
          <div className="dashboard-stat-sub">Saved pitch records</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">Public Pitches</span>
          </div>
          <div className="dashboard-stat-value">{publicPitches}</div>
          <div className="dashboard-stat-sub">Visible pitch records</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">Draft Pitches</span>
          </div>
          <div className="dashboard-stat-value">{draftPitches}</div>
          <div className="dashboard-stat-sub">Unpublished pitch records</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">Profile Score</span>
          </div>
          <div className="dashboard-stat-value">{profileCompletion}%</div>
          <div className="dashboard-stat-sub">Profile and pitch readiness</div>
        </div>
      </section>
    );
  }

  function renderVerification() {
    return (
      <section className="dashboard-content-grid">
        <div className="dashboard-panel large">
          <div className="dashboard-panel-head">
            <h3>Verification</h3>
            <span>Ready</span>
          </div>

          <div className="focus-list">
            <div className="focus-row">
              <strong>Identity Check</strong>
              <span>Available for higher-trust interactions later</span>
            </div>

            <div className="focus-row">
              <strong>Profile Completion</strong>
              <span>{profileCompletion}% complete</span>
            </div>

            <div className="focus-row">
              <strong>Trust Visibility</strong>
              <span>Better verification can improve credibility</span>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h3>Next Step</h3>
            <span>Recommended</span>
          </div>

          <div className="focus-list">
            <div className="focus-row">
              <strong>Upgrade Trust</strong>
              <span>Complete identity verification when ready</span>
            </div>

            <div className="focus-row">
              <strong>Public Readiness</strong>
              <span>Improve credibility for investors and founders</span>
            </div>
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
        return renderPitches();
      case "Messages":
        return renderMessages();
      case "Deals":
        return renderDeals();
      case "Analytics":
        return renderAnalytics();
      case "Verification":
        return renderVerification();
      default:
        return renderOverview();
    }
  }

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${menuOpen ? "open" : "closed"}`}>
        <div className="sidebar-top">
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

          <div className="sidebar-profile-mini">
            <div className="sidebar-profile-avatar">{initials}</div>
            <div className="sidebar-profile-text">
              <strong>{fullName}</strong>
              <span>{role}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = selectedSection === item.label;

            return (
              <button
                key={item.label}
                className={`sidebar-link ${active ? "active" : ""}`}
                onClick={() => setSelectedSection(item.label)}
              >
                <span className="sidebar-icon">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          {bottomItems.map((item) => {
            const Icon = item.icon;

            return (
              <button key={item.label} className="sidebar-link">
                <span className="sidebar-icon">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <button className="sidebar-link danger" onClick={handleSignOut}>
            <span className="sidebar-icon">
              <LogOut size={18} strokeWidth={2} />
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="dashboard-main-wrap">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={20} strokeWidth={2.2} />
            </button>

            <Link to="/" className="back-home-link">
              ← Back to Home
            </Link>
          </div>

          <div className="topbar-right">
            <span className="dashboard-role-badge">{role}</span>
            <span className="dashboard-user-pill">{email}</span>
          </div>
        </header>

        <main className="dashboard-main">{renderMainContent()}</main>
      </div>
    </div>
  );
}