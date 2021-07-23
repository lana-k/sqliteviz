export default {
  _migrate (installedVersion, inquiries) {
    if (installedVersion === 1) {
      inquiries.forEach(inquire => {
        inquire.viewType = 'chart'
        inquire.viewOptions = inquire.chart
        delete inquire.chart
      })
      return inquiries
    }
  }
}
