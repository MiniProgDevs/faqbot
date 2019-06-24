const axios = require('axios')
const debug = require('debug-levels')('bots/FaqBot')
const _ = require('underscore')
let DbConn = require("../utils/DbConn")
const FaqData = require('../data/FaqData')

const FaqBot = {
  coll: null,

  async init() {
    if (!FaqBot.coll) {
      debug.log('getColl FaqBot')
      FaqBot.coll = await DbConn.getColl("FaqBot")
      debug.log('init DONE')
    }
    return FaqBot.coll
  },


  /**
   * reload data from markdown or other specified location
   * TODO move this to a separate module and just pass in rawdata to faqbot
   * https://github.com/MiniProgDevs/faqbot/issues/1
   * assumes flat markdown file
   * # question => faq.q
   * body text => faq.a[] array of paragraphs
   */
  async reload() {
    debug.log('reload')
    // TODO - parse .md file and load into mongo
  },

  async find(text) {
    let items = FaqData.map( faq => {
      for (let tag of faq.tags) {
        if (text.includes(tag)) {
          return faq
        }
      }
    }).filter(i => i)
    debug.log('input:', text, 'reply.items=', items)
    return items
  },

  /**
   * reply to msg.text
   * @param {{ text: any; }} msgIn
   */
  async reply(msgIn) {
    let text = msgIn.text
    let items = await FaqBot.find(text)
    let lines = items.map( item => {
      // debug.info('item', item)
      return `# ${item.q} \n${item.a}\nhttps://github.com/MiniProgDevs/faqbot/wiki/Faqs#${item.q}`
    })
    if (lines.length === 0) return false
    let response = lines.join('\n\n')
    debug.log('reply.text', response)
    return {
      text: response
    }
  },

  async fuzzyFind(opts) {
    let input = opts.input
    if (!input) {
      debug.error('fuzzyFind witn no opts.input', opts)
      return
    }
    let finder = {
      q: { $regex: input, $options: 'gim' },
    }
    let items = await FaqBot.coll.find(finder).toArray()
    let text = `[ ${input} ] :\n\n`
    items.map( item => {
      text += `# ${item.q}
${item.a}
https://github.com/MiniProgDevs/faqbot/wiki/Faqs#${item.q}
\n`
    })
    debug.log('findFuzzy', finder, ' \nitems:', items.length)
    return {
      text,
      items
    }
  }

}

module.exports = FaqBot