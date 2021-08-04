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
})
