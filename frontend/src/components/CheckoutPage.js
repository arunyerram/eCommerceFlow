
// frontend/src/components/CheckoutPage.js

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // If location.state has cartItems, that is a full cart purchase.
  // Otherwise, look for product+variant+quantity for a single‐item direct buy.
  const { cartItems, product, variant, quantity } = location.state || {};

  // If neither a valid cart nor a valid single item, show a warning.
  useEffect(() => {
    if (!cartItems && (!product || !variant || !quantity)) {
      // Redirect to home after 2 seconds, or just show a message
      // But we cannot immediately return within useEffect; instead, we handle below in the render
    }
  }, [cartItems, product, variant, quantity]);

  // 1) Initialize form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  // 2) If missing both, show a warning
  if (!cartItems && (!product || !variant || !quantity)) {
    return (
      <div className="max-w-md mx-auto p-4">
        <p className="text-red-600">
          No items to checkout—please add items to your cart first.
        </p>
      </div>
    );
  }

  // 3) Input change handler
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 4) Expiry validation helper
  const isExpiryValid = (expiry) => {
    const [mm, yy] = expiry.split('/');
    if (!mm || !yy) return false;
    const month = parseInt(mm, 10);
    const year = parseInt('20' + yy, 10);
    if (isNaN(month) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;
    const now = new Date();
    if (year < now.getFullYear()) return false;
    if (year === now.getFullYear() && month <= now.getMonth() + 1) return false;
    return true;
  };

  // 5) Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 5.1) Determine transactionType from first card digit
    const firstDigit = formData.cardNumber.trim()[0];
    let transactionType = '1';
    if (firstDigit === '2') transactionType = '2';
    else if (firstDigit === '3') transactionType = '3';

    // 5.2) Validate expiry
    if (!isExpiryValid(formData.expiry)) {
      alert('Expiry date must be in the future (MM/YY).');
      return;
    }

    // 5.3) Build payload
    // If cartItems exists, we’re purchasing the entire cart
    // Otherwise, we’re purchasing a single item
    let orderData;
    if (cartItems) {
      // Build an array of lines for the cart purchase
      // But our backend schema only accepts ONE product/variant/qty per order,
      // so we have two choices:
      //   a) send multiple orders (one per line) — not ideal
      //   b) adjust your backend to accept an array of items per order
      // For simplicity, let’s assume we adjust backend to accept an array:
      //
      //   {
      //     cartItems: [
      //       { product: { productId,... }, variant, quantity },
      //       ...
      //     ],
      //     customerInfo: { ... },
      //     paymentInfo: { ... },
      //     transactionType
      //   }
      //
      // If you want to keep your existing single‐item logic, you must loop:
      //   cartItems.forEach(ci => createOrder({ ...ci, ...customer, ...payment }))
      //
      // Here, I’ll show “(a)” — sending multiple orders in series:
      try {
        for (const ci of cartItems) {
          const singleOrderData = {
            product: ci.product,
            variant: ci.variant,
            quantity: ci.quantity,
            customerInfo: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zip: formData.zip,
            },
            paymentInfo: {
              cardNumber: formData.cardNumber,
              expiry: formData.expiry,
              cvv: formData.cvv,
            },
            transactionType,
          };
          // Create each order one after another:
          await createOrder(singleOrderData);
        }
        // After all orders succeed, redirect to a “Cart Success” page or Thank You
        // For simplicity, send user to single ThankYou page with “CART‐SUCCESS” label:
        navigate(`/thankyou/CART-SUCCESS`);
        return;
      } catch (err) {
        console.error('Error processing cart order:', err.response?.data || err.message);
        alert('There was an error processing one of your cart items. Please check the console.');
        return;
      }
    } else {
      // Single‐item purchase (exactly as before)
      orderData = {
        product: {
          productId: product.productId,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
        },
        variant,
        quantity,
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
        paymentInfo: {
          cardNumber: formData.cardNumber,
          expiry: formData.expiry,
          cvv: formData.cvv,
        },
        transactionType,
      };

      try {
        const data = await createOrder(orderData);
        navigate(`/thankyou/${data.orderNumber}`);
        return;
      } catch (err) {
        console.error('Error from backend:', err.response?.data || err.message);
        alert('There was an error processing your order. Please check the console.');
        return;
      }
    }
  };

  // 6) Render the checkout form
  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      <form onSubmit={handleSubmit}>
        {/* CUSTOMER INFO */}
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          required
          value={formData.fullName}
          onChange={handleChange}
          className="border rounded p-2 my-2 w-full"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          className="border rounded p-2 my-2 w-full"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number (10 digits)"
          required
          pattern="[0-9]{10}"
          title="Enter a 10-digit phone number"
          value={formData.phone}
          onChange={handleChange}
          className="border rounded p-2 my-2 w-full"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          required
          value={formData.address}
          onChange={handleChange}
          className="border rounded p-2 my-2 w-full"
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          required
          value={formData.city}
          onChange={handleChange}
          className="border rounded p-2 my-2 w-full"
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          required
          value={formData.state}
          onChange={handleChange}
          className="border rounded p-2 my-2 w-full"
        />
        <input
          type="text"
          name="zip"
          placeholder="Zip Code"
          required
          value={formData.zip}
          onChange={handleChange}
          className="border rounded p-2 my-2 w-full"
        />

        {/* PAYMENT INFO */}
        <input
          type="text"
          name="cardNumber"
          placeholder="1XXXXXXXXXXXXXXX (1=Approve, 2=Decline, 3=Error)"
          required
          maxLength={16}
          pattern="[0-9]{16}"
          title="Card number must be exactly 16 digits"
          value={formData.cardNumber}
          onChange={handleChange}
          className="border rounded p-2 my-2 w-full"
        />
        <input
          type="text"
          name="expiry"
          placeholder="Expiry Date (MM/YY)"
          required
          pattern="(0[1-9]|1[0-2])\/\d{2}"
          title="Enter in MM/YY format"
          value={formData.expiry}
          onChange={handleChange}
          className="border rounded p-2 my-2 w-full"
        />
        <input
          type="text"
          name="cvv"
          placeholder="CVV (3 digits)"
          required
          maxLength={3}
          pattern="\d{3}"
          title="CVV must be exactly 3 digits"
          value={formData.cvv}
          onChange={handleChange}
          className="border rounded p-2 my-2 w-full"
        />

        {/* ORDER SUMMARY */}
        <div className="my-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-1">Order Summary</h3>
          {cartItems ? (
            // If cartItems exist, iterate over them
            cartItems.map((ci) => (
              <p key={`${ci.product.productId}-${ci.variant}`}>
                <strong>{ci.product.title}</strong> ({ci.variant}) × {ci.quantity} = $
                {(ci.product.price * ci.quantity).toFixed(2)}
              </p>
            ))
          ) : (
            // Single‐item summary
            <p>
              <strong>{product.title}</strong> ({variant}) × {quantity} = $
              {(product.price * quantity).toFixed(2)}
            </p>
          )}
          <p className="mt-2 font-bold">
            Total: $
            {(
              cartItems
                ? cartItems.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0)
                : product.price * quantity
            ).toFixed(2)}
          </p>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="bg-green-600 text-white rounded py-2 px-4 w-full hover:bg-green-700 transition"
        >
          Complete Purchase
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
