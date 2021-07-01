import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import database from '@/lib/database'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('SQLite extensions', () => {
  let db

  beforeEach(() => {
    db = database.getNewDatabase()
  })

  afterEach(() => {
    db.shutDown()
  })

  it('support contrib trigonometric functions', async () => {
    const actual = await db.execute(`
      SELECT
        abs(3.141592653589793 - pi()) < 0.000001,
        abs(1 - cos(2 * pi()))        < 0.000001,
        abs(0 - sin(pi()))            < 0.000001,
        abs(0 - tan(0))               < 0.000001,
        abs(0 - cot(pi() / 2))        < 0.000001,
        abs(1 - acos(cos(1)))         < 0.000001,
        abs(1 - asin(sin(1)))         < 0.000001,
        abs(1 - atan(tan(1)))         < 0.000001,
        abs(1 - cosh(0))              < 0.000001,
        abs(0 - sinh(0))              < 0.000001,
        abs(0 - (tanh(1) + tanh(-1))) < 0.000001,
        abs(0 - (coth(1) + coth(-1))) < 0.000001,
        abs(1 - acosh(cosh(1)))       < 0.000001,
        abs(1 - asinh(sinh(1)))       < 0.000001,
        abs(1 - atanh(tanh(1)))       < 0.000001,
        abs(180 - degrees(pi()))      < 0.000001,
        abs(pi() - radians(180))      < 0.000001,
        abs(pi() / 2 - atan2(1, 0))   < 0.000001
    `)
    expect(actual.values).to.eql([[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]])
  })

  it('support contrib math functions', async () => {
    const actual = await db.execute(`
      SELECT
        exp(0),
        log(exp(1)),
        log10(10000),
        power(2, 3),
        sign(-10) + sign(20),
        sqrt(square(16)),
        ceil(-1.95) + ceil(1.95),
        floor(-1.95) + floor(1.95)
    `)
    expect(actual.values).to.eql([[1, 1, 4, 8, 0, 16, 1, -1]])
  })

  it('support contrib string functions', async () => {
    const actual = await db.execute(`
      SELECT
        replicate('ab', 4),
        charindex('ab', 'foobarabbarfoo'),
        charindex('ab', 'foobarabbarfoo', 8),
        leftstr('foobar', 2),
        rightstr('foobar', 2),
        reverse('foobar'),
        proper('fooBar'),
        padl('foo', 5),
        padr('foo', 5),
        padc('foo', 5),
        strfilter('abcba', 'bc')
    `)
    expect(actual.values).to.eql([
      ['abababab', 7, 0, 'fo', 'ar', 'raboof', 'Foobar', '  foo', 'foo  ', ' foo ', 'bcb']
    ])
  })

})
