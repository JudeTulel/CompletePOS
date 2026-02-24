"use client";
import React, { useState, useEffect } from "react";
import SideBar from "@/components/SideBar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, Smartphone, Package, 
  Users, Calendar, Clock, BarChart3, PieChart as PieChartIcon,
  RefreshCw, Download, Filter, AlertTriangle, CheckCircle,
  User, LogOut, Shield
} from "lucide-react";
import { 
  getSales, 
  getProducts, 
  getCashRegister,
  logoutUser,
  signupUser,
  getUsers,
  getMpesaBalance,
  withdrawMpesa
} from "@/components/api";
import TopProductsCard from '@/components/TopProductsCard';

// Add cash register API helpers
const setOpeningBalance = async (opening: number) => {
  const res = await fetch('https://localhost:5000/cash/opening', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opening })
  });
  return res.json();
};
const setClosingBalance = async (id: number, closing: number) => {
  const res = await fetch(`https://localhost:5000/cash/closing/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ closing })
  });
  return res.json();
};

const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'hourly' | 'daily' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [realData, setRealData] = useState<any>({
    sales: [],
    products: [],
    cashRegister: null
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'cashier' });
  const [users, setUsers] = useState<any[]>([]);
  const [cashRegisterId, setCashRegisterId] = useState<number | null>(null);
  const [openingInput, setOpeningInput] = useState('');
  const [closingInput, setClosingInput] = useState('');
  const [mpesaBalance, setMpesaBalance] = useState<number>(0);
  const [withdrawInput, setWithdrawInput] = useState('');

  useEffect(() => {
    // Check authentication and admin access using localStorage
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        window.location.href = '/pages/login';
        return;
      }
      if (user.role !== 'admin') {
        window.location.href = '/pages/cashier';
        return;
      }
      setUser(user);
      // Load real data
      loadDashboardData();
      loadUsers();
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [salesData, productsData, cashData] = await Promise.all([
        getSales().catch(() => []),
        getProducts().catch(() => []),
        getCashRegister().catch(() => null)
      ]);
      
      setRealData({
        sales: salesData,
        products: productsData,
        cashRegister: cashData
      });
      
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      loadDashboardData();
    }, 1000);
  };

  // Fetch Mpesa balance
  useEffect(() => {
    const fetchMpesa = async () => {
      try {
        const res = await getMpesaBalance();
        setMpesaBalance(Number(res.balance) || 0);
      } catch {
        setMpesaBalance(0);
      }
    };
    fetchMpesa();
  }, [lastUpdated]);

  // Calculate metrics from real data, ensure numbers
  const todaysSales = realData.sales.reduce((sum: number, sale: any) => {
    const saleDate = new Date(sale.createdAt || sale.date);
    const today = new Date();
    if (saleDate.toDateString() === today.toDateString()) {
      // Ensure totalAmount is a number before summing
      const amount = Number(sale.totalAmount);
      return sum + (isNaN(amount) ? 0 : amount);
    }
    return sum;
  }, 0);

  const todaysTransactions = realData.sales.filter((sale: any) => {
    const saleDate = new Date(sale.createdAt || sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  }).length;

  const lowStockProducts = realData.products.filter((product: any) => 
    Number(product.stock) <= Number(product.minStock || 10)
  );

  // Calculate real percentage changes
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaysSales = realData.sales.reduce((sum: number, sale: any) => {
    const saleDate = new Date(sale.createdAt || sale.date);
    if (saleDate.toDateString() === yesterday.toDateString()) {
      const amount = Number(sale.totalAmount);
      return sum + (isNaN(amount) ? 0 : amount);
    }
    return sum;
  }, 0);
  const salesChange = yesterdaysSales === 0 ? 0 : ((todaysSales - yesterdaysSales) / yesterdaysSales) * 100;

  const yesterdaysTransactions = realData.sales.filter((sale: any) => {
    const saleDate = new Date(sale.createdAt || sale.date);
    return saleDate.toDateString() === yesterday.toDateString();
  }).length;
  const transactionsChange = yesterdaysTransactions === 0 ? 0 : ((todaysTransactions - yesterdaysTransactions) / yesterdaysTransactions) * 100;

  const loadMpesaBalance = async () => {
    try {
      const res = await getMpesaBalance();
      setMpesaBalance(res.balance || 0);
    } catch (error) {
      console.error("Failed to load Mpesa balance:", error);
    }
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim()) {
      alert("Username and password are required");
      return;
    }
    try {
      setIsLoading(true);
      await signupUser(newUser);
      setShowAddUserModal(false);
      setNewUser({ username: '', password: '', role: 'cashier' });
      await loadUsers();
      alert("User created successfully!");
    } catch (error) {
      alert("Failed to create user. Username may already exist.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-success-green';
      case 'low': return 'text-warning-orange';
      case 'critical': return 'text-error-red';
      default: return 'text-warm-grey';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-success-green/20';
      case 'low': return 'bg-warning-orange/20';
      case 'critical': return 'bg-error-red/20';
      default: return 'bg-warm-grey/20';
    }
  };

  // After loading dashboard data, set cashRegisterId to open session
  useEffect(() => {
    if (realData.cashRegister && Array.isArray(realData.cashRegister)) {
      const openSession = realData.cashRegister.find((c: any) => c.closing == null);
      setCashRegisterId(openSession ? openSession.id : null);
    }
  }, [realData.cashRegister]);

  // UI for opening/closing cash register
  const handleSetOpening = async () => {
    if (!openingInput) return;
    setIsLoading(true);
    try {
      await setOpeningBalance(Number(openingInput));
      setOpeningInput('');
      await loadDashboardData();
    } catch (e) {
      alert('Failed to set opening balance');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSetClosing = async () => {
    if (!closingInput || !cashRegisterId) return;
    setIsLoading(true);
    try {
      await setClosingBalance(cashRegisterId, Number(closingInput));
      setClosingInput('');
      await loadDashboardData();
    } catch (e) {
      alert('Failed to set closing balance');
    } finally {
      setIsLoading(false);
    }
  };

  // Mpesa withdraw handler
  const handleWithdrawMpesa = async () => {
    if (!withdrawInput) return;
    setIsLoading(true);
    try {
      await withdrawMpesa(Number(withdrawInput));
      setWithdrawInput('');
      setLastUpdated(new Date());
      alert('Withdrawal successful!');
    } catch (e) {
      alert('Failed to withdraw from Mpesa');
    } finally {
      setIsLoading(false);
    }
  };

  // Group sales for charts by hour, day, or month using real data
  const groupSalesData = () => {
    const sales = realData.sales || [];
    if (timeRange === 'hourly') {
      // Group today's sales by hour
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      const hourly = hours.map(hour => {
        const salesForHour = sales.filter((sale: any) => {
          const d = new Date(sale.createdAt || sale.date);
          return d.toDateString() === new Date().toDateString() && d.getHours() === parseInt(hour);
        });
        return {
          hour,
          sales: salesForHour.reduce((sum: number, s: any) => sum + Number(s.totalAmount || 0), 0),
          transactions: salesForHour.length,
          cash: salesForHour.filter((s: any) => s.paymentMethod === 'cash' || s.paymentMethod === 'hybrid').reduce((sum: number, s: any) => sum + Number(s.paymentMethod === 'hybrid' ? s.cashAmount : s.totalAmount || 0), 0),
          mpesa: salesForHour.filter((s: any) => s.paymentMethod === 'mpesa' || s.paymentMethod === 'hybrid').reduce((sum: number, s: any) => sum + Number(s.paymentMethod === 'hybrid' ? s.mpesaAmount : s.totalAmount || 0), 0)
        };
      });
      return hourly;
    } else if (timeRange === 'monthly') {
      // Group sales by month
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return d;
      });
      return months.map(date => {
        const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const salesForMonth = sales.filter((sale: any) => {
          const d = new Date(sale.createdAt || sale.date);
          return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        });
        return {
          month: monthStr,
          sales: salesForMonth.reduce((sum: number, s: any) => sum + Number(s.totalAmount || 0), 0),
          transactions: salesForMonth.length,
          cash: salesForMonth.filter((s: any) => s.paymentMethod === 'cash' || s.paymentMethod === 'hybrid').reduce((sum: number, s: any) => sum + Number(s.paymentMethod === 'hybrid' ? s.cashAmount : s.totalAmount || 0), 0),
          mpesa: salesForMonth.filter((s: any) => s.paymentMethod === 'mpesa' || s.paymentMethod === 'hybrid').reduce((sum: number, s: any) => sum + Number(s.paymentMethod === 'hybrid' ? s.mpesaAmount : s.totalAmount || 0), 0)
        };
      });
    } else {
      // Group sales by day for last 30 days
      const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d;
      });
      return days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const salesForDay = sales.filter((sale: any) => {
          const d = new Date(sale.createdAt || sale.date);
          return d.toISOString().split('T')[0] === dateStr;
        });
        return {
          date: dateStr,
          sales: salesForDay.reduce((sum: number, s: any) => sum + Number(s.totalAmount || 0), 0),
          transactions: salesForDay.length,
          cash: salesForDay.filter((s: any) => s.paymentMethod === 'cash' || s.paymentMethod === 'hybrid').reduce((sum: number, s: any) => sum + Number(s.paymentMethod === 'hybrid' ? s.cashAmount : s.totalAmount || 0), 0),
          mpesa: salesForDay.filter((s: any) => s.paymentMethod === 'mpesa' || s.paymentMethod === 'hybrid').reduce((sum: number, s: any) => sum + Number(s.paymentMethod === 'hybrid' ? s.mpesaAmount : s.totalAmount || 0), 0)
        };
      });
    }
  };

  const getCurrentData = () => groupSalesData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-charcoal via-slate-grey to-light-grey">
      <SideBar />
      
      {/* Top Bar */}
      <div className="fixed top-0 left-20 right-0 bg-slate-grey/95 backdrop-blur-xl border-b border-light-grey/20 z-30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-off-white flex items-center space-x-2">
              <Shield className="w-6 h-6 text-maroon" />
              <span>Admin Dashboard</span>
            </h1>
            <p className="text-sm text-warm-grey">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
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
        {/* Header Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-grey rounded-lg p-1">
                {(['hourly', 'daily', 'monthly'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      timeRange === range
                        ? 'bg-maroon text-off-white shadow-lg'
                        : 'text-warm-grey hover:text-off-white hover:bg-light-grey/50'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
              
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card group hover:scale-105 transition-transform duration-200 border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Cash Balance</p>
                <p className="text-2xl font-bold text-off-white">Ksh{Number(realData.cashRegister && Array.isArray(realData.cashRegister) && realData.cashRegister.find((c: any) => c.closing == null)?.opening || 0).toLocaleString()}</p>
                {/* Opening/Closing UI */}
                {cashRegisterId ? (
                  <div className="mt-2">
                    <input
                      type="number"
                      placeholder="Enter closing balance"
                      value={closingInput}
                      onChange={e => setClosingInput(e.target.value)}
                      className="input mb-2"
                    />
                    <button
                      onClick={handleSetClosing}
                      className="btn-primary"
                      disabled={isLoading || !closingInput}
                    >
                      Set Closing Balance
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <input
                      type="number"
                      placeholder="Enter opening balance"
                      value={openingInput}
                      onChange={e => setOpeningInput(e.target.value)}
                      className="input mb-2"
                    />
                    <button
                      onClick={handleSetOpening}
                      className="btn-primary"
                      disabled={isLoading || !openingInput}
                    >
                      Set Opening Balance
                    </button>
                  </div>
                )}
              </div>
              <div className="p-3 bg-maroon/20 rounded-lg group-hover:bg-maroon/30 transition-colors duration-200">
                <DollarSign className="w-6 h-6 text-maroon" />
              </div>
            </div>
          </div>

          <div className="card group hover:scale-105 transition-transform duration-200 border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Today's Sales</p>
                <p className="text-2xl font-bold text-off-white">Ksh{todaysSales.toLocaleString()}</p>
                <p className={`text-sm flex items-center mt-1 ${salesChange >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                  <TrendingUp size={14} className="mr-1" />
                  {yesterdaysSales === 0 ? 'N/A' : `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}% from yesterday`}
                </p>
              </div>
              <div className="p-3 bg-maroon/20 rounded-lg group-hover:bg-maroon/30 transition-colors duration-200">
                <BarChart3 className="w-6 h-6 text-maroon" />
              </div>
            </div>
          </div>

          <div className="card group hover:scale-105 transition-transform duration-200 border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Transactions</p>
                <p className="text-2xl font-bold text-off-white">{todaysTransactions}</p>
                <p className={`text-sm flex items-center mt-1 ${transactionsChange >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                  <TrendingUp size={14} className="mr-1" />
                  {yesterdaysTransactions === 0 ? 'N/A' : `${transactionsChange >= 0 ? '+' : ''}${transactionsChange.toFixed(1)}% from yesterday`}
                </p>
              </div>
              <div className="p-3 bg-maroon/20 rounded-lg group-hover:bg-maroon/30 transition-colors duration-200">
                <Users className="w-6 h-6 text-maroon" />
              </div>
            </div>
          </div>

          <div className="card group hover:scale-105 transition-transform duration-200 border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Low Stock Items</p>
                <p className="text-2xl font-bold text-off-white">{lowStockProducts.length}</p>
                <p className={`text-sm flex items-center mt-1 ${lowStockProducts.length > 0 ? 'text-warning-orange' : 'text-success-green'}`}>
                  {lowStockProducts.length > 0 ? (
                    <>
                      <AlertTriangle size={14} className="mr-1" />
                      Needs attention
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="mr-1" />
                      All good
                    </>
                  )}
                </p>
              </div>
              <div className="p-3 bg-maroon/20 rounded-lg group-hover:bg-maroon/30 transition-colors duration-200">
                <Package className="w-6 h-6 text-maroon" />
              </div>
            </div>
          </div>
        </div>

        {/* Mpesa Balance & Withdraw */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-off-white flex items-center space-x-2">
                <Smartphone className="w-6 h-6 text-maroon" />
                <span>Mpesa Float</span>
              </h3>
            </div>
            <div className="mb-2">
              <span className="text-2xl font-bold text-off-white">Ksh{mpesaBalance.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="number"
                placeholder="Withdraw amount"
                value={withdrawInput}
                onChange={e => setWithdrawInput(e.target.value)}
                className="input mb-2"
              />
              <button
                onClick={handleWithdrawMpesa}
                className="btn-primary"
                disabled={isLoading || !withdrawInput}
              >
                Withdraw
              </button>
            </div>
          </div>
          {/* Top Grossing Products Card */}
          <TopProductsCard topN={5} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Time Series */}
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-off-white">Sales Trend</h3>
              <div className="flex items-center space-x-2 text-sm text-warm-grey">
                <Calendar size={16} />
                <span>{timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} View</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getCurrentData()}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b1538" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b1538" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                  <XAxis 
                    dataKey={timeRange === 'hourly' ? 'hour' : timeRange === 'monthly' ? 'month' : 'date'} 
                    stroke="#718096" 
                    fontSize={12}
                  />
                  <YAxis stroke="#718096" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#2d3748', 
                      border: '1px solid #4a5568',
                      borderRadius: '8px',
                      color: '#f7fafc'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales"
                    stroke="#8b1538" 
                    strokeWidth={2}
                    fill="url(#salesGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Charts or Content can go here */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
       
