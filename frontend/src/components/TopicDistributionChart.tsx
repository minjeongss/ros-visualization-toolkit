import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { COLORS } from '../constants'
import type { PieDataItem } from '../types'

interface TopicDistributionChartProps {
  data: PieDataItem[]
}

function TopicDistributionChart({ data }: TopicDistributionChartProps) {
  return (
    <div className="section">
      <h2>🥧 토픽 분포</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TopicDistributionChart
