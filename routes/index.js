const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Item = require('../models/item')

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => {
    res.render('landing', { layout: 'landing' }); // I decided to use this because it disables the layouts from the landing page
});

// Landing Page
router.get('/index', forwardAuthenticated, (req, res) => {
  res.render('index', { layout: 'index' }); // I decided to use this because it disables the layouts from the index page
});  

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  let items
  try {
    items = await Item.find().sort({ createdAt: 'desc' }).limit(10).exec()
  } catch {
    items = []
  }
  res.render('dashboard', {
    name: req.user.name,
    items: items
  })
});

module.exports = router;



