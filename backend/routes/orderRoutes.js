// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderByNumber,
} = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/:orderNumber', getOrderByNumber);

module.exports = router;
