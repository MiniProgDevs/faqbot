const debug = require('debug-levels')('index')
var express = require('express')
var router = express.Router()


/* GET home page. */
router.get('/admin', function(req, res, next) {
  debug.log('admin')
  res.render('admin', { title: 'Events Explorer' })
})

module.exports = router
