import { expect } from 'chai'
import time from '@/lib/utils/time'

describe('time.js', () => {
  it('getPeriod', () => {
    // 1.01.2021 13:00:00 000
    let start = new Date(2021, 0, 1, 13, 0, 0, 0)

    // 3.01.2021 22:15:20 500
    let end = new Date(2021, 0, 3, 22, 15, 20, 500)

    expect(time.getPeriod(start, end)).to.equal('2 d 9 h 15 m 20 s 500 ms')

    // 1.01.2021 13:00:00 000
    start = new Date(2021, 0, 1, 13, 0, 0, 0)

    // 1.01.2021 22:00:20 000
    end = new Date(2021, 0, 1, 22, 0, 20, 0)

    expect(time.getPeriod(start, end)).to.equal('9 h 20 s')

    // 1.01.2021 13:00:00 000
    start = new Date(2021, 0, 1, 13, 0, 0, 0)

    // 1.01.2021 13:00:00 45
    end = new Date(2021, 0, 1, 13, 0, 0, 45)

    expect(time.getPeriod(start, end)).to.equal('45 ms')
  })
})
