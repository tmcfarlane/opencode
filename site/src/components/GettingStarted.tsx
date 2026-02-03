import './GettingStarted.css'

function GettingStarted() {
  return (
    <section id="getting-started">
      <h2>Getting Started</h2>
      <p>Follow these steps to integrate Cursor Agent with OpenCode:</p>

      <div className="steps">
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Install Cursor CLI</h3>
            <p>First, ensure you have the Cursor CLI installed on your system.</p>
            <pre><code>cursor --version</code></pre>
          </div>
        </div>

        <div className="step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Connect to OpenCode</h3>
            <p>Run the connect command and select Cursor Agent from the list:</p>
            <pre><code>/connect</code></pre>
          </div>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Login via Browser</h3>
            <p>The CLI will open a browser window for authentication. Complete the login flow.</p>
            <pre><code>cursor-agent login</code></pre>
          </div>
        </div>

        <div className="step">
          <div className="step-number">4</div>
          <div className="step-content">
            <h3>Select a Model</h3>
            <p>Run the models command and choose a <code>cursor/*</code> model:</p>
            <pre><code>/models</code></pre>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Headless Mode</h3>
        <p>
          For non-interactive/headless scripting, OpenCode can use the <code>agent</code> binary once you are authenticated. 
          <code>CURSOR_API_KEY</code> also works for automation.
        </p>
        <p>
          OpenCode prefers the <code>agent</code> binary for headless mode and falls back to <code>cursor-agent</code> when needed.
        </p>
      </div>
    </section>
  )
}

export default GettingStarted
