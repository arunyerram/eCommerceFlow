
// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import LandingPage from './components/LandingPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import ThankYouPage from './components/ThankYouPage';

function App() {
  return (
    <Router>
      {/*  Wrap your entire routes tree in CartProvider  */}
      <CartProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thankyou/:orderNumber" element={<ThankYouPage />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;
