import { expect } from 'chai'
import fu from '@/fileUtils.js'
import sinon from 'sinon'

describe('fileUtils.js', () => {
  afterEach(()=> {
    document.createElement.restore()
    URL.revokeObjectURL.restore()
    URL.createObjectURL.restore()
    window.Blob.restore()
  })

  it('exportToFile (octet/stream by default)', () => {
    const spyAnchor = document.createElement('a')
    sinon.spy(spyAnchor, 'click')
    sinon.spy(spyAnchor, 'remove')
    sinon.stub(document, 'createElement').returns(spyAnchor)
    sinon.spy(URL, 'createObjectURL')
    sinon.spy(URL, 'revokeObjectURL')
    sinon.spy(window, 'Blob')
    
    const str = 'foo'
    fu.exportToFile('foo','foo.txt')
    
    expect(document.createElement.calledOnceWith('a')).to.equal(true)
    
    expect(window.Blob.calledOnceWith(['foo'], { type: 'octet/stream' })).to.equal(true)
    const blob = window.Blob.returnValues[0]
    expect(URL.createObjectURL.calledOnceWith(blob)).to.equal(true) 
    
    const url = URL.createObjectURL.returnValues[0]
    expect(spyAnchor.href).to.equal(url)

    expect(spyAnchor.download).to.equal('foo.txt')

    expect(spyAnchor.click.calledOnce).to.equal(true)

    expect(spyAnchor.remove.calledOnce).to.equal(true)
    expect(URL.revokeObjectURL.calledOnceWith(url)).to.equal(true)
  }),

  it('exportToFile', () => {
    const spyAnchor = document.createElement('a')
    sinon.spy(spyAnchor, 'click')
    sinon.spy(spyAnchor, 'remove')
    sinon.stub(document, 'createElement').returns(spyAnchor)
    sinon.spy(URL, 'createObjectURL')
    sinon.spy(URL, 'revokeObjectURL')
    sinon.spy(window, 'Blob')
    
    const str = 'foo'
    fu.exportToFile('foo','foo.html', 'text/html')
    
    expect(document.createElement.calledOnceWith('a')).to.equal(true)
    
    expect(window.Blob.calledOnceWith(['foo'], { type: 'text/html' })).to.equal(true)
    const blob = window.Blob.returnValues[0]
    expect(URL.createObjectURL.calledOnceWith(blob)).to.equal(true) 
    
    const url = URL.createObjectURL.returnValues[0]
    expect(spyAnchor.href).to.equal(url)

    expect(spyAnchor.download).to.equal('foo.html')

    expect(spyAnchor.click.calledOnce).to.equal(true)

    expect(spyAnchor.remove.calledOnce).to.equal(true)
    expect(URL.revokeObjectURL.calledOnceWith(url)).to.equal(true)
  })
})
