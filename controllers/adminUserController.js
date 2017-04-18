var crypto = require('crypto')
var async = require('async')
var passport = require('passport')
var passportConfig = require('../config/passport')
var nodemailer = require('nodemailer')
var sgTransport = require('nodemailer-sendgrid-transport')
var ejs = require('ejs')
var fs = require('fs')
var path = require('path')
var moment = require('moment')
var singleUserModel = require('../model/userSchema')
var secret = require('../config/secret')
const AdminUserSchema = require('../model/adminUserSchema')
const EmailSchema = require('../model/mailModel')
const TagsSchema = require('../model/tagsModel')
var StageSchema = require('../model/stagesModel')
var mailMessageSchema = require('../model/mailMessageSchema')
var emailListSchema = require('../model/emailListSchema')
var multer = require('multer')
var csv = require('ya-csv');
var upload = multer({
  dest: "../uploads/",
  fileFilter: function(req, res, cb) {
    cb(null, true)
  }
}).single('file')

var smtpTransport = nodemailer.createTransport(sgTransport(secret.mailOption))

module.exports = {
  signupPost:(req, res, next) => {
    var adminUser = new AdminUserSchema()
    var mail = new EmailSchema()
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex')
          done(err, token)
        })
      },
      function(token, done) {
        adminUser.admin_first_name = req.body.first_name
        adminUser.admin_last_name = req.body.last_name
        adminUser.admin_email = req.body.email
        adminUser.admin_password = req.body.password
        adminUser.admin_username = req.body.username
        adminUser.admin_confirm = false
        adminUser.admin_profile_pic = adminUser.gravatar()

        AdminUserSchema.findOne({admin_email: req.body.email}, (err, adminExists) => {
          if (adminExists) {
            req.flash('errors',"Admin with that email address already exists")
            return res.redirect('/admin/signup')
          } else {
            mail.save(function(err, data) {
              if (err) return next(err)
              adminUser.admin_confirm_code = token
              adminUser.save((err, user) => {
                done(err, token, user)
              })
            })
          }
        })
      },
      function(token, user,done) {
        var emailTempRaw = fs.readFileSync('templates/userSignup.ejs', 'utf-8')
        var address = 'http://'+req.headers.host+'/activate/'+ token
        var mailOptions = {
          to: adminUser.admin_email,
          from: 'admin@nirajgeorgian.me',
          subject: 'Please confirm your account to get started with us.',
          // text: 'Please click on the link below to activate your account \n'+
          // 'http://'+req.headers.host+'/activate/'+ token+ '\n\n'
          html: ejs.render(emailTempRaw, {address: address})
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          // res.redirect('/login')
          var emailClient = new EmailSchema()
          emailClient.created_by = adminUser.admin_email
          emailClient.created_by_id = adminUser._id
          emailClient.save((err) => {
            if (err) return next(err)
            req.flash("success", "An confirmation email was sended to "+ adminUser.admin_email+".")
            done(err, 'done')
          })
        })
      }
    ], function(err) {
      if (err) return next(err)
      res.redirect('/admin/signup')
    })
  },
  signupGet:(req, res) => {
    res.render('forms/signup', {
      errors: req.flash('errors'),
      success: req.flash('success')
    })
  },
  loginPost: passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/admin/login',
    failureFlash: true
  }),
  loginGet:(req, res) => {
    res.render('forms/login', {
      message: req.flash('loginMessage'),
      success: req.flash('success'),
      info: req.flash('info')
    })
  },
  signout: (req, res, next) => {
    req.logout()
    req.session.destroy((err) => {
      if (err) return next(err)
      res.redirect('/admin/login')
    })
  },
  activateAccount: (req, res, next) => {
    AdminUserSchema.findOne({admin_confirm_code: req.params.token},(err, adminUser) => {
      if (!adminUser) {
        req.flash("error", "Password verification code is invalid")
        return res.redirect('/admin/code')
      } else {
        if(adminUser.admin_confirm == true) {
          req.flash("success", "Account already confirmed")
          return res.redirect('/admin/login')
        } else {
          adminUser.admin_confirm = true
          adminUser.save((err) => {
            if (err) return next(err)
            req.flash("success", "Account successfully confirmed")
            res.redirect('/admin/login')
          })
        }
      }
    })
  },
  resetGet:(req, res, next) => {
    AdminUserSchema.findOne({admin_resetPasswordToken: req.params.token, admin_resetPasswordExpires: {$gt: Date.now()}}, (err, adminUser) => {
      if (!adminUser) {
        req.flash('error', "Password reset token is invalid or expired")
        return res.redirect('/admin/forgot')
      }
      res.render('forms/reset', {
        user: req.user,
        error: req.flash('error')
      })
    })
  },
  resetPost:(req, res) => {
    async.waterfall([
      function(done) {
        AdminUserSchema.findOne({admin_resetPasswordToken: req.params.token, admin_resetPasswordToken: {$gt: Date.now()}}, (err, adminUser) => {
          if(!adminUser) {
            req.flash('error', "Password reset token is invalid or has expired")
            return res.redirect('/admin/forgot')
          }
          adminUser.admin_password = req.body.password
          adminUser.admin_resetPasswordToken = undefined
          adminUser.admin_resetPasswordExpires = undefined

          adminUser.save((err) => {
            if (err) return err;
            done(err, adminUser)
          })
        })
      },
      function(adminUser, done) {
        var emailTempRaw = fs.readFileSync('templates/userPasswordSuccess.ejs', 'utf-8')
        var username = adminUser.admin_username
        var address = 'http://'+req.headers.host+'/admin/login'
        var mailOptions = {
          to: adminUser.admin_email,
          from: 'admin@nirajgeorgian.me',
          subject: 'Your password has been successfully reset.',
          html: ejs.render(emailTempRaw, {username: username, address: address})
        }
        smtpTransport.sendMail(mailOptions, (err) => {
          req.flash('success', " Your password has been reset")
          return res.redirect('/admin/login')
        })
      }
    ],(err) => {
      res.redirect('/admin/forgot')
    })
  },
  forgotGet: (req,res) => {
    res.render('forms/forgot', {
      error: req.flash('error')
    })
  },
  forgotPost: (req, res, next) => {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20,(err, buf) => {
          if (err) throw err
          var token = buf.toString('hex')
          done(err, token)
        })
      },
      function(token, done) {
        AdminUserSchema.findOne({admin_email: req.body.email}, (err, adminUser) => {
          if (!adminUser) {
            req.flash('error', "No account found for "+ req.body.email + " address")
            return res.redirect('/admin/forgot')
          }
          adminUser.admin_resetPasswordToken = token
          adminUser.admin_resetPasswordExpires = Date.now() + 3600000
          // user.admin_confirm = false
          adminUser.save((err) => {
            done(err, token,adminUser)
          })
        })
      },
      function(token, adminUser, done) {
        var emailTempRaw = fs.readFileSync('templates/userPasswordReset.ejs', 'utf-8')
        var resetToken = 'http://'+req.headers.host+'/reset/'+token
        var emailTempCompiled = ejs.compile(emailTempRaw)
        var mailOptions = {
          to: adminUser.admin_email,
          from: 'admin@nirajgeorgian.me',
          subject: 'Your Password reset token.',
          html: ejs.render(emailTempRaw,{token: resetToken})
        }
        smtpTransport.sendMail(mailOptions, (err) => {
          if (err){
            return console.log(err)
          } else {
            req.flash('success', "Successfully sended password reset to " + adminUser.admin_email)
            console.log("successfully sended email");
            return res.redirect('/admin/login')
          }
          done(err, 'done')
        })
      }
    ],function(error) {
      if (error) return next(error)
      res.redirect('/admin/login')
    })
  },
  addUser: (req, res, next) => {
      res.render("forms/addUser", {
        success: req.flash("success"),
        errors: req.flash("errors")
      })
  },
  addUserPost: (req, res, next) => {
      var singleUser = new singleUserModel()
      singleUser.user_first_name = req.body.first_name
      singleUser.user_last_name = req.body.last_name
      singleUser.user_username = req.body.user_username
      singleUser.user_email = req.body.user_email
      singleUser.user_created_at = new Date(),
      singleUser.user_updated_at = new Date()

      singleUser.save((err) => {
        if (err) return next(err)
        req.flash("success", "Successfully added user to the database")
        return res.redirect("/")
      })
  },
  adminUserView: (req, res, next) => {
    res.render("admin/user")
  },
  getMessage: (req, res, next) => {
    mailMessageSchema.find({}, (err, found) => {
      if (err) return next(err)
      emailTitle = found.map(function(title) {
        return title.emailTitle
      })
    res.render("forms/sendMessage", {
      success: req.flash("success"),
      emialTitle: emailTitle
    })
  })
},
  sendMessage: (req, res, next) => {
    var emailTitle = req.body.emailtitle
    var taggesAs = req.body.taggedas
    var notTaggedAs = req.body.nottaggedas
    var numberOfDays = req.body.numofdays
    var fName = req.body.fname
    var lName = req.body.lname
    var company = req.body.company
    var createMailMessage = req.body.createMailMessage
    var CurrentDate = moment().format()
    var totalHours = numberOfDays * 24
    var ScheduledDate = moment(CurrentDate).add(totalHours, 'hours')
    async.waterfall([
      function(callback) {
        singleUserModel.find({$and:[{"user_tagList.name":taggesAs}, {"user_tagList.name":{$ne: notTaggedAs}}] }, (err, result) => {
          if (err) return next(err)
          callback(null, result)
        })
      },
      function(result, callback) {
        var filterUsers = result.map(function(listEmails) {
          return listEmails.user_email
        });
        var mailMessage = new mailMessageSchema()
        mailMessage.emailTitle = emailTitle
        mailMessage.taggesAs = taggesAs
        mailMessage.notTaggedAs = notTaggedAs
        mailMessage.numberOfDays = numberOfDays
        mailMessage.fName = fName
        mailMessage.lName = lName
        mailMessage.company = company
        mailMessage.createMailMessage = createMailMessage
        mailMessage.ScheduledDate = ScheduledDate
        callback(null, result, mailMessage)
      }, function(result, mailMessage, callback) {
        var filterEmail = result.map(function(e) {
          return e.user_email
        })
        mailMessage.SendingTo = filterEmail
        mailMessage.save((err, data) => {
          if (err) return next(err)
          res.json(data)
        })
      }
    ], function(err, result) {
      if (err) return next(err)
    })
  },
  sendMessageRender: (req, res, next) => {
    var messageTitle = req.params.messageTitle;
    mailMessageSchema.find({"emailTitle": messageTitle}, (err, found) => {
      if (err) return next(err)
      res.render("forms/sendMessageView", {
      })
    })
  },
  showMessages: (req, res, next) => {
    mailMessageSchema.find({}, (err, found) => {
      if (err) return next(err)
        res.render("pages/allMessages", {
          found: found,
          failure: req.flash("failure"),
          moment: moment
        })
      })
  },
  deleteMessage: (req, res, next) => {
    var messageTitle = req.params.messageTitle
    mailMessageSchema.remove({emailTitle: messageTitle}, (err, removed) => {
      if (err) return next(err)
      req.flash("failure", "successfully removed message configuration")
      res.redirect("/messages")
    })
  },
  apiMessages: (req, res, next) => {
    mailMessageSchema.find({}, (err, found) => {
      if (err) return next(err)
      res.json(found)
    })
  },
  sendImmediately: (req, res, next) => {
    var emailTitle = req.body.emailtitle
    var taggesAs = req.body.taggedas
    var notTaggedAs = req.body.nottaggedas
    var numberOfDays = req.body.numofdays
    var fName = req.body.fname
    var lName = req.body.lname
    var company = req.body.company
    var createMailMessage = req.body.createMailMessage
    var CurrentDate = moment().format()
    singleUserModel.find({$and:[{"user_tagList.name":taggesAs}, {"user_tagList.name":{$ne: notTaggedAs}}] }, (err, result) => {
      if (err) return next(err)
      var userEmail = result.map(function(email) {
        return email.user_email
      })
      userEmail.forEach(function(to) {
        var msg = {
           to: to,
           from: "admin@nirajgeorgin.me",
           subject: emailTitle,
           text: String(createMailMessage),
         }
        smtpTransport.sendMail(msg, (err) => {
            if (err) return next(err)
            EmailSchema.findOne({created_by: req.user.admin_email}, (err, foundMail) => {
              if (err) return next(err)
              foundMail.emailSended.push({
                id: req.user._id,
                message: msg.text,
                subject: msg.subject,
                dateOfSending: CurrentDate,
                from: msg.from,
                to: msg.to
              })
              foundMail.save((err, sended) => {
                if (err) return next(err)
                singleUserModel.findOne({user_email: msg.to}, (err, userForEmail) => {
                  if (err) return next(err)
                  userForEmail.user_admin_email.push({
                    admin_name: req.user.admin_username,
                    message: msg.text,
                    subject: msg.subject,
                    dateOfSending: CurrentDate,
                    from: req.user.admin_email
                  })
                  userForEmail.save((err) => {
                    if (err) return next(err)
                    console.log(sended);
                    req.flash("success", "Your filtered mail has been successfully sended.")
                    res.redirect("/mails")
                  })
                })
              })
            })
          })
      })
    })
  },
  allmails: (req, res, next) => {
    emailListSchema.find({}, (err, result) => {
      if (err) return next(err)
      res.render("pages/sendMail", {
        emails: result,
        success: req.flash("success")
      })
    })
  },
  showUsers: (req, res, next) => {
    AdminUserSchema.find({}, (err, result) => {
      if (err) return next(err)
      res.json(result)
    })
  },
  uploadPost: (req, res, next) => {
    upload(req, res, function(err) {
      if (err) {
        console.log(err.stack)
        return res.end("error uploading files", err)
      }
      var reader = csv.createCsvFileReader(req.file.path, {columnsFromHeader: true})
      reader.addListener('data', function(data) {

        var singleuser = new singleUserModel()
        singleuser.user_first_name = data.user_first_name
        singleuser.user_last_name = data.user_last_name
        singleuser.user_username = data.user_username
        singleuser.user_email = data.user_email
        singleuser.user_created_at = new Date()
        singleuser.user_updated_at = new Date()

        singleuser.save((err, saved) => {
          if (err) return next(err)
        })
      })
      res.redirect("/")
    })
  },
  uploadGet: (req, res, next) => {
    res.render("pages/upload")
  }
}
