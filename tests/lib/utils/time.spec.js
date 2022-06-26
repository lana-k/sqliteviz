import { expect } from 'chai'
import time from '@/lib/utils/time'

describe('time.js', () => {
  it('getPeriod', () => {
    // 1.01.2021 13:00:00 000
    let start = new Date(2021, 0, 1, 13, 0, 0, 0)

    // 1.01.2021 13:01:00 500
    let end = new Date(2021, 0, 1, 13, 1, 0, 500)

    expect(time.getPeriod(start, end)).to.equal('60.500s')

    // 1.01.2021 13:00:00 000
    start = new Date(2021, 0, 1, 13, 0, 0, 0)

    // 1.01.2021 13:00:20 500
    end = new Date(2021, 0, 1, 13, 0, 20, 500)

    expect(time.getPeriod(start, end)).to.equal('20.500s')

    // 1.01.2021 13:00:00 000
    start = new Date(2021, 0, 1, 13, 0, 0, 0)

    // 1.01.2021 13:00:00 45
    end = new Date(2021, 0, 1, 13, 0, 0, 45)

    expect(time.getPeriod(start, end)).to.equal('0.045s')
  })

  it('sleep resolves after n ms', async () => {
    let before = Date.now()
    await time.sleep(10)
    expect(Date.now() - before).to.be.least(10)

    before = Date.now()
    await time.sleep(30)
    expect(Date.now() - before).to.be.least(30)
  })
})
