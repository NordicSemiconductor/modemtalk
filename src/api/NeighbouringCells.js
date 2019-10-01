const { arrayParseInt, EventCategory } = require('../utils')

const expect = /%NBRGRSRP: ?((?:,?\d+)+)/

function convertResponse (resp) {
  const result = {
    id: 'neighbouringCells',
    category: EventCategory.NETWORK
  }
  const [, list] = expect.exec(resp)
  const values = arrayParseInt(list.split(','))
  while (values.length > 0) {
    const [cellId, earFcn, rsrp] = values.splice(0, 3)
    result[cellId] = { earFcn, rsrp }
  }
  return result
}

module.exports = target => {
  target.prototype.registerConverter('%NBRGRSRP', convertResponse)

  Object.assign(target.prototype, {
    getNeighbouringCells () {
      return this.writeAT('%NBRGRSRP', {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    }
  })
}
