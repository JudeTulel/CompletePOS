import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CreditCard, Package, Shield, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-maroon rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-light-maroon rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-slate-grey rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-light-grey rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/4 w-36 h-36 bg-maroon/50 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div 
              key={i} 
              className="border border-light-grey/20 animate-pulse" 
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 text-center fade-in">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-maroon/20 rounded-full blur-2xl scale-110 animate-pulse"></div>
          <div className="relative z-10 w-80 h-80 mx-auto bg-gradient-to-br from-slate-grey to-deep-charcoal rounded-full flex items-center justify-center shadow-2xl border border-light-grey/20">
            <div className="w-64 h-64 bg-gradient-to-br from-maroon to-light-maroon rounded-full flex items-center justify-center shadow-xl">
              <div className="text-8xl font-bold text-off-white">POS</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6 max-w-3xl mx-auto px-6">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-off-white via-light-maroon to-maroon bg-clip-text text-transparent">
            RelyOn POS
          </h1>
          
          <p className="text-2xl md:text-3xl text-warm-grey font-light leading-relaxed">
            Modern Point of Sale System with Advanced Analytics
          </p>
          
          <p className="text-lg text-warm-grey/80 max-w-2xl mx-auto leading-relaxed">
            Streamline your business operations with our comprehensive POS solution featuring real-time analytics, 
            inventory management, role-based access control, and seamless payment processing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <Link href="/pages/login" className="group">
              <button className="btn-primary text-lg px-10 py-5 rounded-xl shadow-lg hover:shadow-maroon/25 transition-all duration-300 group-hover:scale-105 flex items-center space-x-3">
                <CreditCard size={24} />
                <span>Start Selling</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </Link>
            
            <Link href="/pages/admin" className="group">
              <button className="btn-outline text-lg px-10 py-5 rounded-xl transition-all duration-300 group-hover:scale-105 flex items-center space-x-3">
                <Shield size={24} />
                <span>Admin Dashboard</span>
                <BarChart3 size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </Link>
          </div>
        </div>
        
        {/* Enhanced feature highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          <div className="card text-center group hover:bg-slate-grey/80 transition-all duration-300 hover:scale-105 border border-light-grey/20">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <CreditCard className="w-12 h-12 text-maroon mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-maroon mb-3">Smart Payments</h3>
            <p className="text-warm-grey text-sm leading-relaxed">
              Integrated cash and M-Pesa payment processing with real-time balance tracking and transaction history
            </p>
          </div>
          
          <div className="card text-center group hover:bg-slate-grey/80 transition-all duration-300 hover:scale-105 border border-light-grey/20">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-12 h-12 text-maroon mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-maroon mb-3">Advanced Analytics</h3>
            <p className="text-warm-grey text-sm leading-relaxed">
              Comprehensive sales reports with hourly, daily, and monthly insights plus performance metrics
            </p>
          </div>
          
          <div className="card text-center group hover:bg-slate-grey/80 transition-all duration-300 hover:scale-105 border border-light-grey/20">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <Package className="w-12 h-12 text-maroon mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-maroon mb-3">Inventory Control</h3>
            <p className="text-warm-grey text-sm leading-relaxed">
              Real-time stock management with low stock alerts, supplier integration, and automated reordering
            </p>
          </div>
        </div>

        {/* Additional features section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
          <div className="flex items-center space-x-4 p-6 bg-slate-grey/30 rounded-xl border border-light-grey/20 hover:bg-slate-grey/50 transition-colors duration-300">
            <Users className="w-8 h-8 text-maroon" />
            <div>
              <h4 className="font-semibold text-off-white">Role-Based Access</h4>
              <p className="text-sm text-warm-grey">Admin and cashier permissions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-6 bg-slate-grey/30 rounded-xl border border-light-grey/20 hover:bg-slate-grey/50 transition-colors duration-300">
            <Zap className="w-8 h-8 text-maroon" />
            <div>
              <h4 className="font-semibold text-off-white">Real-Time Updates</h4>
              <p className="text-sm text-warm-grey">Live inventory and sales data</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-6 bg-slate-grey/30 rounded-xl border border-light-grey/20 hover:bg-slate-grey/50 transition-colors duration-300">
            <Shield className="w-8 h-8 text-maroon" />
            <div>
              <h4 className="font-semibold text-off-white">Secure & Reliable</h4>
              <p className="text-sm text-warm-grey">JWT authentication & encryption</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-slate-grey/50 rounded-xl px-8 py-3 text-sm text-warm-grey/80 mb-3 shadow border border-light-grey/20">
          © 2024 RelyOn POS. Powered by modern technology.
        </div>
        <div className="flex gap-3 justify-center">
          <span className="w-3 h-3 rounded-full bg-maroon/60 animate-pulse" />
          <span className="w-3 h-3 rounded-full bg-maroon/60 animate-pulse delay-200" />
          <span className="w-3 h-3 rounded-full bg-maroon/60 animate-pulse delay-400" />
        </div>
      </div>
    </div>
  );
}

