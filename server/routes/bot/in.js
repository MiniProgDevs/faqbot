const debug = require('debug-levels')('bot/in')
var express = require('express')
var router = express.Router()
const Projects = require('../../bots/FaqBot')
const Boto = require('../../models/Boto')
const Config = require('../../utils/Config')
const FaqBot = require('../../bots/FaqBot')

/* incoming message */

/*
{ data:
  { messageId: '1674005254',
    chatId: '5d023965bd6faaxxxxx',
    roomTopic: 'edm test',
    roomId: '21508239070@chatroom',
    contactName: 'user nickanem',
    contactId: 'wxid_xet7g1sedxxxxx',
    payload: { text: 'test' },
    type: 7,
    timestamp: 1560801152000,
    token: '5d04a56c94e51003xxxxxx' } }   // boto token
*/

function checkMention(msg) {
  const mentions = msg.payload.mention
  if (!mentions) {
    debug.warn('no mentions', msg)
    return false
  }
  if (!mentions.includes(process.env.BOT_ID)) {
    debug.warn('not included mentions:', mentions, '\nBOT_ID:', process.env.BOT_ID)
    return false
  }
  debug.warn('mention found!')
  return true
}

router.post('/bot/in/message', async function(req, res, next) {
  let msgIn = req.body.data
  debug.info('recv POST bot/in', msgIn)
  res.status(200).send('ok')

  if (msgIn.type !== 7) {
    debug.warn('not a text type message:', msgIn.type)
    return res.send('ok')
  }
  if (!checkMention(msgIn)) return

  let reply = await FaqBot.reply(msgIn.payload)
  if (!reply) return
  let msgOut = {
    chatId: msgIn.chatId,
    text: reply.text
  }
  Boto.send(msgOut)
})


/* trigger from browser */
router.get('/bot/in/message', async function(req, res) {
  let input = req.query.input
  let msgIn = {
    input,
    chatId: Config.get('TEST_CHAT_ID')
  }
  let output = await FaqBot.reply({
    text: input
  })
  debug.info('input', input)
  debug.info('output', output)
  res.send(output.text)
})

module.exports = router
