import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Clock, Search, ChevronDown, Send, Users, CheckSquare, Square, ChevronLeft, ChevronRight, UserCheck, ShieldCheck } from 'lucide-react';

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
  const [selectedStaff, setSelectedStaff] = useState<Record<string, boolean>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

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

      // Initialize selected staff - only fully approved applications are selected by default
      const initialSelected: Record<string, boolean> = {};
      data?.forEach(app => {
        if (app.status?.toLowerCase() === 'approved' && 
            app.branch_manager_approval === true && 
            app.regional_manager_approval === true) {
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

  // Get fully approved applications (both branch and regional manager approved)
  const getFullyApprovedApplications = () => {
    return applications.filter(app => 
      app.status?.toLowerCase() === 'approved' && 
      app.branch_manager_approval === true && 
      app.regional_manager_approval === true
    );
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
    const approvedApps = getFullyApprovedApplications();
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
    getFullyApprovedApplications().forEach(app => {
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

  // Branch Manager Approval
  const handleBranchManagerApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_advance')
        .update({ 
          branch_manager_approval: true,
          branch_manager_approval_date: new Date().toISOString(),
          admin_notes: notes[id] || null 
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Branch manager approval granted!');
      fetchApplications();
    } catch (error) {
      console.error('Error with branch manager approval:', error);
      toast.error('Failed to process branch manager approval');
    }
  };

  // Branch Manager Rejection
  const handleBranchManagerReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_advance')
        .update({ 
          branch_manager_approval: false,
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
      
      toast.success('Application rejected by branch manager!');
      fetchApplications();
    } catch (error) {
      console.error('Error with branch manager rejection:', error);
      toast.error('Failed to process branch manager rejection');
    }
  };

  // Regional Manager Approval
  const handleRegionalManagerApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_advance')
        .update({ 
          regional_manager_approval: true,
          regional_manager_approval_date: new Date().toISOString(),
          status: 'Approved', // Final approval
          admin_notes: notes[id] || null 
        })
        .eq('id', id);

      if (error) throw error;
      
      // Add to selected staff when fully approved
      setSelectedStaff(prev => ({
        ...prev,
        [id]: true
      }));
      
      toast.success('Regional manager approval granted! Application fully approved!');
      fetchApplications();
    } catch (error) {
      console.error('Error with regional manager approval:', error);
      toast.error('Failed to process regional manager approval');
    }
  };

  // Regional Manager Rejection
  const handleRegionalManagerReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_advance')
        .update({ 
          regional_manager_approval: false,
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
      
      toast.success('Application rejected by regional manager!');
      fetchApplications();
    } catch (error) {
      console.error('Error with regional manager rejection:', error);
      toast.error('Failed to process regional manager rejection');
    }
  };

  // Admin can override and approve directly (for urgent cases)
  const handleAdminApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_advance')
        .update({ 
          branch_manager_approval: true,
          regional_manager_approval: true,
          status: 'Approved',
          admin_notes: notes[id] || null,
          branch_manager_approval_date: new Date().toISOString(),
          regional_manager_approval_date: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Add to selected staff when approved
      setSelectedStaff(prev => ({
        ...prev,
        [id]: true
      }));
      
      toast.success('Application fully approved by admin!');
      fetchApplications();
    } catch (error) {
      console.error('Error with admin approval:', error);
      toast.error('Failed to process admin approval');
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
      const response = await fetch('http://localhost:3001/api/mpesa/b2c', {
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
      const approvedApps = getFullyApprovedApplications();
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

  const getApprovalStatus = (app: any) => {
    if (app.status?.toLowerCase() === 'rejected') {
      return 'Rejected';
    }
    if (app.status?.toLowerCase() === 'paid') {
      return 'Paid';
    }
    if (app.regional_manager_approval) {
      return 'Fully Approved';
    }
    if (app.branch_manager_approval) {
      return 'Pending Regional Manager';
    }
    return 'Pending Branch Manager';
  };

  const getApprovalBadgeColor = (status: string) => {
    switch (status) {
      case 'Fully Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending Regional Manager':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending Branch Manager':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const fullyApprovedApplications = getFullyApprovedApplications();

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-lg font-medium text-gray-900">Salary Advance Requests</h2>
        
        <div className="flex items-center gap-3">
          {fullyApprovedApplications.length > 0 && (
            <button
              onClick={() => setShowBulkPaymentModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-xs font-medium"
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
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
        <>
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
                    Approval Status
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
                {currentItems.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">{app["Full Name"]}</div>
                      <div className="text-xs text-gray-500">{app["Employee Number"]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {employeeMobileNumbers[app["Employee Number"]] || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {app["Office Branch"]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === app.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editedAmount}
                            onChange={(e) => setEditedAmount(e.target.value)}
                            className="w-24 p-1 border rounded text-xs"
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
                          className="text-xs font-medium text-gray-900 cursor-pointer hover:underline"
                          onClick={() => handleAmountEdit(app.id, app["Amount Requested"])}
                        >
                          {formatKES(Number(app["Amount Requested"]))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                      {app["Reason for Advance"]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApprovalBadgeColor(getApprovalStatus(app))}`}>
                          {getApprovalStatus(app)}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <UserCheck className="h-3 w-3" />
                          <span>BM: {app.branch_manager_approval ? '✓' : 'Pending'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <ShieldCheck className="h-3 w-3" />
                          <span>RM: {app.regional_manager_approval ? '✓' : 'Pending'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <div className="flex items-center">
                        <button 
                          onClick={() => setShowNotesDropdown(showNotesDropdown === app.id ? null : app.id)}
                          className="flex items-center text-xs text-gray-500 hover:text-gray-700"
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
                            className="w-full p-2 border rounded text-xs mb-2"
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
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(app.time_added).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                      <div className="flex flex-col gap-1">
                        {/* Branch Manager Actions */}
                        {!app.branch_manager_approval && !app.regional_manager_approval && app.status?.toLowerCase() === 'pending' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleBranchManagerApprove(app.id)}
                              className="text-green-600 hover:text-green-900 text-xs"
                              title="Branch Manager Approve"
                            >
                              BM ✓
                            </button>
                            <button
                              onClick={() => handleBranchManagerReject(app.id)}
                              className="text-red-600 hover:text-red-900 text-xs"
                              title="Branch Manager Reject"
                            >
                              BM ✗
                            </button>
                          </div>
                        )}

                        {/* Regional Manager Actions */}
                        {app.branch_manager_approval && !app.regional_manager_approval && app.status?.toLowerCase() === 'pending' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleRegionalManagerApprove(app.id)}
                              className="text-green-600 hover:text-green-900 text-xs"
                              title="Regional Manager Approve"
                            >
                              RM ✓
                            </button>
                            <button
                              onClick={() => handleRegionalManagerReject(app.id)}
                              className="text-red-600 hover:text-red-900 text-xs"
                              title="Regional Manager Reject"
                            >
                              RM ✗
                            </button>
                          </div>
                        )}

                        {/* Admin Override Action */}
                        {app.status?.toLowerCase() === 'pending' && (
                          <button
                            onClick={() => handleAdminApprove(app.id)}
                            className="text-blue-600 hover:text-blue-900 text-xs border border-blue-200 px-1 rounded"
                            title="Admin Override - Approve Immediately"
                          >
                            Admin ✓
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 ml-3 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredApplications.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredApplications.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`relative inline-flex items-center px-3 py-2 text-xs font-medium ${
                          currentPage === page
                            ? 'z-10 bg-green-50 border-green-500 text-green-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } border`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
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
              <p className="text-xs text-gray-600">
                You are about to process M-Pesa B2C payments for {getSelectedStaffCount()} selected staff members.
                Only applications with both Branch Manager and Regional Manager approval will be processed.
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
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-green-700">{formatKES(calculateTotalAmount())}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4 max-h-60 overflow-y-auto">
              <p className="text-xs font-medium mb-2">Staff to be paid:</p>
              <ul className="text-xs divide-y divide-gray-200">
                {fullyApprovedApplications.map(app => (
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
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={isProcessingBulkPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPayment}
                className="px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2"
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