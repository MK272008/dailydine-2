import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card showcase" aria-labelledby="welcome-heading">
        <header className="topbar">
          <Link className="brand" href="/">VentureX<span className="brand-dot">.</span></Link>
          <nav className="site-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#workflow">How it works</a>
            <Link className="button-link button-secondary" href="/auth">Sign in</Link>
          </nav>
        </header>

        <div className="home-hero">
          <div>
            <div className="announcement"><span>New</span> One workspace for your whole restaurant</div>
            <p className="eyebrow">Restaurant operations, without the chaos</p>
            <h1 id="welcome-heading">Make every service feel <em>effortless.</em></h1>
            <p className="muted">VentureX brings your menu, team, restaurant settings, and ordering foundation into one calm, modern workspace.</p>
            <div className="home-actions">
              <Link className="button-link" href="/auth">Get started</Link>
              <a className="text-link" href="#features">Explore features <span aria-hidden="true">→</span></a>
            </div>
          </div>
          <div className="product-preview" aria-label="VentureX dashboard preview">
            <div className="preview-topbar"><span className="preview-brand">VentureX</span><span className="preview-avatar">AM</span></div>
            <div className="preview-greeting"><span>Good morning, Aanya</span><strong>Saturday, 12 Oct</strong></div>
            <div className="preview-select">The Green Table <span>⌄</span></div>
            <div className="preview-metrics"><div><span>Menu items</span><strong>24</strong><small>+4 this week</small></div><div><span>Active staff</span><strong>08</strong><small>All covered</small></div></div>
            <div className="preview-card"><div className="preview-card-heading"><strong>Today&apos;s service</strong><span className="preview-live">Live</span></div><div className="preview-service-row"><span className="service-icon">M</span><span><strong>Lunch menu</strong><small>12 items available</small></span><i /></div><div className="preview-service-row"><span className="service-icon orange">T</span><span><strong>Takeaway</strong><small>Open until 10:00 PM</small></span><i /></div></div>
          </div>
        </div>

        <div className="trust-strip"><span>BUILT FOR THE PEOPLE BEHIND THE TABLE</span><span>Small teams. Big hospitality.</span><span>Clear tools. Better service.</span></div>

        <section id="features" className="showcase-section">
          <div className="section-intro"><p className="eyebrow">Everything you need</p><h2>Less admin. More hospitality.</h2><p className="muted">The essentials are organized around the moments that matter in a busy restaurant.</p></div>
          <div className="feature-grid">
            <article className="feature-card"><span className="feature-icon feature-icon-coral">01</span><h3>One simple login</h3><p>Sign in with Google or phone OTP, then link both methods to keep your account secure and flexible.</p><span className="feature-tag">Authentication</span></article>
            <article className="feature-card"><span className="feature-icon feature-icon-blue">02</span><h3>Your restaurant, your rules</h3><p>Set up locations, tables, tax, fulfillment modes, and pre-order windows without digging through settings.</p><span className="feature-tag">Configuration</span></article>
            <article className="feature-card"><span className="feature-icon feature-icon-green">03</span><h3>Keep your team in sync</h3><p>Invite employees with a one-time QR code, review requests, and revoke access instantly when roles change.</p><span className="feature-tag">Team access</span></article>
            <article className="feature-card"><span className="feature-icon feature-icon-purple">04</span><h3>Menus that stay fresh</h3><p>Create categories and items, add descriptions and prices, then hide sold-out dishes in one click.</p><span className="feature-tag">Menu management</span></article>
            <article className="feature-card"><span className="feature-icon feature-icon-yellow">05</span><h3>Ready for every order</h3><p>Prepare your service for dine-in, takeaway, and same-day pre-orders from one clear control panel.</p><span className="feature-tag">Fulfillment</span></article>
            <article className="feature-card"><span className="feature-icon feature-icon-slate">06</span><h3>Built to grow with you</h3><p>Start with a clean operational core and add QR ordering, tables, payments, and customer journeys as you grow.</p><span className="feature-tag">Your foundation</span></article>
          </div>
        </section>

        <section id="workflow" className="workflow-section">
          <div className="section-intro"><p className="eyebrow">Start in minutes</p><h2>From setup to service.</h2></div>
          <div className="workflow-grid"><div><span className="step-number">1</span><h3>Create your workspace</h3><p className="muted">Sign in, complete your profile, and add your restaurant.</p></div><div><span className="step-number">2</span><h3>Shape your operation</h3><p className="muted">Add menu items, choose service modes, and invite your team.</p></div><div><span className="step-number">3</span><h3>Run the shift</h3><p className="muted">Keep availability current and let your staff work with confidence.</p></div></div>
        </section>

        <section className="final-cta"><div><p className="eyebrow">Your next service starts here</p><h2>Make the busy days feel lighter.</h2></div><Link className="button-link" href="/auth">Start with VentureX <span aria-hidden="true">→</span></Link></section>
        <footer className="site-footer"><span>VentureX</span><span>Restaurant operations, made human.</span><Link href="/auth">Sign in</Link></footer>
      </section>
    </main>
  );
}
