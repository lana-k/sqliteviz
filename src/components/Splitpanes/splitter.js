export default {
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

  // Returns the new position in percents.
  calculateOffset (event, { container, isHorisontal, paneBeforeMax, paneAfterMax }) {
    const dragPercentage = this.getCurrentDragPercentage(event, container, isHorisontal)

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
