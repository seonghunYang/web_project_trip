var express = require('express');
var router = express.Router();
const Product = require('../models/product');
const Destination = require('../models/destination');
const Comment = require('../models/comment');
const catchErrors = require('../lib/async-error');
const Reservation = require('../models/reservation');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const mimetypes = {
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/png": "png"
};
const upload = multer({
  dest: 'tmp', 
  fileFilter: (req, file, cb) => {
    var ext = mimetypes[file.mimetype];
    if (!ext) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

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
    const destination = await Destination.findOne({name: term});
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
  res.render('products/index', {products: products, query: req.query});
}));

router.get('/destinations', catchErrors(async (req, res, next) => {
  const destinations = await Destination.find({});
  res.render('products/destination', {destinations: destinations});
}));

router.get('/destinations/:id/edit', catchErrors(async (req, res, next) => {
  const destination = await Destination.findById(req.params.id);
  res.render('admin/admin_destination_edit', {destination: destination});
}));

router.get('/:id', needAuth,catchErrors(async(req, res, next) => {
  const product = await Product.findById(req.params.id).populate('destination');
  const comments = await Comment.find({product: req.params.id}).populate('author');;
  product.numReads++;
  
  const reservation = await Reservation.findOne({booker: req.user._id});

  await product.save();
  res.render('products/detail_product',{product: product, comments: comments, reservation: reservation});
}));

router.get('/reservation/:id', needAuth, catchErrors(async(req, res, next) => {
  const product = await Product.findById(req.params.id);
  res.render('products/reservation', {product: product, reservation: {}});
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

router.put('/:id', needAuth, catchErrors(async(req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);

  reservation.name = req.body.name;
  reservation.phone = req.body.phone;
  reservation.bookDate = req.body.bookDate;
  reservation.price = req.body.totalPrice;
  reservation.personnel = req.body.personnel;

  await reservation.save();

  if(req.user.guide){
  req.flash('success', '수정 완료했습니다.');
  res.redirect(`/guide/${reservation.product}/userlist`);
  }
  else if(req.user.admin){
  req.flash('success', '수정 완료했습니다.');
  res.redirect(`/admin/${reservation.product}/reservations`);
  }
}));

router.post('/comment/:id', needAuth,
      upload.single('img'),
      catchErrors(async (req, res, next) => {

    var comment = new Comment({
      author: req.user._id,
      product: req.params.id,
      title: req.body.title,
      content: req.body.content,
      starpoint: req.body.starpoint
    });
    if (req.file) {
      const dest = path.join(__dirname, '../public/images/uploads/');  // 옮길 디렉토리
      console.log("File ->", req.file); // multer의 output이 어떤 형태인지 보자.
      const filename = comment.id + "/" + req.file.originalname;
      await fs.move(req.file.path, dest + filename);
      comment.img = "/images/uploads/" + filename;
    }
    await comment.save();

    const product = await Product.findById(req.params.id);
    product.numComments++;
    product.totalStarPoint= ((product.totalStarPoint*(product.numComments-1))+comment.starpoint)/product.numComments;
    await product.save();
    req.flash('success', '등록에 성공하셨습니다');
    res.redirect('back');
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
