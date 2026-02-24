'use client'
// Enhanced API functions for NestJS backend integration


// Automatically determine the correct backend IP
const isBrowser = typeof window !== 'undefined';

const API_BASE_URL = isBrowser
  ? `http://${window.location.hostname}:5000`
  : 'http://localhost:5000'; // Fallback for SSR or build phase

// API request helper (no auth)
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication functions
export const loginUser = async (credentials: { username: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }
  const data = await response.json();
  if (isBrowser) {
    // Always set cashierId to 1 for compatibility
    const userObj: { username: string; role: string; cashierId: number } = { 
      username: data?.user?.username, 
      role: data?.user?.role, 
      cashierId: 1 
    };
    localStorage.setItem('user', JSON.stringify(userObj));
  }
  return data;
};

export const logoutUser = async () => {
  if (isBrowser) {
    localStorage.removeItem('user');
  }
};

// Product functions
export const getProducts = async () => {
  const response = await apiRequest('/products');
  return await response.json();
};

export const getProduct = async (barcode: string) => {
  const response = await apiRequest(`/products/barcode/${barcode}`);
  return await response.json();
};

export const createProduct = async (productData: Record<string, unknown>) => {
  const response = await apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  return await response.json();
};

export const updateProduct = async (id: number, productData: Record<string, unknown>) => {
  const response = await apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
  return await response.json();
};

export const deleteProduct = async (id: number) => {
  const response = await apiRequest(`/products/${id}`, {
    method: 'DELETE',
  });
  return response.ok;
};

export const searchProducts = async (query: string) => {
  const response = await apiRequest(`/products/search?q=${encodeURIComponent(query)}`);
  return await response.json();
};

export const adjustStock = async (productId: number, adjustment: { quantity: number; reason: string }) => {
  const response = await apiRequest(`/products/${productId}/adjust-stock`, {
    method: 'POST',
    body: JSON.stringify(adjustment),
  });
  return await response.json();
};

// Category functions
export const getCategories = async () => {
  const response = await apiRequest('/categories');
  return await response.json();
};

export const createCategory = async (categoryData: { name: string; description?: string }) => {
  const response = await apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
  return await response.json();
};

export const updateCategory = async (id: number, categoryData: { name: string; description?: string }) => {
  const response = await apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
  return await response.json();
};

export const deleteCategory = async (id: number) => {
  const response = await apiRequest(`/categories/${id}`, {
    method: 'DELETE',
  });
  return response.ok;
};

// Supplier functions
export const getSuppliers = async () => {
  const response = await apiRequest('/suppliers');
  return await response.json();
};

export const createSupplier = async (supplierData: Record<string, unknown>) => {
  const response = await apiRequest('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplierData),
  });
  return await response.json();
};

export const updateSupplier = async (id: number, supplierData: Record<string, unknown>) => {
  const response = await apiRequest(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(supplierData),
  });
  return await response.json();
};

export const deleteSupplier = async (id: number) => {
  const response = await apiRequest(`/suppliers/${id}`, {
    method: 'DELETE',
  });
  return response.ok;
};

// Sales functions
export const getSales = async () => {
  const response = await apiRequest('/sales');
  return await response.json();
};

export async function createSale(payload: {
  totalAmount: number;
  paymentMethod: string;
  cashierId: number;
  details: Array<{ productId: number; quantity: number; price: number; total: number }>;
  miscItems?: Array<{ item: string; qty: number; price: number; total: number }>; // Add miscItems support
}) {
  const res = await fetch(`${API_BASE_URL}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create sale');
  }
  return res.json();
}

// Sale status polling
export const getSaleStatus = async (saleId: number | string): Promise<{ status: string; message?: string }> => {
  const response = await apiRequest(`/sales/sale${saleId}`);
  return await response.json();
};

// Cash register functions
export const getCashRegister = async () => {
  const response = await apiRequest('/cash');
  return await response.json();
};

export const updateCashRegister = async (data: { cashin?: number; cashout?: number }) => {
  //if cashin add money to cash register if cashout remove money from cash register
  const response = await apiRequest('/cash', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await response.json();
};

// Add cash register API helpers
export const addCashToRegister = async (id: number, cashin: number, change: number = 0) => {
  const response = await fetch(`${API_BASE_URL}/cash/add/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cashin, change })
  });
  if (!response.ok) throw new Error('Failed to add cash');
  return await response.json();
};

// Mpesa functions
export const getMpesaBalance = async () => {
  const response = await apiRequest('/mpesa/balance');
  return await response.json();
};

export const depositMpesa = async (amount: number) => {
  const response = await apiRequest('/mpesa/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  return await response.json();
};

export const withdrawMpesa = async (amount: number) => {
  const response = await apiRequest('/mpesa/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  return await response.json();
};

export const getMpesaTransactions = async () => {
  const response = await apiRequest('/mpesa/transactions');
  return await response.json();
};

// Safe localStorage functions
export const getCurrentUser = () => {
  if (!isBrowser) return null;
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  if (!isBrowser) return false;
  try {
    return !!localStorage.getItem('user');
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const isAdmin = () => {
  if (!isBrowser) return false;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      return parsedUser.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const isCashier = () => {
  if (!isBrowser) return false;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      return parsedUser.role === 'cashier';
    }
    return false;
  } catch (error) {
    console.error('Error checking cashier status:', error);
    return false;
  }
};

// User functions
export const signupUser = async (userData: { username: string; password: string; role: string }) => {
  const response = await apiRequest('/users/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return await response.json();
};

export const getUsers = async () => {
  const response = await apiRequest('/users');
  return await response.json();
};