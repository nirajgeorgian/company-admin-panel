const router = require('express').Router()
var isAuthenticated = require('../helpers/authenticated').isAuthenticated

// require controllers
var tagsController = require('../controllers/tagsController')

router.route('/tags')                   // Render tha tags page
    .get(isAuthenticated,tagsController.getTags)

router.route('/add/tags')               //Api to generate tags data
    .get(isAuthenticated,tagsController.postTagsApi)

router.route('/tags/add')
    .post(isAuthenticated,tagsController.insertTag)

router.route('/api/tags')
      .get(isAuthenticated,tagsController.getTagsApi)

router.route('/tags/edit/:tag')
        .get(isAuthenticated,tagsController.editOnlyTags)
        .post(isAuthenticated,tagsController.editOnlyTagsPost)

router.route('/search/tags')
        .get(isAuthenticated,tagsController.tagSearch)
        .post(isAuthenticated,tagsController.tagSearchPost)

router.route('/serach/alltags')
          .post(isAuthenticated,tagsController.universalSearchTag)

router.route('/tags/:tagname')
            .get(isAuthenticated,tagsController.tagOption)

router.get('/tags/delete/:tag_name', isAuthenticated, tagsController.tagDelete)
router.post('/user/add/tag', isAuthenticated, tagsController.editUserTag)
router.post('/insert/tag', isAuthenticated, tagsController.editSinleUserTag)

module.exports = router
