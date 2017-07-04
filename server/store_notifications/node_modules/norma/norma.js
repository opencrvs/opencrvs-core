/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


// TODO: allow _ and $ in named args !!! doh!


// #### System modules
var util = require('util')


// #### External modules
var _     = require('lodash')
var error = require('eraro')({package:'norma'})


// #### Internal modules
var parser = require('./norma-parser')


// Default options.
var defopts = {
  onfail:'throw',
  desclen:33
}


// Cache of previously seen type specs.
var specmap = {}


// #### Compile type spec into a regexp
function compile( spec ) {
  if( null == spec ) throw error('no_spec', 'no argument specification');

  var specdef = specmap[spec]
  if( null != specdef ) return specdef;

  var respec = parse_spec( spec )

  // Build regex.
  var reindex = []
  var index   = 1
  var restr = ['^']
  var i = 0
  respec.forEach(function(entry){
    restr.push('(')

    if( entry.type.or && 0 < entry.type.or.length ) {
      var count = 1

      restr.push('(')
      restr.push(entry.type.mark)
      restr.push(')')

      entry.type.or.forEach(function(or){
        restr.push('|')
        restr.push('(')
        restr.push(or[1])
        count++
        restr.push(')')
      })

      if( '?' == entry.mod ) {
        restr.push('|[UNA]?')
      }

      reindex[i]={index:index}
      index += count
    }

    else {
      if( '?' == entry.mod ) {
        restr.push('[UNA'+entry.type.mark+']?')
      }
      else {
        restr.push(entry.type.mark);
        restr.push(entry.mod || '')
      }

      reindex[i]={index:index}
    }

    reindex[i].mod = entry.mod
    restr.push(')')
    index++
    i++
  })
  restr.push('$')

  var re = new RegExp(restr.join(''))
  specdef = specmap[spec] = {re:re,spec:spec,respec:respec,reindex:reindex}

  return specdef;
}


function parse_spec( spec ) {
  try {
    return parser.parse( spec )
  }
  catch(e) {
    throw error('parse', e.message+'; spec:"'+spec+
                '", col:'+e.column+', line:'+e.line)
  }
}


// #### Create output array or object with organised argument values.
function processargs( specdef, options, rawargs ) {
  var args = Array.prototype.slice.call(rawargs||[])
  var argdesc = describe( args )

  // Match the spec regexp against the argument types regexp.
  var outslots = specdef.re.exec(argdesc)
  if( !outslots ) {
    if( 'throw' == options.onfail ) {
      throw error(
        'invalid_arguments', 
        'invalid arguments; expected: "'+specdef.spec+
          '", was: ['+argdesc+']; values: '+descargs(args,options),
        {args:args,specdef:specdef,options:options})
    }
    else return null;
  }

  // Build the organised output.
  // Need to do some index housekeeping as regexp has additional groups.
  var out = specdef.respec.object ? {} : []
  for(var i = 0, j = 0, k = 0; i < specdef.reindex.length; i++ ) {
    var indexspec = specdef.reindex[i]
    var val = void 0

    if( !specdef.respec.object ) {
      out[k] = val
    }
    
    if( null != indexspec.index) {
      var m = outslots[indexspec.index]
      var found = ('' !== m)
      if( found ) {
        var iname = specdef.respec[i].name
        var istar = '*' === specdef.respec[i].mod
        var iplus = '+' === specdef.respec[i].mod

        if( 0 === m.length && iplus ) {
          throw error(
            'invalid_arguments', 
            'invalid arguments; expected: "'+specdef.spec+
              '", was: ['+argdesc+']; values: '+descargs(args,options),
            {args:args,specdef:specdef,options:options})
        }
        if( 1 == m.length ) {
          val = args[j]
          j++

          if( !specdef.respec.object ) {
            out[k] = val
          }

          if( null != iname ) {
            if( istar || iplus ) {
              (out[iname] = (out[iname] || [])).push(val)
            }
            else {
              out[specdef.respec[i].name] = val
            }
          }

          k++
        }
        else if( 1 < m.length ) {
          for( var mI = 0; mI < m.length; mI++ ) {
            val = args[j]
            j++

            if( !specdef.respec.object ) {
              out[k] = val
            }

            if( null != iname ) {
              (out[iname] = (out[iname] || [])).push(val)
            }

            k++
          }
        }
      }
      else {
        if( !specdef.respec.object ) {
          out[k] = void 0
        }
        k++
      }
    }
  }

  return out;
}



// #### Create a type description of the arguments array
// Example: ["a",1] => "si".
function describe(args) {
  var desc = []

  args.forEach(function(arg){

    if( _.isString(arg) ) {
      desc.push('s')
    }

    // Need to check for integer first.
    else if( (!isNaN(arg) && ((arg | 0) === parseFloat(arg))) ) {
      desc.push('i')
    }
    else if( _.isNaN(arg) ) {
      desc.push('A')
    }
    else if( Infinity === arg ) {
      desc.push('Y')
    }
    else if( _.isNumber(arg) ) {
      desc.push('n')
    }
    else if( _.isBoolean(arg) ) {
      desc.push('b')
    }
    else if( _.isFunction(arg) ) {
      desc.push('f')
    }
    else if( _.isArray(arg) ) {
      desc.push('a')
    }
    else if( _.isRegExp(arg) ) {
      desc.push('r')
    }
    else if( _.isDate(arg) ) {
      desc.push('d')
    }
    else if( _.isArguments(arg) ) {
      desc.push('g')
    }

    // Use standard Node.js API for _isError_ test.
    else if( util.isError(arg) ) {
      desc.push('e')
    }

    else if( _.isNull(arg) ) {
      desc.push('N')
    }
    else if( _.isUndefined(arg) ) {
      desc.push('U')
    }
    else if( _.isObject(arg) ) {
      desc.push('o')
    }

    // "q" means an unknown type.
    else {
      desc.push('q')
    }
  })

  return desc.join('')
}


// #### Describe arguments array for error message
// Avoids over long messages.
function descargs( args, options ) {
  var desc = []
  
  _.each(args,function(arg){
    var str = util.inspect(arg).substring(0,options.desclen)
    desc.push(str)
  })

  return desc
}



// #### Perform the actual organisation.
// Options are ... optional.
function handle( specdef, options, rawargs ) {
  if( _.isArguments(options) || _.isArray(options ) ) {
    rawargs = options
    options = null
  }
  options = null == options ? defopts : _.extend({},defopts,options)

  if( null == rawargs ) {
    throw error(
      'init', 
      'no arguments variable; expected norma( "...", arguments ), '+
        'or <compiled>( arguments )',
      {arguments:arguments}
    )
  }
  else return processargs(specdef, options, rawargs)
}



// #### Primary API
module.exports = function( spec, options, rawargs ) {
  var specdef = compile( spec )
  return handle( specdef, options, rawargs )
}



// #### Compile spec for later use
// _toString_ shows you the constructed regexp (for debugging).
module.exports.compile = function( spec ) {
  var specdef = compile( spec )

  var out = function( options, rawargs ) {
    return handle( specdef, options, rawargs )
  }
  out.toString = function() {
    return util.inspect({spec:specdef.spec, re:''+specdef.re})
  }
  return out
}

