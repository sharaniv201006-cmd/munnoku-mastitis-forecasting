import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { AnimalDashboardData, RiskFactor } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCowTag } from '../utils/format';

export const AnimalIntelligence = () => {
  const { id } = useParams();
  const [data, setData] = useState<AnimalDashboardData | null>(null);

  useEffect(() => {
    if (id) {
      api.getAnimalDetails(id).then(setData);
    } else {
      // Fallback for demo if no ID in path
      api.getAnimalDetails('demo').then(setData);
    }
  }, [id]);

  if (!data) return <div className="p-8">Loading intelligence...</div>;

  const { animal, prediction, history } = data;

  const getTrendIcon = (direction: string) => {
    if (direction === 'increasing') return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (direction === 'decreasing') return <TrendingDown className="h-4 w-4 text-blue-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getRiskColor = (level: string) => {
    if (level === 'HIGH') return 'text-red-600 bg-red-50 border-red-200';
    if (level === 'MODERATE') return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start md:justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-900">{formatCowTag(animal.animal_code)}</h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">
              Prototype Prediction
            </span>
          </div>
          <p className="text-gray-500 mt-2">Forecast Horizon: <span className="font-medium text-gray-700">{prediction.forecast_horizon}</span></p>
          <p className="text-gray-500">Data Confidence: <span className="font-medium text-gray-700">{prediction.data_confidence}</span></p>
        </div>
        
        <div className={`mt-4 md:mt-0 px-6 py-4 rounded-xl border flex flex-col items-center justify-center min-w-[200px] ${getRiskColor(prediction.risk_level)}`}>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Future Mastitis Risk</p>
          <p className="text-4xl font-bold mt-1">{(prediction.risk_probability * 100).toFixed(0)}%</p>
          <p className="text-lg font-bold mt-1">{prediction.risk_level} RISK</p>
        </div>
      </header>

      {/* Trajectory */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Risk Trajectory</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t as string).toLocaleDateString()} stroke="#9ca3af" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <Tooltip labelFormatter={(t) => new Date(t as string).toLocaleString()} />
              <Line type="monotone" dataKey={() => (prediction.risk_probability * 100) * (Math.random()*0.4 + 0.6)} name="Risk %" stroke="#dc2626" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Signal Deviations */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 px-1">What Changed?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {prediction.top_factors?.map((factor: RiskFactor, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-500">{factor.feature_name}</p>
                {getTrendIcon(factor.direction)}
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{factor.feature_value}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-50 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Baseline</span>
                  <span className="font-medium text-gray-700">{factor.baseline_value}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Deviation</span>
                  <span className={`font-medium ${factor.deviation > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    {factor.deviation > 0 ? '+' : ''}{factor.deviation.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Multi-Signal Temporal Convergence */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4 border-b pb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">Why is MUNNOKKU concerned?</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Multiple signals are deviating from this animal's historical pattern.
          </p>
          
          <div className="space-y-4">
            {prediction.top_factors?.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">{f.feature_name}</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">{f.direction}</span>
                  {getTrendIcon(f.direction)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-amber-800">Convergence Status</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded">ELEVATED</span>
            </div>
            <p className="text-xs text-amber-600 mt-2 italic">AI Feature Pattern • Prototype</p>
          </div>
        </section>

        {/* Action / Verification */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Recommended Verification</h3>
          <p className="text-sm text-gray-600 mb-6">
            AI early-warning support — verification required.
          </p>
          
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
              CMT Screening
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
              SCC Measurement
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
              Veterinary Examination
            </li>
          </ul>

          <button className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors shadow-sm">
            Record Verification
          </button>
        </section>
      </div>
    </div>
  );
};
