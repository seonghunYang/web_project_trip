var express = require('express');
var router = express.Router();
const Guide = require('../models/guide');
const User = require('../models/user');
const catchErrors = require('../lib/async-error');
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

/* GET home page. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {guide: true};
  const users = await User.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit
  });
  res.render('guideInfo/index',{users: users, query: req.query});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {user_id: req.params.id};
  const guides = await Guide.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'product',
    page: page, limit: limit
  });

  const user = User.findById(req.params.id);
  res.render('guideInfo/detail_guideInfo',{guides: guides, user: user});
}));

module.exports = router;
