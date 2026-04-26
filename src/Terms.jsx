import { Link } from "react-router-dom";
export default function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">← Back to Home</Link>
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: April 2026</p>

        <section>
          <h2>Overview</h2>
          <p>
            AngelPort is a platform intended to help founders and investors
            connect through startup discovery, messaging, and related tools.
          </p>
        </section>

        <section>
          <h2>Use of the Platform</h2>
          <p>
            By using AngelPort, you agree to use the platform lawfully and
            responsibly. You may not use the service for fraud, abuse,
            harassment, spam, or illegal activity.
          </p>
        </section>

        <section>
          <h2>User Content</h2>
          <p>
            Users are responsible for the accuracy and legality of the content
            they submit, including pitches, messages, profiles, and comments.
          </p>
        </section>

        <section>
          <h2>No Guarantee</h2>
          <p>
            AngelPort does not guarantee funding, investment outcomes, business
            results, or the accuracy of information provided by other users.
          </p>
        </section>

        <section>
          <h2>Accounts</h2>
          <p>
            We may suspend or remove accounts that violate these terms or harm
            the integrity of the platform.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            These terms may be updated over time as AngelPort develops and new
            features are released.
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