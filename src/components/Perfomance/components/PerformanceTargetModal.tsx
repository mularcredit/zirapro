import { useState } from 'react';
import { Target, X, Check, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PerformanceTarget {
  id?: number;
  target_for: string;
  target_type: string;
  employee_id: string | null;
  branch_id: number | null;
  product_type: string | null;
  period: string;
  target_value: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface PerformanceTargetModalProps {
  target?: PerformanceTarget | null;
  onClose: () => void;
  onSave: (target: PerformanceTarget) => void;
  employees: any[];
  branches: any[];
}

const PerformanceTargetModal: React.FC<PerformanceTargetModalProps> = ({ 
  target, 
  onClose, 
  onSave, 
  employees, 
  branches 
}) => {
  const [formData, setFormData] = useState<PerformanceTarget>({
    id: target?.id,
    target_for: target?.target_for || 'employee',
    target_type: target?.target_type || 'disbursement',
    employee_id: target?.employee_id || null,
    branch_id: target?.branch_id || null,
    product_type: target?.product_type || null,
    period: target?.period || 'monthly',
    target_value: target?.target_value || 0,
    start_date: target?.start_date || new Date().toISOString().split('T')[0],
    end_date: target?.end_date || null,
    is_active: target?.is_active || true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['branch_id', 'target_value'].includes(name) 
        ? parseFloat(value) || 0 
        : ['is_active'].includes(name)
        ? (e.target as HTMLInputElement).checked
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate that either employee_id or branch_id is set based on target_for
      if (formData.target_for === 'employee' && !formData.employee_id) {
        throw new Error('Employee is required for employee targets');
      }
      if (formData.target_for === 'branch' && !formData.branch_id) {
        throw new Error('Branch is required for branch targets');
      }

      if (formData.id) {
        // Update existing target
        const { error } = await supabase
          .from('performance_targets')
          .update(formData)
          .eq('id', formData.id);
        
        if (error) throw error;
      } else {
        // Create new target
        const { data, error } = await supabase
          .from('performance_targets')
          .insert([formData])
          .select()
          .single();
        
        if (error) throw error;
        formData.id = data.id;
      }

      onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving target:', err);
      setError(err instanceof Error ? err.message : 'Failed to save target');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            {target ? 'Edit Target' : 'Add New Target'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Target For</label>
            <select
              name="target_for"
              value={formData.target_for}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="employee">Employee</option>
              <option value="branch">Branch</option>
              <option value="product">Product</option>
            </select>
          </div>
          
          {formData.target_for === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                name="employee_id"
                value={formData.employee_id || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required={formData.target_for === 'employee'}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp["Employee Number"]} value={emp["Employee Number"]}>
                    {emp["First Name"]} {emp["Last Name"]}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {formData.target_for === 'branch' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                name="branch_id"
                value={formData.branch_id || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required={formData.target_for === 'branch'}
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch["Branch Office"]}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {formData.target_for === 'product' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
              <select
                name="product_type"
                value={formData.product_type || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required={formData.target_for === 'product'}
              >
                <option value="">Select Product</option>
                <option value="individual">Individual</option>
                <option value="group">Group</option>
                <option value="business">Business</option>
                <option value="agriculture">Agriculture</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
            <select
              name="target_type"
              value={formData.target_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="disbursement">Disbursement</option>
              <option value="collection">Collection</option>
              <option value="field_visits">Field Visits</option>
              <option value="attendance">Attendance</option>
            </select>
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
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
            <input
              type="number"
              name="target_value"
              value={formData.target_value}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
              <div className="relative">
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Active Target
            </label>
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
                  Save Target
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerformanceTargetModal;