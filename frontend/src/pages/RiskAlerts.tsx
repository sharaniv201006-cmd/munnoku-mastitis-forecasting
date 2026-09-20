import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Prediction } from '../types';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, TrendingUp, Info } from 'lucide-react';

export const RiskAlerts = () => {
  const [alerts, setAlerts] = useState<Prediction[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.getAlerts().then(setAlerts);
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'ALL') return true;
    if (filter === 'DATA QUALITY') return alert.data_confidence === 'INSUFFICIENT';
    return alert.risk_level === filter;
  });

  const getAlertIcon = (level: string) => {
    if (level === 'HIGH') return <AlertCircle className="w-6 h-6 text-red-600" />;
    if (level === 'MODERATE') return <AlertTriangle className="w-6 h-6 text-amber-600" />;
    return <Info className="w-6 h-6 text-blue-600" />;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Alert Center</h2>
          <p className="text-gray-500 mt-1">Real-time model forecasting notifications</p>
        </div>
        
        <div className="flex space-x-2 bg-white rounded-lg p-1 border border-gray-200">
          {['ALL', 'HIGH', 'MODERATE', 'DATA QUALITY'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === f 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-500">
            No alerts matching your criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
              <div className={`w-2 ${
                alert.risk_level === 'HIGH' ? 'bg-red-500' :
                alert.risk_level === 'MODERATE' ? 'bg-amber-500' : 'bg-gray-300'
              }`}></div>
              
              <div className="p-6 flex-1 flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.risk_level)}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        {alert.animal_code || alert.animal_id}
                        <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          alert.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {alert.risk_level} RISK ({(alert.risk_probability * 100).toFixed(0)}%)
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Forecast Horizon: <span className="font-medium text-gray-700">{alert.forecast_horizon}</span>
                      </p>
                    </div>
                    <div className="text-sm text-gray-400 mt-2 sm:mt-0">
                      {new Date(alert.prediction_timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Main Contributing Factors:</p>
                    <ul className="space-y-2">
                      {alert.top_factors?.map((factor, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          {factor.direction === 'increasing' ? (
                            <TrendingUp className="w-4 h-4 text-red-500 mr-2" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-blue-500 mr-2 rotate-180" />
                          )}
                          <span className="font-medium mr-1">{factor.feature_name}</span> 
                          deviation: {factor.deviation > 0 ? '+' : ''}{factor.deviation.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800 mr-2">Action required:</span>
                      CMT / SCC / Veterinary verification
                    </p>
                    
                    <Link 
                      to={`/animals/${alert.animal_id}`}
                      className="mt-4 sm:mt-0 px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors text-center shadow-sm"
                    >
                      Open Animal Intelligence
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
