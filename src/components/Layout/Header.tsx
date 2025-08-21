import React, { useEffect, useState } from 'react';
import { Bell, Search, User, LogOut, X, Trash2, CheckCircle, UserPlus, Calendar, Image, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface HeaderProps {
  user?: { email: string; role: string };
  onLogout?: () => void;
}

interface NotificationItem {
  id: string;
  type: 'staff' | 'leave';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface NotificationState {
  staff: number;
  leave: number;
  lastUpdated: Date | null;
  items: NotificationItem[];
}

interface CompanyProfile {
  id: number;
  image_url: string | null;
  company_name: string | null;
  company_tagline: string | null;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [notifications, setNotifications] = useState<NotificationState>({
    staff: 0,
    leave: 0,
    lastUpdated: null,
    items: []
  });
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newProfile, setNewProfile] = useState({
    company_name: '',
    company_tagline: ''
  });
  const navigate = useNavigate();

  // Create notification item helper
  const createNotificationItem = (type: 'staff' | 'leave', data: any): NotificationItem => {
    const timestamp = new Date(data.created_at || data.time_added || new Date());
    
    if (type === 'staff') {
      return {
        id: `staff-${data.id || Date.now()}`,
        type: 'staff',
        title: 'New Staff Signup Request',
        message: `A new staff member has requested to join. Email: ${data.email || 'Unknown'}`,
        timestamp,
        isRead: false
      };
    } else {
      return {
        id: `leave-${data.id || Date.now()}`,
        type: 'leave',
        title: 'New Leave Application',
        message: `Leave application submitted by ${data["First Name"]&&data["Last Name"]|| 'Employee'}`,
        timestamp,
        isRead: false
      };
    }
  };

  // Fetch notification counts
  const fetchNotificationCounts = async () => {
    try {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      
      // Fetch staff requests
      const { data: staffData, count: staffCount } = await supabase
        .from('staff_signup_requests')
        .select('*', { count: 'exact' })
        .gt('created_at', yesterday)
        .order('created_at', { ascending: false });

      // Fetch leave applications
      const { data: leaveData, count: leaveCount } = await supabase
        .from('leave_application')
        .select('*', { count: 'exact' })
        .gt('time_added', yesterday)
        .order('time_added', { ascending: false });

      // Create notification items
      const staffItems = (staffData || []).map(item => createNotificationItem('staff', item));
      const leaveItems = (leaveData || []).map(item => createNotificationItem('leave', item));
      
      const allItems = [...staffItems, ...leaveItems].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(prev => {
        const newCounts = {
          staff: staffCount || 0,
          leave: leaveCount || 0,
          lastUpdated: new Date(),
          items: allItems
        };

        if ((staffCount || 0) > prev.staff || (leaveCount || 0) > prev.leave) {
          setShowNotificationDot(true);
        }

        return newCounts;
      });
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  // Fetch company profile
  const fetchCompanyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('company_logo')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
        throw error;
      }

      if (data) {
        setCompanyProfile(data);
        setNewProfile({
          company_name: data.company_name || '',
          company_tagline: data.company_tagline || ''
        });
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
      toast.error('Failed to load company profile');
    }
  };

  // Handle file selection for preview
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setSelectedFile(file);
  };

  // Upload logo to storage
  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('company-logo')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('company-logo')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Update company profile
  const updateCompanyProfile = async (updates: Partial<CompanyProfile>) => {
    try {
      let updatedProfile;
      let imageUrl = companyProfile?.image_url || null;

      // Upload new logo if selected
      if (selectedFile) {
        imageUrl = await uploadLogo(selectedFile);
      }

      if (companyProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('company_logo')
          .update({ 
            ...updates,
            image_url: imageUrl || companyProfile.image_url,
            created_at: new Date().toISOString() 
          })
          .eq('id', companyProfile.id)
          .select()
          .single();

        if (error) throw error;
        updatedProfile = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('company_logo')
          .insert([{
            ...updates,
            image_url: imageUrl,
            company_name: newProfile.company_name,
            company_tagline: newProfile.company_tagline
          }])
          .select()
          .single();

        if (error) throw error;
        updatedProfile = data;
      }

      setCompanyProfile(updatedProfile);
      toast.success('Profile updated successfully!');
      return updatedProfile;
    } catch (error) {
      console.error('Error updating company profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setUploading(true);
      await updateCompanyProfile({
        company_name: newProfile.company_name,
        company_tagline: newProfile.company_tagline
      });
      // Clear preview state after successful save
      setLogoPreview(null);
      setSelectedFile(null);
      setProfileModalOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setUploading(false);
    }
  };

  // Cancel profile editing
  const handleCancelProfile = () => {
    setLogoPreview(null);
    setSelectedFile(null);
    setProfileModalOpen(false);
    // Reset form to current company profile
    if (companyProfile) {
      setNewProfile({
        company_name: companyProfile.company_name || '',
        company_tagline: companyProfile.company_tagline || ''
      });
    }
  };

  // Setup real-time subscriptions for notifications
  useEffect(() => {
    const handleStaffUpdate = (payload: any) => {
      const newItem = createNotificationItem('staff', payload.new);
      setNotifications(prev => ({
        ...prev,
        staff: prev.staff + 1,
        lastUpdated: new Date(),
        items: [newItem, ...prev.items]
      }));
      setShowNotificationDot(true);
      toast.success('New staff signup request received');
    };

    const handleLeaveUpdate = (payload: any) => {
      const newItem = createNotificationItem('leave', payload.new);
      setNotifications(prev => ({
        ...prev,
        leave: prev.leave + 1,
        lastUpdated: new Date(),
        items: [newItem, ...prev.items]
      }));
      setShowNotificationDot(true);
      toast.success('New leave application received');
    };

    const staffChannel = supabase
      .channel('staff_signup_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'staff_signup_requests'
        },
        handleStaffUpdate
      )
      .subscribe();

    const leaveChannel = supabase
      .channel('leave_application_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leave_application'
        },
        handleLeaveUpdate
      )
      .subscribe();

    // Initial fetches
    fetchCompanyProfile();
    fetchNotificationCounts();

    // Setup polling as fallback (every 5 minutes)
    const interval = setInterval(fetchNotificationCounts, 300000);

    return () => {
      supabase.removeChannel(staffChannel);
      supabase.removeChannel(leaveChannel);
      clearInterval(interval);
      // Clean up preview URLs
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, []);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleBellClick = () => {
    setShowNotificationDot(false);
    setSidebarOpen(true);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read
    setNotifications(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === notification.id ? { ...item, isRead: true } : item
      )
    }));

    // Navigate based on type
    if (notification.type === 'staff') {
      navigate('/adminconfirm');
      setNotifications(prev => ({ ...prev, staff: Math.max(0, prev.staff - 1) }));
    } else if (notification.type === 'leave') {
      navigate('/leaves');
      setNotifications(prev => ({ ...prev, leave: Math.max(0, prev.leave - 1) }));
    }

    setSidebarOpen(false);
  };

  const handleClearAll = () => {
    setNotifications(prev => ({
      ...prev,
      staff: 0,
      leave: 0,
      items: []
    }));
    toast.success('All notifications cleared');
  };

  const handleRemoveNotification = (notificationId: string) => {
    setNotifications(prev => {
      const itemToRemove = prev.items.find(item => item.id === notificationId);
      const newItems = prev.items.filter(item => item.id !== notificationId);
      
      const newState = {
        ...prev,
        items: newItems,
        staff: itemToRemove?.type === 'staff' ? Math.max(0, prev.staff - 1) : prev.staff,
        leave: itemToRemove?.type === 'leave' ? Math.max(0, prev.leave - 1) : prev.leave
      };
      
      return newState;
    });
  };

  const totalNotifications = notifications.staff + notifications.leave;
  const unreadItems = notifications.items.filter(item => !item.isRead);

  return (
    <>
      <header className="bg-white/95 z-10 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm relative z-40">
        <div className="flex items-center justify-between">
          {/* Company Logo and Name - Clickable to edit */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
            onClick={() => setProfileModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {companyProfile?.image_url ? (
              <img 
                src={companyProfile.image_url} 
                alt="Company Logo" 
                className="w-10 h-10 rounded-lg object-cover shadow-md"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">
                  {companyProfile?.company_name?.[0] || 'C'}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {companyProfile?.company_name || 'Company Name'}
              </h1>
              <p className="text-xs text-gray-500 line-clamp-1">
                {companyProfile?.company_tagline || 'HR Management System'}
              </p>
            </div>
          </motion.div>
          
          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search bar */}
            {/* <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees, records..."
                className="bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200 w-60"
              />
            </div> */}

            {/* Notification bell */}
            <motion.button
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBellClick}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {showNotificationDot && totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              )}
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {totalNotifications}
                </span>
              )}
            </motion.button>
            
            {/* User profile */}
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm hidden sm:block">
                <p className="text-gray-900 font-medium line-clamp-1">{user?.email || 'Admin User'}</p>
                <p className="text-green-800 capitalize">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            
            {/* Logout button */}
            {onLogout && (
              <motion.button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Company Profile Modal */}
      <AnimatePresence>
        {profileModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelProfile}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div 
                className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {companyProfile ? 'Edit Company Profile' : 'Create Company Profile'}
                    </h2>
                    <button
                      onClick={handleCancelProfile}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Logo Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {logoPreview ? (
                          <>
                            <img 
                              src={logoPreview} 
                              alt="Logo Preview" 
                              className="w-16 h-16 rounded-lg object-cover shadow"
                            />
                            <button
                              onClick={() => {
                                setLogoPreview(null);
                                setSelectedFile(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              title="Remove logo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : companyProfile?.image_url ? (
                          <img 
                            src={companyProfile.image_url} 
                            alt="Current Logo" 
                            className="w-16 h-16 rounded-lg object-cover shadow"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer">
                          <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-2 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span>{logoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileSelect}
                              disabled={uploading}
                            />
                          </div>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended size: 256x256px
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="mb-4">
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      value={newProfile.company_name}
                      onChange={(e) => setNewProfile({...newProfile, company_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter company name"
                    />
                  </div>

                  {/* Company Tagline */}
                  <div className="mb-6">
                    <label htmlFor="company_tagline" className="block text-sm font-medium text-gray-700 mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      id="company_tagline"
                      value={newProfile.company_tagline}
                      onChange={(e) => setNewProfile({...newProfile, company_tagline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter company tagline"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCancelProfile}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-1"
                      disabled={uploading || (!newProfile.company_name && !newProfile.company_tagline && !selectedFile)}
                    >
                      {uploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {companyProfile ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>{companyProfile ? 'Update Profile' : 'Create Profile'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    {totalNotifications > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {totalNotifications}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {notifications.items.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                        title="Clear all notifications"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Bell className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.items.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                          !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNotification(notification.id);
                          }}
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notification.type === 'staff' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {notification.type === 'staff' ? (
                              <UserPlus className="w-4 h-4" />
                            ) : (
                              <Calendar className="w-4 h-4" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.items.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    {unreadItems.length} unread of {notifications.items.length} total
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}