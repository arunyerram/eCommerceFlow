// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Helper to generate a unique order number:
const generateOrderNumber = () => {
  return 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  const {
    product, // { productId, title, price, imageUrl }
    variant,
    quantity,
    customerInfo,
    paymentInfo,
    transactionType, // "1" | "2" | "3"
  } = req.body;

  try {
    // 1) Find the product in DB to check inventory and lock it
    const dbProduct = await Product.findById(product.productId);
    if (!dbProduct) {
      return res.status(400).json({ message: 'Product not found' });
    }

    // 2) Determine transaction status from transactionType
    let status = 'approved';
    if (transactionType === '2') status = 'declined';
    else if (transactionType === '3') status = 'error';

    // 3) If approved, check inventory and decrement
    if (status === 'approved') {
      const variantObj = dbProduct.variants.find((v) => v.name === variant);
      if (!variantObj) {
        return res.status(400).json({ message: 'Variant not found' });
      }
      if (variantObj.inventory < quantity) {
        return res.status(400).json({ message: 'Insufficient inventory' });
      }
      variantObj.inventory -= quantity;
      await dbProduct.save();
    }

    // 4) Create an order document
    const orderNumber = generateOrderNumber();
    const newOrder = new Order({
      orderNumber,
      product: {
        productId: product.productId,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      variant,
      quantity,
      customerInfo,
      paymentInfo,
      status,
    });
    await newOrder.save();

    // 5) Send email based on status
    if (status === 'approved') {
      // Approved template
      const subject = `Order Confirmation — ${orderNumber}`;
      const html = `
        <h1>Thank you for your purchase, ${customerInfo.fullName}!</h1>
        <p>Order Number: ${orderNumber}</p>
        <p>Product: ${product.title} (${variant}) × ${quantity}</p>
        <p>Total: $${(product.price * quantity).toFixed(2)}</p>
        <h2>Shipping Information</h2>
        <p>${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}</p>
        <p>If you have any questions, reply to this email.</p>
      `;
      await sendEmail(customerInfo.email, subject, html);
    } else if (status === 'declined') {
      // Declined template
      const subject = `Order Declined — ${orderNumber}`;
      const html = `
        <h1>Sorry, ${customerInfo.fullName}!</h1>
        <p>Your transaction was <strong>DECLINED</strong>.</p>
        <p>Order Number: ${orderNumber}</p>
        <p>Please verify your payment details and try again.</p>
      `;
      await sendEmail(customerInfo.email, subject, html);
    } else {
      // Gateway error template
      const subject = `Payment Error — ${orderNumber}`;
      const html = `
        <h1>Oops, ${customerInfo.fullName}!</h1>
        <p>There was an error processing your payment.</p>
        <p>Order Number: ${orderNumber}</p>
        <p>Please try again later or contact support.</p>
      `;
      await sendEmail(customerInfo.email, subject, html);
    }

    // 6) Return the order number to the frontend
    res.status(201).json({ orderNumber });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// GET /api/orders/:orderNumber
exports.getOrderByNumber = async (req, res) => {
  const { orderNumber } = req.params;
  try {
    const order = await Order.findOne({ orderNumber }).lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};
