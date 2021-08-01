import { expect } from 'chai'
import { _getDataSources } from '@/views/Main/Workspace/Tabs/Tab/DataView/Pivot/PivotUi/pivotHelper'

describe('pivotHelper.js', () => {
  it('_getDataSources returns data sources', () => {
    /*
      +---+---+---------+---------+
      |   | x |    5    |    10   |
      |   +---+----+----+----+----+
      |   | z |  2 |  3 |  1 |  6 |
      +---+---+    |    |    |    |
      | y |   |    |    |    |    |
      +---+---+----+----+----+----+
      |   3   |  5 |  6 |  4 |  9 |
      +-------+----+----+----+----+
      |   6   |  8 |  9 |  7 | 12 |
      +-------+----+----+----+----+
      |   9   | 11 | 12 | 10 | 15 |
      +-------+----+----+----+----+
    */
    const pivotData = {
      rowAttrs: ['y'],
      colAttrs: ['x', 'z'],
      getRowKeys () {
        return [[3], [6], [9]]
      },
      getColKeys () {
        return [
          [5, 2],
          [5, 3],
          [10, 1],
          [10, 6]
        ]
      },
      getAggregator (row, col) {
        return {
          value () {
            return +row + +col[1]
          }
        }
      }
    }

    expect(_getDataSources(pivotData)).to.eql({
      'Column keys': ['5-2', '5-3', '10-1', '10-6'],
      'Row keys': ['3', '6', '9'],
      'x-z:5-2': [5, 8, 11],
      'x-z:5-3': [6, 9, 12],
      'x-z:10-1': [4, 7, 10],
      'x-z:10-6': [9, 12, 15],
      'y:3': [5, 6, 4, 9],
      'y:6': [8, 9, 7, 12],
      'y:9': [11, 12, 10, 15]
    })
  })
})
