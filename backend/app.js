// backend/app.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --------- Add this line: import productRoutes  ---------
const productRoutes = require('./routes/productRoutes');

// Existing routes for orders:
const orderRoutes = require('./routes/orderRoutes');

// 1) Mount the products route on /api/products
app.use('/api/products', productRoutes);

// 2) Mount the existing orders route on /api/orders
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
