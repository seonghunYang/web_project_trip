var express = require('express');
var router = express.Router();
const Popular_product = require('../models/popular_product');
const catchErrors = require('../lib/async-error');

/* GET home page. */
router.get('/', catchErrors(async(req, res, next) =>{
  const popular_products = await Popular_product.find({}).populate('product');
  res.render('index',{popular_products: popular_products});
}));

module.exports = router;
