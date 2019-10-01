const { arrayParseInt, EventCategory } = require('../utils')

const expect = /%XCBAND: ?(?:([0-9]+)|(?:\(([0-9,]*)\)))/

function convertResponse (resp) {
  const match = expect.exec(resp)
  if (match) {
    const [, band, bands] = match
    if (bands) {
      return {
        id: 'supportedBands',
        bands: arrayParseInt(bands.split(','), 10),
        message: `Supported E-UTRA bands: ${bands}`,
        category: EventCategory.NETWORK
      }
    }
    return {
      id: 'currentBand',
      band: parseInt(band, 10),
      message: `E-UTRA band: ${band}`,
      category: EventCategory.NETWORK
    }
  }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter('%XCBAND', convertResponse)

  Object.assign(target.prototype, {
    getCurrentBand () {
      return this.writeAT('%XCBAND', {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    },
    testCurrentBand () {
      return this.writeAT('%XCBAND=?', {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    }
  })
}
