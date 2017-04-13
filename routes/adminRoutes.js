var router = require('express').Router()
var isAuthenticated = require('../helpers/authenticated').isAuthenticated

// controllers
var adminController = require('../controllers/adminUserController')

// signup
router.route('/admin/signup')
  .get(adminController.signupGet)
  .post(adminController.signupPost)

router.route('/admin/login')
    .get(adminController.loginGet)
    .post(adminController.loginPost)

router.route('/reset/:token')
      .get(adminController.resetGet)
      .post(adminController.resetPost)

router.route('/admin/forgot')
        .get(adminController.forgotGet)
        .post(adminController.forgotPost)

router.get('/signout', isAuthenticated,adminController.signout)
router.get('/activate/:token',adminController.activateAccount)

router.route('/admin/adduser')
        .get(isAuthenticated,adminController.addUser)
        .post(isAuthenticated,adminController.addUserPost)

router.route("/admin/user/:adminUser")
        .get(isAuthenticated, adminController.adminUserView)

router.route("/admin/send/message")
          .get(isAuthenticated, adminController.getMessage)
          .post(isAuthenticated, adminController.sendMessage)

router.route("/admin/send/message/:messageTitle")
          .get(isAuthenticated, adminController.sendMessageRender)

router.route("/messages")
          .get(isAuthenticated, adminController.showMessages)

router.route("/admin/messages/delete/:messageTitle")
            .get(isAuthenticated, adminController.deleteMessage)

router.route("/api/messages")
        .get(isAuthenticated, adminController.apiMessages)

router.get("/api/get/email", adminController.showUsers)

router.route("/admin/send/immediately")
            .post(isAuthenticated, adminController.sendImmediately)

router.route("/mails")
            .get(isAuthenticated, adminController.allmails)

router.get("/upload", isAuthenticated, adminController.uploadCsv)
router.post("/upload", isAuthenticated, adminController.uploadCsvPost)

module.exports = router
