// backend/seedProducts.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB for seeding');

    // Remove all existing products
    await Product.deleteMany({});
    console.log('Existing products deleted.');

    // Insert multiple products, each with a placehold.co imageUrl
    const productsToInsert = [
      {
        title: 'Classic Sneakers',
        description: 'Stylish sneakers perfect for everyday wear.',
        price: 49.99,
        imageUrl: 'https://placehold.co/300x300?text=Sneakers',
        variants: [
          { name: 'Red', inventory: 20 },
          { name: 'Blue', inventory: 15 },
          { name: 'Green', inventory: 10 },
        ],
      },
      {
        title: 'Leather Wallet',
        description: 'Genuine leather wallet with multiple card slots.',
        price: 19.99,
        imageUrl: 'https://placehold.co/300x300?text=Wallet',
        variants: [
          { name: 'Brown', inventory: 30 },
          { name: 'Black', inventory: 25 },
        ],
      },
      {
        title: 'Sport Watch',
        description: 'Water-resistant digital watch with stopwatch features.',
        price: 89.99,
        imageUrl: 'https://placehold.co/300x300?text=Watch',
        variants: [
          { name: 'Black Strap', inventory: 12 },
          { name: 'White Strap', inventory: 8 },
        ],
      },
      {
        title: 'Backpack',
        description: 'Durable backpack suitable for travel and daily use.',
        price: 59.99,
        imageUrl: 'https://placehold.co/300x300?text=Backpack',
        variants: [
          { name: 'Grey', inventory: 18 },
          { name: 'Navy', inventory: 10 },
        ],
      },
    ];

    await Product.insertMany(productsToInsert);
    console.log('✅ Multiple products seeded successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  }
}

seed();
