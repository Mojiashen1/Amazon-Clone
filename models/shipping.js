var mongoose = require('mongoose');

var shippingSchema = mongoose.Schema({
  name: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  zip: String,
  phone: String,
  status: Number,
  parent: mongoose.Schema.Types.ObjectId
})

module.exports = mongoose.model('Shipping', shippingSchema);
