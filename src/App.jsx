import { useState } from "react";
import "./index.css";
import { supabase } from "./supabase";

export default function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Founder",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

async function handleSubmit(e) {
  e.preventDefault();
  setSaving(true);
  setError("");

  const { error: insertError } = await supabase.from("waitlist").insert({
    name: form.name,
    email: form.email,
    role: form.role,
    message: form.message || null,
  });

  if (insertError) {
    setSaving(false);
    setError(insertError.message);
    return;
  }

const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/waitlist-notify`;
  const notifyResponse = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      name: form.name,
      email: form.email,
      role: form.role,
      message: form.message,
    }),
  });

  if (!notifyResponse.ok) {
    const notifyError = await notifyResponse.text();
    setSaving(false);
    setError(`Saved to waitlist, but email failed: ${notifyError}`);
    return;
  }

  setSaving(false);
  setSubmitted(true);
  setForm({
    name: "",
    email: "",
    role: "Founder",
    message: "",
  });
}

  return (
    <div className="site">
      <header className="topbar">
        <div className="brand">
          <h1>AngelPort</h1>
          <p>Founder & Investor Platform</p>
        </div>

        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#screens">Screens</a>
          <a href="#audience">Audience</a>
          <a href="#waitlist">Waitlist</a>
          <a href="#contact">Contact</a>
        </nav>

        <a href="#waitlist" className="primary-btn">Join Waitlist</a>
      </header>

      <section className="hero">
        <div className="hero-left">
          <div className="pill">Video-first startup discovery</div>
          <h2>Where founders and investors connect with clarity.</h2>
          <p>
            AngelPort helps founders present high-quality startup pitches and gives
            investors a modern way to discover opportunities, discuss deals, and
            build real business relationships.
          </p>

          <div className="hero-actions">
            <a href="#waitlist" className="primary-btn">Get Early Access</a>
            <a href="#screens" className="secondary-btn">View Screens</a>
          </div>

          <div className="stats">
            <div className="stat-card">
              <strong>Video</strong>
              <span>Pitch-first feed</span>
            </div>
            <div className="stat-card">
              <strong>Direct</strong>
              <span>Messaging & outreach</span>
            </div>
            <div className="stat-card">
              <strong>Trust</strong>
              <span>Verification-ready flow</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="phone-card large">
            <div className="phone-screen">
              <div className="screen-label">Feed</div>
              <div className="video-card">
                <div className="video-preview">
                  <div className="video-overlay">
                    <strong>SolarGrid AI</strong>
                    <span>Seeking seed capital</span>
                  </div>
                </div>
              </div>
              <div className="actions-row">
                <div>Like</div>
                <div>Discuss</div>
                <div>Message</div>
              </div>
            </div>
          </div>

          <div className="side-stack">
            <div className="phone-card small">
              <div className="phone-screen">
                <div className="screen-label">Messages</div>
                <div className="message-box">
                  <strong>Investor Outreach</strong>
                  <span>Let’s discuss your traction metrics.</span>
                </div>
                <div className="message-box message-box-accent">
                  <strong>Founder Reply</strong>
                  <span>I can share more detail on revenue and growth.</span>
                </div>
              </div>
            </div>

            <div className="trust-card">
              <span>Verification</span>
              <h3>Built with trust in mind</h3>
              <p>
                AngelPort is designed to support stronger accountability,
                verification flows, and serious business conversations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-head">
          <span>Features</span>
          <h3>Built for serious startup discovery</h3>
          <p>
            AngelPort combines modern pitch presentation with a more trustworthy,
            business-focused experience for founders and investors.
          </p>
        </div>

        <div className="grid four">
          <div className="feature-card">
            <h4>Video Pitch Feed</h4>
            <p>
              A modern, mobile-first feed where founders can present their
              opportunity clearly.
            </p>
          </div>
          <div className="feature-card">
            <h4>Investor Messaging</h4>
            <p>
              Direct conversations between founders and investors without messy
              outside workflows.
            </p>
          </div>
          <div className="feature-card">
            <h4>Comments & Discussion</h4>
            <p>
              Business-focused discussion around each pitch to support better
              decision-making.
            </p>
          </div>
          <div className="feature-card">
            <h4>Verification Flow</h4>
            <p>
              A trust-focused system designed to support identity and credibility
              as the platform grows.
            </p>
          </div>
        </div>
      </section>

      <section id="how" className="section section-alt">
        <div className="section-head">
          <span>How It Works</span>
          <h3>A cleaner path from pitch to conversation</h3>
        </div>

        <div className="grid three">
          <div className="step-card">
            <h4>1. Create a pitch</h4>
            <p>
              Founders publish a polished video pitch with summary, tags, and
              funding goals.
            </p>
          </div>
          <div className="step-card">
            <h4>2. Discover opportunities</h4>
            <p>
              Investors browse promising ventures and review opportunities in a
              modern feed.
            </p>
          </div>
          <div className="step-card">
            <h4>3. Start real conversations</h4>
            <p>
              When interest exists, both sides can move directly into messaging
              and discussion.
            </p>
          </div>
        </div>
      </section>

      <section id="screens" className="section">
        <div className="section-head">
          <span>Product Preview</span>
          <h3>A look at the AngelPort experience</h3>
          <p>
            A cleaner founder and investor workflow designed around discovery,
            discussion, messaging, and trust.
          </p>
        </div>

        <div className="screens-grid">
          <div className="screen-mock">
            <div className="mock-top">Feed</div>
            <div className="mock-body">
              <div className="mock-video" />
              <div className="mock-title">Founder video pitch</div>
              <div className="mock-text">Overview, traction, and funding goal.</div>
            </div>
          </div>

          <div className="screen-mock">
            <div className="mock-top">Discussion</div>
            <div className="mock-body">
              <div className="mock-comment">What are your customer acquisition costs?</div>
              <div className="mock-comment accent">We can share detailed numbers in message.</div>
            </div>
          </div>

          <div className="screen-mock">
            <div className="mock-top">Messages</div>
            <div className="mock-body">
              <div className="mock-message">Interested in learning more about your traction.</div>
              <div className="mock-message accent">Happy to send over more detail.</div>
            </div>
          </div>

          <div className="screen-mock">
            <div className="mock-top">Profile</div>
            <div className="mock-body">
              <div className="mock-avatar" />
              <div className="mock-title">Professional founder profile</div>
              <div className="mock-text">Role, bio, and credibility signals in one place.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="audience" className="section">
        <div className="grid two">
          <div className="audience-card">
            <span>For Founders</span>
            <h3>Present your vision professionally</h3>
            <p>
              Publish a strong video pitch, build your profile, and connect with
              investors who are actively exploring opportunities.
            </p>
            <ul>
              <li>Video-first startup presentation</li>
              <li>Clear funding goals and traction summary</li>
              <li>Direct investor outreach</li>
            </ul>
          </div>

          <div className="audience-card">
            <span>For Investors</span>
            <h3>Discover opportunities with more context</h3>
            <p>
              Explore startup opportunities through video, discussion, and direct
              messaging in a platform built for early-stage discovery.
            </p>
            <ul>
              <li>Browse founder pitches quickly</li>
              <li>Engage through discussion and messages</li>
              <li>Evaluate with stronger trust signals</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="waitlist" className="section">
        <div className="grid two waitlist-grid">
          <div className="waitlist-copy">
            <div className="pill small-pill">Join the Waitlist</div>
            <h3>Get early access to AngelPort</h3>
            <p>
              Join the launch list to hear about early access, onboarding, and
              product updates for both founders and investors.
            </p>

            <div className="waitlist-points">
              <div>Early access announcements</div>
              <div>Founder and investor onboarding updates</div>
              <div>Product launch news and feature releases</div>
            </div>
          </div>

          <div className="feature-card waitlist-card">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="waitlist-form">
                <div className="field-group">
                  <label>Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="waitlist-input"
                    required
                  />
                </div>

                <div className="field-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="waitlist-input"
                    required
                  />
                </div>

                <div className="field-group">
                  <label>I am joining as</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="waitlist-input"
                  >
                    <option>Founder</option>
                    <option>Investor</option>
                    <option>Both</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us what you're looking for"
                    rows="4"
                    className="waitlist-input"
                  />
                </div>

                {error ? <p className="waitlist-error">{error}</p> : null}

                <button type="submit" className="primary-btn full-btn" disabled={saving}>
                  {saving ? "Saving..." : "Join Waitlist"}
                </button>
              </form>
            ) : (
              <div className="success-box">
                <h4>You’re on the list.</h4>
                <p>Thanks. We’ll reach out with AngelPort updates soon.</p>
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setSubmitted(false);
                    setError("");
                  }}
                >
                  Add Another
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="cta">
        <h3>Start building better founder-investor connections</h3>
        <p>
          AngelPort is being built to make startup discovery more modern, more
          trustworthy, and more direct.
        </p>
        <div className="hero-actions center">
          <a href="#waitlist" className="primary-btn">Request Early Access</a>
          <a href="#contact" className="secondary-btn">Contact Us</a>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div>
          <strong>AngelPort</strong>
          <p>Founder & investor platform</p>
        </div>

        <div className="footer-links">
          <a href="#waitlist">Waitlist</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>

        <div>
          <strong>Email</strong>
          <p>sefadinegj@outlook.com</p>
        </div>
      </footer>
    </div>
  );
}