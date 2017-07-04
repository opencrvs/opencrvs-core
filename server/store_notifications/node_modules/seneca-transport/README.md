![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] transport plugin

# seneca-transport
[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Dependency Status][david-badge]][david-url]
[![Gitter][gitter-badge]][gitter-url]

## Description

This plugin provides the HTTP/HTTPS and TCP transport channels for
micro-service messages. It's a built-in dependency of the Seneca
module, so you don't need to include it manually. You use this plugin
to wire up your micro-services so that they can talk to each other.

seneca-transport's source can be read in an annotated fashion by:
- running `npm run annotate`
- viewing ./docs/annotated/transport.html locally

If you're using this module, and need help, you can:

- Post a [github issue][],
- Tweet to [@senecajs][],
- Ask on the [Gitter][gitter-url].

If you are new to Seneca in general, please take a look at [senecajs.org][]. We have everything from
tutorials to sample apps to help get you up and running quickly.

### Seneca compatibility
Supports Seneca versions **1.x** - **3.x**

## Install

This plugin module is included in the main Seneca module:

```sh
npm install seneca
```

To install separately, use:

```sh
npm install seneca-transport
```


## Quick Example

Let's do everything in one script to begin with. You'll define a
simple Seneca plugin that returns the hex value of color words. In
fact, all it can handle is the color red!

You define the action pattern _color:red_, which always returns the
result <code>{hex:'#FF0000'}</code>. You're also using the name of the
function _color_  to define the name of the plugin (see [How to write a
Seneca plugin](http://senecajs.org/tutorials/how-to-write-a-plugin.html)).

```js
function color() {
  this.add( 'color:red', function(args,done){
    done(null, {hex:'#FF0000'});
  })
}
```

Now, let's create a server and client. The server Seneca instance will
load the _color_  plugin and start a web server to listen for inbound
messages. The client Seneca instance will submit a _color:red_ message
to the server.


```js
var seneca = require('seneca')

seneca()
  .use(color)
  .listen()

seneca()
  .client()
  .act('color:red')
```

Example with HTTPS:

To enable HTTPS, pass an options object to the `listen` function setting the `protocol` option to 'https' and provide a `serverOptions` object with `key` and `cert` properties.

```js
var seneca = require('seneca')
var Fs = require('fs')


seneca()
  .use(color)
  .listen({
    type: 'http',
    port: '8000',
    host: 'localhost',
    protocol: 'https',
    serverOptions : {
      key : Fs.readFileSync('path/to/key.pem', 'utf8'),
      cert : Fs.readFileSync('path/to/cert.pem', 'utf8')
    }
  })

seneca()
  .client({
    type: 'http',
    port: '8000',
    host: 'localhost',
    protocol: 'https'
  })
  .act('color:red')
```

You can create multiple instances of Seneca inside the same Node.js
process. They won't interfere with each other, but they will share
external options from configuration files or the command line.

If you run the full script (full source is in
[readme-color.js](https://github.com/senecajs/seneca-transport/blob/master/test/readme-color.js)),
you'll see the standard Seneca startup log messages, but you won't see
anything that tells you what the _color_ plugin is doing since this
code doesn't bother printing the result of the action. Let's use a
filtered log to output the inbound and outbound action messages from
each Seneca instance so we can see what's going on. Run the script with:

```sh
node readme-color.js --seneca.log=type:act,regex:color:red
```

_NOTE: when running the examples in this documentation, you'll find
that most of the Node.js processes do not exit. This because they
running in server mode. You'll need to kill all the Node.js processes
between execution runs. The quickest way to do this is:_

```sh
$ killall node
```


This log filter restricts printed log entries to those that report
inbound and outbound actions, and further, to those log lines that
match the regular expression <code>/color:red/</code>. Here's what
you'll see:

```sh
[TIME] vy../..15/- DEBUG act -     - IN  485n.. color:red {color=red}   CLIENT
[TIME] ly../..80/- DEBUG act color - IN  485n.. color:red {color=red}   f2rv..
[TIME] ly../..80/- DEBUG act color - OUT 485n.. color:red {hex=#FF0000} f2rv..
[TIME] vy../..15/- DEBUG act -     - OUT 485n.. color:red {hex=#FF0000} CLIENT
```

The second field is the identifier of the Seneca instance. You can see
that first the client (with an identifier of _vy../..15/-_) sends the
message <code>{color=red}</code>. The message is sent over HTTP to the
server (which has an identifier of _ly../..80/-_). The server performs the
action, generating the result <code>{hex=#FF0000}</code>, and sends
it back.

The third field, <code>DEBUG</code>, indicates the log level. The next
field, <code>act</code> indicates the type of the log entry. Since
you specified <code>type:act</code> in the log filter, you've got a
match!

The next two fields indicate the plugin name and tag, in this case <code>color
-</code>. The plugin is only known on the server side, so the client
just indicates a blank entry with <code>-</code>. For more details on
plugin names and tags, see [How to write a Seneca
plugin](http://senecajs.org/tutorials/how-to-write-a-plugin.html).

The next field (also known as the _case_) is either <code>IN</code> or
<code>OUT</code>, and indicates the direction of the message. If you
follow the flow, you can see that the message is first inbound to the
client, and then inbound to the server (the client sends it
onwards). The response is outbound from the server, and then outbound
from the client (back to your own code). The field after that,
<code>485n..</code>, is the message identifier. You can see that it
remains the same over multiple Seneca instances. This helps you to
debug message flow.

The next two fields show the action pattern of the message, 
<code>color:red</code>, followed by the actual data of the request
message (when inbound), or the response message (when outbound).

The last field <code>f2rv..</code> is the internal identifier of the
action function that acts on the message. On the client side, there is
no action function, and this is indicated by the <code>CLIENT</code>
marker. If you'd like to match up the action function identifier to
message executions, add a log filter to see them:

```
node readme-color.js --seneca.log=type:act,regex:color:red \
--seneca.log=plugin:color,case:ADD
[TIME] ly../..80/- DEBUG plugin color - ADD f2rv.. color:red
[TIME] vy../..15/- DEBUG act    -     - IN  485n.. color:red {color=red}   CLIENT
[TIME] ly../..80/- DEBUG act    color - IN  485n.. color:red {color=red}   f2rv..
[TIME] ly../..80/- DEBUG act    color - OUT 485n.. color:red {hex=#FF0000} f2rv..
[TIME] vy../..15/- DEBUG act    -     - OUT 485n.. color:red {hex=#FF0000} CLIENT
```

The filter <code>plugin:color,case:ADD</code> picks out log entries of
type _plugin_, where the plugin has the name _color_, and where the
_case_ is ADD. These entries indicate the action patterns that a
plugin has registered. In this case, there's only one, _color:red_.

You've run this example in a single Node.js process up to now. Of
course, the whole point is to run it in separate processes! Let's do
that. First, here's the server:

```js
function color() {
  this.add( 'color:red', function(args,done){
    done(null, {hex:'#FF0000'});
  })
}

var seneca = require('seneca')

seneca()
  .use(color)
  .listen()
```

Run this in one terminal window with:

```sh
$ node readme-color-service.js --seneca.log=type:act,regex:color:red
```

And on the client side:

```js
var seneca = require('seneca')

seneca()
  .client()
  .act('color:red')
```

And run with:

```sh
$ node readme-color-client.js --seneca.log=type:act,regex:color:red
```

You'll see the same log lines as before, just split over the two processes. The full source code is the [test folder](https://github.com/senecajs/seneca-transport/tree/master/test).


## Non-Seneca Clients

The default transport mechanism for messages is HTTP. This means you can communicate easily with a Seneca micro-service from other platforms. By default, the <code>listen</code> method starts a web server on port 10101, listening on all interfaces. If you run the _readme-color-service.js_ script again (as above), you can talk to it by _POSTing_ JSON data to the <code>/act</code> path. Here's an example using the command line _curl_ utility.

```sh
$ curl -d '{"color":"red"}' http://localhost:10101/act
{"hex":"#FF0000"}
```

If you dump the response headers, you'll see some additional headers that give you contextual information. Let's use the <code>-v</code> option of _curl_ to see them:

```sh
$ curl -d '{"color":"red"}' -v http://localhost:10101/act
...
* Connected to localhost (127.0.0.1) port 10101 (#0)
> POST /act HTTP/1.1
> User-Agent: curl/7.30.0
> Host: localhost:10101
> Accept: */*
> Content-Length: 15
> Content-Type: application/x-www-form-urlencoded
>
* upload completely sent off: 15 out of 15 bytes
< HTTP/1.1 200 OK
< Content-Type: application/json
< Cache-Control: private, max-age=0, no-cache, no-store
< Content-Length: 17
< seneca-id: 9wu80xdsn1nu
< seneca-kind: res
< seneca-origin: curl/7.30.0
< seneca-accept: sk5mjwcxxpvh/1409222334824/-
< seneca-time-client-sent: 1409222493910
< seneca-time-listen-recv: 1409222493910
< seneca-time-listen-sent: 1409222493910
< Date: Thu, 28 Aug 2014 10:41:33 GMT
< Connection: keep-alive
<
* Connection #0 to host localhost left intact
{"hex":"#FF0000"}
```

You can get the message identifier from the _seneca-id_ header, and
the identifier of the Seneca instance from _seneca-accept_.

There are two structures that the submitted JSON document can take:

   * Vanilla JSON containing your request message, plain and simple, as per the example above,
   * OR: A JSON wrapper containing the client details along with the message data.

The JSON wrapper follows the standard form of Seneca messages used in
other contexts, such as message queue transports. However, the simple
vanilla format is perfectly valid and provided explicitly for
integration. The wrapper format is described below.

If you need Seneca to listen on a particular port or host, you can
specify these as options to the <code>listen</code> method. Both are
optional.

```js
seneca()
  .listen( { host:'192.168.1.2', port:80 } )
```

On the client side, either with your own code, or the Seneca client,
you'll need to use matching host and port options.

```bash
$ curl -d '{"color":"red"}' http://192.168.1.2:80/act
```

```js
seneca()
  .client( { host:'192.168.1.2', port:80 } )
```

You can also set the host and port via the Seneca options facility. When
using the options facility, you are setting the default options for
all message transports. These can be overridden by arguments to individual
<code>listen</code> and <code>client</code> calls.

Let's run the color example again, but with a different port. On the server-side:

```sh
$ node readme-color-service.js --seneca.log=type:act,regex:color:red \
  --seneca.options.transport.port=8888
```

And the client-side:

```sh
curl -d '{"color":"red"}' -v http://localhost:8888/act
```
OR

```sh
$ node readme-color-client.js --seneca.log=type:act,regex:color:red \
  --seneca.options.transport.port=8888
```

## Using the TCP Channel

Also included in this plugin is a TCP transport mechanism. The HTTP
mechanism offers easy integration, but it is necessarily slower. The
TCP transport opens a direct TCP connection to the server. The
connection remains open, avoiding connection overhead for each
message. The client side of the TCP transport will also attempt to
reconnect if the connection breaks, providing fault tolerance for
server restarts.

To use the TCP transport, specify a _type_ property to the
<code>listen</code> and <code>client</code> methods, and give it the
value _tcp_. Here's the single script example again:


```js
seneca()
  .use(color)
  .listen({type:'tcp'})

seneca()
  .client({type:'tcp'})
  .act('color:red')
```

The full source code is in the
[readme-color-tcp.js](https://github.com/senecajs/seneca-transport/blob/master/test/readme-color-tcp.js)
file. When you run this script it would be great to verify that the
right transport channels are being created. You'd like to see the
configuration, and any connections that occur. By default, this
information is printed with a log level of _INFO_, so you will see it
if you don't use any log filters.

Of course, we are using a log filter. So let's add another one to
print the connection details so we can sanity check the system. We want
to print any log entries with a log level of _INFO_. Here's the
command:

```sh
$ node readme-color-tcp.js --seneca.log=level:INFO \
  --seneca.log=type:act,regex:color:red
```

This produces the log output:

```sh
[TIME] 6g../..49/- INFO  hello  Seneca/0.5.20/6g../..49/-
[TIME] f1../..79/- INFO  hello  Seneca/0.5.20/f1../..79/-
[TIME] f1../..79/- DEBUG act    -         - IN  wdfw.. color:red {color=red} CLIENT
[TIME] 6g../..49/- INFO  plugin transport - ACT b01d.. listen open {type=tcp,host=0.0.0.0,port=10201,...}
[TIME] f1../..79/- INFO  plugin transport - ACT nid1.. client {type=tcp,host=0.0.0.0,port=10201,...} any
[TIME] 6g../..49/- INFO  plugin transport - ACT b01d.. listen connection {type=tcp,host=0.0.0.0,port=10201,...} remote 127.0.0.1 52938
[TIME] 6g../..49/- DEBUG act    color     - IN  bpwi.. color:red {color=red} mcx8i4slu68z UNGATE
[TIME] 6g../..49/- DEBUG act    color     - OUT bpwi.. color:red {hex=#FF0000} mcx8i4slu68z
[TIME] f1../..79/- DEBUG act    -         - OUT wdfw.. color:red {hex=#FF0000} CLIENT
```

The inbound and outbound log entries are as before. In addition, you
can see the _INFO_ level entries. At startup, Seneca logs a "hello"
entry with the identifier of the current instance execution. This
identifier has the form:
<code>Seneca/[version]/[12-random-chars]/[timestamp]/[tag]</code>.  This
identifier can be used for debugging multi-process message flows. The
second part is a local timestamp. The third is an optional tag, which
you could provide with <code>seneca({tag:'foo'})</code>, although we
don't use tags in this example.

There are three _INFO_ level entries of interest. On the server-side,
the listen facility logs the fact that it has opened a TCP port, and
is now listening for connections. Then the client-side logs that it
has opened a connection to the server. And finally the server logs the
same thing.

As with the HTTP transport example above, you can split this code into
two processes by separating the client and server code. Here's the server:

```js
function color() {
  this.add( 'color:red', function(args,done){
    done(null, {hex:'#FF0000'});
  })
}

var seneca = require('seneca')

seneca()
  .use(color)
  .listen({type:'tcp'})
```

And here's the client:

```js
seneca()
  .client({type:'tcp'})
  .act('color:red')
```

You can cheat by running the HTTP examples with the additional command
line option: <code>--seneca.options.transport.type=tcp</code>.

To communicate with a Seneca instance over TCP, you can send a message from the command line that Seneca understands:

```sh
# call the color:red action pattern
echo '{"id":"w91/enj","kind":"act","origin":"h5x/146/..77/-","act":{"color":"red"},"sync":true}' | nc 127.0.0.1 10201

```

Seneca answers with a message like:

```sh
{"id":"w91/enj","kind":"res","origin":"h5x/146/..77/-","accept":"bj../14../..47/-","time":{"client_sent":..,"listen_recv":..,"listen_sent":..},"sync":true,"res":{"hex":"#FF0000"}}
# the produced result is in the "res" field
```

HTTP and TCP are not the only transport mechanisms available. Of
course, in true Seneca-style, the other mechanisms are available as
plugins. Here's the list.

   * [redis-transport](https://github.com/senecajs/seneca-redis-transport): uses redis for a pub-sub message distribution model
   * [beanstalk-transport](https://github.com/senecajs/seneca-beanstalk-transport): uses beanstalkd for a message queue
   * [balance-client](https://github.com/rjrodger/seneca-balance-client): a load-balancing client transport over multiple Seneca listeners

If you're written your own transport plugin (see below for
instructions), and want to have it listed here, please submit a pull
request.


## Multiple Channels

You can use multiple <code>listen</code> and <code>client</code>
definitions on the same Seneca instance, in any order. By default, a
single <code>client</code> definition will send all unrecognized
action patterns over the network. When you have multiple client
definitions, it's becuase you want to send some action patterns to one
micro-service, and other patterns to other micro-services. To do this,
you need to specify the patterns you are interested in. In Seneca,
this is done with a `pin`.

A Seneca `pin` is a pattern for action patterns. You provide a list of
property names and values that must match. Unlike ordinary action
patterns, where the values are fixed, with a `pin`, you can use globs
to match more than one value. For example, let's say you have the patterns:

   * <code>foo:1,bar:zed-aaa</code>
   * <code>foo:1,bar:zed-bbb</code>
   * <code>foo:1,bar:zed-ccc</code>

Then you can use these `pins` to pick out the patterns you want:

   * The pin <code>foo:1</code> matches the patterns <code>foo:1,bar:zed-aaa</code> and <code>foo:1,bar:zed-bbb</code> and <code>foo:1,bar:zed-ccc</code>
   * The pin <code>foo:1, bar:*</code> also matches the patterns <code>foo:1,bar:zed-aaa</code> and <code>foo:1,bar:zed-bbb</code> and <code>foo:1,bar:zed-ccc</code>
   * The pin <code>foo:1, bar:*-aaa</code> matches only the pattern <code>foo:1,bar:zed-aaa</code>

Let's extend the color service example. You'll have three separate
services, all running in separate processes. They will listen on ports
8081, 8082, and 8083 respectively. You'll use command line arguments
for settings. Here's the service code (see
[readme-many-colors-server.js](https://github.com/senecajs/seneca-transport/blob/master/test/readme-many-colors-server.js)):

```js
var color  = process.argv[2]
var hexval = process.argv[3]
var port   = process.argv[4]

var seneca = require('seneca')

seneca()

  .add( 'color:'+color, function(args,done){
    done(null, {hex:'#'+hexval});
  })

  .listen( port )

  .log.info('color',color,hexval,port)
```

This service takes in a color name, a color hexadecimal value, and a
port number from the command line. You can also see how the <code>listen</code>
method can take a single argument, the port number. To offer the
_color:red_ service, run this script with:

```sh
$ node readme-many-colors-server.js red FF0000 8081
```

And you can test with:

```sh
$ curl -d '{"color":"red"}' http://localhost:8081/act
```

Of course, you need to use some log filters to pick out the activity
you're interested in. In this case, you've used a
<code>log.info</code> call to dump out settings. You'll also want to
see the actions as the occur. Try this:

```sh
node readme-many-colors-server.js red FF0000 8081 --seneca.log=level:info \
  --seneca.log=type:act,regex:color
```

And you'll get:

```sh
[TIME] mi../..66/- INFO  hello  Seneca/0.5.20/mi../..66/-
[TIME] mi../..66/- INFO  color  red       FF0000 8081
[TIME] mi../..66/- INFO  plugin transport -      ACT 7j.. listen {type=web,port=8081,host=0.0.0.0,path=/act,protocol=http,timeout=32778,msgprefix=seneca_,callmax=111111,msgidlen=12,role=transport,hook=listen}
[TIME] mi../..66/- DEBUG act    -         -      IN  ux.. color:red {color=red} 9l..
[TIME] mi../..66/- DEBUG act    -         -      OUT ux.. color:red {hex=#FF0000} 9l..
```

You can see the custom _INFO_ log entry at the top, and also the transport
settings after that.

Let's run three of these servers, one each for red, green and
blue. Let's also run a client to connect to them.

Let's make it interesting. The client will <code>listen</code> so that it can
handle incoming actions, and pass them on to the appropriate server by
using a <code>pin</code>. The client will also define a new action that can
aggregate color lookups.

```js
var seneca = require('seneca')

seneca()

  // send matching actions out over the network
  .client({ port:8081, pin:'color:red' })
  .client({ port:8082, pin:'color:green' })
  .client({ port:8083, pin:'color:blue' })

  // an aggregration action that calls other actions
  .add( 'list:colors', function( args, done ){
    var seneca = this
    var colors = {}

    args.names.forEach(function( name ){
      seneca.act({color:name}, function(err, result){
        if( err ) return done(err);

        colors[name] = result.hex
        if( Object.keys(colors).length == args.names.length ) {
          return done(null,colors)
        }
      })
    })

  })

  .listen()

  // this is a sanity check
  .act({list:'colors',names:['blue','green','red']},console.log)
```

This code calls the <code>client</code> method three times. Each time,
it specifies an action pattern <code>pin</code>, and a destination port. And
action submitted to this Seneca instance via the <code>act</code>
method will be matched against these <code>pin</code> patterns. If there is a
match, they will not be processed locally. Instead they will be sent
out over the network to the micro-service that deals with them.

In this code, you are using the default HTTP transport, and just
changing the port number to connect to. This reflects the fact that
each color micro-service runs on a separate port.

The `listen` call at the bottom makes this "client" also
listen for inbound messages. So if you run, say the _color:red_
service, and also run the client, then you can send color:red messages
to the client.

You need to run four processes:

```sh
node readme-many-colors-server.js red FF0000 8081 --seneca.log=level:info --seneca.log=type:act,regex:color &
node readme-many-colors-server.js green 00FF00 8082 --seneca.log=level:info --seneca.log=type:act,regex:color &
node readme-many-colors-server.js blue 0000FF 8083 --seneca.log=level:info --seneca.log=type:act,regex:color &
node readme-many-colors-client.js --seneca.log=type:act,regex:CLIENT &

```

And then you can test with:

```sh
$ curl -d '{"color":"red"}' http://localhost:10101/act
$ curl -d '{"color":"green"}' http://localhost:10101/act
$ curl -d '{"color":"blue"}' http://localhost:10101/act
```

These commands are all going via the client, which is listening on port 10101.

The client code also includes an aggregation action,
_list:colors_. This lets you call multiple color actions and return
one result. This is a common micro-service pattern.

The script
[readme-many-colors.sh](https://github.com/senecajs/seneca-transport/blob/master/test/readme-many-colors.sh)
wraps all this up into one place for you so that it is easy to run.

Seneca does not require you to use message transports. You can run
everything in one process. But when the time comes, and you need to
scale, or you need to break out micro-services, you have the option to
do so.


## Message Protocols

There is no message protocol as such, as the data representation of
the underlying message transport is used. However, the plain text
message representation is JSON in all known transports.

For the HTTP transport, message data is encoded as per the HTTP
protocol. For the TCP transport, UTF8 JSON is used, with one
well-formed JSON object per line (with a single "\n" as line
terminator).

For other transports, please see the documentation for the underlying
protocol. In general the transport plugins, such as
_seneca-redis-transport_ will handle this for you so that you only
have to think in terms of JavaScript objects.

The JSON object is a wrapper for the message data. The wrapper contains
some tracking fields to make debugging easier. These are:

   * _id_:     action identifier (appears in Seneca logs after IN/OUT)
   * _kind_:   'act' for inbound actions, 'res' for outbound responses
   * _origin_: identifier of orginating Seneca instance, where action is submitted
   * _accept_: identifier of accepting Seneca instance, where action is performed
   * _time_:
      *   _client_sent_: client timestamp when message sent
      *   _listen_recv_: server timestamp when message received
      *   _listen_sent_: server timestamp when response sent
      *   _client_recv_: client timestamp when response received
   * _act_: action message data, as submitted to Seneca
   * _res_: response message data, as provided by Seneca
   * _error_: error message, if any
   * _input_: input generating error, if any


## Writing Your Own Transport

To write your own transport, the best approach is to copy one of the existing ones:

   * [transport.js](https://github.com/senecajs/seneca-transport/blob/master/transport.js): disconnected or point-to-point
   * [redis-transport.js](https://github.com/rjrodger/seneca-redis-transport/blob/master/lib/index.js): publish/subscribe
   * [beanstalk-transport.js](https://github.com/rjrodger/seneca-beanstalk-transport/blob/master/lib/index.js): message queue

Choose a _type_ for your transport, say "foo". You will need to
implement two patterns:

   * role:transport, hook:listen, type:foo
   * role:transport, hook:client, type:foo

Rather than writing all of the code yourself, and dealing with all the
messy details, you can take advantage of the built-in message
serialization and error handling by using the utility functions that
the _transport_ plugin exports. These utility functions can be called
in a specific sequence, providing a template for the implementation of
a message transport:

The transport utility functions provide the concept of topics. Each
message pattern is encoded as a topic string (alphanumeric) that could
be used with a message queue server. You do not need to use topics,
but they can be convenient to separate message flows.

To implement the client, use the template:

```js
var transport_utils = seneca.export('transport/utils')

function hook_client_redis( args, clientdone ) {
  var seneca         = this
  var type           = args.type

  // get your transport type default options
  var client_options = seneca.util.clean(_.extend({},options[type],args))

  transport_utils.make_client( make_send, client_options, clientdone )

  // implement your transport here
  // see an existing transport for full example
  // make_send is called per topic
  function make_send( spec, topic, send_done ) {

    // setup topic in transport mechanism

    // send the args over the transport
    send_done( null, function( args, done ) {

      // create message JSON
      var outbound_message = transport_utils.prepare_request( seneca, args, done )

      // send JSON using your transport API

      // don't call done - that only happens if there's a response!
      // this will be done for you
    })
  }
}
```

To implement the server, use the template:

```js
var transport_utils = seneca.export('transport/utils')

function hook_listen_redis( args, done ) {
  var seneca         = this
  var type           = args.type

  // get your transport type default options
  var listen_options = seneca.util.clean(_.extend({},options[type],args))

  // get the list of topics
  var topics = tu.listen_topics( seneca, args, listen_options )

  topics.forEach( function(topic) {

    // "listen" on the topic - implementation dependent!

    // handle inbound messages
    transport_utils.handle_request( seneca, data, listen_options, function(out){

      // there may be no result!
      if( null == out ) return ...;

      // otherwise, send the result back
      // don't forget to stringifyJSON(out) if necessary
    })
  })
}
```

If you do not wish to use a template, you can implement transports
using entirely custom code. In this case, you need to need to provide
results from the _hook_ actions. For the _role:transport,hook:listen_
action, this is easy, as no result is required. For
_role:transport,hook:client_, you need to provide an object with
properties:

   * `id`: an identifier for the client
   * `toString`: a string description for debug logs
   * `match( args )`: return _true_ if the client can transport the given args (i.e. they match the client action pattern)
   * `send( args, done )`: a function that performs the transport, and calls `done` with the result when received

See the `make_anyclient` and `make_pinclient` functions in
[transport.js](transport.js) for implementation examples.

Message transport code should be written very carefully as it will be
subject to high load and many error conditions.


## Plugin Options

The transport plugin family uses an extension to the normal Seneca
options facility. As well as supporting the standard method for
defining options (see [How to Write a
Plugin](http://senecajs.org/tutorials/how-to-write-a-plugin.html#wp-options)), you can
also supply options via arguments to the <code>client</code> or
<code>listen</code> methods, and via the type name of the transport
under the top-level _transport_ property.

The primary options are:

   * _msgprefix_: a string to prefix to topic names so that they are namespaced
   * _callmax_: the maximum number of in-flight request/response messages to cache
   * _msgidlen_: length of the message indentifier string

These can be set within the top-level _transport_ property of the main
Seneca options tree:

```js
var seneca = require('seneca')
seneca({
  transport:{
    msgprefix:'foo'
  }
})
```

Each transport type forms a sub-level within the _transport_
option. The recognized types depend on the transport plugins you have
loaded. By default, _web_ and _tcp_ are available. To use _redis_, for example, you
need to do this:

```js
var seneca = require('seneca')
seneca({
    transport:{
      redis:{
        timeout:500
      }
    }
  })

  // assumes npm install seneca-redis-transport
  .use('redis-transport')

  .listen({type:'redis'})
```

You can set transport-level options inside the type property:

```js
var seneca = require('seneca')
seneca({
  transport:{
    tcp:{
      timeout:1000
    }
  }
})
```

The transport-level options vary by transport. Here are the default ones for HTTP:

   * _type_: type name; constant: 'web'
   * _port_: port number; default: 10101
   * _host_: hostname; default: '0.0.0.0' (all interfaces)
   * _path_: URL path to submit messages; default: '/act'
   * _protocol_: HTTP protocol; default 'http'
   * _timeout_: timeout in milliseconds; default: 5555
   * _headers_: extra headers to include in requests the transport makes; default {}

And for TCP:

   * _type_: type name; constant: 'tcp'
   * _port_: port number; default: 10201
   * _host_: hostname; default: '0.0.0.0' (all interfaces)
   * _timeout_: timeout in milliseconds; default: 5555

The <code>client</code> and <code>listen</code> methods accept an
options object as the primary way to specify options:

```js
var seneca = require('seneca')
seneca()
  .client({timeout:1000})
  .listen({timeout:2000})
```

As a convenience, you can specify the port and host as optional arguments:

```js
var seneca = require('seneca')
seneca()
  .client( 8080 )
  .listen( 9090, 'localhost')
```

To see the options actually in use at any time, you can call the
<code>seneca.options()</code> method. Or try

```sh
$ node seneca-script.js --seneca.log=type:options
```

## Releases

   * 0.9.0: Fixes from @technicallyjosh; proper glob matching with patrun 5.x
   * 0.7.1: fixed log levels
   * 0.7.0: all logs now debug level
   * 0.2.6: fixed error transmit bug https://github.com/senecajs/seneca/issues/63

## Testing with Docker Compose

With docker-machine and docker-compose installed run the following commands:

```
docker-compose build
docker-compose up
```

The output will be the stdout from the server and client logs.  You should also
see the client instance outputting the result from the server: `{ hex: '#FF0000' }`

## Contributing

The [Senecajs org][] encourage open participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features please get in touch.

## Test

To run tests, simply use npm:

```sh
npm run test
```

## License

Copyright (c) 2013-2016, Richard Rodger and other contributors.
Licensed under [MIT][].

[npm-badge]: https://img.shields.io/npm/v/seneca-transport.svg
[npm-url]: https://npmjs.com/package/seneca-transport
[travis-badge]: https://travis-ci.org/senecajs/seneca-transport.svg
[travis-url]: https://travis-ci.org/senecajs/seneca-transport
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[david-badge]: https://david-dm.org/senecajs/seneca-transport.svg
[david-url]: https://david-dm.org/senecajs/seneca-transport
[MIT]: ./LICENSE
[Senecajs org]: https://github.com/senecajs/
[Seneca.js]: https://www.npmjs.com/package/seneca
[senecajs.org]: http://senecajs.org/
[leveldb]: http://leveldb.org/
[github issue]: https://github.com/senecajs/seneca-transport/issues
[@senecajs]: http://twitter.com/senecajs
