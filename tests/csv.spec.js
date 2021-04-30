import { expect } from 'chai'
import sinon from 'sinon'
import csv from '@/csv'
import Papa from 'papaparse'

describe('csv.js', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('getResult with fields', () => {
    const source = {
      data: [
        { id: 1, name: 'foo' },
        { id: 2, name: 'bar' }
      ],
      meta: {
        fields: ['id', 'name ']
      }
    }
    expect(csv.getResult(source)).to.eql({
      columns: ['id', 'name'],
      values: [
        [1, 'foo'],
        [2, 'bar']
      ]
    })
  })

  it('getResult without fields', () => {
    const source = {
      data: [
        [1, 'foo'],
        [2, 'bar']
      ],
      meta: {}
    }
    expect(csv.getResult(source)).to.eql({
      columns: ['col1', 'col2'],
      values: [
        [1, 'foo'],
        [2, 'bar']
      ]
    })
  })

  it('parse resolves', async () => {
    sinon.stub(Papa, 'parse').callsFake((file, config) => {
      config.complete({
        data: [
          [1, 'foo'],
          [2, 'bar']
        ],
        errors: [
          {
            type: 'Quotes',
            code: 'MissingQuotes',
            message: 'Quote is missed',
            row: 0
          },
          {
            type: 'Delimiter',
            code: 'UndetectableDelimiter',
            message: 'Comma was used as a standart delimiter',
            row: 0
          }
        ],
        meta: {
          delimiter: ',',
          linebreak: '\n',
          aborted: false,
          truncated: true
        }
      })
    })
    const file = {}
    const result = await csv.parse(file)
    expect(result).to.eql({
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo'],
          [2, 'bar']
        ]
      },
      delimiter: ',',
      hasErrors: true,
      messages: [
        {
          code: 'MissingQuotes',
          message: 'Quote is missed',
          row: 0,
          type: 'error',
          hint: 'Edit your CSV so that the field has a closing quote char.'
        },
        {
          code: 'UndetectableDelimiter',
          message: 'Comma was used as a standart delimiter',
          row: 0,
          type: 'info',
          hint: undefined
        }
      ]
    })
  })

  it('parse rejects', async () => {
    const err = new Error('something went wrong')
    sinon.stub(Papa, 'parse').callsFake((file, config) => {
      config.error(err)
    })
    const file = {}
    await expect(csv.parse(file)).to.be.rejectedWith(err)
  })
})
