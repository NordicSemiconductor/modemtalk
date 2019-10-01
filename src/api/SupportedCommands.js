module.exports = target => {
  Object.assign(target.prototype, {
    getSupportedCommands () {
      return this.writeAT('+CLAC', { expect: /AT.*/ })
    },
    testSupportedCommands () {
      return this.writeAT('+CLAC=?')
    }
  })
}
