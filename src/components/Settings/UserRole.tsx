import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Search, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  MoreVertical
} from 'lucide-react';
import { supabaseAdmin } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Role definitions
const ROLES = {
  ADMIN: {
    label: 'Admin',
    description: 'Full access to all features and settings across all locations',
    icon: <Shield className="w-4 h-4 text-purple-500" />,
    requiresLocation: false
  },
  MANAGER: {
    label: 'Manager',
    description: 'Can manage users and content for specific locations',
    icon: <Settings className="w-4 h-4 text-blue-500" />,
    requiresLocation: true
  },
  STAFF: {
    label: 'Staff',
    description: 'Standard access with limited permissions for specific locations',
    icon: <User className="w-4 h-4 text-green-500" />,
    requiresLocation: true
  },
  VIEWER: {
    label: 'Viewer',
    description: 'Read-only access to location-specific features',
    icon: <Eye className="w-4 h-4 text-gray-500" />,
    requiresLocation: true
  }
};
const StatusBadge = ({ active }: { active: boolean }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

const RoleBadge = ({ role }: { role: keyof typeof ROLES }) => {
  const roleInfo = ROLES[role] || ROLES.STAFF;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
      role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
      role === 'STAFF' ? 'bg-green-100 text-green-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {roleInfo.icon}
      {roleInfo.label}
    </span>
  );
};

const UserCard = ({ 
  user, 
  onEdit, 
  onDelete 
}: { 
  user: any; 
  onEdit: (user: any) => void; 
  onDelete: (user: any) => void 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 min-w-0"> {/* Added min-w-0 to help with truncation */}
          <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div className="min-w-0"> {/* Added min-w-0 to help with truncation */}
            <h3 className="font-medium text-gray-900 text-xs truncate"> {/* Added truncate class */}
              {user.email}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {user.last_sign_in_at ? `Last active: ${new Date(user.last_sign_in_at).toLocaleDateString()}` : 'Never active'}
            </p>
          </div>
        </div>
        
        <div className="relative flex-shrink-0"> {/* Added flex-shrink-0 */}
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-gray-400 hover:text-gray-500 p-1"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit(user);
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit className="w-4 h-4" />
                  Edit User
                </button>
                <button
                  onClick={() => {
                    onDelete(user);
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <StatusBadge active={user.active} />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Role</p>
          <RoleBadge role={user.role || 'STAFF'} />
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1">Created</p>
        <p className="text-xs text-gray-700">
          {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void 
}) => {
  const maxVisiblePages = 5;
  
  const getPageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    const end = Math.min(start + maxVisiblePages - 1, totalPages);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  const pages = getPageNumbers();
  
  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-3 py-1.5 text-xs font-semibold ${
                  currentPage === page
                    ? 'bg-green-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const RoleToggle = ({ 
  role, 
  active, 
  onChange 
}: { 
  role: keyof typeof ROLES; 
  active: boolean; 
  onChange: (role: keyof typeof ROLES, active: boolean) => void 
}) => {
  const roleInfo = ROLES[role];
  
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
          role === 'MANAGER' ? 'bg-blue-100 text-blue-600' :
          role === 'STAFF' ? 'bg-green-100 text-green-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {roleInfo.icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{roleInfo.label}</h4>
          <p className="text-xs text-gray-500">{roleInfo.description}</p>
        </div>
      </div>
      
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={active}
          onChange={() => onChange(role, !active)}
          className="sr-only peer" 
        />
        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
      </label>
    </div>
  );
};

const UserEditModal = ({ 
  user, 
  onClose, 
  onSave 
}: { 
  user: any | null; 
  onClose: () => void; 
  onSave: (user: any) => void 
}) => {
  const [editedUser, setEditedUser] = useState<any>(user || {
    email: '',
    role: 'STAFF',
    active: true
  });
  
  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
    }
  }, [user]);
  
  const handleRoleChange = (role: keyof typeof ROLES) => {
    setEditedUser({ ...editedUser, role });
  };
  
  const handleStatusChange = (active: boolean) => {
    setEditedUser({ ...editedUser, active });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {user ? 'Edit User' : 'Add New User'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editedUser.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs"
              placeholder="user@example.com"
              disabled={!!user}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ROLES) as Array<keyof typeof ROLES>).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`p-2 border rounded-lg text-xs font-medium ${
                    editedUser.role === role ? 
                    (role === 'ADMIN' ? 'border-purple-500 bg-purple-50 text-purple-700' :
                     role === 'MANAGER' ? 'border-blue-500 bg-blue-50 text-blue-700' :
                     role === 'STAFF' ? 'border-green-500 bg-green-50 text-green-700' :
                     'border-gray-500 bg-gray-50 text-gray-700') :
                    'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {ROLES[role].label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-gray-900">Account Status</p>
              <p className="text-xs text-gray-500">
                {editedUser.active ? 'User can sign in' : 'User cannot sign in'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={editedUser.active}
                onChange={(e) => handleStatusChange(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedUser)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserRolesSettings() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(12);
  const navigate = useNavigate();

  // Early return if no admin client
  if (!supabaseAdmin) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <Shield className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-4 text-sm">
            This feature requires admin privileges. Please check your environment configuration.
          </p>
          <p className="text-xs text-gray-500">
            Ensure VITE_SUPABASE_SERVICE_ROLE_KEY is properly set.
          </p>
        </div>
      </div>
    );
  }

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
        
        if (error) throw error;
        
        const formattedUsers = users.map((user: any) => ({
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'STAFF',
          active: !user.banned_at,
          last_sign_in_at: user.last_sign_in_at,
          created_at: user.created_at,
          location: user.user_metadata?.location || null
        }));
        
        setUsers(formattedUsers);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || 
                        (selectedStatus === 'ACTIVE' && user.active) || 
                        (selectedStatus === 'INACTIVE' && !user.active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  // Add this inside the UserRolesSettings component, before the return statement

const handleDeleteUser = async (user: any) => {
  if (!window.confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
    return;
  }

  try {
    setLoading(true);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (error) throw error;
    
    setUsers(users.filter(u => u.id !== user.id));
  } catch (err: any) {
    console.error('Error deleting user:', err);
    setError(err.message || 'Failed to delete user');
  } finally {
    setLoading(false);
  }
};

// Also update the handleSaveUser function to handle location data properly
const handleSaveUser = async (userData: any) => {
  try {
    if (editingUser) {
      // Update existing user
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        editingUser.id,
        {
          email: userData.email,
          user_metadata: { 
            ...editingUser.user_metadata, // preserve existing metadata
            role: userData.role,
            ...(ROLES[userData.role as keyof typeof ROLES]?.requiresLocation ? { 
              location: userData.location || null 
            } : { location: null }) // clear location if role doesn't require it
          },
          ban_duration: userData.active ? 'none' : 'permanent'
        }
      );
      
      if (error) throw error;
      
      setUsers(users.map(u => u.id === editingUser.id ? {
        ...u,
        email: userData.email,
        role: userData.role,
        active: userData.active,
        location: userData.location || null
      } : u));
      setEditingUser(null);
    } else {
      // Create new user (invite)
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        userData.email,
        {
          user_metadata: { 
            role: userData.role,
            ...(ROLES[userData.role as keyof typeof ROLES]?.requiresLocation ? { 
              location: userData.location || null 
            } : {})
          }
        }
      );
      
      if (error) throw error;
      
      setUsers([...users, {
        id: data.user.id,
        email: userData.email,
        role: userData.role,
        active: true,
        last_sign_in_at: null,
        created_at: new Date().toISOString(),
        location: userData.location || null
      }]);
      setShowAddUserModal(false);
    }
  } catch (err: any) {
    console.error('Error saving user:', err);
    setError(err.message || `Failed to ${editingUser ? 'update' : 'create'} user`);
  }
};
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus]);
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Roles & Permissions</h1>
            <p className="text-gray-600 text-sm">Manage user access and permissions across your organization</p>
          </div>
          
          <button
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Search Users</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-100 focus:border-green-500 text-xs"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Filter by Role</label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-100 focus:border-green-500 text-xs appearance-none"
                >
                  <option value="ALL">All Roles</option>
                  {(Object.keys(ROLES) as Array<keyof typeof ROLES>).map((role) => (
                    <option key={role} value={role}>{ROLES[role].label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Filter by Status</label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-100 focus:border-green-500 text-xs appearance-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Users</p>
                <p className="text-xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Users</p>
                <p className="text-xl font-bold text-gray-900">{users.filter(u => u.active).length}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Eye className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admins</p>
                <p className="text-xl font-bold text-gray-900">{users.filter(u => u.role === 'ADMIN').length}</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Inactive Users</p>
                <p className="text-xl font-bold text-gray-900">{users.filter(u => !u.active).length}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                <EyeOff className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Users Grid */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentUsers.length > 0 ? (
                currentUsers.map(user => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    onEdit={setEditingUser}
                    onDelete={handleDeleteUser}
                  />
                ))
              ) : (
                <div className="col-span-full bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 text-sm">No users found matching your criteria</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              </div>
            )}
          </>
        )}
        
        {/* Role Permissions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(ROLES) as Array<keyof typeof ROLES>).map((role) => (
              <RoleToggle 
                key={role}
                role={role}
                active={true} // This would come from your permissions config
                onChange={(r, a) => console.log(`Role ${r} active: ${a}`)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showAddUserModal && (
        <UserEditModal 
          user={null} 
          onClose={() => setShowAddUserModal(false)} 
          onSave={handleSaveUser}
        />
      )}
      
      {editingUser && (
        <UserEditModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}