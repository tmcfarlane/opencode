import { useState } from 'react'
import './FeatureMatrix.css'

type FeatureStatus = '✓' | '✗' | 'Partial'

interface Feature {
  category: string
  feature: string
  cursor: FeatureStatus
  copilot: FeatureStatus
  notes?: string
}

const features: Feature[] = [
  { category: 'Authentication', feature: 'OAuth device flow', cursor: '✗', copilot: '✓', notes: 'Cursor uses CLI binary login only' },
  { category: 'Authentication', feature: 'Enterprise deployment', cursor: '✗', copilot: '✓', notes: 'Cursor has no enterprise domain support' },
  { category: 'Authentication', feature: 'Headless auth support', cursor: '✓', copilot: '✓' },
  { category: 'Model Management', feature: 'Static model list', cursor: '✗', copilot: '✓' },
  { category: 'Model Management', feature: 'Dynamic model discovery', cursor: '✓', copilot: '✗', notes: 'Cursor discovers models via CLI' },
  { category: 'Model Management', feature: 'Model caching', cursor: '✓', copilot: '✗', notes: '5-minute TTL' },
  { category: 'API Compatibility', feature: 'Direct API integration', cursor: '✗', copilot: '✓', notes: 'Cursor requires local proxy' },
  { category: 'API Compatibility', feature: 'Proxy server needed', cursor: '✓', copilot: '✗' },
  { category: 'Advanced Features', feature: 'Vision detection', cursor: '✗', copilot: '✓', notes: 'Critical gap' },
  { category: 'Advanced Features', feature: 'Subagent marking', cursor: '✗', copilot: '✓', notes: 'x-initiator header' },
  { category: 'Advanced Features', feature: 'Tool-calling support', cursor: '✓', copilot: '✓' },
  { category: 'Advanced Features', feature: 'Streaming', cursor: '✓', copilot: '✓' },
  { category: 'Testing', feature: 'Auth tests', cursor: '✓', copilot: '✗' },
  { category: 'Testing', feature: 'Error handling tests', cursor: '✓', copilot: '✗' },
  { category: 'Testing', feature: 'Headless mode tests', cursor: '✓', copilot: '✗' },
]

function FeatureMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  
  const categories = ['All', ...Array.from(new Set(features.map(f => f.category)))]
  const filteredFeatures = selectedCategory === 'All' 
    ? features 
    : features.filter(f => f.category === selectedCategory)

  const getStatusIcon = (status: FeatureStatus) => {
    switch (status) {
      case '✓': return <span className="status-icon success">✓</span>
      case '✗': return <span className="status-icon error">✗</span>
      case 'Partial': return <span className="status-icon warning">~</span>
    }
  }

  return (
    <section id="feature-matrix">
      <h2>Feature Comparison Matrix</h2>
      <p>Comprehensive comparison between Cursor Agent and GitHub Copilot integrations:</p>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="feature-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Feature</th>
              <th>Cursor Agent</th>
              <th>GitHub Copilot</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.map((feature, index) => (
              <tr key={index}>
                <td className="category-cell">{feature.category}</td>
                <td className="feature-cell">{feature.feature}</td>
                <td className="status-cell">{getStatusIcon(feature.cursor)}</td>
                <td className="status-cell">{getStatusIcon(feature.copilot)}</td>
                <td className="notes-cell">{feature.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="status-icon success">✓</span>
          <span>Supported</span>
        </div>
        <div className="legend-item">
          <span className="status-icon error">✗</span>
          <span>Not Supported</span>
        </div>
        <div className="legend-item">
          <span className="status-icon warning">~</span>
          <span>Partial Support</span>
        </div>
      </div>
    </section>
  )
}

export default FeatureMatrix
