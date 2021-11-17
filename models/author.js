const mongoose = require('mongoose')
const Item = require('./item')

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

authorSchema.pre('remove', function(next) {
  Item.find({ author: this.id }, (err, items) => {
    if (err) {
      next(err)
    } else if (items.length > 0) {
      next(new Error('This user still has products'))
    } else {
      next()
    }
  })
})

module.exports = mongoose.model('Author', authorSchema)