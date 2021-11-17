const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif', 'images/jfif'];
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// All Products Route
router.get('/', ensureAuthenticated, async (req, res) => {
  let query = Item.find();
  if (req.query.product_code != null && req.query.product_code != '') {
    // query = query.regex('product_code', new RegExp(req.query.product_code, 'i'))
    query = query.regex('product_code', new RegExp(req.query.product_code, '^\d+$'));
  }
  if (req.query.product_name != null && req.query.product_name != '') {
    query = query.regex('product_name', new RegExp(req.query.product_name, 'i'));
  }
  // if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
  //   query = query.lte('publishDate', req.query.publishedBefore)
  // }
  // if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
  //   query = query.gte('publishDate', req.query.publishedAfter)
  // }
  try {
    const items = await query.exec();
    res.render('items/index', {
      items: items,
      searchOptions: req.query
    });
  } catch {
    res.redirect('/');
  }
})

// New Product Route
router.get('/new', ensureAuthenticated, async (req, res) => { 
  renderNewPage(res, new Item())
})

// Create Product Route
router.post('/', async (req, res) => {
  const item = new Item({ 
    product_code: req.body.product_code,
    product_name: req.body.product_name,
    author: req.body.author,
    createdAt: new Date(req.body.createdAt),
    quantity: req.body.quantity,
    description: req.body.description
  })
  saveCover(item, req.body.cover)

  try {
    const newItem = await item.save()
    res.redirect(`items/${newItem.id}`)
  } catch {
    renderNewPage(res, item, true)
  }
})

// Show Products Route
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
                           .populate('author')
                           .exec()
    res.render('items/show', {
      item: item
    });
  } catch {
    res.redirect('/')
  }
})

// Edit Product Route
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    renderEditPage(res, item)
  } catch {
    res.redirect('/')
  }
})

// Update Product Route
router.put('/:id', async (req, res) => {
  let item

  try {
    item = await Item.findById(req.params.id)
    item.title = req.body.title
    item.author = req.body.author
    item.publishDate = new Date(req.body.publishDate)
    item.pageCount = req.body.pageCount
    item.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(item, req.body.cover);
    }
    await item.save()
    res.redirect(`/items/${item.id}`);
  } catch {
    if (item != null) {
      renderEditPage(res, item, true);
    } else {
      redirect('/')
    }
  }
})

// Delete Product Page
router.delete('/:id', async (req, res) => {
  let item
  try {
    item = await Item.findById(req.params.id)
    await item.remove()
    res.redirect('/items')
  } catch {
    if (item != null) {
      res.render('items/show', {
        item: item,
        errorMessage: 'Could not remove product'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, item, hasError = false) {
  renderFormPage(res, item, 'new', hasError)
}

async function renderEditPage(res, item, hasError = false) {
  renderFormPage(res, item, 'edit', hasError)
}

async function renderFormPage(res, item, form, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      item: item
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error updating product details'
      } else {
        params.errorMessage = 'Error creating product'
      }
    }
    res.render(`items/${form}`, params)
  } catch {
    res.redirect('/items')
  }
}

function saveCover(item, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    item.coverImage = new Buffer.from(cover.data, 'base64')
    item.coverImageType = cover.type
  }
}

module.exports = router