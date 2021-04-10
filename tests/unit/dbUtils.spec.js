import { expect } from 'chai'
import dbUtils from '@/dbUtils'

describe('dbUtils.js', () => {
  it('generateChunks', () => {
    const arr = ['1', '2', '3', '4', '5']
    const size = 2
    const chunks = dbUtils.generateChunks(arr, size)
    const output = []
    for (const chunk of chunks) {
      output.push(chunk)
    }
    expect(output[0]).to.eql(['1', '2'])
    expect(output[1]).to.eql(['3', '4'])
    expect(output[2]).to.eql(['5'])
  })

  it('getInsertStmt', () => {
    const columns = ['id', 'name']
    expect(dbUtils.getInsertStmt(columns))
      .to.equal('INSERT INTO csv_import ("id", "name") VALUES (?, ?);')
  })

  it('getCreateStatement', () => {
    const columns = ['id', 'name', 'isAdmin', 'startDate']
    const values = [
      [1, 'foo', true, new Date()],
      [2, 'bar', false, new Date()]
    ]
    expect(dbUtils.getCreateStatement(columns, values)).to.equal(
      'CREATE table csv_import("id" REAL, "name" TEXT, "isAdmin" INTEGER, "startDate" TEXT);'
    )
  })
})
