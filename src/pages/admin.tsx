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
  Shield
} from 'lucide-react';

export default function StaffSignupRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_signup_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRequests(data || []);
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
          branch
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
      await sendWelcomeEmail(email, tempPassword, branch);

      toast.success(`Account approved! Welcome email sent to ${email}`);
      fetchRequests();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(`Failed to approve request: ${error.message}`);
    } finally {
      setProcessingId(null);
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
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
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

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-8 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{requests.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-500 max-w-md mx-auto">All staff signup requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div 
                key={request.id} 
                className="bg-white rounded-xl shadow-xs border border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    {/* Request Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm mt-1">
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
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mt-2">
                            <div className="flex items-center space-x-1.5">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span>{request.branch}</span>
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
                        disabled={processingId === request.id}
                        className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
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
                        disabled={processingId === request.id}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm"
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
      </div>
    </div>
  );
}