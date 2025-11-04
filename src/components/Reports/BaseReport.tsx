import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Download, 
  Calendar, 
  Building, 
  User, 
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { TownProps } from '../../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ReportFilters {
  startDate: string;
  endDate: string;
  branch: string;
  employeeNumber: string;
  employeeName: string;
}

interface BaseReportProps extends TownProps {
  reportTitle: string;
  reportDescription: string;
  onGenerateReport: (filters: ReportFilters) => Promise<any[]>;
  renderReportData: (data: any[], filters: ReportFilters) => React.ReactNode;
}

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
    branch: selectedTown || '',
    employeeNumber: '',
    employeeName: ''
  });
  
  const [branches, setBranches] = useState<string[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Fetch branches and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch branches
        const { data: branchesData } = await supabase
          .from('employees')
          .select('Branch')
          .not('Branch', 'is', null);
        
        if (branchesData) {
          const uniqueBranches = [...new Set(branchesData.map(b => b.Branch))].filter(Boolean);
          setBranches(uniqueBranches as string[]);
        }

        // Fetch employees for dropdown
        const { data: employeesData } = await supabase
          .from('employees')
          .select('employee_number, first_name, last_name, Branch')
          .order('first_name');
        
        if (employeesData) {
          setEmployees(employeesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Auto-fill employee name when employee number is selected
    if (key === 'employeeNumber' && value) {
      const employee = employees.find(emp => emp.employee_number === value);
      if (employee) {
        setFilters(prev => ({ 
          ...prev, 
          employeeNumber: value,
          employeeName: `${employee.first_name} ${employee.last_name}` 
        }));
      }
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const data = await onGenerateReport(filters);
      setReportData(data);
      setShowFilters(false);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = () => {
    // Simple CSV export implementation
    const headers = Object.keys(reportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(header => 
          `"${String(row[header] || '').replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      branch: selectedTown || '',
      employeeNumber: '',
      employeeName: ''
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{reportTitle}</h1>
          <p className="text-gray-600">{reportDescription}</p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {reportData.length > 0 && (
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {reportData.length > 0 ? (
                <span>Showing {reportData.length} records</span>
              ) : (
                <span>No data generated yet</span>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Branch Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <select
                    value={filters.branch}
                    onChange={(e) => handleFilterChange('branch', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                {/* Employee Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    value={filters.employeeNumber}
                    onChange={(e) => handleFilterChange('employeeNumber', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Employees</option>
                    {employees.map(employee => (
                      <option key={employee.employee_number} value={employee.employee_number}>
                        {employee.first_name} {employee.last_name} ({employee.employee_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Reset Filters
                </button>
                
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Filter className="w-4 h-4" />
                  )}
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Report Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : reportData.length > 0 ? (
            renderReportData(reportData, filters)
          ) : (
            <div className="text-center py-12">
              <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No report data</h3>
              <p className="text-gray-600 mb-4">Configure your filters and generate a report to see data</p>
              <button
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                Show Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseReport;