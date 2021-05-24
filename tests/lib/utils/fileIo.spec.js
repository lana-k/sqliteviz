import { expect } from 'chai'
import fIo from '@/lib/utils/fileIo'
import sinon from 'sinon'

describe('fileIo.js', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('exportToFile (octet/stream by default)', () => {
    const spyAnchor = document.createElement('a')
    sinon.spy(spyAnchor, 'click')
    sinon.stub(document, 'createElement').returns(spyAnchor)
    sinon.spy(URL, 'createObjectURL')
    sinon.spy(URL, 'revokeObjectURL')
    sinon.spy(window, 'Blob')

    fIo.exportToFile('foo', 'foo.txt')

    expect(document.createElement.calledOnceWith('a')).to.equal(true)

    expect(window.Blob.calledOnceWith(['foo'], { type: 'octet/stream' })).to.equal(true)
    const blob = window.Blob.returnValues[0]
    expect(URL.createObjectURL.calledOnceWith(blob)).to.equal(true)

    const url = URL.createObjectURL.returnValues[0]
    expect(spyAnchor.href).to.equal(url)

    expect(spyAnchor.download).to.equal('foo.txt')

    expect(spyAnchor.click.calledOnce).to.equal(true)
    expect(URL.revokeObjectURL.calledOnceWith(url)).to.equal(true)
  })

  it('exportToFile', () => {
    const spyAnchor = document.createElement('a')
    sinon.spy(spyAnchor, 'click')
    sinon.stub(document, 'createElement').returns(spyAnchor)
    sinon.spy(URL, 'createObjectURL')
    sinon.spy(URL, 'revokeObjectURL')
    sinon.spy(window, 'Blob')

    fIo.exportToFile('foo', 'foo.html', 'text/html')

    expect(document.createElement.calledOnceWith('a')).to.equal(true)

    expect(window.Blob.calledOnceWith(['foo'], { type: 'text/html' })).to.equal(true)
    const blob = window.Blob.returnValues[0]
    expect(URL.createObjectURL.calledOnceWith(blob)).to.equal(true)

    const url = URL.createObjectURL.returnValues[0]
    expect(spyAnchor.href).to.equal(url)

    expect(spyAnchor.download).to.equal('foo.html')

    expect(spyAnchor.click.calledOnce).to.equal(true)
    expect(URL.revokeObjectURL.calledOnceWith(url)).to.equal(true)
  })

  it('importFile', async () => {
    const spyInput = document.createElement('input')
    sinon.stub(spyInput, 'click')

    const blob = new Blob(['foo'])
    Object.defineProperty(spyInput, 'files', {
      value: [blob],
      writable: false
    })

    sinon.stub(document, 'createElement').returns(spyInput)

    setTimeout(() => { spyInput.dispatchEvent(new Event('change')) })

    const data = await fIo.importFile()
    expect(data).to.equal('foo')
    expect(document.createElement.calledOnceWith('input')).to.equal(true)
    expect(spyInput.type).to.equal('file')
    expect(spyInput.accept).to.equal('.json')
    expect(spyInput.click.calledOnce).to.equal(true)
  })

  it('readFile', () => {
    sinon.spy(window, 'fetch')

    fIo.readFile('./foo.bar')
    expect(window.fetch.calledOnceWith('./foo.bar')).to.equal(true)
  })

  it('readAsArrayBuffer resolves', async () => {
    const blob = new Blob(['foo'])
    const buffer = await fIo.readAsArrayBuffer(blob)

    const uint8Array = new Uint8Array(buffer)
    const text = new TextDecoder().decode(uint8Array)
    expect(text).to.equal('foo')
  })

  it('readAsArrayBuffer rejects', async () => {
    const r = new FileReader()
    r.readAsArrayBuffer = () => {
      r.dispatchEvent(new Event('error'))
    }
    sinon.stub(window, 'FileReader').returns(r)

    const blob = new Blob(['foo'])
    await expect(fIo.readAsArrayBuffer(blob)).to.be.rejectedWith('Problem parsing input file.')
  })

  it('isDatabase', () => {
    let file = { type: 'application/vnd.sqlite3' }
    expect(fIo.isDatabase(file)).to.equal(true)

    file = { type: 'application/x-sqlite3' }
    expect(fIo.isDatabase(file)).to.equal(true)

    file = { type: '', name: 'test.db' }
    expect(fIo.isDatabase(file)).to.equal(true)

    file = { type: '', name: 'test.sqlite' }
    expect(fIo.isDatabase(file)).to.equal(true)

    file = { type: '', name: 'test.sqlite3' }
    expect(fIo.isDatabase(file)).to.equal(true)

    file = { type: '', name: 'test.csv' }
    expect(fIo.isDatabase(file)).to.equal(false)

    file = { type: 'text', name: 'test.db' }
    expect(fIo.isDatabase(file)).to.equal(false)
  })

  it('getFileName', () => {
    expect(fIo.getFileName({ name: 'foo.csv' })).to.equal('foo')
    expect(fIo.getFileName({ name: 'foo.bar.db' })).to.equal('foo.bar')
  })
})
