import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { HerdSummary, Prediction } from '../types';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export const Overview = () => {
  const [summary, setSummary] = useState<HerdSummary | null>(null);
  const [alerts, setAlerts] = useState<Prediction[]>([]);

  useEffect(() => {
    api.getHerdSummary().then(setSummary);
    api.getAlerts().then(setAlerts);
  }, []);

  if (!summary) return <div className="p-8">Loading...</div>;

  const pieData = [
    { name: 'High Risk', value: summary.high_risk, color: '#dc2626' },
    { name: 'Moderate Risk', value: summary.moderate_risk, color: '#d97706' },
    { name: 'Low/No Risk', value: summary.low_risk, color: '#16a34a' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">Good Morning</h2>
        <p className="text-gray-500 mt-1">Farm Health Intelligence</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Animals</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total_animals}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-red-600">High Risk</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary.high_risk}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-amber-600">Moderate Risk</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary.moderate_risk}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-green-600">Low / No Risk</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary.low_risk}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Animals</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Animal</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Probability</th>
                  <th className="px-4 py-3">Main Signal</th>
                  <th className="px-4 py-3 rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {/* Assuming animal code is passed or we fetch it. Using ID here for demo. */}
                      COW-027
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' :
                        alert.risk_level === 'MODERATE' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-4">{(alert.risk_probability * 100).toFixed(1)}%</td>
                    <td className="px-4 py-4 text-gray-500">
                      {alert.top_factors?.[0]?.feature_name || 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <Link to={`/animals/${alert.animal_id}`} className="text-primary hover:text-primary-dark font-medium">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
