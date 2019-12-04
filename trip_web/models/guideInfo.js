var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;
//- todo 가이드가 등록하면
var schema = new Schema({
  guide_id: { type: Schema.Types.ObjectId, ref: 'User'},
  img: {type: String},
  introduce: {type: String},
  phone: {type: String},
  residence: {type: String}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var GuideInfo = mongoose.model('GuideInfo', schema);

module.exports = GuideInfo;