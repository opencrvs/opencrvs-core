# norma

### A function argument organizer

Sometimes you want your functions to accept optional arguments. It
makes your API nicer.


### Support

If you're using this module, feel free to contact me on twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

Current Version: 0.3.0

Tested on: node 0.10.26

[![Build Status](https://travis-ci.org/rjrodger/norma.png?branch=master)](https://travis-ci.org/rjrodger/norma)

[Annotated Source](http://rjrodger.github.io/norma/doc/norma.html)

[![Gitter chat](https://badges.gitter.im/rjrodger/norma.png)](https://gitter.im/rjrodger/norma)


# Usage

Let's take an example. Say your the basic function signature is:

```JavaScript
myAPI.doStuff( 'the-stuff', function( err, result ){ ... } )
```

But you also want to support options:

```JavaScript
myAPI.doStuff( 'the-stuff', 
               { option1:'foo', option2:'bar'}, 
               function( err, result ){ ... } )
```

The callback should be the last argument. That's the style. So you have to write a bit of logic to test if the second argument
is an object or a function and act appropriately. Ths is cruft code getting in the way of real work.

```JavaScript
myAPI.doStuff = function(){
  var stuff    = arguments[0]
  var options  = 'function' == typeof(arguments[1]) ? {} : arguments[1]
  var callback = 'function' == typeof(arguments[2]) ? arguments[2] : arguments[1]
  ...
}
```


With this module, you specify what you want using a simple expression language:

```JavaScript
myAPI.doStuff = function(){
  var args = norma('so?f',arguments)

  var stuff    = args[0]
  var options  = args[1] || {}
  var callback = args[2]
}
```

Now your arguments always come back in a well-defined array, and always at the same index.

The expression 'so?f' means match: a string, an optional object, and a function

You can also assign names:


```JavaScript
myAPI.doStuff = function(){
  var args = norma('stuff:s options:o? callback:f',arguments)
  // args == {stuff:..., options:..., callback:...}
  args.options = args.options || {}
}
```

And of course, if your function is called with arguments that do not match the expression, then an error is thrown.




### Support

If you're using this module, feel free to contact me on twitter if you have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

Current Version: 0.2.6

Tested on: node 0.10.26

[![Build Status](https://travis-ci.org/rjrodger/norma.png?branch=master)](https://travis-ci.org/rjrodger/norma)



### Quick example

```JavaScript
var norma = require('norma')

function foo() {
  var args = norma('sf', arguments)

  var content = args[0]  // s => string, required
  var cb      = args[1]  // f => function, required

  cb(null,content+'!')
}

foo('bar',function(err,out){
  console.log(out)
})
```


## Install

```sh
npm install norma
```


# Function Signature Expression

The expression you use to define the function argument types that you
expect is a string containing individual characters that stand for
JavaScript types. Each type is a single character. These are:

   * s - string    
   * i - integer   
   * n - number    
   * b - boolean   
   * f - function  
   * a - array     
   * o - object    
   * r - regexp    
   * d - date      
   * g - arguments 
   * e - error     
   * N - null      
   * U - undefined 
   * A - NaN       
   * Y - Infinity  

You list the types you expect, in the order you expect. The _norma_
module will return an array with each position corresponding to the position of each type letter.

This works like so:

   * "s"   => [string]                   => [ "Foo" ]
   * "si"  => [string, integer]          => [ "Foo", 123 ]
   * "sbi" => [string, boolean, integer] => [ "Foo", true, 123 ]


The syntax of the expression is similar to a regular expression (but it's not one!). You can use these special characters:

   * . - match any type
   * ? - preceding type is optional (also matches null, undefined, and NaN)
   * * - preceding type can occur any number of times (including zero)    
   * + - preceding type can occur any number of times (but must occur at least once)    
   * | - set of alternate types that are valid in this argument position

Now you can do this:

   * "so?f" => [ string, optional object, function ] => [ "a", function(){...} ]; [ "a", {b:1}, function(){...} ]
   * "s?n"  => [ optional string, number ] => [ "a", 1 ]; [ 1 ]
   * "si*"  => [ string, zero or more integers... ] => [ "a" ]; [ "a", 1 ]; [ a, 1, 2 ]; [ a, 1, 2, 3 ]
   * "si+"  => [ string, one or more integers... ] => [ "a", 1 ]; [ a, 1, 2 ]; [ a, 1, 2, 3 ]
   * "s.*"  => [ string, anything... ] => [ "a", true ]; [ a, {}, [] ]; [ a, 3, {}, true, /hola/ ]
   * "s|if" => [ string or integer, function ] => [ "a", function(){...} ]; [ 1, function(){...} ];

You can use whitespace and commas to make things more readable:

  * "so?f" === "s o? f" === "s, o?, f" 

If no match is found for a given position, _undefined_ is used as the placeholder:

  * "si*" on [ "a" ] gives [ "a", undefined ]
  * "s.*b" on [ "a", true ] gives [ "a", undefined, true ]

Alternates can also be optional, so this works too:

   * "s|i? b" => [ optional string or integer, boolean ] => [ true ]; [ "a", true ]; [ 1, true ];

Note that you'll get an _undefined_ as the placeholder, as usual:

   * "s|i? b" on [ true ]; [ "a", true ]; [ 1, true ]; gives [ undefined, true ]; [ "a", true ]; [ 1, true ]; 

You can also give arguments names. These are set as properties on the returned array, as well being assigned an index:

  * "foo:s" => [ "val", foo:"val" ]  // in util.inspect output format

If you really want an object, use the form:

  * "{foo:s}" => { foo:"val" }

If you use the * modifier, and a name, then you'll get back an array listing all the matches (zero or more).

  * "{foo:s*}" => { foo: ["v1","v2",...] }

And that's it!


## Compiling patterns

You can compile a pattern ahead of time:

```JavaScript
var norma = require('norma')

var needstring = norma.compile('s')

function foo() {
  var args = needstring( arguments )
  console.log( 'string:'+args[0] ) 
}
```



## How it Works

The parser uses [PEG.js](http://pegjs.majda.cz/) to understand the
signature expression, and then it builds an internal regular
expression to match the function argument types.


The source code is [annotated](http://rjrodger.github.io/norma/doc/norma.html).



# Development

Edit _norma-parser.pegjs_ to modify the grammar. Rebuild with _npm run build_.


Test with:

```bash
npm test
```

