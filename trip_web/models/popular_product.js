var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product'}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.plugin(mongoosePaginate);
var Popular_product = mongoose.model('Popular_product', schema);

module.exports = Popular_product;