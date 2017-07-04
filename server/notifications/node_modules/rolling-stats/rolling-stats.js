/* Copyright (c) 2013-2014 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


function Stats( size, duration, clock ) {
  var self = this

  size = size || 1111
  duration = duration || 60000
  clock = clock || Date.now

  var start = clock()

  var vals  = new Array(size)
  var times = new Array(size)

  var head = -1
  
  var count = 0
  var sum   = 0

  var allmin   = void 0
  var allmax   = void 0
  var allcount = 0
  var allsum   = 0

  var minrate   = void 0
  var maxrate   = void 0


  self.point = function( v ) {
    if( null == v ) return;

    var now = clock()
    var cutoff = now - duration

    head = (head+1) % size

    if( count === size ) {
      sum -= vals[head]
      count--
    }

    vals[head]  = v
    times[head] = now

    count++
    sum += v

    allcount++
    allsum += v
    allmin = void 0===allmin ? v : v < allmin ? v : allmin
    allmax = void 0===allmax ? v : allmax < v ? v : allmax

    //console.log('point k:'+times[head]+',n:'+count+',h:'+head+', v='+vals+' t='+times)
  }

  
  self.calculate = function() {
    var now = clock()
    var cutoff = now - duration
    var i

    if( 0 < count ) {
      var tail = (size + head - count + 1) % size
      i = 0
      while( i++ < count && times[tail] <= cutoff ) {
        sum -= vals[tail]
        count--
        tail = (tail+1) % size
      }
    }

    var mean = 0 < count ? sum / count : 0
    var vr = 0, v, min, max
    for( i = 0; i < count; i++ ) {
      v = vals[(size+head-i)%size]
      vr += Math.pow( v - mean, 2 )
      min = void 0===min ? v : v < min ? v : min
      max = void 0===max ? v : max < v ? v : max
    }

    var rate = 1000 * count / duration
    minrate = void 0===minrate ? rate : rate < minrate ? rate : minrate
    maxrate = void 0===maxrate ? rate : maxrate < rate ? rate : maxrate

    var out = {
      now: now,
      from: cutoff,
      start: start,

      count: count, 
      sum: sum,
      mean: mean,
      min : min,
      max : max,
      stddev: 1 < count ? Math.sqrt(vr/(count-1)) : 0,

      rate:rate,
      minrate:minrate,
      maxrate:maxrate,

      allmin : allmin,
      allmax : allmax,
      allcount : allcount,
      allsum : allsum,
      allmean : 0 < allcount ? allsum / allcount : 0,
      allrate: 1000 * allcount / (now-start)
    }
    //console.log(require('util').inspect(out))

    return out
  }


  return self
}


function NamedStats( size, duration, clock ) {
  var self = this

  var empty = new Stats( 1, 1 ).calculate()
  var map = {}

  self.point = function( v, name ) {
    if( null == v || null == name ) return;

    var stats = (map[name] = (map[name] || new Stats( size, duration, clock )))
    stats.point( v )
  }

  
  self.calculate = function( name ) {
    if( null == name ) {
      var out = {}
      for( var n in map ) {
        out[n] = map[n].calculate()
      }
      return out
    }

    var stats = (map[name] = (map[name] || new Stats( size, duration )))
    if( null == stats ) return empty;

    return stats.calculate()
  }


  self.names = function() {
    var names = []
    for( var name in map ) {
      names.push(name)
    }
    return names;
  }
  
  return self
}


module.exports = function( size, duration, clock ) {
  var stats = new Stats( size, duration, clock );
  return stats
}

module.exports.Stats      = Stats
module.exports.NamedStats = NamedStats
