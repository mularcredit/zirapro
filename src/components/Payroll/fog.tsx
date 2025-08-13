import { useState, useEffect } from 'react';
import { X, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, AlertCircle, Check, Edit2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TownProps } from '../../types/supabase';

type Employee = {
  "Account Number": string | null
  account_number_name: string | null
  "Alternate Approver": string | null
  alternate_second_level_approver: string | null
  "Alternative Mobile Number": string | null
  Area: string | null
  Bank: string | null
  "Bank Branch": string | null
  "Basic Salary": number | null
  blood_group: string | null
  Branch: string | null
  City: string | null
  "Contract End Date": string | null
  "Contract Start Date": string | null
  Country: string | null
  Currency: string | null
  "Date of Birth": string | null
  "Disability Cert No": string | null
  "Employee AVC": string | null
  "Employee Id": number | null
  "Employee Number": string
  "Employee Type": string | null
  "Employer AVC": string | null
  Entity: string | null
  "First Name": string | null
  Gender: string | null
  HELB: string | null
  "HELB option": string | null
  "House Number": string | null
  "Housing Levy Deduction": string | null
  "ID Number": number | null
  "Internship End Date": string | null
  internship_start_date: string | null
  "Job Group": string | null
  "Job Level": string | null
  "Job Title": string | null
  "Last Name": string | null
  "Leave Approver": string | null
  Manager: string | null
  "Marital Status": string | null
  "Middle Name": string | null
  "Mobile Number": string | null
  "NHIF Deduction": string | null
  "NHIF Number": string | null
  NITA: string | null
  "NITA Deductions": string | null
  "NSSF Deduction": string | null
  "NSSF Number": string | null
  Office: string | null
  passport_number: string | null
  payment_method: string | null
  "Payroll Number": string | null
  "Pension Deduction": string | null
  "Pension Start Date": string | null
  "Personal Email": string | null
  "Personal Mobile": string | null
  "Postal Address": string | null
  "Postal Code": string | null
  "Postal Location": string | null
  "Probation End Date": string | null
  "Probation Start Date": string | null
  "Profile Image": string | null
  religion: string | null
  Road: string | null
  second_level_leave_approver: string | null
  "SHIF Number": string | null
  "Start Date": string | null
  "Tax Exempted": string | null
  "Tax PIN": string | null
  "Termination Date": string | null
  Town: string | null
  "Type of Identification": string | null
  WIBA: string | null
  "Work Email": string | null
  "Work Mobile": string | null
  id: string // Added for row selection
};

const EmployeeDataTable: React.FC<TownProps> = ({ selectedTown, onTownChange })=> {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    Branch: '',
    "Employee Type": '',
    "Job Group": ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editableData, setEditableData] = useState<Partial<Employee>>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [bulkUpdateField, setBulkUpdateField] = useState<string | null>(null);
  const [bulkUpdateValue, setBulkUpdateValue] = useState('');

  // Fetch data from Supabase
  // Fetch data from Supabase
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Start building the query
      let query = supabase.from('employees').select('*');
      
      // Apply town filter if selectedTown exists
     if (selectedTown && selectedTown !== 'ADMIN_ALL') {
  query = query.eq('Town', selectedTown);
}
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Add unique id to each employee for row selection
      const employeesWithId = data?.map(emp => ({
        ...emp,
        id: `emp-${emp["Employee Number"] || Math.random().toString(36).substring(2, 9)}`
      })) || [];
      
      setEmployees(employeesWithId);
      setFilteredEmployees(employeesWithId);
    } catch (err) {
      setError('Failed to fetch employee data. Please try again.');
      console.error('Error fetching employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [selectedTown]);

  // Apply search and filters
  useEffect(() => {
    let result = [...employees];
    
    if (selectedTown && selectedTown !== 'ADMIN_ALL') {
    result = result.filter(emp => emp.Town === selectedTown);
  }
    // Apply search
    if (searchTerm) {
  const term = searchTerm.toLowerCase();
  result = result.filter(emp => 
    (emp["First Name"]?.toLowerCase().includes(term) ||
    emp["Last Name"]?.toLowerCase().includes(term) ||
    emp["Work Email"]?.toLowerCase().includes(term) ||
    emp["Employee Number"]?.toLowerCase().includes(term) ||
    emp["ID Number"]?.toString().includes(term)))
}
    
   
    if (filters.Branch) {
      result = result.filter(emp => emp.Branch === filters.Branch);
    }
    if (filters["Employee Type"]) {
      result = result.filter(emp => emp["Employee Type"] === filters["Employee Type"]);
    }
    if (filters["Job Group"]) {
      result = result.filter(emp => emp["Job Group"] === filters["Job Group"]);
    }
    
    setFilteredEmployees(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [employees, searchTerm, filters,selectedTown]);

  // Handle pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id) 
        : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentItems.map(emp => emp.id));
    }
    setSelectAll(!selectAll);
  };

  // Start editing a row
  const startEditing = (employee: Employee) => {
    setEditingId(employee.id);
    setEditableData({
      "First Name": employee["First Name"],
      "Last Name": employee["Last Name"],
      "Work Email": employee["Work Email"],
      Branch: employee.Branch,
      "Job Title": employee["Job Title"],
      "Employee Type": employee["Employee Type"],
      "Job Group": employee["Job Group"]
    });
  };

  // Save edited data to Supabase
  const saveEditing = async (id: string) => {
    try {
      setLoading(true);
      
      // Find the original employee to get the Employee Id
      const originalEmployee = employees.find(emp => emp.id === id);
      if (!originalEmployee) return;
      
      const { error } = await supabase
        .from('employees')
        .update(editableData)
        .eq('Employee Number', originalEmployee["Employee Number"]);
      
      if (error) throw error;
      
      // Update local state
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === id ? { ...emp, ...editableData } : emp
        )
      );
      setEditingId(null);
      setEditableData({});
    } catch (err) {
      setError('Failed to update employee. Please try again.');
      console.error('Error updating employee:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditableData({});
  };

  // Handle bulk update in Supabase
  const applyBulkUpdate = async () => {
    if (!bulkUpdateField || !bulkUpdateValue) return;
    
    try {
      setLoading(true);
      
      // Get the Employee Ids of selected rows
      const employeeIds = employees
        .filter(emp => selectedRows.includes(emp.id))
        .map(emp => emp["Employee Number"]);
      
      if (employeeIds.length === 0) return;
      
      const { error } = await supabase
        .from('employees')
        .update({ [bulkUpdateField]: bulkUpdateValue })
        .in('Employee Number', employeeIds);
      
      if (error) throw error;
      
      // Update local state
      setEmployees(prev => 
        prev.map(emp => 
          selectedRows.includes(emp.id) 
            ? { ...emp, [bulkUpdateField]: bulkUpdateValue } 
            : emp
        )
      );
      
      setBulkUpdateField(null);
      setBulkUpdateValue('');
      setSelectedRows([]);
      setSelectAll(false);
    } catch (err) {
      setError('Failed to perform bulk update. Please try again.');
      console.error('Error in bulk update:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const getUniqueValues = (key: keyof Employee) => {
    const values = employees.map(emp => emp[key]).filter(Boolean) as string[];
    return [...new Set(values)];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="mt-4 text-gray-600">Loading employee data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 bg-red-50 rounded-lg">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="mt-4 text-red-600 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (employees.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 bg-gray-50 rounded-lg">
        <AlertCircle className="w-8 h-8 text-gray-400" />
        <p className="mt-4 text-gray-600">No employee data found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Table Controls */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-9 pr-4 py-2 w-full text-sm border border-green-200 rounded-lg   focus:border-green-100 focus:outline focus:outline-green-200 focus:outline-2 focus:outline-offset-2 transition-all bg-green-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                value={filters.Branch}
                onChange={(e) => setFilters({...filters, Branch: e.target.value})}
              >
                <option value="">All Branches</option>
                {getUniqueValues('Branch').map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                value={filters["Employee Type"]}
                onChange={(e) => setFilters({...filters, "Employee Type": e.target.value})}
              >
                <option value="">All Types</option>
                {getUniqueValues('Employee Type').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                value={filters["Job Group"]}
                onChange={(e) => setFilters({...filters, "Job Group": e.target.value})}
              >
                <option value="">All Job Groups</option>
                {getUniqueValues('Job Group').map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            
            <button 
              onClick={() => setFilters({ Branch: '', "Employee Type": '', "Job Group": '' })}
              className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 flex items-center transition-colors"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </button>
          </div>
        </div>
        
        {/* Bulk Update Controls */}
        {selectedRows.length > 0 && (
          <div className="mt-3 p-3 bg-emerald-50/80 rounded-lg border border-emerald-100 backdrop-blur-sm">
            <div className="flex flex-col xs:flex-row xs:items-center gap-3">
              <span className="text-xs font-medium text-emerald-800 whitespace-nowrap">
                {selectedRows.length} {selectedRows.length === 1 ? 'employee' : 'employees'} selected
              </span>
              
              <div className="flex-1 flex flex-col xs:flex-row gap-2">
                <select
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  value={bulkUpdateField || ''}
                  onChange={(e) => setBulkUpdateField(e.target.value || null)}
                >
                  <option value="">Select field to update</option>
                  <option value="Branch">Branch</option>
                  <option value="Job Title">Job Title</option>
                  <option value="Employee Type">Employee Type</option>
                  <option value="Job Group">Job Group</option>
                </select>
                
                {bulkUpdateField && (
                  <>
                    {bulkUpdateField === 'Branch' ? (
                      <select
                        className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        value={bulkUpdateValue}
                        onChange={(e) => setBulkUpdateValue(e.target.value)}
                      >
                        <option value="">Select branch</option>
                        {getUniqueValues('Branch').map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    ) : bulkUpdateField === 'Employee Type' ? (
                      <select
                        className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        value={bulkUpdateValue}
                        onChange={(e) => setBulkUpdateValue(e.target.value)}
                      >
                        <option value="">Select type</option>
                        {getUniqueValues('Employee Type').map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : bulkUpdateField === 'Job Group' ? (
                      <select
                        className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        value={bulkUpdateValue}
                        onChange={(e) => setBulkUpdateValue(e.target.value)}
                      >
                        <option value="">Select job group</option>
                        {getUniqueValues('Job Group').map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder={`Enter new ${bulkUpdateField}`}
                        value={bulkUpdateValue}
                        onChange={(e) => setBulkUpdateValue(e.target.value)}
                      />
                    )}
                  </>
                )}
                
                <button
                  onClick={applyBulkUpdate}
                  disabled={!bulkUpdateField || !bulkUpdateValue}
                  className="px-3 py-2 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors flex items-center justify-center whitespace-nowrap"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Apply
                </button>
                
                <button
                  onClick={() => {
                    setSelectedRows([]);
                    setSelectAll(false);
                    setBulkUpdateField(null);
                    setBulkUpdateValue('');
                  }}
                  className="px-3 py-2 text-xs bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center whitespace-nowrap"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 overflow-scroll">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="h-3 w-3 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500"
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Work Email
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Group
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((employee) => (
                <tr 
                  key={employee.id} 
                  className={selectedRows.includes(employee.id) ? 'bg-emerald-50/50' : 'hover:bg-gray-50 transition-colors'}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(employee.id)}
                      onChange={() => toggleRowSelection(employee.id)}
                      className="h-3 w-3 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                    {employee["Employee Number"]}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === employee.id ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-emerald-500 focus:border-emerald-500"
                          value={editableData["First Name"] || ''}
                          onChange={(e) => setEditableData({...editableData, "First Name": e.target.value})}
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-emerald-500 focus:border-emerald-500"
                          value={editableData["Last Name"] || ''}
                          onChange={(e) => setEditableData({...editableData, "Last Name": e.target.value})}
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      <div className="text-xs font-medium text-gray-900">
                        {employee["First Name"]} {employee["Last Name"]}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === employee.id ? (
                      <input
                        type="email"
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-emerald-500 focus:border-emerald-500"
                        value={editableData["Work Email"] || ''}
                        onChange={(e) => setEditableData({...editableData, "Work Email": e.target.value})}
                      />
                    ) : (
                      <div className="text-xs text-gray-500">{employee["Work Email"]}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === employee.id ? (
                      <select
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-emerald-500 focus:border-emerald-500"
                        value={editableData.Branch || ''}
                        onChange={(e) => setEditableData({...editableData, Branch: e.target.value})}
                      >
                        {getUniqueValues('Branch').map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs text-gray-500">{employee.Branch}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === employee.id ? (
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-emerald-500 focus:border-emerald-500"
                        value={editableData["Job Title"] || ''}
                        onChange={(e) => setEditableData({...editableData, "Job Title": e.target.value})}
                      />
                    ) : (
                      <div className="text-xs text-gray-500">{employee["Job Title"]}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === employee.id ? (
                      <select
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-emerald-500 focus:border-emerald-500"
                        value={editableData["Employee Type"] || ''}
                        onChange={(e) => setEditableData({...editableData, "Employee Type": e.target.value})}
                      >
                        {getUniqueValues('Employee Type').map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs text-gray-500">{employee["Employee Type"]}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === employee.id ? (
                      <select
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-emerald-500 focus:border-emerald-500"
                        value={editableData["Job Group"] || ''}
                        onChange={(e) => setEditableData({...editableData, "Job Group": e.target.value})}
                      >
                        {getUniqueValues('Job Group').map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs text-gray-500">{employee["Job Group"]}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                    {editingId === employee.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => saveEditing(employee.id)}
                          className="text-emerald-600 hover:text-emerald-800 flex items-center transition-colors"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 hover:text-gray-800 flex items-center transition-colors"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(employee)}
                        className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-4 text-center text-xs text-gray-500">
                  No employees found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredEmployees.length)}</span> of{' '}
              <span className="font-medium">{filteredEmployees.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">First</span>
                <ChevronsLeft className="h-3 w-3" aria-hidden="true" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-1.5 py-1.5 border border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-3 w-3" aria-hidden="true" />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-2 py-1.5 border text-xs font-medium ${
                      currentPage === pageNum
                        ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-1.5 py-1.5 border border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Last</span>
                <ChevronsRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDataTable;