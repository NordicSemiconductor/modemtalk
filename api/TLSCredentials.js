const { EventCategory } = require('../utils')

const CredentialType = {
  ROOT_CA_CERTIFICATE: 0,
  CLIENT_CERTIFICATE: 1,
  CLIENT_PRIVATE_KEY: 2,
  PRE_SHARED_KEY: 3,
  PSK_IDENTITY: 4,
  0: 'Root CA Certificate',
  1: 'Client Certificate',
  2: 'Client Private Key',
  3: 'Pre-shared Key',
  4: 'PSK Identity'
}

// Response syntax for read operation:
// %CMNG: <sec_tag>,<type>[,<sha>[,<content>]]
// Response syntax for list operation:
// %CMNG: <sec_tag>,<type>[,<sha>]
const expect = /%CMNG: ?([0-9]+), ?([0-4])(?:, ?"(.*?)")?(?:, ?"((.|[\r\n])*?)")?/

function convertResponse (resp) {
  const match = expect.exec(resp)
  if (match) {
    const [, secTagStr, typeStr, sha, content] = match
    const secTag = parseInt(secTagStr, 10)
    const type = parseInt(typeStr, 10)
    let message = `${CredentialType[type]} (${secTag})`
    if (sha) {
      message = `${message}: ${sha}`
    }
    return {
      id: 'TLSCredential',
      secTag,
      type,
      sha,
      content,
      message,
      category: EventCategory.PACKET_DOMAIN
    }
  }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter('%CMNG', convertResponse)

  Object.assign(target.prototype, {
    CredentialType,
    writeTLSCredential (secTag, type, content, password) {
      let cmd = `%CMNG=0,${secTag},${type},"${content.trim()}"`
      if (password !== undefined) {
        cmd = `${cmd},${password}`
      }
      return this.writeAT(cmd, {
        expect,
        processor: lines => convertResponse(lines.pop()),
        timeout: 5000
      })
    },
    listTLSCredentials (secTag, type) {
      let cmd = '%CMNG=1'
      if (secTag !== undefined) {
        cmd = `${cmd},${secTag}`
      }
      if (type !== undefined) {
        cmd = `${cmd},${type}`
      }
      return this.writeAT(cmd, {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    },
    readTLSCredential (secTag, type) {
      return this.writeAT(`%CMNG=2,${secTag},${type}`, {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    },
    deleteTLSCredential (secTag, type) {
      return this.writeAT(`%CMNG=3,${secTag},${type}`, {
        timeout: 2000
      })
    }
  })
}
