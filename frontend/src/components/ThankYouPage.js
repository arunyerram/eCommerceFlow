// frontend/src/components/ThankYouPage.js

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrder } from '../services/api';

const ThankYouPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // If orderNumber is "CART-SUCCESS", skip the fetch and just show a generic success.
    if (orderNumber === 'CART-SUCCESS') {
      setLoading(false);
      return;
    }

    // Otherwise, fetch the single order from the backend
    fetchOrder(orderNumber)
      .then((data) => {
        setOrder(data);       // data is the order document returned by /api/orders/:orderNumber
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch order:', err.response?.data || err);
        setErrorMessage(err.response?.data?.message || 'Unknown error');
        setLoading(false);
      });
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <p>Loading order details…</p>
      </div>
    );
  }

  // Case A: Cart checkout succeeded
  if (orderNumber === 'CART-SUCCESS') {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        <p className="mb-4">Your cart items have all been successfully placed.</p>
        <Link
          to="/"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Case B: There was an error fetching that single order
  if (errorMessage) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-red-600 mb-4">{errorMessage}</p>
        <Link
          to="/"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Case C: Successfully fetched a single order
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
      <p className="mb-2">
        <strong>Order Number:</strong> {order.orderNumber}
      </p>
      <h2 className="text-2xl font-semibold mb-2">Order Summary</h2>
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>
          <strong>{order.product.title}</strong> ({order.variant}) × {order.quantity}
        </p>
        <p className="mt-1">
          <strong>Unit Price:</strong> ${order.product.price.toFixed(2)}
        </p>
        <p className="mt-1">
          <strong>Total:</strong> ${(order.product.price * order.quantity).toFixed(2)}
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-2">Shipping Information</h2>
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <p>
          <strong>Name:</strong> {order.customerInfo.fullName}
        </p>
        <p>
          <strong>Email:</strong> {order.customerInfo.email}
        </p>
        <p>
          <strong>Phone:</strong> {order.customerInfo.phone}
        </p>
        <p>
          <strong>Address:</strong> {order.customerInfo.address}, {order.customerInfo.city},{' '}
          {order.customerInfo.state} {order.customerInfo.zip}
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-2">Payment Information</h2>
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <p>
          <strong>Card Number (last 4):</strong> **** **** **** {order.paymentInfo.cardNumber.slice(-4)}
        </p>
        <p>
          <strong>Expiry:</strong> {order.paymentInfo.expiry}
        </p>
        <p>
          <strong>CVV:</strong> *** (hidden for security)
        </p>
        <p>
          <strong>Status:</strong>{' '}
          {order.status === 'approved' ? (
            <span className="text-green-600">✅ Approved</span>
          ) : order.status === 'declined' ? (
            <span className="text-red-600">❌ Declined</span>
          ) : (
            <span className="text-yellow-600">⚠️ Error</span>
          )}
        </p>
      </div>

      <Link
        to="/"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default ThankYouPage;
