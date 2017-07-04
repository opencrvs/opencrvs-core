"use strict";

var myAPI = {}

myAPI.doStuff = function(){
  var stuff    = arguments[0]
  var options  = 'function' == typeof(arguments[1]) ? {} : arguments[1]
  var callback = 'function' == typeof(arguments[2]) ? arguments[2] : arguments[1]

  callback(null,'a-'+stuff+'-'+options.b)
}



myAPI.doStuff( 'the-stuff', function( err, result ){ console.log(result) } )
myAPI.doStuff( 'the-stuff', { b:'b'}, 
               function( err, result ){ console.log(result) } )


var norma = require('..')

myAPI.doStuff = function(){
  var args = norma('so?f',arguments)

  var stuff    = args[0]
  var options  = args[1] || {}
  var callback = args[2]

  callback(null,'a-'+stuff+'-'+options.b)
}

myAPI.doStuff( 'the-stuff', function( err, result ){ console.log(result) } )
myAPI.doStuff( 'the-stuff', { b:'b'}, 
               function( err, result ){ console.log(result) } )


myAPI.doStuff = function(){
  var args = norma('stuff:s options:o? callback:f',arguments)
  args.options = args.options || {}

  args.callback(null,'a-'+args.stuff+'-'+args.options.b)
}

myAPI.doStuff( 'the-stuff', function( err, result ){ console.log(result) } )
myAPI.doStuff( 'the-stuff', { b:'b'}, 
               function( err, result ){ console.log(result) } )


function foo() {
  var args = norma('sf', arguments)

  var content = args[0]  // s => string, required
  var cb      = args[1]  // f => function, required

  cb(null,content+'!')
}

foo('bar',function(err,out){
  console.log(out)
})
