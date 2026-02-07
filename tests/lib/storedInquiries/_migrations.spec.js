import { expect } from 'chai'
import migrations from '@/lib/storedInquiries/_migrations'

describe('_migrations.js', () => {
  it('migrates from version 1 to the current', () => {
    const oldInquiries = [
      {
        id: '123',
        name: 'foo',
        query: 'SELECT * FROM foo',
        chart: { here_are: 'foo chart settings' },
        createdAt: '2021-05-06T11:05:50.877Z'
      },
      {
        id: '456',
        name: 'bar',
        query: 'SELECT * FROM bar',
        chart: { here_are: 'bar chart settings' },
        createdAt: '2021-05-07T11:05:50.877Z'
      }
    ]

    expect(migrations._migrate(1, oldInquiries)).to.eql([
      {
        id: '123',
        name: 'foo',
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: { here_are: 'foo chart settings' },
        createdAt: '2021-05-06T11:05:50.877Z'
      },
      {
        id: '456',
        name: 'bar',
        query: 'SELECT * FROM bar',
        viewType: 'chart',
        viewOptions: { here_are: 'bar chart settings' },
        createdAt: '2021-05-07T11:05:50.877Z'
      }
    ])
  })

  it('migrates from version 2 to the current', () => {
    const oldInquiries = [
      {
        id: '123',
        name: 'foo',
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: { here_are: 'foo chart settings' },
        createdAt: '2021-05-06T11:05:50.877Z'
      },
      {
        id: '456',
        name: 'bar',
        query: 'SELECT * FROM bar',
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
        createdAt: '2021-05-07T11:05:50.877Z'
      }
    ]
    expect(migrations._migrate(2, oldInquiries)).to.eql([
      {
        id: '123',
        name: 'foo',
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: { here_are: 'foo chart settings' },
        createdAt: '2021-05-06T11:05:50.877Z'
      },
      {
        id: '456',
        name: 'bar',
        query: 'SELECT * FROM bar',
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
            highlightMode: 'node_and_neighbors',
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
        createdAt: '2021-05-07T11:05:50.877Z'
      }
    ])
  })
})
