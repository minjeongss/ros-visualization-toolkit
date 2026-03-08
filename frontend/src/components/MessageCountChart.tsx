import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import type { Payload } from 'recharts/types/component/DefaultTooltipContent'
import { COLORS } from '../constants'
import type { MessageCountItem } from '../types'

interface MessageCountChartProps {
  data: MessageCountItem[]
}

function MessageCountChart({ data }: MessageCountChartProps) {
  const formatTooltip = (value: number, _name: string, props: Payload<number, string>) => {
    const payload = props.payload as MessageCountItem | undefined
    return [value.toLocaleString(), payload?.type ?? '']
  }

  return (
    <div className="section">
      <h2>📊 토픽별 메시지 수</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data.slice(0, 12)} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis type="number" stroke="#999" fontSize={11} />
          <YAxis dataKey="name" type="category" width={60} stroke="#999" fontSize={10} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            formatter={formatTooltip}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.fullName} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MessageCountChart
