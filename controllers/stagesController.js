// Model of stagesController
var stagesModel = require('../model/stagesModel')
var userModel = require('../model/userSchema')
var async = require('async')

module.exports = {
  getStages: (req, res, next) => {
    stagesModel.find({}, (err, stages) => {
      if (err) return next(err)
        res.render("pages/stages", {
          stages: stages,
          success: req.flash("success"),
          failure: req.flash("failure"),
          adminUser: req.user
      })
    })
  },
  createStage: (req, res, next) => {
    stagesModel.find({stage: req.body.stages}, (err, stagesFound) => {
      if (err) return next(err)
      if (stagesFound.length == 0) {
        var stageData = new stagesModel()
        stageData.stage = req.body.stages
        stageData.order = req.body.order
        stageData.created_by = req.userSchema

        stageData.save((err) => {
          if (err) return next(err)
          req.flash("success", "Successfully created stage.")
          res.redirect('/admin/stages')
        })
      } else {
        req.flash("failure", "Stage already exists")
        return res.redirect("/admin/stages")
      }
    })
  },
  userModel: (req, res, next) => {
    userModel.find({_id: req.body._id}, (err, userFound) => {
      if (err) return next(err)
      var userStages = userFound[0].user_stages
      async.waterfall([
        function(callback) {
          var allStages = userStages.map(function(elem, index, array) {
            return String(elem.stage_id)
          })
          callback(null, allStages)
        },
        function(allStages, callback) {
          var dataTobeIndexed = String(req.body.user_stages)
          callback(null, dataTobeIndexed, allStages)
        },
        function(dataTobeIndexed, allStages,callback) {
          var indexOfStage = allStages.indexOf(dataTobeIndexed)
          if (indexOfStage == -1) {
            userFound[0].user_stages.push({
              created_by: req.user.admin_email,
              stage_id: req.body.user_stages,
              created_at: new Date(),
              created_for_date: req.body.date
            })
            userFound[0].save((err) => {
              if (err) return next(err)
              req.flash("success", "Successfully added your stage to the user")
              res.redirect("/user/"+req.body.user_username)
            })
          } else {
            req.flash("failure", "Stage already assigned to the user")
            res.redirect("/user/"+req.body.user_username)
          }
          // res.json(indexOfStage)
          callback(null, 'done')
        }
      ], function(err, result) {
        if (err) return next(err)
      })
    })
  },
  removeStage: (req, res, next) => {
    var stage_id = req.params.stage_id
    // res.json(stage_id)
    userModel.find({_id: req.body._id}, (err, found) => {
      if (err) return next(err)
      res.json(found)
    })
  },
  postEditStage: (req, res, next) => {
    var stagename = req.params.stageName
    var stageData = req.body.stage
    stagesModel.update({stage: stagename},{$set: {'stage': stageData}}, (err, found) => {
      if (err) return next(err)
      // res.json({
      //   "stagename": stagename,
      //   "stageData": stageData
      // })
      return res.redirect("/admin/stages")
    })
  },
  getEditStage: (req, res, next) => {
    var stageName = req.params.stageName
    res.render("pages/editStage", {
      stageName: stageName
    })
  },
  deleteStage: (req, res, next) => {
    var delete_id = req.params.stage_id
    userModel.update({}, {$pull: {"user_stages" : {"stage_id" : delete_id}}},{multi: true},(err, stages_found) => {
      if (err) return next(err)
      stagesModel.remove({"_id": delete_id},(err, removed) => {
        if (err) return next(err)
        return res.redirect("/admin/stages")
      })
    })
    // res.json("success")
  },
  stageApi: (req, res, next) => {
    stagesModel.find({}, (err, found) => {
      if (err) return next(err)
      res.json(found)
    })
  }
}




















//  comment
