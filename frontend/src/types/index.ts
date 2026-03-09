export interface Topic {
  name: string
  type: string
  count: number
}

export interface BagData {
  message_count: number
  duration: number
  topics: Topic[]
  topic_timeline: Record<string, number[]>
  topic_sample_messages: Record<string, string[]>
}

export interface AnalyzeResponse {
  type: string
  bags: BagData[]
  error?: string
}

export interface MessageCountItem {
  name: string
  fullName: string
  count: number
  type: string
}

export interface PieDataItem {
  name: string
  value: number
}

export interface TimelineBucket {
  time: string
  count: number
}

export interface TimelineEntry {
  topic: string
  fullTopic: string
  buckets: TimelineBucket[]
}

export interface FirstMessageItem {
  topic: string
  topicShort: string
  firstTime: number | null
  lastTime: number | null
  totalCount: number
}
