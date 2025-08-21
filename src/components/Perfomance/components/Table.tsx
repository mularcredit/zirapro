import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Trash2, Search, Filter, Download, Upload } from 'lucide-react';

// Enhanced type definitions with new fields
type Client = {
  client_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  status: 'active' | 'inactive' | 'pending';
  loan_officer: string;
  branch_id: string;
  registration_date: string;
};

type Loan = {
  loan_id: string;
  client_id: string;
  client_name: string;
  loan_officer: string;
  loan_officer_name: string;
  branch_id: bigint;
  branch_name: string;
  product_type: string;
  amount_disbursed: number;
  interest_rate: number;
  term_months: number;
  disbursement_date: string;
  maturity_date: string;
  repayment_frequency: string;
  status: 'Pending' | 'Approved' | 'Disbursed' | 'Active' | 'Completed' | 'Defaulted';
  par_days: number;
  outstanding_balance: number;
  total_repayment_amount: number;
  total_principal_paid: number;
  total_interest_paid: number;
  total_fees_paid: number;
  total_penalty_paid: number;
  last_payment_date: string;
  next_payment_date: string;
  is_first_loan: boolean;
  arrears_days: number;
  arrears_amount: number;
  days_since_disbursement: number;
  days_since_last_payment: number;
};

type LoanPayment = {
  payment_id: string;
  loan_id: string;
  amount_paid: number;
  payment_date: string;
  principal_amount: number;
  interest_amount: number;
  fees_amount: number;
  penalty_amount: number;
};

type EmployeePerformance = {
  id: string;
  employee_id: string;
  employee_name: string;
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
  new_loans: number;
  outstanding_balance: number;
  arrears_amount: number;
  loans_in_arrears: number;
  total_active_loans: number;
  portfolio_at_risk: number;
  client_satisfaction_score: number;
  loan_recovery_rate: number;
  average_loan_size: number;
  active_clients: number;
};

type BranchPerformance = {
  id: string;
  branch_id: string;
  branch_name: string;
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
  new_loans: number;
  arrears_amount: number;
  loans_in_arrears: number;
  total_active_loans: number;
  portfolio_at_risk: number;
  portfolio_quality: string;
  loan_officer_count: number;
  active_clients: number;
  new_clients: number;
  client_dropout_rate: number;
};

type PerformanceTarget = {
  id: string;
  target_for: string;
  target_type: string;
  employee_id?: string;
  branch_id?: string;
  product_type?: string;
  period: string;
  target_value: number;
  start_date?: string;
  end_date?: string | null;
  is_active?: boolean;
};

type ClientVisit = {
  visit_id: string;
  employee_id: string;
  client_id: string;
  visit_date: string;
  purpose: string;
  outcome?: string;
  next_action?: string | null;
  next_visit_date?: string | null;
  location?: string | null;
  branch_id?: number | null;
};

// Shared components
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) => {
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {startPage > 1 && <span className="px-2 py-1">...</span>}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg border ${currentPage === page ? 'bg-green-100 border-green-500 text-green-600' : 'border-gray-200'}`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && <span className="px-2 py-1">...</span>}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

const EditModal = ({
  isOpen,
  onClose,
  onUpdate,
  fields,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedData: any) => void;
  fields: {
    key: string;
    label: string;
    type?: string;
    options?: string[];
    value: any;
  }[];
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialData: any = {};
      fields.forEach((field) => {
        initialData[field.key] = field.value;
      });
      setFormData(initialData);
    }
  }, [fields]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-h-[80vh] overflow-y-auto rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Edit Record</h2>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  name={field.key}
                  value={formData[field.key] ?? ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "date" ? (
                <input
                  type="date"
                  name={field.key}
                  value={formData[field.key] ?? ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.key}
                  value={formData[field.key] ?? ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <p className="mb-6">Are you sure you want to delete {itemName}? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Search Input Component
const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

// Enhanced LoansTable with filtering and export functionality
export const LoansTable = ({ loans, onUpdate, onDelete }: { loans: Loan[]; onUpdate: (loan: Loan) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [sortField, setSortField] = useState('disbursement_date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Enhanced filtering with multiple criteria
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = Object.values(loan).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesProduct = productFilter === 'all' || loan.product_type === productFilter;
    
    return matchesSearch && matchesStatus && matchesProduct;
  });

  // Sorting
  const sortedLoans = [...filteredLoans].sort((a, b) => {
    const aValue = a[sortField as keyof Loan];
    const bValue = b[sortField as keyof Loan];
    
    if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
    if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const totalPages = Math.ceil(sortedLoans.length / rowsPerPage);
  const paginatedData = sortedLoans.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleEdit = (loan: Loan) => {
    setSelectedLoan(loan);
    setEditModalOpen(true);
  };

  const handleDelete = (loan: Loan) => {
    setSelectedLoan(loan);
    setDeleteModalOpen(true);
  };

  const handleSave = (updatedLoan: Loan) => {
    onUpdate(updatedLoan);
    setEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedLoan) {
      onDelete(selectedLoan.loan_id);
    }
    setDeleteModalOpen(false);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const headers = [
      'Loan ID', 'Client ID', 'Client Name', 'Loan Officer', 'Branch', 
      'Product Type', 'Amount Disbursed', 'Outstanding Balance', 'Status',
      'Disbursement Date', 'Maturity Date', 'Arrears Amount', 'PAR Days'
    ];
    
    const csvContent = [
      headers.join(','),
      ...sortedLoans.map(loan => [
        loan.loan_id,
        loan.client_id,
        loan.client_name || '',
        loan.loan_officer_name || loan.loan_officer,
        loan.branch_name || loan.branch_id,
        loan.product_type,
        loan.amount_disbursed,
        loan.outstanding_balance,
        loan.status,
        loan.disbursement_date,
        loan.maturity_date,
        loan.arrears_amount,
        loan.par_days
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `loans_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Loans Management</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <SearchInput 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search loans by any field..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Defaulted">Defaulted</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
            <select 
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="all">All Products</option>
              <option value="Business">Business</option>
              <option value="Personal">Personal</option>
              <option value="Agricultural">Agricultural</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                className="py-3 px-4 text-left font-semibold text-gray-700 cursor-pointer"
                onClick={() => handleSort('loan_id')}
              >
                Loan ID {sortField === 'loan_id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="py-3 px-4 text-left font-semibold text-gray-700 cursor-pointer"
                onClick={() => handleSort('client_name')}
              >
                Client {sortField === 'client_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Product Type</th>
              <th 
                className="py-3 px-4 text-left font-semibold text-gray-700 cursor-pointer"
                onClick={() => handleSort('amount_disbursed')}
              >
                Amount {sortField === 'amount_disbursed' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="py-3 px-4 text-left font-semibold text-gray-700 cursor-pointer"
                onClick={() => handleSort('outstanding_balance')}
              >
                Outstanding {sortField === 'outstanding_balance' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              <th 
                className="py-3 px-4 text-left font-semibold text-gray-700 cursor-pointer"
                onClick={() => handleSort('disbursement_date')}
              >
                Disbursement Date {sortField === 'disbursement_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="py-3 px-4 text-left font-semibold text-gray-700 cursor-pointer"
                onClick={() => handleSort('arrears_amount')}
              >
                Arrears {sortField === 'arrears_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((loan) => (
              <tr key={loan.loan_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-mono">{loan.loan_id}</td>
                <td className="py-3 px-4">
                  <div>{loan.client_name || loan.client_id}</div>
                  <div className="text-xs text-gray-500">{loan.loan_officer_name || loan.loan_officer}</div>
                </td>
                <td className="py-3 px-4">{loan.product_type}</td>
                <td className="py-3 px-4">{loan.amount_disbursed?.toLocaleString()}</td>
                <td className="py-3 px-4">{loan.outstanding_balance?.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    loan.status === 'Disbursed' ? 'bg-blue-100 text-blue-800' : 
                    loan.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    loan.status === 'Completed' ? 'bg-purple-100 text-purple-800' : 
                    loan.status === 'Defaulted' ? 'bg-red-100 text-red-800' :
                    loan.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {loan.status}
                  </span>
                </td>
                <td className="py-3 px-4">{new Date(loan.disbursement_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  {loan.arrears_amount > 0 ? (
                    <span className="text-red-600 font-medium">
                      {loan.arrears_amount?.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-green-600">0</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(loan)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit loan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(loan)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete loan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <select 
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="p-1 border border-gray-300 rounded"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        
        <div className="text-sm text-gray-600">
          Showing {paginatedData.length} of {sortedLoans.length} loans
        </div>
      </div>

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={handleSave}
        fields={[
          { 
            key: 'loan_id', 
            label: 'Loan ID',
            value: selectedLoan?.loan_id || ''
          },
          { 
            key: 'client_id', 
            label: 'Client ID',
            value: selectedLoan?.client_id || ''
          },
          { 
            key: 'client_name', 
            label: 'Client Name',
            value: selectedLoan?.client_name || ''
          },
          { 
            key: 'loan_officer', 
            label: 'Loan Officer ID',
            value: selectedLoan?.loan_officer || ''
          },
          { 
            key: 'loan_officer_name', 
            label: 'Loan Officer Name',
            value: selectedLoan?.loan_officer_name || ''
          },
          { 
            key: 'branch_id', 
            label: 'Branch ID',
            value: selectedLoan?.branch_id || ''
          },
          { 
            key: 'branch_name', 
            label: 'Branch Name',
            value: selectedLoan?.branch_name || ''
          },
          { 
            key: 'product_type', 
            label: 'Product Type',
            value: selectedLoan?.product_type || ''
          },
          { 
            key: 'amount_disbursed', 
            label: 'Amount Disbursed', 
            type: 'number',
            value: selectedLoan?.amount_disbursed || 0
          },
          { 
            key: 'interest_rate', 
            label: 'Interest Rate', 
            type: 'number',
            value: selectedLoan?.interest_rate || 0
          },
          { 
            key: 'term_months', 
            label: 'Term (Months)', 
            type: 'number',
            value: selectedLoan?.term_months || 0
          },
          { 
            key: 'outstanding_balance', 
            label: 'Outstanding Balance', 
            type: 'number',
            value: selectedLoan?.outstanding_balance || 0
          },
          { 
            key: 'status', 
            label: 'Status', 
            type: 'select',
            options: ['Pending', 'Approved', 'Disbursed', 'Active', 'Completed', 'Defaulted'],
            value: selectedLoan?.status || ''
          },
          { 
            key: 'disbursement_date', 
            label: 'Disbursement Date', 
            type: 'date',
            value: selectedLoan?.disbursement_date ? new Date(selectedLoan.disbursement_date).toISOString().split('T')[0] : ''
          },
          { 
            key: 'maturity_date', 
            label: 'Maturity Date', 
            type: 'date',
            value: selectedLoan?.maturity_date ? new Date(selectedLoan.maturity_date).toISOString().split('T')[0] : ''
          },
          { 
            key: 'arrears_amount', 
            label: 'Arrears Amount', 
            type: 'number',
            value: selectedLoan?.arrears_amount || 0
          },
          { 
            key: 'par_days', 
            label: 'PAR Days', 
            type: 'number',
            value: selectedLoan?.par_days || 0
          },
        ]}
      />

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`loan ${selectedLoan?.loan_id}`}
      />
    </div>
  );
};

// Enhanced Employee Performance Table
export const EmployeePerformanceTable = ({ performance, onUpdate, onDelete }: { performance: EmployeePerformance[]; onUpdate: (perf: EmployeePerformance) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPerf, setSelectedPerf] = useState<EmployeePerformance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  
  const filteredPerformance = performance.filter(perf => {
    const matchesSearch = Object.values(perf).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesPeriod = periodFilter === 'all' || perf.period === periodFilter;
    
    return matchesSearch && matchesPeriod;
  });

  const totalPages = Math.ceil(filteredPerformance.length / rowsPerPage);
  const paginatedData = filteredPerformance.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleEdit = (perf: EmployeePerformance) => {
    setSelectedPerf(perf);
    setEditModalOpen(true);
  };

  const handleDelete = (perf: EmployeePerformance) => {
    setSelectedPerf(perf);
    setDeleteModalOpen(true);
  };

  const handleSave = (updatedPerf: EmployeePerformance) => {
    onUpdate(updatedPerf);
    setEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedPerf) {
      onDelete(selectedPerf.id);
    }
    setDeleteModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Employee Performance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <SearchInput 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search performance by any field..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select 
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="all">All Periods</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Employee ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Date</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Period</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Loans Disbursed</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Disbursement Target</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Achievement Rate</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Clients Visited</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">PAR Rate</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((perf) => {
              const achievementRate = perf.disbursement_target 
                ? Math.round((perf.loans_disbursed / perf.disbursement_target) * 100) 
                : 0;
                
              return (
                <tr key={perf.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{perf.id}</td>
                  <td className="py-3 px-4">{perf.employee_id}</td>
                  <td className="py-3 px-4">{new Date(perf.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 capitalize">{perf.period}</td>
                  <td className="py-3 px-4">{perf.loans_disbursed}</td>
                  <td className="py-3 px-4">{perf.disbursement_target}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      achievementRate >= 100 ? 'bg-green-100 text-green-800' :
                      achievementRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {achievementRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">{perf.clients_visited}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (perf.portfolio_at_risk || 0) <= 5 ? 'bg-green-100 text-green-800' :
                      (perf.portfolio_at_risk || 0) <= 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {perf.portfolio_at_risk || 0}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(perf)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(perf)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <select 
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="p-1 border border-gray-300 rounded"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        
        <div className="text-sm text-gray-600">
          Showing {paginatedData.length} of {filteredPerformance.length} records
        </div>
      </div>

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={handleSave}
        fields={[
          { 
            key: 'id', 
            label: 'ID',
            value: selectedPerf?.id || ''
          },
          { 
            key: 'employee_id', 
            label: 'Employee ID',
            value: selectedPerf?.employee_id || ''
          },
          { 
            key: 'employee_name', 
            label: 'Employee Name',
            value: selectedPerf?.employee_name || ''
          },
          { 
            key: 'date', 
            label: 'Date', 
            type: 'date',
            value: selectedPerf?.date ? new Date(selectedPerf.date).toISOString().split('T')[0] : ''
          },
          { 
            key: 'period', 
            label: 'Period', 
            type: 'select',
            options: ['daily', 'weekly', 'monthly', 'quarterly', 'annual'],
            value: selectedPerf?.period || ''
          },
          { 
            key: 'loans_disbursed', 
            label: 'Loans Disbursed', 
            type: 'number',
            value: selectedPerf?.loans_disbursed || 0
          },
          { 
            key: 'disbursement_target', 
            label: 'Disbursement Target', 
            type: 'number',
            value: selectedPerf?.disbursement_target || 0
          },
          { 
            key: 'clients_visited', 
            label: 'Clients Visited', 
            type: 'number',
            value: selectedPerf?.clients_visited || 0
          },
          { 
            key: 'field_visits_target', 
            label: 'Field Visits Target', 
            type: 'number',
            value: selectedPerf?.field_visits_target || 0
          },
          { 
            key: 'collection_amount', 
            label: 'Collection Amount', 
            type: 'number',
            value: selectedPerf?.collection_amount || 0
          },
          { 
            key: 'collection_target', 
            label: 'Collection Target', 
            type: 'number',
            value: selectedPerf?.collection_target || 0
          },
          { 
            key: 'portfolio_at_risk', 
            label: 'Portfolio at Risk (%)', 
            type: 'number',
            value: selectedPerf?.portfolio_at_risk || 0
          },
          { 
            key: 'client_satisfaction_score', 
            label: 'Client Satisfaction Score', 
            type: 'number',
            value: selectedPerf?.client_satisfaction_score || 0
          },
          { 
            key: 'active_clients', 
            label: 'Active Clients', 
            type: 'number',
            value: selectedPerf?.active_clients || 0
          },
        ]}
      />

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`performance record ${selectedPerf?.id}`}
      />
    </div>
  );
};

// Enhanced Branch Performance Table
export const BranchPerformanceTable = ({ performance, onUpdate, onDelete }: { performance: BranchPerformance[]; onUpdate: (perf: BranchPerformance) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPerf, setSelectedPerf] = useState<BranchPerformance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  
  const filteredPerformance = performance.filter(perf => {
    const matchesSearch = Object.values(perf).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesPeriod = periodFilter === 'all' || perf.period === periodFilter;
    
    return matchesSearch && matchesPeriod;
  });

  const totalPages = Math.ceil(filteredPerformance.length / rowsPerPage);
  const paginatedData = filteredPerformance.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleEdit = (perf: BranchPerformance) => {
    setSelectedPerf(perf);
    setEditModalOpen(true);
  };

  const handleDelete = (perf: BranchPerformance) => {
    setSelectedPerf(perf);
    setDeleteModalOpen(true);
  };

  const handleSave = (updatedPerf: BranchPerformance) => {
    onUpdate(updatedPerf);
    setEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedPerf) {
      onDelete(selectedPerf.id);
    }
    setDeleteModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Branch Performance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <SearchInput 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search performance by any field..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select 
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="all">All Periods</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Branch ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Date</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Period</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Loans Disbursed</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Disbursement Target</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Achievement Rate</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Total Collection</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">PAR Rate</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((perf) => {
              const achievementRate = perf.disbursement_target 
                ? Math.round((perf.total_loans_disbursed / perf.disbursement_target) * 100) 
                : 0;
                
              return (
                <tr key={perf.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{perf.id}</td>
                  <td className="py-3 px-4">{perf.branch_id}</td>
                  <td className="py-3 px-4">{new Date(perf.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 capitalize">{perf.period}</td>
                  <td className="py-3 px-4">{perf.total_loans_disbursed}</td>
                  <td className="py-3 px-4">{perf.disbursement_target}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      achievementRate >= 100 ? 'bg-green-100 text-green-800' :
                      achievementRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {achievementRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">{perf.total_collection?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (perf.portfolio_at_risk || 0) <= 5 ? 'bg-green-100 text-green-800' :
                      (perf.portfolio_at_risk || 0) <= 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {perf.portfolio_at_risk || 0}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(perf)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(perf)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <select 
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="p-1 border border-gray-300 rounded"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        
        <div className="text-sm text-gray-600">
          Showing {paginatedData.length} of {filteredPerformance.length} records
        </div>
      </div>

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={handleSave}
        fields={[
          { 
            key: 'id', 
            label: 'ID',
            value: selectedPerf?.id || ''
          },
          { 
            key: 'branch_id', 
            label: 'Branch ID',
            value: selectedPerf?.branch_id || ''
          },
          { 
            key: 'branch_name', 
            label: 'Branch Name',
            value: selectedPerf?.branch_name || ''
          },
          { 
            key: 'date', 
            label: 'Date', 
            type: 'date',
            value: selectedPerf?.date ? new Date(selectedPerf.date).toISOString().split('T')[0] : ''
          },
          { 
            key: 'period', 
            label: 'Period', 
            type: 'select',
            options: ['daily', 'weekly', 'monthly', 'quarterly', 'annual'],
            value: selectedPerf?.period || ''
          },
          { 
            key: 'total_loans_disbursed', 
            label: 'Total Loans Disbursed', 
            type: 'number',
            value: selectedPerf?.total_loans_disbursed || 0
          },
          { 
            key: 'disbursement_target', 
            label: 'Disbursement Target', 
            type: 'number',
            value: selectedPerf?.disbursement_target || 0
          },
          { 
            key: 'total_collection', 
            label: 'Total Collection', 
            type: 'number',
            value: selectedPerf?.total_collection || 0
          },
          { 
            key: 'collection_target', 
            label: 'Collection Target', 
            type: 'number',
            value: selectedPerf?.collection_target || 0
          },
          { 
            key: 'portfolio_at_risk', 
            label: 'Portfolio at Risk (%)', 
            type: 'number',
            value: selectedPerf?.portfolio_at_risk || 0
          },
          { 
            key: 'active_clients', 
            label: 'Active Clients', 
            type: 'number',
            value: selectedPerf?.active_clients || 0
          },
          { 
            key: 'new_clients', 
            label: 'New Clients', 
            type: 'number',
            value: selectedPerf?.new_clients || 0
          },
          { 
            key: 'staff_count', 
            label: 'Staff Count', 
            type: 'number',
            value: selectedPerf?.staff_count || 0
          },
        ]}
      />

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`performance record ${selectedPerf?.id}`}
      />
    </div>
  );
};

// The other table components (ClientsTable, LoanPaymentsTable, PerformanceTargetsTable, ClientVisitsTable)
// would follow similar enhancement patterns with filtering, sorting, and additional fields

// Clients Table with Search
export const ClientsTable = ({ clients, onUpdate, onDelete }: { clients: Client[]; onUpdate: (client: Client) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    Object.values(client).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  ));

  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
  const paginatedData = filteredClients.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setEditModalOpen(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setDeleteModalOpen(true);
  };

  const handleSave = (updatedClient: Client) => {
    onUpdate(updatedClient);
    setEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedClient) {
      onDelete(selectedClient.client_id);
    }
    setDeleteModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search clients by any field..."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Client ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Phone</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Loan Officer</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Branch</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Reg Date</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((client) => (
              <tr key={client.client_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{client.client_id}</td>
                <td className="py-3 px-4">{client.first_name} {client.last_name}</td>
                <td className="py-3 px-4">{client.phone_number}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' : 
                    client.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="py-3 px-4">{client.loan_officer}</td>
                <td className="py-3 px-4">{client.branch_id}</td>
                <td className="py-3 px-4">{new Date(client.registration_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(client)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(client)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={handleSave}
        fields={[
          { 
            key: 'client_id', 
            label: 'Client ID',
            value: selectedClient?.client_id || ''
          },
          { 
            key: 'first_name', 
            label: 'First Name',
            value: selectedClient?.first_name || ''
          },
          { 
            key: 'last_name', 
            label: 'Last Name',
            value: selectedClient?.last_name || ''
          },
          { 
            key: 'phone_number', 
            label: 'Phone Number',
            value: selectedClient?.phone_number || ''
          },
          { 
            key: 'status', 
            label: 'Status', 
            type: 'select',
            options: ['active', 'inactive', 'pending'],
            value: selectedClient?.status || ''
          },
          { 
            key: 'loan_officer', 
            label: 'Loan Officer',
            value: selectedClient?.loan_officer || ''
          },
          { 
            key: 'branch_id', 
            label: 'Branch ID',
            value: selectedClient?.branch_id || ''
          },
          { 
            key: 'registration_date', 
            label: 'Registration Date', 
            type: 'date',
            value: selectedClient?.registration_date ? new Date(selectedClient.registration_date).toISOString().split('T')[0] : ''
          },
        ]}
      />

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`client ${selectedClient?.first_name} ${selectedClient?.last_name}`}
      />
    </div>
  );
};

// Loan Payments Table with Search
export const LoanPaymentsTable = ({ payments, onUpdate, onDelete }: { payments: LoanPayment[]; onUpdate: (payment: LoanPayment) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<LoanPayment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPayments = payments.filter(payment =>
    Object.values(payment).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);
  const paginatedData = filteredPayments.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleEdit = (payment: LoanPayment) => {
    setSelectedPayment(payment);
    setEditModalOpen(true);
  };

  const handleDelete = (payment: LoanPayment) => {
    setSelectedPayment(payment);
    setDeleteModalOpen(true);
  };

  const handleSave = (updatedPayment: LoanPayment) => {
    onUpdate(updatedPayment);
    setEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedPayment) {
      onDelete(selectedPayment.payment_id);
    }
    setDeleteModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search payments by any field..."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Payment ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Loan ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Amount Paid</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Payment Date</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Principal</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Interest</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Fees</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Penalty</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((payment) => (
              <tr key={payment.payment_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{payment.payment_id}</td>
                <td className="py-3 px-4">{payment.loan_id}</td>
                <td className="py-3 px-4">{payment.amount_paid?.toLocaleString()}</td>
                <td className="py-3 px-4">{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">{payment.principal_amount?.toLocaleString()}</td>
                <td className="py-3 px-4">{payment.interest_amount?.toLocaleString()}</td>
                <td className="py-3 px-4">{payment.fees_amount?.toLocaleString()}</td>
                <td className="py-3 px-4">{payment.penalty_amount?.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(payment)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(payment)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={handleSave}
        fields={[
          { 
            key: 'payment_id', 
            label: 'Payment ID',
            value: selectedPayment?.payment_id || ''
          },
          { 
            key: 'loan_id', 
            label: 'Loan ID',
            value: selectedPayment?.loan_id || ''
          },
          { 
            key: 'amount_paid', 
            label: 'Amount Paid', 
            type: 'number',
            value: selectedPayment?.amount_paid || 0
          },
          { 
            key: 'payment_date', 
            label: 'Payment Date', 
            type: 'date',
            value: selectedPayment?.payment_date ? new Date(selectedPayment.payment_date).toISOString().split('T')[0] : ''
          },
          { 
            key: 'principal_amount', 
            label: 'Principal Amount', 
            type: 'number',
            value: selectedPayment?.principal_amount || 0
          },
          { 
            key: 'interest_amount', 
            label: 'Interest Amount', 
            type: 'number',
            value: selectedPayment?.interest_amount || 0
          },
          { 
            key: 'fees_amount', 
            label: 'Fees Amount', 
            type: 'number',
            value: selectedPayment?.fees_amount || 0
          },
          { 
            key: 'penalty_amount', 
            label: 'Penalty Amount', 
            type: 'number',
            value: selectedPayment?.penalty_amount || 0
          },
        ]}
      />

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`payment ${selectedPayment?.payment_id}`}
      />
    </div>
  );
};

// Performance Targets Table with Search
export const PerformanceTargetsTable = ({ targets, onUpdate, onDelete }: { targets: PerformanceTarget[]; onUpdate: (target: PerformanceTarget) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<PerformanceTarget | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTargets = targets.filter(target =>
    Object.values(target).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredTargets.length / rowsPerPage);
  const paginatedData = filteredTargets.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleEdit = (target: PerformanceTarget) => {
    setSelectedTarget(target);
    setEditModalOpen(true);
  };

  const handleDelete = (target: PerformanceTarget) => {
    setSelectedTarget(target);
    setDeleteModalOpen(true);
  };

  const handleSave = (updatedTarget: PerformanceTarget) => {
    onUpdate(updatedTarget);
    setEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedTarget) {
      onDelete(selectedTarget.id);
    }
    setDeleteModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search targets by any field..."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Target For</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Target Type</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Employee ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Branch ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Period</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Target Value</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((target) => (
              <tr key={target.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{target.id}</td>
                <td className="py-3 px-4">{target.target_for}</td>
                <td className="py-3 px-4">{target.target_type}</td>
                <td className="py-3 px-4">{target.employee_id || '-'}</td>
                <td className="py-3 px-4">{target.branch_id || '-'}</td>
                <td className="py-3 px-4">{target.period}</td>
                <td className="py-3 px-4">{target.target_value}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(target)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(target)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={handleSave}
        fields={[
          { 
            key: 'id', 
            label: 'ID',
            value: selectedTarget?.id || ''
          },
          { 
            key: 'target_for', 
            label: 'Target For',
            value: selectedTarget?.target_for || ''
          },
          { 
            key: 'target_type', 
            label: 'Target Type',
            value: selectedTarget?.target_type || ''
          },
          { 
            key: 'employee_id', 
            label: 'Employee ID',
            value: selectedTarget?.employee_id || ''
          },
          { 
            key: 'branch_id', 
            label: 'Branch ID',
            value: selectedTarget?.branch_id || ''
          },
          { 
            key: 'period', 
            label: 'Period', 
            type: 'select',
            options: ['daily', 'weekly', 'monthly'],
            value: selectedTarget?.period || ''
          },
          { 
            key: 'target_value', 
            label: 'Target Value', 
            type: 'number',
            value: selectedTarget?.target_value || 0
          },
        ]}
      />

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`target ${selectedTarget?.id}`}
      />
    </div>
  );
};

// Client Visits Table with Search
export const ClientVisitsTable = ({ visits, onUpdate, onDelete }: { visits: ClientVisit[]; onUpdate: (visit: ClientVisit) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<ClientVisit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVisits = visits.filter(visit =>
    Object.values(visit).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const totalPages = Math.ceil(filteredVisits.length / rowsPerPage);
  const paginatedData = filteredVisits.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleEdit = (visit: ClientVisit) => {
    setSelectedVisit(visit);
    setEditModalOpen(true);
  };

  const handleDelete = (visit: ClientVisit) => {
    setSelectedVisit(visit);
    setDeleteModalOpen(true);
  };

  const handleSave = (updatedVisit: ClientVisit) => {
    onUpdate(updatedVisit);
    setEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedVisit) {
      onDelete(selectedVisit.visit_id);
    }
    setDeleteModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search visits by any field..."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Visit ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Employee ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Client ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Visit Date</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Purpose</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Outcome</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((visit) => (
              <tr key={visit.visit_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{visit.visit_id}</td>
                <td className="py-3 px-4">{visit.employee_id}</td>
                <td className="py-3 px-4">{visit.client_id}</td>
                <td className="py-3 px-4">{new Date(visit.visit_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">{visit.purpose}</td>
                <td className="py-3 px-4">{visit.outcome || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(visit)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(visit)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={handleSave}
        fields={[
          { 
            key: 'visit_id', 
            label: 'Visit ID',
            value: selectedVisit?.visit_id || ''
          },
          { 
            key: 'employee_id', 
            label: 'Employee ID',
            value: selectedVisit?.employee_id || ''
          },
          { 
            key: 'client_id', 
            label: 'Client ID',
            value: selectedVisit?.client_id || ''
          },
          { 
            key: 'visit_date', 
            label: 'Visit Date', 
            type: 'date',
            value: selectedVisit?.visit_date ? new Date(selectedVisit.visit_date).toISOString().split('T')[0] : ''
          },
          { 
            key: 'purpose', 
            label: 'Purpose',
            value: selectedVisit?.purpose || ''
          },
          { 
            key: 'outcome', 
            label: 'Outcome',
            value: selectedVisit?.outcome || ''
          },
          { 
            key: 'next_action', 
            label: 'Next Action',
            value: selectedVisit?.next_action || ''
          },
          { 
            key: 'next_visit_date', 
            label: 'Next Visit Date', 
            type: 'date',
            value: selectedVisit?.next_visit_date ? new Date(selectedVisit.next_visit_date).toISOString().split('T')[0] : ''
          },
          { 
            key: 'location', 
            label: 'Location',
            value: selectedVisit?.location || ''
          },
          { 
            key: 'branch_id', 
            label: 'Branch ID', 
            type: 'number',
            value: selectedVisit?.branch_id || ''
          },
        ]}
      />

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`visit ${selectedVisit?.visit_id}`}
      />
    </div>
  );
};