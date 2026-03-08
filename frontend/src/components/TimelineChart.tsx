import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { COLORS } from '../constants'
import type { TimelineEntry } from '../types'

interface TimelineChartProps {
  timelineData: TimelineEntry[]
  chartData: Record<string, string | number>[]
}

function TimelineChart({ timelineData, chartData }: TimelineChartProps) {
  return (
    <div className="section">
      <h2>⏱️ 타임라인</h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData}>
          <defs>
            {timelineData.map((td, i) => (
              <linearGradient key={td.topic} id={`gradient${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="time" stroke="#999" fontSize={10} label={{ value: '시간(초)', position: 'insideBottomRight', offset: -5 }} />
          <YAxis stroke="#999" fontSize={10} />
          <Tooltip />
          {timelineData.map((td, i) => (
            <Area
              key={td.topic}
              type="monotone"
              dataKey={td.topic}
              stroke={COLORS[i]}
              fill={`url(#gradient${i})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TimelineChart
