var nodemailer = require('nodemailer')
var sgTransport = require('nodemailer-sendgrid-transport')
var secret = require('../config/secret')
var showdown  = require('showdown')
var converter = new showdown.Converter()
var htmlToText = require('html-to-text');
var smtpTransport = nodemailer.createTransport(sgTransport(secret.mailOption))

//Custom helper function
var helperFunction = require('../helpers/helperFunction')
var User = require('../model/userSchema')
var Emails = require('../model/mailModel')
var StagesModel = require('../model/stagesModel')

module.exports = {
  homePage: (req, res, next) => {
      helperFunction.page(req, res, next)
  },
  // Users configuration
  usersPage: (req, res, next) => {                                                // User configuration for sending mail
    page(req, res, next)
  },
  // User configuration
  userSendMail: (req, res, next) => {
    var subject = req.body.subject
    var message = converter.makeHtml(req.body.message)
    var toUser = req.body.email
    var username = req.body.toUsername
    User.findOne({user_email: req.user.email}, (err, userFound) => {
      if (err) return next(err)
      mailOptions = {
        to: toUser,
        from: 'admin@nirajgeorgian.me',
        subject: subject,
        html: message
      }
      smtpTransport.sendMail(mailOptions, (err, sended) => {
        if (err) return next(err)
        Emails.findOne({created_by: req.user.admin_email}, (err, foundMail) => {
          if (err) return next(err)
          foundMail.emailSended.push({
          id: req.body._id,
          message: htmlToText.fromString(message),
          subject: subject,
          dateOfSending: Date.now(),
          from: req.user.admin_username,
          to: toUser
          })
          foundMail.save((err, sended) => {
            if (err) return next(err)
            User.findOne({user_email: req.body.email}, (err, userForMail) => {
              if (err) return next(err)
              userForMail.user_admin_email.push({
                admin_name: req.user.admin_username,
                message: htmlToText.fromString(message),
                subject: subject,
                dateOfSending: Date.now(),
                from: req.user.admin_email
              })
              userForMail.save((err) => {
                if (err) return next(err)
                req.flash("success", "successfully sended your mail")
                res.redirect('/user/'+username)
              })
            })
          })
        })
       })
    })
  },
  singleUserView: (req, res, next) => {
    var user_username = req.params.username
    User
    .findOne({user_username:user_username})
    .populate('user_stages.stage_id')
    .exec((err, userFound) => {
      if (err) return next(err)
      if(!userFound) {
        res.send("no user found for "+ user_username);
      } else {
        var totalTags = userFound.user_tagList
        var onlyTags = totalTags.map(function(tag_name) {
          return tag_name.name
        })
        var totalMails = userFound.user_admin_email
        StagesModel.find({}, (err, stagesFoung) => {
          if (err) return next(err)
          res.render('pages/user', {
            userTasks: userFound.user_tasks,
            userFound: userFound,
            email: totalMails,
            tags: onlyTags,
            userFound: userFound,
            stages: stagesFoung,
            success: req.flash("success"),
            failure: req.flash("failure")
          })

        })
      }
    })
  }
}
