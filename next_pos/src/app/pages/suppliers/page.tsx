"use client";
import React, { useState, useEffect } from "react";
import SideBar from "@/components/SideBar";
import {
  Truck, Plus, Edit, Trash2, Search, Phone, Mail,
  MapPin, User, Building, LogOut
} from "lucide-react";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  logoutUser
} from "@/components/api";

interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  isActive?: boolean;
}

interface User {
  username: string;
  role: string;
}

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    location: ''
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchQuery]);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      alert("Failed to load suppliers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = [...suppliers];

    if (searchQuery) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (supplier.location && supplier.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredSuppliers(filtered);
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const supplierData = {
        name: newSupplier.name,
        contactPerson: newSupplier.contactPerson || undefined,
        email: newSupplier.email || undefined,
        phone: newSupplier.phone || undefined,
        address: newSupplier.address || undefined,
        location: newSupplier.location || undefined,
      };

      const added = await createSupplier(supplierData);
      setSuppliers(prev => [...prev, added]);
      setNewSupplier({
        name: '', contactPerson: '', email: '', phone: '', address: '', location: ''
      });
      setShowAddModal(false);
      alert("Supplier added successfully!");
    } catch (error) {
      console.error("Failed to add supplier:", error);
      alert("Failed to add supplier. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    try {
      setIsLoading(true);
      const supplierData = {
        name: newSupplier.name,
        contactPerson: newSupplier.contactPerson || undefined,
        email: newSupplier.email || undefined,
        phone: newSupplier.phone || undefined,
        address: newSupplier.address || undefined,
        location: newSupplier.location || undefined,
      };

      const updated = await updateSupplier(selectedSupplier.id, supplierData);
      setSuppliers(prev => prev.map(s => s.id === selectedSupplier.id ? updated : s));
      setShowEditModal(false);
      setSelectedSupplier(null);
      alert("Supplier updated successfully!");
    } catch (error) {
      console.error("Failed to update supplier:", error);
      alert("Failed to update supplier. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (!confirm(`Are you sure you want to delete "${supplier.name}"?`)) return;

    try {
      setIsLoading(true);
      await deleteSupplier(supplier.id);
      setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
      alert("Supplier deleted successfully!");
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      alert("Failed to delete supplier. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setNewSupplier({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      location: supplier.location || ''
    });
    setShowEditModal(true);
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
              <Truck className="w-6 h-6 text-maroon" />
              <span>Supplier Management</span>
            </h1>
            <p className="text-sm text-warm-grey">Manage supplier information and contacts</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Total Suppliers</p>
                <p className="text-2xl font-bold text-off-white">{suppliers.length}</p>
              </div>
              <Truck className="w-8 h-8 text-maroon" />
            </div>
          </div>

          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Active Suppliers</p>
                <p className="text-2xl font-bold text-success-green">{suppliers.filter(s => s.isActive !== false).length}</p>
              </div>
              <Building className="w-8 h-8 text-success-green" />
            </div>
          </div>

          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">With Contact Info</p>
                <p className="text-2xl font-bold text-maroon">{suppliers.filter(s => s.email || s.phone).length}</p>
              </div>
              <Phone className="w-8 h-8 text-maroon" />
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="card mb-6 border border-light-grey/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-grey w-5 h-5" />
              <input
                type="text"
                placeholder="Search suppliers..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Supplier</span>
            </button>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="card border border-light-grey/20 hover:border-maroon/30 transition-all duration-200 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-maroon/20 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-maroon" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-off-white">{supplier.name}</h3>
                    {supplier.contactPerson && (
                      <p className="text-sm text-warm-grey">{supplier.contactPerson}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(supplier)}
                    className="p-2 text-maroon hover:bg-maroon/20 rounded-lg transition-colors duration-200"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(supplier)}
                    className="p-2 text-error-red hover:bg-error-red/20 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {supplier.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-warm-grey" />
                    <span className="text-warm-grey">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-warm-grey" />
                    <span className="text-warm-grey">{supplier.phone}</span>
                  </div>
                )}
                {supplier.location && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-warm-grey" />
                    <span className="text-warm-grey">{supplier.location}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="mt-3 p-3 bg-deep-charcoal/30 rounded-lg">
                    <p className="text-sm text-warm-grey">{supplier.address}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-warm-grey mx-auto mb-4" />
            <p className="text-warm-grey text-lg">No suppliers found</p>
            <p className="text-warm-grey/60">Try adjusting your search or add a new supplier</p>
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-grey rounded-xl p-6 w-full max-w-2xl border border-light-grey/20">
            <h2 className="text-xl font-bold text-off-white mb-6">Add New Supplier</h2>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Company Name</label>
                  <input
                    className="input"
                    placeholder="Enter company name"
                    value={newSupplier.name}
                    onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Contact Person</label>
                  <input
                    className="input"
                    placeholder="Enter contact person name"
                    value={newSupplier.contactPerson}
                    onChange={e => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Email</label>
                  <input
                    className="input"
                    placeholder="Enter email address"
                    type="email"
                    value={newSupplier.email}
                    onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Phone</label>
                  <input
                    className="input"
                    placeholder="Enter phone number"
                    value={newSupplier.phone}
                    onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Location</label>
                  <input
                    className="input"
                    placeholder="Enter city/location"
                    value={newSupplier.location}
                    onChange={e => setNewSupplier({ ...newSupplier, location: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Address</label>
                <textarea
                  className="input"
                  placeholder="Enter full address"
                  rows={3}
                  value={newSupplier.address}
                  onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })}
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
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-grey rounded-xl p-6 w-full max-w-2xl border border-light-grey/20">
            <h2 className="text-xl font-bold text-off-white mb-6">Edit Supplier</h2>
            <form onSubmit={handleEditSupplier} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Company Name</label>
                  <input
                    className="input"
                    placeholder="Enter company name"
                    value={newSupplier.name}
                    onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Contact Person</label>
                  <input
                    className="input"
                    placeholder="Enter contact person name"
                    value={newSupplier.contactPerson}
                    onChange={e => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Email</label>
                  <input
                    className="input"
                    placeholder="Enter email address"
                    type="email"
                    value={newSupplier.email}
                    onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Phone</label>
                  <input
                    className="input"
                    placeholder="Enter phone number"
                    value={newSupplier.phone}
                    onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Location</label>
                  <input
                    className="input"
                    placeholder="Enter city/location"
                    value={newSupplier.location}
                    onChange={e => setNewSupplier({ ...newSupplier, location: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Address</label>
                <textarea
                  className="input"
                  placeholder="Enter full address"
                  rows={3}
                  value={newSupplier.address}
                  onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })}
                />
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
                  Update Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;

