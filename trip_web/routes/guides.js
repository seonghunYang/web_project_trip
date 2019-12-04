var express = require('express');
var router = express.Router();
const Guide = require('../models/guide');
const User = require('../models/user');
const catchErrors = require('../lib/async-error');

/* GET home page. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {guide: true};
  const users = await User.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit
  });
  res.render('guides/index',{users: users, query: req.query});
}));
router.get('/:id', catchErrors(async (req, res, next) => {
  const guides = await Guide.find({user_id: req.params.id});
  res.render('guides/detail_guide',{guides: guides});
}));

module.exports = router;
