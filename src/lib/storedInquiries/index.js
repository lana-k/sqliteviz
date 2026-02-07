import { nanoid } from 'nanoid'
import fu from '@/lib/utils/fileIo'
import events from '@/lib/utils/events'
import migration from './_migrations'

const migrate = migration._migrate
const myInquiriesKey = 'myInquiries'

export default {
  version: 3,
  myInquiriesKey,
  getStoredInquiries() {
    let myInquiries = JSON.parse(localStorage.getItem(myInquiriesKey))
    if (!myInquiries) {
      const oldInquiries = localStorage.getItem('myQueries')
      if (oldInquiries) {
        myInquiries = migrate(1, JSON.parse(oldInquiries))
        this.updateStorage(myInquiries)
        return myInquiries
      }
      return []
    }

    if (myInquiries.version === 2) {
      myInquiries = migrate(2, myInquiries.inquiries)
      this.updateStorage(myInquiries)
      return myInquiries
    }

    return myInquiries.inquiries || []
  },

  duplicateInquiry(baseInquiry) {
    const newInquiry = JSON.parse(JSON.stringify(baseInquiry))
    newInquiry.name = newInquiry.name + ' Copy'
    newInquiry.id = nanoid()
    newInquiry.createdAt = new Date().toJSON()
    newInquiry.updatedAt = new Date().toJSON()
    delete newInquiry.isPredefined

    return newInquiry
  },

  isTabNeedName(inquiryTab) {
    return inquiryTab.isPredefined || !inquiryTab.name
  },

  updateStorage(inquiries) {
    localStorage.setItem(
      myInquiriesKey,
      JSON.stringify({ version: this.version, inquiries })
    )
  },

  serialiseInquiries(inquiryList) {
    const preparedData = JSON.parse(JSON.stringify(inquiryList))
    preparedData.forEach(inquiry => delete inquiry.isPredefined)
    return JSON.stringify(
      { version: this.version, inquiries: preparedData },
      null,
      4
    )
  },

  deserialiseInquiries(str) {
    const inquiries = JSON.parse(str)
    let inquiryList = []
    if (!inquiries.version) {
      // Turn data into array if they are not
      inquiryList = !Array.isArray(inquiries) ? [inquiries] : inquiries
      inquiryList = migrate(1, inquiryList)
    } else if (inquiries.version === 2) {
      inquiryList = migrate(2, inquiries.inquiries)
    } else {
      inquiryList = inquiries.inquiries || []
    }

    // Generate new ids if they are the same as existing inquiries
    inquiryList.forEach(inquiry => {
      const allInquiriesIds = this.getStoredInquiries().map(
        inquiry => inquiry.id
      )
      if (allInquiriesIds.includes(inquiry.id)) {
        inquiry.id = nanoid()
      }
    })

    return inquiryList
  },

  importInquiries() {
    return fu.importFile().then(str => {
      const inquiries = this.deserialiseInquiries(str)

      events.send('inquiry.import', inquiries.length)

      return inquiries
    })
  },
  export(inquiryList, fileName) {
    const jsonStr = this.serialiseInquiries(inquiryList)
    fu.exportToFile(jsonStr, fileName)

    events.send('inquiry.export', inquiryList.length)
  },

  async readPredefinedInquiries() {
    const res = await fu.readFile('./inquiries.json')
    const data = await res.json()

    if (!data.version) {
      return data.length > 0 ? migrate(1, data) : []
    } else if (data.version === 2) {
      return migrate(2, data.inquiries)
    } else {
      return data.inquiries
    }
  }
}
