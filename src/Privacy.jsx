import { Link } from "react-router-dom";
export default function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">← Back to Home</Link>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: April 2026</p>

        <section>
          <h2>Overview</h2>
          <p>
            AngelPort collects information you provide to help founders and investors
            connect through the platform. This includes information submitted through
            the website, waitlist form, and app features.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <p>We may collect:</p>
          <ul>
            <li>Name and email address</li>
            <li>Founder or investor role selection</li>
            <li>Messages you submit through forms</li>
            <li>Profile information, pitches, comments, and app content</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Information</h2>
          <ul>
            <li>To manage waitlist signups</li>
            <li>To contact users about product updates and access</li>
            <li>To operate platform features and user accounts</li>
            <li>To improve trust, security, and platform performance</li>
          </ul>
        </section>

        <section>
          <h2>Storage and Services</h2>
          <p>
            AngelPort may use third-party infrastructure providers for hosting,
            authentication, storage, and email communication.
          </p>
        </section>

        <section>
          <h2>User Content</h2>
          <p>
            Content you upload or submit, including profiles, pitches, messages,
            and comments, may be stored to provide the platform experience.
          </p>
        </section>

        <section>
          <h2>Your Choices</h2>
          <p>
            You may request account deletion or ask questions about your information
            by contacting us.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>Email: sefadinegj@outlook.com</p>
        </section>
      </div>
    </div>
  );
}