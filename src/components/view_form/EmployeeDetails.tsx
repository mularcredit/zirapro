import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { X, Edit, PrinterIcon, Download, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import GlowButton from '../UI/GlowButton';
import { User, Briefcase, CreditCard, Phone, Mail, MapPin } from 'lucide-react';

type Employee = Database['public']['Tables']['employees']['Row'];

const ViewEmployeePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('Employee Id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Employee not found');
        
        setEmployee(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch employee');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 500);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      // Implement your export logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExporting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setExporting(false);
    }
  };

  const handleEdit = () => {
    if (employee) {
      navigate(`/employees/edit/${employee['Employee Id']}`);
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

  if (!employee) {
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
          onClick={() => navigate('/employees')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group text-sm"
        >
          <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="ml-2 font-medium hidden sm:inline">Back to Employees</span>
        </button>
        
        <div className="flex space-x-2">
          <GlowButton 
            variant="secondary" 
            size="sm"
            icon={Edit}
            onClick={handleEdit}
            className="hidden sm:flex text-sm"
          >
            Edit
          </GlowButton>
          <GlowButton 
            variant="secondary" 
            size="sm"
            icon={PrinterIcon}
            onClick={handlePrint}
            loading={printing}
            className="hidden sm:flex text-sm"
          >
            {printing ? 'Printing...' : 'Print'}
          </GlowButton>
          <GlowButton 
            variant="secondary" 
            size="sm"
            icon={Download}
            onClick={handleExport}
            loading={exporting}
            className="hidden sm:flex text-sm"
          >
            {exporting ? 'Exporting...' : 'Export'}
          </GlowButton>
          
          {/* Mobile buttons */}
          <div className="flex sm:hidden space-x-2">
            <button 
              onClick={handleEdit}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              aria-label="Edit"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button 
              onClick={handlePrint}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              aria-label="Print"
              disabled={printing}
            >
              {printing ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
              ) : (
                <PrinterIcon className="w-5 h-5" />
              )}
            </button>
            <button 
              onClick={handleExport}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              aria-label="Export"
              disabled={exporting}
            >
              {exporting ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>
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
                  {employee['First Name']} {employee['Last Name']}
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
              <DetailRow label="Full Name" value={`${employee['First Name']} ${employee['Middle Name'] || ''} ${employee['Last Name']}`.trim()} />
              <DetailRow label="Date of Birth" value={employee['Date of Birth'] || 'N/A'} />
              <DetailRow label="Gender" value={employee['Gender'] || 'N/A'} />
              <DetailRow label="ID Number" value={employee['ID Number'] || 'N/A'} />
              <DetailRow label="NHIF Number" value={employee['NHIF Number'] || 'N/A'} />
              <DetailRow label="NSSF Number" value={employee['NSSF Number'] || 'N/A'} />
            </Section>

            {/* Employment Information */}
            <Section title="Employment Information" icon={Briefcase}>
              <DetailRow label="Job Title" value={employee['Job Title'] || 'N/A'} />
              <DetailRow label="Department" value={employee['Employee Type'] || 'N/A'} />
              <DetailRow label="Branch" value={employee.Branch || 'N/A'} />
              <DetailRow label="Employee Type" value={employee['Employee Type'] || 'N/A'} />
              <DetailRow label="Start Date" value={employee['Start Date'] || 'N/A'} />
              <DetailRow label={employee['Termination Date'] ? 'Termination Date' : 'Contract End'} 
                        value={employee['Termination Date'] || employee['Contract End Date'] || 'N/A'} />
            </Section>

            {/* Contact Information */}
            <Section title="Contact Information" icon={Phone}>
              <DetailRow label="Work Email" value={employee['Work Email'] || 'N/A'} />
              <DetailRow label="Personal Email" value={employee['Personal Email'] || 'N/A'} />
              <DetailRow label="Mobile Number" value={employee['Mobile Number'] || 'N/A'} />
              <DetailRow label="Alternative Mobile" value={employee['Alternative Mobile Number'] || 'N/A'} />
              <DetailRow label="Physical Address" value={employee.Area || 'N/A'} />
            </Section>

            {/* Financial Information */}
            <Section title="Financial Information" icon={CreditCard}>
              <DetailRow label="Bank" value={employee['Bank'] || 'N/A'} />
              <DetailRow label="Account Number" value={employee['Account Number'] || 'N/A'} />
              <DetailRow label="KRA PIN" value={employee['Tax PIN'] || 'N/A'} />
              <DetailRow label="Basic Salary" value={employee['Basic Salary'] ? `KSh ${Number(employee['Basic Salary']).toLocaleString()}` : 'N/A'} />
              <DetailRow label="Payment Method" value={employee['Payment Method'] || 'N/A'} />
            </Section>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="text-gray-500 mb-2 md:mb-0">
            Last updated: {employee['updated_at'] ? new Date(employee['updated_at']).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'N/A'}
          </div>
          <GlowButton
            variant="secondary"
            onClick={() => navigate('/employees')}
            size="sm"
            className="w-full md:w-auto text-sm"
          >
            Close
          </GlowButton>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Section component
const Section = ({ title, icon: Icon, children }: { 
  title: string; 
  icon: React.ComponentType<{ size?: number, className?: string }>;
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
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

// Enhanced DetailRow component
const DetailRow = ({ label, value }: { label: string; value: string | number | null }) => (
  <div className="flex justify-between py-2 px-2 hover:bg-gray-100 rounded-lg transition-colors">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="text-gray-900 text-right max-w-[60%] break-words">
      {value || <span className="text-gray-400">N/A</span>}
    </span>
  </div>
);

export default ViewEmployeePage;