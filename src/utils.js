const simpleRangeToArray = range => {
  const [a, b] = range.split('-')
  if (!a || !b) {
    return []
  }
  const [an, bn] = [parseInt(a, 10), parseInt(b, 10)]
  const [A, B] = [Math.min(an, bn), Math.max(an, bn)]
  return Array((B - A) + 1).fill(1).map((v, i) => (A + i))
}

// convert "1,3-4,7-10,12" => [1,3,4,7,8,9,10,12]
const rangeToArray = range => {
  const a = []
  range.split(',').forEach(v => {
    if (v.includes('-')) {
      a.push(...simpleRangeToArray(v))
    } else {
      a.push(parseInt(v, 10))
    }
  })
  return a
}

const matchAnything = /.*/
const lastLine = lines => lines.pop()

const arrayParseInt = (arr, radix = 10) => {
  const a = arr
  a.forEach((v, i) => {
    const newValue = parseInt(v, radix)
    a[i] = Number.isNaN(newValue) ? undefined : newValue
  })
  return a
}

const EventCategory = category => EventCategory[category]

EventCategory.UNDEFINED = 0
EventCategory.EVENT = 1
EventCategory.ERROR = 2
EventCategory.NETWORK = 3
EventCategory.NETWORK_ERROR = 4
EventCategory.PACKET_DOMAIN = 5
EventCategory.PACKET_DOMAIN_ERRROR = 6
EventCategory.MAX = 6

Object.assign(EventCategory, {
  [EventCategory.EVENT]: 'Event',
  [EventCategory.ERROR]: 'Error',
  [EventCategory.NETWORK]: 'Network',
  [EventCategory.NETWORK_ERROR]: 'Network Error',
  [EventCategory.PACKET_DOMAIN]: 'Packetdomain',
  [EventCategory.PACKET_DOMAIN_ERRROR]: 'Packetdomain Error',
  [EventCategory.UNDEFINED]: 'Unspecified'
})

module.exports = {
  rangeToArray,
  matchAnything,
  lastLine,
  arrayParseInt,
  EventCategory
}
