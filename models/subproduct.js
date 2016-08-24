var mongoose = require('mongoose');

var subproductSchema = mongoose.Schema({
  title: String,
  price : Number,
  stock: Number,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }
})

module.exports = mongoose.model('Subproduct', subproductSchema);
