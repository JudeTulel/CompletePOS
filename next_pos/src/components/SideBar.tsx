'use client'
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  ShoppingCart, 
  Package, 
  CreditCard, 
  BarChart3, 
  Users, 
  Settings, 
  Menu, 
  X,
  Home,
  Truck,
  LogOut,
  Shield,
  TrendingUp,
  DollarSign,
  Archive
} from "lucide-react";
import { getCurrentUser, logoutUser } from "./api";

interface SideBarProps {
  onShowInventory?: () => void;
  onShowCart?: () => void;
  onCheckout?: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ onShowInventory, onShowCart, onCheckout }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  // Helper functions that use the user object directly (NOT localStorage)
  const isUserAdmin = (user: User | null): boolean => {
    return user?.role === 'admin';
  };

  const isUserCashier = (user: User | null): boolean => {
    return user?.role === 'cashier' || !user?.role; // Default to cashier if no role
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsClient(true);
    
    // Initialize navigation items using the currentUser object
    setNavItems(getNavItems(currentUser));
  }, []);

  interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    description: string;
    roles: string[];
    action?: () => void;
  }

  const getNavItems = (currentUser: User | null): NavItem[] => {
    const commonItems: NavItem[] = [
      { 
        label: "Dashboard", 
        path: isUserAdmin(currentUser) ? "/pages/admin" : "/pages/cashier", 
        icon: Home,
        description: "Main interface",
        roles: ['admin', 'cashier']
      },
    ];

    const cashierItems = [
      { 
        label: "POS Terminal", 
        path: "/pages/cashier", 
        icon: CreditCard,
        description: "Point of sale interface",
        roles: ['cashier']
      },
      { 
        label: "Inventory", 
        path: "/inventory", 
        icon: Package,
        description: "Manage products & stock",
        action: onShowInventory,
        roles: ['cashier']
      },
      { 
        label: "Cart", 
        path: "/cart", 
        icon: ShoppingCart,
        description: "Current transaction",
        action: onShowCart,
        roles: ['cashier']
      },
      { 
        label: "Checkout", 
        path: "/checkout", 
        icon: DollarSign,
        description: "Process payments",
        action: onCheckout,
        roles: ['cashier']
      },
    ];

    const adminItems = [
      { 
        label: "Analytics", 
        path: "/pages/admin", 
        icon: BarChart3,
        description: "Sales & performance data",
        roles: ['admin']
      },
      { 
        label: "Inventory", 
        path: "/pages/inventory", 
        icon: Archive,
        description: "Product management",
        roles: ['admin']
      },
      { 
        label: "Suppliers", 
        path: "/pages/suppliers", 
        icon: Truck,
        description: "Manage suppliers",
        roles: ['admin']
      },
      { 
        label: "Users", 
        path: "/pages/users", 
        icon: Users,
        description: "User management",
        roles: ['admin']
      },
      { 
        label: "Reports", 
        path: "/pages/reports", 
        icon: TrendingUp,
        description: "Financial reports",
        roles: ['admin']
      },
      { 
        label: "Settings", 
        path: "/pages/settings", 
        icon: Settings,
        description: "System configuration",
        roles: ['admin']
      },
    ];

    let items = [...commonItems];
    
    if (isUserCashier(currentUser)) {
      items = [...items, ...cashierItems];
    }
    
    if (isUserAdmin(currentUser)) {
      items = [...items, ...adminItems];
    }

    return items;
  };

  const handleNavigation = (path: string, action?: () => void) => {
    if (action) {
      action();
    } else {
      router.push(path);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/pages/login');
    } catch (error) {
      console.error("Logout failed:", error);
      router.push('/pages/login');
    }
  };

  // During initial render (server), show minimal version that matches server output
  if (!isClient) {
    return (
      <nav className={`
        fixed left-0 top-0 h-full bg-deep-charcoal/95 backdrop-blur-xl border-r border-light-grey/20 
        transition-all duration-300 ease-in-out z-50 flex flex-col
        w-80
      `}>
        {/* Header */}
        <div className="p-6 border-b border-light-grey/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-maroon to-light-maroon rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-off-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-off-white">RelyOn POS</h1>
                <p className="text-xs text-warm-grey">Loading...</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-slate-grey/50 transition-colors duration-200 text-warm-grey hover:text-off-white"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Items - minimal version */}
        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <div className="relative">
            <button
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                text-warm-grey hover:text-off-white hover:bg-slate-grey/50 hover:scale-102
                justify-start
              `}
            >
              <Home size={20} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-light-grey/20">
          <button
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
              text-error-red hover:bg-error-red/20 hover:scale-102
              justify-start
            `}
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-light-grey/20">
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-light-maroon to-maroon rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg">
              <span className="text-off-white font-semibold text-sm">U</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // If user is still null after client initialization, show loading state
  if (user === null) {
    return (
      <nav className={`
        fixed left-0 top-0 h-full bg-deep-charcoal/95 backdrop-blur-xl border-r border-light-grey/20 
        transition-all duration-300 ease-in-out z-50 flex flex-col
        ${isCollapsed ? 'w-20' : 'w-80'}
      `}>
        <div className="p-6 border-b border-light-grey/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-maroon to-light-maroon rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-off-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-off-white">RelyOn POS</h1>
                <p className="text-xs text-warm-grey">Loading user...</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-slate-grey/50 transition-colors duration-200 text-warm-grey hover:text-off-white"
            >
              {isCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-warm-grey">Loading user data...</div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <nav className={`
        fixed left-0 top-0 h-full bg-deep-charcoal/95 backdrop-blur-xl border-r border-light-grey/20 
        transition-all duration-300 ease-in-out z-50 flex flex-col
        ${isCollapsed ? 'w-20' : 'w-80'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-light-grey/20">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-maroon to-light-maroon rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-off-white font-bold text-lg">R</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-off-white">RelyOn POS</h1>
                  <p className="text-xs text-warm-grey">Point of Sale System</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-slate-grey/50 transition-colors duration-200 text-warm-grey hover:text-off-white"
            >
              {isCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>
        </div>

        {/* User Role Badge */}
        {!isCollapsed && user && (
          <div className="px-6 py-3 border-b border-light-grey/20">
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-full ${isUserAdmin(user) ? 'bg-maroon/20' : 'bg-light-grey/20'}`}>
                {isUserAdmin(user) ? (
                  <Shield className="w-4 h-4 text-maroon" />
                ) : (
                  <CreditCard className="w-4 h-4 text-warm-grey" />
                )}
              </div>
              <span className="text-sm font-medium text-warm-grey">
                {user.role?.toUpperCase()} MODE
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || 
              (!!item.action && (
                (item.label === 'Inventory' && pathname.includes('inventory')) ||
                (item.label === 'Cart' && pathname.includes('cart')) ||
                (item.label === 'Checkout' && pathname.includes('checkout'))
              ));
            const isHovered = hoveredItem === item.path;
            
            return (
              <div key={item.path + item.label} className="relative">
                <button
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-maroon text-off-white shadow-lg shadow-maroon/20 scale-105' 
                      : 'text-warm-grey hover:text-off-white hover:bg-slate-grey/50 hover:scale-102'
                    }
                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                  `}
                  onClick={() => handleNavigation(item.path, item.action)}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Icon size={20} className={isActive ? 'text-off-white' : ''} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-off-white rounded-full animate-pulse"></div>
                  )}
                </button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && isHovered && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-grey text-off-white px-3 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap border border-light-grey/20">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-warm-grey">{item.description}</div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-grey rotate-45 border-l border-b border-light-grey/20"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-light-grey/20">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
              text-error-red hover:bg-error-red/20 hover:scale-102
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
          >
            <LogOut size={20} />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-light-grey/20">
          {!isCollapsed && user ? (
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-grey/30 hover:bg-slate-grey/50 transition-colors duration-200 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-light-maroon to-maroon rounded-full flex items-center justify-center shadow-lg">
                <span className="text-off-white font-semibold text-sm">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-off-white truncate">{user.username}</p>
                <p className="text-xs text-warm-grey">Active Session</p>
              </div>
              <div className="w-3 h-3 bg-success-green rounded-full animate-pulse"></div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-light-maroon to-maroon rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg">
                <span className="text-off-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default SideBar;

interface User {
  username: string;
  role: string;
}