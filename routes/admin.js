var express = require('express');
var router = express.Router();
const catchErrors = require('../lib/async-error');
const User = require('../models/user');
const Destination = require('../models/destination');
const Product = require('../models/product');
const Reservation = require('../models/reservation');
const Popular_product = require('../models/popular_product');
const GuideInfo = require('../models/guideInfo');
const Whislist = require('../models/whislist');
const Comment = require('../models/comment');
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

router.get('/destination/:id/edit',needAuth, catchErrors(async (req, res, next) => {
  const destination = await Destination.findById(req.params.id);
  res.render('admin/admin_destination_edit', {destination: destination});
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

router.get('/:id/popular', needAuth, catchErrors(async(req, res, next) => {
  const popular_product1 = await Popular_product.findOne({product: req.params.id});
  
  if(!popular_product1){
    var popular_product = new Popular_product({
      product: req.params.id
    });
    await popular_product.save();
    req.flash('success', "추천상품에 등록했습니다");
    res.redirect('back');
  }
  else{
    req.flash('danger', "이미 추천 상품에 있습니다.");
    res.redirect('back');
  }

}));

router.put('/destination/:id', needAuth, catchErrors(async(req, res, next) => {
  const destination = await Destination.findById(req.params.id);

  destination.name = req.body.name;
  destination.content = req.body.name;

  await destination.save();

  req.flash('success',"수정했습니다");
  res.redirect(`/products/destinations`);

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

router.delete('/:id/popular', needAuth, catchErrors(async (req, res, next) => {
  const popular_product = await Popular_product.findOneAndRemove({product: req.params.id});
  req.flash('success', 'Deleted Successfully.');
  res.redirect('back');
}));  

router.delete('/destination/:id', needAuth, catchErrors(async (req, res, next) => {
  const product = await Product.findOne({destination: req.params.id});
  if (!product){
    const destination = await Destination.findByIdAndRemove(req.params.id);
    req.flash('danger','등록된 상품이 있습니다.')
    res.redirect('/products/destinations');
  }
  else{
    req.flash('success', '삭제했습니다.');
    res.redirect('/products/destinations');
  }
})); 

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findOneAndRemove({_id: req.params.id});
  const guideInfo = await GuideInfo.findOneAndRemove({guide_id: req.params.id});
  const guide = await Guide.deleteMany({user_id: req.params.id});
  const reservation = await Reservation.findOneAndRemove({booker: req.params.id});
  const whislist = await Whislist.deleteMany({author: req.params.id});
  const comment = await Comment.deleteMany({author: req.params.id});
  req.flash('success', 'Deleted Successfully.');
  res.redirect('back');
}));  


module.exports = router;
