import registerPromiseWorker from 'promise-worker/register'
import Sql from './_sql'

const sqlReady = Sql.build()

function processMsg (sql) {
  const data = this
  switch (data && data.action) {
    case 'open':
      return sql.open(data.buffer)
    case 'reopen':
      return sql.open(sql.export())
    case 'exec':
      return sql.exec(data.sql, data.params)
    case 'import':
      return sql.import(
        data.tabName,
        data.data,
        data.progressCounterId,
        postMessage
      )
    case 'export':
      return sql.export()
    case 'close':
      return sql.close()
    default:
      throw new Error('Invalid action : ' + (data && data.action))
  }
}

function onError (error) {
  return {
    error: error.message
  }
}

registerPromiseWorker(data => {
  return sqlReady
    .then(processMsg.bind(data))
    .catch(onError)
})
