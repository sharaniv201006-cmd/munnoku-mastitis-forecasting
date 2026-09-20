import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { HerdSummary, Prediction } from '../types';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export const HerdIntelligence = () => {
  const [summary, setSummary] = useState<HerdSummary | null>(null);
  const [alerts, setAlerts] = useState<Prediction[]>([]);

  useEffect(() => {
    api.getHerdSummary().then(setSummary);
    api.getAlerts().then(setAlerts);
  }, []);

  if (!summary) return <div className="p-8">Loading intelligence...</div>;

  const pieData = [
    { name: 'High Risk', value: summary.high_risk, color: '#dc2626' },
    { name: 'Moderate Risk', value: summary.moderate_risk, color: '#d97706' },
    { name: 'Low Risk', value: summary.low_risk > 10 ? 10 : summary.low_risk, color: '#16a34a' },
    { name: 'No Risk', value: summary.total_animals - summary.high_risk - summary.moderate_risk - (summary.low_risk > 10 ? 10 : summary.low_risk), color: '#d1fae5' },
  ];

  // Fake trend data for demonstration of herd risk trend
  const trendData = [
    { date: 'Mon', high: 1, mod: 2, low: 97 },
    { date: 'Tue', high: 1, mod: 3, low: 96 },
    { date: 'Wed', high: 2, mod: 3, low: 95 },
    { date: 'Thu', high: 2, mod: 4, low: 94 },
    { date: 'Fri', high: 1, mod: 4, low: 95 },
    { date: 'Sat', high: 1, mod: 5, low: 94 },
    { date: 'Sun', high: 1, mod: 4, low: 95 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">Herd Intelligence</h2>
        <p className="text-gray-500 mt-1">Understand emerging mastitis risk across the herd.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">Total Animals</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total_animals}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 border-l-4 border-l-red-500">
          <p className="text-xs font-medium text-red-600">High Risk</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.high_risk}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-amber-600">Moderate Risk</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.moderate_risk}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-blue-600">Rising Risk</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.rising_risk}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 border-l-4 border-l-green-500">
          <p className="text-xs font-medium text-green-600">Verified Events</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Herd Risk Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Herd Risk Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <RechartsTooltip />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="high" name="High Risk" stroke="#dc2626" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mod" name="Moderate Risk" stroke="#d97706" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Herd Risk Matrix */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Herd Risk Matrix</h3>
          <p className="text-sm text-gray-500 mt-1">
            Visual representation of AI feature signals and deviations. <span className="font-semibold text-amber-600">Note: Represents signal deviations, not clinical diagnosis.</span>
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Animal ID</th>
                <th className="px-4 py-3 text-center">EC</th>
                <th className="px-4 py-3 text-center">Milk Yield</th>
                <th className="px-4 py-3 text-center">Rumination</th>
                <th className="px-4 py-3 text-center">Activity</th>
                <th className="px-4 py-3 text-center">Temperature</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alerts.map(alert => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-semibold text-gray-900">Animal {alert.animal_id}</td>
                  
                  {/* Mock matrix values based on risk level */}
                  <td className="px-4 py-4 text-center">
                    <div className={`mx-auto w-4 h-4 rounded-full ${alert.risk_level === 'HIGH' ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`mx-auto w-4 h-4 rounded-full ${alert.risk_level === 'HIGH' ? 'bg-red-500' : alert.risk_level === 'MODERATE' ? 'bg-amber-400' : 'bg-gray-200'}`}></div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`mx-auto w-4 h-4 rounded-full ${alert.risk_level === 'HIGH' ? 'bg-amber-400' : 'bg-gray-200'}`}></div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`mx-auto w-4 h-4 rounded-full ${alert.risk_level === 'HIGH' ? 'bg-amber-400' : 'bg-gray-200'}`}></div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="mx-auto w-4 h-4 rounded-full bg-gray-200"></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link to={`/animals/${alert.animal_id}`} className="text-primary hover:text-primary-dark font-medium transition-colors">
                      Analyze
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end space-x-6 text-xs text-gray-500">
          <div className="flex items-center"><div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div> Normal</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-amber-400 rounded-full mr-2"></div> Increasing concern</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> High deviation</div>
        </div>
      </section>

      {/* Common Signal Changes */}
      <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Observed model feature patterns</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">EC</span>
            <span className="text-xs font-bold text-red-500">↑ Increasing</span>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Milk yield</span>
            <span className="text-xs font-bold text-blue-500">↓ Declining</span>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Rumination</span>
            <span className="text-xs font-bold text-blue-500">↓ Declining</span>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Activity</span>
            <span className="text-xs font-bold text-blue-500">↓ Declining</span>
          </div>
        </div>
      </section>

    </div>
  );
};
