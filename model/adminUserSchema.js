var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')
var crypto = require('crypto')
var Schema = mongoose.Schema

var AdminUserSchema = new Schema({
  admin_first_name: {type: String, lowercase: true},
  admin_last_name: {type: String, lowercase: true},
  admin_username: {type: String, required: true, unique: true},
  admin_profile_pic: {type: String, default: ''},
  admin_email: {type: String, required: true},
  admin_password: {type: String, required: true},
  admin_resetPasswordToken: String,
  admin_resetPasswordExpires: Date,
  admin_created_at: Date,
  admin_updated_at: Date,
  admin_confirm: Boolean,
  admin_confirm_code: String,
  admin: Boolean
})

AdminUserSchema.methods.gravatar = function(size) {
  if (!this.size) size = 200;
  if (!this.admin_email) return 'https://gravatar.com/?s'+size+'&d=retro'
  var md5 = crypto.createHash('md5').update(this.admin_email).digest('hex')
  return 'https://gravatar.com/avatar/'+md5+'?s='+size+'&d=retro'
}

AdminUserSchema.pre('save', function(next) {
  var currentDate = new Date();
  //update the updated at
  this.admin_updated_at = currentDate
  //change the created at if it is for the first time
  if(!this.admin_created_at) {
    this.admin_created_at = currentDate
  }
  this.admin = false
  var user = this
  // Hash the Password
  if(!user.isModified('admin_password')) return next()
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(user.admin_password,salt,null, (err, hash) => {
      if (err) return err
      user.admin_password = hash
      next()
    })
  })
})

AdminUserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.admin_password)
}

module.exports = mongoose.model('AdminUser', AdminUserSchema)
