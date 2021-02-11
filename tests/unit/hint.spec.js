import { expect } from 'chai'
import sinon from 'sinon'
import { state } from '@/store'
import { default as hint, getHints } from '@/hint'
import CM from 'codemirror'

describe('hint.js', () => {
  it('Calculates table list for hint', () => {
    // mock store state
    const schema = [
        {
          name: 'foo',
          columns: [
            { name: 'fooId', type: 'INTEGER' },
            { name: 'name', type: 'NVARCHAR(20)' }
          ]
        },
        {
          name: 'bar',
          columns: [
            { name: 'barId', type: 'INTEGER' }
          ]
        }
      ]
    sinon.stub(state, 'schema').value(schema)

    // mock showHint and editor
    sinon.stub(CM, 'showHint')
    const editor = {
      getTokenAt() {
        return {
          string: 'SELECT',
          type: 'keyword'
        }
      },
      getCursor: sinon.stub()
    }

    const clock = sinon.useFakeTimers();
    hint.show(editor)
    clock.tick(500)

    expect(CM.showHint.called).to.equal(true)
    expect(CM.showHint.firstCall.args[2].tables).to.eql({
      foo: ['fooId', 'name'],
      bar: ['barId']
    })
    
    sinon.restore()
  })

  it("Doesn't show hint when in string or space, or ';'", () => {
    // mock showHint and editor
    sinon.stub(CM, 'showHint')
    const editor = {
      getTokenAt() {
        return {
          string: 'foo',
          type: 'string'
        }
      },
      getCursor: sinon.stub()
    }

    const clock = sinon.useFakeTimers()
    hint.show(editor)
    clock.tick(500)
    
    expect(CM.showHint.called).to.equal(false)
    
    sinon.restore()
  })

  it("Doesn't show hint after space", () => {
    // mock showHint and editor
    sinon.stub(CM, 'showHint')
    const editor = {
      getTokenAt() {
        return {
          string: ' ',
          type: null
        }
      },
      getCursor: sinon.stub()
    }

    const clock = sinon.useFakeTimers()
    hint.show(editor)
    clock.tick(500)
    
    expect(CM.showHint.called).to.equal(false)
    
    sinon.restore()
  })

  it("Doesn't show hint after ';'", () => {
    // mock showHint and editor
    sinon.stub(CM, 'showHint')
    const editor = {
      getTokenAt() {
        return {
          string: ';',
          type: 'punctuation'
        }
      },
      getCursor: sinon.stub()
    }

    const clock = sinon.useFakeTimers()
    hint.show(editor)
    clock.tick(500)
    
    expect(CM.showHint.called).to.equal(false)
    
    sinon.restore()
  })

  it("getHints returns [ ] if there is only one option and the token is already completed with this option", () => {
    // mock CM.hint.sql and editor
    sinon.stub(CM.hint, 'sql').returns({ list: [{ text: 'SELECT' }] })
    const editor = {
      getTokenAt() {
        return {
          string: 'select',
          type: 'keyword'
        }
      },
      getCursor: sinon.stub()
    }

    const hints = getHints(editor, {})
    expect(hints.list).to.eql([])
    
    sinon.restore()
  })

  it("getHints returns hints as is when there are more than one option", () => {
    // mock CM.hint.sql and editor
    let list = [
      { text: 'SELECT' },
      { text: 'ST' }
    ]
    sinon.stub(CM.hint, 'sql').returns({ list })
    const editor = {
      getTokenAt() {
        return {
          string: 'se',
          type: 'keyword'
        }
      },
      getCursor: sinon.stub()
    }

    const hints = getHints(editor, {})
    expect(hints.list).to.eql(list)
    
    sinon.restore()
  })

  it("getHints returns hints as is when there only one option but the token is not cpmpleted", () => {
    // mock CM.hint.sql and editor
    let list = [{ text: 'SELECT' }]
    sinon.stub(CM.hint, 'sql').returns({ list })
    const editor = {
      getTokenAt() {
        return {
          string: 'sele',
          type: 'keyword'
        }
      },
      getCursor: sinon.stub()
    }

    const hints = getHints(editor, {})
    expect(hints.list).to.eql(list)
    
    sinon.restore()
  })

  it('tables is empty object when schema is null', () => {
    // mock store state
    sinon.stub(state, 'schema').value(null)

    // mock showHint and editor
    sinon.stub(CM, 'showHint')
    const editor = {
      getTokenAt() {
        return {
          string: 'SELECT',
          type: 'keyword'
        }
      },
      getCursor: sinon.stub()
    }

    const clock = sinon.useFakeTimers();
    hint.show(editor)
    clock.tick(500)

    expect(CM.showHint.called).to.equal(true)
    expect(CM.showHint.firstCall.args[2].tables).to.eql({})
    
    sinon.restore()
  })
})
