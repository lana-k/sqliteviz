export default {
  _migrate (installedVersion, inquiries) {
    if (installedVersion === 1) {
      inquiries.forEach(inquire => {
        inquiries.viewType = 'chart'
        inquiries.viewOptions = inquire.chart
        delete inquire.chart
      })
      return inquiries
    }
  }
}
