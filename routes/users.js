const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Whislist = require('../models/whislist');
const Reservation = require('../models/reservation');
const catchErrors = require('../lib/async-error');
const Guide = require('../models/guide');
const Product = require('../models/product');
/* GET users listing. */


function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}
function validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  name = name.trim();
  email = email.trim();

  if (!name) {
    return 'Name is required.';
  }

  if (!email) {
    return 'Email is required.';
  }

  if (!form.password && options.needPassword) {
    return 'Password is required.';
  }

  if (form.password !== form.password_confirmation) {
    return 'Passsword do not match.';
  }

  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

router.get('/new', (req, res, next) => {
  res.render('users/new', {messages: req.flash()});
});

router.get('/:id/edit', needAuth, catchErrors(async(req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/edit',{user: user});
}));

router.get('/:id', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/index', {user: user});
}));

router.put('/:id', needAuth, catchErrors(async (req, res, next) => {
  const err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  const user = await User.findById({_id: req.params.id});
  if (!user) {
    req.flash('danger', 'Not exist user.');
    return res.redirect('back');
  }

  if (!await user.validatePassword(req.body.current_password)) {
    req.flash('danger', 'Current password invalid.');
    return res.redirect('back');
  }

  user.name = req.body.name;
  user.email = req.body.email;
  if (req.body.password) {
    user.password = await user.generateHash(req.body.password);
  }
  await user.save();
  if (req.user.admin){
  req.flash('success', 'Updated successfully.');
  res.redirect('/admin/users');
  }
  else{
  req.flash('success', 'Updated successfully.');
  res.redirect(`/users/${user._id}`);
  }
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Deleted Successfully.');
  res.redirect('/');
}));

router.post('/', catchErrors(async (req, res, next) => {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  var user = await User.findOne({email: req.body.email});
  console.log('USER???', user);
  if (user) {
    req.flash('danger', 'Email address already exists.');
    return res.redirect('back');
  }
  user = new User({
    name: req.body.name,
    email: req.body.email,
  });
  user.password = await user.generateHash(req.body.password);
  await user.save();
  req.flash('success', 'Registered successfully. Please sign in.');
  res.redirect('/');
}));

router.get('/whislist/:id', needAuth, catchErrors(async(req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {author: req.params.id};
  const whislists = await Whislist.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit,
    populate: 'product'
  });
  res.render('users/whislists',{whislists: whislists, query: req.query});
}));

router.get('/reservations/detail/:id', needAuth, catchErrors(async(req, res, next) =>{
  const reservation = await Reservation.findById(req.params.id).populate('booker').populate('product');
  res.render('users/detail_reservationInfo', {reservation: reservation});
}));

router.get('/reservations/:id/edit', needAuth, catchErrors(async(req, res, next) => {
  const reservation = await Reservation.findById(req.params.id).populate('product');
  const product = reservation.product;
  res.render('products/reservation_edit',{reservation: reservation, product: product});
}));

router.get('/reservations/:id', needAuth, catchErrors(async(req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {booker: req.params.id};
  const reservations = await Reservation.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit
  });
  res.render('users/reservationInfo',{reservations: reservations, query: req.query});
}));

router.delete('/whislist/:id', needAuth, catchErrors(async (req, res, next) => {
  await Whislist.findByIdAndRemove(req.params.id);
  req.flash('success', 'Successfully deleted');
  res.redirect('back');
}));

router.delete('/reservations/:id', needAuth, catchErrors(async (req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);
  const product = await Product.findById(reservation.product);
  await Reservation.findByIdAndRemove(req.params.id);
  req.flash('success', 'Successfully deleted');
  if(req.user.guide){
    res.redirect(`/guide/${product.id}/userlist`);
  }
  else if(req.user.admin){
    res.redirect(`/admin/${product.id}/reservations`);
  }
  else{
    res.redirect(`/users/reservations/${req.user._id}`);
  }
  
}));


module.exports = router;
