![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) Log Filter Module


# seneca-log-filter
[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Dependency Status][david-badge]][david-url]
[![Gitter chat][gitter-badge]][gitter-url]

- __Sponsor:__ [nearForm][Sponsor]

## Examples

```js
var LogFilter = require('seneca-log-filter')
var filter = LogFilter({'omit-metadata': true, level: 'info' })
var obj = {level: 'info', foo: 'test', bar: 'test' }

var filteredObj = filter(obj)

// filteredObj is equal to {foo: 'test', bar: 'test' }
```

## API

### `LogFilter(config)`
- `config` is an object which can take several properties which change the behaviour of the filter which are listed below.
  - `level` a required property which states the log level to filter out
  - `omit-metadata` a value which can be true or false, if true this omits the properties with the names `seneca`, `level` and `when` when filtering an object
  - `omit` an array of strings of names of properties to omit when filtering an object

#### Returns
A function which can be called on an object to filter properties out of it.

## Test

```sh
npm test
```

## Contributing

This module follows the general [Senecajs org][] contribution guidelines, and encourages open participation. If you feel you can help in any way, or discover any Issues, feel free to [create an issue][issue] or [create a pull request][pr]!

If you wish to read more on our guidelines, feel free to

  - Checkout the concise [contribution file][contrib]
  - Checkout our much more indepth [contributing guidelines][contribGuide]


## License

Copyright (c) 2016, David Gonzalez.
Licensed under [MIT][].

[MIT]: ./LICENSE
[npm-badge]: https://badge.fury.io/js/seneca-log-filter.svg
[npm-url]: https://badge.fury.io/js/seneca-log-filter
[travis-badge]: https://api.travis-ci.org/senecajs/seneca-log-filter.svg
[travis-url]: https://travis-ci.org/senecajs/seneca-log-filter
[coveralls-badge]:https://coveralls.io/repos/senecajs/seneca-log-filter/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/senecajs/seneca-log-filter?branch=master
[david-badge]: https://david-dm.org/senecajs/seneca-log-filter.svg
[david-url]: https://david-dm.org/senecajs/seneca-log-filter
[gitter-badge]: https://badges.gitter.im/senecajs/seneca.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[Senecajs org]: https://github.com/senecajs/
[issue]: https://github.com/senecajs/seneca-log-filter/issues
[pr]: https://github.com/senecajs/seneca-log-filter/pulls
[contrib]: ./CONTRIBUTING.md
[contribGuide]: http://senecajs.org/contribute/
[Sponsor]: http://nearform.com
