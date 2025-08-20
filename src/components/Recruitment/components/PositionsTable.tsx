import { useState, useEffect } from 'react';
import { Download, Edit, Users, Save, X, Plus, Trash2, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { GlowButton } from './GlowButton';
import { StatusBadge } from './StatusBadge';
import { branches } from './constants/branches';
import { supabase } from '../../../lib/supabase'; // Your Supabase client

// Toast component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'warning' | 'info'; onClose: () => void }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };
  
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  const Icon = icons[type];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg flex items-center gap-3 max-w-md ${colors[type]}`}>
      <Icon size={20} />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-2">
        <X size={16} />
      </button>
    </div>
  );
};

interface Position {
  id: string | number; // Handle both UUID strings and legacy integer IDs
  title: string;
  department: string;
  type: string;
  branch: string;
  status: 'open' | 'closed' | 'pending';
  applications?: string;
  created_at: string;
  updated_at?: string;
}

interface PositionsTableProps {
  positions: Position[];
  onUpdate: () => void; // Callback to refresh data after updates
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const PositionsTable = ({ positions, onUpdate }: PositionsTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPosition, setEditedPosition] = useState<Partial<Position> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPosition, setNewPosition] = useState<Partial<Position>>({
    title: '',
    department: '',
    type: '',
    branch: '',
    status: 'open'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast helper functions
  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Helper function to check if an ID is a valid UUID
  const isValidUUID = (id: string | number): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return typeof id === 'string' && uuidRegex.test(id);
  };

  const handleEdit = (position: Position) => {
    setEditingId(String(position.id));
    setEditedPosition({ ...position });
  };

  const handleSave = async () => {
    if (!editingId || !editedPosition) return;
    
    setIsLoading(true);
    try {
      // If the ID is not a valid UUID (i.e., it's a legacy integer ID), 
      // always create a new record instead of trying to update
      const isLegacyId = !isValidUUID(editingId);
      
      const positionData = {
        title: editedPosition.title,
        department: editedPosition.department,
        type: editedPosition.type,
        branch: editedPosition.branch,
        status: editedPosition.status,
        applications: editedPosition.applications
      };

      if (isLegacyId) {
        // For legacy integer IDs, always create new record
        console.log('Legacy ID detected, creating new record instead of updating');
        addToast('Creating new record from legacy data...', 'info');
        
        const { error } = await supabase
          .from('positions')
          .insert([positionData]);

        if (error) throw error;
        
        addToast('New record created successfully!', 'success');
        
      } else {
        // For valid UUIDs, try to update first
        const updateData = {
          ...positionData,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('positions')
          .update(updateData)
          .eq('id', editingId);

        if (error) {
          // If update fails, create new record
          console.log('Update failed, creating new record:', error);
          addToast('Record not found, creating new record...', 'warning');
          
          const { error: insertError } = await supabase
            .from('positions')
            .insert([positionData]);

          if (insertError) throw insertError;
          
          addToast('New record created successfully!', 'success');
        } else {
          addToast('Record updated successfully!', 'success');
        }
      }

      setEditingId(null);
      setEditedPosition(null);
      onUpdate(); // Refresh data
    } catch (error) {
      console.error('Error saving position:', error);
      addToast('Failed to save position. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedPosition(null);
  };

  const handleDelete = async (id: string | number) => {
    // Only allow deletion of records with valid UUIDs
    if (!isValidUUID(String(id))) {
      alert('Cannot delete legacy records. Please create a new record instead.');
      return;
    }

    if (!confirm('Are you sure you want to delete this position?')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', String(id));

      if (error) throw error;

      onUpdate(); // Refresh data
    } catch (error) {
      console.error('Error deleting position:', error);
      alert('Error deleting position');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newPosition.title || !newPosition.department || !newPosition.type || !newPosition.branch) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const positionData = {
        title: newPosition.title,
        department: newPosition.department,
        type: newPosition.type,
        branch: newPosition.branch,
        status: newPosition.status || 'open',
        applications: newPosition.applications
      };

      const { error } = await supabase
        .from('positions')
        .insert([positionData]);

      if (error) throw error;

      setIsAdding(false);
      setNewPosition({
        title: '',
        department: '',
        type: '',
        branch: '',
        status: 'open',
        applications: ''
      });
      onUpdate(); // Refresh data
    } catch (error) {
      console.error('Error adding position:', error);
      alert('Error adding position');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Convert data to CSV
      const headers = ['Title', 'Department', 'Type', 'Branch', 'Status'];
      const csvData = positions.map(pos => [
        `"${pos.title}"`,
        `"${pos.department}"`,
        `"${pos.type}"`,
        `"${branches.find(b => b.id === pos.branch)?.name || pos.branch}"`,
        `"${pos.status}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `positions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Positions</h2>
            <p className="text-gray-600 text-sm">{positions.length} positions found</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <GlowButton 
              variant="secondary" 
              icon={Download} 
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </GlowButton>
            <GlowButton 
              variant="primary" 
              icon={Plus} 
              size="sm"
              onClick={() => setIsAdding(true)}
              disabled={isLoading}
            >
              Add Position
            </GlowButton>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Position Title</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Department</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Type</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Branch</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
              <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Add new position row */}
            {isAdding && (
              <tr className="bg-blue-50">
                <td className="py-4 px-4">
                  <input
                    type="text"
                    value={newPosition.title || ''}
                    onChange={(e) => setNewPosition({...newPosition, title: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Position title"
                  />
                </td>
                <td className="py-4 px-4">
                  <input
                    type="text"
                    value={newPosition.department || ''}
                    onChange={(e) => setNewPosition({...newPosition, department: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Department"
                  />
                </td>
                <td className="py-4 px-4">
                  <input
                    type="text"
                    value={newPosition.type || ''}
                    onChange={(e) => setNewPosition({...newPosition, type: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Type"
                  />
                </td>
                <td className="py-4 px-4">
                  <select
                    value={newPosition.branch || ''}
                    onChange={(e) => setNewPosition({...newPosition, branch: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="">Select branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4 px-4">
                  <select
                    value={newPosition.status || 'open'}
                    onChange={(e) => setNewPosition({...newPosition, status: e.target.value as any})}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="pending">Pending</option>
                  </select>
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-center gap-1">
                    <GlowButton 
                      variant="primary" 
                      icon={Save} 
                      size="sm"
                      onClick={handleAdd}
                      disabled={isLoading}
                    >
                      Save
                    </GlowButton>
                    <GlowButton 
                      variant="secondary" 
                      icon={X} 
                      size="sm"
                      onClick={() => setIsAdding(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </GlowButton>
                  </div>
                </td>
              </tr>
            )}

            {/* Existing positions */}
            {positions.map((position) => {
              const branch = branches.find(b => b.id === position.branch);
              const isEditing = editingId === String(position.id);

              return (
                <tr key={position.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedPosition?.title || ''}
                        onChange={(e) => setEditedPosition({...editedPosition, title: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <div className="space-y-1">
                        <p className="text-gray-900 font-semibold">{position.title}</p>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedPosition?.department || ''}
                        onChange={(e) => setEditedPosition({...editedPosition, department: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <p className="text-gray-700">{position.department}</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedPosition?.type || ''}
                        onChange={(e) => setEditedPosition({...editedPosition, type: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <p className="text-gray-700">{position.type}</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {isEditing ? (
                      <select
                        value={editedPosition?.branch || ''}
                        onChange={(e) => setEditedPosition({...editedPosition, branch: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      >
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-700">{branch?.name}</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {isEditing ? (
                      <select
                        value={editedPosition?.status || 'open'}
                        onChange={(e) => setEditedPosition({...editedPosition, status: e.target.value as any})}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="pending">Pending</option>
                      </select>
                    ) : (
                      <StatusBadge status={position.status} />
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-1">
                      {isEditing ? (
                        <>
                          <GlowButton 
                            variant="primary" 
                            icon={Save} 
                            size="sm" 
                            onClick={handleSave}
                            disabled={isLoading}
                          >
                            Save
                          </GlowButton>
                          <GlowButton 
                            variant="secondary" 
                            icon={X} 
                            size="sm" 
                            onClick={handleCancel}
                            disabled={isLoading}
                          >
                            Cancel
                          </GlowButton>
                        </>
                      ) : (
                        <>
                          <GlowButton 
                            variant="secondary" 
                            icon={Edit} 
                            size="sm" 
                            onClick={() => handleEdit(position)}
                            disabled={isLoading}
                          >
                            {isValidUUID(String(position.id)) ? 'Edit' : 'adjust'}
                          </GlowButton>
                          {isValidUUID(String(position.id)) ? (
                            <GlowButton 
                              variant="danger" 
                              icon={Trash2} 
                              size="sm" 
                              onClick={() => handleDelete(position.id)}
                              disabled={isLoading}
                            >
                              Delete
                            </GlowButton>
                          ) : (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              Legacy Record
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionsTable;