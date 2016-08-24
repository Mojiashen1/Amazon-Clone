var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')

var userSchema = mongoose.Schema({
  username: String, //this is a phone number
  password: String,
  facebookId: String,
  defaultShipping: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipping'
  },
  verification: Number,
  defaultPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
})

userSchema.plugin(findOrCreate)

module.exports = mongoose.model('User', userSchema);
