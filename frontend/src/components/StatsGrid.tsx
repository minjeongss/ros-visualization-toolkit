import type { FirstMessageItem } from '../types'

interface StatsGridProps {
  messageCount: number
  duration: number
  topicCount: number
  firstMessage: FirstMessageItem | undefined
}

function StatsGrid({ messageCount, duration, topicCount, firstMessage }: StatsGridProps) {
  return (
    <div className="stats-grid">
      <div className="stat-box">
        <div className="stat-value">{messageCount.toLocaleString()}</div>
        <div className="stat-label">총 메시지</div>
      </div>
      <div className="stat-box">
        <div className="stat-value">{duration.toFixed(1)}s</div>
        <div className="stat-label">녹화 시간</div>
      </div>
      <div className="stat-box">
        <div className="stat-value">{topicCount}</div>
        <div className="stat-label">토픽 수</div>
      </div>
      <div className="stat-box">
        <div className="stat-value">{firstMessage?.firstTime?.toFixed(3) || 0}s</div>
        <div className="stat-label">첫 메시지</div>
      </div>
    </div>
  )
}

export default StatsGrid
