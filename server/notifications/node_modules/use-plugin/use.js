/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
"use strict";
/* jshint node:true, asi:true, eqnull:true */


// Generic plugin loader functionality for Node.js frameworks.


// #### System modules
var path = require('path')
var util = require('util')


// #### External modules
var _          = require('lodash')
var nid        = require('nid')
var norma      = require('norma')
var make_eraro = require('eraro')


// #### Exports
module.exports = make


// #### Create a _use_ function
// Parameters:
// 
//   * _useopts_ : (optional) Object; options, which are:
//      * _prefix_ : (optional) String or Array[String]; prepended to plugin names when searching, allows abbreviation of plugin names
//      * _builtin_ : (optional) String or Array[String]; prepend to plugin names when searching, only applies to base module, used for frameworks with builtin plugins
//      * _module_ : (optional, defaults to parent) Object; Node.js API module object, this should be the module of the framework, search will ascend from this module via the parent property
//      * _errmsgprefix_ : (optional, default: true) String or Boolean; error message prefix for [eraro](http://github.com/rjrodger/eraro) module, used by this module to generate error messages
function make( useopts ) {

  // Default options, overidden by caller supplied options.
  useopts = _.extend({
    prefix:       'plugin-',
    builtin:      '../plugin/',
    module:       module.parent,
    errmsgprefix: true
  },useopts)


  // Setup error messages, see msgmap function below for text.
  var eraro = make_eraro({
    package: 'use-plugin',
    msgmap:  msgmap(),
    module:  module,
    prefix:  useopts.errmsgprefix
  })
  

  // This is the function that loads plugins.
  // It is returned for use by the framework calling code.
  // Parameters:
  //
  //   * _plugin_ : (Object or Function or String); plugin definition
  //      * if Object: provide a partial or complete definition with same properties as return value
  //      * if Function: assumed to be plugin _init_ function; plugin name taken from function name, if defined
  //      * if String: base for _require_ search; assumes module defines an _init_ function
  //   * _options_ : (Object, ...)plugin options; if not an object, constructs an object of form {value$:options}
  //   * _callback_ : (Function); callback function, possibly to be called by framework after init function completes  
  //
  // Returns: A plugin description object is returned, with properties:
  //   
  //   * _name_ : String; the plugin name, either supplied by calling code, or derived from definition
  //   * _init_  : Function; the plugin init function, the resolution of which is the point of this module!
  //   * _options_ : Object; plugin options, if supplied
  //   * _search_ : Array[{type,name}]; list of require search paths; applied to each module up the parent chain until something is found
  //   * _found_ : Object{type,name}; search entry that found something
  //   * _requirepath_ : String; the argument to require that found something
  //   * _modulepath_ : String; the Node.js API module.id whose require found something
  //   * _tag_ : String; the tag value of the plugin name (format: name$tag), if any, allows loading of same plugin multiple times
  //   * _err_ : Error; plugin load error, if any
  function use() {
    var args = norma("{plugin:o|f|s, options:o|s|n|b?, callback:f?}",arguments)

    var plugindesc = build_plugindesc(args,useopts,eraro)

    plugindesc.search = build_plugin_names( 
      plugindesc.name, useopts.builtin, useopts.prefix )

    // The init function may already be defined. 
    // If it isn't, try to load it using _require_ over
    // the search paths and module ancestry.
    if( !_.isFunction( plugindesc.init ) ) {
      loadplugin( plugindesc, useopts.module, eraro )      
    }

    // No init function found, require found nothing, so throw error.
    if( !_.isFunction( plugindesc.init ) ) {
      plugindesc.searchlist = 
        _.map(plugindesc.search,function(s){return s.name}).join(', ') 
      throw eraro('not_found',plugindesc)
    }

    return plugindesc;
  }
  
  return use;
}



// #### Create description object for the plugin
function build_plugindesc( spec, useopts, eraro ) {
  var plugin = spec.plugin

  // Don't do much with plugin options, just ensure they are an object.
  var options = null == spec.options ? {} : spec.options
  options = _.isObject(options) ? options : {value$:options}


  // Start building the return value.
  var plugindesc = {
    options:  options,
    callback: spec.callback,
    history:  []
  }


  // The most common case, where the plugin is
  // specified as a string name to be required in.
  if( _.isString( plugin ) ) {
    plugindesc.name = plugin
  }
  
  // Define the plugin with a function, most often used for small, 
  // on-the-fly plugins.
  else if( _.isFunction( plugin ) ) {
    if( _.isString(plugin.name) && '' !== plugin.name ) {
      plugindesc.name = plugin.name
    }

    // The function has no name, so generate a name for the plugin
    else {
      var prefix = _.isArray(useopts.prefix) ? useopts.prefix[0] : useopts.prefix
      plugindesc.name = prefix+nid()
    }

    plugindesc.init = plugin
  }

  // Provide some or all of plugin definition directly.
  else if( _.isObject( plugin ) ) {
    plugindesc = _.extend({},plugin,plugindesc)

    if( !_.isString(plugindesc.name) ) throw eraro('no_name',{plugin:plugin});

    if( null != plugindesc.init && !_.isFunction(plugindesc.init) ) {
      throw eraro('no_init_function',{name:plugindesc.name,plugin:plugin});
    }
  }
  

  // Options as an argument to the _use_ function override options
  // in the plugin description object.
  plugindesc.options = _.extend(plugindesc.options||{},options||{})


  // Plugins can be tagged.
  // The tag can be embedded inside the name using a $ separator: _name$tag_.
  // Note: the $tag suffix is NOT considered part of the file name!
  var m = /^(.+)\$(.+)$/.exec(plugindesc.name)
  if( m ) {
    plugindesc.name = m[1]
    plugindesc.tag  = m[2]
  }


  // Plugins must have a name.
  if( !plugindesc.name ) {
    throw eraro('no_name',plugindesc)
  }

  return plugindesc;
}



// #### Attempt to load the plugin
// The following algorithm is used:
//     0. WHILE module defined
//     1.   FOR EACH search-entry
//     2.     IF NOT first module IGNORE builtins 
//     3.     PERFORM require ON search-entry.name
//     4.     IF FOUND BREAK
//     5.     IF ERROR THROW # construct contextual info
//     6.   IF FOUND update plugindesc, BREAK
//     7.   IF NOT FOUND module = module.parent 
function loadplugin( plugindesc, start_module, eraro ) {
  var current_module = start_module
  var builtin        = true
  var level          = 0
  var reqfunc
  var funcdesc = {}

  // Each loop ascends the module.parent hierarchy
  while( null == funcdesc.initfunc && 
         (reqfunc = make_reqfunc( current_module )) ) 
  {
    funcdesc = perform_require( reqfunc, plugindesc, builtin, level )

    if( funcdesc.error ) 
      throw handle_load_error(funcdesc.error,funcdesc.found,plugindesc,eraro);

    builtin = false
    level++
    current_module = current_module.parent
  }

  // Record the details of where we found the plugin.
  // This is useful for debugging, especially if the "wrong" plugin is loaded.
  plugindesc.modulepath  = funcdesc.module
  plugindesc.requirepath = funcdesc.require
  plugindesc.found       = funcdesc.found

  // The function name of the initfunc, if defined, 
  // sets the final name of the plugin.
  // This replaces relative path references (like "../myplugins/foo") 
  // with a clean name ("foo").
  if( funcdesc.initfunc && 
      null != funcdesc.initfunc.name && 
      '' !== funcdesc.initfunc.name ) 
  {
    plugindesc.name = funcdesc.initfunc.name
  }

  // Success! We have an init function!
  plugindesc.init = funcdesc.initfunc
}



// #### The require that loads a plugin can fail
// This code deals with the known failure cases.
function handle_load_error( err, found, plugindesc, eraro ) {
  plugindesc.err   = err
  plugindesc.found = found

  plugindesc.found_name = plugindesc.found.name
  plugindesc.err_msg    = err.message

  // Syntax error inside the plugin code.
  // Unfortunately V8 does not give us location info.
  // It does print a complaint to STDERR, so need to tell user to look there.
  if( err instanceof SyntaxError ) {
    return eraro('syntax_error',plugindesc)
  }

  // Not what you think!
  // This covers the case where the plugin contains 
  // _require_ calls that themselves fail.
  else if( 'MODULE_NOT_FOUND' == err.code) {
    plugindesc.err_msg = err.stack.replace(/\n.*\(module\.js\:.*/g,'')
    plugindesc.err_msg = plugindesc.err_msg.replace(/\s+/g,' ')
    return eraro('require_failed',plugindesc)
  }

  // The require call failed for some other reason.
  else {
    return eraro('load_failed',plugindesc)
  }
}



// #### Create a _require_ call bound to the correct module
function make_reqfunc( module ) {
  if( null == module ) return null;

  var reqfunc = _.bind(module.require,module)
  reqfunc.module = module.id
  return reqfunc
}



// #### Iterate over all the search items using the provided require function
function perform_require( reqfunc, plugindesc, builtin, level ) {
  var search_list = plugindesc.search
  var initfunc, search


  next_search_entry:
  for( var i = 0; i < search_list.length; i++ ) {
    search = search_list[i]

    // only load builtins if builtin flag true
    if( !builtin && 'builtin' == search.type ) continue;

    if( 0 === level && 
        'builtin' != search.type && 
        search.name.match( /^[.\/]/ ) ) 
      continue;

    try {
      plugindesc.history.push({module:reqfunc.module,path:search.name})
      initfunc = reqfunc( search.name )

      // Found it! 
      break;
    }
    catch( e ) {
      if( 'MODULE_NOT_FOUND' == e.code ) {

        // A require failed inside the plugin.
        if( -1 == e.message.indexOf(search.name) ) {
          return {error:e,found:search}
        }

        // Plain old not found, so continue searching.
        continue next_search_entry;
      }

      else {

        // The require failed for some other reason.
        return {error:e,found:search}
      }
    }
  }

  // Return the init function, and a description of where we found it.
  return {initfunc:initfunc,module:reqfunc.module,require:search.name,found:search};
}



// #### Create the list of require search locations
// Searches are performed without the prefix first
function build_plugin_names() {
  var args = norma('{name:s, builtin:s|a?, prefix:s|a? }', arguments)

  var name         = args.name

  var builtin_list = args.builtin ? 
        _.isArray(args.builtin) ? args.builtin : [args.builtin] : []

  var prefix_list  = args.prefix  ? 
        _.isArray(args.prefix)  ? args.prefix :  [args.prefix] : []
 
  var plugin_names = []

  // Do the builtins first! But only for the framework module, see above.
  if( !name.match( /^[.\/]/ ) ) {
    _.each( builtin_list, function(builtin){
      plugin_names.push( {type:'builtin', name:builtin+name} )
      _.each( prefix_list, function(prefix){
        plugin_names.push( {type:'builtin', name:builtin+prefix+name} )
      })
    })
  }
  
  // Vanilla require on the plugin name.
  // Common case: the require succeeds on first module parent, 
  // because the plugin is an npm module
  // in the code calling the framework.
  plugin_names.push( {type:'normal', name:name} )

  // Try the prefix next.
  _.each( prefix_list, function(prefix){
    plugin_names.push( {type:'normal', name:prefix+name} )
  })

  // OK, probably not an npm module, try locally.
  plugin_names.push( {type:'normal', name:'./'+name} )

  _.each( prefix_list, function(prefix){
    plugin_names.push( {type:'normal', name:'./'+prefix+name} )
  })

  return plugin_names
}



// #### Define the error messages for this module
function msgmap() {
  return {
    syntax_error: "Could not load plugin <%=name%> defined in <%=found_name%> due to syntax error: <%=err_msg%>. See STDERR for details.",
    not_found: "Could not load plugin <%=name%>; require search list: <%=searchlist%>.",
    require_failed: "Could not load plugin <%=name%> defined in <%=found_name%> as a require call inside the plugin (or a module required by the plugin) failed: <%=err_msg%>.",
    no_name: "No name property found for plugin defined by Object <%=plugin%>.",
    no_init_function: "The init property is not a function for plugin <%=name%> defined by Object <%=plugin%>.",
    load_failed: "Could not load plugin <%=name%> defined in <%=found_name%> due to error: <%=err_msg%>.",
  }
}
