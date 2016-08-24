var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
  timestamp: String,
  content: String,
  user: String,
  paymentInfo: String,
  shippingInfo: String,
  status: Number,
  subtotal: Number,
  total: Number
})

module.exports = mongoose.model('Order', orderSchema);
