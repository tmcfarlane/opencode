import './Hero.css'

function Hero() {
  return (
    <header className="hero">
      <div className="hero-content container">
        <div className="hero-badge">
          <span className="badge badge-info">Integration Analysis</span>
        </div>
        <h1 className="hero-title">
          Cursor Agent Integration
        </h1>
        <p className="hero-description">
          Comprehensive analysis and information center for the Cursor Agent integration with OpenCode.
          Compare architecture patterns, authentication flows, and feature parity with GitHub Copilot.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-value">CLI-Based</div>
            <div className="stat-label">Authentication</div>
          </div>
          <div className="stat">
            <div className="stat-value">Headless</div>
            <div className="stat-label">Mode Support</div>
          </div>
          <div className="stat">
            <div className="stat-value">Dynamic</div>
            <div className="stat-label">Model Discovery</div>
          </div>
          <div className="stat">
            <div className="stat-value">Local Proxy</div>
            <div className="stat-label">Architecture</div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Hero
