var mongoose = require('mongoose')
var Schema = mongoose.Schema

var StagesSchema = new Schema({
  stage: {type: String, required: true},
  order: Number,
  created_by: {type: Schema.Types.ObjectId, ref: 'AdminUserSchema'}
})

module.exports = mongoose.model('StagesSchema', StagesSchema)
