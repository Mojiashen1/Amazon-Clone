var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
mongoose.connect(connect);
var Product = require("./models/product");
var products = require('./seed/products.json').product;

console.log(products);

products.forEach(function(product){
	var pro = new Product(product)
	pro.save(function(err){
		if(err){
			console.log(err)
		} else {
			console.log("saved product");
		}
	})
})
