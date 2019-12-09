const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();
const Product = require('../models/product');
const Whislist = require('../models/whislist');

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.post('/products/:id/like', catchErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next({status: 404, msg: 'Not exist question'});
  }
  var whislist = await Whislist.findOne({author: req.user._id, product: product._id});
  if (!whislist) {
    product.numLikes++;
    var whislist = new Whislist({
      author: req.user._id,
      product: product._id
    });
    await product.save();
    await whislist.save();
  }
  return res.json(product);
}));


module.exports = router;