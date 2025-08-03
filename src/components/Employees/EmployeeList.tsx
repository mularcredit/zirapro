import { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, Eye, Edit, Trash2, MapPin, Mail, Phone, 
  ChevronLeft, ChevronRight, X, Filter, Download, PrinterIcon, ChevronDown,User, Briefcase, CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import GlowButton from '../UI/GlowButton';
import { useNavigate, useParams } from 'react-router-dom';

type Employee = Database['public']['Tables']['employees']['Row'];



const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 6;

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all');

  // Modal state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const addEmployeeRef = useRef<HTMLDivElement>(null);



  // Fetch employees from Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('Employee Id', { ascending: false });

        if (error) throw error;
        setEmployees(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
      if (addEmployeeRef.current && !addEmployeeRef.current.contains(event.target as Node)) {
        setIsAddEmployeeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee['First Name']} ${employee['Middle Name']} ${employee['Last Name']}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         employee['Employee Number']?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee['Employee Type'] === selectedDepartment;
    const matchesBranch = selectedBranch === 'all' || employee.Branch === selectedBranch;
    const matchesEmploymentType = selectedEmploymentType === 'all' || employee.Office === selectedEmploymentType;
    return matchesSearch && matchesDepartment && matchesBranch && matchesEmploymentType;
  });

  // Pagination logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  // Get unique departments and branches for filters
  const departments = ['all', ...new Set(employees.map(e => e['Employee Type']).filter(Boolean) as string[])];
  const branches = ['all', ...new Set(employees.map(e => e.Branch).filter(Boolean) as string[])];
  const employmentTypes = ['all', ...new Set(employees.map(e => e.Office).filter(Boolean) as string[])];

  // Helper functions
  const getInitials = (firstName: string | null, middleName: string | null, lastName: string | null) => {
    return [firstName?.[0], middleName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase();
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleAddEmployee = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployee]);
      
      if (error) throw error;
      
      // Refresh employee list
      const { data: updatedData } = await supabase
        .from('employees')
        .select('*')
        .order('Employee Id', { ascending: false });
      
      setEmployees(updatedData || []);
      setIsAddEmployeeOpen(false);
      setNewEmployee({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuickAction = (action: string) => {
    setIsQuickActionsOpen(false);
    console.log('Action selected:', action);
    // Implement action logic here
  };

 if (loading) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-6xl mx-auto flex justify-center items-center min-h-[60vh] text-sm"
    >
      <div className="text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-50 to-green-200 rounded-full mb-6"></div>
          <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-64 mb-4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-48"></div>
        </div>
      </div>
    </motion.div>
  );
}
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Add Employee Modal */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            ref={addEmployeeRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl text-sm overflow-y-none"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
                <button 
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="First Name"
                    value={newEmployee['First Name'] || ''}
                    onChange={handleInputChange}
                    className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    name="Middle Name"
                    value={newEmployee['Middle Name'] || ''}
                    onChange={handleInputChange}
                    className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
                    placeholder="Kariuki"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="Last Name"
                    value={newEmployee['Last Name'] || ''}
                    onChange={handleInputChange}
                    className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
                    placeholder="Mwangi"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
                  <input
                    type="text"
                    name="Employee Number"
                    value={newEmployee['Employee Number'] || ''}
                    onChange={handleInputChange}
                    className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
                    placeholder="EMP001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    name="Work Email"
                    value={newEmployee['Work Email'] || ''}
                    onChange={handleInputChange}
                    className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
                    placeholder="john.kariuki@company.co.ke"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    name="Mobile Number"
                    value={newEmployee['Mobile Number'] || ''}
                    onChange={handleInputChange}
                    className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
                    placeholder="+254 712 345 678"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    name="Job Title"
                    value={newEmployee['Job Title'] || ''}
                    onChange={handleInputChange}
                    className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
                    placeholder="Senior Software Engineer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Type</label>
                  <select
                    name="Employee Type"
                    value={newEmployee['Employee Type'] || ''}
                    onChange={handleInputChange}
                    className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
                  >
                    <option value="">Select Type</option>
                    {employmentTypes.filter(t => t !== 'all').map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <select
                    name="Branch"
                    value={newEmployee.Branch || ''}
                    onChange={handleInputChange}
                    className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
                  >
                    <option value="">Select Branch</option>
                    {branches.filter(b => b !== 'all').map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="Start Date"
                    value={newEmployee['Start Date'] || ''}
                    onChange={handleInputChange}
                    className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <GlowButton 
                  variant="secondary" 
                  onClick={() => setIsAddEmployeeOpen(false)}
                >
                  Cancel
                </GlowButton>
                <GlowButton 
                  onClick={() => navigate('/add-employee')}
                  icon={Plus}
                >
                  Add Employee
                </GlowButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage your workforce with comprehensive employee records</p>
        </div>
        <div className='flex space-x-3'>
          <GlowButton 
            icon={Plus} 
            onClick={() => navigate('/add-employee')}
          >
            Add Employee
          </GlowButton>
          
          {/* Quick Actions Dropdown */}
          <div className="relative" ref={quickActionsRef}>
            <GlowButton 
              icon={ChevronDown} 
              iconPosition="right"
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className="flex items-center"
            >
              Quick Actions
            </GlowButton>
            
            {isQuickActionsOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  {['import employees', 'Add Employee Login (ESS)', 'terminate employees'].map((action) => (
                    <button
                      key={action}
                      onClick={() => handleQuickAction(action)}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white/80 text-sm backdrop-blur-sm border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-[42px] bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
            />
          </div>
          
          {/* Department Dropdown */}
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
          >
            {departments.map(dept => (
              <option key={dept} value={dept} className="bg-white">
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          
          {/* Branch Dropdown */}
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
          >
            {branches.map(branch => (
              <option key={branch} value={branch} className="bg-white">
                {branch === 'all' ? 'All Branches' : branch}
              </option>
            ))}
          </select>
          
          {/* Employment Type Dropdown */}
          <select
            value={selectedEmploymentType}
            onChange={(e) => {
              setSelectedEmploymentType(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[42px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200"
          >
            {employmentTypes.map(type => (
              <option key={type} value={type} className="bg-white">
                {type === 'all' ? 'Town Office' : type}
              </option>
            ))}
          </select>
          
          {/* Buttons - moved to a new row on smaller screens */}
          <div className="flex space-x-2 h-[42px] md:col-span-5 lg:col-span-1">
            {/*  */}
            <GlowButton variant="secondary" icon={Download} size="sm" className="h-full">
              Export
            </GlowButton>
            
            <GlowButton variant="secondary" icon={PrinterIcon} size="sm" className="h-full">
              Print
            </GlowButton>
          </div>
        </div>
      </div>
      
      {/* Employee Cards */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {currentEmployees.map((employee, index) => (
    <motion.div
      key={employee["Employee Id"]}
      className="bg-white backdrop-blur-sm border border-gray-200 rounded-lg p-6 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] shadow-lg transition-all duration-300 min-w-[300px] max-w-[400px] mx-auto" 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/30">
            {getInitials(employee['First Name'], employee['Middle Name'], employee['Last Name'])}
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold">
              {employee['First Name']} {employee['Last Name']}
            </h3>
            <p className="text-gray-600 text-sm">{employee['Employee Number']}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          employee['Termination Date'] 
            ? 'bg-red-500/20 text-red-800 border border-red-500/30' 
            : 'bg-green-500/20 text-green-800 border border-green-500/30'
        }`}>
          {employee['Termination Date'] ? 'Inactive' : 'Active'}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-green-800" />
          <span className="text-gray-700">{employee['Job Level']} • {employee.Branch}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">{employee['Job Title']}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Mail className="w-4 h-4 text-green-800" />
          <span className="text-gray-700 truncate">{employee['Work Email']}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Phone className="w-4 h-4 text-green-800" />
          <span className="text-gray-700">{employee['Mobile Number']}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">Office Town: </span>
          <span className="text-green-800 font-semibold">
            {employee.Office}
          </span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <GlowButton 
          variant="secondary" 
          size="sm" 
          icon={Eye}
          onClick={() => navigate(`/view-employee/${employee['Employee Id']}`)}

        >
          View
        </GlowButton>
        <GlowButton variant="secondary" size="sm" icon={Edit}
        onClick={() => navigate(`/edit-employee/${employee['Employee Id']}`)}>
          Edit
        </GlowButton>
        <GlowButton variant="danger" size="sm" icon={Trash2}>
          Delete
        </GlowButton>
      </div>
    </motion.div>
  ))}
</div>

{/* Pagination */}
{/* Pagination */}
{filteredEmployees.length > 0 && (
  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
    <div className="text-sm text-gray-600">
      Showing {indexOfFirstEmployee + 1} to {Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} employees
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      
      {/* Always show first page */}
      <button
        onClick={() => setCurrentPage(1)}
        className={`px-3 py-1 border rounded hover:bg-gray-50 transition-colors ${
          currentPage === 1 ? 'bg-green-100 border-green-500 text-green-800' : ''
        }`}
      >
        1
      </button>
      
      {/* Show ellipsis if needed */}
      {currentPage > 3 && (
        <span className="px-3 py-1">...</span>
      )}
      
      {/* Show current page and neighbors */}
      {Array.from({ length: Math.min(5, totalPages - 2) }, (_, i) => {
        const page = Math.max(2, Math.min(currentPage - 2, totalPages - 4)) + i;
        if (page > 1 && page < totalPages) {
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded hover:bg-gray-50 transition-colors ${
                currentPage === page ? 'bg-green-100 border-green-500 text-green-800' : ''
              }`}
            >
              {page}
            </button>
          );
        }
        return null;
      })}
      
      {/* Show ellipsis if needed */}
      {currentPage < totalPages - 2 && (
        <span className="px-3 py-1">...</span>
      )}
      
      {/* Always show last page if there's more than one page */}
      {totalPages > 1 && (
        <button
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 border rounded hover:bg-gray-50 transition-colors ${
            currentPage === totalPages ? 'bg-green-100 border-green-500 text-green-800' : ''
          }`}
        >
          {totalPages}
        </button>
      )}
      
      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
)}
      {/* Empty state */}
      {filteredEmployees.length === 0 && (
        <div className="mt-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-700">No employees found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedEmployee && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="p-6 pb-0 flex justify-between items-center sticky top-0 bg-white z-10 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedEmployee['First Name']} {selectedEmployee['Last Name']}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Employee ID: {selectedEmployee['Employee Number']}
          </p>
        </div>
        <button 
          onClick={() => setIsViewModalOpen(false)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto px-6 py-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <div className="sticky top-0 bg-white py-2 -mt-2 z-10">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                <User className="mr-2" size={18} />
                Personal Information
              </h3>
              <div className="border-b border-gray-200 mt-2"></div>
            </div>
            <DetailRow label="Date of Birth" value={selectedEmployee['Date of Birth']} />
            <DetailRow label="Gender" value={selectedEmployee['Gender']} />
            <DetailRow label="ID Number" value={selectedEmployee['ID Number']} />
            <DetailRow label="NHIF Number" value={selectedEmployee['NHIF Number']} />
            <DetailRow label="NSSF Number" value={selectedEmployee['NSSF Number']} />
          </div>

          {/* Employment Info */}
          <div className="space-y-4">
            <div className="sticky top-0 bg-white py-2 -mt-2 z-10">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                <Briefcase className="mr-2" size={18} />
                Employment Information
              </h3>
              <div className="border-b border-gray-200 mt-2"></div>
            </div>
            <DetailRow label="Job Title" value={selectedEmployee['Job Title']} />
            <DetailRow label="Department" value={selectedEmployee['Employee Type']} />
            <DetailRow label="Branch" value={selectedEmployee.Branch} />
            <DetailRow label="Employee Type" value={selectedEmployee['Employee Type']} />
            <DetailRow label="Start Date" value={selectedEmployee['Start Date']} />
            <DetailRow label="Contract End" value={selectedEmployee['Contract End Date']} />
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="sticky top-0 bg-white py-2 -mt-2 z-10">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                <Phone className="mr-2" size={18} />
                Contact Information
              </h3>
              <div className="border-b border-gray-200 mt-2"></div>
            </div>
            <DetailRow label="Work Email" value={selectedEmployee['Work Email']} />
            <DetailRow label="Personal Email" value={selectedEmployee['Personal Email']} />
            <DetailRow label="Mobile" value={selectedEmployee['Mobile Number']} />
            <DetailRow label="Alternative Mobile" value={selectedEmployee['Alternative Mobile Number']} />
          </div>

          {/* Financial Info */}
          <div className="space-y-4">
            <div className="sticky top-0 bg-white py-2 -mt-2 z-10">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                <CreditCard className="mr-2" size={18} />
                Financial Information
              </h3>
              <div className="border-b border-gray-200 mt-2"></div>
            </div>
            <DetailRow label="Bank" value={selectedEmployee['Bank']} />
            <DetailRow label="Account Number" value={selectedEmployee['Account Number']} />
            <DetailRow label="KRA PIN" value={selectedEmployee['Tax PIN']} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end sticky bottom-0">
        <button
          onClick={() => setIsViewModalOpen(false)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  </div>
)}
    </div>
  );
};

// Helper component for detail rows in modal
const DetailRow = ({ label, value }: { label: string; value: string | number | null }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-900">{value || 'N/A'}</span>
  </div>
);

export default EmployeeList;