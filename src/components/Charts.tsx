import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts"

type Props = {
  dataDia: any[]
}

export default function Charts({ dataDia }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-1 mt-8 pb-10">

      {/* Ventas y Ganancia por día */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
        <h2 className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest">Rendimiento Diario</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataDia}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="fecha" stroke="#9CA3AF" fontSize={12} tickMargin={10} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              itemStyle={{ color: '#10B981' }}
            />
            <Line type="monotone" dataKey="ventas" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Unidades" />
            <Line type="monotone" dataKey="ganancia" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Ganancia $" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}