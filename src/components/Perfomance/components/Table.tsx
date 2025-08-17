import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Trash2 } from 'lucide-react';

// Unified type definitions
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
  product_type: string;
  amount_disbursed: number;
  outstanding_balance: number;
  status: 'Disbursed' | 'Active' | 'Completed' | 'Defaulted';
  disbursement_date: string;
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
  date: string;
  period: string;
  loans_disbursed: number;
  disbursement_target: number;
  clients_visited: number;
};

type BranchPerformance = {
  id: string;
  branch_id: string;
  date: string;
  period: string;
  total_loans_disbursed: number;
  disbursement_target: number;
  total_collection: number;
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
  onSave,
  fields,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => void;
  fields: {
    key: string;
    label: string;
    type?: string;
    options?: string[];
    value: any;
  }[];
}) => {
  const [formData, setFormData] = useState<any>({});

  // Sync formData whenever fields change
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
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
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

// Clients Table
export const ClientsTable = ({ clients, onUpdate, onDelete }: { clients: Client[]; onUpdate: (client: Client) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const totalPages = Math.ceil(clients.length / rowsPerPage);
  const paginatedData = clients.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
        onSave={handleSave}
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

// Loans Table
export const LoansTable = ({ loans, onUpdate, onDelete }: { loans: Loan[]; onUpdate: (loan: Loan) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  
  const totalPages = Math.ceil(loans.length / rowsPerPage);
  const paginatedData = loans.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Loan ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Client ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Product Type</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Amount</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Outstanding</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Disbursement Date</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((loan) => (
              <tr key={loan.loan_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{loan.loan_id}</td>
                <td className="py-3 px-4">{loan.client_id}</td>
                <td className="py-3 px-4">{loan.product_type}</td>
                <td className="py-3 px-4">{loan.amount_disbursed?.toLocaleString()}</td>
                <td className="py-3 px-4">{loan.outstanding_balance?.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    loan.status === 'Disbursed' ? 'bg-blue-100 text-blue-800' : 
                    loan.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    loan.status === 'Completed' ? 'bg-purple-100 text-purple-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {loan.status}
                  </span>
                </td>
                <td className="py-3 px-4">{new Date(loan.disbursement_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(loan)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(loan)}
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
        onSave={handleSave}
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
            key: 'outstanding_balance', 
            label: 'Outstanding Balance', 
            type: 'number',
            value: selectedLoan?.outstanding_balance || 0
          },
          { 
            key: 'status', 
            label: 'Status', 
            type: 'select',
            options: ['Disbursed', 'Active', 'Completed', 'Defaulted'],
            value: selectedLoan?.status || ''
          },
          { 
            key: 'disbursement_date', 
            label: 'Disbursement Date', 
            type: 'date',
            value: selectedLoan?.disbursement_date ? new Date(selectedLoan.disbursement_date).toISOString().split('T')[0] : ''
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

// Loan Payments Table
export const LoanPaymentsTable = ({ payments, onUpdate, onDelete }: { payments: LoanPayment[]; onUpdate: (payment: LoanPayment) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<LoanPayment | null>(null);
  
  const totalPages = Math.ceil(payments.length / rowsPerPage);
  const paginatedData = payments.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
        onSave={handleSave}
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

// Employee Performance Table
export const EmployeePerformanceTable = ({ performance, onUpdate, onDelete }: { performance: EmployeePerformance[]; onUpdate: (perf: EmployeePerformance) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPerf, setSelectedPerf] = useState<EmployeePerformance | null>(null);
  
  const totalPages = Math.ceil(performance.length / rowsPerPage);
  const paginatedData = performance.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Clients Visited</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((perf) => (
              <tr key={perf.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{perf.id}</td>
                <td className="py-3 px-4">{perf.employee_id}</td>
                <td className="py-3 px-4">{new Date(perf.date).toLocaleDateString()}</td>
                <td className="py-3 px-4">{perf.period}</td>
                <td className="py-3 px-4">{perf.loans_disbursed}</td>
                <td className="py-3 px-4">{perf.disbursement_target}</td>
                <td className="py-3 px-4">{perf.clients_visited}</td>
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
        onSave={handleSave}
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
            key: 'date', 
            label: 'Date', 
            type: 'date',
            value: selectedPerf?.date ? new Date(selectedPerf.date).toISOString().split('T')[0] : ''
          },
          { 
            key: 'period', 
            label: 'Period', 
            type: 'select',
            options: ['daily', 'weekly', 'monthly'],
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

// Branch Performance Table
export const BranchPerformanceTable = ({ performance, onUpdate, onDelete }: { performance: BranchPerformance[]; onUpdate: (perf: BranchPerformance) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPerf, setSelectedPerf] = useState<BranchPerformance | null>(null);
  
  const totalPages = Math.ceil(performance.length / rowsPerPage);
  const paginatedData = performance.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Total Collection</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((perf) => (
              <tr key={perf.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{perf.id}</td>
                <td className="py-3 px-4">{perf.branch_id}</td>
                <td className="py-3 px-4">{new Date(perf.date).toLocaleDateString()}</td>
                <td className="py-3 px-4">{perf.period}</td>
                <td className="py-3 px-4">{perf.total_loans_disbursed}</td>
                <td className="py-3 px-4">{perf.disbursement_target}</td>
                <td className="py-3 px-4">{perf.total_collection?.toLocaleString()}</td>
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
        onSave={handleSave}
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
            key: 'date', 
            label: 'Date', 
            type: 'date',
            value: selectedPerf?.date ? new Date(selectedPerf.date).toISOString().split('T')[0] : ''
          },
          { 
            key: 'period', 
            label: 'Period', 
            type: 'select',
            options: ['daily', 'weekly', 'monthly'],
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

// Performance Targets Table
export const PerformanceTargetsTable = ({ targets, onUpdate, onDelete }: { targets: PerformanceTarget[]; onUpdate: (target: PerformanceTarget) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<PerformanceTarget | null>(null);
  
  const totalPages = Math.ceil(targets.length / rowsPerPage);
  const paginatedData = targets.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
        onSave={handleSave}
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

// Client Visits Table
export const ClientVisitsTable = ({ visits, onUpdate, onDelete }: { visits: ClientVisit[]; onUpdate: (visit: ClientVisit) => void; onDelete: (id: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<ClientVisit | null>(null);

  
  
  const totalPages = Math.ceil(visits.length / rowsPerPage);
  const paginatedData = visits.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
        onSave={handleSave}
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