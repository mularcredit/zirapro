import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Receipt,
  CreditCard,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  TrendingUp,
  Wallet,
  FileText,
  User,
  MoreVertical,
  ArrowUpRight,
  DollarSign,
  Activity,
  Zap,
  Target,
  X,
  Upload,
  Camera,
  Paperclip,
  Grid3X3,
  List,
  ChevronDown,
  Building,
  Users,
  Home,
  Banknote,
  Loader,
  Check,
  Ban,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Adjust the import path as needed

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt?: string;
  submittedBy: string;
  location: string;
  branch: string;
  department: string;
  expenseType: string;
  employeeId?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  avatar?: string;
  receiptUploaded?: boolean;
}

interface Employee {
  id: string;
  office: string;
  job_level: string;
}

const EXPENSE_TYPES = [
  { id: 'operational', name: 'Operational Expenses' },
  { id: 'travel', name: 'Travel & Transport' },
  { id: 'rent', name: 'Rent & Utilities' },
  { id: 'petty-cash', name: 'Petty Cash' },
  { id: 'employee', name: 'Employee Expenses' },
  { id: 'maintenance', name: 'Maintenance & Repairs' }
];

const EXPENSE_CATEGORIES = [
  { id: 'transport', name: 'Transport', color: 'bg-blue-500' },
  { id: 'accommodation', name: 'Accommodation', color: 'bg-purple-500' },
  { id: 'meals', name: 'Meals & Entertainment', color: 'bg-orange-500' },
  { id: 'office', name: 'Office Supplies', color: 'bg-green-500' },
  { id: 'communication', name: 'Communication', color: 'bg-indigo-500' },
  { id: 'training', name: 'Training & Development', color: 'bg-pink-500' },
  { id: 'medical', name: 'Medical', color: 'bg-red-500' },
  { id: 'fuel', name: 'Fuel', color: 'bg-yellow-500' },
  { id: 'maintenance', name: 'Maintenance', color: 'bg-gray-500' },
  { id: 'rent', name: 'Rent & Utilities', color: 'bg-cyan-500' },
  { id: 'petty-cash', name: 'Petty Cash', color: 'bg-teal-500' },
  { id: 'utilities', name: 'Utilities', color: 'bg-emerald-500' },
  { id: 'other', name: 'Other', color: 'bg-slate-500' }
];

const ExpenseModule: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState<string>('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalExpense, setApprovalExpense] = useState<Expense | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [receiptUploadExpense, setReceiptUploadExpense] = useState<Expense | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [newExpense, setNewExpense] = useState({
    title: '',
    category: '',
    amount: '',
    date: '',
    description: '',
    location: '',
    branch: '',
    department: '',
    expenseType: '',
    employeeId: '',
    receiptFile: null as File | null
  });

  // Fetch expenses and employee data from Supabase
  useEffect(() => {
    fetchExpenses();
    fetchEmployeeData();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Transform data to match our interface
        const formattedData: Expense[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          amount: item.amount,
          date: item.date,
          description: item.description,
          status: item.status,
          receipt: item.receipt,
          submittedBy: item.submitted_by,
          location: item.location,
          branch: item.branch,
          department: item.department,
          expenseType: item.expense_type,
          employeeId: item.employee_id,
          approvedBy: item.approved_by,
          approvedDate: item.approved_date,
          rejectionReason: item.rejection_reason,
          avatar: item.avatar,
          receiptUploaded: !!item.receipt
        }));
        
        setExpenses(formattedData);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      alert('Error fetching expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('Office, "Job Level"');

      if (error) {
        throw error;
      }

      if (data) {
        // Extract unique branches (offices) and departments (job levels)
        const uniqueBranches = [...new Set(data.map(emp => emp.Office).filter(Boolean))];
        const uniqueDepartments = [...new Set(data.map(emp => emp["Job Level"]).filter(Boolean))];
        
        setBranches(uniqueBranches);
        setDepartments(uniqueDepartments);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      // Fallback to default values if employees table doesn't exist or has issues
      setBranches(['Nairobi HQ', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru']);
      setDepartments(['Human Resources', 'Finance', 'IT & Technology', 'Operations', 'Sales']);
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const approvedExpenses = expenses.filter(e => e.status === 'approved');
    const pendingExpenses = expenses.filter(e => e.status === 'pending');
    const rejectedExpenses = expenses.filter(e => e.status === 'rejected');

    // Calculate by expense type
    const rentExpenses = expenses.filter(e => e.expenseType === 'rent').reduce((sum, expense) => sum + expense.amount, 0);
    const pettyCashExpenses = expenses.filter(e => e.expenseType === 'petty-cash').reduce((sum, expense) => sum + expense.amount, 0);
    const employeeExpenses = expenses.filter(e => e.expenseType === 'employee').reduce((sum, expense) => sum + expense.amount, 0);

    const thisMonth = new Date().getMonth();
    const thisMonthExpenses = expenses.filter(e => new Date(e.date).getMonth() === thisMonth);
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      total: totalExpenses,
      approved: approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      pending: pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      rejected: rejectedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      count: expenses.length,
      approvedCount: approvedExpenses.length,
      pendingCount: pendingExpenses.length,
      rejectedCount: rejectedExpenses.length,
      thisMonth: thisMonthTotal,
      avgExpense: totalExpenses / expenses.length || 0,
      rent: rentExpenses,
      pettyCash: pettyCashExpenses,
      employee: employeeExpenses
    };
  }, [expenses]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      const matchesBranch = branchFilter === 'all' || expense.branch === branchFilter;
      const matchesDepartment = departmentFilter === 'all' || expense.department === departmentFilter;
      const matchesExpenseType = expenseTypeFilter === 'all' || expense.expenseType === expenseTypeFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesBranch && matchesDepartment && matchesExpenseType;
    });
  }, [expenses, searchTerm, statusFilter, categoryFilter, branchFilter, departmentFilter, expenseTypeFilter]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let receiptUrl = '';
      
      // Upload receipt if provided
      if (newExpense.receiptFile) {
        const fileExt = newExpense.receiptFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('expense-receipts')
          .upload(filePath, newExpense.receiptFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('expense-receipts')
          .getPublicUrl(filePath);
          
        receiptUrl = publicUrl;
      }

      // Insert expense into database
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            title: newExpense.title,
            category: newExpense.category,
            amount: parseFloat(newExpense.amount),
            date: newExpense.date,
            description: newExpense.description,
            location: newExpense.location,
            branch: newExpense.branch,
            department: newExpense.department,
            expense_type: newExpense.expenseType,
            employee_id: newExpense.employeeId,
            receipt: receiptUrl,
            submitted_by: 'Current User', // You would get this from your auth system
            avatar: 'CU',
            status: 'pending'
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Add the new expense to our state
        const newExpenseData: Expense = {
          id: data[0].id,
          title: data[0].title,
          category: data[0].category,
          amount: data[0].amount,
          date: data[0].date,
          description: data[0].description,
          status: data[0].status,
          receipt: data[0].receipt,
          submittedBy: data[0].submitted_by,
          location: data[0].location,
          branch: data[0].branch,
          department: data[0].department,
          expenseType: data[0].expense_type,
          employeeId: data[0].employee_id,
          avatar: data[0].avatar,
          receiptUploaded: !!data[0].receipt
        };
        
        setExpenses([newExpenseData, ...expenses]);
      }

      // Reset form
      setNewExpense({
        title: '',
        category: '',
        amount: '',
        date: '',
        description: '',
        location: '',
        branch: '',
        department: '',
        expenseType: '',
        employeeId: '',
        receiptFile: null
      });
      
      setShowAddForm(false);
      alert('Expense submitted successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleApprovalAction = async () => {
    if (!approvalExpense) return;
    
    setUploading(true);
    try {
      const updateData: any = {
        status: approvalAction,
        approved_by: 'Current Manager', // You would get this from your auth system
        approved_date: new Date().toISOString()
      };

      if (approvalAction === 'reject' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', approvalExpense.id);

      if (error) {
        throw error;
      }

      // Update local state
      setExpenses(expenses.map(expense => 
        expense.id === approvalExpense.id 
          ? {
              ...expense,
              status: approvalAction as 'approved' | 'rejected',
              approvedBy: 'Current Manager',
              approvedDate: new Date().toISOString(),
              rejectionReason: approvalAction === 'reject' ? rejectionReason : undefined
            }
          : expense
      ));

      setShowApprovalModal(false);
      setApprovalExpense(null);
      setRejectionReason('');
      alert(`Expense ${approvalAction}d successfully!`);
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Error updating expense. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleReceiptUpload = async () => {
    if (!receiptUploadExpense || !receiptFile) return;
    
    setUploading(true);
    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('expense-receipts')
        .upload(filePath, receiptFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('expense-receipts')
        .getPublicUrl(filePath);

      const { error } = await supabase
        .from('expenses')
        .update({ receipt: publicUrl })
        .eq('id', receiptUploadExpense.id);

      if (error) {
        throw error;
      }

      // Update local state
      setExpenses(expenses.map(expense => 
        expense.id === receiptUploadExpense.id 
          ? { ...expense, receipt: publicUrl, receiptUploaded: true }
          : expense
      ));

      setShowReceiptUpload(false);
      setReceiptUploadExpense(null);
      setReceiptFile(null);
      alert('Receipt uploaded successfully!');
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert('Error uploading receipt. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewExpense({
        ...newExpense,
        receiptFile: e.target.files[0]
      });
    }
  };

  const handleReceiptFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return EXPENSE_CATEGORIES.find(cat => cat.id === categoryId) || EXPENSE_CATEGORIES[12];
  };

  const getExpenseTypeName = (expenseTypeId: string) => {
    return EXPENSE_TYPES.find(type => type.id === expenseTypeId)?.name || expenseTypeId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-600 bg-emerald-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-gray-900" />
          <p className="mt-2 text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Expense Management</h1>
              <p className="text-sm text-gray-600 mt-1">Track expenses across branches, departments, rent, and petty cash</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Expense</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Total</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(summaryStats.total)}</p>
      </div>
      <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
    </div>
  </div>

  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Rent & Utilities</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(summaryStats.rent)}</p>
      </div>
      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
    </div>
  </div>

  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Petty Cash</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(summaryStats.pettyCash)}</p>
      </div>
      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
    </div>
  </div>

  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Travel</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(summaryStats.employee)}</p>
      </div>
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    </div>
  </div>

  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Pending</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(summaryStats.pending)}</p>
      </div>
      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
    </div>
  </div>

  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">This Month</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(summaryStats.thisMonth)}</p>
      </div>
      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
    </div>
  </div>
</div>
        {/* Enhanced Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search expenses, employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-80 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={expenseTypeFilter}
                  onChange={(e) => setExpenseTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                >
                  <option value="all">All Types</option>
                  {EXPENSE_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors text-sm ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors text-sm ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Filters */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              >
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map(department => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              >
                <option value="all">All Categories</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Expense List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {filteredExpenses.length} expenses
            </h2>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Receipt className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 lg:grid-cols-2 gap-4" 
              : "space-y-3"
            }>
              {filteredExpenses.map((expense) => {
                const categoryInfo = getCategoryInfo(expense.category);
                
                return (
                  <div
                    key={expense.id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                          <div className={`w-2 h-2 ${categoryInfo.color} rounded-full mt-2 flex-shrink-0`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-base font-medium text-gray-900 truncate">
                                {expense.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(expense.status)}`}>
                                {expense.status}
                              </span>
                              {expense.status === 'approved' && !expense.receiptUploaded && (
                                <span className="px-2 py-1 rounded-md text-xs font-medium text-orange-600 bg-orange-50">
                                  Receipt Pending
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {expense.description}
                            </p>
                            {/* Enhanced Details */}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Building className="w-3 h-3" />
                                <span>{expense.branch}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{expense.department}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-400">Type:</span>
                                <span>{getExpenseTypeName(expense.expenseType)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {categoryInfo.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-6 text-xs text-gray-600">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                              {expense.avatar}
                            </div>
                            <div className="flex flex-col">
                              <span>{expense.submittedBy}</span>
                              {expense.employeeId && (
                                <span className="text-gray-400">ID: {expense.employeeId}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(expense.date).toLocaleDateString('en-GB')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{expense.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {expense.status === 'pending' && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setApprovalExpense(expense);
                                  setApprovalAction('approve');
                                  setShowApprovalModal(true);
                                }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-medium"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => {
                                  setApprovalExpense(expense);
                                  setApprovalAction('reject');
                                  setShowApprovalModal(true);
                                }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                          
                          {expense.status === 'approved' && !expense.receiptUploaded && (
                            <button
                              onClick={() => {
                                setReceiptUploadExpense(expense);
                                setShowReceiptUpload(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Upload Receipt</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => setSelectedExpense(expense)}
                            className="text-xs font-medium text-gray-900 hover:text-gray-700 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                      {expense.status === 'rejected' && expense.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason</p>
                              <p className="text-xs text-red-700">{expense.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {expense.status === 'approved' && expense.approvedBy && (
                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                          <div className="flex items-center space-x-2 text-xs text-emerald-800">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              Approved by <strong>{expense.approvedBy}</strong> on{' '}
                              {expense.approvedDate && new Date(expense.approvedDate).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Add Expense Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">New Expense</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleAddExpense} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      placeholder="Expense title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Type
                    </label>
                    <select
                      value={newExpense.expenseType}
                      onChange={(e) => setNewExpense({...newExpense, expenseType: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      required
                    >
                      <option value="">Select type</option>
                      {EXPENSE_TYPES.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      required
                    >
                      <option value="">Select category</option>
                      {EXPENSE_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (KES)
                    </label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch
                    </label>
                    <select
                      value={newExpense.branch}
                      onChange={(e) => setNewExpense({...newExpense, branch: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      required
                    >
                      <option value="">Select branch</option>
                      {branches.map(branch => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={newExpense.department}
                      onChange={(e) => setNewExpense({...newExpense, department: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map(department => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newExpense.location}
                      onChange={(e) => setNewExpense({...newExpense, location: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      placeholder="City or location"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={newExpense.employeeId}
                      onChange={(e) => setNewExpense({...newExpense, employeeId: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      placeholder="EMP001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
                    placeholder="Expense description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {newExpense.receiptFile 
                        ? `Selected: ${newExpense.receiptFile.name}` 
                        : 'Upload receipt'
                      }
                    </p>
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors px-3 py-1.5 bg-gray-100 rounded-md">
                        Choose file
                      </span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    {uploading && <Loader className="w-4 h-4 animate-spin" />}
                    <span>{uploading ? 'Submitting...' : 'Submit Expense'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && approvalExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'} Expense
                </h2>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">{approvalExpense.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{formatCurrency(approvalExpense.amount)}</p>
              </div>

              {approvalAction === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprovalAction}
                  disabled={uploading || (approvalAction === 'reject' && !rejectionReason.trim())}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center space-x-2 ${
                    approvalAction === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white'
                      : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white'
                  }`}
                >
                  {uploading && <Loader className="w-4 h-4 animate-spin" />}
                  <span>{uploading ? 'Processing...' : (approvalAction === 'approve' ? 'Approve' : 'Reject')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Upload Modal */}
      {showReceiptUpload && receiptUploadExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Upload Receipt</h2>
                <button
                  onClick={() => setShowReceiptUpload(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">{receiptUploadExpense.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{formatCurrency(receiptUploadExpense.amount)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    {receiptFile 
                      ? `Selected: ${receiptFile.name}` 
                      : 'Upload receipt as proof of expense'
                    }
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors px-3 py-1.5 bg-gray-100 rounded-md">
                      Choose file
                    </span>
                    <input
                      type="file"
                      onChange={handleReceiptFileUpload}
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowReceiptUpload(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReceiptUpload}
                  disabled={uploading || !receiptFile}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
                >
                  {uploading && <Loader className="w-4 h-4 animate-spin" />}
                  <span>{uploading ? 'Uploading...' : 'Upload Receipt'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Expense Details Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Expense Details</h2>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">{selectedExpense.title}</h3>
                <p className="text-sm text-gray-600">{selectedExpense.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Amount</p>
                  <p className="text-gray-900">{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(selectedExpense.status)}`}>
                    {selectedExpense.status}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Date</p>
                  <p className="text-gray-900">{new Date(selectedExpense.date).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Location</p>
                  <p className="text-gray-900">{selectedExpense.location}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Branch</p>
                  <p className="text-gray-900">{selectedExpense.branch}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Department</p>
                  <p className="text-gray-900">{selectedExpense.department}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Submitted by</p>
                  <p className="text-gray-900">{selectedExpense.submittedBy}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Employee ID</p>
                  <p className="text-gray-900">{selectedExpense.employeeId || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Category</p>
                  <p className="text-gray-900">{getCategoryInfo(selectedExpense.category).name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Type</p>
                  <p className="text-gray-900">{getExpenseTypeName(selectedExpense.expenseType)}</p>
                </div>
              </div>

              {selectedExpense.receipt && (
                <div>
                  <p className="font-medium text-gray-700 mb-2">Receipt</p>
                  <a
                    href={selectedExpense.receipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Receipt</span>
                  </a>
                </div>
              )}

              {selectedExpense.status === 'approved' && selectedExpense.approvedBy && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <p className="text-sm text-emerald-800">
                    Approved by <strong>{selectedExpense.approvedBy}</strong> on{' '}
                    {selectedExpense.approvedDate && new Date(selectedExpense.approvedDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}

              {selectedExpense.status === 'rejected' && selectedExpense.rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{selectedExpense.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseModule;