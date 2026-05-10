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
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  logoutUser,
  getSalesReport,
  getProductPerformanceReport,
  getFinancialSummary,
  getPaymentMethodBreakdown,
  getSalesTrend
} from "@/components/api";

interface User {
  username: string;
  role: string;
}

interface SaleData {
  period?: string;
  date?: string;
  hour?: string;
  day?: string;
  week?: string;
  month?: string;
  sales: number;
  transactions: number;
  profit: number;
  margin?: string;
}

interface ProductData {
  productId?: number;
  productName: string;
  name?: string;
  sold: number;
  revenue: number;
  profit: number;
  margin: string;
}

interface FinancialData {
  revenue: number;
  cost: number;
  profit: number;
  margin: string;
  transactions: number;
  itemsSold: number;
  averageTransactionValue: string;
  averageItemPrice: string;
}

interface PaymentData {
  method: string;
  count: number;
  amount: number;
}

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [reportType, setReportType] = useState<'sales' | 'products' | 'financial'>('sales');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [productsData, setProductsData] = useState<ProductData[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [trendData, setTrendData] = useState<SaleData[]>([]);

  // Calculate date range based on selection
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  };

  // Determine granularity for sales report
  const getGranularity = (): 'hourly' | 'daily' | 'weekly' | 'monthly' => {
    switch (dateRange) {
      case 'today':
        return 'hourly';
      case 'week':
        return 'daily';
      case 'month':
        return 'weekly';
      case 'year':
        return 'monthly';
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
  }, [dateRange, reportType]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      const { startDate, endDate } = getDateRange();

      // Load all reports in parallel
      const [sales, products, financial, payments, trend] = await Promise.all([
        getSalesReport(startDate, endDate, getGranularity()).catch(() => []),
        getProductPerformanceReport(startDate, endDate, 10).catch(() => []),
        getFinancialSummary(startDate, endDate).catch(() => null),
        getPaymentMethodBreakdown(startDate, endDate).catch(() => []),
        getSalesTrend(startDate, endDate).catch(() => [])
      ]);

      // Format display keys for reports
      const formattedSales = sales.map((item: any) => ({
        ...item,
        hour: item.period,
        day: item.period,
        week: item.period,
        month: item.period,
      }));

      const formattedProducts = (products as any[]).map((item: any) => ({
        ...item,
        name: item.productName,
      }));

      setSalesData(formattedSales);
      setProductsData(formattedProducts);
      setFinancialData(financial);
      setPaymentData(payments);
      setTrendData(trend);
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

  const downloadReport = () => {
    let data: any[] = [];
    let filename = `${reportType}_report_${dateRange}.csv`;

    if (reportType === 'sales') {
      data = salesData;
    } else if (reportType === 'products') {
      data = productsData;
    } else if (reportType === 'financial' && financialData) {
      data = [financialData];
    }

    if (data.length === 0) {
      alert('No data to download');
      return;
    }

    const keys = Object.keys(data[0]);
    const csvContent = "data:text/csv;charset=utf-8," +
      keys.join(",") + "\n" +
      data.map(row => keys.map(key => row[key]).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
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
              <AreaChart data={salesData.length > 0 ? salesData : []}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b1538" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b1538" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis dataKey="period" stroke="#718096" fontSize={12} />
                <YAxis stroke="#718096" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: '8px',
                    color: '#f7fafc'
                  }}
                  formatter={(value) => `KSH${Number(value).toLocaleString()}`}
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
              <LineChart data={salesData.length > 0 ? salesData : []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis dataKey="period" stroke="#718096" fontSize={12} />
                <YAxis stroke="#718096" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: '8px',
                    color: '#f7fafc'
                  }}
                  formatter={(value) => `KSH${Number(value).toLocaleString()}`}
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
                <th className="text-left py-3 px-4 text-warm-grey font-medium">Margin</th>
              </tr>
            </thead>
            <tbody>
              {salesData.length > 0 ? (
                salesData.map((row, index) => (
                  <tr key={index} className="border-b border-light-grey/10 hover:bg-slate-grey/30 transition-colors duration-200">
                    <td className="py-3 px-4 text-off-white font-medium">{row.period}</td>
                    <td className="py-3 px-4 text-success-green font-medium">KSH{Number(row.sales).toLocaleString()}</td>
                    <td className="py-3 px-4 text-off-white">{row.transactions}</td>
                    <td className="py-3 px-4 text-maroon font-medium">KSH{Number(row.profit).toLocaleString()}</td>
                    <td className="py-3 px-4 text-warm-grey">{row.margin}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-warm-grey">No sales data available for the selected period</td>
                </tr>
              )}
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
              <BarChart data={productsData.length > 0 ? productsData : []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis dataKey="name" stroke="#718096" fontSize={12} angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#718096" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: '8px',
                    color: '#f7fafc'
                  }}
                  formatter={(value) => `KSH${Number(value).toLocaleString()}`}
                />
                <Bar dataKey="revenue" fill="#8b1538" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Margins */}
        <div className="card border border-light-grey/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-off-white">Profit Distribution</h3>
            <PieChartIcon size={20} className="text-warm-grey" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productsData.length > 0 ? productsData : []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="profit"
                  nameKey="name"
                >
                  {productsData.map((entry, index) => (
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
                  formatter={(value) => `KSH${Number(value).toLocaleString()}`}
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
              {productsData.length > 0 ? (
                productsData.map((product, index) => (
                  <tr key={index} className="border-b border-light-grey/10 hover:bg-slate-grey/30 transition-colors duration-200">
                    <td className="py-3 px-4 text-off-white font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-off-white">{product.sold}</td>
                    <td className="py-3 px-4 text-success-green font-medium">KSH{Number(product.revenue).toLocaleString()}</td>
                    <td className="py-3 px-4 text-maroon font-medium">KSH{Number(product.profit).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(product.margin) >= 35 ? 'bg-success-green/20 text-success-green' :
                          parseFloat(product.margin) >= 25 ? 'bg-warning-orange/20 text-warning-orange' :
                            'bg-error-red/20 text-error-red'
                      }`}>
                        {product.margin}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-warm-grey">No product data available for the selected period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFinancialReport = () => {
    if (!financialData) {
      return (
        <div className="card border border-light-grey/20 p-8">
          <p className="text-center text-warm-grey">No financial data available for the selected period</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-success-green">KSH{Number(financialData.revenue).toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-success-green" />
            </div>
          </div>

          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Total Costs</p>
                <p className="text-2xl font-bold text-error-red">KSH{Number(financialData.cost).toLocaleString()}</p>
              </div>
              <Package className="w-8 h-8 text-error-red" />
            </div>
          </div>

          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Net Profit</p>
                <p className="text-2xl font-bold text-maroon">KSH{Number(financialData.profit).toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-maroon" />
            </div>
          </div>

          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-grey text-sm font-medium">Profit Margin</p>
                <p className="text-2xl font-bold text-off-white">{financialData.margin}%</p>
              </div>
              <Activity className="w-8 h-8 text-off-white" />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card border border-light-grey/20">
            <p className="text-warm-grey text-sm font-medium mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-off-white">{financialData.transactions}</p>
          </div>
          <div className="card border border-light-grey/20">
            <p className="text-warm-grey text-sm font-medium mb-2">Avg Transaction Value</p>
            <p className="text-3xl font-bold text-success-green">KSH{Number(financialData.averageTransactionValue).toLocaleString()}</p>
          </div>
          <div className="card border border-light-grey/20">
            <p className="text-warm-grey text-sm font-medium mb-2">Total Items Sold</p>
            <p className="text-3xl font-bold text-off-white">{financialData.itemsSold}</p>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card border border-light-grey/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-off-white">Payment Method Distribution</h3>
              <PieChartIcon size={20} className="text-warm-grey" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData.length > 0 ? paymentData : []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="method"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 120 + 340}, 60%, ${50 + index * 5}%)`} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2d3748',
                      border: '1px solid #4a5568',
                      borderRadius: '8px',
                      color: '#f7fafc'
                    }}
                    formatter={(value) => `KSH${Number(value).toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card border border-light-grey/20">
            <h3 className="text-xl font-semibold text-off-white mb-6">Payment Methods Detail</h3>
            <div className="space-y-4">
              {paymentData.length > 0 ? (
                paymentData.map((payment, index) => {
                  const percentage = financialData.revenue > 0 ? (payment.amount / financialData.revenue) * 100 : 0;
                  return (
                    <div key={index} className="p-4 bg-deep-charcoal/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-off-white capitalize">{payment.method}</span>
                        <span className="text-maroon font-semibold">KSH{Number(payment.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-warm-grey">{payment.count} transactions</span>
                        <span className="text-warm-grey">{percentage.toFixed(1)}% of revenue</span>
                      </div>
                      <div className="w-full bg-light-grey/20 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-maroon transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-warm-grey py-8">No payment data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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

