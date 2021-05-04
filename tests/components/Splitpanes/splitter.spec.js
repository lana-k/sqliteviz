import { expect } from 'chai'
import sinon from 'sinon'
import splitter from '@/components/Splitpanes/splitter'

describe('splitter.js', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('getCurrentMouseDrag', () => {
    const container = document.createElement('div')
    container.style.width = '100px'
    container.style.height = '100px'
    container.style.position = 'fixed'
    container.style.top = '10px'
    container.style.left = '20px'

    document.body.appendChild(container)

    const event = new MouseEvent('mousemove', {
      clientX: 70,
      clientY: 80
    })

    const mouseDrag = splitter.getCurrentMouseDrag(event, container)
    expect(mouseDrag.x).to.equal(50)
    expect(mouseDrag.y).to.equal(70)
  })

  it('getCurrentDragPercentage - horisontal', () => {
    sinon.stub(splitter, 'getCurrentMouseDrag').returns({ x: 50, y: 70 })

    const event = {}
    const isHorisontal = true
    const container = document.createElement('div')
    container.style.width = '200px'
    container.style.height = '140px'

    document.body.appendChild(container)

    const dragPercentage = splitter.getCurrentDragPercentage(event, container, isHorisontal)
    expect(dragPercentage).to.equal(50)
  })

  it('getCurrentDragPercentage - vertical', () => {
    sinon.stub(splitter, 'getCurrentMouseDrag').returns({ x: 50, y: 70 })

    const event = {}
    const isHorisontal = false
    const container = document.createElement('div')
    container.style.width = '200px'
    container.style.height = '140px'

    document.body.appendChild(container)

    const dragPercentage = splitter.getCurrentDragPercentage(event, container, isHorisontal)
    expect(dragPercentage).to.equal(25)
  })

  it('calculateOffset', () => {
    sinon.stub(splitter, 'getCurrentDragPercentage').returns(25)

    const event = {}
    const container = {}

    const splitterInfo = {
      container,
      paneBeforeMax: 70,
      paneAfterMax: 80,
      isHorisontal: true
    }
    const offset = splitter.calculateOffset(event, splitterInfo)

    expect(offset).to.equal(25)
  })

  it('calculateOffset prevents dragging beyond paneBefore max', () => {
    sinon.stub(splitter, 'getCurrentDragPercentage').returns(75)

    const event = {}
    const container = {}
    const splitterInfo = {
      container,
      paneBeforeMax: 70,
      paneAfterMax: 80,
      isHorisontal: true
    }
    const offset = splitter.calculateOffset(event, splitterInfo)

    expect(offset).to.equal(70)
  })

  it('calculateOffset prevents dragging beyond paneAfter max', () => {
    sinon.stub(splitter, 'getCurrentDragPercentage').returns(10)

    const event = {}
    const container = {}
    const splitterInfo = {
      container,
      paneBeforeMax: 70,
      paneAfterMax: 80,
      isHorisontal: true
    }
    const offset = splitter.calculateOffset(event, splitterInfo)

    expect(offset).to.equal(20)
  })
})
