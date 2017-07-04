/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */


// Create JavaScript Error objects with code strings, context details,
// and templated messages.
"use strict";


// #### System modules
var util = require('util')


// #### External modules
var _ = require('lodash')


// #### Exports
module.exports = eraro


// #### Create an _eraro_ function
// Parameters:
// 
//   * _options_ : (optional) Object; properties:
//      * _package_ : (optional) String; package name to mark Error objects
//      * _prefix_  : (optional) Boolean/String; If false, then no prefix is used; If not defined, the package name is used
//      * _module_  : (optional) Object; _module_ object to use as starting point for _require_ calls
//      * _msgmap_  : (optional) Object; map codes to message templates 
//      * _inspect_ : (optional) Boolean; If true, _util.inspect_ is called on values; default: true.
//
// Returns: Function
//
// The created function has parameters:
//  
//   * _exception_ : (optional) Error; the original exception to be wrapped
//   * _code_ : (optional) String; code value
//   * _message_ : (optional) String; error message, will be processed as a template
//   * _details_ : (optional) Object; contextual details of the error, used to insert details into message
//
// and returns an Error object (to be thrown or used in a callback, as needed).
// The returned Error object has the following additional properties:
//   
//   * _code_: String; the code string
//   * _package_: String; the package name
//   * _**package-name**_: Boolean (true); a convenience marker for the package
//   * _msg_: String; the generated message, may differ from original exception message (if any)
//   * _details_: Object; contextual details of error
//   * _callpoint_: String; first line of stacktrace that is external to eraro and calling module 
function eraro( options ) {
  options = options || {}

  var msgprefix  = false === options.prefix ? '' : 
        (_.isString(options.prefix) ? options.prefix : _.isString(options.package) ? options.package+': ' : '')

  var packaje    = options.package || 'unknown'
  var callmodule = options.module  || module
  var msgmap     = options.msgmap  || {}
  var inspect    = null == options.inspect ? true : !!options.inspect

  var markers    = [module.filename]

  var filename = callmodule.filename
  if( filename ) markers.push(filename);


  var errormaker = function( ex, code, msg, details ) {
    var internalex = false

    if( util.isError(ex) ) {
      if( ex.eraro && !options.override ) return ex;
    }
    else {
      internalex = true
      ex         = null
      code       = arguments[0]
      msg        = arguments[1]
      details    = arguments[2]
    }

    code = _.isString(code) ? code : 
      (ex ? 
       ex.code ? ex.code : 
       ex.message ? ex.message : 
       'unknown' : 'unknown')

    details = _.isObject(details) ? details : 
      (_.isObject(msg) && !_.isString(msg) ? msg : {})

    msg = _.isString(msg) ? msg : null
    msg = buildmessage(options,msg,msgmap,msgprefix,inspect,code,details,ex)


    var err = new Error(msg)
    
    if( ex ) { 
      details.orig$    = null == details.orig$ ? ex : details.orig$
      details.message$ = null == details.message$ ? ex.message : details.message$

      // drag along properties from original exception
      for( var p in ex ) {
        err[p] = ex[p]
      }
    }

    err.eraro     = true

    err.orig      = ex // orig
    err.code      = code
    err[packaje]  = true
    err.package   = packaje
    err.msg       = msg
    err.details   = details

    err.stack     = ex ? ex.stack : err.stack
    err.callpoint = callpoint( err , markers )

    return err;
  }

  errormaker.callpoint = callpoint

  return errormaker;
}



// #### Find the first external stack trace line.
// Parameters:
// 
//   * _error_ : (optional) Error; provides the stack
//   * _markers_ : (optional) Array[String]; ignore lines containing these strings
//
// Returns: String; stack trace line, with indent removed
function callpoint( error, markers ) {
  markers = _.isArray(markers) ? markers : []

  var stack = error ? error.stack : null
  var out   = ''

  if( stack ) {
    var lines = stack.split('\n')
    var done  = false
    var i

    line_loop:
    for( i = 1; i < lines.length; i++ ) {
      var line = lines[i]

      var found = false
      for( var j = 0; j < markers.length; j++ ) {
        if( _.isString( markers[j] ) ) {
          found = ( -1 != line.indexOf( markers[j] ) )
          if( found ) break;
        }
      }

      if( !found ) break line_loop;
    }

    out = _.isString(lines[i]) ? lines[i].substring(4) : out
  }

  return out
}



// #### Build the message string from a template by inserting details
// Uses the underscore template function with default settings. 
// The original message (_msg_) has priority over messages from the _msgmap_.
// If no message can be found, the _code_ is used as a message.
// If an insert property is not defined, it is replaced with _[name?]_ in the message.
// As a convenience, _util_ and ___ are made available in the templates.
//
// Parameters:
// 
//   * _msg_ : (required) String; message template
//   * _msgmap_ : (required) Object; map codes to message templates
//   * _msgprefix_: (required) String; prefix for all messages, useful as indentification of error origin
//   * _code_: (required) String; error code
//   * _details_: (required) Object; error details providing context
//
// Returns: String; human readable error message
function buildmessage(options,msg,msgmap,msgprefix,inspect,code,details,ex) {
  var message = msgprefix + (_.isString(msg) ? msg : 
                             _.isString(msgmap[code]) ? msgmap[code] : 
                             ex ? originalmsg(options.override,ex) : code )

  // These are the inserts.
  var valmap = _.extend({},details,{code:code})

  // Workaround to prevent underscore blowing up if properties are not
  // found.  Reserved words and undefined need to be suffixed with $
  // in the template interpolates.

  var valstrmap = {util:util,_:_}
  _.each(valmap,function(val,key){
    /* jshint evil:true */
    try { eval('var '+key+';') } catch(e) { key = key+'$' }
    if( {'undefined':1,'NaN':1}[key] ) { key = key+'$' }
    valstrmap[key] = inspect && !_.isString(val) ? util.inspect(val) : val
  })

  var done = false
  while( !done ) {
    try {
      var tm = _.template( message )
      message = tm(valstrmap)
      done = true
    }
    catch(e) {
      if(e instanceof ReferenceError) {
        var m = /ReferenceError:\s+(.*?)\s+/.exec(e.toString())
        if( m && m[1] ) {
          valstrmap[m[1]]="["+m[1]+"?]"
        }
        else done = true
      }

      // Some other error - give up and just dump the properties at
      // the end of the template.
      else {
        done = true
        message = message+' VALUES:'+util.inspect(valmap,{depth:2})+
          ' TEMPLATE ERROR: '+e
      }
    }
  }

  return message
}



function originalmsg( override, ex ) {
  if( !ex ) return;

  if( override && ex.eraro && ex.orig ) return ex.orig.message;

  return ex.message;
}
