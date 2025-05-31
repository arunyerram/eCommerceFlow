// backend/models/Order.js
const mongoose = require('mongoose');

const CustomerInfoSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  zip: String,
});

const PaymentInfoSchema = new mongoose.Schema({
  cardNumber: String,
  expiry: String,
  cvv: String,
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  product: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: String,
    price: Number,
    imageUrl: String,
  },
  variant: String,
  quantity: Number,
  customerInfo: CustomerInfoSchema,
  paymentInfo: PaymentInfoSchema,
  status: { type: String, enum: ['approved', 'declined', 'error'], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
