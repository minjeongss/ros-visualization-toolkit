import type { Topic, BagData } from '../types'

interface TopicDetailListProps {
  topics: Topic[]
  bag: BagData
  expandedTopic: string | null
  onToggleTopic: (topic: string) => void
}

function TopicDetailList({ topics, bag, expandedTopic, onToggleTopic }: TopicDetailListProps) {
  return (
    <div className="section">
      <h2>📋 토픽 상세</h2>
      <div className="detail-section">
        {topics.filter(t => t.count > 0).map((topic) => (
          <div
            key={topic.name}
            className={`detail-card ${expandedTopic === topic.name ? 'expanded' : ''}`}
            onClick={() => onToggleTopic(topic.name)}
          >
            <div className="detail-header">
              <div className="detail-title">
                <span className="detail-name">{topic.name}</span>
                <span className="detail-type">{topic.type}</span>
              </div>
              <div className="detail-right">
                <span className="detail-count">{topic.count.toLocaleString()}</span>
                <span className="detail-arrow">{expandedTopic === topic.name ? '▲' : '▼'}</span>
              </div>
            </div>
            {expandedTopic === topic.name && (
              <div className="detail-body">
                <div className="detail-row">
                  <span className="detail-label">메시지 수</span>
                  <span className="detail-value">{topic.count.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">예상 주기</span>
                  <span className="detail-value">{topic.count > 0 ? (bag.duration / topic.count * 1000).toFixed(2) + 'ms' : 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">토픽 타입</span>
                  <span className="detail-value">{topic.type}</span>
                </div>
                <div className="detail-messages">
                  <span className="detail-label">메시지 샘플</span>
                  {bag.topic_sample_messages?.[topic.name]?.length > 0 ? (
                    <pre className="message-content">{bag.topic_sample_messages[topic.name][0]}</pre>
                  ) : (
                    <div className="no-message">샘플 없음</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopicDetailList
