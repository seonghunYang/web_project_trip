var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  booker: { type: Schema.Types.ObjectId, ref: 'User'},
  product: { type: Schema.Types.ObjectId, ref: 'Product'},
  createdAt: {type: Date, default: Date.now},
  personnel: {type: Number, required: true},
  price: {type: Number, requred: true},
  bookDate: {type: Date}
}, { 
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Reservation = mongoose.model('Reservation', schema);

module.exports = Reservation;
