"use client";
import React, { useState, useEffect } from "react";
import SideBar from "@/components/SideBar";
import BarcodeScanner from "@/components/BarcodeScanner"; // Added this import
import { 
  Package, Plus, Edit, Trash2, Search, Filter, Download, 
  AlertTriangle, CheckCircle, TrendingDown, TrendingUp,
  User, LogOut, Shield, BarChart3, DollarSign, Camera // Added Camera import
} from "lucide-react";
import { 
  getProducts, 
  getCategories,
  createProduct, 
  updateProduct, 
  deleteProduct,
  adjustStock,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  logoutUser
} from "@/components/api";

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false); // Add scanner state
  const [scannerTarget, setScannerTarget] = useState<'search' | 'add' | 'edit'>('search'); // Track which field to update
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    barcode: '',
    name: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    maxStock: '',
    categoryId: ''
  });
  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: '',
    reason: ''
  });

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
    
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories().catch(() => [])
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load inventory data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.categoryId?.toString() === selectedCategory
      );
    }

    // Stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter(product => 
        product.stock <= (product.minStock || 10)
      );
    } else if (stockFilter === "out") {
      filtered = filtered.filter(product => 
        product.stock === 0
      );
    }

    setFilteredProducts(filtered);
  };

  // Handle barcode scan results
  const handleBarcodeScan = (scannedValue: string) => {
    if (scannerTarget === 'search') {
      setSearchQuery(scannedValue);
    } else if (scannerTarget === 'add') {
      setNewProduct({ ...newProduct, barcode: scannedValue });
    } else if (scannerTarget === 'edit') {
      setNewProduct({ ...newProduct, barcode: scannedValue });
    }
    setShowBarcodeScanner(false);
  };

  // Open scanner for different targets
  const openBarcodeScanner = (target: 'search' | 'add' | 'edit') => {
    setScannerTarget(target);
    setShowBarcodeScanner(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const productData = {
        barcode: newProduct.barcode,
        name: newProduct.name,
        description: newProduct.description || undefined,
        price: parseFloat(newProduct.price),
        cost: newProduct.cost ? parseFloat(newProduct.cost) : undefined,
        stock: newProduct.stock ? parseInt(newProduct.stock) : undefined,
        minStock: newProduct.minStock ? parseInt(newProduct.minStock) : undefined,
        maxStock: newProduct.maxStock ? parseInt(newProduct.maxStock) : undefined,
        categoryId: newProduct.categoryId ? parseInt(newProduct.categoryId) : undefined,
      };
      
      const added = await createProduct(productData);
      setProducts(prev => [...prev, added]);
      setNewProduct({
        barcode: '', name: '', description: '', price: '', cost: '',
        stock: '', minStock: '', maxStock: '', categoryId: ''
      });
      setShowAddModal(false);
      alert("Product added successfully!");
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      setIsLoading(true);
      const productData = {
        name: newProduct.name,
        description: newProduct.description || undefined,
        price: parseFloat(newProduct.price),
        cost: newProduct.cost ? parseFloat(newProduct.cost) : undefined,
        minStock: newProduct.minStock ? parseInt(newProduct.minStock) : undefined,
        maxStock: newProduct.maxStock ? parseInt(newProduct.maxStock) : undefined,
        categoryId: newProduct.categoryId ? parseInt(newProduct.categoryId) : undefined,
      };
      
      const updated = await updateProduct(selectedProduct.id, productData);
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updated : p));
      setShowEditModal(false);
      setSelectedProduct(null);
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (product: any) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    
    try {
      setIsLoading(true);
      await deleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      setIsLoading(true);
      await adjustStock(selectedProduct.id, {
        quantity: parseInt(stockAdjustment.quantity),
        reason: stockAdjustment.reason
      });
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, stock: p.stock + parseInt(stockAdjustment.quantity) }
          : p
      ));
      
      setShowStockModal(false);
      setSelectedProduct(null);
      setStockAdjustment({ quantity: '', reason: '' });
      alert("Stock adjusted successfully!");
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      alert("Failed to adjust stock. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (product: any) => {
    setSelectedProduct(product);
    setNewProduct({
      barcode: product.barcode,
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      cost: product.cost?.toString() || '',
      stock: product.stock?.toString() || '',
      minStock: product.minStock?.toString() || '',
      maxStock: product.maxStock?.toString() || '',
      categoryId: product.categoryId?.toString() || ''
    });
    setShowEditModal(true);
  };

  const openStockModal = (product: any) => {
    setSelectedProduct(product);
    setShowStockModal(true);
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

  const getStockStatus = (product: any) => {
    if (product.stock === 0) return { status: 'out', color: 'text-error-red', bg: 'bg-error-red/20' };
    if (product.stock <= (product.minStock || 10)) return { status: 'low', color: 'text-warning-orange', bg: 'bg-warning-orange/20' };
    return { status: 'good', color: 'text-success-green', bg: 'bg-success-green/20' };
  };

  const lowStockCount = products.filter(p => p.stock <= (p.minStock || 10)).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

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

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScan}
      />

      {/* Top Bar */}
      <div className="fixed top-0 left-20 right-0 bg-slate-grey/95 backdrop-blur-xl border-b border-light-grey/20 z-30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-off-white flex items-center space-x-2">
              <Package className="w-6 h-6 text-maroon" />
              <span>Inventory Management</span>
            </h1>
            <p className="text-sm text-warm-grey">Manage products, stock levels, and categories</p>
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
                <p className="text-warm-grey text-sm font-medium">Total Products</p>
                <p className="text-2xl font-bold text-off-white">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-maroon" />
            </div>
          </div>
          
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-warning-orange">{lowStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning-orange" />
            </div>
          </div>
          
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-error-red">{outOfStockCount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-error-red" />
            </div>
          </div>
          
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-success-green">${totalValue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-success-green" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="card mb-6 border border-light-grey/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-5">
              <div className="input">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-grey w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="input pl-10 pr-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Camera icon for search */}
                <button
                  onClick={() => openBarcodeScanner('search')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-light-grey/20 rounded transition-colors duration-200"
                  title="Scan barcode to search"
                >
                  <Camera className="w-4 h-4 text-warm-grey hover:text-maroon" />
                </button>
              </div>
              
              <select
                className="input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                ))}
              </select>
              
              <select
                className="input"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All Stock Levels</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="card border border-light-grey/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-grey/20">
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Product</th>
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Barcode</th>
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Price</th>
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Stock</th>
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-warm-grey font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr key={product.id} className="border-b border-light-grey/10 hover:bg-slate-grey/30 transition-colors duration-200">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-off-white">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-warm-grey">{product.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-warm-grey font-mono">{product.barcode}</td>
                      <td className="py-3 px-4 text-off-white font-medium">${product.price}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-off-white font-medium">{product.stock || 0}</span>
                          <button
                            onClick={() => openStockModal(product)}
                            className="text-xs px-2 py-1 bg-maroon/20 hover:bg-maroon/30 text-maroon rounded transition-colors duration-200"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.status === 'out' ? 'Out of Stock' : 
                           stockStatus.status === 'low' ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 hover:bg-light-grey/20 rounded-lg transition-colors duration-200"
                            title="Edit product"
                          >
                            <Edit size={16} className="text-warm-grey hover:text-off-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 hover:bg-error-red/20 rounded-lg transition-colors duration-200"
                            title="Delete product"
                          >
                            <Trash2 size={16} className="text-warm-grey hover:text-error-red" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-grey rounded-xl p-6 w-full max-w-2xl border border-light-grey/20">
            <h2 className="text-xl font-bold text-off-white mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Product Name</label>
                  <input 
                    className="input" 
                    placeholder="Enter product name" 
                    value={newProduct.name} 
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Category</label>
                  <select 
                    className="input"
                    value={newProduct.categoryId} 
                    onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Barcode</label>
                  <div className="relative">
                    <input 
                      className="input pr-12" 
                      placeholder="Enter barcode" 
                      value={newProduct.barcode} 
                      onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })} 
                      required 
                    />
                    {/* Camera icon for add modal */}
                    <button
                      type="button"
                      onClick={() => openBarcodeScanner('add')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-light-grey/20 rounded transition-colors duration-200"
                      title="Scan barcode"
                    >
                      <Camera className="w-4 h-4 text-warm-grey hover:text-maroon" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Price</label>
                  <input 
                    className="input" 
                    placeholder="0.00" 
                    type="number" 
                    step="0.01"
                    value={newProduct.price} 
                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Cost</label>
                  <input 
                    className="input" 
                    placeholder="0.00" 
                    type="number" 
                    step="0.01"
                    value={newProduct.cost} 
                    onChange={e => setNewProduct({ ...newProduct, cost: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Stock Quantity</label>
                  <input 
                    className="input" 
                    placeholder="0" 
                    type="number"
                    value={newProduct.stock} 
                    onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Min Stock</label>
                  <input 
                    className="input" 
                    placeholder="0" 
                    type="number"
                    value={newProduct.minStock} 
                    onChange={e => setNewProduct({ ...newProduct, minStock: e.target.value })} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Description</label>
                
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
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-grey rounded-xl p-6 w-full max-w-2xl border border-light-grey/20">
            <h2 className="text-xl font-bold text-off-white mb-6">Edit Product</h2>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Product Name</label>
                  <input 
                    className="input" 
                    placeholder="Enter product name" 
                    value={newProduct.name} 
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Barcode</label>
                  <input 
                    className="input" 
                    placeholder="Enter barcode" 
                    value={newProduct.barcode} 
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Price</label>
                  <input 
                    className="input" 
                    placeholder="0.00" 
                    type="number" 
                    step="0.01"
                    value={newProduct.price} 
                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Cost</label>
                  <input 
                    className="input" 
                    placeholder="0.00" 
                    type="number" 
                    step="0.01"
                    value={newProduct.cost} 
                    onChange={e => setNewProduct({ ...newProduct, cost: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Min Stock</label>
                  <input 
                    className="input" 
                    placeholder="0" 
                    type="number"
                    value={newProduct.minStock} 
                    onChange={e => setNewProduct({ ...newProduct, minStock: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-grey mb-2">Max Stock</label>
                  <input 
                    className="input" 
                    placeholder="0" 
                    type="number"
                    value={newProduct.maxStock} 
                    onChange={e => setNewProduct({ ...newProduct, maxStock: e.target.value })} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Description</label>
                
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
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-grey rounded-xl p-6 w-full max-w-md border border-light-grey/20">
            <h2 className="text-xl font-bold text-off-white mb-6">Adjust Stock</h2>
            <div className="mb-4">
              <p className="text-warm-grey">Product: <span className="text-off-white font-medium">{selectedProduct.name}</span></p>
              <p className="text-warm-grey">Current Stock: <span className="text-off-white font-medium">{selectedProduct.stock || 0}</span></p>
            </div>
            <form onSubmit={handleStockAdjustment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Quantity Change</label>
                <input 
                  className="input" 
                  placeholder="Enter positive or negative number" 
                  type="number"
                  value={stockAdjustment.quantity} 
                  onChange={e => setStockAdjustment({ ...stockAdjustment, quantity: e.target.value })} 
                  required 
                />
                <p className="text-xs text-warm-grey mt-1">Use negative numbers to reduce stock</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-grey mb-2">Reason</label>
                <input 
                  className="input" 
                  placeholder="Reason for adjustment" 
                  value={stockAdjustment.reason} 
                  onChange={e => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })} 
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setShowStockModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Adjust Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;