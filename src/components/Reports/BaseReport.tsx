import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Download, 
  Calendar, 
  Building, 
  User, 
  ChevronDown,
  X,
  Loader2,
  Search,
  DollarSign,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { TownProps } from '../../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ReportFilters {
  startDate: string;
  endDate: string;
  town: string;
  employeeNumber: string;
  employeeName: string;
}

interface BaseReportProps extends TownProps {
  reportTitle: string;
  reportDescription: string;
  onGenerateReport: (filters: ReportFilters) => Promise<any[]>;
  renderReportData: (data: any[], filters: ReportFilters) => React.ReactNode;
}

interface SalaryAdvanceData {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  town: string;
  branch: string;
  application_date?: string;
  application_time?: string;
  "Amount Requested"?: number;  // Correct field name from your table
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed' | 'Deducted' | 'paid';
  mpesa_code?: string;
  disbursement_date?: string;
  disbursement_time?: string;
  repayment_date?: string;
  repayment_time?: string;
  repayment_status?: 'Pending' | 'Partial' | 'Completed';
  approved_by?: string;
  approval_date?: string;
  approval_time?: string;
  reason?: string;
  phone_number?: string;
  bank_account?: string;
  bank_name?: string;
  deduction_month?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

// Searchable Dropdown Component (unchanged)
interface SearchableDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-left flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                autoFocus
              />
            </div>
          </div>

          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 ${
                    option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Accounting Status Badge Component - No icons
const AccountingStatusBadge: React.FC<{ status?: string; type: 'status' | 'repayment' }> = ({ status, type }) => {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
        No Data
      </span>
    );
  }

  const getStatusConfig = () => {
    if (type === 'status') {
      switch (status) {
        case 'Pending':
          return { color: 'bg-amber-50 text-amber-700 border-amber-200' };
        case 'Approved':
          return { color: 'bg-blue-50 text-blue-700 border-blue-200' };
        case 'Rejected':
          return { color: 'bg-red-50 text-red-700 border-red-200' };
        case 'Disbursed':
          return { color: 'bg-green-50 text-green-700 border-green-200' };
        case 'Deducted':
        case 'paid':  // Add 'paid' status
          return { color: 'bg-purple-50 text-purple-700 border-purple-200' };
        default:
          return { color: 'bg-gray-50 text-gray-600 border-gray-300' };
      }
    } else {
      switch (status) {
        case 'Pending':
          return { color: 'bg-amber-50 text-amber-700 border-amber-200' };
        case 'Partial':
          return { color: 'bg-orange-50 text-orange-700 border-orange-200' };
        case 'Completed':
          return { color: 'bg-green-50 text-green-700 border-green-200' };
        default:
          return { color: 'bg-gray-50 text-gray-600 border-gray-300' };
      }
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${config.color}`}>
      {status}
    </span>
  );
};

// Format currency for accounting
const formatCurrency = (amount?: number) => {
  if (!amount) return 'KES 0.00';
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format date for accounting reports
const formatAccountingDate = (dateString?: string, timeString?: string) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const time = timeString ? new Date(`1970-01-01T${timeString}`) : null;
  
  const formattedDate = date.toLocaleDateString('en-KE', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  
  const formattedTime = time ? time.toLocaleTimeString('en-KE', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  }) : '';
  
  return timeString ? `${formattedDate} ${formattedTime}` : formattedDate;
};

// Pagination Component (unchanged)
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-gray-300 bg-gray-50">
      <div className="flex items-center space-x-2 mb-4 sm:mb-0">
        <span className="text-sm text-gray-700">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-gray-700">entries</span>
      </div>

      <div className="flex items-center space-x-1">
        <span className="text-sm text-gray-700 mr-4">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
        </span>

        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`min-w-[2rem] px-2 py-1 text-sm rounded border ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            } disabled:bg-transparent disabled:cursor-default`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const BaseReport: React.FC<BaseReportProps> = ({
  reportTitle,
  reportDescription,
  onGenerateReport,
  renderReportData,
  selectedTown,
  onTownChange
}) => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    town: selectedTown || '',
    employeeNumber: '',
    employeeName: ''
  });
  
  const [towns, setTowns] = useState<string[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [reportData, setReportData] = useState<SalaryAdvanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate totals for accounting summary - now grouped by employee
  const employeeAdvances = reportData.reduce((acc, advance) => {
    const empId = advance.employee_number;
    if (!acc[empId]) {
      acc[empId] = {
        employee: advance,
        advances: [],
        totalApplied: 0,
        totalDisbursed: 0,
        advanceCount: 0
      };
    }
    acc[empId].advances.push(advance);
    // FIXED: Use "Amount Requested" with quotes
    const amount = advance["Amount Requested"] || 0;
    acc[empId].totalApplied += amount;
    acc[empId].totalDisbursed += amount; // Same amount since we only have Amount Requested
    acc[empId].advanceCount += 1;
    return acc;
  }, {} as Record<string, any>);

  const employeeAdvanceArray = Object.values(employeeAdvances);
  const totalApplied = employeeAdvanceArray.reduce((sum: number, emp: any) => sum + emp.totalApplied, 0);
  const totalDisbursed = employeeAdvanceArray.reduce((sum: number, emp: any) => sum + emp.totalDisbursed, 0);
  const totalEmployees = employeeAdvanceArray.length;
  const totalAdvances = reportData.length;

  // Calculate paginated data for employee groups
  const totalItems = employeeAdvanceArray.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployeeData = employeeAdvanceArray.slice(startIndex, endIndex);

  // Reset to first page when filters change or data updates
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.town, filters.employeeNumber, reportData]);

  // Fetch initial employee data and their advances
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);

        // Fetch towns from employees
        const { data: townsData } = await supabase
          .from('employees')
          .select('Town')
          .not('Town', 'is', null);
        
        if (townsData) {
          const uniqueTowns = [...new Set(townsData.map(t => t.Town))].filter(Boolean);
          setTowns(uniqueTowns as string[]);
        }

        // Fetch all employees
        const { data: employeesData } = await supabase
          .from('employees')
          .select(`
            "Employee Number",
            "First Name",
            "Last Name",
            Town,
            Branch,
            "Mobile Number",
            "Work Email",
            "Job Title"
          `)
          .order('"First Name"');

        // Fetch salary advances
        const { data: advancesData } = await supabase
          .from('salary_advance')
          .select('*')
          .order('time_added', { ascending: false });

        if (employeesData) {
          // Combine employee data with their advances
          const employeeTableData: SalaryAdvanceData[] = [];
          
          employeesData.forEach(emp => {
            const employeeAdvances = advancesData?.filter(
              advance => advance.employee_number === emp['Employee Number']
            ) || [];

            if (employeeAdvances.length > 0) {
              // Create an entry for each advance
              employeeAdvances.forEach(advance => {
                employeeTableData.push({
                  id: `${emp['Employee Number']}-${advance.id}`,
                  employee_number: emp['Employee Number'],
                  first_name: emp['First Name'] || '',
                  last_name: emp['Last Name'] || '',
                  town: emp.Town || '',
                  branch: emp.Branch || '',
                  phone_number: emp['Mobile Number'] || '',
                  application_date: advance.application_date,
                  application_time: advance.application_time,
                  // FIXED: Use "Amount Requested" with quotes
                  "Amount Requested": advance["Amount Requested"],
                  status: advance.status,
                  mpesa_code: advance.mpesa_code,
                  disbursement_date: advance.disbursement_date,
                  disbursement_time: advance.disbursement_time,
                  repayment_date: advance.repayment_date,
                  repayment_time: advance.repayment_time,
                  repayment_status: advance.repayment_status,
                  approved_by: advance.approved_by,
                  approval_date: advance.approval_date,
                  approval_time: advance.approval_time,
                  reason: advance.reason,
                  bank_account: advance.bank_account,
                  bank_name: advance.bank_name,
                  deduction_month: advance.deduction_month,
                  remarks: advance.remarks,
                  created_at: advance.created_at,
                  updated_at: advance.updated_at
                });
              });
            } else {
              // Employee with no advances - show basic info
              employeeTableData.push({
                id: emp['Employee Number'],
                employee_number: emp['Employee Number'],
                first_name: emp['First Name'] || '',
                last_name: emp['Last Name'] || '',
                town: emp.Town || '',
                branch: emp.Branch || '',
                phone_number: emp['Mobile Number'] || '',
                application_date: undefined,
                application_time: undefined,
                "Amount Requested": undefined,
                status: undefined,
                mpesa_code: undefined,
                disbursement_date: undefined,
                disbursement_time: undefined,
                repayment_date: undefined,
                repayment_time: undefined,
                repayment_status: undefined,
                approved_by: undefined,
                approval_date: undefined,
                approval_time: undefined,
                reason: undefined,
                bank_account: undefined,
                bank_name: undefined,
                deduction_month: undefined,
                remarks: undefined,
                created_at: undefined,
                updated_at: undefined
              });
            }
          });

          setEmployees(employeesData);
          setFilteredEmployees(employeesData);
          setReportData(employeeTableData);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  // Filter employees based on town selection
  useEffect(() => {
    let filtered = employees;

    if (filters.town) {
      filtered = filtered.filter(emp => emp.Town === filters.town);
    }

    if (filters.employeeNumber) {
      filtered = filtered.filter(emp => emp['Employee Number'] === filters.employeeNumber);
    }

    setFilteredEmployees(filtered);

    // Update report data with filtered employees and their advances
    const fetchFilteredData = async () => {
      const { data: advancesData } = await supabase
        .from('salary_advance')
        .select('*')
        .order('time_added', { ascending: false });

      const filteredReportData: SalaryAdvanceData[] = [];
      
      filtered.forEach(emp => {
        const employeeAdvances = advancesData?.filter(
          advance => advance.employee_number === emp['Employee Number']
        ) || [];

        if (employeeAdvances.length > 0) {
          employeeAdvances.forEach(advance => {
            filteredReportData.push({
              id: `${emp['Employee Number']}-${advance.id}`,
              employee_number: emp['Employee Number'],
              first_name: emp['First Name'] || '',
              last_name: emp['Last Name'] || '',
              town: emp.Town || '',
              branch: emp.Branch || '',
              phone_number: emp['Mobile Number'] || '',
              application_date: advance.application_date,
              application_time: advance.application_time,
              // FIXED: Use "Amount Requested" with quotes
              "Amount Requested": advance["Amount Requested"],
              status: advance.status,
              mpesa_code: advance.mpesa_code,
              disbursement_date: advance.disbursement_date,
              disbursement_time: advance.disbursement_time,
              repayment_date: advance.repayment_date,
              repayment_time: advance.repayment_time,
              repayment_status: advance.repayment_status,
              approved_by: advance.approved_by,
              approval_date: advance.approval_date,
              approval_time: advance.approval_time,
              reason: advance.reason,
              bank_account: advance.bank_account,
              bank_name: advance.bank_name,
              deduction_month: advance.deduction_month,
              remarks: advance.remarks,
              created_at: advance.created_at,
              updated_at: advance.updated_at
            });
          });
        } else {
          filteredReportData.push({
            id: emp['Employee Number'],
            employee_number: emp['Employee Number'],
            first_name: emp['First Name'] || '',
            last_name: emp['Last Name'] || '',
            town: emp.Town || '',
            branch: emp.Branch || '',
            phone_number: emp['Mobile Number'] || '',
            application_date: undefined,
            application_time: undefined,
            "Amount Requested": undefined,
            status: undefined,
            mpesa_code: undefined,
            disbursement_date: undefined,
            disbursement_time: undefined,
            repayment_date: undefined,
            repayment_time: undefined,
            repayment_status: undefined,
            approved_by: undefined,
            approval_date: undefined,
            approval_time: undefined,
            reason: undefined,
            bank_account: undefined,
            bank_name: undefined,
            deduction_month: undefined,
            remarks: undefined,
            created_at: undefined,
            updated_at: undefined
          });
        }
      });

      setReportData(filteredReportData);
    };

    fetchFilteredData();
  }, [filters.town, filters.employeeNumber, employees]);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    if (key === 'employeeNumber' && value) {
      const employee = employees.find(emp => emp['Employee Number'] === value);
      if (employee) {
        newFilters.employeeName = `${employee['First Name']} ${employee['Last Name']}`;
      }
    }

    if (key === 'town' && value !== filters.town) {
      newFilters.employeeNumber = '';
      newFilters.employeeName = '';
    }

    setFilters(newFilters);
    
    if (key === 'town' && onTownChange) {
      onTownChange(value);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      if (onGenerateReport) {
        const data = await onGenerateReport(filters);
        setReportData(data);
      }
      setShowFilters(false);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = () => {
    if (reportData.length === 0) return;
    
    const headers = [
      'Employee Number',
      'First Name',
      'Last Name',
      'Town',
      'Branch',
      'Phone Number',
      'Application Date',
      'Application Time',
      'Amount Requested',
      'Status',
      'M-Pesa Code',
      'Disbursement Date',
      'Disbursement Time',
      'Repayment Date',
      'Repayment Time',
      'Repayment Status',
      'Approved By',
      'Approval Date',
      'Approval Time',
      'Reason',
      'Bank Account',
      'Bank Name',
      'Deduction Month',
      'Remarks',
      'Created At',
      'Updated At'
    ];
    
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        [
          `"${row.employee_number}"`,
          `"${row.first_name}"`,
          `"${row.last_name}"`,
          `"${row.town}"`,
          `"${row.branch}"`,
          `"${row.phone_number}"`,
          row.application_date || '',
          row.application_time || '',
          row["Amount Requested"] || '',
          row.status || '',
          `"${row.mpesa_code}"` || '',
          row.disbursement_date || '',
          row.disbursement_time || '',
          row.repayment_date || '',
          row.repayment_time || '',
          row.repayment_status || '',
          `"${row.approved_by}"` || '',
          row.approval_date || '',
          row.approval_time || '',
          `"${row.reason}"` || '',
          `"${row.bank_account}"` || '',
          `"${row.bank_name}"` || '',
          row.deduction_month || '',
          `"${row.remarks}"` || '',
          row.created_at || '',
          row.updated_at || ''
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-advance-accounting-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    const resetFilters = {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      town: selectedTown || '',
      employeeNumber: '',
      employeeName: ''
    };
    
    setFilters(resetFilters);
    if (onTownChange) {
      onTownChange(resetFilters.town);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Accounting-style render function with support for multiple advances
  const renderAccountingReportData = (employeeData: any[]) => (
    <>
      {/* Traditional Accounting Summary Cards - No Icons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 border-b border-gray-300">
        <div className="bg-white p-3 rounded border border-gray-300 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Employees</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
          <p className="text-xs text-gray-500 mt-1">Across all locations</p>
        </div>

        <div className="bg-white p-3 rounded border border-gray-300 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Advances</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalAdvances}</p>
          <p className="text-xs text-gray-500 mt-1">All applications</p>
        </div>

        <div className="bg-white p-3 rounded border border-gray-300 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Requested</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalApplied)}</p>
          <p className="text-xs text-gray-500 mt-1">Amount requested</p>
        </div>

        <div className="bg-white p-3 rounded border border-gray-300 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Disbursed</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(totalDisbursed)}</p>
          <p className="text-xs text-gray-500 mt-1">Amount paid out</p>
        </div>
      </div>

      {/* Accounting Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-75 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Employee Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Advance Summary
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Recent Application
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Financial Overview
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status Summary
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {employeeData.map((employeeGroup: any) => {
              const { employee, advances, totalApplied, totalDisbursed, advanceCount } = employeeGroup;
              const recentAdvance = advances[0]; // Most recent advance

              return (
                <tr key={employee.employee_number} className="hover:bg-gray-50 border-b border-gray-200">
                  {/* Employee Details */}
                  <td className="px-4 py-3 border-r border-gray-300">
                    <div className="text-sm font-semibold text-gray-900">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-xs text-gray-600 font-mono">{employee.employee_number}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {employee.town || 'N/A'} • {employee.branch || 'N/A'}
                    </div>
                    {employee.phone_number && (
                      <div className="text-xs text-gray-600 mt-1">
                        {employee.phone_number}
                      </div>
                    )}
                  </td>

                  {/* Advance Summary */}
                  <td className="px-4 py-3 border-r border-gray-300">
                    <div className="text-sm font-semibold text-gray-900">
                      {advanceCount} {advanceCount === 1 ? 'Advance' : 'Advances'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      First: {advances[advances.length - 1]?.application_date ? 
                        formatAccountingDate(advances[advances.length - 1].application_date) : 'N/A'
                      }
                    </div>
                    <div className="text-xs text-gray-600">
                      Latest: {recentAdvance?.application_date ? 
                        formatAccountingDate(recentAdvance.application_date) : 'N/A'
                      }
                    </div>
                  </td>

                  {/* Recent Application Details */}
                  <td className="px-4 py-3 border-r border-gray-300">
                    {recentAdvance ? (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          {formatAccountingDate(recentAdvance.application_date, recentAdvance.application_time)}
                        </div>
                        <div className="text-xs text-gray-600 max-w-xs">
                          {recentAdvance.reason || 'No reason provided'}
                        </div>
                        <AccountingStatusBadge status={recentAdvance.status} type="status" />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">No advances</div>
                    )}
                  </td>

                  {/* Financial Overview */}
                  <td className="px-4 py-3 border-r border-gray-300">
                    {advanceCount > 0 ? (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <div className="text-gray-600 text-xs">Total Requested</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(totalApplied)}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-600 text-xs">Total Disbursed</div>
                          <div className="font-semibold text-green-700">
                            {formatCurrency(totalDisbursed)}
                          </div>
                        </div>
                        {recentAdvance?.mpesa_code && (
                          <div className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                            Ref: {recentAdvance.mpesa_code}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">No financial data</div>
                    )}
                  </td>

                  {/* Status Summary */}
                  <td className="px-4 py-3">
                    {recentAdvance ? (
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Current Status</div>
                          <AccountingStatusBadge status={recentAdvance.status} type="status" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Repayment</div>
                          <AccountingStatusBadge status={recentAdvance.repayment_status} type="repayment" />
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>Approved by: {recentAdvance.approved_by || 'Pending'}</div>
                          <div className="text-gray-400">
                            {formatAccountingDate(recentAdvance.approval_date, recentAdvance.approval_time)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">No status data</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </>
  );

  // Prepare dropdown options
  const townOptions = [
    { value: '', label: 'All Towns' },
    ...towns.map(town => ({ value: town, label: town }))
  ];

  const employeeOptions = [
    { value: '', label: 'All Employees' },
    ...filteredEmployees.map(employee => ({
      value: employee['Employee Number'],
      label: `${employee['First Name']} ${employee['Last Name']} (${employee['Employee Number']})`
    }))
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Accounting Report Header */}
        <div className="mb-6 bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Salary Advance Accounting Report
              </h1>
              <p className="text-gray-600">Comprehensive financial overview of employee salary advances</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Period: {formatAccountingDate(filters.startDate)} - {formatAccountingDate(filters.endDate)}
                </div>
                {filters.town && (
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    Location: {filters.town}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Report Generated</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-KE', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-sm transition-colors"
              >
                <Filter className="w-3 h-3" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {reportData.length > 0 && (
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium shadow-sm transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Export to Excel
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-300">
              <span>Total Records: {employeeAdvanceArray.length} • Page {currentPage} of {totalPages}</span>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Town Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Town
                  </label>
                  <SearchableDropdown
                    options={townOptions}
                    value={filters.town}
                    onChange={(value) => handleFilterChange('town', value)}
                    placeholder="Select Town"
                  />
                </div>

                {/* Employee Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Employee
                  </label>
                  <SearchableDropdown
                    options={employeeOptions}
                    value={filters.employeeNumber}
                    onChange={(value) => handleFilterChange('employeeNumber', value)}
                    placeholder="Select Employee"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-300 pt-4">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Reset All Filters
                </button>
                
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-sm disabled:opacity-50 transition-colors"
                >
                  {generating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Filter className="w-3 h-3" />
                  )}
                  {generating ? 'Generating Report...' : 'Generate Report'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Report Data */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            renderAccountingReportData(paginatedEmployeeData)
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseReport;