import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { X, Edit, PrinterIcon, Download, ArrowLeft, Trash2, Clock, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import GlowButton from '../UI/GlowButton';
import { User, Briefcase, CreditCard, Phone, Mail, MapPin } from 'lucide-react';
import { format } from 'date-fns';

type Employee = Database['public']['Tables']['employees']['Row'];

const ViewEmployeePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminationDate, setTerminationDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [terminationReason, setTerminationReason] = useState<string>('');
  const [exitInterview, setExitInterview] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [terminationSuccess, setTerminationSuccess] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('Employee Number', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Employee not found');
        
        setEmployee(data);
        
        // If employee is already terminated, pre-fill the form
        if (data['Termination Date']) {
          setTerminationDate(data['Termination Date']);
          setTerminationReason(data['Termination Reason'] || '');
          setExitInterview(data['Exit Interview Notes'] || '');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch employee');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleTerminateEmployee = async () => {
    if (!employee || !terminationDate) return;
    
    try {
      setIsTerminating(true);
      
      const { error } = await supabase
        .from('employees')
        .update({
          'Termination Date': terminationDate,
          'Termination Reason': terminationReason,
          'Exit Interview Notes': exitInterview,
          'Status': 'Terminated',
          'updated_at': new Date().toISOString()
        })
        .eq('Employee Number', employee['Employee Number']);
      
      if (error) throw error;
      
      // Update the local state
      setEmployee({
        ...employee,
        'Termination Date': terminationDate,
        'Termination Reason': terminationReason,
        'Exit Interview Notes': exitInterview,
        'Status': 'Terminated'
      });
      
      setTerminationSuccess(true);
      setTimeout(() => setTerminationSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate employee');
    } finally {
      setIsTerminating(false);
      setShowConfirm(false);
    }
  };

  const handleReverseTermination = async () => {
    if (!employee) return;
    
    try {
      setIsTerminating(true);
      
      const { error } = await supabase
        .from('employees')
        .update({
          'Termination Date': null,
          'Termination Reason': null,
          'Exit Interview Notes': null,
          'Status': 'Active',
          'updated_at': new Date().toISOString()
        })
        .eq('Employee Number', employee['Employee Number']);
      
      if (error) throw error;
      
      // Update the local state
      setEmployee({
        ...employee,
        'Termination Date': null,
        'Termination Reason': null,
        'Exit Interview Notes': null,
        'Status': 'Active'
      });
      
      setTerminationSuccess(true);
      setTimeout(() => setTerminationSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reverse termination');
    } finally {
      setIsTerminating(false);
    }
  };

  const generateTerminationLetter = () => {
    if (!employee) return '';
    
    const letter = `
      TERMINATION LETTER
      
      Date: ${format(new Date(), 'MMMM d, yyyy')}
      
      To: ${employee['First Name']} ${employee['Last Name']}
      Employee ID: ${employee['Employee Number']}
      Position: ${employee['Job Title']}
      
      Dear ${employee['First Name']},
      
      This letter serves as formal notification of your termination from ${employee['Employee Type']} position at our company, effective ${terminationDate}.
      
      Reason for Termination: ${terminationReason}
      
      ${exitInterview ? `Exit Interview Notes: ${exitInterview}` : ''}
      
      Please return all company property in your possession by your last day of employment. Your final paycheck will be processed according to company policy and applicable laws.
      
      We appreciate your contributions during your time with us and wish you success in your future endeavors.
      
      Sincerely,
      
      [HR Manager Name]
      Human Resources Department
    `;
    
    return letter;
  };

  const handlePrintTerminationLetter = () => {
    const letter = generateTerminationLetter();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Termination Letter - ${employee?.['First Name']} ${employee?.['Last Name']}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { text-align: center; margin-bottom: 30px; }
              .letter-content { white-space: pre-line; }
              .signature { margin-top: 50px; }
              .footer { margin-top: 100px; font-size: 0.9em; color: #666; }
            </style>
          </head>
          <body>
            <div class="letter-content">${letter}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 200);
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
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-green-100">
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
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-green-600" />
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
        
        {terminationSuccess && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center">
            <span className="mr-2">✓</span>
            {employee['Termination Date'] ? 'Employee terminated successfully' : 'Termination reversed successfully'}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className={`p-6 md:p-8 border-b border-gray-300 ${employee['Termination Date'] ? 'bg-red-50' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
          <div className="flex flex-col md:flex-row md:items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                employee['Termination Date'] 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gradient-to-br from-green-100 to-emerald-200 text-emerald-800'
              }`}>
                {employee['First Name']?.[0]}{employee['Last Name']?.[0]}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {employee['First Name']} {employee['Last Name']}
                </h1>
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Employee ID:</span> {employee['Employee Number']}
                </p>
                {employee['Termination Date'] && (
                  <p className="text-red-600 mt-2 font-medium">
                    Terminated on {employee['Termination Date']}
                  </p>
                )}
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
            {/* Termination Form */}
            <div className={`bg-gray-50 rounded-lg p-5 border ${employee['Termination Date'] ? 'border-red-200' : 'border-green-200'}`}>
              <h3 className="font-semibold text-gray-800 flex items-center mb-4">
                {employee['Termination Date'] ? (
                  <>
                    <AlertTriangle className="mr-3 text-red-600" size={18} />
                    <span>Termination Details</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-3 text-green-600" size={18} />
                    <span>Terminate Employee</span>
                  </>
                )}
              </h3>
              
              {employee['Termination Date'] ? (
                <div className="space-y-4">
                  <DetailRow label="Termination Date" value={employee['Termination Date']} />
                  <DetailRow label="Termination Reason" value={employee['Termination Reason'] || 'Not specified'} />
                  <DetailRow label="Exit Interview Notes" value={employee['Exit Interview Notes'] || 'Not conducted'} />
                  
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <GlowButton
                      onClick={handlePrintTerminationLetter}
                      icon={PrinterIcon}
                      variant="secondary"
                      className="w-full mb-3"
                    >
                      Print Termination Letter
                    </GlowButton>
                    
                    <GlowButton
                      onClick={() => setShowConfirm(true)}
                      icon={Clock}
                      variant="secondary"
                      className="w-full"
                    >
                      Reverse Termination
                    </GlowButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Termination Date</label>
                    <input
                      type="date"
                      value={terminationDate}
                      onChange={(e) => setTerminationDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Termination Reason</label>
                    <select
                      value={terminationReason}
                      onChange={(e) => setTerminationReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select a reason...</option>
                      <option value="Voluntary Resignation">Voluntary Resignation</option>
                      <option value="Termination for Cause">Termination for Cause</option>
                      <option value="Redundancy">Redundancy</option>
                      <option value="End of Contract">End of Contract</option>
                      <option value="Mutual Agreement">Mutual Agreement</option>
                      <option value="Retirement">Retirement</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Exit Interview Notes</label>
                    <textarea
                      rows={4}
                      value={exitInterview}
                      onChange={(e) => setExitInterview(e.target.value)}
                      placeholder="Optional notes from exit interview..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <GlowButton
                    onClick={() => setShowConfirm(true)}
                    icon={Trash2}
                    className="w-full mt-4"
                    disabled={!terminationDate || !terminationReason}
                  >
                    Process Termination
                  </GlowButton>
                </div>
              )}
            </div>

            {/* Employee Information */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-300">
              <h3 className="font-semibold text-gray-800 flex items-center mb-4">
                <User className="mr-3 text-emerald-600" size={18} />
                <span>Employee Summary</span>
              </h3>
              
              <div className="space-y-3">
                <DetailRow label="Full Name" value={`${employee['First Name']} ${employee['Middle Name'] || ''} ${employee['Last Name']}`.trim()} />
                <DetailRow label="Job Title" value={employee['Job Title'] || 'N/A'} />
                <DetailRow label="Department" value={employee['Employee Type'] || 'N/A'} />
                <DetailRow label="Start Date" value={employee['Start Date'] || 'N/A'} />
                <DetailRow label="Employment Duration" value={
                  employee['Start Date'] 
                    ? `${Math.floor((new Date(employee['Termination Date'] || new Date()).getTime() - new Date(employee['Start Date']).getTime()) / (1000 * 60 * 60 * 24 * 30.44))} months`
                    : 'N/A'
                } />
                <DetailRow label="Basic Salary" value={employee['Basic Salary'] ? `KSh ${Number(employee['Basic Salary']).toLocaleString()}` : 'N/A'} />
              </div>
            </div>

            {/* Termination Checklist */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-300">
              <h3 className="font-semibold text-gray-800 flex items-center mb-4">
                <FileText className="mr-3 text-emerald-600" size={18} />
                <span>Termination Checklist</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="final-paycheck"
                    className="mt-1 mr-2"
                    disabled={!employee['Termination Date']}
                    checked={employee['Termination Date'] !== null}
                  />
                  <label htmlFor="final-paycheck" className="text-gray-700">
                    Process final paycheck and benefits
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="company-property"
                    className="mt-1 mr-2"
                    disabled={!employee['Termination Date']}
                    checked={employee['Termination Date'] !== null}
                  />
                  <label htmlFor="company-property" className="text-gray-700">
                    Collect company property (laptop, badge, etc.)
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="system-access"
                    className="mt-1 mr-2"
                    disabled={!employee['Termination Date']}
                    checked={employee['Termination Date'] !== null}
                  />
                  <label htmlFor="system-access" className="text-gray-700">
                    Revoke system access
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="exit-interview"
                    className="mt-1 mr-2"
                    disabled={!employee['Termination Date']}
                    checked={!!employee['Exit Interview Notes']}
                  />
                  <label htmlFor="exit-interview" className="text-gray-700">
                    Conduct exit interview
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="documentation"
                    className="mt-1 mr-2"
                    disabled={!employee['Termination Date']}
                    checked={employee['Termination Date'] !== null}
                  />
                  <label htmlFor="documentation" className="text-gray-700">
                    Complete termination documentation
                  </label>
                </div>
              </div>
            </div>

            {/* Termination Letter Preview */}
            {employee['Termination Date'] && (
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-300">
                <h3 className="font-semibold text-gray-800 flex items-center mb-4">
                  <FileText className="mr-3 text-emerald-600" size={18} />
                  <span>Termination Letter Preview</span>
                </h3>
                
                <div className="bg-white p-4 rounded border border-gray-200 text-sm whitespace-pre-line h-64 overflow-y-auto">
                  {generateTerminationLetter()}
                </div>
                
                <GlowButton
                  onClick={handlePrintTerminationLetter}
                  icon={PrinterIcon}
                  variant="secondary"
                  className="w-full mt-4"
                >
                  Print Termination Letter
                </GlowButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">
                {employee['Termination Date'] 
                  ? 'Reverse Termination?' 
                  : 'Confirm Employee Termination'}
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                {employee['Termination Date'] 
                  ? 'Are you sure you want to reverse this termination and reinstate the employee?'
                  : `You are about to terminate ${employee['First Name']} ${employee['Last Name']}. This action cannot be undone.`}
              </div>
            </div>
            <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:text-sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                onClick={employee['Termination Date'] ? handleReverseTermination : handleTerminateEmployee}
                disabled={isTerminating}
              >
                {isTerminating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : employee['Termination Date'] ? 'Reverse Termination' : 'Confirm Termination'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string | number | null }) => (
  <div className="flex justify-between py-2 px-2 hover:bg-gray-100 rounded-lg transition-colors">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="text-gray-900 text-right max-w-[60%] break-words">
      {value || <span className="text-gray-400">N/A</span>}
    </span>
  </div>
);

export default ViewEmployeePage;