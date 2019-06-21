const debug = require('debug-levels')('DbConn')
var MongoClient = require('mongodb').MongoClient

// careful not to stamp on 'bot-env' DB names / collections

let dbName = process.env.APP_NAME
if (!dbName) {
  debug.error('env', process.env)
  throw new Error('no APP_NAME is set in process.env')
}

let mongoClient = null
let dbHandle = null

const DbConn = {
  mongoUri: 'mongodb://localhost:27017/',

  init: async function () {
    if (mongoClient) {
      debug.log('return cached dbConn')
      return (mongoClient)
    }
    debug.info('connect mongoUri: ', DbConn.mongoUri)
    mongoClient = await MongoClient.connect(DbConn.mongoUri, {useNewUrlParser: true})
    dbHandle = mongoClient.db(dbName)
    debug.info('DbConn.init done!')
    return mongoClient
  },

  // capitalize collection names
  getCollName: (name) => {
    name = name.replace(/-/g, '')
    return name[0].toUpperCase() + name.slice(1)
  },

  // collection names dont have puncs in
  getColl: async (name) => {
    if (!name) {
      debug.abort('getColl with no name!')
    }
    await DbConn.init()
    let collName = await DbConn.getCollName(name)
    debug.log('getColl', collName)
    // debug.log('DbConn is', DbConn)
    // debug.log('mongoClient is', mongoClient)
    // debug.log('dbHandle.collection is', dbHandle.collection)
    return dbHandle.collection(collName)
  },

  enforceCapped: async (coll, size, max) => {
    if (!coll) {
      debug.error('ERROR enforceCapped no collection? ', coll)
      return
    }
    const name = coll.s.name
    debug.info('enforceCapped name: ', name)
    debug.info('size', size, 'max', max)
    const dbConn = mongoClient
    if (!name) {
      debug.error('ERROR cant force capped for no collection and no name', coll)
      return
    }
    const data = await dbConn.listCollections({ name }).toArray()
    let dbRes
    if (data.length) {
      dbRes = await dbConn.command({
        convertToCapped: name,
        size,
        max
      })
      debug.info(`${name} converted to capped`)
    } else {
      dbRes = await dbConn.createCollection(name, {
        capped: true,
        size,
        max
      })
      debug.info(`created capped ${name} collection`)
    }
    debug.info('dbRes', dbRes)
  },

  isCapped: async coll => {
    try {
      return await coll.isCapped()
    } catch (e) {
      return false
    }
  }
}

module.exports = DbConn
