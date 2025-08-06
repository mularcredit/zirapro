import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Edit, 
  Save,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
type Employee = {
          "Employee Number": string;
          "First Name"?: string | null;
          "Last Name"?: string | null;
          "Basic Salary"?: number | null;
          "Job Title"?: string | null;
          "Work Email"?: string | null;
          "Mobile Number"?: string | null;
          "Start Date"?: string | null;
          selected?: boolean;
};

const EmployeeDataTable = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    department: '',
    search: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch employees from Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('employees') // Replace with your actual table name
          .select(`
          "Employee Number",
          "First Name",
          "Last Name",
          "Basic Salary",
          "Job Title",
          "Work Email",
          "Mobile Number",
          "Start Date"
          `);

        if (error) throw error;

        setEmployees(data.map(emp => ({ ...emp, selected: false })));
      } catch (err) {
        setError(err.message);
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter employees based on search and department
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      `${emp["First Name"] || ''} ${emp["Last Name"] || ''}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      emp["Employee Number"].toLowerCase().includes(filters.search.toLowerCase());
    const matchesDepartment = 
      !filters.department || emp["Department"] === filters.department;
    return matchesSearch && matchesDepartment;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle select all
  const toggleSelectAll = (checked: boolean) => {
    setEmployees(employees.map(emp => ({
      ...emp,
      selected: checked
    })));
  };

  // Handle bulk update
  const handleBulkUpdate = async (field: string, value: any) => {
    const selectedEmployees = employees.filter(emp => emp.selected);
    const employeeNumbers = selectedEmployees.map(emp => emp["Employee Number"]);

    try {
      setLoading(true);
      const { error } = await supabase
        .from('employees')
        .update({ [field]: value })
        .in('Employee Number', employeeNumbers);

      if (error) throw error;

      // Update local state
      setEmployees(employees.map(emp => 
        emp.selected ? { ...emp, [field]: value } : emp
      ));
    } catch (err) {
      setError(err.message);
      console.error('Error in bulk update:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle save individual update
  const handleSave = async (employeeNumber: string) => {
    const employeeToUpdate = employees.find(emp => emp["Employee Number"] === employeeNumber);
    if (!employeeToUpdate) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('employees')
        .update({
          "First Name": employeeToUpdate["First Name"],
          "Last Name": employeeToUpdate["Last Name"],
          "Job Title": employeeToUpdate["Job Title"],
          Department: employeeToUpdate["Department"],
          // Add other fields you want to update
        })
        .eq('Employee Number', employeeNumber);

      if (error) throw error;

      setEditingId(null);
    } catch (err) {
      setError(err.message);
      console.error('Error updating employee:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <X className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header with Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Employee Records</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
              />
            </div>
            
            <select
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>
            
            <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="bg-blue-50 border-b border-blue-100 p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={employees.length > 0 && employees.every(emp => emp.selected)}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              {employees.filter(emp => emp.selected).length} selected
            </span>
          </div>
          
          {employees.some(emp => emp.selected) && (
            <div className="flex gap-2">
              <select
                onChange={(e) => handleBulkUpdate("Department", e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value="">Update Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
              
              <select
                onChange={(e) => handleBulkUpdate("Job Title", e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value="">Update Job Title</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs flex items-center gap-1 hover:bg-gray-50">
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={employees.length > 0 && employees.every(emp => emp.selected)}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEmployees.map((employee) => (
              <tr key={employee["Employee Number"]} className={employee.selected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={employee.selected || false}
                    onChange={(e) => {
                      setEmployees(employees.map(emp => 
                        emp["Employee Number"] === employee["Employee Number"] 
                          ? {...emp, selected: e.target.checked} 
                          : emp
                      ));
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee["Employee Number"]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {employee["First Name"]} {employee["Last Name"]}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === employee["Employee Number"] ? (
                    <input
                      type="text"
                      value={employee["Job Title"] || ''}
                      onChange={(e) => {
                        setEmployees(employees.map(emp => 
                          emp["Employee Number"] === employee["Employee Number"] 
                            ? {...emp, "Job Title": e.target.value} 
                            : emp
                        ));
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{employee["Job Title"]}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === employee["Employee Number"] ? (
                    <select
                      value={employee["Department"] || ''}
                      onChange={(e) => {
                        setEmployees(employees.map(emp => 
                          emp["Employee Number"] === employee["Employee Number"] 
                            ? {...emp, "Department": e.target.value} 
                            : emp
                        ));
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  ) : (
                    <div className="text-sm text-gray-900">{employee["Department"]}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee["Basic Salary"]?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee["Work Email"]}</div>
                  <div className="text-sm text-gray-500">{employee["Mobile Number"]}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === employee["Employee Number"] ? (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleSave(employee["Employee Number"])}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(employee["Employee Number"])}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of{' '}
              <span className="font-medium">{filteredEmployees.length}</span> employees
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDataTable;