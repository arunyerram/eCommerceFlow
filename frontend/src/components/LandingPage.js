
// frontend/src/components/LandingPage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllProducts } from '../services/api';
import { useCart } from '../contexts/CartContext'; // <-- import useCart

const LandingPage = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart(); // get addToCart + cartItems if you want to show a badge

  // State: array of products fetched from the backend
  const [products, setProducts] = useState([]);

  // State: track selected variant + quantity per product ID
  // Structure: { [productId]: { variant: 'Red', quantity: 1 } }
  const [selections, setSelections] = useState({});

  useEffect(() => {
    // 1) Fetch all products on mount
    const loadProducts = async () => {
      try {
        const data = await fetchAllProducts();
        setProducts(data);

        // 2) Initialize default variant+quantity for each product
        const initial = {};
        data.forEach((prod) => {
          initial[prod._id] = {
            variant: prod.variants[0].name,
            quantity: 1,
          };
        });
        setSelections(initial);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    loadProducts();
  }, []);

  // Update either 'variant' or 'quantity' for a given productId
  const handleSelectionChange = (productId, field, value) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // “Add to Cart” button handler
  const handleAddToCart = (product) => {
    const { variant, quantity } = selections[product._id];
    // Build the exact “item” payload
    const item = {
      product: {
        productId: product._id,
        title: product.title,
        price: product.price,
        imageUrl: generatePlaceholderUrl(product.title),
      },
      variant,
      quantity,
    };
    addToCart(item);
    // Optionally show a toast or brief message, e.g. “Added to cart!”
  };

  // Utility: generate a 300×300 placeholder with the product title text
  const generatePlaceholderUrl = (title) => {
    const textParam = encodeURIComponent(title);
    return `https://placehold.co/300x300?text=${textParam}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header with a link to Cart */}
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Our Products</h1>
        <button
          onClick={() => navigate('/cart')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Cart ({cartItems.length})
        </button>
      </div>

      {products.length === 0 ? (
        <p>Loading products…</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {products.map((product) => {
            // Generate placeholder URL:
            const placeholderUrl = generatePlaceholderUrl(product.title);

            // Get this product’s selected variant & quantity
            const { variant, quantity } = selections[product._id] || {
              variant: product.variants[0].name,
              quantity: 1,
            };

            return (
              <div
                key={product._id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <img
                  src={placeholderUrl}
                  alt={product.title}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    backgroundColor: '#f0f0f0',
                  }}
                />

                <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {product.title}
                  </h2>
                  <p style={{ color: '#555', marginBottom: '0.75rem', flexGrow: 1 }}>
                    {product.description}
                  </p>
                  <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.75rem' }}>
                    ${product.price.toFixed(2)}
                  </p>

                  {/* Variant Selector */}
                  <label style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Variant:</label>
                  <select
                    value={variant}
                    onChange={(e) =>
                      handleSelectionChange(product._id, 'variant', e.target.value)
                    }
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      width: '100%',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {product.variants.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} (In stock: {v.inventory})
                      </option>
                    ))}
                  </select>

                  {/* Quantity Selector */}
                  <label style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Quantity:</label>
                  <input
                    type="number"
                    min={1}
                    max={product.variants.find((v) => v.name === variant)?.inventory || 1}
                    value={quantity}
                    onChange={(e) =>
                      handleSelectionChange(
                        product._id,
                        'quantity',
                        Math.max(1, Number(e.target.value))
                      )
                    }
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      width: '100%',
                      marginBottom: '1rem',
                    }}
                  />

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="mt-auto bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
