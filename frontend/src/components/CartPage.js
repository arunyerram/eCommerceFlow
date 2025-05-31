
// frontend/src/components/CartPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateCartItem, removeFromCart } = useCart();

  // 1) Compute estimated total: sum of price × qty for all items
  const estimatedTotal = cartItems.reduce(
    (sum, ci) => sum + ci.product.price * ci.quantity,
    0
  );

  // 2) Handle Checkout button: navigate to /checkout, passing the entire cart
  const handleCheckout = () => {
    // We’ll pass cartItems to CheckoutPage via location.state
    // (The CheckoutPage will accept either a single‐item or multi‐item cart.)
    navigate('/checkout', { state: { cartItems } });
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <table className="w-full text-left mb-6">
        <thead>
          <tr>
            <th className="pb-2">Product</th>
            <th className="pb-2">Variant</th>
            <th className="pb-2">Unit Price</th>
            <th className="pb-2">Quantity</th>
            <th className="pb-2">Line Total</th>
            <th className="pb-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((ci) => (
            <tr key={`${ci.product.productId}-${ci.variant}`}>
              <td className="py-2">
                {ci.product.title}
              </td>
              <td className="py-2">{ci.variant}</td>
              <td className="py-2">${ci.product.price.toFixed(2)}</td>
              <td className="py-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateCartItem(ci.product.productId, ci.variant, ci.quantity - 1)
                    }
                    className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                    disabled={ci.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{ci.quantity}</span>
                  <button
                    onClick={() =>
                      updateCartItem(ci.product.productId, ci.variant, ci.quantity + 1)
                    }
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="py-2">
                ${(ci.product.price * ci.quantity).toFixed(2)}
              </td>
              <td className="py-2">
                <button
                  onClick={() => removeFromCart(ci.product.productId, ci.variant)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Estimated Total:</h2>
          <p className="text-2xl">${estimatedTotal.toFixed(2)}</p>
        </div>
        <button
          onClick={handleCheckout}
          className="bg-green-600 text-white py-3 px-6 rounded hover:bg-green-700 transition"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
