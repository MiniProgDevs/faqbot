let express = require('express')
let router = express.Router()
const Boto = require('../../models/Boto')
const Config = require('../../utils/Config')
const debug = require('debug-levels')('bot/out')

/* trigger output message */
router.get('/bot/out', function(req, res, next) {

  let text = req.query.q
  text = text || 'testing'

  let msgOut = {text, chatId: Config.get('TEST_CHAT_ID')}
  Boto.send(msgOut)
  res.json(msgOut)

})

module.exports = router
