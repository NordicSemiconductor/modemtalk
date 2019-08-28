const { EventCategory } = require('../utils')

const expect = /%XDRX: ?([0-9]+)/

const DRXTable = {
  0: 'No DRX',
  1: '0.32 seconds DRX cycle parameter T = 32',
  2: '0.64 seconds DRX cycle parameter T = 64',
  3: '1.28 seconds DRX cycle parameter T = 128',
  4: '2.56 seconds DRX cycle parameter T = 256',
  5: '5.12 seconds E-UTRAN eDRX cycle length',
  6: '10.24 seconds E-UTRAN eDRX cycle length',
  7: '20.48 seconds E-UTRAN eDRX cycle length',
  8: '40.96 seconds E-UTRAN eDRX cycle length',
  9: '81.92 seconds E-UTRAN eDRX cycle length',
  10: '163.84 seconds E-UTRAN eDRX cycle length',
  11: '327.68 seconds E-UTRAN eDRX cycle length',
  12: '655.36 seconds E-UTRAN eDRX cycle length',
  13: '1310.72 seconds E-UTRAN eDRX cycle length',
  14: '2621.44 seconds E-UTRAN eDRX cycle length',
  255: 'DRX value not specified by the MS'
}

function convertResponse (resp) {
  const drxCycle = expect.exec(resp)[1]
  if (drxCycle) {
    return {
      id: 'drxCycle',
      value: parseInt(drxCycle, 10),
      message: DRXTable[drxCycle],
      category: EventCategory.NETWORK
    }
  }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter('%XDRX', convertResponse)

  Object.assign(target.prototype, {
    setDrxCycle (drxCycle) {
      return this.writeAT(`%XDRX=${drxCycle}`)
        .catch(err => Promise.reject(new Error(`setDrxCycle() failed: ${err.message}`)))
    },
    getDrxCycle () {
      return this.writeAT('%XDRX?', {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
        .catch(err => Promise.reject(new Error(`getDrxCycle() failed: ${err.message}`)))
    }
  })
}
