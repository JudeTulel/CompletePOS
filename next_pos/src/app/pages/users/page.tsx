"use client";
import React, { useState, useEffect } from "react";
import SideBar from "@/components/SideBar";
import {
  Users, Plus, Edit, Trash2, Search, User, LogOut, Eye, EyeOff, Key, UserCheck, Shield
} from "lucide-react";
import {
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  logoutUser,
  getUsers,
  signupUser
} from "@/components/api";

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cashier'
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check authentication and admin access
    if (!isAuthenticated()) {
      window.location.href = '/pages/login';
      return;
    }
    
    if (!isAdmin()) {
      window.location.href = '/pages/cashier';
      return;
    }
    
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Load users from API
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Failed to load users:", error);
      alert("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newUser.password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      setIsLoading(true);
      
      const userData = {
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
        email: newUser.email
      };
      
      await signupUser(userData);
      await loadUsers(); // Reload users after adding new one
      
      setNewUser({
        username: '', email: '', password: '', confirmPassword: '', role: 'cashier'
      });
      setShowAddModal(false);
      alert("User added successfully!");
    } catch (error) {
      console.error("Failed to add user:", error);
      alert("Failed to add user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      
      const userData = {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      };
      
      // Note: Update endpoint needs to be added to the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      await loadUsers(); // Reload users after update
      setShowEditModal(false);
      setSelectedUser(null);
      alert("User updated successfully!");
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (userToDelete.id === user?.id) {
      alert("You cannot delete your own account!");
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${userToDelete.username}"?`)) return;
    
    try {
      setIsLoading(true);
      
      // Note: Delete endpoint needs to be added to the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await loadUsers(); // Reload users after deletion
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userToToggle: User) => {
    if (userToToggle.id === user?.id) {
      alert("You cannot deactivate your own account!");
      return;
    }

    try {
      setIsLoading(true);
      
      // Note: Status toggle endpoint needs to be added to the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userToToggle.id}/toggle-status`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }

      await loadUsers(); // Reload users after status change
      alert(`User ${!userToToggle.isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      alert("Failed to update user status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      setIsLoading(true);
      
      // Note: Password change endpoint needs to be added to the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      setShowPasswordModal(false);
      setSelectedUser(null);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      alert("Password changed successfully!");
    } catch (error) {
      console.error("Failed to change password:", error);
      alert("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setNewUser({
      username: userToEdit.username,
      email: userToEdit.email || '',
      password: '',
      confirmPassword: '',
      role: userToEdit.role
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setShowPasswordModal(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = '/pages/login';
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = '/pages/login';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-maroon/20 text-maroon';
      case 'cashier': return 'bg-light-grey/20 text-warm-grey';
      default: return 'bg-warm-grey/20 text-warm-grey';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-success-green/20 text-success-green' : 'bg-error-red/20 text-error-red';
  };

  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const cashierUsers = users.filter(u => u.role === 'cashier').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-charcoal via-slate-grey to-light-grey">
      <SideBar />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-grey rounded-xl p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
            <span className="text-off-white font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="fixed top-0 left-20 right-0 bg-slate-grey/95 backdrop-blur-xl border-b border-light-grey/20 z-30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-off-white flex items-center space-x-2">
              <Users className="w-6 h-6 text-maroon" />
              <span>User Management</span>
            </h1>
            <p className="text-sm text-warm-grey">Manage user accounts and permissions</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-warm-grey">
              <User size={16} />
              <span>{user?.username} (ADMIN)</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-error-red/20 hover:bg-error-red/30 rounded-lg transition-colors duration-200 text-error-red"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="ml-20 p-6 pt-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-off-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-maroon" />
            </div>
          </div>
          
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-success-green">{activeUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-success-green" />
            </div>
          </div>
          
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Administrators</p>
                <p className="text-2xl font-bold text-maroon">{adminUsers}</p>
              </div>
              <Shield className="w-8 h-8 text-maroon" />
            </div>
          </div>
          
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Cashiers</p>
                <p className="text-2xl font-bold text-warm-grey">{cashierUsers}</p>
              </div>
              <User className="w-8 h-8 text-warm-grey" />
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="card mb-6 border border-light-grey/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-grey w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <select
                className="input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="cashier">Cashiers</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="card border border-light-grey/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-grey/20">
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">User</th>
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Created</th>
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Last Login</th>
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="border-b border-light-grey/10 hover:bg-slate-grey/30 transition-colors duration-200">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-maroon/20 rounded-full flex items-center justify-center">
                          <span className="text-maroon font-semibold text-sm">
                            {userItem.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-off-white">{userItem.username}</p>
                          {userItem.email && (
                            <p className="text-sm text-warm-grey">{userItem.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userItem.role)}`}>
                        {userItem.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(!!userItem.isActive)}`}>
                        {userItem.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-warm-grey">{userItem.createdAt}</td>
                    <td className="py-3 px-4 text-warm-grey">{userItem.lastLogin || 'Never'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(userItem)}
                          className="p-2 text-maroon hover:bg-maroon/20 rounded-lg transition-colors duration-200"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openPasswordModal(userItem)}
                          className="p-2 text-warning-orange hover:bg-warning-orange/20 rounded-lg transition-colors duration-200"
                          title="Change Password"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(userItem)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            userItem.isActive 
                              ? 'text-warning-orange hover:bg-warning-orange/20' 
                              : 'text-success-green hover:bg-success-green/20'
                          }`}
                          title={userItem.isActive ? 'Deactivate User' : 'Activate User'}
                          disabled={userItem.id === user?.id}
                        >
                          {userItem.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userItem)}
                          className="p-2 text-error-red hover:bg-error-red/20 rounded-lg transition-colors duration-200"
                          title="Delete User"
                          disabled={userItem.id === user?.id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-warm-grey mx-auto mb-4" />
                <p className="text-warm-grey text-lg">No users found</p>
                <p className="text-warm-grey/60">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-grey rounded-xl p-6 w-full max-w-md border border-light-grey/20">
            <h2 className="text-xl font-bold text-off-white mb-6">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Username</label>
                <input 
                  className="input" 
                  placeholder="Enter username" 
                  value={newUser.username} 
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Email</label>
                <input 
                  className="input" 
                  placeholder="Enter email address" 
                  type="email"
                  value={newUser.email} 
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Role</label>
                <select 
                  className="input" 
                  value={newUser.role} 
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="cashier">Cashier</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Password</label>
                <div className="relative">
                  <input 
                    className="input pr-10" 
                    placeholder="Enter password" 
                    type={showPassword ? "text" : "password"}
                    value={newUser.password} 
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm-grey hover:text-off-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Confirm Password</label>
                <input 
                  className="input" 
                  placeholder="Confirm password" 
                  type={showPassword ? "text" : "password"}
                  value={newUser.confirmPassword} 
                  onChange={e => setNewUser({ ...newUser, confirmPassword: e.target.value })} 
                  required 
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-grey rounded-xl p-6 w-full max-w-md border border-light-grey/20">
            <h2 className="text-xl font-bold text-off-white mb-6">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Username</label>
                <input 
                  className="input" 
                  placeholder="Enter username" 
                  value={newUser.username} 
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Email</label>
                <input 
                  className="input" 
                  placeholder="Enter email address" 
                  type="email"
                  value={newUser.email} 
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Role</label>
                <select 
                  className="input" 
                  value={newUser.role} 
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  disabled={selectedUser.id === user?.id}
                >
                  <option value="cashier">Cashier</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-grey rounded-xl p-6 w-full max-w-md border border-light-grey/20">
            <h2 className="text-xl font-bold text-off-white mb-6">Change Password</h2>
            <div className="mb-4">
              <p className="text-warm-grey">User: <span className="text-off-white font-medium">{selectedUser.username}</span></p>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">New Password</label>
                <div className="relative">
                  <input 
                    className="input pr-10" 
                    placeholder="Enter new password" 
                    type={showPassword ? "text" : "password"}
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm-grey hover:text-off-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Confirm New Password</label>
                <input 
                  className="input" 
                  placeholder="Confirm new password" 
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword} 
                  onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                  required 
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;

