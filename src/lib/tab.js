import { nanoid } from 'nanoid'
import time from '@/lib/utils/time'
import events from '@/lib/utils/events'

export default class Tab {
  constructor (state, inquiry = {}) {
    this.id = inquiry.id || nanoid()
    this.name = inquiry.id ? inquiry.name : null
    this.tempName = inquiry.name || (state.untitledLastIndex
      ? `Untitled ${state.untitledLastIndex}`
      : 'Untitled')
    this.query = inquiry.query
    this.viewOptions = inquiry.viewOptions || undefined
    this.isPredefined = inquiry.isPredefined
    this.viewType = inquiry.viewType || 'chart'
    this.result = null
    this.isGettingResults = false
    this.error = null
    this.time = 0
    this.layout = inquiry.layout || {
      sqlEditor: 'above',
      table: 'bottom',
      dataView: 'hidden'
    }
    this.maximize = inquiry.maximize

    this.isSaved = !!inquiry.id
    this.state = state
  }

  async execute () {
    this.isGettingResults = true
    this.result = null
    this.error = null
    const db = this.state.db
    try {
      const start = new Date()
      this.result = await db.execute(this.query + ';')
      this.time = time.getPeriod(start, new Date())

      if (this.result && this.result.values) {
        events.send('resultset.create',
          this.result.values[this.result.columns[0]].length
        )
      }

      events.send('query.run', parseFloat(this.time), { status: 'success' })
    } catch (err) {
      this.error = {
        type: 'error',
        message: err
      }

      events.send('query.run', 0, { status: 'error' })
    }
    db.refreshSchema()
    this.isGettingResults = false
  }
}
