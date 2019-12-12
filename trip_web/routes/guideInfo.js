var express = require('express');
var router = express.Router();
const Guide = require('../models/guide');
const User = require('../models/user');
const catchErrors = require('../lib/async-error');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const GuideInfo = require('../models/guideInfo');
const Product = require('../models/product');

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

/* GET home page. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {};
  const guideInfos = await GuideInfo.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'guide_id',
    page: page, limit: limit
  });
  res.render('guideInfo/index',{guideInfos: guideInfos, query: req.query});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {author: req.params.id};
  const products = await Product.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'destination',
    page: page, limit: limit
  });

  const user = User.findById(req.params.id);
  res.render('guideInfo/detail_guideInfo',{products: products, user: user});
}));

module.exports = router;
