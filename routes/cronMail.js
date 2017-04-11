const EmailSchema = require('../model/mailModel')
var singleUserModel = require('../model/userSchema')
var router = require('express').Router()
var moment = require('moment')
var nodemailer = require('nodemailer')
var async = require('async')
var lodash = require('lodash')
var sgTransport = require('nodemailer-sendgrid-transport')
var secret = require('../config/secret')
var isAuthenticated = require('../helpers/authenticated').isAuthenticated
var smtpTransport = nodemailer.createTransport(sgTransport(secret.mailOption))
var fs = require('fs')


var mailMessageSchema = require('../model/mailMessageSchema')

router.get("/cronjob", (req, res, next) => {
  var todayDate = moment().format("dddd, MMMM Do YYYY")
  async.waterfall([
    function(callback) {
      var date = new Date().toISOString();
      console.log(date);
      mailMessageSchema.find({}, (err, found) => {
        if (err) return next(err)
        var foundEmails = found.filter(function(emails) {
          return moment(emails.ScheduledDate).format("dddd, MMMM Do YYYY") == moment(date).format("dddd, MMMM Do YYYY")
        })
          for(var prop in foundEmails) {
            var email = foundEmails[prop]
            console.log(email);
            var elist = email.SendingTo

            for(var i = 0; i < elist.length; i++) {
              var msg = {
                from: "admin@nirajgeorgin.me",
                to: elist[i],
                text: String(email.createMailMessage),
                subject: email.emailTitle
              }
               smtpTransport.sendMail(msg, (err) => {
                 if (err) return next(err)
                 EmailSchema.findOne({"created_by": "nirajgeorgian01@gmail.com"}, (err, found) => {
                   if (err) return next(err)
                   found.emailSended.push({
                     id: req.user._id,
                     message: email.createMailMessage,
                     subject: email.emailTitle,
                     dateOfSending: date,
                     from: msg.from,
                     to: msg.to
                   })
                   found.save((err, saved) => {
                     if (err) return next(err)
                     singleUserModel.findOne({user_email: msg.to}, (err, userForEmail) => {
                       if (err) return next (err)
                       userForEmail.user_admin_email.push({
                         admin_name: req.user.admin_username,
                         message: String(email.createMailMessage),
                         subject: email.emailTitle,
                         dateOfSending: date,
                         from: req.user.admin_email
                       })
                       userForEmail.save((err, saved) => {
                         if (err) return next(err)
                        //  Successfully saved data to both user and admin
                       })
                     })
                   })
                 })
               })
          }
        }
        callback(null, foundEmails)
      })
    }, function(foundEmails, callback) {

      foundEmails.forEach(function(i) {
        mailMessageSchema.remove({_id: i._id}, (err, removed) => {
          if (err) return next(err)
        })
      })
      res.json({
        "success" : "Successfully sended email with cron."
      })
      callback(null, 'done')
    }
  ], function(err) {
    if (err) return next(err)
  })
})


module.exports = router
