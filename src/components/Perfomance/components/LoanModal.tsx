import { useState, useEffect } from 'react';
import { CreditCard, X, Check, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Loan {
  loan_id: string;
  client_id: string;
  loan_officer: string;
  branch_id: number;
  product_type: string;
  amount_disbursed: number;
  outstanding_balance: number;
  interest_rate: number;
  term_months: number;
  disbursement_date: string;
  status: string;
  par_days: number;
  last_payment_date: string | null;
  next_payment_date: string | null;
}

interface LoanModalProps {
  loan?: Loan | null;
  onClose: () => void;
  onSave: (loan: Loan) => void;
  clients: any[];
  employees: any[];
  branches: any[];
}

const LoanModal: React.FC<LoanModalProps> = ({ loan, onClose, onSave, clients, employees, branches }) => {
  const [formData, setFormData] = useState<Loan>({
    loan_id: loan?.loan_id || '',
    client_id: loan?.client_id || '',
    loan_officer: loan?.loan_officer || '',
    branch_id: loan?.branch_id || 0,
    product_type: loan?.product_type || 'individual',
    amount_disbursed: loan?.amount_disbursed || 0,
    outstanding_balance: loan?.outstanding_balance || 0,
    interest_rate: loan?.interest_rate || 12,
    term_months: loan?.term_months || 12,
    disbursement_date: loan?.disbursement_date || new Date().toISOString().split('T')[0],
    status: loan?.status || 'pending',
    par_days: loan?.par_days || 0,
    last_payment_date: loan?.last_payment_date || null,
    next_payment_date: loan?.next_payment_date || null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['branch_id', 'amount_disbursed', 'outstanding_balance', 'interest_rate', 'term_months', 'par_days'].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const calculateNextPaymentDate = () => {
    if (!formData.disbursement_date) return null;
    
    const disbursementDate = new Date(formData.disbursement_date);
    const nextPaymentDate = new Date(disbursementDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    
    return nextPaymentDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const loanData = {
        ...formData,
        next_payment_date: formData.next_payment_date || calculateNextPaymentDate()
      };

      if (loanData.loan_id) {
        // Update existing loan
        const { error } = await supabase
          .from('loans')
          .update(loanData)
          .eq('loan_id', loanData.loan_id);
        
        if (error) throw error;
      } else {
        // Create new loan
        const { data, error } = await supabase
          .from('loans')
          .insert([loanData])
          .select()
          .single();
        
        if (error) throw error;
        loanData.loan_id = data.loan_id;
      }

      onSave(loanData);
      onClose();
    } catch (err) {
      console.error('Error saving loan:', err);
      setError(err instanceof Error ? err.message : 'Failed to save loan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {loan ? 'Edit Loan' : 'Add New Loan'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.client_id} value={client.client_id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loan Officer</label>
              <select
                name="loan_officer"
                value={formData.loan_officer}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="">Select Loan Officer</option>
                {employees.map(emp => (
                  <option key={emp["Employee Number"]} value={emp["Employee Number"]}>
                    {emp["First Name"]} {emp["Last Name"]}
                  </option>
                ))}
              </select>
            </div>
            
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="individual">Individual</option>
                <option value="group">Group</option>
                <option value="business">Business</option>
                <option value="agriculture">Agriculture</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="disbursed">Disbursed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="defaulted">Defaulted</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Disbursed (KSh)</label>
              <input
                type="number"
                name="amount_disbursed"
                value={formData.amount_disbursed}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outstanding Balance (KSh)</label>
              <input
                type="number"
                name="outstanding_balance"
                value={formData.outstanding_balance}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                name="interest_rate"
                value={formData.interest_rate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term (Months)</label>
              <input
                type="number"
                name="term_months"
                value={formData.term_months}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disbursement Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="disbursement_date"
                  value={formData.disbursement_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAR Days</label>
              <input
                type="number"
                name="par_days"
                value={formData.par_days}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
          </div>
          
          {formData.last_payment_date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Payment Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="last_payment_date"
                  value={formData.last_payment_date || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
          
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
                  Save Loan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanModal;