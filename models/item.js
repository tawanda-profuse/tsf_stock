const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  product_code: {
    type: Number,
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  updatedQuantity: {
    type: Number,
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  coverImage: {
    type: Buffer,
    required: true
  }, 
  coverImageType: {
    type: String,
    required: true
  },
  out_date: {
    type: Date
  },
  out_quantity: {
    type: Number,
    default: 0
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Author'
  }
})

itemSchema.virtual('coverImagePath').get(function() {
  if (this.coverImage != null && this.coverImageType != null) {
    return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
  }
})

module.exports = mongoose.model('Item', itemSchema)
