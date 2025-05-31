// backend/models/Product.js
const mongoose = require('mongoose');
const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  inventory: { type: Number, required: true },
});
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: String,
  variants: [VariantSchema],
});
module.exports = mongoose.model('Product', ProductSchema);
