const axios = require('axios')
const debug = require('debug-levels')('models/Boto')
const Projects = require('../bots/FaqBot')
const Config = require('../utils/Config')

const botoConfig = {
  sendUrl: process.env.BOTO_DOMAIN + "/message/send",
  token: process.env.BOTO_TOKEN,
  testChatId: process.env.TEST_CHAT_ID,
}

// https://github.com/botorange/xiaoju/wiki/API-Doc

const BotoMessageTypes = {
  TEXT: 0,
  IMAGE: 1,
  URL_LINK: 2,
  FILE: 3,
}


const Boto = {

  send(msgOut) {
    let chatId = msgOut.chatId
    if (!Config.whiteListed({chatId})) {
      return
    }
    let text = msgOut.text
    if (!text) {
      return debug.error('tried to send empty message')
    }
    let sendUrl = botoConfig.sendUrl
    let data = {
      "chatId": chatId,
      "token": botoConfig.token,
      "messageType": BotoMessageTypes.TEXT,
      "payload": {
        "text": text
      }
    }

    // debug.log('send uri:', sendUrl)
    let blob = {
      method: 'post',
      url: sendUrl,
      timeout: 3000,
      data: data
    }
    debug.log('send blob:', blob)

    // @ts-ignore
    axios(blob)
    .then( function(response) {
      debug.log('Boto.sent.response:', response.data)
      if (response.data && response.data.code !== 0) {
        debug.warn('non zero code repsonse from Boto', response.data)
      }
    })
    .catch(function (err) {
      debug.error('failed to send', err)
      // TODO - check what type of error
      // res.status(500).json({
      //   status: 500,
      //   msg: 'failed to send: ' + err
      // })
    })
  },

  async replyMessage(msgIn) {
    debug.info('replyMessage .msgIn', msgIn)
    let msgOut = await Projects.fuzzyFind({
      input: msgIn.input
    })
    msgOut.chatId = msgIn.chatId
    debug.info('msgOut', msgOut)
    Boto.send(msgOut)
    return msgOut
  }

}

module.exports = Boto