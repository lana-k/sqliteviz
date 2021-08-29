import { expect } from 'chai'
import sinon from 'sinon'
import csv from '@/lib/csv'
import Papa from 'papaparse'

describe('csv.js', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('getResult with fields', () => {
    const source = {
      data: [
        { id: 1, 'name ': 'foo', date: new Date('2021-06-30T14:10:24.717Z') },
        { id: 2, 'name ': 'bar', date: new Date('2021-07-30T14:10:15.717Z') }
      ],
      meta: {
        fields: ['id', 'name ', 'date']
      }
    }
    expect(csv.getResult(source)).to.eql({
      columns: ['id', 'name', 'date'],
      values: {
        id: [1, 2],
        name: ['foo', 'bar'],
        date: ['2021-06-30T14:10:24.717Z', '2021-07-30T14:10:15.717Z']
      }
    })
  })

  it('getResult without fields', () => {
    const source = {
      data: [
        [1, 'foo', new Date('2021-06-30T14:10:24.717Z')],
        [2, 'bar', new Date('2021-07-30T14:10:15.717Z')]
      ],
      meta: {}
    }
    expect(csv.getResult(source)).to.eql({
      columns: ['col1', 'col2', 'col3'],
      values: {
        col1: [1, 2],
        col2: ['foo', 'bar'],
        col3: ['2021-06-30T14:10:24.717Z', '2021-07-30T14:10:15.717Z']
      }
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
        values: {
          col1: [1, 2],
          col2: ['foo', 'bar']
        }
      },
      delimiter: ',',
      rowCount: 2,
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

  it('prepareForExport', () => {
    const resultSet = {
      columns: ['id', 'name'],
      values: {
        id: [1, 2],
        name: ['foo', 'bar']
      }
    }
    expect(csv.prepareForExport(resultSet)).to.eql({
      fields: ['id', 'name'],
      data: [
        [1, 'foo'],
        [2, 'bar']
      ]
    })
  })

  it('serialize returns tsv text', () => {
    const resultSet = {
      columns: ['id', 'name'],
      values: {
        id: [1, 2],
        name: ['foo', 'bar']
      }
    }
    expect(csv.serialize(resultSet)).to.eql('id\tname\r\n1\tfoo\r\n2\tbar')
  })
})
