import React from "react";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

export interface CartItem {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  productId: number; // Added to match usage in cashier page
}

interface CartProps {
  items: CartItem[];
  onQuantityChange: (barcode: string, quantity: number) => void;
  onRemove: (barcode: string) => void;
}

const Cart: React.FC<CartProps> = ({ items, onQuantityChange, onRemove }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="p-4 bg-slate-grey/30 rounded-full mb-4">
          <ShoppingCart className="w-12 h-12 text-warm-grey" />
        </div>
        <h3 className="text-lg font-semibold text-off-white mb-2">Cart is Empty</h3>
        <p className="text-warm-grey text-sm">
          Scan a product or search to add items to your cart
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.barcode}
            className="bg-deep-charcoal/30 rounded-xl p-4 border border-light-grey/20 hover:border-maroon/30 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-off-white truncate group-hover:text-maroon transition-colors duration-200">
                  {item.name}
                </h4>
                <p className="text-sm text-warm-grey">
                  ${Number(item.price).toFixed(2)} each
                </p>
              </div>
              <button
                onClick={() => onRemove(item.barcode)}
                className="p-2 text-warm-grey hover:text-error-red hover:bg-error-red/10 rounded-lg transition-all duration-200 ml-2"
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onQuantityChange(item.barcode, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-grey hover:bg-light-grey disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Minus size={14} className="text-off-white" />
                </button>
                
                <div className="w-16 text-center">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      onQuantityChange(item.barcode, Math.max(1, newQuantity));
                    }}
                    className="w-full bg-slate-grey border border-light-grey/20 rounded-lg px-2 py-1 text-center text-off-white text-sm focus:border-maroon focus:outline-none"
                  />
                </div>
                
                <button
                  onClick={() => onQuantityChange(item.barcode, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-grey hover:bg-light-grey transition-colors duration-200"
                >
                  <Plus size={14} className="text-off-white" />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <p className="font-semibold text-maroon">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
                <p className="text-xs text-warm-grey">
                  {item.quantity} × ${Number(item.price).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="p-6 bg-deep-charcoal/50 border-t border-light-grey/20">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-warm-grey">Items ({items.length})</span>
            <span className="text-off-white">${total.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-warm-grey">Tax (0%)</span>
            <span className="text-off-white">$0.00</span>
          </div>
          
          <div className="border-t border-light-grey/20 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-off-white">Total</span>
              <span className="text-xl font-bold text-maroon">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

