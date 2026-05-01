import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

import Privacy from "./Privacy";
import Terms from "./Terms";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Discover from "./Discover";
import PitchDetail from "./PitchDetail";
import ForgotPassword from "./ForgotPassword";
import UpdatePassword from "./UpdatePassword";

function HomePage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/");
  }

  const email = session?.user?.email;

  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-brand">
          <img
  src="/angelport-icon.png"
  alt="AngelPort logo"
  className="brand-logo-img"
/>
          <div>
            <h1>AngelPort</h1>
            <p>Founder & Investor Platform</p>
          </div>
        </Link>

        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <Link to="/discover">Discover</Link>
          <a href="#contact">Contact</a>
        </nav>

        <div className="landing-actions">
          <a href="#waitlist" className="secondary-btn">
            Join Waitlist
          </a>

          {session ? (
            <>
              <Link to="/dashboard" className="primary-btn">
                Dashboard
              </Link>
              <span className="landing-user-pill">{email}</span>
              <button className="secondary-btn" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="secondary-btn">
                Login
              </Link>
              <Link to="/signup" className="primary-btn">
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="landing-pill">Video-first startup discovery</div>

          <h2>Where founders and investors connect with clarity.</h2>

          <p>
            AngelPort helps founders present startup pitches and gives investors
            a focused way to discover public opportunities, review traction, and
            express interest.
          </p>

          <div className="landing-hero-buttons">
            <a href="#waitlist" className="primary-btn">
              Join Waitlist
            </a>
            <Link to="/discover" className="secondary-btn">
              Explore Discover
            </Link>
          </div>
        </div>

        <div className="landing-preview-card">
          <div className="preview-top">
            <div>
              <span>Public Pitch</span>
              <h3>SolarGrid AI</h3>
            </div>
            <div className="preview-status">Live</div>
          </div>

          <div className="preview-video">
            <div className="preview-video-inner">
              <span>Founder Pitch Preview</span>
            </div>
          </div>

          <div className="preview-details">
            <div>
              <strong>Industry</strong>
              <span>Clean Energy</span>
            </div>
            <div>
              <strong>Funding Goal</strong>
              <span>$500k seed</span>
            </div>
            <div>
              <strong>Interest</strong>
              <span>Investors can contact founder</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section-heading">
          <span>Core features</span>
          <h2>Simple tools for a focused founder-investor workflow.</h2>
        </div>

        <div className="landing-card-grid">
          <div className="landing-info-card">
            <h3>Create public or private pitches</h3>
            <p>
              Founders can create startup pitches, save drafts, and publish only
              what they are ready to share.
            </p>
          </div>

          <div className="landing-info-card">
            <h3>Discover startup opportunities</h3>
            <p>
              Investors can browse public pitches, search by topic, and open full
              pitch detail pages.
            </p>
          </div>

          <div className="landing-info-card">
            <h3>Track investor interest</h3>
            <p>
              When someone contacts a founder, the inquiry appears inside the
              founder dashboard.
            </p>
          </div>
        </div>
      </section>

      <section id="how" className="landing-section landing-how">
        <div className="landing-section-heading">
          <span>How it works</span>
          <h2>Three steps. No clutter.</h2>
        </div>

        <div className="landing-steps">
          <div className="landing-step">
            <span>01</span>
            <h3>Create</h3>
            <p>
              Founders build a pitch with startup details, traction, industry,
              and funding goals.
            </p>
          </div>

          <div className="landing-step">
            <span>02</span>
            <h3>Discover</h3>
            <p>
              Public pitches appear in Discover so investors can browse and
              search opportunities.
            </p>
          </div>

          <div className="landing-step">
            <span>03</span>
            <h3>Connect</h3>
            <p>
              Interested users can contact the founder, and founders can review
              interest from the dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-trust">
        <div>
          <span className="landing-pill">Built with trust in mind</span>
          <h2>Public when you want visibility. Private when you need control.</h2>
        </div>

        <div className="landing-trust-list">
          <div>
            <strong>Draft pitches stay private</strong>
            <p>Only public pitches appear in Discover.</p>
          </div>

          <div>
            <strong>Interest is tracked</strong>
            <p>Founders can see who contacted them and mark requests reviewed.</p>
          </div>

          <div>
            <strong>Verification-ready design</strong>
            <p>Identity and trust tools can be added as the platform grows.</p>
          </div>
        </div>
      </section>

      <section id="waitlist" className="landing-cta">
        <div>
          <span>Ready to use AngelPort?</span>
          <h2>Start building your pitch or explore public startups.</h2>
        </div>

        <div className="landing-hero-buttons">
          {session ? (
            <Link to="/dashboard" className="primary-btn">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/signup" className="primary-btn">
              Create Account
            </Link>
          )}

          <Link to="/discover" className="secondary-btn">
            Discover Pitches
          </Link>
        </div>
      </section>

      <footer id="contact" className="landing-footer">
        <div>
          <strong>AngelPort</strong>
          <p>Founder & Investor Platform</p>
        </div>

        <div className="landing-footer-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/discover">Discover</Link>
        </div>
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/pitch/:id" element={<PitchDetail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
    </Routes>
  );
}