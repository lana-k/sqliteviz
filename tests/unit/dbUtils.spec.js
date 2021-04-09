import { expect } from 'chai'
import dbUtils from '@/dbUtils.js'

describe('dbUtils.js', () => {
  it('generator', () => {
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
})
