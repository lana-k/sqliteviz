import { expect } from 'chai'
import sinon from 'sinon'
import storedInquiries from '@/lib/storedInquiries'
import fu from '@/lib/utils/fileIo'

describe('storedInquiries.js', () => {
  beforeEach(() => {
    localStorage.removeItem('myInquiries')
    localStorage.removeItem('myQueries')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('getStoredInquiries returns emplty array when storage is empty', () => {
    const inquiries = storedInquiries.getStoredInquiries()
    expect(inquiries).to.eql([])
  })

  it('getStoredInquiries migrates and returns inquiries of v1', () => {
    localStorage.setItem(
      'myQueries',
      JSON.stringify([
        {
          id: '123',
          name: 'foo',
          query: 'SELECT * FROM foo',
          chart: { here_are: 'foo chart settings' }
        },
        {
          id: '456',
          name: 'bar',
          query: 'SELECT * FROM bar',
          chart: { here_are: 'bar chart settings' }
        }
      ])
    )
    const inquiries = storedInquiries.getStoredInquiries()
    expect(inquiries).to.eql([
      {
        id: '123',
        name: 'foo',
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: { here_are: 'foo chart settings' }
      },
      {
        id: '456',
        name: 'bar',
        query: 'SELECT * FROM bar',
        viewType: 'chart',
        viewOptions: { here_are: 'bar chart settings' }
      }
    ])
  })

  it('getStoredInquiries migrates and returns inquiries of v2', () => {
    localStorage.setItem(
      'myInquiries',
      JSON.stringify({
        version: 2,
        inquiries: [
          {
            id: 'Xh1Hc9v7P3mRPZVM59QiC',
            query: 'SELECT * from doc',
            viewType: 'graph',
            viewOptions: {
              structure: {
                nodeId: 'node_id',
                objectType: 'object_type',
                edgeSource: 'source',
                edgeTarget: 'target'
              },
              style: {
                backgroundColor: 'white',
                nodes: {
                  size: { type: 'constant', value: 10 },
                  color: {
                    type: 'calculated',
                    method: 'degree',
                    colorscale: null,
                    mode: 'continious',
                    colorscaleDirection: 'reversed'
                  },
                  label: { source: 'label', color: '#444444' }
                },
                edges: {
                  showDirection: true,
                  size: { type: 'constant', value: 2 },
                  color: { type: 'constant', value: '#a2b1c6' },
                  label: { source: null, color: '#a2b1c6' }
                }
              },
              layout: { type: 'circular', options: null }
            },
            name: 'student graph',
            updatedAt: '2026-01-19T21:49:40.708Z',
            createdAt: '2026-01-19T21:46:13.899Z'
          },
          {
            id: 'Yh1Hc9v7P3mRPZVM59QiD',
            query: 'SELECT * from test',
            viewType: 'chart',
            viewOptions: 'some chart view options',
            name: 'student chart',
            updatedAt: '2026-01-19T21:49:40.708Z',
            createdAt: '2026-01-19T21:46:13.899Z'
          }
        ]
      })
    )
    const inquiries = storedInquiries.getStoredInquiries()
    expect(inquiries).to.eql([
      {
        id: 'Xh1Hc9v7P3mRPZVM59QiC',
        query: 'SELECT * from doc',
        viewType: 'graph',
        viewOptions: {
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          },
          style: {
            backgroundColor: 'white',
            nodes: {
              size: { type: 'constant', value: 10 },
              color: {
                type: 'calculated',
                method: 'degree',
                colorscale: null,
                mode: 'continious',
                colorscaleDirection: 'reversed',
                opacity: 100
              },
              label: { source: 'label', color: '#444444' }
            },
            edges: {
              showDirection: true,
              size: { type: 'constant', value: 2 },
              color: { type: 'constant', value: '#a2b1c6' },
              label: { source: null, color: '#a2b1c6' }
            }
          },
          layout: { type: 'circular', options: null }
        },
        name: 'student graph',
        updatedAt: '2026-01-19T21:49:40.708Z',
        createdAt: '2026-01-19T21:46:13.899Z'
      },
      {
        id: 'Yh1Hc9v7P3mRPZVM59QiD',
        query: 'SELECT * from test',
        viewType: 'chart',
        viewOptions: 'some chart view options',
        name: 'student chart',
        updatedAt: '2026-01-19T21:49:40.708Z',
        createdAt: '2026-01-19T21:46:13.899Z'
      }
    ])
  })

  it('updateStorage and getStoredInquiries', () => {
    const data = [{ id: 1 }, { id: 2 }]
    storedInquiries.updateStorage(data)
    const inquiries = storedInquiries.getStoredInquiries()
    expect(inquiries).to.eql(data)
  })

  it('duplicateInquiry', () => {
    const now = new Date()
    const nowPlusMinute = new Date(now.getTime() + 60 * 1000)
    const base = {
      id: 1,
      name: 'foo',
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: [],
      createdAt: new Date(2021, 0, 1).toJSON(),
      isPredefined: true
    }

    const copy = storedInquiries.duplicateInquiry(base)
    expect(copy).to.have.property('id').which.not.equal(base.id)
    expect(copy)
      .to.have.property('name')
      .which.equal(base.name + ' Copy')
    expect(copy).to.have.property('query').which.equal(base.query)
    expect(copy).to.have.property('viewType').which.equal(base.viewType)
    expect(copy).to.have.property('viewOptions').which.eql(base.viewOptions)
    expect(copy).to.have.property('createdAt')
    expect(new Date(copy.createdAt)).within(now, nowPlusMinute)
    expect(copy).to.not.have.property('isPredefined')
  })

  it('isTabNeedName returns false when the inquiry has a name and is not predefined', () => {
    const tab = {
      name: 'foo'
    }
    expect(storedInquiries.isTabNeedName(tab)).to.equal(false)
  })

  it('isTabNeedName returns true when the inquiry has no name and is not predefined', () => {
    const tab = {
      name: null,
      tempName: 'Untitled'
    }
    expect(storedInquiries.isTabNeedName(tab)).to.equal(true)
  })

  it('isTabNeedName returns true when the inquiry is predefined', () => {
    const tab = {
      name: 'foo',
      isPredefined: true
    }

    expect(storedInquiries.isTabNeedName(tab)).to.equal(true)
  })

  it('serialiseInquiries', () => {
    const inquiryList = [
      {
        id: 1,
        name: 'foo',
        query: 'SELECT from foo',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T14:17:49.524Z',
        isPredefined: true
      },
      {
        id: 2,
        name: 'bar',
        query: 'SELECT from bar',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-12-03T14:17:49.524Z'
      }
    ]

    const str = storedInquiries.serialiseInquiries(inquiryList)
    const parsedJson = JSON.parse(str)

    expect(parsedJson.version).to.equal(3)
    expect(parsedJson.inquiries).to.have.lengthOf(2)
    expect(parsedJson.inquiries[1]).to.eql(inquiryList[1])
    expect(parsedJson.inquiries[0]).to.eql({
      id: 1,
      name: 'foo',
      query: 'SELECT from foo',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-11-03T14:17:49.524Z'
    })
  })

  it('deserialiseInquiries migrates inquiries', () => {
    const str = `[
      {
        "id": 1,
        "name": "foo",
        "query": "select * from foo",
        "chart": [],
        "createdAt": "2020-11-03T14:17:49.524Z" 
      },
      {
        "id": 2,
        "name": "bar",
        "query": "select * from bar",
        "chart": [],
        "createdAt": "2020-11-04T14:17:49.524Z" 
      }
    ]`

    const inquiry = storedInquiries.deserialiseInquiries(str)
    expect(inquiry).to.eql([
      {
        id: 1,
        name: 'foo',
        query: 'select * from foo',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T14:17:49.524Z'
      },
      {
        id: 2,
        name: 'bar',
        query: 'select * from bar',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-04T14:17:49.524Z'
      }
    ])
  })

  it('deserialiseInquiries return array for one inquiry of v1', () => {
    const str = `
      {
        "id": 1,
        "name": "foo",
        "query": "select * from foo",
        "chart": [],
        "createdAt": "2020-11-03T14:17:49.524Z" 
      }
    `

    const inquiry = storedInquiries.deserialiseInquiries(str)
    expect(inquiry).to.eql([
      {
        id: 1,
        name: 'foo',
        query: 'select * from foo',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T14:17:49.524Z'
      }
    ])
  })

  it('deserialiseInquiries generates new id to avoid duplication', () => {
    storedInquiries.updateStorage([{ id: 1 }])
    const str = `{
      "version": 3,
      "inquiries": [
        {
          "id": 1,
          "name": "foo",
          "query": "select * from foo",
          "viewType": "chart",
          "viewOptions": [],
          "createdAt": "2020-11-03T14:17:49.524Z" 
        },
        {
          "id": 2,
          "name": "bar",
          "query": "select * from bar",
          "viewType": "chart",
          "viewOptions": [],
          "createdAt": "2020-11-04T14:17:49.524Z" 
        }
      ]
    }`

    const inquiries = storedInquiries.deserialiseInquiries(str)
    const parsedStr = JSON.parse(str)
    expect(inquiries[1]).to.eql(parsedStr.inquiries[1])
    expect(inquiries[0].id).to.not.equal(parsedStr.inquiries[0].id)
    expect(inquiries[0].id).to.not.equal(parsedStr.inquiries[0].id)
    expect(inquiries[0].name).to.equal(parsedStr.inquiries[0].name)
    expect(inquiries[0].query).to.equal(parsedStr.inquiries[0].query)
    expect(inquiries[0].viewType).to.equal(parsedStr.inquiries[0].viewType)
    expect(inquiries[0].viewOptions).to.eql(parsedStr.inquiries[0].viewOptions)
    expect(inquiries[0].createdAt).to.equal(parsedStr.inquiries[0].createdAt)
  })

  it('importInquiries v1', async () => {
    const str = `
      {
        "id": 1,
        "name": "foo",
        "query": "select * from foo",
        "chart": [],
        "createdAt": "2020-11-03T14:17:49.524Z" 
      }
    `
    sinon.stub(fu, 'importFile').returns(Promise.resolve(str))
    const inquiries = await storedInquiries.importInquiries()

    expect(inquiries).to.eql([
      {
        id: 1,
        name: 'foo',
        query: 'select * from foo',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T14:17:49.524Z'
      }
    ])
  })

  it('importInquiries', async () => {
    const str = `{
      "version": 3,
      "inquiries": [{
        "id": 1,
        "name": "foo",
        "query": "select * from foo",
        "viewType": "chart",
        "viewOptions": [],
        "createdAt": "2020-11-03T14:17:49.524Z" 
      }]
    }`
    sinon.stub(fu, 'importFile').returns(Promise.resolve(str))
    const inquiries = await storedInquiries.importInquiries()

    expect(inquiries).to.eql([
      {
        id: 1,
        name: 'foo',
        query: 'select * from foo',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T14:17:49.524Z'
      }
    ])
  })

  it('readPredefinedInquiries old', async () => {
    const str = `[
      {
        "id": 1,
        "name": "foo",
        "query": "select * from foo",
        "chart": [],
        "createdAt": "2020-11-03T14:17:49.524Z" 
      }]
    `
    sinon.stub(fu, 'readFile').returns(Promise.resolve(new Response(str)))
    const inquiries = await storedInquiries.readPredefinedInquiries()
    expect(fu.readFile.calledOnceWith('./inquiries.json')).to.equal(true)
    expect(inquiries).to.eql([
      {
        id: 1,
        name: 'foo',
        query: 'select * from foo',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T14:17:49.524Z'
      }
    ])
  })

  it('readPredefinedInquiries', async () => {
    const str = `{
      "version": 3,
      "inquiries": [
      {
        "id": 1,
        "name": "foo",
        "query": "select * from foo",
        "viewType": "chart",
        "viewOptions": [],
        "createdAt": "2020-11-03T14:17:49.524Z" 
      }]
    }
    `
    sinon.stub(fu, 'readFile').returns(Promise.resolve(new Response(str)))
    const inquiries = await storedInquiries.readPredefinedInquiries()
    expect(fu.readFile.calledOnceWith('./inquiries.json')).to.equal(true)
    expect(inquiries).to.eql([
      {
        id: 1,
        name: 'foo',
        query: 'select * from foo',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T14:17:49.524Z'
      }
    ])
  })
})
