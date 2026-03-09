import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { COLORS } from '../constants'
import type { Topic } from '../types'

interface TopicPlaybackProps {
  duration: number
  topicTimeline: Record<string, number[]>
  topics: Topic[]
}

function countUpTo(times: number[], t: number): number {
  let lo = 0
  let hi = times.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (times[mid] <= t) lo = mid + 1
    else hi = mid
  }
  return lo
}

function TopicPlayback({ duration, topicTimeline, topics }: TopicPlaybackProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)

  const sortedTopics = useMemo(() => {
    return topics
      .map(t => {
        const times = topicTimeline[t.name] || []
        return {
          ...t,
          times,
          firstTime: times.length > 0 ? times[0] : Infinity,
        }
      })
      .sort((a, b) => a.firstTime - b.firstTime)
  }, [topics, topicTimeline])

  const tick = useCallback((timestamp: number) => {
    if (lastFrameRef.current === 0) {
      lastFrameRef.current = timestamp
    }
    const delta = (timestamp - lastFrameRef.current) / 1000
    lastFrameRef.current = timestamp

    setCurrentTime(prev => {
      const next = prev + delta * speed
      if (next >= duration) {
        setIsPlaying(false)
        return duration
      }
      return next
    })

    rafRef.current = requestAnimationFrame(tick)
  }, [speed, duration])

  useEffect(() => {
    if (isPlaying) {
      lastFrameRef.current = 0
      rafRef.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(rafRef.current)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, tick])

  const togglePlay = () => {
    if (currentTime >= duration) {
      setCurrentTime(0)
    }
    setIsPlaying(p => !p)
  }

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value))
  }

  const speeds = [1, 2, 5, 10]
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="section">
      <h2>Bag Playback</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button
          className="btn-primary"
          onClick={togglePlay}
          style={{ minWidth: 52, padding: '6px 14px', fontSize: '0.8rem' }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div style={{ display: 'flex', gap: 4 }}>
          {speeds.map(s => (
            <button
              key={s}
              className={speed === s ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setSpeed(s)}
              style={{ padding: '4px 10px', fontSize: '0.7rem', minWidth: 0 }}
            >
              {s}x
            </button>
          ))}
        </div>

        <span style={{
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--primary)',
          minWidth: 80,
        }}>
          {currentTime.toFixed(2)}s
        </span>

        <span style={{
          fontSize: '0.7rem',
          color: 'var(--text-light)',
        }}>
          / {duration.toFixed(1)}s
        </span>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${progress}%`,
          background: 'var(--primary)',
          borderRadius: 4,
          opacity: 0.15,
          pointerEvents: 'none',
          transition: isPlaying ? 'none' : 'width 0.1s',
        }} />
        <input
          type="range"
          min={0}
          max={duration}
          step={Math.max(duration / 1000, 0.01)}
          value={currentTime}
          onChange={handleScrub}
          style={{
            width: '100%',
            cursor: 'pointer',
            accentColor: 'var(--primary)',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sortedTopics.map((topic, i) => {
          const appeared = currentTime >= topic.firstTime
          const msgCount = appeared ? countUpTo(topic.times, currentTime) : 0
          const fillPct = topic.times.length > 0 ? (msgCount / topic.times.length) * 100 : 0
          const color = COLORS[i % COLORS.length]

          return (
            <div
              key={topic.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 1fr',
                gap: 10,
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 8,
                background: appeared ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.02)',
                opacity: appeared ? 1 : 0.35,
                transition: 'all 0.2s',
                ...(appeared && topic.firstTime > 0 && currentTime - topic.firstTime < 0.5 ? {
                  animation: 'fadeIn 0.25s ease-out',
                } : {}),
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: appeared ? 600 : 400,
                  color: appeared ? 'var(--text)' : 'var(--text-light)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: appeared ? color : 'var(--text-light)',
                    marginRight: 8,
                    verticalAlign: 'middle',
                    transition: 'background 0.2s',
                  }} />
                  {topic.name}
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-light)',
                  fontFamily: 'monospace',
                  marginTop: 1,
                  marginLeft: 16,
                }}>
                  {topic.type.split('/').pop()}
                </div>
              </div>

              <div style={{
                textAlign: 'right',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: appeared ? 'var(--primary)' : 'var(--text-light)',
              }}>
                {msgCount.toLocaleString()} / {topic.count.toLocaleString()}
              </div>

              <div style={{
                height: 6,
                background: 'rgba(0,0,0,0.05)',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${fillPct}%`,
                  background: appeared
                    ? `linear-gradient(90deg, ${color}, ${color}88)`
                    : 'transparent',
                  borderRadius: 3,
                  transition: isPlaying ? 'none' : 'width 0.1s',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TopicPlayback
