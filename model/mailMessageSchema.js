var mongoose = require('mongoose')
var Schema = mongoose.Schema

var mailMessageSchema = new Schema({
  emailTitle: String,
  taggesAs: String,
  notTaggedAs: String,
  numberOfDays: Number,
  fName: String,
  lName: String,
  company: String,
  createMailMessage: String,
  ScheduledDate: Date,
  SendingDate: Date,
  SendingTo: Array
})

module.exports = mongoose.model('mailMessageSchema', mailMessageSchema)
