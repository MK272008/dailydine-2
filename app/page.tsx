import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card" aria-labelledby="welcome-heading">
        <header className="topbar">
          <strong className="brand">VentureX</strong>
          <Link className="button-link button-secondary" href="/auth">Sign in</Link>
        </header>
        <div className="home-hero">
          <div>
            <p className="eyebrow">Restaurant operations, without the chaos</p>
            <h1 id="welcome-heading">A calmer way to run service.</h1>
            <p className="muted">
              Manage your restaurant, menu, staff, and ordering experience from one clear workspace.
            </p>
            <div className="home-actions">
              <Link className="button-link" href="/auth">Get started</Link>
              <Link className="button-link button-secondary" href="/dashboard">Open dashboard</Link>
            </div>
          </div>
          <div className="home-promise panel">
            <span className="promise-icon">✦</span>
            <h2>Everything in its place</h2>
            <p className="muted">Your menu, team access, and service modes stay easy to find, even during a busy shift.</p>
          </div>
        </div>
        <div className="home-features">
          <div><strong>Simple sign-in</strong><span>Google or phone OTP</span></div>
          <div><strong>Team-ready</strong><span>Invite and approve staff</span></div>
          <div><strong>Menu control</strong><span>Update availability instantly</span></div>
        </div>
      </section>
    </main>
  );
}
