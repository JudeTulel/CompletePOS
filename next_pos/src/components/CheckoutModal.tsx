import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { DollarSign, Smartphone, CreditCard, X, CheckCircle, AlertCircle } from "lucide-react";

interface MiscItem {
  item: string;
  qty: number;
  price: number;
  total: number;
}

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  onCheckout: (data: {
    paymentMethod: 'cash' | 'mpesa' | 'hybrid';
    cashAmount?: number;
    mpesaAmount?: number;
    phone?: string;
    cashierId: number;
    cashRegisterId: number;
    details: Array<{ productId: number; quantity: number; price: number; total: number }>;
    miscItems: MiscItem[];
    totalAmount: number;
  }) => void;
}

const quickAmounts = [
  { label: "Ksh 100", value: 100 },
  { label: "Ksh 200", value: 200 },
  { label: "Ksh 500", value: 500 },
  { label: "Ksh 1000", value: 1000 },
];

const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  open, 
  onClose, 
  total, 
  onCheckout
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'hybrid'>('cash');
  const [cashAmount, setCashAmount] = useState("");
  const [phone, setPhone] = useState("");
  // Miscellaneous items state
  const [showMisc, setShowMisc] = useState(false);
  const [miscItems, setMiscItems] = useState<MiscItem[]>([]);
  const [miscName, setMiscName] = useState("");
  const [miscQty, setMiscQty] = useState(1);
  const [miscPrice, setMiscPrice] = useState("");

  const addMiscItem = () => {
    if (!miscName || !miscPrice || isNaN(Number(miscPrice)) || isNaN(Number(miscQty))) return;
    const priceNum = Number(miscPrice);
    setMiscItems([
      ...miscItems,
      { item: miscName, qty: miscQty, price: priceNum, total: priceNum * miscQty },
    ]);
    setMiscName("");
    setMiscQty(1);
    setMiscPrice("");
    setShowMisc(false);
  };

  const removeMiscItem = (index: number) => {
    setMiscItems(miscItems.filter((_, i) => i !== index));
  };

  const miscTotal = miscItems.reduce((sum, m) => sum + m.total, 0);
  const finalTotal = total + miscTotal;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let cashAmountNum = cashAmount ? parseFloat(cashAmount) : 0;
    let mpesaAmountNum = 0;

    if (paymentMethod === 'cash') {
      if (cashAmountNum < finalTotal) return;
    } else if (paymentMethod === 'mpesa') {
      mpesaAmountNum = finalTotal;
    } else if (paymentMethod === 'hybrid') {
      if (cashAmountNum <= 0 || cashAmountNum >= finalTotal) return;
      mpesaAmountNum = finalTotal - cashAmountNum;
    }

    // Send everything in one object
    onCheckout({
      paymentMethod,
      cashAmount: paymentMethod === 'cash' || paymentMethod === 'hybrid' ? cashAmountNum : undefined,
      mpesaAmount: paymentMethod === 'mpesa' || paymentMethod === 'hybrid' ? mpesaAmountNum : undefined,
      phone: phone || undefined,
      cashierId: 1, // Replace with dynamic value
      cashRegisterId: 1, // Replace with dynamic value
      details: [], // Replace with actual cart items (from parent)
      miscItems,
      totalAmount: finalTotal,
    });

    // Reset form
    setCashAmount("");
    setPhone("");
    setMiscItems([]);
    setMiscName("");
    setMiscQty(1);
    setMiscPrice("");
    setShowMisc(false);
    onClose();
  };

  // Validation helpers
  const isCashValid = paymentMethod === 'cash' && parseFloat(cashAmount) >= finalTotal;
  const isMpesaValid = paymentMethod === 'mpesa';
  const isHybridValid = paymentMethod === 'hybrid' && parseFloat(cashAmount) > 0 && parseFloat(cashAmount) < finalTotal;
  const hybridMpesa = paymentMethod === 'hybrid' ? (finalTotal - parseFloat(cashAmount || '0')) : 0;

  return (
    <Transition show={open} as={React.Fragment}>
      <Dialog className="fixed inset-0 z-50 flex items-center justify-center p-4" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-grey rounded-2xl shadow-2xl border border-light-grey/20 w-full max-w-2xl z-50 relative overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-maroon to-maroon/80 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Complete Payment</h2>
                    <p className="text-white/80 text-sm">Select payment method</p>
                  </div>
                </div>
                <button 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200" 
                  onClick={onClose}
                >
                  <X size={20} />
                </button>
              </div>
              {/* Total Amount Display */}
              <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total Amount:</span>
                  <span className="text-2xl font-bold">Ksh{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-6">
              {/* Miscellaneous Items Section */}
              <div className="mb-4">
                <button
                  type="button"
                  className="btn-secondary mb-2"
                  onClick={() => setShowMisc((v) => !v)}
                >
                  + Miscellaneous Item
                </button>
                {showMisc && (
                  <div className="mb-4 p-4 border rounded bg-light-grey/10">
                    <input
                      className="w-full p-2 mb-2 bg-slate-grey/50 border border-light-grey/20 rounded-lg text-off-white placeholder-warm-grey focus:border-maroon focus:outline-none"
                      placeholder="Item name"
                      value={miscName}
                      onChange={e => setMiscName(e.target.value)}
                      required
                    />
                    <input
                      className="w-full p-2 mb-2 bg-slate-grey/50 border border-light-grey/20 rounded-lg text-off-white placeholder-warm-grey focus:border-maroon focus:outline-none"
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={miscQty}
                      onChange={e => setMiscQty(Number(e.target.value))}
                      required
                    />
                    <input
                      className="w-full p-2 mb-2 bg-slate-grey/50 border border-light-grey/20 rounded-lg text-off-white placeholder-warm-grey focus:border-maroon focus:outline-none"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Price"
                      value={miscPrice}
                      onChange={e => setMiscPrice(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      className="w-full py-2 bg-maroon hover:bg-maroon/80 rounded-lg font-semibold text-white transition-colors duration-200"
                      onClick={addMiscItem}
                    >
                      Add Misc Item
                    </button>
                  </div>
                )}
                {miscItems.length > 0 && (
                  <div className="mb-4 p-4 bg-slate-grey/20 rounded-lg border border-light-grey/20">
                    <div className="font-semibold mb-2 text-off-white">Miscellaneous Items:</div>
                    <ul className="space-y-2">
                      {miscItems.map((m, i) => (
                        <li key={i} className="text-sm flex justify-between items-center">
                          <span className="text-warm-grey">
                            {m.item} x{m.qty} @ Ksh{m.price.toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-off-white font-medium">Ksh{m.total.toFixed(2)}</span>
                            <button
                              onClick={() => removeMiscItem(i)}
                              className="text-red-400 hover:text-red-300 transition-colors duration-200"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {miscItems.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-light-grey/20 flex justify-between items-center">
                        <span className="text-warm-grey">Misc Total:</span>
                        <span className="text-maroon font-bold">Ksh{miscTotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4 mb-6">
                <div className="flex space-x-2">
                  <button 
                    className={`flex-1 p-3 rounded-lg transition-all duration-200 group ${paymentMethod === 'cash' ? 'bg-maroon text-white' : 'bg-slate-grey/50 hover:bg-light-grey/20'}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-maroon/20 group-hover:bg-maroon/30 rounded-lg transition-colors duration-200">
                        <DollarSign className="w-5 h-5 text-maroon" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold transition-colors duration-200 text-base">
                          Cash
                        </h3>
                        <p className="text-xs text-warm-grey">Pay with cash</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    className={`flex-1 p-3 rounded-lg transition-all duration-200 group ${paymentMethod === 'mpesa' ? 'bg-green-500 text-white' : 'bg-slate-grey/50 hover:bg-light-grey/20'}`}
                    onClick={() => setPaymentMethod('mpesa')}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-500/20 group-hover:bg-green-500/30 rounded-lg transition-colors duration-200">
                        <Smartphone className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold transition-colors duration-200 text-base">
                          M-Pesa
                        </h3>
                        <p className="text-xs text-warm-grey">Pay with M-Pesa</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    className={`flex-1 p-3 rounded-lg transition-all duration-200 group ${paymentMethod === 'hybrid' ? 'bg-blue-500 text-white' : 'bg-slate-grey/50 hover:bg-light-grey/20'}`}
                    onClick={() => setPaymentMethod('hybrid')}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-500/20 group-hover:bg-blue-500/30 rounded-lg transition-colors duration-200">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold transition-colors duration-200 text-base">
                          Hybrid
                        </h3>
                        <p className="text-xs text-warm-grey">Cash + M-Pesa</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-6">
                {paymentMethod === 'cash' && (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-maroon" />
                        <h3 className="text-lg font-semibold text-off-white">Cash Payment</h3>
                      </div>
                    </div>

                    <div className="bg-slate-grey/30 rounded-xl p-4 border border-light-grey/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-warm-grey">Amount Due:</span>
                        <span className="text-xl font-bold text-maroon">Ksh. {finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-warm-grey mb-3">
                        Amount Received from Customer
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-grey" />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={cashAmount}
                          onChange={e => setCashAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-grey/50 border border-light-grey/20 rounded-xl text-off-white placeholder-warm-grey focus:border-maroon focus:outline-none transition-colors duration-200"
                        />
                      </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div>
                      <label className="block text-sm font-medium text-warm-grey mb-3">
                        Quick Amounts
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {quickAmounts.map((amount, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCashAmount(amount.value.toString())}
                            className="p-2 bg-slate-grey/50 hover:bg-maroon/20 border border-light-grey/20 hover:border-maroon/30 rounded-lg transition-all duration-200 text-sm text-off-white hover:text-maroon"
                          >
                            {amount.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {parseFloat(cashAmount) >= finalTotal && cashAmount && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="font-medium text-green-400">Change Due</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          Ksh. {(parseFloat(cashAmount) - finalTotal).toFixed(2)}
                        </div>
                      </div>
                    )}

                    {parseFloat(cashAmount) < finalTotal && cashAmount && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="text-red-400">Insufficient amount received</span>
                        </div>
                      </div>
                    )}

                    <button
                      className="w-full py-3 bg-maroon hover:bg-maroon/80 disabled:bg-warm-grey disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors duration-200 flex items-center justify-center space-x-2 mt-4"
                      onClick={handleSubmit}
                      disabled={!isCashValid}
                    >
                      <CheckCircle size={18} />
                      <span>Complete Cash Sale</span>
                    </button>
                  </>
                )}

                {paymentMethod === 'mpesa' && (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-off-white">M-Pesa Payment</h3>
                      </div>
                    </div>
                    <div className="bg-slate-grey/30 rounded-xl p-4 border border-light-grey/20 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-warm-grey">Amount to Pay:</span>
                        <span className="text-xl font-bold text-green-400">Ksh{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-warm-grey disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors duration-200 flex items-center justify-center space-x-2 mt-4"
                      onClick={handleSubmit}
                      disabled={!isMpesaValid}
                    >
                      <CheckCircle size={18} />
                      <span>Complete M-Pesa Sale</span>
                    </button>
                  </>
                )}

                {paymentMethod === 'hybrid' && (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-off-white">Hybrid Payment</h3>
                      </div>
                    </div>
                    <div className="bg-slate-grey/30 rounded-xl p-4 border border-light-grey/20 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-warm-grey">Total Amount:</span>
                        <span className="text-xl font-bold text-blue-400">Ksh{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-grey mb-3">
                        Cash Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-grey" />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={cashAmount}
                          onChange={e => setCashAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-grey/50 border border-light-grey/20 rounded-xl text-off-white placeholder-warm-grey focus:border-blue-400 focus:outline-none transition-colors duration-200"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-warm-grey">M-Pesa Amount: </span>
                      <span className="text-lg font-bold text-green-400">Ksh{hybridMpesa > 0 ? hybridMpesa.toFixed(2) : '0.00'}</span>
                    </div>
                    <button
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-warm-grey disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors duration-200 flex items-center justify-center space-x-2 mt-4"
                      onClick={handleSubmit}
                      disabled={!isHybridValid}
                    >
                      <CheckCircle size={18} />
                      <span>Complete Hybrid Payment</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default CheckoutModal;