var express = require('express');
var router = express.Router();
const Product = require('../models/product');
const Destination = require('../models/destination');
const Comment = require('../models/comment');
const catchErrors = require('../lib/async-error');
const Reservation = require('../models/reservation');
/* GET home page. */
//search 전체 여행지 통로

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    const destination = await Destination.find({name: term});
    if (destination){
      query = {$or: [
        {title: {'$regex': term, '$options': 'i'}},
        {content: {'$regex': term, '$options': 'i'}},
        {destination: destination.id}
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
  const destinations = await Destination.find({});
  res.render('products/destination', {destinations: destinations});
}));

router.get('/:id', catchErrors(async(req, res, next) => {
  const product = await Product.findById(req.params.id);
  const comments = await Comment.find({product: req.params.id}).populate('author');;
  res.render('products/detail_product',{product: product, comments: comments});
}));

router.get('/reservation/:id', needAuth, catchErrors(async(req, res, next) => {
  const product = await Product.findById(req.params.id);
  res.render('products/reservation', {product: product, reservation: {}});
}));

router.put('/:id', needAuth, catchErrors(async(req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);

  reservation.name = req.body.name;
  reservation.phone = req.body.phone;
  reservation.bookDate = req.body.bookDate;
  reservation.price = req.body.totalPrice;
  reservation.personnel = req.body.personnel;

  await reservation.save();
  req.flash('success', '수정 완료했습니다.');
  res.redirect(`/users/reservations/${req.user._id}`);
}));

router.post('/:id', needAuth, catchErrors(async(req, res, next) => {
  var reservation = new Reservation({
    booker: req.user._id,
    product: req.params.id,
    personnel: req.body.personnel,
    price: req.body.totalPrice,
    bookDate: req.body.bookDate,
    phone: req.body.phone,
    name: req.body.name
  });
  await reservation.save();
  req.flash('success', '예약 완료했습니다.');
  res.redirect(`/users/reservations/${req.user._id}`);
}));

module.exports = router;
