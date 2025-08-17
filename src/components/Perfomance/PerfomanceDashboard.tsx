import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Briefcase, Building, Clock, AlertCircle, Plus, 
  Edit, Trash2, Filter, X, Check, BarChart2, Target, Calendar,
  CheckCircle, Clock as ClockIcon, Download, PieChart, UserCheck,
  UserX, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Coins,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import ClientModal from './components/ClientModal';
import LoanModal from './components/LoanModal';
import LoanPaymentModal from './components/LoanPaymentModal';
import EmployeePerformanceModal from './components/EmployeePerformanceModal';
import PerformanceTargetModal from './components/PerformanceTargetModal';
import ClientVisitModal from './components/ClientVisitModal';
import BranchPerformanceModal from './BranchPerformanceModal';

import { 
  ClientsTable, 
  LoansTable, 
  LoanPaymentsTable, 
  EmployeePerformanceTable, 
  BranchPerformanceTable, 
  PerformanceTargetsTable, 
  ClientVisitsTable
} from './components/Table'; 

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Types based on your Supabase schema
interface Client {
  client_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  status: string;
  loan_officer: string;
  branch_id: number;
  registration_date: string;
}

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

interface LoanPayment {
  payment_id: number;
  loan_id: string;
  amount_paid: number;
  payment_date: string;
  principal_amount: number;
  interest_amount: number;
  fees_amount: number;
  penalty_amount: number;
}

interface EmployeePerformance {
  id: number;
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

interface BranchPerformance {
  id: number;
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

interface PerformanceTarget {
  id: number;
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

interface ClientVisit {
  visit_id: number;
  employee_id: string;
  client_id: string;
  visit_date: string;
  purpose: string;
  outcome: string | null;
  next_action: string | null;
  next_visit_date: string | null;
  location: string | null;
  branch_id: number | null;
}

interface Employee {
  "Employee Number": string;
  "First Name": string;
  "Last Name": string;
  "Job Title": string;
  "Branch": string;
  "Entity": string;
}

interface Branch {
  id: number;
  "Branch Office": string;
  "Area": string;
}

const GlowButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}> = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  size = 'md', 
  onClick, 
  disabled = false 
}) => {
  const baseClasses = "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-300 border";
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  const variantClasses = {
    primary: "bg-green-50 border-green-500 text-green-600 hover:bg-green-100 hover:border-green-600 hover:text-green-700 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] focus:shadow-[0_0_25px_rgba(34,197,94,0.6)]",
    secondary: "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400",
    danger: "bg-red-50 border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 hover:text-red-700 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
  };

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const StatusBadge: React.FC<{ status: string; value?: number }> = ({ status, value }) => {
  const statusClasses = {
    'Excellent': 'bg-green-100 text-green-800',
    'Good': 'bg-blue-100 text-blue-800',
    'Fair': 'bg-yellow-100 text-yellow-800',
    'Poor': 'bg-red-100 text-red-800',
  };

  let performanceStatus = 'Excellent';
  if (status === 'PAR') {
    performanceStatus = value! < 2 ? 'Excellent' : value! < 5 ? 'Good' : value! < 8 ? 'Fair' : 'Poor';
  } else if (status === 'Collection') {
    performanceStatus = value! > 97 ? 'Excellent' : value! > 95 ? 'Good' : value! > 90 ? 'Fair' : 'Poor';
  } else if (status === 'Attendance') {
    performanceStatus = value! > 95 ? 'Excellent' : value! > 90 ? 'Good' : value! > 85 ? 'Fair' : 'Poor';
  }

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClasses[performanceStatus as keyof typeof statusClasses]}`}>
      {value ? `${value}%` : performanceStatus}
    </span>
  );
};

const SummaryCard: React.FC<{
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isPercentage?: boolean;
  unit?: string;
}> = ({
  label,
  value,
  icon: Icon,
  color,
  isPercentage = false,
  unit = ''
}) => {
  const colorClasses = {
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-gray-900 text-xl font-bold">
          {Math.round(value)}{isPercentage ? '%' : ''}{unit ? ` ${unit}` : ''}
        </p>
      </div>
    </div>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}> = ({ currentPage, totalPages, onPageChange, className = '' }) => {
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
        
        {startPage > 1 && (
          <span className="px-2 py-1">...</span>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg border ${currentPage === page ? 'bg-green-100 border-green-500 text-green-600' : 'border-gray-200'}`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <span className="px-2 py-1">...</span>
        )}
        
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

const PerformanceDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'individual' | 'branch' | 'targets' | 'clients' | 'loans' | 'payments' | 'employeePerformance' | 'branchPerformance' | 'clientVisit'>('individual');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  
  // Pagination states
  const [employeePage, setEmployeePage] = useState(1);
  const [branchPage, setBranchPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  
  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanPayments, setLoanPayments] = useState<LoanPayment[]>([]);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([]);
  const [performanceTargets, setPerformanceTargets] = useState<PerformanceTarget[]>([]);
  const [clientVisits, setClientVisits] = useState<ClientVisit[]>([]);
  const [loading, setLoading] = useState(true);



  const [showClientModal, setShowClientModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEmployeePerfModal, setShowEmployeePerfModal] = useState(false);
  const [showBranchPerfModal, setShowBranchPerfModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);


  const handleOpenModal = (type: string, record: any = null) => {
    setCurrentRecord(record);
    switch(type) {
      case 'client': setShowClientModal(true); break;
      case 'loan': setShowLoanModal(true); break;
      case 'payment': setShowPaymentModal(true); break;
      case 'employeePerf': setShowEmployeePerfModal(true); break;
      case 'branchPerf': setShowBranchPerfModal(true); break;
      case 'target': setShowTargetModal(true); break;
      case 'visit': setShowVisitModal(true); break;
    }
  };

  const handleCloseModal = () => {
    setShowClientModal(false);
    setShowLoanModal(false);
    setShowPaymentModal(false);
    setShowEmployeePerfModal(false);
    setShowBranchPerfModal(false);
    setShowTargetModal(false);
    setShowVisitModal(false);
    setCurrentRecord(null);
  };

  const handleSaveRecord = async (type: string, record: any) => {
    try {
      // In a real app, you might want to update your local state here
      // or trigger a refresh of the relevant data
      console.log(`Saved ${type}:`, record);
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
    }
  };

  const handleDeleteRecord = async (type: string, id: any) => {
    try {
      let tableName = '';
      let idField = '';
      
      switch(type) {
        case 'client': 
          tableName = 'clients';
          idField = 'client_id';
          break;
        case 'loan': 
          tableName = 'loans';
          idField = 'loan_id';
          break;
        case 'payment': 
          tableName = 'loan_payments';
          idField = 'payment_id';
          break;
        case 'employeePerf': 
          tableName = 'employee_performance';
          idField = 'id';
          break;
        case 'branchPerf': 
          tableName = 'branch_performance';
          idField = 'id';
          break;
        case 'target': 
          tableName = 'performance_targets';
          idField = 'id';
          break;
        case 'visit': 
          tableName = 'client_visits';
          idField = 'visit_id';
          break;
      }
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idField, id);
      
      if (error) throw error;
      
      // In a real app, you would update your local state here
      console.log(`Deleted ${type} with ID:`, id);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };


  // Fetch all data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all tables in parallel
        const [
          { data: employeesData },
          { data: branchesData },
          { data: clientsData },
          { data: loansData },
          { data: loanPaymentsData },
          { data: employeePerformanceData },
          { data: branchPerformanceData },
          { data: performanceTargetsData },
          { data: clientVisitsData }
        ] = await Promise.all([
          supabase.from('employees').select('*'),
          supabase.from('kenya_branches').select('*'),
          supabase.from('clients').select('*'),
          supabase.from('loans').select('*'),
          supabase.from('loan_payments').select('*'),
          supabase.from('employee_performance').select('*'),
          supabase.from('branch_performance').select('*'),
          supabase.from('performance_targets').select('*'),
          supabase.from('client_visits').select('*')
        ]);

        if (employeesData) setEmployees(employeesData);
        if (branchesData) setBranches(branchesData);
        if (clientsData) setClients(clientsData);
        if (loansData) setLoans(loansData);
        if (loanPaymentsData) setLoanPayments(loanPaymentsData);
        if (employeePerformanceData) setEmployeePerformance(employeePerformanceData);
        if (branchPerformanceData) setBranchPerformance(branchPerformanceData);
        if (performanceTargetsData) setPerformanceTargets(performanceTargetsData);
        if (clientVisitsData) setClientVisits(clientVisitsData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      
      const [
        { data: clientsData },
        { data: loansData },
        { data: loanPaymentsData },
        { data: employeePerformanceData },
        { data: branchPerformanceData },
        { data: performanceTargetsData },
        { data: clientVisitsData }
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('loans').select('*'),
        supabase.from('loan_payments').select('*'),
        supabase.from('employee_performance').select('*'),
        supabase.from('branch_performance').select('*'),
        supabase.from('performance_targets').select('*'),
        supabase.from('client_visits').select('*')
      ]);

      if (clientsData) setClients(clientsData);
      if (loansData) setLoans(loansData);
      if (loanPaymentsData) setLoanPayments(loanPaymentsData);
      if (employeePerformanceData) setEmployeePerformance(employeePerformanceData);
      if (branchPerformanceData) setBranchPerformance(branchPerformanceData);
      if (performanceTargetsData) setPerformanceTargets(performanceTargetsData);
      if (clientVisitsData) setClientVisits(clientVisitsData);

    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process data to create employee performance objects
  const processedEmployees = employees.map(employee => {
    // Get employee's clients
    const employeeClients = clients.filter(client => client.loan_officer === employee["Employee Number"]);
    
    // Get employee's loans
    const employeeLoans = loans.filter(loan => loan.loan_officer === employee["Employee Number"]);
    
    // Get employee's performance data (latest monthly record)
    const latestPerformance = employeePerformance
      .filter(perf => perf.employee_id === employee["Employee Number"] && perf.period === 'monthly')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    // Get employee's targets
    const employeeTargets = performanceTargets
      .filter(target => target.employee_id === employee["Employee Number"] && target.is_active);
    
    // Calculate disbursement metrics
    const disbursementTarget = employeeTargets.find(t => t.target_type === 'disbursement')?.target_value || 0;
    const loansDisbursed = employeeLoans.filter(loan => 
      loan.status === 'Disbursed' || loan.status === 'Active' || loan.status === 'Completed'
    ).length;
    
    // Calculate collection metrics
    const collectionTarget = employeeTargets.find(t => t.target_type === 'collection')?.target_value || 0;
    const totalPortfolio = employeeLoans.reduce((sum, loan) => sum + (loan.amount_disbursed || 0), 0);
    const outstandingBalance = employeeLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0);
    const collectedAmount = totalPortfolio - outstandingBalance;
    const collectionRate = totalPortfolio > 0 ? (collectedAmount / totalPortfolio) * 100 : 0;
    
    // Calculate PAR
    const parLoans = employeeLoans.filter(loan => loan.par_days > 0);
    const parAmount = parLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0);
    const parRate = totalPortfolio > 0 ? (parAmount / totalPortfolio) * 100 : 0;
    
    // Calculate field visits
    const fieldVisitsTarget = employeeTargets.find(t => t.target_type === 'field_visits')?.target_value || 0;
    const fieldVisits = clientVisits
      .filter(visit => visit.employee_id === employee["Employee Number"])
      .length;
    
    // Calculate attendance
    const attendanceTarget = employeeTargets.find(t => t.target_type === 'attendance')?.target_value || 0;
    const attendanceDays = latestPerformance?.attendance_days || 0;
    const workingDays = latestPerformance?.working_days || 1;
    const attendanceRate = (attendanceDays / workingDays) * 100;
    
    // Calculate TAT
    const tatAverage = latestPerformance?.tat_average || 0;
    
    // Get branch info
    const branch = branches.find(
      b => b["Branch Office"] === employee.Branch
    );

    // Prepare disbursement targets for different periods
    const dailyDisbursementTarget = employeeTargets
      .find(t => t.target_type === 'disbursement' && t.period === 'daily')?.target_value || 0;
    const weeklyDisbursementTarget = employeeTargets
      .find(t => t.target_type === 'disbursement' && t.period === 'weekly')?.target_value || 0;
    
    // Calculate achieved disbursements (simplified - in a real app you'd filter by date ranges)
    const today = new Date().toISOString().split('T')[0];
    const todayDisbursements = employeeLoans.filter(loan => 
      loan.disbursement_date === today
    ).length;
    
    // This week's disbursements (simplified)
    const thisWeekDisbursements = Math.floor(employeeLoans.length / 4);
    
    return {
      id: employee["Employee Number"],
      name: `${employee["First Name"]} ${employee["Last Name"]}`,
      role: employee["Job Title"],
      branch: branch?.["Branch Office"]?.toLowerCase() || '',
      loansDisbursed,
      target: disbursementTarget,
      attendance: attendanceRate,
      fieldVisits,
      par: parRate,
      collection: collectionRate,
      tat: tatAverage,
      clients: employeeClients.map(client => ({
        id: client.client_id,
        name: `${client.first_name} ${client.last_name}`,
        status: client.status || 'active',
        loanAmount: loans.find(loan => loan.client_id === client.client_id)?.amount_disbursed || 0,
        lastPayment: loanPayments
          .filter(payment => loans.some(loan => 
            loan.loan_id === payment.loan_id && loan.client_id === client.client_id))
          .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0]?.payment_date || ''
      })),
      disbursementTargets: {
        daily: dailyDisbursementTarget,
        weekly: weeklyDisbursementTarget,
        monthly: disbursementTarget,
        achieved: {
          today: todayDisbursements,
          thisWeek: thisWeekDisbursements,
          thisMonth: loansDisbursed
        }
      },
      collectionMetrics: {
        totalPortfolio,
        collectedThisWeek: collectedAmount / 4, // Simplified
        overdueAmount: parAmount,
        collectionRate
      }
    };
  });

  // Process branch performance data
  const processedBranchAverages = branches.map(branch => {
    const branchEmployees = processedEmployees.filter(
      e => e.branch?.toLowerCase() === branch["Branch Office"]?.toLowerCase()
    );

    const count = branchEmployees.length;
    
    if (count === 0) return {
      branch: branch.id,
      loansDisbursed: 0,
      target: 0,
      attendance: 0,
      fieldVisits: 0,
      par: 0,
      collection: 0,
      tat: 0
    };

    return {
      branch: branch.id,
      loansDisbursed: branchEmployees.reduce((sum, e) => sum + e.loansDisbursed, 0) / count,
      target: branchEmployees.reduce((sum, e) => sum + e.target, 0) / count,
      attendance: branchEmployees.reduce((sum, e) => sum + e.attendance, 0) / count,
      fieldVisits: branchEmployees.reduce((sum, e) => sum + e.fieldVisits, 0) / count,
      par: branchEmployees.reduce((sum, e) => sum + e.par, 0) / count,
      collection: branchEmployees.reduce((sum, e) => sum + e.collection, 0) / count,
      tat: branchEmployees.reduce((sum, e) => sum + e.tat, 0) / count
    };
  });

  const roles = ['All Roles', 'Loan Officer', 'Branch Manager', 'Credit Analyst', 'Relationship Officer'];

  const filteredEmployees = processedEmployees.filter(employee => {
    const matchesBranch = selectedBranch === 'all' || employee.branch === selectedBranch.toLowerCase();
    const matchesRole = selectedRole === 'All Roles' || employee.role === selectedRole;
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesBranch && matchesRole && matchesSearch;
  });

  const filteredBranches = branches.filter(branch => {
    return branch["Branch Office"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           branch["Area"]?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination calculations
  const totalEmployeePages = Math.ceil(filteredEmployees.length / rowsPerPage);
  const totalBranchPages = Math.ceil(filteredBranches.length / rowsPerPage);
  
  const paginatedEmployees = filteredEmployees.slice(
    (employeePage - 1) * rowsPerPage,
    employeePage * rowsPerPage
  );
  
  const paginatedBranches = filteredBranches.slice(
    (branchPage - 1) * rowsPerPage,
    branchPage * rowsPerPage
  );

  const toggleEmployeeExpand = (employeeId: string) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  const handleEmployeePageChange = (page: number) => {
    setEmployeePage(page);
    setExpandedEmployee(null); // Close any expanded rows when changing page
  };

  const handleBranchPageChange = (page: number) => {
    setBranchPage(page);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage(newRowsPerPage);
    setEmployeePage(1);
    setBranchPage(1);
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // State handlers for all tables
  const handleUpdateClient = async (updatedClient: Client) => {
      try {
        const { error } = await supabase
          .from('clients')
          .update(updatedClient)
          .eq('client_id', updatedClient.client_id);
        
        if (error) throw error;

        setClients(prevClients => 
          prevClients.map(c => 
            c.client_id === updatedClient.client_id ? updatedClient : c
          )
        );
        
        await refreshData();
        handleCloseModal();
        
      } catch (error) {
        console.error('Error saving client:', error);
        
        if (updatedClient.client_id) {
          setClients(prevClients => prevClients);
        }
      }
    };

  // Client operations
  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('client_id', id);
      
      if (error) throw error;

      setClients(clients.filter(c => c.client_id !== id));
      await refreshData();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  // Loan operations
  const handleUpdateLoan = async (updatedLoan: Loan) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update(updatedLoan)
        .eq('loan_id', updatedLoan.loan_id);
      
      if (error) throw error;

      setLoans(loans.map(l => l.loan_id === updatedLoan.loan_id ? updatedLoan : l));
      await refreshData();
    } catch (error) {
      console.error('Error updating loan:', error);
    }
  };

  const handleDeleteLoan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('loan_id', id);
      
      if (error) throw error;

      setLoans(loans.filter(l => l.loan_id !== id));
      await refreshData();
    } catch (error) {
      console.error('Error deleting loan:', error);
    }
  };

  // Payment operations
  const handleUpdatePayment = async (updatedPayment: LoanPayment) => {
    try {
      const { error } = await supabase
        .from('loan_payments')
        .update(updatedPayment)
        .eq('payment_id', updatedPayment.payment_id);
      
      if (error) throw error;

      setLoanPayments(loanPayments.map(p => p.payment_id === updatedPayment.payment_id ? updatedPayment : p));
      await refreshData();
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const handleDeletePayment = async (id: number) => {
    try {
      const { error } = await supabase
        .from('loan_payments')
        .delete()
        .eq('payment_id', id);
      
      if (error) throw error;

      setLoanPayments(loanPayments.filter(p => p.payment_id !== id));
      await refreshData();
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  // Employee Performance operations
  const handleUpdateEmployeePerformance = async (updatedPerf: EmployeePerformance) => {
    try {
      const { error } = await supabase
        .from('employee_performance')
        .update(updatedPerf)
        .eq('id', updatedPerf.id);
      
      if (error) throw error;

      setEmployeePerformance(employeePerformance.map(p => p.id === updatedPerf.id ? updatedPerf : p));
      await refreshData();
    } catch (error) {
      console.error('Error updating employee performance:', error);
    }
  };

  const handleDeleteEmployeePerformance = async (id: number) => {
    try {
      const { error } = await supabase
        .from('employee_performance')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      setEmployeePerformance(employeePerformance.filter(p => p.id !== id));
      await refreshData();
    } catch (error) {
      console.error('Error deleting employee performance:', error);
    }
  };

  // Branch Performance operations
  const handleUpdateBranchPerformance = async (updatedPerf: BranchPerformance) => {
    try {
      const { error } = await supabase
        .from('branch_performance')
        .update(updatedPerf)
        .eq('id', updatedPerf.id);
      
      if (error) throw error;

      setBranchPerformance(branchPerformance.map(p => p.id === updatedPerf.id ? updatedPerf : p));
      await refreshData();
    } catch (error) {
      console.error('Error updating branch performance:', error);
    }
  };

  const handleDeleteBranchPerformance = async (id: number) => {
    try {
      const { error } = await supabase
        .from('branch_performance')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      setBranchPerformance(branchPerformance.filter(p => p.id !== id));
      await refreshData();
    } catch (error) {
      console.error('Error deleting branch performance:', error);
    }
  };

  // Performance Target operations
  const handleUpdatePerformanceTarget = async (updatedTarget: PerformanceTarget) => {
    try {
      const { error } = await supabase
        .from('performance_targets')
        .update(updatedTarget)
        .eq('id', updatedTarget.id);
      
      if (error) throw error;

      setPerformanceTargets(performanceTargets.map(t => t.id === updatedTarget.id ? updatedTarget : t));
      await refreshData();
    } catch (error) {
      console.error('Error updating performance target:', error);
    }
  };

  const handleDeletePerformanceTarget = async (id: number) => {
    try {
      const { error } = await supabase
        .from('performance_targets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      setPerformanceTargets(performanceTargets.filter(t => t.id !== id));
      await refreshData();
    } catch (error) {
      console.error('Error deleting performance target:', error);
    }
  };

  // Client Visit operations
  const handleUpdateClientVisit = async (updatedVisit: ClientVisit) => {
    try {
      const { error } = await supabase
        .from('client_visits')
        .update(updatedVisit)
        .eq('visit_id', updatedVisit.visit_id);
      
      if (error) throw error;

      setClientVisits(clientVisits.map(v => v.visit_id === updatedVisit.visit_id ? updatedVisit : v));
      await refreshData();
    } catch (error) {
      console.error('Error updating client visit:', error);
    }
  };

  const handleDeleteClientVisit = async (id: number | string) => {
    try {
      const numericId = typeof id === 'string' ? Number(id) : id;
      const { error } = await supabase
        .from('client_visits')
        .delete()
        .eq('visit_id', numericId);
      
      if (error) throw error;

      setClientVisits(clientVisits.filter(v => v.visit_id !== numericId));
      await refreshData();
    } catch (error) {
      console.error('Error deleting client visit:', error);
    }
  };
  
  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen max-w-screen-2xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Microfinance Performance Dashboard</h1>
            <p className="text-gray-600 text-sm">Track loan disbursements, collections, and client relationships</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">

            <GlowButton onClick={() => handleOpenModal('client')} icon={Plus} size="sm">
              Add Client
            </GlowButton>
            <GlowButton onClick={() => handleOpenModal('loan')} icon={Plus} size="sm">
              Add Loan
            </GlowButton>
            <GlowButton onClick={() => handleOpenModal('payment')} icon={Plus} size="sm">
              Add Payment
            </GlowButton>
            <GlowButton onClick={() => handleOpenModal('employeePerf')} icon={Plus} size="sm">
              Add Employee Performance
            </GlowButton>
            <GlowButton onClick={() => handleOpenModal('branchPerf')} icon={Plus} size="sm">
              Add Branch Performance
            </GlowButton>
            <GlowButton onClick={() => handleOpenModal('target')} icon={Plus} size="sm">
              Add Target
            </GlowButton>
            <GlowButton onClick={() => handleOpenModal('visit')} icon={Plus} size="sm">
              Add Client Visit
            </GlowButton>

            <GlowButton 
              variant="secondary"
              icon={Filter}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </GlowButton>
            <GlowButton 
              variant="secondary"
              icon={Download}
              size="sm"
            >
              Export Report
            </GlowButton>
          </div>
        </div>
      </div>

      {showClientModal && (
        <ClientModal
          client={currentRecord}
          onClose={handleCloseModal}
          onSave={(client) => handleSaveRecord('client', client)}
          employees={employees}
          branches={branches}
        />
      )}

      {showLoanModal && (
        <LoanModal
          loan={currentRecord}
          onClose={handleCloseModal}
          onSave={(loan) => handleSaveRecord('loan', loan)}
          clients={clients}
          employees={employees}
          branches={branches}
        />
      )}

      {showPaymentModal && (
        <LoanPaymentModal
          payment={currentRecord}
          onClose={handleCloseModal}
          onSave={(payment) => handleSaveRecord('payment', payment)}
          loans={loans}
          employees={employees}
          branches={branches}
        />
      )}

      {showEmployeePerfModal && (
        <EmployeePerformanceModal
          performance={currentRecord}
          onClose={handleCloseModal}
          onSave={(perf) => handleSaveRecord('employeePerf', perf)}
          employees={employees}
        />
      )}

      {showBranchPerfModal && (
        <BranchPerformanceModal
          performance={currentRecord}
          onClose={handleCloseModal}
          onSave={(perf) => handleSaveRecord('branchPerf', perf)}
          branches={branches}
        />
      )}

      {showTargetModal && (
        <PerformanceTargetModal
          target={currentRecord}
          onClose={handleCloseModal}
          onSave={(target) => handleSaveRecord('target', target)}
          employees={employees}
          branches={branches}
        />
      )}

      {showVisitModal && (
        <ClientVisitModal
          visit={currentRecord}
          onClose={handleCloseModal}
          onSave={(visit) => handleSaveRecord('visit', visit)}
          employees={employees}
          clients={clients}
          branches={branches}
        />
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Branch Location</label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setEmployeePage(1);
                }}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
              >
                <option value="all">All Branches</option>
                  {branches.map(branch => (
                    <option 
                      key={branch.id} 
                      value={branch["Branch Office"]?.toLowerCase() || ''}>
                      {branch["Branch Office"] || ''}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Employee Role</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setEmployeePage(1);
                }}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Rows per page</label>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
              >
                {[5, 10, 20, 50].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={selectedTab === 'individual' ? "Search employees..." : "Search branches..."}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setEmployeePage(1);
                    setBranchPage(1);
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-100 focus:border-green-500 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSelectedTab('individual')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'individual' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Individual Performance
            </button>
            <button
              onClick={() => setSelectedTab('branch')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'branch' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Branch Performance
            </button>
            <button
              onClick={() => setSelectedTab('targets')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'targets' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Targets
            </button>
            <button
              onClick={() => setSelectedTab('clients')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'clients' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Clients
            </button>
            <button
              onClick={() => setSelectedTab('loans')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'loans' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Loans
            </button>
            <button
              onClick={() => setSelectedTab('payments')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'payments' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Payments
            </button>
            <button
              onClick={() => setSelectedTab('employeePerformance')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'employeePerformance' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Employee Performance
            </button>
            <button
              onClick={() => setSelectedTab('branchPerformance')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'branchPerformance' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Branch Performance
            </button>
            <button
              onClick={() => setSelectedTab('clientVisit')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'clientVisit' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Client Visit
            </button>
          </nav>
          {selectedTab === 'individual' && (
            <div className="flex px-6 pb-4 md:pb-0">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  onClick={() => setViewMode('summary')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${viewMode === 'summary' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Summary View
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${viewMode === 'detailed' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Detailed View
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          label="Average Loan Disbursement Rate" 
          value={processedEmployees.length > 0 ? 
            processedEmployees.reduce((sum, e) => sum + (e.loansDisbursed / (e.target || 1) * 100), 0) / processedEmployees.length : 0} 
          icon={Target} 
          color="blue"
          isPercentage={true}
        />
        <SummaryCard 
          label="Daily Target Achievement" 
          value={processedEmployees.length > 0 ? 
            processedEmployees.reduce((sum, e) => sum + (e.disbursementTargets.achieved.today / (e.disbursementTargets.daily || 1) * 100), 0) / processedEmployees.length : 0} 
          icon={Calendar} 
          color="purple"
          isPercentage={true}
        />
        <SummaryCard 
          label="Active Client Ratio" 
          value={processedEmployees.length > 0 ? 
            processedEmployees.reduce((sum, e) => {
              const activeClients = e.clients.filter(c => c.status === 'active').length;
              return sum + (activeClients / (e.clients.length || 1) * 100);
            }, 0) / processedEmployees.length : 0} 
          icon={UserCheck} 
          color="green"
          isPercentage={true}
        />
        <SummaryCard 
          label="Portfolio at Risk (PAR)" 
          value={processedEmployees.length > 0 ? 
            processedEmployees.reduce((sum, e) => sum + e.par, 0) / processedEmployees.length : 0} 
          icon={AlertCircle} 
          color={processedEmployees.length > 0 && processedEmployees.reduce((sum, e) => sum + e.par, 0) / processedEmployees.length < 5 ? 'green' : 'red'}
          isPercentage={true}
        />
      </div>

      {/* Enhanced Individual Performance View */}
      {selectedTab === 'individual' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Staff Performance Metrics</h2>
                <p className="text-gray-600 text-sm">
                  Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">View:</span>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'summary' | 'detailed')}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
                >
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
          </div>
          
          {viewMode === 'summary' ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Employee</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Branch</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Disbursement Targets</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Clients</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Collection Metrics</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">PAR</th>
                      <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.map((employee) => {
                      const branch = branches.find(
                        b => b["Branch Office"]?.toLowerCase() === employee.branch?.toLowerCase()
                      );
                      const activeClients = employee.clients.filter(c => c.status === 'active').length;
                      const clientRatio = employee.clients.length > 0 ? Math.round((activeClients / employee.clients.length) * 100) : 0;
                      
                      return (
                        <React.Fragment key={employee.id}>
                          <tr className="border-b border-gray-300 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <p className="text-gray-900 font-semibold">{employee.name}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-gray-700">{employee.role}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-gray-700">{branch?.["Branch Office"]}</p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Today:</span>
                                  <span className={`text-xs ${employee.disbursementTargets.achieved.today >= employee.disbursementTargets.daily ? 'text-green-600' : 'text-red-600'}`}>
                                    {employee.disbursementTargets.achieved.today}/{employee.disbursementTargets.daily}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Week:</span>
                                  <span className={`text-xs ${employee.disbursementTargets.achieved.thisWeek >= employee.disbursementTargets.weekly ? 'text-green-600' : 'text-red-600'}`}>
                                    {employee.disbursementTargets.achieved.thisWeek}/{employee.disbursementTargets.weekly}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <span>{employee.clients.length} total</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-green-500" />
                                  <span>{activeClients} active</span>
                                  <StatusBadge status="Attendance" value={clientRatio} />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span>Rate:</span>
                                  <StatusBadge status="Collection" value={employee.collectionMetrics.collectionRate} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>Overdue:</span>
                                  <span className="text-xs font-medium text-red-600">
                                    KSh {employee.collectionMetrics.overdueAmount?.toLocaleString() || '0'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <StatusBadge status="PAR" value={employee.par} />
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center gap-1">
                                <GlowButton 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => toggleEmployeeExpand(employee.id)}
                                >
                                  {expandedEmployee === employee.id ? 'Hide Details' : 'View Details'}
                                </GlowButton>
                              </div>
                            </td>
                          </tr>
                          
                          {expandedEmployee === employee.id && (
                            <tr className="bg-gray-50">
                              <td colSpan={8} className="px-4 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* Disbursement Targets Card */}
                                  <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                      <Target className="w-4 h-4 text-blue-500" />
                                      Disbursement Targets
                                    </h3>
                                    <div className="space-y-3">
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span>Daily Target</span>
                                          <span className="font-medium">
                                            {employee.disbursementTargets.achieved.today}/{employee.disbursementTargets.daily}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-blue-500 h-2 rounded-full" 
                                            style={{ width: `${Math.min(100, (employee.disbursementTargets.achieved.today / (employee.disbursementTargets.daily || 1)) * 100)}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span>Weekly Target</span>
                                          <span className="font-medium">
                                            {employee.disbursementTargets.achieved.thisWeek}/{employee.disbursementTargets.weekly}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-purple-500 h-2 rounded-full" 
                                            style={{ width: `${Math.min(100, (employee.disbursementTargets.achieved.thisWeek / (employee.disbursementTargets.weekly || 1)) * 100)}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span>Monthly Target</span>
                                          <span className="font-medium">
                                            {employee.loansDisbursed}/{employee.target}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-green-500 h-2 rounded-full" 
                                            style={{ width: `${Math.min(100, (employee.loansDisbursed / (employee.target || 1)) * 100)}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Client Portfolio Card */}
                                  <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                      <Users className="w-4 h-4 text-green-500" />
                                      Client Portfolio
                                    </h3>
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs">Active:</span>
                                        <span className="font-medium text-green-600">{activeClients}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs">Inactive:</span>
                                        <span className="font-medium text-red-600">{employee.clients.length - activeClients}</span>
                                      </div>
                                    </div>
                                    <div className="h-32 flex items-center justify-center">
                                      <div className="relative w-24 h-24">
                                        <PieChart className="w-full h-full text-gray-200" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <span className="text-xs font-semibold">{clientRatio}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Collection Metrics Card */}
                                  <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                      <Coins className="w-4 h-4 text-yellow-500" />
                                      Collection Metrics
                                    </h3>
                                    <div className="space-y-3">
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span>Total Portfolio</span>
                                          <span className="font-medium">
                                            KSh {employee.collectionMetrics.totalPortfolio?.toLocaleString() || '0'}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span>Collected This Week</span>
                                          <span className="font-medium text-green-600">
                                            KSh {employee.collectionMetrics.collectedThisWeek?.toLocaleString() || '0'}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span>Overdue Amount</span>
                                          <span className="font-medium text-red-600">
                                            KSh {employee.collectionMetrics.overdueAmount?.toLocaleString() || '0'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="pt-2 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs">Collection Rate</span>
                                          <StatusBadge status="Collection" value={employee.collectionMetrics.collectionRate} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={employeePage}
                  totalPages={totalEmployeePages}
                  onPageChange={handleEmployeePageChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedEmployees.map(employee => {
                  const branch = branches.find(
                    b => b["Branch Office"]?.toLowerCase() === employee.branch?.toLowerCase()
                  );
                  const activeClients = employee.clients.filter(c => c.status === 'active').length;
                  const clientRatio = employee.clients.length > 0 ? Math.round((activeClients / employee.clients.length) * 100) : 0;
                  
                  return (
                    <div key={employee.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-5 bg-white">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                            <p className="text-xs text-gray-500">
                              {employee.role} • {branch?.["Branch Office"] || ""}
                            </p>
                          </div>
                          <StatusBadge status="PAR" value={employee.par} />
                        </div>
                        
                        <div className="space-y-4">
                          {/* Disbursement Targets */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Target className="w-3 h-3" /> Disbursement Targets
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Today</span>
                                <span className={`font-medium ${employee.disbursementTargets.achieved.today >= employee.disbursementTargets.daily ? 'text-green-600' : 'text-red-600'}`}>
                                  {employee.disbursementTargets.achieved.today}/{employee.disbursementTargets.daily}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>This Week</span>
                                <span className={`font-medium ${employee.disbursementTargets.achieved.thisWeek >= employee.disbursementTargets.weekly ? 'text-green-600' : 'text-red-600'}`}>
                                  {employee.disbursementTargets.achieved.thisWeek}/{employee.disbursementTargets.weekly}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>This Month</span>
                                <span className={`font-medium ${employee.loansDisbursed >= employee.target ? 'text-green-600' : 'text-red-600'}`}>
                                  {employee.loansDisbursed}/{employee.target}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Client Portfolio */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Users className="w-3 h-3" /> Client Portfolio
                            </h4>
                            <div className="flex justify-between text-xs mb-2">
                              <span>Total Clients</span>
                              <span className="font-medium">{employee.clients.length}</span>
                            </div>
                            <div className="flex justify-between text-xs mb-2">
                              <span>Active Clients</span>
                              <span className="font-medium text-green-600">{activeClients}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Inactive Clients</span>
                              <span className="font-medium text-red-600">{employee.clients.length - activeClients}</span>
                            </div>
                          </div>
                          
                          {/* Collection Metrics */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Coins className="w-3 h-3" /> Collection Metrics
                            </h4>
                            <div className="flex justify-between text-xs mb-2">
                              <span>Total Portfolio</span>
                              <span className="font-medium">KSh {employee.collectionMetrics.totalPortfolio?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between text-xs mb-2">
                              <span>Collected This Week</span>
                              <span className="font-medium text-green-600">KSh {employee.collectionMetrics.collectedThisWeek?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between text-xs mb-2">
                              <span>Overdue Amount</span>
                              <span className="font-medium text-red-600">KSh {employee.collectionMetrics.overdueAmount?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between text-xs items-center">
                              <span>Collection Rate</span>
                              <StatusBadge status="Collection" value={employee.collectionMetrics.collectionRate} />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-xs text-gray-600">
                          Last updated: Today
                        </div>
                        <GlowButton variant="secondary" size="sm">View Details</GlowButton>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={employeePage}
                  totalPages={totalEmployeePages}
                  onPageChange={handleEmployeePageChange}
                />
              </div>
            </>
          )}
        </div>
      )}

      {selectedTab === 'targets' && (
        <PerformanceTargetsTable 
          targets={performanceTargets as any}
          onUpdate={(target) => (handleUpdatePerformanceTarget as any)(target)}
          onDelete={(id) => (handleDeletePerformanceTarget as any)(id)}
        />
      )}

      {selectedTab === 'clients' && (
        <ClientsTable 
          clients={clients as any}
          onUpdate={(client) => (handleUpdateClient as any)(client)}
          onDelete={(id) => (handleDeleteClient as any)(id)}
        />
      )}

      {selectedTab === 'loans' && (
        <LoansTable 
          loans={loans as any}
          onUpdate={(loan) => (handleUpdateLoan as any)(loan)}
          onDelete={(id) => (handleDeleteLoan as any)(id)}
        />
      )}

      {selectedTab === 'payments' && (
        <LoanPaymentsTable 
          payments={loanPayments as any}
          onUpdate={(payment) => (handleUpdatePayment as any)(payment)}
          onDelete={(id) => (handleDeletePayment as any)(id)}
        />
      )}

      {selectedTab === 'employeePerformance' && (
        <EmployeePerformanceTable 
          performance={employeePerformance as any}
          onUpdate={(perf) => (handleUpdateEmployeePerformance as any)(perf)}
          onDelete={(id) => (handleDeleteEmployeePerformance as any)(id)}
        />
      )}

      {selectedTab === 'branchPerformance' && (
        <BranchPerformanceTable 
          performance={branchPerformance as any}
          onUpdate={(perf) => (handleUpdateBranchPerformance as any)(perf)}
          onDelete={(id) => (handleDeleteBranchPerformance as any)(id)}
        />
      )}

      {selectedTab === 'clientVisit' && (
        <ClientVisitsTable 
          visits={clientVisits as any}
          onUpdate={(visit) => (handleUpdateClientVisit as any)(visit)}
          onDelete={(id) => (handleDeleteClientVisit as any)(id)}
        />
      )}

      {/* Branch Performance View */}
      {selectedTab === 'branch' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance Comparison</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedBranches.map(branch => {
                const branchData = processedBranchAverages.find(b => b.branch === branch.id) || {
                  loansDisbursed: 0,
                  target: 0,
                  attendance: 0,
                  fieldVisits: 0,
                  par: 0,
                  collection: 0,
                  tat: 0
                };
                
                return (
                  <div key={branch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                     <h3 className="text-lg font-semibold text-gray-900">
                        {branch?.["Branch Office"] || ""}
                      </h3>
                      <p className="text-gray-600 text-sm">{branch["Area"]}</p>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Loan Disbursement Rate</p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{Math.round(branchData.loansDisbursed)}/{Math.round(branchData.target)}</span>
                          <span className={`text-xs ${branchData.loansDisbursed >= branchData.target ? 'text-green-600' : 'text-red-600'}`}>
                            ({Math.round(branchData.loansDisbursed / (branchData.target || 1) * 100)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Portfolio at Risk (PAR)</p>
                        <StatusBadge status="PAR" value={branchData.par} />
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Collection Efficiency</p>
                        <StatusBadge status="Collection" value={branchData.collection} />
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Average TAT</p>
                        <div className={`text-xs font-medium ${branchData.tat < 36 ? 'text-green-600' : branchData.tat < 48 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {Math.round(branchData.tat)} hours
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                      <GlowButton variant="secondary" size="sm">View Details</GlowButton>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Pagination
                currentPage={branchPage}
                totalPages={totalBranchPages}
                onPageChange={handleBranchPageChange}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance Metrics</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Branch</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Loans Disbursed vs Target</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Avg Attendance</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Avg Field Visits</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Avg PAR</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Avg Collection</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Avg TAT</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBranches.map(branch => {
                    const branchData = processedBranchAverages.find(b => b.branch === branch.id) || {
                      loansDisbursed: 0,
                      target: 0,
                      attendance: 0,
                      fieldVisits: 0,
                      par: 0,
                      collection: 0,
                      tat: 0
                    };
                    const disbursementRate = branchData.target > 0 ? 
                      Math.round(branchData.loansDisbursed / branchData.target * 100) : 0;
                    
                    return (
                      <tr key={branch.id} className="border-b border-gray-300 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="text-gray-900 font-semibold">
                            {branch?.["Branch Office"] || ""}
                          </p>
                          <p className="text-gray-600 text-xs">{branch?.["Area"]}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{Math.round(branchData.loansDisbursed)}/{Math.round(branchData.target)}</span>
                            <span className={`text-xs ${disbursementRate >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                              ({disbursementRate}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status="Attendance" value={Math.round(branchData.attendance)} />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status="Attendance" value={Math.round(branchData.fieldVisits)} />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status="PAR" value={Math.round(branchData.par * 10) / 10} />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status="Collection" value={Math.round(branchData.collection)} />
                        </td>
                        <td className="py-4 px-4">
                          <div className={`text-xs font-medium ${branchData.tat < 36 ? 'text-green-600' : branchData.tat < 48 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {Math.round(branchData.tat)}h
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-1">
                            <GlowButton variant="secondary" icon={BarChart2} size="sm">Analytics</GlowButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Pagination
                currentPage={branchPage}
                totalPages={totalBranchPages}
                onPageChange={handleBranchPageChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;