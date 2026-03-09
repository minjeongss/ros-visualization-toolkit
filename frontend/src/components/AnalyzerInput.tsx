interface AnalyzerInputProps {
  path: string
  onPathChange: (value: string) => void
  comparePaths: string[]
  onComparePathsChange: (paths: string[]) => void
  showCompare: boolean
  onToggleCompare: () => void
  loading: boolean
  onAnalyze: () => void
  onCompare: () => void
}

function AnalyzerInput({
  path,
  onPathChange,
  comparePaths,
  onComparePathsChange,
  showCompare,
  onToggleCompare,
  loading,
  onAnalyze,
  onCompare,
}: AnalyzerInputProps) {
  return (
    <div className="input-section">
      <div className="input-row">
        <input
          type="text"
          value={path}
          onChange={(e) => onPathChange(e.target.value)}
          placeholder="Bag 파일 경로"
        />
        <button onClick={onAnalyze} disabled={loading} className="btn-primary">
          {loading ? '...' : '분석'}
        </button>
        <button onClick={onToggleCompare} className="btn-secondary">
          비교
        </button>
      </div>

      {showCompare && (
        <div className="input-row" style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={comparePaths[0]}
            onChange={(e) => onComparePathsChange([e.target.value, comparePaths[1]])}
            placeholder="Bag 경로 1"
          />
          <input
            type="text"
            value={comparePaths[1]}
            onChange={(e) => onComparePathsChange([comparePaths[0], e.target.value])}
            placeholder="Bag 경로 2"
          />
          <button onClick={onCompare} disabled={loading} className="btn-secondary">
            {loading ? '...' : '비교'}
          </button>
        </div>
      )}
    </div>
  )
}

export default AnalyzerInput
