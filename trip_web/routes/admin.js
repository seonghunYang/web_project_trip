var express = require('express');
var router = express.Router();
const catchErrors = require('../lib/async-error');
const User = require('../models/user');
const Destination = require('../models/destination');
const Product = require('../models/product');
const Reservation = require('../models/reservation');

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

router.get('/', needAuth, catchErrors(async (req, res, next) => {
  const users = await User.find({admin: true});
  res.render('admin/index', {users: users})
}));



router.get('/new', needAuth, catchErrors(async (req, res, next) => {
  res.render('admin/admin_add');
}));

router.get('/users', needAuth, catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {};
  const users = await User.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit
  });

  res.render('admin/admin_user', {users: users});
}));

router.get('/destination/new', needAuth, catchErrors(async (req, res, next) => {
  res.render('admin/admin_destination');
}));

router.get('/:id/reservations', needAuth, catchErrors(async(req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {product: req.params.id};
  const reservations = await Reservation.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit,
    populate: 'product'
  });
  const product = await Product.findById(req.params.id);
  res.render('admin/admin_reservation', {reservations: reservations, product: product});
}));

router.get('/:id/edit', needAuth, catchErrors(async(req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/edit',{user: user});
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
    admin: true
  });
  user.password = await user.generateHash(req.body.password);
  await user.save();
  req.flash('success', '관리자 계정을 생성했습니다');
  res.redirect('/admin');
}));

router.post('/destination', catchErrors(async (req, res, next) => {
  destination = new Destination({
    name: req.body.name,
    content: req.body.content
  });

  await destination.save();
  res.redirect("/products/destinations");
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Deleted Successfully.');
  res.redirect('back');
}));  


module.exports = router;
