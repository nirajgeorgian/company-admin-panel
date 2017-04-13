var router = require('express').Router()
var isAuthenticated = require('../helpers/authenticated').isAuthenticated

// Controllers
var singleUserController = require('../controllers/singleUserController')

// Single router configuration
router.route('/guser/add')
  .get(singleUserController.user)

router.get('/api/users', isAuthenticated,singleUserController.getUserApi)
router.get('/api/emails', isAuthenticated,singleUserController.apiEmails)
router.get('/api/tasks', isAuthenticated,singleUserController.getTags)
router.get('/getmail', isAuthenticated,singleUserController.getmail)
router.post('/user/addnote',isAuthenticated,singleUserController.addNote )

module.exports = router








































//all the page
