import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Clock, Search, ChevronDown, Send, Users, CheckSquare, Square } from 'lucide-react';

const SalaryAdvanceAdmin = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedAmount, setEditedAmount] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showNotesDropdown, setShowNotesDropdown] = useState<string | null>(null);
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false);
  const [isProcessingBulkPayment, setIsProcessingBulkPayment] = useState(false);
  const [employeeMobileNumbers, setEmployeeMobileNumbers] = useState<Record<string, string>>({});
  const [selectedStaff, setSelectedStaff] = useState<Record<string, boolean>>({}); // Track selected staff for payment

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('salary_advance')
        .select('*')
        .order('time_added', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
      
      // Initialize notes state
      const initialNotes: Record<string, string> = {};
      data?.forEach(app => {
        initialNotes[app.id] = app.admin_notes || '';
      });
      setNotes(initialNotes);

      // Initialize selected staff - all approved applications are selected by default
      const initialSelected: Record<string, boolean> = {};
      data?.forEach(app => {
        if (app.status?.toLowerCase() === 'approved') {
          initialSelected[app.id] = true;
        }
      });
      setSelectedStaff(initialSelected);

      // Fetch mobile numbers for all employees
      await fetchMobileNumbers(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMobileNumbers = async (apps: any[]) => {
    try {
      const employeeNumbers = apps.map(app => app["Employee Number"]).filter(Boolean);
      
      if (employeeNumbers.length === 0) return;

      const { data, error } = await supabase
        .from('employees')
        .select('"Employee Number", "Mobile Number"')
        .in('"Employee Number"', employeeNumbers);

      if (error) throw error;

      const mobileMap: Record<string, string> = {};
      data?.forEach(emp => {
        mobileMap[emp["Employee Number"]] = emp["Mobile Number"];
      });

      setEmployeeMobileNumbers(mobileMap);
    } catch (error) {
      console.error('Error fetching mobile numbers:', error);
      toast.error('Failed to load mobile numbers');
    }
  };

  // Get approved applications
  const getApprovedApplications = () => {
    return applications.filter(app => app.status?.toLowerCase() === 'approved');
  };

  // Format amount as Kenyan Shillings
  const formatKES = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format phone number for M-Pesa (254 format)
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Convert to 254 format if it starts with 0 or 7
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  // Calculate total amount for selected applications
  const calculateTotalAmount = () => {
    const approvedApps = getApprovedApplications();
    return approvedApps.reduce((total, app) => {
      if (selectedStaff[app.id]) {
        return total + Number(app["Amount Requested"] || 0);
      }
      return total;
    }, 0);
  };

  // Get count of selected staff
  const getSelectedStaffCount = () => {
    return Object.values(selectedStaff).filter(selected => selected).length;
  };

  // Toggle selection for a staff member
  const toggleStaffSelection = (id: string) => {
    setSelectedStaff(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Select all staff
  const selectAllStaff = () => {
    const newSelection: Record<string, boolean> = {};
    getApprovedApplications().forEach(app => {
      newSelection[app.id] = true;
    });
    setSelectedStaff(newSelection);
  };

  // Deselect all staff
  const deselectAllStaff = () => {
    setSelectedStaff({});
  };

  const handleAmountEdit = (id: string, currentAmount: string) => {
    setEditingId(id);
    // Remove any formatting before editing
    const numericValue = currentAmount.replace(/[^0-9.]/g, '');
    setEditedAmount(numericValue);
  };

  const handleAmountSave = async (id: string) => {
    if (!editedAmount || isNaN(Number(editedAmount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('salary_advance')
        .update({ "Amount Requested": Number(editedAmount) })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Amount updated!');
      setEditingId(null);
      fetchApplications();
    } catch (error) {
      console.error('Error updating amount:', error);
      toast.error('Failed to update amount');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_advance')
        .update({ 
          status: 'Approved',
          admin_notes: notes[id] || null 
        })
        .eq('id', id);

      if (error) throw error;
      
      // Add to selected staff when approved
      setSelectedStaff(prev => ({
        ...prev,
        [id]: true
      }));
      
      toast.success('Application approved!');
      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_advance')
        .update({ 
          status: 'Rejected',
          admin_notes: notes[id] || null 
        })
        .eq('id', id);

      if (error) throw error;
      
      // Remove from selected staff when rejected
      setSelectedStaff(prev => {
        const newSelection = {...prev};
        delete newSelection[id];
        return newSelection;
      });
      
      toast.success('Application rejected!');
      fetchApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const handleNoteChange = (id: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const saveNotes = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_advance')
        .update({ admin_notes: notes[id] || null })
        .eq('id', id);

      if (error) throw error;
      toast.success('Notes saved!');
      setShowNotesDropdown(null);
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const processMpesaPayment = async (employeeNumber: string, amount: number, fullName: string) => {
    try {
      const mobileNumber = employeeMobileNumbers[employeeNumber];
      if (!mobileNumber) {
        throw new Error(`Mobile number not found for employee ${employeeNumber}`);
      }

      const formattedPhone = formatPhoneNumber(mobileNumber);
      
      // Call backend API to initiate M-Pesa B2C payment
      const response = await fetch('https://mpesa-22p0.onrender.com/api/mpesa/b2c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          amount: amount,
          employeeNumber: employeeNumber,
          fullName: fullName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      throw error;
    }
  };

  const handleBulkPayment = async () => {
    setIsProcessingBulkPayment(true);
    try {
      const approvedApps = getApprovedApplications();
      const selectedApps = approvedApps.filter(app => selectedStaff[app.id]);
      const results = [];
      
      for (const app of selectedApps) {
        try {
          // Process M-Pesa payment
          const result = await processMpesaPayment(
            app["Employee Number"],
            Number(app["Amount Requested"]),
            app["Full Name"]
          );
          
          results.push({ success: true, app, result });
          
          // Update application status to "Paid"
          const { error } = await supabase
            .from('salary_advance')
            .update({ status: 'Paid' })
            .eq('id', app.id);
            
          if (error) throw error;
          
          toast.success(`Payment sent to ${app["Full Name"]}`);
          
        } catch (error) {
          console.error(`Failed to pay ${app["Full Name"]}:`, error);
          results.push({ success: false, app, error });
          toast.error(`Failed to pay ${app["Full Name"]}`);
        }
        
        // Add a small delay between payments to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast.success(`Payments processed for ${results.filter(r => r.success).length} of ${selectedApps.length} staff members!`);
      setShowBulkPaymentModal(false);
      fetchApplications();
    } catch (error) {
      console.error('Error processing bulk payments:', error);
      toast.error('Failed to process payments');
    } finally {
      setIsProcessingBulkPayment(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app["Employee Number"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app["Full Name"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app["Office Branch"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeMobileNumbers[app["Employee Number"]]?.includes(searchTerm);
    
    return matchesSearch;
  });

  const approvedApplications = getApprovedApplications();

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-lg font-medium text-gray-900">Salary Advance Requests</h2>
        
        <div className="flex items-center gap-3">
          {approvedApplications.length > 0 && (
            <button
              onClick={() => setShowBulkPaymentModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              <Send size={16} />
              Pay Approved Staff ({getSelectedStaffCount()})
            </button>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No salary advance requests found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{app["Full Name"]}</div>
                    <div className="text-sm text-gray-500">{app["Employee Number"]}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employeeMobileNumbers[app["Employee Number"]] || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app["Office Branch"]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === app.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editedAmount}
                          onChange={(e) => setEditedAmount(e.target.value)}
                          className="w-24 p-1 border rounded text-sm"
                        />
                        <button 
                          onClick={() => handleAmountSave(app.id)}
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="text-sm font-medium text-gray-900 cursor-pointer hover:underline"
                        onClick={() => handleAmountEdit(app.id, app["Amount Requested"])}
                      >
                        {formatKES(Number(app["Amount Requested"]))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {app["Reason for Advance"]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(app["status"])}
                      <span className="ml-2 text-sm text-gray-500 capitalize">
                        {app["status"] || 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap relative">
                    <div className="flex items-center">
                      <button 
                        onClick={() => setShowNotesDropdown(showNotesDropdown === app.id ? null : app.id)}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                      >
                        Notes <ChevronDown className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                    {showNotesDropdown === app.id && (
                      <div className="absolute z-10 mt-2 w-64 bg-white shadow-lg rounded-md p-2 border border-gray-200">
                        <textarea
                          value={notes[app.id] || ''}
                          onChange={(e) => handleNoteChange(app.id, e.target.value)}
                          placeholder="Add admin notes..."
                          className="w-full p-2 border rounded text-sm mb-2"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowNotesDropdown(null)}
                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveNotes(app.id)}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.time_added).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(!app["status"] || app["status"].toLowerCase() === 'pending') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(app.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Payment Confirmation Modal */}
      {showBulkPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Confirm M-Pesa Bulk Payment
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                You are about to process M-Pesa B2C payments for {getSelectedStaffCount()} selected staff members.
              </p>
              
              <div className="mt-3 flex gap-2">
                <button
                  onClick={selectAllStaff}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllStaff}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  Deselect All
                </button>
              </div>
              
              <div className="mt-3 border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-green-700">{formatKES(calculateTotalAmount())}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4 max-h-60 overflow-y-auto">
              <p className="text-sm font-medium mb-2">Staff to be paid:</p>
              <ul className="text-sm divide-y divide-gray-200">
                {approvedApplications.map(app => (
                  <li key={app.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleStaffSelection(app.id)}
                        className="mr-2 text-green-600 hover:text-green-800"
                      >
                        {selectedStaff[app.id] ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <div className={selectedStaff[app.id] ? "font-medium" : "text-gray-500"}>
                          {app["Full Name"]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employeeMobileNumbers[app["Employee Number"]] || 'No mobile number'}
                        </div>
                      </div>
                    </div>
                    <span className={selectedStaff[app.id] ? "font-medium" : "text-gray-500"}>
                      {formatKES(Number(app["Amount Requested"]))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkPaymentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={isProcessingBulkPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPayment}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2"
                disabled={isProcessingBulkPayment || getSelectedStaffCount() === 0}
              >
                {isProcessingBulkPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Processing M-Pesa...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Confirm M-Pesa Payment ({getSelectedStaffCount()})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryAdvanceAdmin;
