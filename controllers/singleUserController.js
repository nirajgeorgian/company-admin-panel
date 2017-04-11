var faker = require('faker')
var async = require('async')
var showdown  = require('showdown')
var converter = new showdown.Converter()
var htmlToText = require('html-to-text');
let ejsT = require('ejs-html')

// model
var singleUserModel = require('../model/userSchema')
var Emails = require('../model/mailModel')
var TasksTotal = require('../model/tasksModel')
var StagesModel = require('../model/stagesModel')

module.exports = {
  user: (req, res, next) => {
      for(var i = 0; i < 30; i++) {
        var singleUser = new singleUserModel()
        singleUser.user_first_name = faker.name.firstName()
        singleUser.user_last_name = faker.name.lastName()
        singleUser.user_username = faker.internet.userName()
        singleUser.user_email = faker.internet.email()
        singleUser.user_created_at = new Date(),
        singleUser.user_updated_at = new Date()

        singleUser.save((err) => {
          if (err) return next(err)
          console.log("Successfully created your users")
        })
      }
      return res.redirect('/')
  },
  getUserApi: (req, res, next) => {
      singleUserModel.find({}, (err, singleUsers) => {
        res.json(singleUsers)
      })
  },

  apiEmails: (req, res, next) => {
      Emails.find({}, (err, emails) => {
        if (err) return next(err)
        res.json(emails)
      })
  },
  getmail: (req, res, next) => {
    Emails.findOne({"created_by": req.admin_email}, (err, resp) => {
      if (err) return next(err)
      res.json(req.user.admin_email)
    })
  },
  addNote: (req, res, next) => {
      singleUserModel.findOne({"_id":req.body._id}, (err, foundUser) => {
        if (err) return next(err)
        var message = converter.makeHtml(req.body.message)
        var subject = req.body.subject
        var date = req.body.date
        foundUser.user_tasks.push({
          date: date,
          subject: subject,
          task: htmlToText.fromString(message),
          created_by: req.user.admin_email,
        })
        foundUser.save((err) => {
          if (err) return next(err)
          var newTask = new TasksTotal()
          // newTask.user_tasks.push({
            newTask.date = date
            newTask.subject = subject
            newTask.task = htmlToText.fromString(message)
            newTask.created_by = req.user.admin_email
            newTask.created_to = foundUser.user_email
            newTask.created_on = Date.now()
            newTask.done = false
          // })
          newTask.save((err) => {
            if (err) return next(err)
            req.flash("success", "Successfully added your task")
            res.redirect('/user/' + foundUser.user_username)
          })
        })
      })
  },
  getTags: (req, res, next) => {
    TasksTotal.find({}, (err, foundTask) => {
      if (err) return next(err)
      res.json(foundTask)
    })
  }
}
