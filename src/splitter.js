export default {
  bindEvents (onMouseMove, onMouseUp) {
    // Passive: false to prevent scrolling while touch dragging.
    document.addEventListener('mousemove', onMouseMove, { passive: false })
    document.addEventListener('mouseup', onMouseUp)

    if ('ontouchstart' in window) {
      document.addEventListener('touchmove', onMouseMove, { passive: false })
      document.addEventListener('touchend', onMouseUp)
    }
  },

  unbindEvents (onMouseMove, onMouseUp) {
    document.removeEventListener('mousemove', onMouseMove, { passive: false })
    document.removeEventListener('mouseup', onMouseUp)

    if ('ontouchstart' in window) {
      document.removeEventListener('touchmove', onMouseMove, { passive: false })
      document.removeEventListener('touchend', onMouseUp)
    }
  },

  // Get the cursor position relative to the splitpane container.
  getCurrentMouseDrag (event, container) {
    const rect = container.getBoundingClientRect()
    const { clientX, clientY } = ('ontouchstart' in window && event.touches)
      ? event.touches[0]
      : event
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  },

  // Returns the drag percentage of the splitter relative to the 2 panes it's inbetween.
  getCurrentDragPercentage (event, container, isHorisontal) {
    let drag = this.getCurrentMouseDrag(event, container)
    drag = drag[isHorisontal ? 'y' : 'x']
    const containerSize = container[isHorisontal ? 'clientHeight' : 'clientWidth']
    return drag * 100 / containerSize
  },

  calculateOffset (paneBeforeMax, paneAfterMax, dragPercentage) {
    const paneBeforeMaxReached = paneBeforeMax < 100 && (dragPercentage >= paneBeforeMax)
    const paneAfterMaxReached = paneAfterMax < 100 && (dragPercentage <= 100 - paneAfterMax)

    // Prevent dragging beyond pane max.
    if (paneBeforeMaxReached || paneAfterMaxReached) {
      return paneBeforeMaxReached ? paneBeforeMax : Math.max(100 - paneAfterMax, 0)
    } else {
      return Math.min(Math.max(dragPercentage, 0), paneBeforeMax)
    }
  }
}
