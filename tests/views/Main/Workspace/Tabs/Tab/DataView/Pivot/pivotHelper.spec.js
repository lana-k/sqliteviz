import { expect } from 'chai'
import { _getDataSources, getPivotCanvas, getPivotHtml }
from '@/views/Main/Workspace/Tabs/Tab/DataView/Pivot/pivotHelper'

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

  it('getPivotCanvas returns canvas', async () => {
    const pivotOutput = document.body
    const child = document.createElement('div')
    child.classList.add('pvtTable')
    pivotOutput.append(child)

    expect(await getPivotCanvas(pivotOutput)).to.be.instanceof(HTMLCanvasElement)
  })

  it('getPivotHtml returns html with styles', async () => {
    const pivotOutput = document.createElement('div')
    pivotOutput.append('test')

    const html = getPivotHtml(pivotOutput)
    const doc = document.createElement('div')
    doc.innerHTML = html

    expect(doc.innerHTML).to.equal(html)
    expect(doc.children).to.have.lengthOf(2)
    expect(doc.children[0].tagName).to.equal('STYLE')
    expect(doc.children[1].tagName).to.equal('DIV')
    expect(doc.children[1].innerHTML).to.equal('test')
  })
})
