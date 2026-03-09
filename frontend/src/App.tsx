import { useAnalyzer } from './hooks/useAnalyzer'
import AnalyzerInput from './components/AnalyzerInput'
import BagResults from './components/BagResults'
import './App.css'

function App() {
  const {
    path, setPath,
    comparePaths, setComparePaths,
    showCompare, setShowCompare,
    data,
    error,
    loading,
    expandedTopic, setExpandedTopic,
    analyze,
    compare,
  } = useAnalyzer()

  const toggleTopic = (topic: string) => {
    setExpandedTopic(expandedTopic === topic ? null : topic)
  }

  return (
    <div className="container">
      <h1>ROS2 Bag Analyzer</h1>

      <AnalyzerInput
        path={path}
        onPathChange={setPath}
        comparePaths={comparePaths}
        onComparePathsChange={setComparePaths}
        showCompare={showCompare}
        onToggleCompare={() => setShowCompare(!showCompare)}
        loading={loading}
        onAnalyze={analyze}
        onCompare={compare}
      />

      {error && <div className="error">{error}</div>}

      {data?.bags && (
        <BagResults
          bags={data.bags}
          bagPath={path}
          expandedTopic={expandedTopic}
          onToggleTopic={toggleTopic}
        />
      )}
    </div>
  )
}

export default App
