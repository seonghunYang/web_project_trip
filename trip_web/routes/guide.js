var express = require('express');
var router = express.Router();
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

router.get('/new', (req, res, next) => {
  res.render('guide/new');
});


module.exports = router;

