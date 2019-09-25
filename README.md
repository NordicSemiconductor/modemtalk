# Modemtalk

[![GitHub Actions](https://github.com/bifravst/modemtalk/workflows/Test%20and%20Release/badge.svg)](https://github.com/bifravst/modemtalk/actions)
[![Greenkeeper badge](https://badges.greenkeeper.io/bifravst/modemtalk.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com/)

Library to interface with the nRF9160 modem.

This is a stand-alone publication of the `modemtalk` folder from https://github.com/NordicSemiconductor/pc-nrfconnect-linkmonitor/.

## Installation

> Note: This package is hosted on the GitHub package registry and 
> [npm needs to be configured](https://help.github.com/en/articles/configuring-npm-for-use-with-github-package-registry#installing-a-package)
> in order to use it.

    echo "@bifravst:registry=https://npm.pkg.github.com" >> .npmrc
    npm i --save-dev @bifravst/modemtalk

## Usage

Install it as a dependency in your project:

    npm i --save @bifravst/modemtalk

Then use `ModemPort` to communicate with the device:

```javascript
const { ModemPort } = require('./')

const turnOffModem = async () => {
  const device = new ModemPort('/dev/ttyACM0', {
    writeCallback: data => {
      console.log(data.trim())
    }
  })

  await device.open()

  await device.writeAT('+CFUN=4', {
    timeout: 2000
  })

  await device.close()
}

turnOffModem()
```

### More examples

- see usage in the [Link Monitor](https://github.com/NordicSemiconductor/pc-nrfconnect-linkmonitor/search?q=modemport&unscoped_q=modemport)
- [a script to write TLS credentials](https://github.com/bifravst/aws/blob/15c65558419914d0d5b4bed5d4f98b3128957da3/cli/commands/flash-cert.ts)
