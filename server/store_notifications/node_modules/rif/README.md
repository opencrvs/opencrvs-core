# rif
Node.js module to resolve network interfaces.

This modules provides a concise way to extract an IP address from the
output of `require('os').networkInterfaces()`.

This is useful for deployments where the environment (e.g. Docker,
AWS) picks the IP addresses for you.

Note: use the command line utilities `ifconfig` or `ipconfig` to list
actual interface names on your system.


## Example


```js
var rif = require('rif')()

console.log(rif('lo')) // prints IPv4 address of loopback interface: 127.0.0.1
console.log(rif('lo/6')) // prints IPv6 address of loopback interface: ::1
console.log(rif('eth0')) // prints IPv4 address of interface eth0: 10.x.x.x (depends on your system!)

console.log(rif('lo/4/netmask=255.0.0.0')) // netmask field must equal 255.0.0.0
console.log(rif('lo/4/netmask^255,internal=true')) // netmask field must start with 255 and internal field must have value true

console.log(rif('//address^192.168')) // prints first found address of any interface of any family,
                                      // where address starts with 192.168
```

You can optionally provide a fixed set of pre-defined interfaces. This useful for testing (see (seneca-mesh/test/mesh.test.js)[github.com/rjrodger/seneca-mesh/blob/master/test/mesh.test.js]).


```js
var rif = require('rif')({
  my_interface: [{
    address: '192.168.1.2'
  }]
})

console.log(rif('lo')) // prints IPv4 address of loopback interface: 127.0.0.1
console.log(rif('my_interface')) // prints 192.168.1.2
```

## Syntax

`ifname/v/fieldspec`

  * `ifname`: name of network interface.
    * values: `*` (or empty string): match any; `string`: match exact interface name
  * `v`: (optional) IP version: 4 or 6, meaning IPv4 or IPv6 respectively.
      * values: `4`: IPv4; `6`: IPv6; `*` (or empty string): match either IP family
  * `fieldspec`: (optional) comma-separated list of field value tests
  
The field value tests are of the form: `name#value` where # is one of:

  * `=`: exact match.
  * `^`: field starts with value.
  * `$`: field ends with value.
  * `%`: field contains value.

See [unit tests](../master/test/rif.test.js) for more examples.


## License
Copyright (c) 2016, Richard Rodger and other contributors, MIT License.


