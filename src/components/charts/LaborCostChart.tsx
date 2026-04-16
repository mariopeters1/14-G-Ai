"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

export function LaborCostChart({ data }: { data: any[] }) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2D2D3A" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            yAxisId="left" 
            stroke="#9CA3AF" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `$${value/1000}k`}
          />
          <Tooltip 
            cursor={{fill: '#1F1F28'}} 
            contentStyle={{ backgroundColor: '#111116', border: '1px solid #2D2D3A', borderRadius: '8px', color: '#fff' }} 
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar yAxisId="left" dataKey="sales" name="Net Sales" fill="#1F1F28" radius={[4, 4, 0, 0]} />
          <Line yAxisId="left" type="monotone" dataKey="laborCost" name="Labor Cost" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
