import './GapAnalysis.css'

interface Gap {
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  integration: 'cursor' | 'copilot' | 'both'
  description: string
  recommendation: string
}

const gaps: Gap[] = [
  {
    title: 'Cursor Missing Vision Support',
    severity: 'critical',
    integration: 'cursor',
    description: 'Copilot detects vision requests via message content inspection and sets Copilot-Vision-Request header. Cursor has no equivalent capability.',
    recommendation: 'Implement vision detection in Cursor proxy to inspect message content and set appropriate headers for models that support image inputs.'
  },
  {
    title: 'Cursor Missing Subagent Session Marking',
    severity: 'high',
    integration: 'cursor',
    description: 'Copilot marks agent-initiated requests with x-initiator: agent header to distinguish from user-initiated requests. This enables better analytics and debugging.',
    recommendation: 'Add session hierarchy detection in Cursor proxy to set x-initiator header when requests come from subagent sessions.'
  },
  {
    title: 'Copilot Missing Test Coverage',
    severity: 'high',
    integration: 'copilot',
    description: 'Cursor has comprehensive test files (cursor.test.ts, cursor-headless.test.ts) while Copilot has NO dedicated test files for auth flows, error handling, or streaming.',
    recommendation: 'Create copilot.test.ts with tests for OAuth device flow, token refresh, enterprise domains, vision detection, and error scenarios.'
  },
  {
    title: 'Cursor Proxy Server Complexity',
    severity: 'medium',
    integration: 'cursor',
    description: 'Local proxy server adds process management complexity, port allocation issues (EADDRINUSE), and state management (globalThis for server instance).',
    recommendation: 'Consider direct API integration if Cursor provides API endpoints, or improve proxy error handling and recovery mechanisms.'
  },
  {
    title: 'Copilot Missing Dynamic Model Discovery',
    severity: 'medium',
    integration: 'copilot',
    description: 'Copilot relies on static model definitions from models-snapshot.ts, while Cursor dynamically discovers models via agent models --list-models.',
    recommendation: 'Implement dynamic model discovery from Copilot API if available, with fallback to static definitions. Add 5-minute caching like Cursor.'
  },
  {
    title: 'Inconsistent Documentation',
    severity: 'low',
    integration: 'both',
    description: 'Documentation in providers.mdx lacks details on vision capabilities, subagent behavior, model cost implications, and rate limiting.',
    recommendation: 'Expand documentation with: vision capability requirements per model, subagent behavior differences, cost breakdowns, and rate limit guidance.'
  }
]

function GapAnalysis() {
  const getSeverityBadge = (severity: Gap['severity']) => {
    const classMap = {
      critical: 'badge-error',
      high: 'badge-warning',
      medium: 'badge-info',
      low: 'badge-success'
    }
    return <span className={`badge ${classMap[severity]}`}>{severity.toUpperCase()}</span>
  }

  const getIntegrationLabel = (integration: Gap['integration']) => {
    const labelMap = {
      cursor: 'Cursor Agent',
      copilot: 'GitHub Copilot',
      both: 'Both Integrations'
    }
    return labelMap[integration]
  }

  return (
    <section id="gap-analysis">
      <h2>Gap Analysis & Recommendations</h2>
      <p>Identified gaps and actionable recommendations for improving both integrations:</p>

      <div className="gaps-container">
        {gaps.map((gap, index) => (
          <div key={index} className="gap-card">
            <div className="gap-header">
              <h3>{gap.title}</h3>
              <div className="gap-meta">
                {getSeverityBadge(gap.severity)}
                <span className="integration-label">{getIntegrationLabel(gap.integration)}</span>
              </div>
            </div>
            <div className="gap-content">
              <div className="gap-section">
                <h4>Description</h4>
                <p>{gap.description}</p>
              </div>
              <div className="gap-section">
                <h4>Recommendation</h4>
                <p>{gap.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Summary</h3>
        <p>
          The Cursor integration is more <strong>complex</strong> (proxy server architecture) but{' '}
          <strong>better tested</strong> and has <strong>dynamic model discovery</strong>. 
          The GitHub Copilot integration is more <strong>straightforward</strong> (direct API) but{' '}
          <strong>missing tests</strong> and has <strong>more sophisticated request routing</strong>{' '}
          (vision detection, subagent marking, enterprise support).
        </p>
        <h4>Priority Actions</h4>
        <ol>
          <li>Add vision support to Cursor proxy (critical gap)</li>
          <li>Implement comprehensive test suite for Copilot (high priority)</li>
          <li>Add subagent marking to Cursor (improves observability)</li>
          <li>Consider shared utilities for OAuth refresh patterns</li>
        </ol>
      </div>
    </section>
  )
}

export default GapAnalysis
