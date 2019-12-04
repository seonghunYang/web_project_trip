const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
//-todo 보안 토큰
var schema = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, index: true, unique: true, trim: true},
  password: {type: String},
  createdAt: {type: Date, default: Date.now},
  guide: {type: Boolean, default: false},
  admin: {type: Boolean, default: false}
}, { 
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.methods.generateHash = function(password) {
  return bcrypt.hash(password, 10); // return Promise
};

schema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password); // return Promise
};
schema.plugin(mongoosePaginate);
var User = mongoose.model('User', schema);

module.exports = User;
