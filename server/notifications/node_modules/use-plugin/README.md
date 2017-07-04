# use-plugin

## Generic plugin loader functionality for Node.js frameworks.

For use in framework modules to provide a plugin mechanism for
extensions. While a simple _require_ in calling code is a good start,
this plugin provides some convenience abstractions over vanilla _requires_
so that you can offer a more user-friendly interface.

[![Build Status](https://travis-ci.org/rjrodger/use-plugin.png?branch=master)](https://travis-ci.org/rjrodger/use-plugin)

[Annotated Source](http://rjrodger.github.io/use-plugin/doc/use.html)

[![Gitter chat](https://badges.gitter.im/rjrodger/use-plugin.png)](https://gitter.im/rjrodger/use-plugin)


# Support

If you're using this module, feel free to contact us on twitter if you
have any questions! :) [@senecajs](http://twitter.com/senecajs)

[![Gitter chat](https://badges.gitter.im/rjrodger/use-plugin.png)](https://gitter.im/rjrodger/use-plugin)

See the [seneca](http://github.com/rjrodger/seneca) module for an
example of practical usage.


# Quick example

```JavaScript
// myframework.js
module.exports = function() {
  var use = require('use-plugin')({prefix:'foo',module:module})

  return {
    use: function( plugin_name ) {
      var plugin_description == use(plugin_name)
      
      // call the init function to init the plugin
      plugin_description.init()
    }
  }
}

// callingcode.js
var fm = require('myframework')

// this will try to load:
// 'bar', 'foo-bar', './foo', './foo-bar'
// against the framework module, and then the callingcode module
// nice error messages are thrown if there are problems
fm.use('bar')
```

# Install

```bash
npm install use-plugin
```

There's an [npm module page for use-plugin](https://www.npmjs.org/package/use-plugin).

# Usage

The module provides a builder function that you call with your desired options.
In particular, you should always set your module, as above.

The builder function returns a plugin loader function that you can use
inside your framework.  Calling the loader function returns an object
with properties that describe the plugin.

In particular, the point of this module is to resolve (via require),
the init function of the plugin, so that you can call it in your
framework.

Plugins can be loaded in the following ways:

   * By name: `fm.use('bar')`
   * By name with options: `fm.use('bar', {color:'red'})`
   * As a function: `fm.use(function(){...})`
   * As a named function: `fm.use(function bar(){...})`
   * As a (named) function with options: `fm.use(function bar(){...}, {color:'red'})`
   * As an object: `fm.use({name:'bar', init:function(){...}})`
   * As a _require_: `fm.use( require('./bar.js' ) )`

When loaded as an Object, you must provide at least the _name_ and
_init_ function. When loaded as a _require_ note that the returned
value can be any of string, function or object, to which the same
rules apply. In particular, you need to explicitly provide a _name_
property if you want an explicit name.

# Plugin Name Resolution

The name of the plugin is determined by the following procedure:

   * Plugin specified as string: the given string.
   * Plugin specified as function: the Function object name, otherwise generate a name.
   * Plugin specifed as object: the _name_ property (which is required)
   
The plugin may also have a _tag_. This is a separate string that
allows multiple plugins with the same name to be loaded, depending on
your use-case. To provide a tag, use the name format: _name$tag_, or
provide a _tag_ property on the plugin object or function specification.


# Options

When calling the builder function, you can pass:

   * _module_: The _module_ variable of your framework. 
   * _prefix_: An optional prefix for plugin names. Aallows your users to drop the prefix and use abbreviated plugin names.
   * _builtin_: Load builtin plugins first from this sub-folder of your framework.
   * _errmsgprefix_: Prefix string for error messages.

# Plugin Description Object

If found, an object is returned describing your plugin:

   * _name_ : The resolved name of the plugin. 
   * _tag_ : The resolved tag of the plugin. 
   * _init_ : The resolved initialization function of the plugin.
   * _options_ : Any user-supplied plugin options provided as the second parameter to the created _use_ function. 
   * _callback_ : Optional user-supplied callback provided as the third parameter to the created _use_ function. You'll have to call this yourself.
   * _history_ : The actual _require_ search history. Array of _{module:module-path, name:require-path}_.
   * _search_ : The _require_ paths to search for. 
   * _modulepath_ : Module path where found. 
   * _requirepath_ : Require path where found. 
   * _err_ : Error object, if any. 
   * _found_ : Internal search entry details. 

