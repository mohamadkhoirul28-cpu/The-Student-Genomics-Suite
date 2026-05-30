import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

interface BaseCompositionChartProps {
  composition: {
    A: number;
    C: number;
    G: number;
    T: number;
    other: number;
  };
}

export default function BaseCompositionChart({ composition }: BaseCompositionChartProps) {
  const barData = [
    { name: 'Adenine (A)', value: composition.A, color: '#22C55E' },  // Green
    { name: 'Cytosine (C)', value: composition.C, color: '#3B82F6' },  // Blue
    { name: 'Guanine (G)', value: composition.G, color: '#F59E0B' },  // Amber
    { name: 'Thymine (T)', value: composition.T, color: '#EF4444' }   // Red
  ];

  const gcContent = parseFloat((composition.G + composition.C).toFixed(1));
  const atContent = parseFloat((100 - gcContent - composition.other).toFixed(1));

  const pieData = [
    { name: 'GC Content', value: gcContent, color: '#14B8A6' }, // Teal-500
    { name: 'AT Content', value: atContent, color: '#F43F5E' }  // Rose-500
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Bar Chart for individual bases */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-800/40 shadow-xs">
        <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider mb-3">
          Base Frequency Composition (%)
        </h4>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F033" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
              <YAxis unit="%" tick={{ fontSize: 10 }} stroke="#94A3B8" />
              <Tooltip 
                formatter={(value: any) => [`${value}%`, 'Frequency']}
                contentStyle={{ 
                  borderRadius: '8px', 
                  fontSize: '11px',
                  background: '#0F172ACC', 
                  color: '#fff',
                  border: 'none'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={45}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Pie Chart for GC vs AT Content */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-800/40 shadow-xs">
        <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider mb-3">
          GC ratio vs AT Ratio
        </h4>
        <div className="h-60 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${value}%`, 'Composition']}
                contentStyle={{ 
                  borderRadius: '8px', 
                  fontSize: '11px',
                  background: '#0F172ACC', 
                  color: '#fff',
                  border: 'none'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
