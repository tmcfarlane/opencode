import { useState } from 'react'
import './ArchitectureComparison.css'

type Integration = 'cursor' | 'copilot'

function ArchitectureComparison() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration>('cursor')

  const cursorArchitecture = {
    title: 'Cursor Agent Architecture',
    components: [
      { name: 'CursorAuthPlugin', description: 'Main plugin registration' },
      { name: 'CLI Binary Authentication', description: 'cursor-agent login via browser' },
      { name: 'Local Proxy Server', description: 'localhost:32123 OpenAI-compatible' },
      { name: 'Dynamic Model Discovery', description: 'agent models --list-models with 5min cache' },
      { name: 'Headless Support', description: 'Streaming JSON parsing for agent binary' },
      { name: 'Tool-calling Transformation', description: 'Prompt wrapping for tool support' },
    ],
    files: [
      { path: 'src/plugin/cursor.ts', lines: '~500 lines' },
      { path: 'test/plugin/cursor.test.ts', lines: 'Auth & error handling' },
      { path: 'test/plugin/cursor-headless.test.ts', lines: 'Stream parsing' },
    ]
  }

  const copilotArchitecture = {
    title: 'GitHub Copilot Architecture',
    components: [
      { name: 'CopilotAuthPlugin', description: 'Main plugin registration' },
      { name: 'OAuth Device Flow', description: 'github.com/login/device standard flow' },
      { name: 'Direct API Integration', description: 'No proxy needed, direct fetch' },
      { name: 'Static Model Definitions', description: 'From models-snapshot.ts' },
      { name: 'Enterprise Support', description: 'Custom domain configuration' },
      { name: 'Vision Detection', description: 'Automatic Copilot-Vision-Request header' },
      { name: 'Subagent Marking', description: 'x-initiator header for agent sessions' },
    ],
    files: [
      { path: 'src/plugin/copilot.ts', lines: '~400 lines' },
      { path: 'No test files', lines: '⚠️ Missing test coverage' },
    ]
  }

  const architecture = selectedIntegration === 'cursor' ? cursorArchitecture : copilotArchitecture

  return (
    <section id="architecture">
      <h2>Architecture Comparison</h2>
      <p>Deep dive into the architectural patterns and implementation details:</p>

      <div className="integration-toggle">
        <button
          className={`toggle-button ${selectedIntegration === 'cursor' ? 'active' : ''}`}
          onClick={() => setSelectedIntegration('cursor')}
        >
          Cursor Agent
        </button>
        <button
          className={`toggle-button ${selectedIntegration === 'copilot' ? 'active' : ''}`}
          onClick={() => setSelectedIntegration('copilot')}
        >
          GitHub Copilot
        </button>
      </div>

      <div className="architecture-content">
        <h3>{architecture.title}</h3>
        
        <div className="components-grid">
          {architecture.components.map((component, index) => (
            <div key={index} className="component-card">
              <h4>{component.name}</h4>
              <p>{component.description}</p>
            </div>
          ))}
        </div>

        <div className="files-section">
          <h4>Implementation Files</h4>
          <div className="files-list">
            {architecture.files.map((file, index) => (
              <div key={index} className="file-item">
                <code className="file-path">{file.path}</code>
                <span className="file-meta">{file.lines}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Common Patterns</h3>
        <ul>
          <li><strong>Plugin Registration:</strong> Both use internal plugin system with Hooks interface</li>
          <li><strong>Provider Integration:</strong> Both integrate with Provider system in src/provider/provider.ts</li>
          <li><strong>Auth Management:</strong> Both use Auth system for credential storage</li>
          <li><strong>Tool-calling:</strong> Both support tool-calling via prompt transformation</li>
          <li><strong>Streaming:</strong> Both support streaming responses</li>
        </ul>
      </div>
    </section>
  )
}

export default ArchitectureComparison
