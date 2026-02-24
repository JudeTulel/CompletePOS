"use client";
import React, { useState, useEffect } from "react";
import SideBar from "@/components/SideBar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  Download, FileText, DollarSign, Package, Users, User, LogOut, BarChart3, PieChart as PieChartIcon, Activity,
  TrendingUp
} from "lucide-react";
import {
  getSales,
  getProducts,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  logoutUser
} from "@/components/api";

interface User {
  username: string;
  role: string;
}

interface SaleData {
  hour?: string;
  day?: string;
  week?: string;
  month?: string;
  sales: number;
  transactions: number;
  profit: number;
}

interface ProductData {
  name: string;
  sold: number;
  revenue: number;
  profit: number;
  margin: number;
}

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [reportType, setReportType] = useState<'sales' | 'products' | 'financial'>('sales');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [productsData, setProductsData] = useState<ProductData[]>([]);

  // Mock data for demonstration
  const mockSalesReport = {
    today: [
      { hour: '09:00', sales: 450, transactions: 12, profit: 135 },
      { hour: '10:00', sales: 680, transactions: 18, profit: 204 },
      { hour: '11:00', sales: 920, transactions: 25, profit: 276 },
      { hour: '12:00', sales: 1200, transactions: 32, profit: 360 },
      { hour: '13:00', sales: 1450, transactions: 38, profit: 435 },
      { hour: '14:00', sales: 1100, transactions: 29, profit: 330 },
      { hour: '15:00', sales: 890, transactions: 24, profit: 267 },
      { hour: '16:00', sales: 750, transactions: 20, profit: 225 },
      { hour: '17:00', sales: 620, transactions: 16, profit: 186 },
    ],
    week: [
      { day: 'Mon', sales: 8500, transactions: 180, profit: 2550 },
      { day: 'Tue', sales: 9200, transactions: 195, profit: 2760 },
      { day: 'Wed', sales: 7800, transactions: 165, profit: 2340 },
      { day: 'Thu', sales: 10500, transactions: 220, profit: 3150 },
      { day: 'Fri', sales: 12000, transactions: 250, profit: 3600 },
      { day: 'Sat', sales: 15500, transactions: 320, profit: 4650 },
      { day: 'Sun', sales: 11200, transactions: 235, profit: 3360 },
    ],
    month: [
      { week: 'Week 1', sales: 45000, transactions: 950, profit: 13500 },
      { week: 'Week 2', sales: 52000, transactions: 1100, profit: 15600 },
      { week: 'Week 3', sales: 48000, transactions: 1020, profit: 14400 },
      { week: 'Week 4', sales: 55000, transactions: 1150, profit: 16500 },
    ],
    year: [
      { month: 'Jan', sales: 180000, transactions: 3800, profit: 54000 },
      { month: 'Feb', sales: 165000, transactions: 3500, profit: 49500 },
      { month: 'Mar', sales: 195000, transactions: 4100, profit: 58500 },
      { month: 'Apr', sales: 210000, transactions: 4400, profit: 63000 },
      { month: 'May', sales: 225000, transactions: 4700, profit: 67500 },
      { month: 'Jun', sales: 240000, transactions: 5000, profit: 72000 },
    ]
  };

  const mockProductReport = [
    { name: 'Coffee Beans', sold: 450, revenue: 13500, profit: 4050, margin: 30 },
    { name: 'Energy Drinks', sold: 320, revenue: 9600, profit: 3360, margin: 35 },
    { name: 'Snacks', sold: 280, revenue: 5600, profit: 2240, margin: 40 },
    { name: 'Soft Drinks', sold: 520, revenue: 10400, profit: 3120, margin: 30 },
    { name: 'Sandwiches', sold: 180, revenue: 9000, profit: 3600, margin: 40 },
  ];

  const mockFinancialReport = {
    revenue: 240000,
    costs: 168000,
    profit: 72000,
    margin: 30,
    expenses: {
      inventory: 140000,
      staff: 18000,
      utilities: 6000,
      rent: 4000
    }
  };

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

    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      const [sales, products] = await Promise.all([
        getSales().catch(() => []),
        getProducts().catch(() => [])
      ]);
      setSalesData(sales);
      setProductsData(products);
    } catch (error) {
      console.error("Failed to load report data:", error);
    } finally {
      setIsLoading(false);
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

  const getCurrentData = () => {
    return mockSalesReport[dateRange] || mockSalesReport.month;
  };

  const downloadReport = () => {
    // Mock download functionality
    const data = getCurrentData();
    const csvContent = "data:text/csv;charset=utf-8," +
      Object.keys(data[0]).join(",") + "\n" +
      data.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="card border border-light-grey/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-off-white">Sales Trend</h3>
            <BarChart3 size={20} className="text-warm-grey" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getCurrentData()}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b1538" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b1538" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis
                  dataKey={dateRange === 'today' ? 'hour' : dateRange === 'week' ? 'day' : dateRange === 'month' ? 'week' : 'month'}
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

        {/* Profit Analysis */}
        <div className="card border border-light-grey/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-off-white">Profit Analysis</h3>
            <TrendingUp size={20} className="text-warm-grey" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getCurrentData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis
                  dataKey={dateRange === 'today' ? 'hour' : dateRange === 'week' ? 'day' : dateRange === 'month' ? 'week' : 'month'}
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
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales Summary Table */}
      <div className="card border border-light-grey/20">
        <h3 className="text-xl font-semibold text-off-white mb-6">Sales Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-grey/20">
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Period</th>
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Sales</th>
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Transactions</th>
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Profit</th>
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Avg. Sale</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentData().map((row, index) => {
                let periodValue: string = '';
                if ('hour' in row) periodValue = row.hour;
                else if ('day' in row) periodValue = row.day;
                else if ('week' in row) periodValue = row.week;
                else if ('month' in row) periodValue = row.month;
                const avgSale = row.sales / row.transactions;
                return (
                  <tr key={index} className="border-b border-light-grey/10 hover:bg-slate-grey/30 transition-colors duration-200">
                    <td className="py-3 px-4 text-off-white font-medium">{periodValue}</td>
                    <td className="py-3 px-4 text-success-green font-medium">${row.sales.toLocaleString()}</td>
                    <td className="py-3 px-4 text-off-white">{row.transactions}</td>
                    <td className="py-3 px-4 text-maroon font-medium">${row.profit.toLocaleString()}</td>
                    <td className="py-3 px-4 text-warm-grey">${avgSale.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProductReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <div className="card border border-light-grey/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-off-white">Top Products by Revenue</h3>
            <BarChart3 size={20} className="text-warm-grey" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockProductReport}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis dataKey="name" stroke="#718096" fontSize={12} />
                <YAxis stroke="#718096" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: '8px',
                    color: '#f7fafc'
                  }}
                />
                <Bar dataKey="revenue" fill="#8b1538" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Margins */}
        <div className="card border border-light-grey/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-off-white">Profit Margins</h3>
            <PieChartIcon size={20} className="text-warm-grey" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockProductReport}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="profit"
                  nameKey="name"
                >
                  {mockProductReport.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45 + 340}, 60%, ${50 + index * 5}%)`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: '8px',
                    color: '#f7fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="card border border-light-grey/20">
        <h3 className="text-xl font-semibold text-off-white mb-6">Product Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-grey/20">
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Product</th>
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Units Sold</th>
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Revenue</th>
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Profit</th>
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Margin</th>
              </tr>
            </thead>
            <tbody>
              {mockProductReport.map((product, index) => (
                <tr key={index} className="border-b border-light-grey/10 hover:bg-slate-grey/30 transition-colors duration-200">
                  <td className="py-3 px-4 text-off-white font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-off-white">{product.sold}</td>
                  <td className="py-3 px-4 text-success-green font-medium">${product.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-maroon font-medium">${product.profit.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.margin >= 35 ? 'bg-success-green/20 text-success-green' :
                        product.margin >= 25 ? 'bg-warning-orange/20 text-warning-orange' :
                          'bg-error-red/20 text-error-red'
                    }`}>
                      {product.margin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFinancialReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border border-light-grey/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warm-grey text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-success-green">${mockFinancialReport.revenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-success-green" />
          </div>
        </div>

        <div className="card border border-light-grey/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warm-grey text-sm font-medium">Total Costs</p>
              <p className="text-2xl font-bold text-error-red">${mockFinancialReport.costs.toLocaleString()}</p>
            </div>
            <Package className="w-8 h-8 text-error-red" />
          </div>
        </div>

        <div className="card border border-light-grey/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warm-grey text-sm font-medium">Net Profit</p>
              <p className="text-2xl font-bold text-maroon">${mockFinancialReport.profit.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-maroon" />
          </div>
        </div>

        <div className="card border border-light-grey/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warm-grey text-sm font-medium">Profit Margin</p>
              <p className="text-2xl font-bold text-off-white">{mockFinancialReport.margin}%</p>
            </div>
            <Activity className="w-8 h-8 text-off-white" />
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card border border-light-grey/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-off-white">Expense Breakdown</h3>
            <PieChartIcon size={20} className="text-warm-grey" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(mockFinancialReport.expenses).map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {Object.entries(mockFinancialReport.expenses).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 90 + 340}, 60%, ${50 + index * 5}%)`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: '8px',
                    color: '#f7fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card border border-light-grey/20">
          <h3 className="text-xl font-semibold text-off-white mb-6">Expense Details</h3>
          <div className="space-y-4">
            {Object.entries(mockFinancialReport.expenses).map(([key, value], index) => {
              const percentage = (value / mockFinancialReport.costs) * 100;
              return (
                <div key={key} className="p-4 bg-deep-charcoal/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-off-white capitalize">{key}</span>
                    <span className="text-maroon font-semibold">${value.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-warm-grey">{percentage.toFixed(1)}% of total costs</span>
                  </div>
                  <div className="mt-2 w-full bg-light-grey/20 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-maroon transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-charcoal via-slate-grey to-light-grey">
      <SideBar />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-grey rounded-xl p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
            <span className="text-off-white font-medium">Loading reports...</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="fixed top-0 left-20 right-0 bg-slate-grey/95 backdrop-blur-xl border-b border-light-grey/20 z-30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-off-white flex items-center space-x-2">
              <FileText className="w-6 h-6 text-maroon" />
              <span>Reports & Analytics</span>
            </h1>
            <p className="text-sm text-warm-grey">Detailed business insights and financial reports</p>
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
        {/* Controls */}
        <div className="card mb-8 border border-light-grey/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2 bg-slate-grey rounded-lg p-1">
                {(['sales', 'products', 'financial'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      reportType === type
                        ? 'bg-maroon text-off-white shadow-lg'
                        : 'text-warm-grey hover:text-off-white hover:bg-light-grey/50'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 bg-slate-grey rounded-lg p-1">
                {(['today', 'week', 'month', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      dateRange === range
                        ? 'bg-maroon text-off-white shadow-lg'
                        : 'text-warm-grey hover:text-off-white hover:bg-light-grey/50'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={downloadReport}
              className="btn-primary flex items-center space-x-2"
            >
              <Download size={20} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Report Content */}
        {reportType === 'sales' && renderSalesReport()}
        {reportType === 'products' && renderProductReport()}
        {reportType === 'financial' && renderFinancialReport()}
      </div>
    </div>
  );
};

export default ReportsPage;

