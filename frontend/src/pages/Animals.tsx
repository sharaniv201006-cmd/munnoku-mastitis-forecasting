import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Animal, Prediction } from '../types';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCowTag } from '../utils/format';

export const Animals = () => {
  const [data, setData] = useState<{animal: Animal, prediction: Prediction}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  useEffect(() => {
    api.getAnimals().then(setData);
  }, []);

  const filteredData = data.filter(item => {
    const matchesSearch = item.animal.animal_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || item.prediction.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (level: string) => {
    if (level === 'HIGH') return 'bg-red-100 text-red-800 border-red-200';
    if (level === 'MODERATE') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getTrendIcon = (pred: Prediction) => {
    const highestFactor = pred.top_factors?.[0];
    if (!highestFactor) return <Minus className="w-4 h-4 text-gray-400" />;
    return highestFactor.direction === 'increasing' 
      ? <TrendingUp className="w-4 h-4 text-red-500" /> 
      : <TrendingDown className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Animal Registry</h2>
          <p className="text-gray-500 mt-1">Herd monitoring and forecasting overview</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary w-full sm:text-sm"
            />
          </div>
          
          <div className="relative flex items-center border border-gray-300 rounded-lg px-3 bg-white">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <select 
              value={filterRisk} 
              onChange={(e) => setFilterRisk(e.target.value)}
              className="py-2 border-none focus:ring-0 bg-transparent text-sm text-gray-700 outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
              <option value="NO RISK">No Risk</option>
            </select>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Animal ID</th>
                <th className="px-6 py-4 font-medium">Breed</th>
                <th className="px-6 py-4 font-medium">Age / Parity</th>
                <th className="px-6 py-4 font-medium">DIM</th>
                <th className="px-6 py-4 font-medium">Current Risk</th>
                <th className="px-6 py-4 font-medium">Probability</th>
                <th className="px-6 py-4 font-medium">Trend</th>
                <th className="px-6 py-4 font-medium">Data Confidence</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map(({animal, prediction}) => (
                <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCowTag(animal.animal_code)}</td>
                  <td className="px-6 py-4 text-gray-600">{animal.breed}</td>
                  <td className="px-6 py-4 text-gray-600">{animal.age_years} yrs / {animal.parity}</td>
                  <td className="px-6 py-4 text-gray-600">{animal.days_in_milk}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskColor(prediction.risk_level)}`}>
                      {prediction.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{(prediction.risk_probability * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4">{getTrendIcon(prediction)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${prediction.data_confidence === 'INSUFFICIENT' ? 'text-red-500' : 'text-gray-500'}`}>
                      {prediction.data_confidence}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/animals/${animal.id}`} className="text-primary hover:text-primary-dark font-medium transition-colors">
                      View Intelligence &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No animals found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
