import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../lib/supabase';
import toast from 'react-hot-toast';
import { 
  Users, 
  FileText, 
  Clock, 
  Building, 
  CheckCircle, 
  XCircle, 
  Loader2,
  UserPlus,
  Mail,
  UserRound,
  Shield,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  ChevronDown,
  CheckSquare,
  Square
} from 'lucide-react';

export default function StaffSignupRequests() {
  const [requests, setRequests] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequests, setSelectedRequests] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchRequests();
    fetchBranches();
  }, [currentPage, selectedBranch]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_signup_requests')
        .select('branch')
        .eq('status', 'pending');

      if (error) throw error;

      // Get unique branches, filter out null/undefined, and sort them
      const uniqueBranches = [...new Set(data
        .map(item => item.branch)
        .filter(branch => branch != null && branch.trim() !== '')
      )].sort();
      setAllBranches(uniqueBranches);
    } catch (error) {
      console.error('Fetch branches error:', error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('staff_signup_requests')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      // Apply branch filter
      if (selectedBranch !== 'all') {
        query = query.eq('branch', selectedBranch);
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: true })
        .range(from, to);

      if (error) throw error;
      setRequests(data || []);
      setTotalCount(count || 0);
      setSelectedRequests(new Set()); // Clear selections when requests change
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch signup requests');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const sendWelcomeEmail = async (email, tempPassword, branch) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTION_URL}/dynamic-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to_email: email,
          subject: `Welcome to Zira HR - Staff Account Approved`,
          html_content: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #2563eb; text-align: center;">Welcome to Zira HR!</h2>
              <p style="font-size: 16px;">Your staff account has been approved by the administrator.</p>
              
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="font-weight: bold; margin-bottom: 8px;">Your login credentials:</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>
              
              <p style="font-size: 14px; color: #64748b;">Please log in and change your password immediately for security reasons.</p>
              <p style="font-size: 14px;"><strong>Assigned Branch:</strong> ${branch}</p>
              
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                <p>If you didn't request this account, please contact our support team immediately.</p>
              </div>
            </div>
          `,
          from_email: 'noreply@zirahrapp.com'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      return await response.json();
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  };

  const handleApprove = async (requestId, email, branch) => {
    setProcessingId(requestId);
    const tempPassword = generateRandomPassword();
    
    try {
      // 1. Create user account
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          role: 'STAFF',
          branch: branch || 'Main Branch' // Default branch if null
        }
      });

      if (userError) throw userError;

      // 2. Delete the request
      const { error: deleteError } = await supabase
        .from('staff_signup_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      // 3. Send welcome email
      await sendWelcomeEmail(email, tempPassword, branch || 'Main Branch');

      toast.success(`Account approved! Welcome email sent to ${email}`);
      fetchRequests();
      fetchBranches(); // Refresh branches list
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(`Failed to approve request: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.size === 0) {
      toast.error('Please select at least one request to approve');
      return;
    }

    setBulkProcessing(true);
    const selectedRequestsArray = Array.from(selectedRequests);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const requestId of selectedRequestsArray) {
        const request = requests.find(req => req.id === requestId);
        if (request) {
          try {
            const tempPassword = generateRandomPassword();
            
            // 1. Create user account
            const { error: userError } = await supabaseAdmin.auth.admin.createUser({
              email: request.email,
              password: tempPassword,
              email_confirm: true,
              user_metadata: {
                role: 'STAFF',
                branch: request.branch || 'Main Branch'
              }
            });

            if (userError) throw userError;

            // 2. Delete the request
            const { error: deleteError } = await supabase
              .from('staff_signup_requests')
              .delete()
              .eq('id', requestId);

            if (deleteError) throw deleteError;

            // 3. Send welcome email
            await sendWelcomeEmail(request.email, tempPassword, request.branch || 'Main Branch');
            
            successCount++;
          } catch (error) {
            console.error(`Failed to approve request ${requestId}:`, error);
            errorCount++;
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully approved ${successCount} request(s)`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to approve ${errorCount} request(s)`);
      }

      fetchRequests();
      fetchBranches();
      setSelectedRequests(new Set());
    } catch (error) {
      console.error('Bulk approval error:', error);
      toast.error('Bulk approval process failed');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleReject = async (requestId, email) => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from('staff_signup_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Request from ${email} has been rejected`);
      fetchRequests();
      fetchBranches(); // Refresh branches list
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setCurrentPage(1); // Reset to first page when filter changes
    setIsDropdownOpen(false);
    setSearchTerm(''); // Clear search when selection is made
  };

  // Safe branch filtering with null check
  const filteredBranches = allBranches.filter(branch =>
    branch && branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRequestSelection = (requestId) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRequests.size === requests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(requests.map(req => req.id)));
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getSelectedBranchLabel = () => {
    if (selectedBranch === 'all') return 'All Branches';
    return selectedBranch;
  };

  const getBranchDisplayName = (branch) => {
    return branch || 'No Branch Assigned';
  };

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-gray-600 font-medium">Loading requests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Signup Requests</h1>
              <p className="text-gray-600">Review and manage pending staff account requests</p>
            </div>
          </div>
        </div>

        {/* Stats and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Card */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-xs border border-gray-200 p-6 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Page {currentPage} of {totalPages}
                </p>
                {selectedRequests.size > 0 && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {selectedRequests.size} selected
                  </p>
                )}
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Branch Filter Dropdown */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-xs border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">Filter by Branch</h3>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                {selectedBranch === 'all' ? 'Showing all branches' : `Filtered by: ${selectedBranch}`}
              </span>
            </div>
            
            {/* Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {getSelectedBranchLabel()}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search branches..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="max-h-60 overflow-y-auto">
                    {/* All Branches Option */}
                    <button
                      onClick={() => handleBranchSelect('all')}
                      className={`w-full flex items-center px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${
                        selectedBranch === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4" />
                        <span className="font-medium">All Branches</span>
                      </div>
                    </button>

                    {/* Branch Options */}
                    {filteredBranches.length > 0 ? (
                      filteredBranches.map((branch) => (
                        <button
                          key={branch}
                          onClick={() => handleBranchSelect(branch)}
                          className={`w-full flex items-center px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${
                            selectedBranch === branch ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4" />
                            <span>{branch}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No branches found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Filter Info */}
            {selectedBranch !== 'all' && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Showing requests for: <strong>{selectedBranch}</strong>
                </span>
                <button
                  onClick={() => handleBranchSelect('all')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {requests.length > 0 && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {selectedRequests.size === requests.length ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                  <span>
                    {selectedRequests.size === requests.length ? 'Deselect All' : 'Select All'}
                  </span>
                </button>
                
                {selectedRequests.size > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedRequests.size} request(s) selected
                  </span>
                )}
              </div>

              {selectedRequests.size > 0 && (
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkProcessing}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm"
                >
                  {bulkProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving {selectedRequests.size} Request(s)...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Selected ({selectedRequests.size})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedBranch === 'all' ? 'No pending requests' : `No pending requests for ${selectedBranch}`}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {selectedBranch === 'all' 
                ? 'All staff signup requests have been processed.' 
                : `There are no pending requests for the ${selectedBranch} branch.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div 
                key={request.id} 
                className={`bg-white rounded-xl shadow-xs border transition-all duration-200 overflow-hidden ${
                  selectedRequests.has(request.id) 
                    ? 'border-blue-500 ring-2 ring-blue-100' 
                    : 'border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    {/* Selection Checkbox and Request Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <button
                          onClick={() => toggleRequestSelection(request.id)}
                          className="mt-2 flex-shrink-0"
                        >
                          {selectedRequests.has(request.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm mt-1 flex-shrink-0">
                          <span className="text-white font-semibold text-lg">
                            {request.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{request.email}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Pending
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600 mt-2">
                            <div className="flex items-center space-x-1.5">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span>{getBranchDisplayName(request.branch)}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{new Date(request.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleReject(request.id, request.email)}
                        disabled={processingId === request.id || bulkProcessing}
                        className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs"
                      >
                        {processingId === request.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2 text-red-500" />
                            Reject
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleApprove(request.id, request.email, request.branch)}
                        disabled={processingId === request.id || bulkProcessing}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs shadow-sm"
                      >
                        {processingId === request.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 bg-white rounded-xl shadow-xs border border-gray-200 p-4">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} requests
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}