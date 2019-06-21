const debug = require('debug-levels')('index')
var express = require('express')
var router = express.Router()


/* GET home page. */
router.get('/', function(req, res, next) {
  debug.log('index')
  res.render('index', { title: 'Events Explorer' })
})

module.exports = router
