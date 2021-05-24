import { expect } from 'chai'
import stmts from '@/lib/database/_statements'

describe('_statements.js', () => {
  it('generateChunks', () => {
    const arr = ['1', '2', '3', '4', '5']
    const size = 2
    const chunks = stmts.generateChunks(arr, size)
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
    expect(stmts.getInsertStmt('foo', columns))
      .to.equal('INSERT INTO "foo" ("id", "name") VALUES (?, ?);')
  })

  it('getCreateStatement', () => {
    const columns = ['id', 'name', 'isAdmin', 'startDate']
    const values = [
      [1, 'foo', true, new Date()],
      [2, 'bar', false, new Date()]
    ]
    expect(stmts.getCreateStatement('foo', columns, values)).to.equal(
      'CREATE table "foo"("id" REAL, "name" TEXT, "isAdmin" INTEGER, "startDate" TEXT);'
    )
  })

  it('getColumns', () => {
    const sql = `CREATE TABLE test (
      col1,
      col2 integer,
      col3 decimal(5,2),
      col4 varchar(30)
    )`
    expect(stmts.getColumns(sql)).to.eql([
      { name: 'col1', type: 'N/A' },
      { name: 'col2', type: 'integer' },
      { name: 'col3', type: 'decimal(5, 2)' },
      { name: 'col4', type: 'varchar(30)' }
    ])
  })

  it('getColumns with virtual table', async () => {
    const sql = `
      CREATE VIRTUAL TABLE test_virtual USING fts4(
        col1, col2,
        notindexed=col1, notindexed=col2,
        tokenize=unicode61 "tokenchars=.+#")
    `
    expect(stmts.getColumns(sql)).to.eql([
      { name: 'col1', type: 'N/A' },
      { name: 'col2', type: 'N/A' }
    ])
  })
})
