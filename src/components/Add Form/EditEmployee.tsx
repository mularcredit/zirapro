import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { X, Save, PrinterIcon, Download, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import GlowButton from '../UI/GlowButton';
import { User, Briefcase, CreditCard, Phone, Mail, MapPin } from 'lucide-react';

type Employee = Database['public']['Tables']['employees']['Row'];

type DropdownOptions = {
  employmentTypes: string[];
  branches: string[];
  paymentMethods: string[];
  genders: string[];
};

const EditEmployeePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Partial<Employee>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    employmentTypes: [],
    branches: [],
    paymentMethods: ['Bank Transfer', 'Cash', 'Mobile Money'],
    genders: ['Male', 'Female', 'Other']
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch employee data
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('Employee Id', id)
          .single();

        if (empError) throw empError;
        if (!empData) throw new Error('Employee not found');

        // Fetch dropdown options
        const { data: empTypes } = await supabase
          .from('employees')
          .select('"Employee Type"')
          .not('"Employee Type"', 'is', null);

        const { data: branches } = await supabase
          .from('employees')
          .select('"Branch"')
          .not('"Branch"', 'is', null);

        setDropdownOptions(prev => ({
          ...prev,
          employmentTypes: [...new Set(empTypes?.map(item => item['Employee Type'] as string))],
          branches: [...new Set(branches?.map(item => item.Branch as string))]
        }));

        setEmployee(empData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name: string, value: string) => {
    setEmployee(prev => ({
      ...prev,
      [name]: value || null
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (!employee['First Name'] || !employee['Last Name']) {
        throw new Error('First Name and Last Name are required');
      }

      const { error } = await supabase
        .from('employees')
        .update(employee)
        .eq('Employee Id', id);
      
      if (error) throw error;
      
      navigate(`/employees/view/${id}`, { state: { success: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
    } finally {
      setSaving(false);
    }
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

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 max-w-6xl mx-auto flex justify-center items-center min-h-[60vh] text-sm"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Employee</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <GlowButton
            onClick={() => navigate('/employees')}
            icon={ArrowLeft}
            className="w-full max-w-xs mx-auto text-sm"
          >
            Back to Employee List
          </GlowButton>
        </div>
      </motion.div>
    );
  }

  if (!employee || !employee['Employee Id']) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 max-w-6xl mx-auto flex justify-center items-center min-h-[60vh] text-sm"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-yellow-100">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-6">The requested employee could not be found.</p>
          <GlowButton
            onClick={() => navigate('/employees')}
            icon={ArrowLeft}
            className="w-full max-w-xs mx-auto text-sm"
          >
            Back to Employee List
          </GlowButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-6xl mx-auto text-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/employees/view/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group text-sm"
        >
          <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="ml-2 font-medium hidden sm:inline">Back to View</span>
        </button>
        
        <div className="flex space-x-2">
          <GlowButton 
            onClick={handleSave}
            icon={Save}
            loading={saving}
            className="bg-green-200 hover:green-100  text-black"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </GlowButton>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 md:p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-green-100 to-emerald-200 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-emerald-800">
                {employee['First Name']?.[0]}{employee['Last Name']?.[0]}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Edit: {employee['First Name']} {employee['Last Name']}
                </h1>
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Employee ID:</span> {employee['Employee Number']}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium mt-4 md:mt-0 ${
              employee['Termination Date'] 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {employee['Termination Date'] ? 'Inactive' : 'Active'}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Section title="Personal Information" icon={User}>
              <FormField
                label="First Name *"
                name="First Name"
                value={employee['First Name'] || ''}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Middle Name"
                name="Middle Name"
                value={employee['Middle Name'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Last Name *"
                name="Last Name"
                value={employee['Last Name'] || ''}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Employee Number"
                name="Employee Number"
                value={employee['Employee Number'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Date of Birth"
                name="Date of Birth"
                type="date"
                value={employee['Date of Birth'] || ''}
                onChange={(e) => handleDateChange('Date of Birth', e.target.value)}
              />
              <FormField
                label="Gender"
                name="Gender"
                type="select"
                value={employee['Gender'] || ''}
                onChange={handleInputChange}
                options={dropdownOptions.genders}
              />
            </Section>

            {/* Employment Information */}
            <Section title="Employment Information" icon={Briefcase}>
              <FormField
                label="Job Title"
                name="Job Title"
                value={employee['Job Title'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Employee Type"
                name="Employee Type"
                type="select"
                value={employee['Employee Type'] || ''}
                onChange={handleInputChange}
                options={dropdownOptions.employmentTypes}
              />
              <FormField
                label="Branch"
                name="Branch"
                type="select"
                value={employee.Branch || ''}
                onChange={handleInputChange}
                options={dropdownOptions.branches}
              />
              <FormField
                label="Start Date"
                name="Start Date"
                type="date"
                value={employee['Start Date'] || ''}
                onChange={(e) => handleDateChange('Start Date', e.target.value)}
              />
              <FormField
                label={employee['Termination Date'] ? 'Termination Date' : 'Contract End Date'}
                name={employee['Termination Date'] ? 'Termination Date' : 'Contract End Date'}
                type="date"
                value={employee['Termination Date'] || employee['Contract End Date'] || ''}
                onChange={(e) => handleDateChange(
                  employee['Termination Date'] ? 'Termination Date' : 'Contract End Date', 
                  e.target.value
                )}
              />
            </Section>

            {/* Contact Information */}
            <Section title="Contact Information" icon={Phone}>
              <FormField
                label="Work Email"
                name="Work Email"
                type="email"
                value={employee['Work Email'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Personal Email"
                name="Personal Email"
                type="email"
                value={employee['Personal Email'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Mobile Number"
                name="Mobile Number"
                type="tel"
                value={employee['Mobile Number'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Alternative Mobile"
                name="Alternative Mobile Number"
                type="tel"
                value={employee['Alternative Mobile Number'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Physical Address"
                name="Area"
                value={employee.Area || ''}
                onChange={handleInputChange}
              />
            </Section>

            {/* Financial Information */}
            <Section title="Financial Information" icon={CreditCard}>
              <FormField
                label="Bank"
                name="Bank"
                value={employee['Bank'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Account Number"
                name="Account Number"
                value={employee['Account Number'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="KRA PIN"
                name="Tax PIN"
                value={employee['Tax PIN'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Basic Salary"
                name="Basic Salary"
                type="number"
                value={employee['Basic Salary'] || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Payment Method"
                name="Payment Method"
                type="select"
                value={employee['Payment Method'] || ''}
                onChange={handleInputChange}
                options={dropdownOptions.paymentMethods}
              />
            </Section>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
            <GlowButton 
              variant="secondary" 
              onClick={() => navigate(`/employees/view/${id}`)}
              disabled={saving}
            >
              Cancel
            </GlowButton>
            <GlowButton 
              onClick={handleSave}
              icon={Save}
              loading={saving}
              className="bg-green-200 hover:green-100  text-black"
            >
              {saving ? 'Saving Changes...' : 'save changes'}
            </GlowButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Section component
const Section = ({ title, icon: Icon, children }: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
    <h3 className="font-semibold text-gray-800 flex items-center mb-4">
      <Icon className="mr-3 text-emerald-600" size={18} />
      <span className="relative">
        {title}
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-100 -mb-1"></span>
      </span>
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

// FormField component
const FormField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  options = [],
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  required?: boolean;
  options?: string[];
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {type === 'select' ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-11 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full h-11 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
      />
    )}
  </div>
);

export default EditEmployeePage;