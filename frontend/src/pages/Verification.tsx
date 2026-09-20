import { useState } from 'react';
import { api } from '../services/api';

export const Verification = () => {
  const [animalCode, setAnimalCode] = useState('');
  const [cmt, setCmt] = useState('');
  const [scc, setScc] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle'|'submitting'|'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    const success = await api.recordVerification({
      animal_id: animalCode, // would be mapped in real app
      cmt_result: cmt,
      scc_value: parseInt(scc),
      veterinary_confirmation: true,
      notes,
      verification_date: new Date().toISOString()
    });
    if (success) setStatus('success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">Record Verification</h2>
        <p className="text-gray-500 mt-1">AI early-warning support — verification required</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {status === 'success' ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Verification recorded</h3>
            <p className="text-gray-500 mt-2">Outcome stored for future model evaluation and retraining.</p>
            <button 
              onClick={() => { setStatus('idle'); setAnimalCode(''); setCmt(''); setScc(''); setNotes(''); }}
              className="mt-6 text-primary font-medium hover:underline"
            >
              Record another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Animal ID</label>
              <input type="text" value={animalCode} onChange={(e) => setAnimalCode(e.target.value)} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border" placeholder="e.g. COW-027" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CMT Result</label>
              <select value={cmt} onChange={(e) => setCmt(e.target.value)} required className="w-full border-gray-300 rounded-lg shadow-sm p-2 border">
                <option value="">Select result...</option>
                <option value="Negative">Negative</option>
                <option value="Trace">Trace</option>
                <option value="1">1 (Weak Positive)</option>
                <option value="2">2 (Distinct Positive)</option>
                <option value="3">3 (Strong Positive)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SCC Value (cells/mL)</label>
              <input type="number" value={scc} onChange={(e) => setScc(e.target.value)} required className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" placeholder="e.g. 450000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" placeholder="Veterinary observations..." />
            </div>
            <div className="pt-4">
              <button disabled={status === 'submitting'} type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg shadow-sm disabled:opacity-50">
                {status === 'submitting' ? 'Saving...' : 'Submit Verification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
