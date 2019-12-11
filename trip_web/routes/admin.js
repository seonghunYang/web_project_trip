var express = require('express');
var router = express.Router();
const catchErrors = require('../lib/async-error');
const User = require('../models/user');
const Destination = require('../models/destination');

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

router.get('/destination/new', needAuth, catchErrors(async (req, res, next) => {
  res.render('admin/admin_destination');
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

module.exports = router;
