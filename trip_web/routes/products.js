var express = require('express');
var router = express.Router();
const Product = require('../models/product');
const Destination = require('../models/destination');
const Comment = require('../models/comment');
const catchErrors = require('../lib/async-error');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
