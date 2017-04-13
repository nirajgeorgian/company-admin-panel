var router = require('express').Router()
var isAuthenticated = require('../helpers/authenticated').isAuthenticated
var stagesController = require('../controllers/stagesController')

router.route('/admin/stages')
      .get(isAuthenticated, stagesController.getStages)
      .post(isAuthenticated, stagesController.createStage)

router.post('/admin/user/addstages', isAuthenticated, stagesController.userModel)
router.get("/remove/:stage_id", isAuthenticated, stagesController.removeStage)

router.post("/admin/stage/edit", isAuthenticated, stagesController.postEditStage)
router.route("/admin/stage/edit/:stageName")
  .get(isAuthenticated, stagesController.getEditStage)
  .post(isAuthenticated, stagesController.postEditStage)

router.get("/admin/stages/delete/:stage_id", isAuthenticated, stagesController.deleteStage)
router.get("/api/stages", isAuthenticated, stagesController.stageApi)


module.exports = router
