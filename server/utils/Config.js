const debug =require('debug-levels')('Config')

const useWhitelist = true

// during test just allows these chats to respond
const whitelist = [
  process.env.TEST_CHAT_ID
]

const Config = {

  whiteListed(msgIn) {
    // return true
    if (!useWhitelist) return true
    if (!msgIn.chatId) {
      debug.warn('msgIn needs chatId: ', msgIn)
      return false
    }
    if (whitelist.includes(msgIn.chatId)) {
      return true
    } else {
      debug.warn('not a whitelisted chatId:', msgIn)
      debug.info('whitelist', whitelist)
      debug.info('double check', whitelist.includes(msgIn.chatId))
      return false
    }
  },

  get(k) {
    let v = process.env[k]
    debug.info('get', k, '=>', v)
    return v
  }

}

module.exports = Config
