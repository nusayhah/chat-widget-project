import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Users = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Note: You'll need to create this endpoint in your backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('chat_widget_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data.users || []);
        } else {
          throw new Error(data.message || 'Failed to load users');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsCreating(false);
    fetchUsers(); // Refresh the user list
    toast.success('New user created successfully!');
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('chat_widget_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(users.filter(u => u.id !== userId));
          toast.success('User deleted successfully');
        } else {
          throw new Error(data.message || 'Delete failed');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">
          Manage admin users who can access this dashboard
        </p>
      </div>

      {/* Current User Info */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Current User</h2>
            <p className="text-sm text-gray-600 mt-1">
              You are logged in as: <span className="font-medium">{user?.username}</span>
            </p>
            <p className="text-sm text-gray-600">Email: {user?.email}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white text-lg font-medium">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* Create New User Section */}
      <div className="card mb-8">
        {!isCreating ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Admin Users</h3>
            <p className="text-gray-600 mb-6">
              Create new admin users who can access this dashboard
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="btn-primary flex items-center mx-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New User
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Create New Admin User</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
            <RegisterForm 
              onSwitchToLogin={() => setIsCreating(false)}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>

      {/* Existing Users List */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Existing Users</h3>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
            {users.length} user{users.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">Error loading users: {error}</p>
            <button 
              onClick={fetchUsers}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-medium mr-3">
                          {userItem.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{userItem.username}</div>
                          {userItem.id === user?.id && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(userItem.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {userItem.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(userItem.id, userItem.username)}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              Create your first admin user to get started
            </p>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="mt-8 card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Notes</h3>
            <ul className="text-gray-600 list-disc list-inside space-y-1">
              <li>Only existing admins can create new users</li>
              <li>New users will have full access to the dashboard</li>
              <li>Users can manage all widgets and settings</li>
              <li>You cannot delete your own account while logged in</li>
              <li>Keep user credentials secure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;