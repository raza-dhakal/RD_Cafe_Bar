require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./src/models/menu.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    const count = await MenuItem.countDocuments();
    if (count > 0) {
      console.log('Already seeded:', count, 'items');
      process.exit();
    }

    const items = [
      { emoji:'☕', name:'Signature Espresso', description:'Double shot single-origin', price:180, category:'coffee' },
      { emoji:'🥛', name:'Flat White', description:'Micro-foam milk over ristretto', price:250, category:'coffee' },
      { emoji:'🧊', name:'Cold Brew Tonic', description:'18-hour cold brew over tonic', price:320, category:'coffee' },
      { emoji:'🍵', name:'Matcha Latte', description:'Ceremonial grade matcha oat milk', price:290, category:'coffee' },
      { emoji:'🌙', name:'Moon Milk Coffee', description:'Turmeric ashwagandha honey espresso', price:350, category:'coffee' },
      { emoji:'☁️', name:'Dalgona Cloud', description:'Whipped coffee cloud chilled milk', price:280, category:'coffee' },
      { emoji:'🍹', name:'RD Signature', description:'House rum passionfruit ginger lime', price:580, category:'bar' },
      { emoji:'🥃', name:'Smoked Old Fashioned', description:'Bourbon cherry bitters smoke', price:650, category:'bar' },
      { emoji:'🫧', name:'Espresso Martini', description:'Vodka Kahlua fresh espresso', price:620, category:'bar' },
      { emoji:'🌿', name:'Garden Gimlet', description:'Gin cucumber elderflower lime', price:550, category:'bar' },
      { emoji:'🍓', name:'Berry Bliss Mocktail', description:'Mixed berry shrub rosemary soda', price:320, category:'bar' },
      { emoji:'🥐', name:'Butter Croissant', description:'Freshly baked flaky house jam', price:180, category:'food' },
      { emoji:'🥗', name:'Avocado Toast', description:'Sourdough smashed avo feta chili', price:350, category:'food' },
      { emoji:'🍰', name:'Basque Cheesecake', description:'Burnt creamy caramelised', price:280, category:'food' },
      { emoji:'🥪', name:'Club Sandwich', description:'Chicken bacon egg lettuce tomato', price:420, category:'food' },
      { emoji:'🍫', name:'Chocolate Fondant', description:'Warm lava cake vanilla ice cream', price:380, category:'food' },
    ];

    await MenuItem.insertMany(items);
    console.log('✅ Seeded', items.length, 'menu items successfully!');
    process.exit();
  })
  .catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  });
