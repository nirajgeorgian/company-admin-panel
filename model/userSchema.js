var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')
// mongoose.Promise = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
  user_first_name: {type: String},
  user_last_name: {type: String},
  user_username: {type: String},
  user_email: {type: String},
  user_created_at: Date,
  user_updated_at: Date,
  user_tagList: [
    {
      id: {type: Schema.Types.ObjectId, ref: 'TagsSchema'},
      name: String
    }
  ],
  user_tag_mail_sended: Boolean,
  user_last_mail_sended: Date,
  user_tasks: [
    {
      created_by: String,
      date: Date,
      subject: String,
      task: {type: String, required: true}
    }
  ],
  user_admin_email: [
    {
      admin_name: String,
      message: String,
      subject: String,
      dateOfSending: Date,
      from: String
    }
  ],
  user_stages: [
    {
      created_by: String,
      stage_id: {type: Schema.Types.ObjectId, ref: 'StagesSchema'},
      created_at: Date,
      created_for_date: Date
    }
  ]
})


module.exports = mongoose.model('UserSchema', UserSchema)
