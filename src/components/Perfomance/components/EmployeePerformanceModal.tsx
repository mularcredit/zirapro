import { useState } from 'react';
import { BarChart2, X, Check, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface EmployeePerformance {
  id?: number;
  employee_id: string;
  date: string;
  period: string;
  loans_disbursed: number;
  disbursement_target: number;
  clients_visited: number;
  field_visits_target: number;
  collection_amount: number;
  collection_target: number;
  par_amount: number;
  portfolio_size: number;
  attendance_days: number;
  working_days: number;
  tat_average: number;
}

interface EmployeePerformanceModalProps {
  performance?: EmployeePerformance | null;
  onClose: () => void;
  onSave: (performance: EmployeePerformance) => void;
  employees: any[];
}

const EmployeePerformanceModal: React.FC<EmployeePerformanceModalProps> = ({ 
  performance, 
  onClose, 
  onSave, 
  employees 
}) => {
  const [formData, setFormData] = useState<EmployeePerformance>({
    id: performance?.id,
    employee_id: performance?.employee_id || '',
    date: performance?.date || new Date().toISOString().split('T')[0],
    period: performance?.period || 'daily',
    loans_disbursed: performance?.loans_disbursed || 0,
    disbursement_target: performance?.disbursement_target || 0,
    clients_visited: performance?.clients_visited || 0,
    field_visits_target: performance?.field_visits_target || 0,
    collection_amount: performance?.collection_amount || 0,
    collection_target: performance?.collection_target || 0,
    par_amount: performance?.par_amount || 0,
    portfolio_size: performance?.portfolio_size || 0,
    attendance_days: performance?.attendance_days || 0,
    working_days: performance?.working_days || 1,
    tat_average: performance?.tat_average || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: [
        'loans_disbursed', 'disbursement_target', 'clients_visited', 'field_visits_target',
        'collection_amount', 'collection_target', 'par_amount', 'portfolio_size',
        'attendance_days', 'working_days', 'tat_average'
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
          .from('employee_performance')
          .update(formData)
          .eq('id', formData.id);
        
        if (error) throw error;
      } else {
        // Create new performance record
        const { data, error } = await supabase
          .from('employee_performance')
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
            <BarChart2 className="w-5 h-5" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp["Employee Number"]} value={emp["Employee Number"]}>
                  {emp["First Name"]} {emp["Last Name"]}
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
                name="loans_disbursed"
                value={formData.loans_disbursed}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Clients Visited</label>
              <input
                type="number"
                name="clients_visited"
                value={formData.clients_visited}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Visits Target</label>
              <input
                type="number"
                name="field_visits_target"
                value={formData.field_visits_target}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Amount (KSh)</label>
              <input
                type="number"
                name="collection_amount"
                value={formData.collection_amount}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">PAR Amount (KSh)</label>
              <input
                type="number"
                name="par_amount"
                value={formData.par_amount}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Days</label>
              <input
                type="number"
                name="attendance_days"
                value={formData.attendance_days}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
                max={formData.working_days}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
              <input
                type="number"
                name="working_days"
                value={formData.working_days}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="1"
                max="31"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Average TAT (Hours)</label>
            <input
              type="number"
              name="tat_average"
              value={formData.tat_average}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
              min="0"
              step="0.1"
            />
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

export default EmployeePerformanceModal;