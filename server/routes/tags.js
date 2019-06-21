const debug = require('debug-levels')('index')
var express = require('express')
var router = express.Router()


/* GET home page. */
router.get('/tags', function(req, res, next) {
  debug.log('tags')
  res.render('tags', { title: 'tags Explorer' })
})

module.exports = router
