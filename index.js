var _ = require('underscore');
var async = require('async');

var handler = (function() {
  var handlers = {};
  return {
      
      handlers: handlers,

      add: function(key, fn) {
        if (!_.isString(key))
          return new Error('First argument should be an string');

        if (!_.isFunction(fn))
          return new Error('Second argument should be an function');

        var keys = (key.split('.').length > 1)
          ? key.split('.') : key;

        handlers = createdNestedProperties(handlers, keys, fn);

      },

      /**
       * Async executes all applied event handlers. Verifies if array is
       * a valid array, plus validates if objects is an object. Other validation
       * will be placed in handlers itself.
       * @param  {Array}    arr     [description]
       * @param  {Object}   options [description]
       * @param  {Function} cb      [description]
       * @return {}         err     [description]
       */
      
      // TODO: change more to real pub/sub pattern with emit/on methods
      exec: function(client, arr, options, cb) {
        var appliedHandlers = [];

        if (!_.isArray(arr))
          return cb(new Error('First argument should be an array'));

        if (!_.isObject(options))
          return cb(new Error('Second argument should be an object'));

        // FIX: events are not triggered somehow
        _.each(arr, function(val) {
          if (val && handlers[client][val]) {
            appliedHandlers.push(handlers[client][val]);
          }
        });

        async.each([options], async.applyEach(appliedHandlers), function(err) {
          if (err) return cb(err);
          cb(null);
        });
      }
  };
})();

function createdNestedProperties(obj, arr, fn) {
  var lastIndex = arr.pop();
  var previous;

  for (var i = 0; arr.length > i; i++) {
    var key = arr[i];
    if (!obj[key]) {
      obj[key] = {};
    }
    previous = obj[key];
  }

  previous[lastIndex] = fn;
  return obj;
}

module.exports = handler;