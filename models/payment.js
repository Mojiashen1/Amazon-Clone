var mongoose = require('mongoose');

var paymentSchema = mongoose.Schema({
  stripeBrand: String,
  stripeCustomerId: String,
  stripeExpMonth: Number,
  stripeExpYear: Number,
  stripeLast4: Number,
  stripeSource: String,
  status: Number,
  parent: mongoose.Schema.Types.ObjectId
})

module.exports = mongoose.model('Payment', paymentSchema);
