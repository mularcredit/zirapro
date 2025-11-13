import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, XCircle, Clock, Search, ChevronDown, Send, Users, 
  CheckSquare, Square, ChevronLeft, ChevronRight, UserCheck, ShieldCheck,
  Eye, AlertTriangle, Loader, CheckCircle, XCircle as XCircleIcon,
  User, UserCog, Settings, MapPin, Filter, X, Edit3, DollarSign,
  Crown, Key, Building, Map, Award, MessageCircle
} from 'lucide-react';

// Role mapping - Connect your actual roles to SalaryAdvanceAdmin roles
const ROLE_MAPPING = {
  'ADMIN': 'credit_analyst_officer',      // Full admin access
  'CHECKER': 'checker',                   // Payment approver
  'OPERATIONS': 'maker',                  // Request creator  
  'STAFF': 'maker',                       // Request creator
  'MANAGER': 'branch_manager',           // Branch manager
  'REGIONAL': 'regional_manager',        // Regional manager
  'HR': 'maker'                          // Request creator
};

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
    },
    'bm-recommend-current': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: CheckCircle,
      label: 'BM: Recommend Current'
    },
    'bm-recommend-adjusted': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: Edit3,
      label: 'BM: Recommend Adjusted'
    },
    'bm-recommend-reject': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: XCircleIcon,
      label: 'BM: Recommend Reject'
    },
    'rm-recommend-current': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: CheckCircle,
      label: 'RM: Recommend Current'
    },
    'rm-recommend-adjusted': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: Edit3,
      label: 'RM: Recommend Adjusted'
    },
    'rm-recommend-reject': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: XCircleIcon,
      label: 'RM: Recommend Reject'
    },
    'pending-branch-manager': {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      icon: Clock,
      label: 'Pending Branch Manager'
    },
    'pending-regional-manager': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: Clock,
      label: 'Pending Regional Manager'
    },
    'pending-admin': {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      icon: Clock,
      label: 'Pending Admin Approval'
    },
    'fully-approved': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: CheckCircle,
      label: 'Fully Approved'
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

// Manager Badge Component
const ManagerBadge = ({ isBranchManager, isRegionalManager }) => {
  if (!isBranchManager && !isRegionalManager) return null;

  const config = isRegionalManager ? {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    icon: Award,
    label: 'Regional Manager'
  } : {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: UserCog,
    label: 'Branch Manager'
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Comment Modal Component for Regional Managers
const CommentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  application 
}) => {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    if (!comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    onConfirm(comment.trim());
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Add Comment
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Provide advisory comments for this application (Regional Manager only)
        </p>

        {application && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-700">
              <div className="font-medium">{application["Full Name"]}</div>
              <div>Employee: {application["Employee Number"]}</div>
              <div>Amount: KSh {Number(application["Amount Requested"]).toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Provide your advisory comments..."
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
            disabled={!comment.trim()}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Comment
          </button>
        </div>
      </div>
    </div>
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

// Recommendation Modal Component for BM and RM
const RecommendationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  application, 
  actionType,
  currentAmount 
}) => {
  const [notes, setNotes] = useState('');
  const [adjustedAmount, setAdjustedAmount] = useState(currentAmount?.toString() || '');
  const [showAmountField, setShowAmountField] = useState(false);

  useEffect(() => {
    if (actionType === 'bm-recommend-adjusted' || actionType === 'rm-recommend-adjusted' || actionType === 'admin-approve-adjusted') {
      setShowAmountField(true);
      setAdjustedAmount(currentAmount?.toString() || '');
    } else {
      setShowAmountField(false);
    }
    setNotes('');
  }, [actionType, currentAmount]);

  const handleConfirm = () => {
    if (!notes.trim()) {
      toast.error('Please provide notes for your recommendation');
      return;
    }

    if (showAmountField && (!adjustedAmount || isNaN(Number(adjustedAmount)) || Number(adjustedAmount) <= 0)) {
      toast.error('Please enter a valid adjusted amount');
      return;
    }

    onConfirm({
      action: actionType,
      notes: notes.trim(),
      adjustedAmount: showAmountField ? Number(adjustedAmount) : null
    });
    setNotes('');
    setAdjustedAmount('');
    onClose();
  };

  const getActionTitle = () => {
    const titles = {
      'bm-recommend-current': 'Branch Manager - Recommend Current Amount',
      'bm-recommend-adjusted': 'Branch Manager - Recommend Adjusted Amount',
      'bm-recommend-reject': 'Branch Manager - Recommend Rejection',
      'rm-recommend-current': 'Regional Manager - Recommend Current Amount',
      'rm-recommend-adjusted': 'Regional Manager - Recommend Adjusted Amount',
      'rm-recommend-reject': 'Regional Manager - Recommend Rejection',
      'admin-approve-current': 'Admin - Approve Current Amount',
      'admin-approve-adjusted': 'Admin - Approve Adjusted Amount',
      'admin-reject': 'Admin - Reject Application'
    };
    return titles[actionType] || 'Action';
  };

  const getActionDescription = () => {
    const descriptions = {
      'bm-recommend-current': 'Recommend approval with the current requested amount.',

      'bm-recommend-adjusted': 'Recommend approval with an adjusted amount.',
      'bm-recommend-reject': 'Recommend rejection of this application.',
      'rm-recommend-current': 'Recommend approval with the current requested amount.',
      'rm-recommend-adjusted': 'Recommend approval with an adjusted amount.',
      'rm-recommend-reject': 'Recommend rejection of this application.',
      'admin-approve-current': 'Final approval with the current requested amount.',
      'admin-approve-adjusted': 'Final approval with an adjusted amount.',
      'admin-reject': 'Final rejection of this application.'
    };
    return descriptions[actionType] || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          {getActionTitle()}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          {getActionDescription()}
        </p>

        {application && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-700">
              <div className="font-medium">{application["Full Name"]}</div>
              <div>Employee: {application["Employee Number"]}</div>
              <div>Current Amount: KSh {Number(application["Amount Requested"]).toLocaleString()}</div>
              {application.isBranchManager && (
                <div className="text-blue-600 font-medium">Branch Manager</div>
              )}
            </div>
          </div>
        )}

        {showAmountField && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Adjusted Amount (KES) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={adjustedAmount}
                onChange={(e) => setAdjustedAmount(e.target.value)}
                placeholder="Enter adjusted amount"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {currentAmount && (
              <p className="text-xs text-gray-500 mt-1">
                Current amount: KSh {Number(currentAmount).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Recommendation Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Please provide detailed notes for your recommendation..."
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
            disabled={!notes.trim() || (showAmountField && (!adjustedAmount || isNaN(Number(adjustedAmount))))}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Recommendation
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced User Role Display Component
const UserRoleDisplay = ({ userRole, userEmail, actualRole }) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'maker': return <User className="w-4 h-4" />;
      case 'checker': return <UserCheck className="w-4 h-4" />;
      case 'credit_analyst_officer': return <Crown className="w-4 h-4" />;
      case 'branch_manager': return <Building className="w-4 h-4" />;
      case 'regional_manager': return <Map className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'maker': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checker': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'credit_analyst_officer': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'branch_manager': return 'bg-green-100 text-green-800 border-green-200';
      case 'regional_manager': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(userRole)}`}>
          {getRoleIcon(userRole)}
          {userRole.replace(/_/g, ' ').toUpperCase()}
        </span>
        <span className="text-xs text-gray-500 mt-1">
          Actual: {actualRole}
        </span>
      </div>
    </div>
  );
};

// Branch and Town Filter Component
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
  const [justification, setJustification] = useState('');
  
  // Region and Town Filter State
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [townsByRegion, setTownsByRegion] = useState<Record<string, string[]>>({});
  const [allTowns, setAllTowns] = useState<string[]>([]);

  // Manager data state
  const [employeeJobTitles, setEmployeeJobTitles] = useState<Record<string, string>>({});
  const [isBranchManagerMap, setIsBranchManagerMap] = useState<Record<string, boolean>>({});

  // Recommendation modal state
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [recommendationAction, setRecommendationAction] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  // Comment modal state
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Maker-Checker Payment Flow State
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('maker');
  const [actualUserRole, setActualUserRole] = useState('STAFF');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showApprovalQueue, setShowApprovalQueue] = useState(false);
  const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [paymentToReject, setPaymentToReject] = useState(null);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Check if employee is a branch manager
  const checkIfBranchManager = async (employeeNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('"Job Title"')
        .eq('"Employee Number"', employeeNumber)
        .single();

      if (error) throw error;
      
      const jobTitle = data?.["Job Title"]?.toLowerCase() || '';
      const isManager = jobTitle.includes('branch manager') || 
                       jobTitle.includes('manager') || 
                       jobTitle.includes('bm') ||
                       jobTitle.includes('head of');
      
      return isManager;
    } catch (error) {
      console.error('Error checking branch manager status:', error);
      return false;
    }
  };

  // Check if user is approving themselves
  const checkIfSelfApproval = (application: any) => {
    if (!currentUser || !application) return false;
    
    // Check if the application belongs to the current user
    const userEmployeeNumber = currentUser.user_metadata?.employee_number;
    if (userEmployeeNumber && application["Employee Number"] === userEmployeeNumber) {
      return true;
    }
    
    // Fallback: check by email (if employee number not available)
    const userEmail = currentUser.email?.toLowerCase();
    const applicationEmail = application["Email"]?.toLowerCase();
    if (userEmail && applicationEmail && userEmail === applicationEmail) {
      return true;
    }
    
    return false;
  };

  // Enhanced user profile fetching with role detection
  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.warn('User not authenticated');
        return;
      }

      setCurrentUser(user);
      setUserEmail(user.email || '');

      // Use the actual role from user_metadata
      const actualRole = user.user_metadata?.role || 'STAFF';
      const mappedRole = ROLE_MAPPING[actualRole] || 'maker';
      
      console.log('User role detection:', {
        email: user.email,
        actualRole: actualRole,
        mappedRole: mappedRole
      });

      setActualUserRole(actualRole);
      setUserRole(mappedRole);
     

    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserRole('maker');
      setActualUserRole('STAFF');
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
    fetchApplications();
    fetchUserProfile();
    fetchRegionsAndTowns();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchPaymentRequests();
    }
  }, [currentUser]);

  // Fetch regions and towns data
  const fetchRegionsAndTowns = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('Branch, Town')
        .not('Branch', 'is', null)
        .not('Town', 'is', null);

      if (error) throw error;

      const uniqueRegions = [...new Set(data.map(item => item.Branch))].filter(Boolean);
      const uniqueTowns = [...new Set(data.map(item => item.Town))].filter(Boolean);
      
      const townsByRegionMap: Record<string, string[]> = {};
      data.forEach(item => {
        if (item.Branch && item.Town) {
          if (!townsByRegionMap[item.Branch]) {
            townsByRegionMap[item.Branch] = [];
          }
          if (!townsByRegionMap[item.Branch].includes(item.Town)) {
            townsByRegionMap[item.Branch].push(item.Town);
          }
        }
      });

      setRegions(uniqueRegions);
      setTownsByRegion(townsByRegionMap);
      setAllTowns(uniqueTowns);

    } catch (error) {
      console.error('Error fetching regions and towns:', error);
      setRegions(['Nairobi', 'Coast', 'Central', 'Rift Valley', 'Western', 'Nyanza', 'Eastern']);
      setAllTowns(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']);
    }
  };

  // Fetch job titles for all applications
  const fetchJobTitles = async (apps: any[]) => {
    try {
      const employeeNumbers = apps.map(app => app["Employee Number"]).filter(Boolean);
      
      if (employeeNumbers.length === 0) return;

      const { data, error } = await supabase
        .from('employees')
        .select('"Employee Number", "Job Title"')
        .in('"Employee Number"', employeeNumbers);

      if (error) throw error;

      const jobTitleMap: Record<string, string> = {};
      const branchManagerMap: Record<string, boolean> = {};

      data?.forEach(emp => {
        jobTitleMap[emp["Employee Number"]] = emp["Job Title"] || '';
        
        // Check if this employee is a branch manager
        const jobTitle = emp["Job Title"]?.toLowerCase() || '';
        const isManager = jobTitle.includes('branch manager') || 
                         jobTitle.includes('manager') || 
                         jobTitle.includes('bm') ||
                         jobTitle.includes('head of');
        
        branchManagerMap[emp["Employee Number"]] = isManager;
      });

      setEmployeeJobTitles(jobTitleMap);
      setIsBranchManagerMap(branchManagerMap);

    } catch (error) {
      console.error('Error fetching job titles:', error);
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('salary_advance')
        .select('*')
        .order('time_added', { ascending: false });

      // Apply region and town filters
      if (selectedRegion) {
        query = query.eq('Branch', selectedRegion);
      }
      if (selectedTown) {
        query = query.eq('Town', selectedTown);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Enhance applications with manager status
      const enhancedApplications = data?.map(app => ({
        ...app,
        isBranchManager: isBranchManagerMap[app["Employee Number"]] || false
      })) || [];
      
      setApplications(enhancedApplications);
      
      // Fetch job titles and manager status
      await fetchJobTitles(enhancedApplications);
      
      const initialNotes: Record<string, string> = {};
      enhancedApplications.forEach(app => {
        initialNotes[app.id] = app.admin_notes || '';
      });
      setNotes(initialNotes);

      const initialSelected: Record<string, boolean> = {};
      enhancedApplications.forEach(app => {
        if (app.status?.toLowerCase() === 'approved') {
          initialSelected[app.id] = true;
        }
      });
      setSelectedStaff(initialSelected);

      await fetchMobileNumbers(enhancedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Get fully approved applications - FIXED VERSION
  const getFullyApprovedApplications = () => {
    return applications.filter(app => 
      app.status?.toLowerCase() === 'approved'
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
    
    let cleaned = phone.replace(/\D/g, '');
    
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

  // Open recommendation modal
  const openRecommendationModal = (application: any, action: string) => {
    setSelectedApplication(application);
    setRecommendationAction(action);
    setShowRecommendationModal(true);
  };

  // Open comment modal
  const openCommentModal = (application: any) => {
    setSelectedApplication(application);
    setShowCommentModal(true);
  };

  // Handle recommendation submission
  const handleRecommendation = async (recommendationData: any) => {
    const { action, notes, adjustedAmount } = recommendationData;
    
    try {
      let updateData: any = {
        admin_notes: notes,
        last_updated: new Date().toISOString()
      };

      switch (action) {
        case 'bm-recommend-current':
          updateData.branch_manager_recommendation = 'recommend_current';
          updateData.branch_manager_notes = notes;
          updateData.branch_manager_approval = true;
          updateData.branch_manager_approval_date = new Date().toISOString();
          updateData.status = 'pending-regional-manager';
          break;
        
        case 'bm-recommend-adjusted':
          updateData.branch_manager_recommendation = 'recommend_adjusted';
          updateData.branch_manager_notes = notes;
          updateData.branch_manager_adjusted_amount = adjustedAmount;
          updateData.branch_manager_approval = true;
          updateData.branch_manager_approval_date = new Date().toISOString();
          updateData.status = 'pending-regional-manager';
          if (adjustedAmount) {
            updateData["Amount Requested"] = adjustedAmount;
          }
          break;
        
        case 'bm-recommend-reject':
          updateData.branch_manager_recommendation = 'recommend_reject';
          updateData.branch_manager_notes = notes;
          updateData.branch_manager_approval = false;
          updateData.status = 'rejected';
          break;
        
        case 'rm-recommend-current':
          updateData.regional_manager_recommendation = 'recommend_current';
          updateData.regional_manager_notes = notes;
          updateData.regional_manager_approval = true;
          updateData.regional_manager_approval_date = new Date().toISOString();
          updateData.status = 'pending-admin';
          break;
        
        case 'rm-recommend-adjusted':
          updateData.regional_manager_recommendation = 'recommend_adjusted';
          updateData.regional_manager_notes = notes;
          updateData.regional_manager_adjusted_amount = adjustedAmount;
          updateData.regional_manager_approval = true;
          updateData.regional_manager_approval_date = new Date().toISOString();
          updateData.status = 'pending-admin';
          if (adjustedAmount) {
            updateData["Amount Requested"] = adjustedAmount;
          }
          break;
        
        case 'rm-recommend-reject':
          updateData.regional_manager_recommendation = 'recommend_reject';
          updateData.regional_manager_notes = notes;
          updateData.regional_manager_approval = false;
          updateData.status = 'rejected';
          break;
        
        // Admin final approval actions
        case 'admin-approve-current':
          updateData.admin_approval = true;
          updateData.admin_approval_date = new Date().toISOString();
          updateData.admin_notes = notes;
          updateData.status = 'approved';
          updateData.approved_by = currentUser?.id;
          updateData.approved_by_email = currentUser?.email;
          break;
        
        case 'admin-approve-adjusted':
          updateData.admin_approval = true;
          updateData.admin_approval_date = new Date().toISOString();
          updateData.admin_notes = notes;
          updateData.admin_adjusted_amount = adjustedAmount;
          updateData.status = 'approved';
          updateData.approved_by = currentUser?.id;
          updateData.approved_by_email = currentUser?.email;
          if (adjustedAmount) {
            updateData["Amount Requested"] = adjustedAmount;
          }
          break;
        
        case 'admin-reject':
          updateData.admin_approval = false;
          updateData.admin_rejection_date = new Date().toISOString();
          updateData.admin_notes = notes;
          updateData.status = 'rejected';
          updateData.rejected_by = currentUser?.id;
          updateData.rejected_by_email = currentUser?.email;
          break;
      }

      const { error } = await supabase
        .from('salary_advance')
        .update(updateData)
        .eq('id', selectedApplication.id);

      if (error) throw error;

      // Update selected staff for approved applications
      if ((action.includes('recommend-current') || action.includes('recommend-adjusted') || action.includes('admin-approve')) && !action.includes('reject')) {
        setSelectedStaff(prev => ({
          ...prev,
          [selectedApplication.id]: true
        }));
      }

      if (action.includes('recommend-reject') || action.includes('admin-reject')) {
        setSelectedStaff(prev => {
          const newSelection = {...prev};
          delete newSelection[selectedApplication.id];
          return newSelection;
        });
      }

      toast.success('Action completed successfully!');
      fetchApplications();
    } catch (error) {
      console.error('Error submitting action:', error);
      toast.error('Failed to submit action');
    }
  };

  // Handle comment submission
  const handleComment = async (comment: string) => {
    try {
      const updateData = {
        regional_manager_comment: comment,
        regional_manager_comment_date: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      const { error } = await supabase
        .from('salary_advance')
        .update(updateData)
        .eq('id', selectedApplication.id);

      if (error) throw error;

      toast.success('Comment submitted successfully!');
      fetchApplications();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment');
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
        created_by_email: user.email,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('salary_advance_payment_flows')
        .insert([requestData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

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

      const { data, error } = await supabase
        .from('salary_advance_payment_flows')
        .update(updateData)
        .eq('id', payment.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error approving payment request:', error);
        toast.error('Failed to approve payment request');
        fetchPaymentRequests();
        return;
      }

      try {
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  };

  // Bulk payment with proper maker-checker flow and selection clearing
  const handleBulkPayment = async () => {
    const selectedApps = getFullyApprovedApplications().filter(app => selectedStaff[app.id]);
    
    if (selectedApps.length === 0) {
      toast.error('No staff members selected for payment');
      return;
    }

    if (!justification.trim()) {
      toast.error('Please provide justification for the payment request');
      return;
    }

    const advancesData = selectedApps.map(app => ({
      employee_number: app["Employee Number"],
      full_name: app["Full Name"],
      mobile_number: employeeMobileNumbers[app["Employee Number"]],
      amount_requested: Number(app["Amount Requested"]),
      branch_manager_approval: app.branch_manager_approval,
      regional_manager_approval: app.regional_manager_approval,
      isBranchManager: isBranchManagerMap[app["Employee Number"]] || false
    }));

    if (userRole === 'maker') {
      try {
        await createPaymentRequest(advancesData, justification);
        toast.success('Payment request submitted for approval!');
        
        setSelectedStaff({});
        setJustification('');
        setShowBulkPaymentModal(false);
        fetchPaymentRequests();
      } catch (error) {
        console.error('Error creating payment request:', error);
        toast.error('Failed to submit payment request');
      }
    } 
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
        
        setSelectedStaff({});
        setJustification('');
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

  // FIXED: Get approval status
  const getApprovalStatus = (app: any) => {
    if (app.status?.toLowerCase() === 'rejected') {
      return 'Rejected';
    }
    if (app.status?.toLowerCase() === 'paid') {
      return 'Paid';
    }

    // Check if fully approved by admin - FIXED
    if (app.status?.toLowerCase() === 'approved') {
      return 'Fully Approved';
    }

    // Check for pending admin status
    if (app.status === 'pending-admin') {
      return 'Pending Admin Approval';
    }

    // Check for recommendation statuses
    if (app.branch_manager_recommendation) {
      switch (app.branch_manager_recommendation) {
        case 'recommend_current':
          return 'BM: Recommend Current';
        case 'recommend_adjusted':
          return 'BM: Recommend Adjusted';
        case 'recommend_reject':
          return 'BM: Recommend Reject';
      }
    }
    
    if (app.regional_manager_recommendation) {
      switch (app.regional_manager_recommendation) {
        case 'recommend_current':
          return 'RM: Recommend Current';
        case 'recommend_adjusted':
          return 'RM: Recommend Adjusted';
        case 'recommend_reject':
          return 'RM: Recommend Reject';
      }
    }

    // New status logic based on employee type and approvals
    const isEmployeeBranchManager = isBranchManagerMap[app["Employee Number"]] || false;

    // If branch manager has approved regular employee
    if (app.branch_manager_approval && !isEmployeeBranchManager) {
      return 'Pending Regional Manager';
    }

    // If regional manager has approved branch manager
    if (app.regional_manager_approval && isEmployeeBranchManager) {
      return 'Pending Admin Approval';
    }

    // No approvals yet - show who can approve
    if (isEmployeeBranchManager) {
      return 'Pending Regional Manager';
    } else {
      return 'Pending Branch Manager';
    }
  };

  const getApprovalBadgeColor = (status: string) => {
    switch (status) {
      case 'Fully Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending Admin Approval':
        return 'bg-purple-100 text-purple-800';
      case 'Pending Regional Manager':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending Branch Manager':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Paid':
        return 'bg-blue-100 text-blue-800';
      case 'BM: Recommend Current':
        return 'bg-green-100 text-green-800';
      case 'BM: Recommend Adjusted':
        return 'bg-blue-100 text-blue-800';
      case 'BM: Recommend Reject':
        return 'bg-red-100 text-red-800';
      case 'RM: Recommend Current':
        return 'bg-green-100 text-green-800';
      case 'RM: Recommend Adjusted':
        return 'bg-blue-100 text-blue-800';
      case 'RM: Recommend Reject':
        return 'bg-red-100 text-red-800';
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

  // Pending payment requests count
  const pendingCount = paymentRequests.filter(p => p.status === 'pending').length;

  // Handle Branch change
  const handleRegionChange = (Branch: string) => {
    setSelectedRegion(Branch);
    setSelectedTown('');
    setCurrentPage(1);
  };

  // Handle town change
  const handleTownChange = (town: string) => {
    setSelectedTown(town);
    setCurrentPage(1);
  };

  // Role-based permissions
  const isAdmin = userRole === 'credit_analyst_officer';
  const isBranchManager = userRole === 'branch_manager';
  const isRegionalManager = userRole === 'regional_manager';
  const isChecker = userRole === 'checker';
  const isMaker = userRole === 'maker';

  // FIXED: Check if regional manager can approve this application
  const canRegionalManagerApprove = (app: any) => {
    if (!isRegionalManager && !isAdmin) return false;
    
    // Regional managers can only approve branch managers, but admins can approve anyone
    const isEmployeeBranchManager = isBranchManagerMap[app["Employee Number"]] || false;
    const canApproveThisUser = isAdmin || isEmployeeBranchManager;
    
    // Cannot approve themselves
    const isSelfApproval = checkIfSelfApproval(app);
    
    // Must not have regional manager approval yet
    const hasRegionalApproval = app.regional_manager_approval;
    
    return canApproveThisUser && !isSelfApproval && !hasRegionalApproval;
  };

  // Check if branch manager can approve this application
  const canBranchManagerApprove = (app: any) => {
    if (!isBranchManager) return false;
    
    // Branch managers cannot approve themselves
    const isSelfApproval = checkIfSelfApproval(app);
    
    // Branch managers can only approve regular employees (not other branch managers)
    const isEmployeeBranchManager = isBranchManagerMap[app["Employee Number"]] || false;
    
    // Must not have branch manager approval yet
    const hasBranchApproval = app.branch_manager_approval;
    
    return !isSelfApproval && !isEmployeeBranchManager && !hasBranchApproval;
  };

  // Check if regional manager can comment on regular employees
  const canRegionalManagerComment = (app: any) => {
    if (!isRegionalManager) return false;
    
    // Regional managers can comment on regular employees that are pending branch manager approval
    const isEmployeeBranchManager = isBranchManagerMap[app["Employee Number"]] || false;
    const hasBranchApproval = app.branch_manager_approval;
    
    return !isEmployeeBranchManager && !hasBranchApproval;
  };

  // FIXED: Check if admin can approve this application
  const canAdminApprove = (app: any) => {
    if (!isAdmin) return false;
    
    // Admin can approve any application that has reached "pending-admin" status
    return app.status === 'pending-admin';
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-lg font-medium text-gray-900">Salary Advance Requests</h2>
        
        <div className="flex items-center gap-3">
          {/* Branch and Town Filter */}
          <RegionTownFilter
            selectedRegion={selectedRegion}
            selectedTown={selectedTown}
            onRegionChange={handleRegionChange}
            onTownChange={handleTownChange}
            regions={regions}
            townsByRegion={townsByRegion}
          />

          {/* Enhanced User Role Display */}
          <UserRoleDisplay 
            userRole={userRole} 
            userEmail={userEmail}
            actualRole={actualUserRole}
          />

          {/* Approval Queue Button for Checkers */}
          {(isChecker || isAdmin) && pendingCount > 0 && (
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
              {isMaker ? 'Create Payment Request' : 'Process Payments'} ({getSelectedStaffCount()})
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

      {/* Role-based Information Panel */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-blue-800">
          <Key className="w-4 h-4" />
          <span>
            <strong>Role:</strong> {userRole.replace(/_/g, ' ').toUpperCase()} | 
            <strong> Actual Role:</strong> {actualUserRole} |
            <strong> Email:</strong> {userEmail}
          </span>
        </div>
      </div>

      {/* Filter Display */}
      {(selectedRegion || selectedTown) && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-gray-600">Active filters:</span>
          {selectedRegion && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              Branch: {selectedRegion}
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
      {showApprovalQueue && (isChecker || isAdmin) && (
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
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-xs font-medium text-gray-900">{app["Full Name"]}</div>
                          <div className="text-xs text-gray-500">{app["Employee Number"]}</div>
                        </div>
                        <ManagerBadge 
                          isBranchManager={isBranchManagerMap[app["Employee Number"]] || false}
                          isRegionalManager={false}
                        />
                      </div>
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
                          <span>BM: {app.branch_manager_approval ? '✓' : (app.branch_manager_recommendation ? 'Recommended' : 'Pending')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <ShieldCheck className="h-3 w-3" />
                          <span>RM: {app.regional_manager_approval ? '✓' : (app.regional_manager_recommendation ? 'Recommended' : 'Pending')}</span>
                        </div>
                        {app.regional_manager_comment && (
                          <div className="flex items-center gap-2 text-xs text-blue-600">
                            <MessageCircle className="h-3 w-3" />
                            <span>RM Comment: {app.regional_manager_comment}</span>
                          </div>
                        )}
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
                        {canBranchManagerApprove(app) && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => openRecommendationModal(app, 'bm-recommend-current')}
                              className="text-green-600 hover:text-green-900 text-xs border border-green-200 px-2 py-1 rounded bg-green-50 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Recommend Current
                            </button>
                            <button
                              onClick={() => openRecommendationModal(app, 'bm-recommend-adjusted')}
                              className="text-blue-600 hover:text-blue-900 text-xs border border-blue-200 px-2 py-1 rounded bg-blue-50 flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              Recommend Adjusted
                            </button>
                            <button
                              onClick={() => openRecommendationModal(app, 'bm-recommend-reject')}
                              className="text-red-600 hover:text-red-900 text-xs border border-red-200 px-2 py-1 rounded bg-red-50 flex items-center gap-1"
                            >
                              <XCircleIcon className="w-3 h-3" />
                              Recommend Reject
                            </button>
                          </div>
                        )}

                        {/* Regional Manager Actions */}
                        {canRegionalManagerApprove(app) && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => openRecommendationModal(app, 'rm-recommend-current')}
                              className="text-green-600 hover:text-green-900 text-xs border border-green-200 px-2 py-1 rounded bg-green-50 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Recommend Current
                            </button>
                            <button
                              onClick={() => openRecommendationModal(app, 'rm-recommend-adjusted')}
                              className="text-blue-600 hover:text-blue-900 text-xs border border-blue-200 px-2 py-1 rounded bg-blue-50 flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              Recommend Adjusted
                            </button>
                            <button
                              onClick={() => openRecommendationModal(app, 'rm-recommend-reject')}
                              className="text-red-600 hover:text-red-900 text-xs border border-red-200 px-2 py-1 rounded bg-red-50 flex items-center gap-1"
                            >
                              <XCircleIcon className="w-3 h-3" />
                              Recommend Reject
                            </button>
                          </div>
                        )}

                        {/* Regional Manager Comment Action */}
                        {canRegionalManagerComment(app) && (
                          <button
                            onClick={() => openCommentModal(app)}
                            className="text-blue-600 hover:text-blue-900 text-xs border border-blue-200 px-2 py-1 rounded bg-blue-50 flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Add Comment
                          </button>
                        )}

                        {/* Admin Final Approval Action */}
                        {canAdminApprove(app) && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => openRecommendationModal(app, 'admin-approve-current')}
                              className="text-green-600 hover:text-green-900 text-xs border border-green-200 px-2 py-1 rounded bg-green-50 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve Current
                            </button>
                            <button
                              onClick={() => openRecommendationModal(app, 'admin-approve-adjusted')}
                              className="text-blue-600 hover:text-blue-900 text-xs border border-blue-200 px-2 py-1 rounded bg-blue-50 flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              Approve Adjusted
                            </button>
                            <button
                              onClick={() => openRecommendationModal(app, 'admin-reject')}
                              className="text-red-600 hover:text-red-900 text-xs border border-red-200 px-2 py-1 rounded bg-red-50 flex items-center gap-1"
                            >
                              <XCircleIcon className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        )}

                        {/* Self-approval warning */}
                        {checkIfSelfApproval(app) && (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                            Cannot approve own request
                          </span>
                        )}

                        {/* No actions available message */}
                        {!canBranchManagerApprove(app) && !canRegionalManagerApprove(app) && !canRegionalManagerComment(app) && !canAdminApprove(app) && !checkIfSelfApproval(app) && (
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            Awaiting approval
                          </span>
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
              {isMaker ? 'Create Payment Request' : 'Process M-Pesa Bulk Payment'}
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                {isMaker 
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
                {isMaker ? 'Justification for Payment Request' : 'Payment Notes'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={
                  isMaker 
                    ? "Please provide justification for this payment request..."
                    : "Please provide notes for this payment processing..."
                }
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {isMaker 
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
                      <div className="flex items-center gap-2">
                        <div>
                          <div className={selectedStaff[app.id] ? "font-medium" : "text-gray-500"}>
                            {app["Full Name"]}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employeeMobileNumbers[app["Employee Number"]] || 'No mobile number'}
                          </div>
                        </div>
                        <ManagerBadge 
                          isBranchManager={isBranchManagerMap[app["Employee Number"]] || false}
                          isRegionalManager={false}
                        />
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
                onClick={() => {
                  setShowBulkPaymentModal(false);
                  setJustification('');
                }}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={isProcessingBulkPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPayment}
                className="px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2"
                disabled={isProcessingBulkPayment || getSelectedStaffCount() === 0 || !justification.trim()}
              >
                {isProcessingBulkPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {isMaker 
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

      {/* Recommendation Modal */}
      <RecommendationModal
        isOpen={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
        onConfirm={handleRecommendation}
        application={selectedApplication}
        actionType={recommendationAction}
        currentAmount={selectedApplication?.["Amount Requested"]}
      />

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        onConfirm={handleComment}
        application={selectedApplication}
      />
    </div>
  );
};

export default SalaryAdvanceAdmin;