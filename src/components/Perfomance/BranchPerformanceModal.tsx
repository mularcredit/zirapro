import { useState } from 'react';
import { Building, X, Check, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BranchPerformance {
  id?: number;
  branch_id: number;
  date: string;
  period: string;
  total_loans_disbursed: number;
  disbursement_target: number;
  total_collection: number;
  collection_target: number;
  total_par: number;
  portfolio_size: number;
  average_tat: number;
  staff_count: number;
}

interface BranchPerformanceModalProps {
  performance?: BranchPerformance | null;
  onClose: () => void;
  onSave: (performance: BranchPerformance) => void;
  branches: any[];
}

const BranchPerformanceModal: React.FC<BranchPerformanceModalProps> = ({ 
  performance, 
  onClose, 
  onSave, 
  branches 
}) => {
  const [formData, setFormData] = useState<BranchPerformance>({
    id: performance?.id,
    branch_id: performance?.branch_id || 0,
    date: performance?.date || new Date().toISOString().split('T')[0],
    period: performance?.period || 'daily',
    total_loans_disbursed: performance?.total_loans_disbursed || 0,
    disbursement_target: performance?.disbursement_target || 0,
    total_collection: performance?.total_collection || 0,
    collection_target: performance?.collection_target || 0,
    total_par: performance?.total_par || 0,
    portfolio_size: performance?.portfolio_size || 0,
    average_tat: performance?.average_tat || 0,
    staff_count: performance?.staff_count || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: [
        'branch_id', 'total_loans_disbursed', 'disbursement_target', 'total_collection',
        'collection_target', 'total_par', 'portfolio_size', 'average_tat', 'staff_count'
      ].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (formData.id) {
        // Update existing performance record
        const { error } = await supabase
          .from('branch_performance')
          .update(formData)
          .eq('id', formData.id);
        
        if (error) throw error;
      } else {
        // Create new performance record
        const { data, error } = await supabase
          .from('branch_performance')
          .insert([formData])
          .select()
          .single();
        
        if (error) throw error;
        formData.id = data.id;
      }

      onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving performance:', err);
      setError(err instanceof Error ? err.message : 'Failed to save performance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building className="w-5 h-5" />
            {performance ? 'Edit Performance' : 'Add Performance Record'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select Branch</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch["Branch Office"]}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loans Disbursed</label>
              <input
                type="number"
                name="total_loans_disbursed"
                value={formData.total_loans_disbursed}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disbursement Target</label>
              <input
                type="number"
                name="disbursement_target"
                value={formData.disbursement_target}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Collection (KSh)</label>
              <input
                type="number"
                name="total_collection"
                value={formData.total_collection}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Target (KSh)</label>
              <input
                type="number"
                name="collection_target"
                value={formData.collection_target}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total PAR (KSh)</label>
              <input
                type="number"
                name="total_par"
                value={formData.total_par}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Size (KSh)</label>
              <input
                type="number"
                name="portfolio_size"
                value={formData.portfolio_size}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Average TAT (Hours)</label>
              <input
                type="number"
                name="average_tat"
                value={formData.average_tat}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Count</label>
              <input
                type="number"
                name="staff_count"
                value={formData.staff_count}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <Check className="w-4 h-4" />
                  Save Performance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchPerformanceModal;