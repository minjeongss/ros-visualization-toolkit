import { COLORS } from '../constants'
import type { FirstMessageItem } from '../types'

interface TopicArrivalOrderProps {
  firstMessages: FirstMessageItem[]
  expandedTopic: string | null
  onToggleTopic: (topic: string) => void
}

function TopicArrivalOrder({ firstMessages, expandedTopic, onToggleTopic }: TopicArrivalOrderProps) {
  return (
    <div className="section">
      <h2>🚀 토픽별 도착 순서</h2>
      <div className="timing-section">
        <div className="timing-header">
          <span className="timing-col">순서</span>
          <span className="timing-col">토픽</span>
          <span className="timing-col">첫 도착</span>
          <span className="timing-col">마지막</span>
          <span className="timing-col">횟수</span>
        </div>
        <div className="timing-list">
          {firstMessages.map((item, i) => (
            <div
              key={item.topic}
              className={`timing-row ${expandedTopic === item.topic ? 'expanded' : ''}`}
              onClick={() => onToggleTopic(item.topic)}
            >
              <div className="timing-row-main">
                <span className="timing-col timing-num" style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</span>
                <span className="timing-col timing-topic">{item.topicShort}</span>
                <span className="timing-col timing-time">{item.firstTime!.toFixed(3)}s</span>
                <span className="timing-col timing-time">{item.lastTime!.toFixed(3)}s</span>
                <span className="timing-col timing-count">{item.totalCount.toLocaleString()}</span>
              </div>
              {expandedTopic === item.topic && (
                <div className="timing-detail">
                  <div className="timing-bar-wrapper">
                    <div
                      className="timing-bar"
                      style={{
                        width: '100%',
                        background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]} 0%, ${COLORS[i % COLORS.length]}33 100%)`,
                      }}
                    />
                  </div>
                  <div className="timing-stats">
                    <span>총 {item.totalCount.toLocaleString()}회</span>
                    <span>주기 {(item.lastTime! - item.firstTime!).toFixed(3)}s</span>
                    <span>평균 {item.totalCount > 1 ? ((item.lastTime! - item.firstTime!) / (item.totalCount - 1) * 1000).toFixed(1) : 0}ms</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TopicArrivalOrder
