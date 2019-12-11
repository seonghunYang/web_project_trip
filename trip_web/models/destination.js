var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  name: { type: String, required: true}, //-아이디 지정
  content: {type: String}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.plugin(mongoosePaginate);
var Destination = mongoose.model('Destination', schema);

module.exports = Destination;