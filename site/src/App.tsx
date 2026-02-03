import Hero from './components/Hero'
import FeatureMatrix from './components/FeatureMatrix'
import GettingStarted from './components/GettingStarted'
import ArchitectureComparison from './components/ArchitectureComparison'
import AuthFlow from './components/AuthFlow'
import GapAnalysis from './components/GapAnalysis'
import './App.css'

function App() {
  return (
    <div className="app">
      <Hero />
      <main className="container">
        <GettingStarted />
        <FeatureMatrix />
        <ArchitectureComparison />
        <AuthFlow />
        <GapAnalysis />
      </main>
      <footer className="footer">
        <div className="container">
          <p>
            OpenCode Cursor Agent Integration • {new Date().getFullYear()} •{' '}
            <a href="https://github.com/opencode-ai/opencode" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
