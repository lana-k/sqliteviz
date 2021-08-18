import { expect } from 'chai'
import stmts from '@/lib/database/_statements'

describe('_statements.js', () => {
  it('generateChunks', () => {
    const source = {
      id: ['1', '2', '3', '4', '5']
    }
    const size = 2
    const chunks = stmts.generateChunks(source, size)
    const output = []
    for (const chunk of chunks) {
      output.push(chunk)
    }
    expect(output[0]).to.eql([['1'], ['2']])
    expect(output[1]).to.eql([['3'], ['4']])
    expect(output[2]).to.eql([['5']])
  })

  it('getInsertStmt', () => {
    const columns = ['id', 'name']
    expect(stmts.getInsertStmt('foo', columns))
      .to.equal('INSERT INTO "foo" ("id", "name") VALUES (?, ?);')
  })

  it('getCreateStatement', () => {
    const data = {
      id: [1, 2],
      name: ['foo', 'bar'],
      isAdmin: [true, false],
      startDate: [new Date(), new Date()]
    }

    expect(stmts.getCreateStatement('foo', data)).to.equal(
      'CREATE table "foo"("id" REAL, "name" TEXT, "isAdmin" INTEGER, "startDate" TEXT);'
    )
  })
})
