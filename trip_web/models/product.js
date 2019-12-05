var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  destination: { type: Schema.Types.ObjectId, ref: 'Destination'},
  title: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  img: {type: String},
  detail_content: {type: String}, //wysiwyg에티터로 받는거
  price: {type: Number}, // 인원에 따라 변하는 가격 생각
  numComments: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  numLikes: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},
  totalStartPoint: {type: Number, default: 1} //총합 별점
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Product = mongoose.model('Product', schema);

module.exports = Product;