import { useState } from 'react';
import { Wallet, X, Check, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface LoanPayment {
  payment_id?: number;
  loan_id: string;
  amount_paid: number;
  payment_date: string;
  principal_amount: number;
  interest_amount: number;
  fees_amount: number;
  penalty_amount: number;
}

interface LoanPaymentModalProps {
  payment?: LoanPayment | null;
  onClose: () => void;
  onSave: (payment: LoanPayment) => void;
  loans: any[];
}

const LoanPaymentModal: React.FC<LoanPaymentModalProps> = ({ payment, onClose, onSave, loans }) => {
  const [formData, setFormData] = useState<LoanPayment>({
    payment_id: payment?.payment_id,
    loan_id: payment?.loan_id || '',
    amount_paid: payment?.amount_paid || 0,
    payment_date: payment?.payment_date || new Date().toISOString().split('T')[0],
    principal_amount: payment?.principal_amount || 0,
    interest_amount: payment?.interest_amount || 0,
    fees_amount: payment?.fees_amount || 0,
    penalty_amount: payment?.penalty_amount || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['amount_paid', 'principal_amount', 'interest_amount', 'fees_amount', 'penalty_amount'].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate that the sum of components equals the total amount
      const sumComponents = formData.principal_amount + formData.interest_amount + 
                          formData.fees_amount + formData.penalty_amount;
      
      if (Math.abs(sumComponents - formData.amount_paid) > 0.01) {
        throw new Error('Sum of payment components must equal total amount paid');
      }

      if (formData.payment_id) {
        // Update existing payment
        const { error } = await supabase
          .from('loan_payments')
          .update(formData)
          .eq('payment_id', formData.payment_id);
        
        if (error) throw error;
      } else {
        // Create new payment
        const { data, error } = await supabase
          .from('loan_payments')
          .insert([formData])
          .select()
          .single();
        
        if (error) throw error;
        formData.payment_id = data.payment_id;
      }

      onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to save payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {payment ? 'Edit Payment' : 'Record New Payment'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan</label>
            <select
              name="loan_id"
              value={formData.loan_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select Loan</option>
              {loans.map(loan => (
                <option key={loan.loan_id} value={loan.loan_id}>
                  {loan.loan_id} - {loan.client_id} (KSh {loan.amount_disbursed?.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <div className="relative">
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
              <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount Paid (KSh)</label>
            <input
              type="number"
              name="amount_paid"
              value={formData.amount_paid}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount (KSh)</label>
              <input
                type="number"
                name="principal_amount"
                value={formData.principal_amount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Amount (KSh)</label>
              <input
                type="number"
                name="interest_amount"
                value={formData.interest_amount}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Fees Amount (KSh)</label>
              <input
                type="number"
                name="fees_amount"
                value={formData.fees_amount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Amount (KSh)</label>
              <input
                type="number"
                name="penalty_amount"
                value={formData.penalty_amount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
                step="0.01"
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
                  Save Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanPaymentModal;