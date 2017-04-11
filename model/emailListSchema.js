var mongoose = require('mongoose')
var Schema = mongoose.Schema

var emailListSchema = new Schema({
  from: String,
  to: String,
  mailMessage: String,
  dateOfSending: Date,
  subject: String
})

module.exports = mongoose.model('emailListSchema', emailListSchema)
