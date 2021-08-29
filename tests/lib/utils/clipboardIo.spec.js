import { expect } from 'chai'
import cIo from '@/lib/utils/clipboardIo'
import sinon from 'sinon'

describe('clipboardIo.js', async () => {
  afterEach(() => {
    sinon.restore()
  })

  it('copyCsv', async () => {
    sinon.stub(navigator.clipboard, 'writeText').resolves(true)
    await cIo.copyCsv('id\tname\r\n1\t2')
    expect(navigator.clipboard.writeText.calledOnceWith('id\tname\r\n1\t2'))
  })

  it('copyImage for canvas calls _copyCanvas', async () => {
    sinon.stub(cIo, '_copyCanvas').resolves(true)
    const canvas = document.createElement('canvas')

    await cIo.copyImage(canvas)
    expect(cIo._copyCanvas.calledOnceWith(canvas))
  })

  it('copyImage for dataUrl calls _copyFromDataUrl', async () => {
    sinon.stub(cIo, '_copyFromDataUrl').resolves(true)
    const url = document.createElement('canvas').toDataURL()
    await cIo.copyImage(url)
    expect(cIo._copyFromDataUrl.calledOnceWith(url))
  })
})
