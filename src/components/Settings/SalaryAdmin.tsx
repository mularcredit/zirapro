import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, XCircle, Clock, Search, ChevronDown, Send, Users, 
  CheckSquare, Square, ChevronLeft, ChevronRight, UserCheck, ShieldCheck,
  Eye, AlertTriangle, Loader, CheckCircle, XCircle as XCircleIcon,
  User, UserCog, Settings, MapPin, Filter, X
} from 'lucide-react';

// Status Badge Component for Maker-Checker
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: Clock,
      label: 'Pending Approval'
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: CheckCircle,
      label: 'Approved'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: XCircleIcon,
      label: 'Rejected'
    },
    processing: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: Loader,
      label: 'Processing'
    },
    completed: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      icon: CheckCircle,
      label: 'Completed'
    },
    failed: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: XCircleIcon,
      label: 'Failed'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Payment Request Card Component
const PaymentRequestCard = ({ request, onApprove, onReject, onViewDetails, userRole }) => {
  const isChecker = userRole === 'checker' || userRole === 'credit_analyst_officer';
  const totalAmount = request.advances_data?.reduce((sum, advance) => sum + (advance.amount_requested || 0), 0) || 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Salary Advance Bulk Payment ({request.advances_data?.length || 0} advances)
            </h3>
            <p className="text-xs text-gray-600">
              Initiated by {request.created_by_email} • {new Date(request.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600">Total Amount</p>
          <p className="font-bold text-lg text-green-600">KSh {totalAmount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Payment Method</p>
          <p className="font-medium">M-Pesa B2C</p>
        </div>
      </div>

      {request.advances_data && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-2">Advances:</p>
          <div className="max-h-20 overflow-y-auto text-xs">
            {request.advances_data.slice(0, 3).map((advance, index) => (
              <div key={index} className="flex justify-between py-1">
                <span>{advance.full_name}</span>
                <span>KSh {advance.amount_requested?.toLocaleString()}</span>
              </div>
            ))}
            {request.advances_data.length > 3 && (
              <p className="text-gray-500 text-xs mt-1">
                +{request.advances_data.length - 3} more advances
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(request)}
          className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        
        {isChecker && request.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(request)}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => onReject(request)}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <XCircleIcon className="w-4 h-4" />
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Payment Details Modal Component
const PaymentDetailsModal = ({ payment, isOpen, onClose, onApprove, onReject, userRole }) => {
  if (!isOpen || !payment) return null;

  const isChecker = userRole === 'checker' || userRole === 'credit_analyst_officer';
  const totalAmount = payment.advances_data?.reduce((sum, advance) => sum + (advance.amount_requested || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Salary Advance Payment Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600">Payment Type</p>
                <p className="font-semibold">Salary Advance Bulk Payment</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="font-semibold text-green-600">KSh {totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <StatusBadge status={payment.status} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Created</p>
                <p className="font-semibold">{new Date(payment.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Justification</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{payment.justification}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Audit Trail</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Payment request created by {payment.created_by_email}</span>
                <span className="text-gray-500">{new Date(payment.created_at).toLocaleString()}</span>
              </div>
              {payment.approved_by_email && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Approved by {payment.approved_by_email}</span>
                  <span className="text-gray-500">{new Date(payment.approved_at).toLocaleString()}</span>
                </div>
              )}
              {payment.rejected_by_email && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Rejected by {payment.rejected_by_email}</span>
                  <span className="text-gray-500">{new Date(payment.rejected_at).toLocaleString()}</span>
                  {payment.rejection_reason && (
                    <span className="text-red-600">- {payment.rejection_reason}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Salary Advances to be Paid</h3>
            
            {payment.advances_data && (
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Employee</th>
                      <th className="px-3 py-2 text-right">Phone Number</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-center">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payment.advances_data.map((advance, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">
                          <div>
                            <p className="font-medium">{advance.full_name}</p>
                            <p className="text-gray-500 text-xs">{advance.employee_number}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">{advance.mobile_number}</td>
                        <td className="px-3 py-2 text-right font-medium">KSh {advance.amount_requested?.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center">
                          {advance.branch_manager_approval && advance.regional_manager_approval ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Fully Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Pending Approval
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {isChecker && payment.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => onApprove(payment)}
                className="flex-1 px-4 py-3 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Payment
              </button>
              <button
                onClick={() => onReject(payment)}
                className="flex-1 px-4 py-3 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <XCircleIcon className="w-4 h-4" />
                Reject Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Rejection Modal Component
const RejectionModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <XCircleIcon className="h-5 w-5 text-red-600" />
          Reject Payment Request
        </h3>
        
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Reason for rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this payment request..."
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

// Role Management Component
const RoleManagement = ({ userRole, onRoleChange, currentUser }) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempRole, setTempRole] = useState(userRole);

  const handleRoleChange = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: tempRole })
        .eq('user_id', currentUser.id);

      if (error) throw error;

      onRoleChange(tempRole);
      setShowRoleModal(false);
      toast.success(`Role updated to ${tempRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'maker': return <User className="w-4 h-4" />;
      case 'checker': return <UserCheck className="w-4 h-4" />;
      case 'credit_analyst_officer': return <UserCog className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'maker': return 'bg-blue-100 text-blue-800';
      case 'checker': return 'bg-orange-100 text-orange-800';
      case 'credit_analyst_officer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
          {getRoleIcon(userRole)}
          {userRole.replace(/_/g, ' ').toUpperCase()}
        </span>
        
        {currentUser && (
          <button
            onClick={() => setShowRoleModal(true)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Change Role"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change User Role</h3>
            
            <div className="space-y-3 mb-6">
              <div className="text-sm text-gray-600 mb-4">
                Select a role to test different permissions in the maker-checker workflow.
              </div>

              {['maker', 'checker', 'credit_analyst_officer'].map((role) => (
                <label key={role} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value={role}
                    checked={tempRole === role}
                    onChange={(e) => setTempRole(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-2">
                    {getRoleIcon(role)}
                    <div>
                      <div className="font-medium capitalize">{role.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-gray-500">
                        {role === 'maker' && 'Can create payment requests but cannot approve or process payments'}
                        {role === 'checker' && 'Can approve/reject payment requests but cannot create them'}
                        {role === 'credit_analyst_officer' && 'Can create, approve, and process payments'}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                className="px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Change Role
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Region and Town Filter Component
const RegionTownFilter = ({ 
  selectedRegion, 
  selectedTown, 
  onRegionChange, 
  onTownChange, 
  regions, 
  townsByRegion 
}) => {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <Filter className="w-4 h-4" />
        Filter
        {(selectedRegion || selectedTown) && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {selectedRegion ? '1' : '0'}
          </span>
        )}
      </button>

      {showFilter && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-900">Filter by Region & Town</h3>
            <button
              onClick={() => setShowFilter(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={selectedRegion || ''}
                onChange={(e) => onRegionChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Town
              </label>
              <select
                value={selectedTown || ''}
                onChange={(e) => onTownChange(e.target.value)}
                disabled={!selectedRegion}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Towns</option>
                {selectedRegion && townsByRegion[selectedRegion]?.map(town => (
                  <option key={town} value={town}>
                    {town}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  onRegionChange('');
                  onTownChange('');
                }}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  
  // Region and Town Filter State
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [townsByRegion, setTownsByRegion] = useState<Record<string, string[]>>({});
  const [allTowns, setAllTowns] = useState<string[]>([]);

  // New state for approval/rejection modals
  const [showApprovalModal, setShowApprovalModal] = useState<string | null>(null);
  const [approvalAction, setApprovalAction] = useState<'branch-approve' | 'branch-reject' | 'regional-approve' | 'regional-reject' | 'admin-approve' | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Maker-Checker Payment Flow State
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('maker');
  const [currentUser, setCurrentUser] = useState(null);
  const [showApprovalQueue, setShowApprovalQueue] = useState(false);
  const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [paymentToReject, setPaymentToReject] = useState(null);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchApplications();
    fetchUserProfile();
    fetchRegionsAndTowns();
  }, []);

  // Fetch regions and towns data
  const fetchRegionsAndTowns = async () => {
    try {
      // Fetch from your regions/towns table or employees table
      const { data, error } = await supabase
        .from('employees')
        .select('Region, Town')
        .not('Region', 'is', null)
        .not('Town', 'is', null);

      if (error) throw error;

      // Extract unique regions and towns
      const uniqueRegions = [...new Set(data.map(item => item.Region))].filter(Boolean);
      const uniqueTowns = [...new Set(data.map(item => item.Town))].filter(Boolean);
      
      // Group towns by region
      const townsByRegionMap: Record<string, string[]> = {};
      data.forEach(item => {
        if (item.Region && item.Town) {
          if (!townsByRegionMap[item.Region]) {
            townsByRegionMap[item.Region] = [];
          }
          if (!townsByRegionMap[item.Region].includes(item.Town)) {
            townsByRegionMap[item.Region].push(item.Town);
          }
        }
      });

      setRegions(uniqueRegions);
      setTownsByRegion(townsByRegionMap);
      setAllTowns(uniqueTowns);

    } catch (error) {
      console.error('Error fetching regions and towns:', error);
      // Fallback to some default regions/towns if needed
      setRegions(['Nairobi', 'Coast', 'Central', 'Rift Valley', 'Western', 'Nyanza', 'Eastern']);
      setAllTowns(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.warn('User not authenticated');
        return;
      }

      setCurrentUser(user);

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.warn('No user profile found, creating default maker profile');
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              user_id: user.id, 
              role: 'maker',
              email: user.email
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          setUserRole('maker');
        } else {
          setUserRole(newProfile.role || 'maker');
        }
      } else {
        setUserRole(profile.role || 'maker');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserRole('maker');
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const { data, error } = await supabase
        .from('salary_advance_payment_flows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment requests:', error);
        toast.error('Failed to load payment requests');
        return;
      }

      setPaymentRequests(data || []);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast.error('Failed to load payment requests');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchPaymentRequests();
    }
  }, [currentUser]);

  const updateUserRole = (newRole) => {
    setUserRole(newRole);
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('salary_advance')
        .select('*')
        .order('time_added', { ascending: false });

      // Apply region/town filters if selected
      if (selectedRegion) {
        query = query.eq('Region', selectedRegion);
      }
      if (selectedTown) {
        query = query.eq('Town', selectedTown);
      }

      const { data, error } = await query;

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

  // Refetch applications when filters change
  useEffect(() => {
    fetchApplications();
  }, [selectedRegion, selectedTown]);

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

  // Open approval modal
  const openApprovalModal = (id: string, action: 'branch-approve' | 'branch-reject' | 'regional-approve' | 'regional-reject' | 'admin-approve') => {
    setShowApprovalModal(id);
    setApprovalAction(action);
    setApprovalNotes('');
  };

  // Close approval modal
  const closeApprovalModal = () => {
    setShowApprovalModal(null);
    setApprovalAction(null);
    setApprovalNotes('');
  };

  // Handle approval/rejection with notes
  const handleApprovalAction = async () => {
    if (!showApprovalModal || !approvalAction) return;

    if (!approvalNotes.trim()) {
      toast.error('Please provide notes for this action');
      return;
    }

    try {
      let updateData: any = {};
      const currentDate = new Date().toISOString();

      switch (approvalAction) {
        case 'branch-approve':
          updateData = {
            branch_manager_approval: true,
            branch_manager_approval_date: currentDate,
            admin_notes: approvalNotes
          };
          break;
        
        case 'branch-reject':
          updateData = {
            branch_manager_approval: false,
            status: 'Rejected',
            admin_notes: approvalNotes
          };
          break;
        
        case 'regional-approve':
          updateData = {
            regional_manager_approval: true,
            regional_manager_approval_date: currentDate,
            status: 'Approved',
            admin_notes: approvalNotes
          };
          break;
        
        case 'regional-reject':
          updateData = {
            regional_manager_approval: false,
            status: 'Rejected',
            admin_notes: approvalNotes
          };
          break;
        
        case 'admin-approve':
          updateData = {
            branch_manager_approval: true,
            regional_manager_approval: true,
            status: 'Approved',
            admin_notes: approvalNotes,
            branch_manager_approval_date: currentDate,
            regional_manager_approval_date: currentDate
          };
          break;
      }

      const { error } = await supabase
        .from('salary_advance')
        .update(updateData)
        .eq('id', showApprovalModal);

      if (error) throw error;

      // Update selected staff for approved applications
      if (approvalAction === 'regional-approve' || approvalAction === 'admin-approve') {
        setSelectedStaff(prev => ({
          ...prev,
          [showApprovalModal]: true
        }));
      }

      // Remove from selected staff when rejected
      if (approvalAction.includes('reject')) {
        setSelectedStaff(prev => {
          const newSelection = {...prev};
          delete newSelection[showApprovalModal];
          return newSelection;
        });
      }

      // Show appropriate success message
      const actionMessages = {
        'branch-approve': 'Branch manager approval granted!',
        'branch-reject': 'Application rejected by branch manager!',
        'regional-approve': 'Regional manager approval granted! Application fully approved!',
        'regional-reject': 'Application rejected by regional manager!',
        'admin-approve': 'Application fully approved by admin!'
      };

      toast.success(actionMessages[approvalAction]);
      
      closeApprovalModal();
      fetchApplications();
    } catch (error) {
      console.error('Error processing approval action:', error);
      toast.error('Failed to process approval action');
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
      
      // Use environment-based URL
      const MPESA_API_BASE = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api'
        : 'http://localhost:3001/api';
      
      const response = await fetch(`${MPESA_API_BASE}/mpesa/b2c`, {
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
      
      // Mock mode for development when backend is down
      if (process.env.NODE_ENV === 'development' && error.message.includes('Failed to fetch')) {
        console.warn('Backend unavailable, using mock mode');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          success: true,
          message: 'Mock payment processed successfully',
          transactionId: 'MOCK_' + Date.now()
        };
      }
      
      throw error;
    }
  };

  // Create payment request function for maker-checker flow
  const createPaymentRequest = async (selectedAdvances, justification) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const requestData = {
        type: 'bulk',
        advances_data: selectedAdvances,
        justification: justification,
        total_amount: selectedAdvances.reduce((sum, advance) => sum + Number(advance.amount_requested || 0), 0),
        created_by: user.id,
        created_by_email: user.email
      };

      console.log('Creating payment request with data:', requestData);

      const { data, error } = await supabase
        .from('salary_advance_payment_flows')
        .insert([requestData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Payment request created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createPaymentRequest:', error);
      throw error;
    }
  };

  // Approve payment request function
  const approvePayment = async (payment) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error('User not authenticated');
        return;
      }

      // Update local state first for immediate UI feedback
      setPaymentRequests(prev => 
        prev.map(req => 
          req.id === payment.id 
            ? { 
                ...req, 
                status: 'approved',
                approved_by: user.id,
                approved_at: new Date().toISOString(),
                approved_by_email: user.email
              }
            : req
        )
      );

      const updateData = {
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        approved_by_email: user.email
      };

      console.log('Updating payment with data:', updateData);

      const { data, error } = await supabase
        .from('salary_advance_payment_flows')
        .update(updateData)
        .eq('id', payment.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error approving payment request:', error);
        toast.error('Failed to approve payment request');
        // Revert local state on error
        fetchPaymentRequests();
        return;
      }

      try {
        // Process the actual payments
        await processBulkMpesaPayment(payment.advances_data);

        await supabase
          .from('salary_advance_payment_flows')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', payment.id);

        setPaymentRequests(prev => 
          prev.map(req => req.id === payment.id ? { ...req, status: 'completed' } : req)
        );

        toast.success('Payment approved and processed successfully!');
      } catch (error) {
        await supabase
          .from('salary_advance_payment_flows')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            metadata: { error: error.message }
          })
          .eq('id', payment.id);

        setPaymentRequests(prev => 
          prev.map(req => req.id === payment.id ? { ...req, status: 'failed' } : req)
        );
        
        console.error('Payment processing error:', error);
        toast.error('Payment approved but failed to process');
      }
    } catch (error) {
      console.error('Payment approval error:', error);
      toast.error('Failed to approve payment request');
    }
  };

  // Reject payment request function
  const rejectPayment = async (payment, reason) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error('User not authenticated');
        return;
      }

      setPaymentRequests(prev => 
        prev.map(req => 
          req.id === payment.id 
            ? { 
                ...req, 
                status: 'rejected',
                rejected_by: user.id,
                rejected_at: new Date().toISOString(),
                rejection_reason: reason,
                rejected_by_email: user.email
              }
            : req
        )
      );

      const updateData = {
        status: 'rejected',
        rejected_by: user.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        rejected_by_email: user.email
      };

      const { data, error } = await supabase
        .from('salary_advance_payment_flows')
        .update(updateData)
        .eq('id', payment.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error rejecting payment request:', error);
        toast.error('Failed to reject payment request');
        fetchPaymentRequests();
        return;
      }

      toast.success('Payment request rejected');
    } catch (error) {
      console.error('Payment rejection error:', error);
      toast.error('Failed to reject payment request');
    }
  };

  // Process bulk M-Pesa payment (for checkers/admins only)
  const processBulkMpesaPayment = async (advancesData: any[]) => {
    // Security check - makers should never reach this function
    if (userRole === 'maker') {
      throw new Error('Makers are not authorized to process payments directly');
    }

    const results = [];
    
    for (const advance of advancesData) {
      try {
        const result = await processMpesaPayment(
          advance.employee_number,
          advance.amount_requested,
          advance.full_name
        );
        
        results.push({ success: true, advance, result });
        
        // Update application status to "Paid"
        const { error } = await supabase
          .from('salary_advance')
          .update({ status: 'Paid' })
          .eq('Employee Number', advance.employee_number)
          .eq('status', 'Approved');

        if (error) throw error;
        
        toast.success(`Payment sent to ${advance.full_name}`);
        
      } catch (error) {
        console.error(`Failed to pay ${advance.full_name}:`, error);
        results.push({ success: false, advance, error });
        toast.error(`Failed to pay ${advance.full_name}`);
      }
      
      // Add a small delay between payments to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  };

  // Bulk payment with proper maker-checker flow and selection clearing
  const handleBulkPayment = async (justification?: string) => {
    const selectedApps = getFullyApprovedApplications().filter(app => selectedStaff[app.id]);
    
    if (selectedApps.length === 0) {
      toast.error('No staff members selected for payment');
      return;
    }

    // Prepare advances data for the payment request
    const advancesData = selectedApps.map(app => ({
      employee_number: app["Employee Number"],
      full_name: app["Full Name"],
      mobile_number: employeeMobileNumbers[app["Employee Number"]],
      amount_requested: Number(app["Amount Requested"]),
      branch_manager_approval: app.branch_manager_approval,
      regional_manager_approval: app.regional_manager_approval
    }));

    // MAKERS can only create payment requests
    if (userRole === 'maker') {
      if (!justification?.trim()) {
        toast.error('Please provide justification for the payment request');
        return;
      }

      try {
        await createPaymentRequest(advancesData, justification);
        toast.success('Payment request submitted for approval!');
        
        // CLEAR SELECTIONS after successful request
        setSelectedStaff({});
        setApprovalNotes('');
        setShowBulkPaymentModal(false);
        fetchPaymentRequests();
      } catch (error) {
        console.error('Error creating payment request:', error);
        toast.error('Failed to submit payment request');
      }
    } 
    // CHECKERS and CREDIT_ANALYST_OFFICERS can process payments directly
    else if (userRole === 'checker' || userRole === 'credit_analyst_officer') {
      setIsProcessingBulkPayment(true);
      try {
        const results = await processBulkMpesaPayment(advancesData);
        
        const successCount = results.filter(r => r.success).length;
        const totalCount = selectedApps.length;
        
        if (successCount === totalCount) {
          toast.success(`All ${totalCount} payments processed successfully!`);
        } else if (successCount > 0) {
          toast.success(`${successCount} of ${totalCount} payments processed successfully`);
        } else {
          toast.error('All payments failed. Please check your payment service configuration.');
        }
        
        // CLEAR SELECTIONS after successful payment processing
        setSelectedStaff({});
        setApprovalNotes('');
        setShowBulkPaymentModal(false);
        fetchApplications();
      } catch (error) {
        console.error('Error processing bulk payments:', error);
        toast.error(`Failed to process payments: ${error.message}`);
      } finally {
        setIsProcessingBulkPayment(false);
      }
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

  const getActionTitle = (action: string) => {
    const titles = {
      'branch-approve': 'Branch Manager Approval',
      'branch-reject': 'Branch Manager Rejection',
      'regional-approve': 'Regional Manager Approval',
      'regional-reject': 'Regional Manager Rejection',
      'admin-approve': 'Admin Approval'
    };
    return titles[action as keyof typeof titles] || 'Approval Action';
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

  // Pending payment requests count
  const pendingCount = paymentRequests.filter(p => p.status === 'pending').length;

  // Handle region change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedTown(''); // Reset town when region changes
    setCurrentPage(1); // Reset to first page
  };

  // Handle town change
  const handleTownChange = (town: string) => {
    setSelectedTown(town);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-lg font-medium text-gray-900">Salary Advance Requests</h2>
        
        <div className="flex items-center gap-3">
          {/* Region and Town Filter */}
          <RegionTownFilter
            selectedRegion={selectedRegion}
            selectedTown={selectedTown}
            onRegionChange={handleRegionChange}
            onTownChange={handleTownChange}
            regions={regions}
            townsByRegion={townsByRegion}
          />

          {/* Role Management Component */}
          <RoleManagement 
            userRole={userRole} 
            onRoleChange={updateUserRole}
            currentUser={currentUser}
          />

          {/* Approval Queue Button for Checkers */}
          {(userRole === 'checker' || userRole === 'credit_analyst_officer') && pendingCount > 0 && (
            <button
              onClick={() => setShowApprovalQueue(true)}
              className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 px-3 py-1"
            >
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">
                {pendingCount} Pending Approvals
              </span>
            </button>
          )}

          {fullyApprovedApplications.length > 0 && (
            <button
              onClick={() => setShowBulkPaymentModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-xs font-medium"
            >
              <Send size={16} />
              {userRole === 'maker' ? 'Create Payment Request' : 'Process Payments'} ({getSelectedStaffCount()})
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

      {/* Filter Display */}
      {(selectedRegion || selectedTown) && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-gray-600">Active filters:</span>
          {selectedRegion && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              Region: {selectedRegion}
              <button
                onClick={() => handleRegionChange('')}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedTown && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              Town: {selectedTown}
              <button
                onClick={() => handleTownChange('')}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Payment Approval Queue */}
      {showApprovalQueue && (userRole === 'checker' || userRole === 'credit_analyst_officer') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Payment Approval Queue
              {isLoadingRequests && (
                <Loader className="w-4 h-4 animate-spin text-gray-400" />
              )}
            </h2>
            <button
              onClick={() => setShowApprovalQueue(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {paymentRequests.length > 0 ? (
            <div className="grid gap-4">
              {paymentRequests
                .filter(payment => payment.status === 'pending')
                .map((payment) => (
                <PaymentRequestCard
                  key={payment.id}
                  request={payment}
                  userRole={userRole}
                  onApprove={() => approvePayment(payment)}
                  onReject={() => {
                    setPaymentToReject(payment);
                    setShowRejectionModal(true);
                  }}
                  onViewDetails={() => {
                    setSelectedPaymentForDetails(payment);
                    setShowPaymentDetails(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending payments</h3>
              <p className="text-gray-600">All payment requests have been processed.</p>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No salary advance requests found.
          {(selectedRegion || selectedTown) && (
            <p className="text-xs mt-2">Try changing your filters or search term.</p>
          )}
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
                              onClick={() => openApprovalModal(app.id, 'branch-approve')}
                              className="text-green-600 hover:text-green-900 text-xs border border-green-200 px-1 rounded"
                              title="Branch Manager Approve"
                            >
                              BM ✓
                            </button>
                            <button
                              onClick={() => openApprovalModal(app.id, 'branch-reject')}
                              className="text-red-600 hover:text-red-900 text-xs border border-red-200 px-1 rounded"
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
                              onClick={() => openApprovalModal(app.id, 'regional-approve')}
                              className="text-green-600 hover:text-green-900 text-xs border border-green-200 px-1 rounded"
                              title="Regional Manager Approve"
                            >
                              RM ✓
                            </button>
                            <button
                              onClick={() => openApprovalModal(app.id, 'regional-reject')}
                              className="text-red-600 hover:text-red-900 text-xs border border-red-200 px-1 rounded"
                              title="Regional Manager Reject"
                            >
                              RM ✗
                            </button>
                          </div>
                        )}

                        {/* Admin Override Action */}
                        {app.status?.toLowerCase() === 'pending' && (
                          <button
                            onClick={() => openApprovalModal(app.id, 'admin-approve')}
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

      {/* Bulk Payment Modal with Maker-Checker Flow */}
      {showBulkPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              {userRole === 'maker' ? 'Create Payment Request' : 'Process M-Pesa Bulk Payment'}
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                {userRole === 'maker' 
                  ? `You are creating a payment request for ${getSelectedStaffCount()} selected staff members. This will require approval before processing.`
                  : `You are about to process M-Pesa B2C payments for ${getSelectedStaffCount()} selected staff members.`
                }
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

            {/* Justification field - required for all roles */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                {userRole === 'maker' ? 'Justification for Payment Request' : 'Payment Notes'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder={
                  userRole === 'maker' 
                    ? "Please provide justification for this payment request..."
                    : "Please provide notes for this payment processing..."
                }
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {userRole === 'maker' 
                  ? 'This payment request will be submitted for approval before processing.'
                  : 'These notes will be recorded in the payment history.'
                }
              </p>
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
                onClick={() => handleBulkPayment(approvalNotes)}
                className="px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2"
                disabled={isProcessingBulkPayment || getSelectedStaffCount() === 0 || !approvalNotes.trim()}
              >
                {isProcessingBulkPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {userRole === 'maker' 
                      ? `Submit Request (${getSelectedStaffCount()})`
                      : `Process Payments (${getSelectedStaffCount()})`
                    }
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        payment={selectedPaymentForDetails}
        isOpen={showPaymentDetails}
        onClose={() => setShowPaymentDetails(false)}
        onApprove={() => {
          approvePayment(selectedPaymentForDetails);
          setShowPaymentDetails(false);
        }}
        onReject={() => {
          setPaymentToReject(selectedPaymentForDetails);
          setShowRejectionModal(true);
          setShowPaymentDetails(false);
        }}
        userRole={userRole}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={(reason) => {
          rejectPayment(paymentToReject, reason);
          setPaymentToReject(null);
        }}
      />

      {/* Existing Approval Modal */}
      {showApprovalModal && approvalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {getActionTitle(approvalAction)}
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Notes (Required) *
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Please provide notes for this approval/rejection decision..."
                className="w-full p-3 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Notes are required for all approval and rejection actions.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeApprovalModal}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalAction}
                disabled={!approvalNotes.trim()}
                className="px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm {approvalAction.includes('approve') ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryAdvanceAdmin;