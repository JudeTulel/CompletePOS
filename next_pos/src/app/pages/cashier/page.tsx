"use client";
import React, { useState, useEffect } from "react";
import ScannerInput from "@/components/ScannerInput";
import Cart, { CartItem } from "@/components/Cart";
import CheckoutModal from "@/components/CheckoutModal";
import ProductList from "@/components/ProductList";
import SearchBar from "@/components/SearchBar";
import SideBar from "@/components/SideBar";
import {
  getProduct,
  getProducts,
  createProduct,
  searchProducts,
  createSale,
  getCurrentUser,
  logoutUser,
  depositMpesa,
  addCashToRegister,
  getCashRegister,
  adjustStock,
  getSaleStatus,
} from "../../../components/api";
import {
  Package,
  Plus,
  X,
  DollarSign,
  Smartphone,
  LogOut,
  User,
} from "lucide-react";

const CashierPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    barcode: "",
    description: "",
    stock: "",
    minStock: "",
    categoryId: "",
  });
  const [showCart, setShowCart] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cashRegisterId, setCashRegisterId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    // Load cashierId from localStorage if present
    let cashierId = 1;
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj.cashierId) {
            cashierId = userObj.cashierId;
          } else if (userObj.id) {
            cashierId = userObj.id;
          }
        } catch {}
      }
    }
    setCashRegisterId(cashierId);
    // Load initial data
    loadInventory();
    // Fetch open cash register session
    const fetchCashRegister = async () => {
      const cashRecords = await getCashRegister();
      const openSession = Array.isArray(cashRecords)
        ? cashRecords.find((c: any) => c.closing == null)
        : null;
      setCashRegisterId(openSession ? openSession.id : cashierId);
    };
    fetchCashRegister();
  }, []);

  useEffect(() => {
    setTotal(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [cart]);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setInventory(data);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      alert("Failed to load inventory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async (barcode: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5000/products/barcode/${barcode}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Product not found");
      const product = await res.json();
      addToCart(product);
    } catch (err) {
      alert("Product not found");
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.barcode === product.barcode);
      if (existing) {
        return prev.map((item) =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          barcode: product.barcode,
          name: product.name,
          price: product.price,
          quantity: 1,
          productId: product.id,
        },
      ];
    });
  };

  const handleQuantityChange = (barcode: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.barcode === barcode
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const handleRemove = (barcode: string) => {
    setCart((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  // Show sale success/failure notification
  const showSaleSuccess = (status: string, paymentMethod: string) => {
    let msg = '';
    if (status === 'completed') {
      if (paymentMethod === 'cash') msg = 'Cash sale completed successfully!';
      else if (paymentMethod === 'mpesa') msg = 'M-Pesa sale completed successfully!';
      else if (paymentMethod === 'hybrid') msg = 'Hybrid sale completed successfully!';
    } else if (status === 'failed') {
      msg = 'Sale failed. Please check with admin.';
    } else {
      msg = 'Sale status: ' + status;
    }
    // Replace with your preferred notification system
    alert(msg);
  };

  // Poll sale status until completed/failed
  const monitorSaleStatus = async (saleId: number, paymentMethod: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 1 minute
    let status = 'pending';
    while (status === 'pending' && attempts < maxAttempts) {
      try {
        const res = await getSaleStatus(saleId);
        status = res.status;
        if (status !== 'pending') {
          showSaleSuccess(status, paymentMethod);
          break;
        }
      } catch (err) {
        if (attempts === 0) alert('Waiting for sale confirmation...');
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
    }
    if (status === 'pending') {
      alert('Sale is still processing. Please check the sales list later.');
    }
    // Refresh inventory in background
    loadInventory();
  };

  // Add MiscItem type
  interface MiscItem {
    item: string;
    qty: number;
    price: number;
    total: number;
  }

  // Unified checkout handler for all payment methods
  const handleCheckout = async (
    data: {
      paymentMethod: "cash" | "mpesa" | "hybrid";
      cashAmount?: number;
      mpesaAmount?: number;
      phone?: string;
    },
    miscItems: MiscItem[] = []
  ) => {
    try {
      setIsLoading(true);
      // Build sale details from cart (do NOT include misc items)
      const details = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }));
      let cashierId = 1;
      // Add cashRegisterId to sale payload
      const salePayload: any = {
        totalAmount: total,
        paymentMethod: data.paymentMethod,
        cashierId,
        cashRegisterId,
        details,
      };
      if (data.cashAmount !== undefined) salePayload.cashAmount = data.cashAmount;
      if (data.mpesaAmount !== undefined) salePayload.mpesaAmount = data.mpesaAmount;
      if (data.phone) salePayload.phone = data.phone;
      // Single API call for sale creation
      const sale = await createSale(salePayload);
      // Send misc items to printer endpoint if any
      if (sale && sale.id && miscItems && miscItems.length > 0) {
        await fetch("http://localhost/printer/misc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ saleId: sale.id, misc: miscItems }),
        });
      }
      // Optimistic UI: clear cart and close modal immediately
      setCart([]);
      setModalOpen(false);
      // Show processing feedback
      alert('Processing sale...');
      // Monitor sale status in background
      if (sale && sale.id) {
        monitorSaleStatus(sale.id, data.paymentMethod);
      }
      // Refresh inventory after sale
      loadInventory();
    } catch (error: any) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.\n" + (error?.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setProducts([]);
      setShowDropdown(false);
      return;
    }

    try {
      const results = await searchProducts(query);
      setProducts(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error("Search failed:", error);
      setProducts([]);
      setShowDropdown(false);
    }
  };

  // Product name search handler using regex
  const handleProductNameSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setProducts([]);
      setShowDropdown(false);
      return;
    }
    try {
      // Fetch all products if not already loaded
      let allProducts = inventory;
      if (!allProducts || allProducts.length === 0) {
        setIsLoading(true);
        allProducts = await getProducts();
        setInventory(allProducts);
        setIsLoading(false);
      }
      // Regex match (case-insensitive, partial)
      const regex = new RegExp(query, 'i');
      const matches = allProducts.filter((p: any) => regex.test(p.name));
      setProducts(matches);
      setShowDropdown(matches.length > 0);
    } catch (error) {
      setProducts([]);
      setShowDropdown(false);
    }
  };

  const handleAddFromSearch = (product: any) => {
    addToCart(product);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const price = parseFloat(newProduct.price);
      // Compute costPrice as price / 1.15
      const costPrice = Number((price / 1.15).toFixed(2));
      const productData = {
        barcode: newProduct.barcode,
        name: newProduct.name.toUpperCase(), // Force uppercase
        description: newProduct.description || undefined,
        price,
        costPrice,
        stock: newProduct.stock ? parseInt(newProduct.stock) : undefined,
        minStock: newProduct.minStock && newProduct.minStock !== ''
          ? parseInt(newProduct.minStock)
          : 7,
        categoryId: newProduct.categoryId
          ? parseInt(newProduct.categoryId)
          : undefined,
      };

      const added = await createProduct(productData);
      setInventory((prev) => [...prev, added]);
      setNewProduct({
        name: "",
        price: "",
        barcode: "",
        description: "",
        stock: "",
        minStock: "",
        categoryId: "",
      });
      alert("Product added successfully!");
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/pages/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout even if API call fails
      window.location.href = "/pages/login";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-charcoal via-slate-grey to-light-grey relative">
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
            <h1 className="text-xl font-bold text-off-white">
              Cashier Terminal
            </h1>
            <p className="text-sm text-warm-grey">Welcome, {user?.username}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-warm-grey">
              <User size={16} />
              <span>{user?.role?.toUpperCase()}</span>
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

      {/* Sidebar */}
      <SideBar
        onShowInventory={() => setShowInventory(true)}
        onShowCart={() => setShowCart(true)}
        onCheckout={() => setModalOpen(true)}
      />

      {/* Inventory Sidebar */}
      <div
        className={`
        fixed left-20 top-0 h-full w-96 bg-slate-grey/95 backdrop-blur-xl border-r border-light-grey/20 
        shadow-2xl transition-transform duration-300 z-40 flex flex-col
        ${showInventory ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-6 border-b border-light-grey/20 mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-maroon/20 rounded-lg">
                <Package className="w-6 h-6 text-maroon" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-off-white">
                  Inventory Manager
                </h2>
                <p className="text-sm text-warm-grey">
                  Manage products & stock
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInventory(false)}
              className="p-2 hover:bg-light-grey/20 rounded-lg transition-colors duration-200 text-warm-grey hover:text-off-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-light-grey/20">
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-grey mb-2">
                Product Name
              </label>
              <input
                className="input"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-grey mb-2">
                Barcode
              </label>
              <input
                className="input"
                placeholder="Enter barcode"
                value={newProduct.barcode}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, barcode: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-grey mb-2">
                Price
              </label>
              <input
                className="input"
                placeholder="0.00"
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-grey mb-2">
                Stock Quantity
              </label>
              <input
                className="input"
                placeholder="0"
                type="number"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          </form>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="font-semibold text-off-white mb-4 flex items-center space-x-2">
            <Package size={18} />
            <span>Products ({inventory.length})</span>
          </h3>
          <div className="space-y-2">
            {inventory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="card p-4 hover:bg-light-grey/20 transition-colors duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-off-white">{item.name}</p>
                    <p className="text-sm text-warm-grey">Ksh{item.price}</p>
                    {item.stock !== undefined && (
                      <p className="text-xs text-warm-grey">
                        Stock: {item.stock}
                      </p>
                    )}
                  </div>
                  <button
                    className="btn-primary text-sm px-3 py-1"
                    onClick={() => addToCart(item)}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      {showCart && (
        <div className="fixed right-0 top-0 h-full w-96 bg-slate-grey/95 backdrop-blur-xl border-l border-light-grey/20 shadow-2xl z-30 flex flex-col">
          <div className="p-6 border-b border-light-grey/20 mt-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-maroon/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-maroon" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-off-white">
                    Current Sale
                  </h2>
                  <p className="text-sm text-warm-grey">{cart.length} items</p>
                </div>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-light-grey/20 rounded-lg transition-colors duration-200 text-warm-grey hover:text-off-white lg:hidden"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Cart
              items={cart}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
            />
          </div>

          <div className="p-6 border-t border-light-grey/20 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-warm-grey">Total:</span>
              <span className="text-maroon">Ksh{total.toFixed(2)}</span>
            </div>
            <button
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setModalOpen(true)}
              disabled={cart.length === 0}
            >
              Checkout ({cart.length} items)
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`
        transition-all duration-300 p-6 space-y-6 pt-24
        ${showCart ? "ml-20 mr-96" : "ml-20 mr-0"}
        ${showInventory ? "ml-[26rem]" : ""}
      `}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Scanner Input - moved above search bar */}
          <div className="card">
            <ScannerInput onScan={handleScan} />
          </div>

          {/* Search Bar */}
          <div className="card relative">
            <input
              className="input mt-4"
              placeholder="Search product by name..."
              value={searchQuery}
              onChange={e => handleProductNameSearch(e.target.value)}
            />
            {/*{showDropdown && products.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-grey border border-light-grey/30 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {products.map((product: any) => (
                  <div
                    key={product.id}
                    className="px-4 py-2 hover:bg-maroon/10 cursor-pointer flex justify-between items-center"
                    onClick={() => {
                      addToCart(product);
                      setShowDropdown(false);
                      setSearchQuery("");
                      setProducts([]);
                    }}
                  >
                    <span className="font-medium text-off-white">{product.name}</span>
                    <span className="text-warm-grey text-xs">{product.barcode}</span>
                  </div>
                ))}
              </div>
            )}*/}
          </div>

          {/* Product List */}
          {products.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-off-white mb-4">
                Search Results for "{searchQuery}"
              </h3>
              <ProductList
                products={products}
                onAddToCart={handleAddFromSearch}
                hideImage={true}
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowInventory(true)}
              className="card hover:bg-light-grey/20 transition-colors duration-200 flex items-center space-x-4 p-6"
            >
              <Package className="w-8 h-8 text-maroon" />
              <div className="text-left">
                <h3 className="font-semibold text-off-white">
                  Manage Inventory
                </h3>
                <p className="text-sm text-warm-grey">
                  Add, edit, or remove products
                </p>
              </div>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              disabled={cart.length === 0}
              className="card hover:bg-light-grey/20 transition-colors duration-200 flex items-center space-x-4 p-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smartphone className="w-8 h-8 text-maroon" />
              <div className="text-left">
                <h3 className="font-semibold text-off-white">
                  Process Payment
                </h3>
                <p className="text-sm text-warm-grey">
                  Cash or M-Pesa checkout
                </p>
              </div>
            </button>
          </div>

          {/* Available Products */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-maroon/20 rounded-lg">
                  <Package className="w-6 h-6 text-maroon" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-off-white">
                    Available Products
                  </h3>
                  <p className="text-sm text-warm-grey">
                    Click any product to add to cart
                  </p>
                </div>
              </div>
              <div className="text-sm text-warm-grey">
                {inventory.length} products available
              </div>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-warm-grey mx-auto mb-4 opacity-50" />
                <p className="text-warm-grey text-lg mb-2">
                  No products available
                </p>
                <p className="text-warm-grey/70 text-sm">
                  Add products using the Manage Inventory button above
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {inventory.map((product, idx) => (
                  <div
                    key={product.id || idx}
                    className="bg-slate-grey/50 rounded-xl p-4 border border-light-grey/20 hover:border-maroon/30 hover:bg-light-grey/10 transition-all duration-200 cursor-pointer group"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1 mb-3">
                        <h4 className="font-semibold text-off-white group-hover:text-maroon transition-colors duration-200 mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        {product.description && (
                          <p className="text-xs text-warm-grey/80 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-maroon">
                            Ksh{Number(product.price).toFixed(2)}
                          </span>
                          {product.stock !== undefined && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                product.stock > (product.minStock || 5)
                                  ? "bg-green-500/20 text-green-400"
                                  : product.stock > 0
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {product.stock} in stock
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-light-grey/20">
                        <span className="text-xs text-warm-grey font-mono">
                          {product.barcode}
                        </span>
                        <div className="flex items-center space-x-1 text-maroon opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Plus size={14} />
                          <span className="text-xs font-medium">
                            Add to Cart
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        total={total}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default CashierPage;
