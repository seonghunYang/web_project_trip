var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  product: { type: Schema.Types.ObjectId, ref: 'Product'},
  title: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  starpoint: {type: Number, default: 1},
  createdAt: {type: Date, default: Date.now},
  img: {type: String}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Comment = mongoose.model('Comment', schema);

module.exports = Comment;