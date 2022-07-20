import { nanoid } from 'nanoid'
import fu from '@/lib/utils/fileIo'
import events from '@/lib/utils/events'
import migration from './_migrations'

const migrate = migration._migrate

export default {
  version: 2,
  getStoredInquiries () {
    let myInquiries = JSON.parse(localStorage.getItem('myInquiries'))
    if (!myInquiries) {
      const oldInquiries = localStorage.getItem('myQueries')
      if (oldInquiries) {
        myInquiries = migrate(1, JSON.parse(oldInquiries))
        this.updateStorage(myInquiries)
        return myInquiries
      }
      return []
    }

    return (myInquiries && myInquiries.inquiries) || []
  },

  duplicateInquiry (baseInquiry) {
    const newInquiry = JSON.parse(JSON.stringify(baseInquiry))
    newInquiry.name = newInquiry.name + ' Copy'
    newInquiry.id = nanoid()
    newInquiry.createdAt = new Date()
    delete newInquiry.isPredefined

    return newInquiry
  },

  isTabNeedName (inquiryTab) {
    const isFromScratch = !inquiryTab.initName
    return inquiryTab.isPredefined || isFromScratch
  },

  save (inquiryTab, newName) {
    const value = {
      id: inquiryTab.isPredefined ? nanoid() : inquiryTab.id,
      query: inquiryTab.query,
      viewType: inquiryTab.$refs.dataView.mode,
      viewOptions: inquiryTab.$refs.dataView.getOptionsForSave(),
      name: newName || inquiryTab.initName
    }

    // Get inquiries from local storage
    const myInquiries = this.getStoredInquiries()

    // Set createdAt
    if (newName) {
      value.createdAt = new Date()
    } else {
      var inquiryIndex = myInquiries.findIndex(oldInquiry => oldInquiry.id === inquiryTab.id)
      value.createdAt = myInquiries[inquiryIndex].createdAt
    }

    // Insert in inquiries list
    if (newName) {
      myInquiries.push(value)
    } else {
      myInquiries[inquiryIndex] = value
    }

    // Save to local storage
    this.updateStorage(myInquiries)
    return value
  },

  updateStorage (inquiries) {
    localStorage.setItem('myInquiries', JSON.stringify({ version: this.version, inquiries }))
  },

  serialiseInquiries (inquiryList) {
    const preparedData = JSON.parse(JSON.stringify(inquiryList))
    preparedData.forEach(inquiry => delete inquiry.isPredefined)
    return JSON.stringify({ version: this.version, inquiries: preparedData }, null, 4)
  },

  deserialiseInquiries (str) {
    const inquiries = JSON.parse(str)
    let inquiryList = []
    if (!inquiries.version) {
      // Turn data into array if they are not
      inquiryList = !Array.isArray(inquiries) ? [inquiries] : inquiries
      inquiryList = migrate(1, inquiryList)
    } else {
      inquiryList = inquiries.inquiries || []
    }

    // Generate new ids if they are the same as existing inquiries
    inquiryList.forEach(inquiry => {
      const allInquiriesIds = this.getStoredInquiries().map(inquiry => inquiry.id)
      if (allInquiriesIds.includes(inquiry.id)) {
        inquiry.id = nanoid()
      }
    })

    return inquiryList
  },

  importInquiries () {
    return fu.importFile()
      .then(str => {
        const inquires = this.deserialiseInquiries(str)

        events.send('inquiry.import', inquires.length)

        return inquires
      })
  },
  export (inquiryList, fileName) {
    const jsonStr = this.serialiseInquiries(inquiryList)
    fu.exportToFile(jsonStr, fileName)

    events.send('inquiry.export', inquiryList.length)
  },

  async readPredefinedInquiries () {
    const res = await fu.readFile('./inquiries.json')
    const data = await res.json()

    if (!data.version) {
      return data.length > 0 ? migrate(1, data) : []
    } else {
      return data.inquiries
    }
  }
}
