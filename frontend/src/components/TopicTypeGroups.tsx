import type { Topic } from '../types'

interface TopicTypeGroupsProps {
  groupedTopics: Record<string, Topic[]>
  expandedTopic: string | null
  onToggleTopic: (topic: string) => void
}

function TopicTypeGroups({ groupedTopics, expandedTopic, onToggleTopic }: TopicTypeGroupsProps) {
  return (
    <div className="section">
      <h2>💬 타입별 토픽</h2>
      <div className="type-section">
        {Object.entries(groupedTopics).map(([type, topics]) => (
          <div key={type} className="type-group">
            <div className="type-header">
              <span className="type-name">{type}</span>
              <span className="type-count">{topics.length}개</span>
            </div>
            <div className="topic-items">
              {topics.map(t => (
                <div
                  key={t.name}
                  className={`topic-item ${expandedTopic === t.name ? 'expanded' : ''}`}
                  onClick={() => onToggleTopic(t.name)}
                >
                  <span className="topic-name">{t.name}</span>
                  <span className="topic-count">{t.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopicTypeGroups
