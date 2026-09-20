import { BrainCircuit, Database, LineChart, TrendingUp, Cpu, CheckSquare, RefreshCw } from 'lucide-react';

export const ModelIntelligence = () => {
  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <header className="text-center py-6">
        <h2 className="text-3xl font-bold text-gray-900">How MUNNOKKU Forecasts Risk</h2>
        <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
          We use individualized temporal baselines rather than global thresholds to catch subtle, coordinated multi-signal deviations early.
        </p>
      </header>

      {/* Warning Alert */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-amber-500 text-xl font-bold">!</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">Prototype ML — longitudinal field validation pending</h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>This UI is powered by synthetic prototype data. Meaningful 7–14 day lead-time validation requires real longitudinal field data.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center space-y-4">
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-800">DATA</h4>
            <p className="text-xs text-gray-500 text-center mt-1">Multi-sensor ingestion</p>
          </div>

          <div className="w-1 bg-gray-200 h-8"></div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
              <LineChart className="w-8 h-8 text-indigo-600" />
            </div>
            <h4 className="font-bold text-gray-800">INDIVIDUAL BASELINE</h4>
            <p className="text-xs text-gray-500 text-center mt-1">Rolling 7-day personal normal</p>
          </div>

          <div className="w-1 bg-gray-200 h-8"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-800">TEMPORAL DEVIATION</h4>
            <p className="text-xs text-gray-500 text-center mt-1">Rate of change per signal</p>
          </div>

          <div className="w-1 bg-gray-200 h-8"></div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-2">
              <Cpu className="w-8 h-8 text-pink-600" />
            </div>
            <h4 className="font-bold text-gray-800">MULTI-SIGNAL CONVERGENCE</h4>
            <p className="text-xs text-gray-500 text-center mt-1">Coordinated physiological stress</p>
          </div>

          <div className="w-1 bg-gray-200 h-8"></div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <BrainCircuit className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="font-bold text-gray-800">ML FORECAST</h4>
            <p className="text-xs text-gray-500 text-center mt-1">Probability estimation</p>
          </div>

          <div className="w-1 bg-gray-200 h-8"></div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <CheckSquare className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-800">VERIFICATION</h4>
            <p className="text-xs text-gray-500 text-center mt-1">Ground truth feedback</p>
          </div>

          <div className="w-1 bg-gray-200 h-8"></div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-2">
              <RefreshCw className="w-8 h-8 text-teal-600" />
            </div>
            <h4 className="font-bold text-gray-800">MODEL FEEDBACK</h4>
            <p className="text-xs text-gray-500 text-center mt-1">Continuous Retraining</p>
          </div>

        </div>
      </div>
      
      {/* Dynamic Data Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Selected Model</p>
          <p className="font-bold text-gray-900 mt-1">Logistic Regression Baseline</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Forecast Horizon</p>
          <p className="font-bold text-gray-900 mt-1">7-14 Days</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Feature Count</p>
          <p className="font-bold text-gray-900 mt-1">36</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Training Dataset</p>
          <p className="font-bold text-gray-900 mt-1">100 Animals</p>
        </div>
      </div>

    </div>
  );
};
