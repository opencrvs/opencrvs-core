# sneeze
[![Npm][BadgeNpm]][Npm]
[![Travis][BadgeTravis]][Travis]
[![Gitter][BadgeGitter]][Gitter]
![NpmFigs][BadgeNpmFigs]

Easily join SWIM networks. See
http://www.cs.cornell.edu/~asdas/research/dsn02-SWIM.pdf.

This module is used by [seneca-mesh](github.com/rjrodger/seneca-mesh)
to provide zero-configuration service discovery. A usage example is
provided by the 14 microservice
[ramanujan](github.com/senecajs/ramanujan) Twitter clone (including a
Docker Swarm configuratiion).

It is also used by the [wo](github.com/rjrodger/wo) [hapi](hapijs.com) plugin for
upstream proxy discovery. There's also a nice example in that repo.

Also included is a very useful terminal monitor so that you can see
the exact status of your network:

<img src="https://github.com/rjrodger/sneeze/blob/master/monitor.png">


## Quick Example

The *base* node serves as the well-known starting point. As other
nodes (A and B) join and leave. All nodes eventually learn about them.

```js
// base.js - start first
var base = require('sneeze')({isbase:true})
base.join()

// nodeA.js - start next
var nodeA = require('sneeze')()
nodeA.on('add',console.log)
nodeA.on('remove',console.log)
nodeA.join({name: 'A'}) // put any data you like in here

// nodeB.js - start last, then stop nodeA
var nodeB = require('sneeze')()
nodeB.on('add',console.log)
nodeB.on('remove',console.log)
nodeB.join({name: 'B'})
```


## Usage

This module is designed to be used by other modules that want to
expose functionality to a network of peer nodes. It does not provide
communication capabilities. It's sole purpose is to communicate meta
data on startup to other nodes. You use that meta data to establish
communication - it might the host and port on which you are exposing a
web service end point.

Sneeze uses the excellent [swim-js](github.com/mrhooray/swim-js)
module as the implementation of the SWIM algorithm. Communication
between nodes of the SWIM network is via UDP, so you need to make sure
your network allows UDP transit.


### Base nodes

The purpose of a SWIM network is automatic discovery without needing
any configuration or service registries. You can join the network just
by connecting with any single node. Of course, you have to know about
at least one node.

To make this easier, Sneeze provides the concept of _base_ nodes. Base
nodes should be delployed at well-known network locations (maybe using
a fixed domain name in your local DNS). New Sneeze instances can then
join the network simply by connecting to a base node. You can deploy
multiple base nodes for redundancy. They are only used for initial
joining and are not used for service discovery. This means you can
"chaos monkey" your base nodes without causing problems, so long as at
least one is live.


### IMPORTANT

The host name of each Sneeze instance is used as part of it's network
wide identification. Be careful to ensure that the host name is
consistent on all machines in your network.

If a Sneeze instance cannot join a network, it will retry a set number
of times, and then give up. Often the failure to join is because the
rest of the network cannot reply to the new Sneeze instance, due to host
name inconsistency. This is common problem with overlay networks that provide load-balancing IPs (for example: Docker Swarm).

Sneeze assumes a flat network structure. Everybody is on the same
network, and can reach everybody else.


### Basic Examples

The [test](github.com/rjrodger/sneeze/tree/master/test) folder
contains some simple examples. See the comments inside the scripts.

See also the more complex examples mentioned above [sneeze].


## API

### `Sneeze(options)`

Create a new Sneeze instance, passing in an options object. You can
create multiple Sneeze instances in the same process.

This constructor is exposed by the module:

```js
var Sneeze = require('sneeze')

var sneeze_instance = Sneeze()
```

See below for the options.


### `sneeze.join(meta)`

Join a SWIM network. The `meta` object is meta data about this
instances that will be shared with all other members of the network.


### `sneeze.members()`

Returns an array of member description objects. These are the
currently known and healthy members.


### `sneeze.leave()`

Leave the network. You can also leave just by exiting the process -
SWIM is designed to handle that. This method is just to give you extra
control.


### `seneca.info`

This public member variable is `null` until the instance sucessfully
joins a network. It is descriptive object containing meta data about
this instance.



## Options

The top level options that you can provide to Sneeze are:


### `isbase: false`

If `true`, become a base node.


### `host: 127.0.0.1`

Host name of the instance.


### `port: 39999`

Port of the instance. If _not_ a base node, then this chosen randomly if undefined. Normally, you leave this undefined and let Sneeze work out what port to use. NOTE: this is the SWIM UDP port, _not_ the port you use for communication.


### `bases: ['127.0.0.1:39999']`

The list of base nodes, in the format _host:port_. The Sneeze instance
will try to join the network by contacting these nodes.


### `silent: true`

If `false`, print logs of debugging information about SWIM network
events. Useful if your network configuration is causing headaches.


### `tag: null`

You can have multiple Sneeze networks running at the same time. Each
network can have its own tag. Members with different tags will ignore
each other.

A tag of `null` means observe all other members, regardless of
tag. This is what you need for base nodes, a
[repl](https://github.com/senecajs/ramanujan/blob/master/repl/repl-service.js),
or monitoring - see below.


### `identifier: null`

You can provide a unique identifier for your instance. This is
generated automatically if you do not provide one.


### `v: null`

If you leave and rejoin a network, within the same process, using the
same identifier, you should provide different version number `v` so
that any changed configuration is disseminated to the network.


### `monitor: {}`

Print a live monitoring table to the terminal. This lists all known
instances, and shows their status. More below.


## Monitoring

To turn on monitoring, run an instance (assuming default bases, etc) using:

```
// file: monitor.js
var Sneeze = require('sneeze')

var sneeze = Sneeze({
  monitor: {
    active: true
  }
})

sneeze.join()
```

This instance will print a table of all known instances to the
terminal window and update the table dynamically as instances come and
go. It is very useful for sanity checking your network.

The table columns are:

   * host: SWIM host and UDP port
   * a: number of add events for this node
   * r: number of remove events for this node
   * s: node status: A: alive, S: suspect, F: failed, U: unknown
   * time: milliseconds since the monitor started
   * tag: Sneeze network tag
   * meta: custom node meta data (see below)
   * id: the node identifier

The custom node meta data is picked out from the instance meta data
using JsonPath expressions:

```
var sneeze = Sneeze({
  monitor: {
    active: true,
    meta: ['foo.bar']
  }
})
```

This will print the value of `foo: {bar: 123}` in the instance meta data.


### Keys

#### `Ctrl-C`

Shutdown the monitor process.


#### `p`

Prune failed nodes from the table.



## Questions?

[@rjrodger](https://twitter.com/rjrodger)


[BadgeNpm]: https://badge.fury.io/js/sneeze.svg
[BadgeGitter]: https://badges.gitter.im/rjrodger/sneeze.svg
[BadgeNpmFigs]: https://img.shields.io/npm/dm/sneeze.svg?maxAge=2592000
[BadgeTravis]: https://travis-ci.org/rjrodger/sneeze.svg?branch=master

[Npm]: https://www.npmjs.com/package/sneeze
[Travis]: https://travis-ci.org/rjrodger/sneeze?branch=master
[Gitter]: https://gitter.im/rjrodger/sneeze


