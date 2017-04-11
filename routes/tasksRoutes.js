var router = require('express').Router()
var isAuthenticated = require('../helpers/authenticated').isAuthenticated

// controller
var tasksController = require('../controllers/tasksController')

router.get('/tasks', isAuthenticated, tasksController.getAllTask)
router.get('/tasks/user/:task_id', isAuthenticated, tasksController.checkTrue)

module.exports = router
