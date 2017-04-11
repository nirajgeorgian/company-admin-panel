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

// router.route('/search/tags')
//   .post((req, res, next) => {
//     res.redirect('/search/tags?tag=' + req.body.tagsearch)
//   })
//   .get((req, res, next) => {
//     if (req.query.tag) {
//       // var regex = new RegExp(req.query.tag, 'i')
//       var query = Tags.find({tagList: req.query.tag})
//       query.exec(function(err, data) {
//         res.json(data)
//       })
//     } else {
//       res.json("not a valid search type")
//     }
//   })

module.exports = router








































//all the page
