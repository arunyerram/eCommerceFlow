
// frontend/src/contexts/CartContext.js

import React, { createContext, useContext, useState } from 'react';

// 1) Create the Context
const CartContext = createContext();

// 2) Create a Provider component
export function CartProvider({ children }) {
  // cartItems = [ { product: { productId, title, price, imageUrl }, variant, quantity }, ... ]
  const [cartItems, setCartItems] = useState([]);

  // Add an item to cart. If same productId+variant exists, increment quantity instead:
  const addToCart = (item) => {
    setCartItems((prev) => {
      // Check if an existing entry has same productId & variant
      const index = prev.findIndex(
        (ci) =>
          ci.product.productId === item.product.productId &&
          ci.variant === item.variant
      );
      if (index !== -1) {
        // Create a new array where that entry’s quantity is bumped
        const updated = [...prev];
        updated[index].quantity += item.quantity;
        return updated;
      } else {
        // Otherwise, append a new entry
        return [...prev, item];
      }
    });
  };

  // Update the quantity of a cart item (by productId+variant). If newQty <= 0, remove it.
  const updateCartItem = (productId, variant, newQty) => {
    setCartItems((prev) => {
      return prev
        .map((ci) => {
          if (
            ci.product.productId === productId &&
            ci.variant === variant
          ) {
            return { ...ci, quantity: newQty };
          }
          return ci;
        })
        .filter((ci) => ci.quantity > 0);
    });
  };

  // Remove an item entirely by productId+variant
  const removeFromCart = (productId, variant) => {
    setCartItems((prev) =>
      prev.filter(
        (ci) =>
          !(
            ci.product.productId === productId &&
            ci.variant === variant
          )
      )
    );
  };

  // Clear entire cart (after successful checkout, for instance)
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateCartItem, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// 3) Convenience hook
export function useCart() {
  return useContext(CartContext);
}
