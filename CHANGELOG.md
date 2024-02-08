## 1.5.0 (TBD)

## Breaking changes

- #### Upgrade node version to 18
  This version enforces environment to have Node 18 installed (supported until April 2025) and removes support for Node 16
  - Supports node version `18.19.x`
  - Specified operating systems in js modules as `darwin, linux`
  - Dev scripts run with an environment variable `NODE_OPTIONS=--dns-result-order=ipv4first` to resolve ipv4 addresses for `localhost` to support systems that resolves ipv6 addresses by default in Node versions >=17

## New features

## Bug fixes

See [Releases](https://github.com/opencrvs/opencrvs-core/releases) for release notes of older releases.
