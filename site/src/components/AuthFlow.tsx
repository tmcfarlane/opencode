import './AuthFlow.css'

function AuthFlow() {
  return (
    <section id="auth-flow">
      <h2>Authentication Flow</h2>
      
      <div className="flow-comparison">
        <div className="flow-card">
          <h3>Cursor Agent Flow</h3>
          <div className="flow-steps">
            <div className="flow-step">
              <div className="flow-step-number">1</div>
              <div className="flow-step-content">
                <strong>User initiates connection</strong>
                <p>Run <code>/connect</code> → select Cursor Agent</p>
              </div>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-step-number">2</div>
              <div className="flow-step-content">
                <strong>CLI binary check</strong>
                <p>Verify <code>cursor-agent --version</code> exists</p>
              </div>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-step-number">3</div>
              <div className="flow-step-content">
                <strong>Browser login</strong>
                <p><code>cursor-agent login</code> opens authentication page</p>
              </div>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-step-number">4</div>
              <div className="flow-step-content">
                <strong>Verification</strong>
                <p><code>cursor-agent whoami</code> confirms successful login</p>
              </div>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-step-number">5</div>
              <div className="flow-step-content">
                <strong>Proxy server start</strong>
                <p>Local server on <code>localhost:32123</code> for API compatibility</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flow-card">
          <h3>GitHub Copilot Flow</h3>
          <div className="flow-steps">
            <div className="flow-step">
              <div className="flow-step-number">1</div>
              <div className="flow-step-content">
                <strong>User initiates connection</strong>
                <p>Run <code>/connect</code> → select GitHub Copilot</p>
              </div>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-step-number">2</div>
              <div className="flow-step-content">
                <strong>Device code generation</strong>
                <p>GitHub generates unique device code</p>
              </div>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-step-number">3</div>
              <div className="flow-step-content">
                <strong>User authorization</strong>
                <p>Navigate to <code>github.com/login/device</code> and enter code</p>
              </div>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-step-number">4</div>
              <div className="flow-step-content">
                <strong>Token polling</strong>
                <p>OpenCode polls GitHub for authorization completion</p>
              </div>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-step-number">5</div>
              <div className="flow-step-content">
                <strong>Token storage</strong>
                <p>Access + refresh tokens stored securely in Auth system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Key Differences</h3>
        <ul>
          <li><strong>Cursor:</strong> CLI binary handles authentication entirely, OpenCode just invokes it</li>
          <li><strong>Copilot:</strong> OpenCode implements full OAuth device flow directly</li>
          <li><strong>Cursor:</strong> Requires local proxy server for API compatibility</li>
          <li><strong>Copilot:</strong> Direct API integration with no proxy needed</li>
          <li><strong>Cursor:</strong> Headless mode via <code>agent</code> binary or <code>CURSOR_API_KEY</code></li>
          <li><strong>Copilot:</strong> Headless mode via stored refresh tokens</li>
        </ul>
      </div>
    </section>
  )
}

export default AuthFlow
