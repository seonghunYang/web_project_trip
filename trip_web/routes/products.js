var express = require('express');
var router = express.Router();
const Product = require('../models/product');
const Destination = require('../models/destination');
const Comment = require('../models/comment');
const catchErrors = require('../lib/async-error');
/* GET home page. */
//search 전체 여행지 통로
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    const destination = await Destination.findone({name: term});
    if (destination){
      query = {$or: [
        {title: {'$regex': term, '$options': 'i'}},
        {content: {'$regex': term, '$options': 'i'}},
        {destination: {'$regex': destination.id, 'options': 'i'}}
    ]};}
    else{
      query = {$or: [
        {title: {'$regex': term, '$options': 'i'}},
        {content: {'$regex': term, '$options': 'i'}}
      ]};
    }
  }
  const products = await Product.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'destination', 
    page: page, limit: limit
  });
  res.render('products/index', {products: products, term: term, query: req.query});
}));

router.get('/destinations/:id', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {destination: req.params.id};

  const products = await Product.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'destination', 
    page: page, limit: limit
  });
  res.render('products/index', {products: products, term: term, query: req.query});
}));

router.get('/destinations', catchErrors(async (req, res, next) => {
  const destinations = Destination.find({});
  res.render('products/destination', {destinations: destinations});
}));

router.get('/:id', catchErrors(async(req, res, next) => {
  const product = Product.findById(req.params.id);
  const comments = Comment.findone({product: req.parms.id});
  res.render('products/detail_product',{product: product, comments: comments});
}));
module.exports = router;
