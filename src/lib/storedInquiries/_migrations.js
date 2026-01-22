export default {
  _migrate(installedVersion, inquiries) {
    if (installedVersion < 2) {
      inquiries.forEach(inquiry => {
        inquiry.viewType = 'chart'
        inquiry.viewOptions = inquiry.chart
        delete inquiry.chart
      })
    }

    if (installedVersion < 3) {
      inquiries.forEach(inquiry => {
        if (inquiry.viewType === 'graph') {
          inquiry.viewOptions.style.nodes.color.opacity = 100
        }
      })
    }

    return inquiries
  }
}
