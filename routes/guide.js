var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const GuideInfo = require('../models/guideInfo');
const Guide = require('../models/guide');
const User = require('../models/user');
const Product = require('../models/product');
const Reservation = require('../models/reservation');
const catchErrors = require('../lib/async-error');
const Destination = require('../models/destination');
const Whislist = require('../models/whislist');

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
function isGuide(req, res, next){
  if (req.user.guide){
    next();
  }else{
    req.flash('danger','가이드로 가입해주세요!');
    res.redirect('/guide/new');
  }
}

router.get('/new', needAuth, catchErrors(async (req, res, next) => {
  res.render('guide/new');
}));

router.get('/register', needAuth, isGuide, catchErrors(async (req, res, next) => {
  res.render('guide/register');
}));

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('destination');
  res.render('guide/edit',{product: product});
}));

router.get('/:id/userlist', needAuth, isGuide, catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {product: req.params.id};
  const reservations = await Reservation.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit,
    populate: 'product'
  });
  const product = await Product.findById(req.params.id);
  res.render('guide/userlist',{reservations: reservations, product: product});
}));

router.get('/:id', needAuth, isGuide, catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {author: req.params.id};
  const products = await Product.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit,
    populate: 'destination'
  });
  res.render('guide/index',{products: products});
}));

router.put('/:id', needAuth, isGuide,catchErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    const destination = await Destination.findOne({name: req.body.destination});
    if(!destination){
      req.flash('danger','여행지를 다시 입력해주세요' );
      res.redirect('back');
    }
    product.title = req.body.title;
    product.content = req.body.content;
    product.destination = destintaion.id;
    product.price = req.body.price;
    product.course = req.body.course;
    product.detail_content = req.body.detail_content;
    product.meeting = req.body.meeting;
    await product.save();

    req.flash('success','수정되었습니다');
    res.redirect(`/guide/${req.user._id}`);
  }));

router.delete('/:id', needAuth, isGuide, catchErrors(async (req, res, next) => {
  const product = await Product.findOneAndRemove({_id: req.params.id});
  const guide = await Guide.findOneAndRemove({product: req.params.id});
  const whislist = await Whislist.deleteMany({product: req.params.id});
  const reservation = await Reservation.deleteMany({product: req.params.id});
  
  req.flash('success', '삭제했습니다.');
  res.redirect(`/guide/${req.user._id}`);
}));  

router.post('/', needAuth,
      upload.single('img'), 
      catchErrors(async (req, res, next) => {
  var guideInfo = new GuideInfo({
    guide_id: req.user._id,
    introduce: req.body.introduce,
    phone: req.body.phone,
    residence: req.body.residence
  });
  if (req.file) {
    const dest = path.join(__dirname, '../public/images/uploads/');  // 옮길 디렉토리
    console.log("File ->", req.file); // multer의 output이 어떤 형태인지 보자.
    const filename = guideInfo.id + "/" + req.file.originalname;
    await fs.move(req.file.path, dest + filename);
    guideInfo.img = "/images/uploads/" + filename;
  }
  await guideInfo.save();

  const user = req.user;
  user.guide = true;
  await user.save();

  req.flash('success', '트립고와 함께하게 된 것을 환영합니다!');
  res.redirect('/');
}));


router.post('/register', needAuth, isGuide,
      upload.single('img'),
      catchErrors(async (req, res, next) => {
    const destination = await Destination.findOne({name: req.body.destination});
    if(!destination){
      req.flash('danger','여행지를 다시 입력해주세요' );
      res.redirect('back');
    }
    var product = new Product({
    author: req.user._id,
    title: req.body.title,
    content: req.body.content,
    destination: destination.id,
    price: req.body.price,
    course: req.body.course,
    detail_content: req.body.detail_content,
    meeting: req.body.meeting
    });
    if (req.file) {
      const dest = path.join(__dirname, '../public/images/uploads/');  // 옮길 디렉토리
      console.log("File ->", req.file); // multer의 output이 어떤 형태인지 보자.
      const filename = product.id + "/" + req.file.originalname;
      await fs.move(req.file.path, dest + filename);
      product.img = "/images/uploads/" + filename;
    }
    await product.save();

    var guide = new Guide({
      user_id: req.user._id,
      product: product._id
    });   

    await guide.save();
    req.flash('success', '등록에 성공하셨습니다');
    res.redirect(`/guide/${req.user._id}`);
}));



module.exports = router;

