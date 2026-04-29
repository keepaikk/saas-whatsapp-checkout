import { useState } from 'react';
import { ShoppingCart, X, Minus, Trash2 } from 'lucide-react';

interface CartItem {
  menuId: string;
  title: string;
  price: number;
  qty: number;
}

export default function StoreCart({
  cart,
  total,
  onCheckout,
  onClear,
}: {
  cart: CartItem[];
  total: number;
  onCheckout: () => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  if (cart.length === 0 && !open) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-[var(--primary-color)] text-white rounded-full p-4 shadow-lg hover:scale-105 transition"
      >
        <ShoppingCart size={24} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-full max-w-sm h-full shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Your Order</h2>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto space-y-3">
              {cart.map((i) => (
                <div key={i.menuId} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{i.title}</p>
                    <p className="text-xs text-gray-500">${i.price.toFixed(2)} x{i.qty}</p>
                  </div>
                  <span className="font-bold text-sm">${(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-lg font-bold mb-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onCheckout}
                  className="flex-1 bg-[var(--primary-color)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Checkout via WhatsApp
                </button>
                <button
                  onClick={onClear}
                  className="px-3 py-3 border rounded-lg hover:bg-gray-100 transition"
                  title="Clear cart"
                >
                  <Trash2 size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
