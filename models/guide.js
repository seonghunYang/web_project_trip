var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User'},
  product: { type: Schema.Types.ObjectId, ref: 'Product'}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.plugin(mongoosePaginate);
var Guide = mongoose.model('Guide', schema);

module.exports = Guide;