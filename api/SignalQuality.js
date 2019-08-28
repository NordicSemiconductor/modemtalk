const { rangeToArray, arrayParseInt } = require('../utils')

const thresholds = [20, 40, 60, 80]

function getRssiThreshold (rsrp) {
  if (rsrp === 255) {
    return 0
  }
  return thresholds.reduce((acc, cur) => (acc + ((rsrp > cur) ? 1 : 0)), 0)
}

function convertCESQUrc (resp) {
  const expect = /%CESQ: ?(\d+),(\d+)/
  const [, rsrp, thresholdIndex] = arrayParseInt(expect.exec(resp))
  return {
    id: 'extendedSignalQuality',
    rsrp: (rsrp === 255) ? undefined : (-141 + rsrp),
    thresholdIndex
  }
}

// linter rules require ** instead of Math.pow(), but ** is not supported by node v4.
/* eslint no-restricted-properties: off */

const expectCESQ = /\+CESQ: ?([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),([^,]*)/
function convertCESQResponse (resp) {
  try {
    const [, rxlev, ber, rscp, ecno, rsrq, rsrp] = arrayParseInt(expectCESQ.exec(resp))
    const thresholdIndex = getRssiThreshold(rsrp)
    const rsrpTranslated = (rsrp === 255) ? undefined : (-141 + rsrp)
    return {
      id: 'extendedSignalQuality',
      rssi: (rxlev === 99) ? undefined : (-111 + rxlev),
      ber: (ber === 99) ? undefined : (Math.pow(2, ber)) / 10,
      rscp: (rscp === 255) ? undefined : (-121 + rscp),
      ecno: (ecno === 255) ? undefined : (-24.5 + (ecno / 2)),
      rsrq: (rsrq === 255) ? undefined : (-20 + (rsrq / 2)),
      rsrp: rsrpTranslated,
      thresholdIndex,
      message: `reference signal received power: ${rsrpTranslated} dBm`
    }
  } catch (err) { /**/ }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter('%CESQ', convertCESQUrc)
  target.prototype.registerConverter('+CESQ', convertCESQResponse)
  Object.assign(target.prototype, {
    getExtendedSignalQuality () {
      return this.writeAT('+CESQ', {
        expect: expectCESQ,
        processor: lines => convertCESQResponse(lines.pop())
      })
        .catch(err => Promise.reject(new Error(`getExtendedSignalQuality() failed: ${err.message}`)))
    },
    testExtendedSignalQuality () {
      const expect = /\+CESQ: ?\(([^)]*)\),\(([^)]*)\),\(([^)]*)\),\(([^)]*)\),\(([^)]*)\),\(([^)]*)\)/
      return this.writeAT('+CESQ=?', {
        expect,
        processor: lines => {
          const [, rxlev, ber, rscp, ecno, rsrq, rsrp] = expect.exec(lines.pop())
          return {
            rxlev: rangeToArray(rxlev),
            ber: rangeToArray(ber),
            rscp: rangeToArray(rscp),
            ecno: rangeToArray(ecno),
            rsrq: rangeToArray(rsrq),
            rsrp: rangeToArray(rsrp)
          }
        }
      })
        .catch(err => Promise.reject(new Error(`testExtendedSignalQuality() failed: ${err.message}`)))
    },
    setSignalQualityNotification (enable) {
      return this.writeAT(`%CESQ=${enable ? 1 : 0}`)
    },
    setSignalQualityThreshold (rsrp1, rsrp2, rsrp3, rsrp4) {
      thresholds.splice(0, 4, rsrp1, rsrp2, rsrp3, rsrp4)
      return this.writeAT(`%CEST=${rsrp1},${rsrp2},${rsrp3},${rsrp4}`)
    }
  })
}
