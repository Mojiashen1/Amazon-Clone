var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Shipping = require('../models/shipping')
var Product = require('../models/product')
var Payment = require('../models/payment')
var stripe = require("stripe")(process.env.TEST_SECRET_KEY);
var Order = require('../models/order')
var Subproduct = require('../models/subproduct')

/* GET home page. */

router.use(function(req,res,next){
  if (req.user) {
    req.session.cart = req.session.cart || [];
    next();
  } else {
    res.redirect('/login');
  }
})

router.get('/shipping', function(req, res) {
  res.render('shipping');
});

router.post('/shipping', function(req, res, next) {
  var shipping = new Shipping({
    name: req.body.name,
    address1: req.body.address1,
    address2: req.body.address2,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    phone: req.body.phone,
    parent: req.user._id
  });

  shipping.save(function(err, info) {
    if(err) return next(err);
    req.user.defaultShipping = info._id;
    req.user.save(); //after you update user, you need to save the new user
    res.redirect('/payment')
  });
})

router.get('/', function(req, res, next) {
  // Insert code to look up all products
  // and show all products on a single page
  Product.find(function(err, products) {
    res.render('index', {
      products: products,
      number: req.session.cart.length
    })
  })
});

router.get('/payment', function(req, res) {
  res.render('payment')
})


router.post('/payment', function(req, res, next) {
  if (req.body.stripeToken && req.body.stripeEmail) {
    stripe.customers.create({
      description: 'Customer for test@example.com',
      source: req.body.stripeToken // obtained with Stripe.js
    }, function(err, customer) {
      console.log(err, customer);
      var payment = new Payment({
        stripeBrand: customer.sources.data[0].brand,
        stripeCustomerId: customer.id,
        stripeExpMonth: customer.sources.data[0].exp_month,
        stripeExpYear: customer.sources.data[0].exp_year,
        stripeLast4: customer.sources.data[0].last4,
        stripeSource: customer.sources.data[0].id,
        status: 0,
        parent: req.user._id
      })
      payment.save(function(err, pay) {
        //update the user model
        if (err) {
          return next(err);
        }
        req.user.defaultPayment = pay._id;
        req.user.save(function(err, user) {
          if (err) {
            return next(err);
          }
        res.redirect('/')
        });
      })
    });
  }
})

router.get('/checkout', function(req, res, next) {
  var totalCharge = 1000;
  User.findById(req.user._id).populate('defaultPayment defaultShipping').exec(function(err, user) {
    console.log(user);
    stripe.charges.create({
      amount: totalCharge,
      currency: "usd",
      customer: user.defaultPayment.stripeCustomerId, // obtained with Stripe.js
      description: "Charge for test@example.com"
    }, function(err, charge) {
      // asynchronously called
      if (err) {
        return next(err);
      }
      var order = new Order({
        timestamp: Date.now(),
        content: req.session.cart,
        user: req.user._id,
        paymentInfo: user.defaultPayment,
        shippingInfo: user.defaultShipping,
        status: 0,
        subtotal: totalCharge,
        total: totalCharge
      })
      order.save(function(err, orderInfo) {
        res.render('thankyou', {
          address: user.defaultShipping,
          items: req.session.cart.length, //need to change this
          total: orderInfo.total
        })
      })
    });
  })
})

router.get('/product/:id', function(req, res, next) {
  // Insert code to look up all a single product by its id
  // and show it on the page
  Product.findById(req.params.id, function(err, product) {
    Subproduct.find({parent: req.params.id}, function(err, subproducts) {
      res.render('product', {
        title: product.title,
        description: product.description,
        imageUri: product.imageUri,
        subproducts: subproducts
      })
    })
  })
});



router.get('/cart', function(req, res, next) {
  // Render a new page with our cart
  var cart = [];
  req.session.cart.forEach(function(id, index) {
    Subproduct.find({parent: id}, function(err, subproduct) {
      cart.push(product);
      if (index === req.session.cart.length -1) {
        res.render('cart', {
          products: cart
        });
      }
    })
    // Product.findById(id, function(err, product) {
    // })
  })
})

router.get('/cart/add/:id', function(req, res, next) {
  // Insert code that takes a product id (pid), finds that product
  // and inserts it into the cart array. Remember, we want to insert
  // the entire object into the array...not just the pid. Why? WHY?!?!
  Subproduct.findOne({parent: req.params.id}, function(err, product) {
    if (product.stock >= req.body.quantity) {
      req.session.cart.push(product._id);
      res.redirect('/');
    }
  })
})

router.get('/cart/delete/:id', function(req, res, next) {
  // Insert code that takes a product id (pid), finds that product
  // and removes it from the cart array. Remember that you need to use
  // the .equals method to compare Mongoose ObjectIDs.
  Subproduct.findOne({parent: req.params.id}, function(err, product) {
    for (var i = 0; i < req.session.cart.length; i ++) {
      if (product._id.equals(req.session.cart[i])) {
        req.session.cart.splice(i, 1);
        res.redirect('/')
        return;
      }
    }
  })
})

router.get('/cart/delete', function(req, res, next) {
  // Empty the cart array
  req.session.cart = [];
  res.redirect('/')
});


module.exports = router;
