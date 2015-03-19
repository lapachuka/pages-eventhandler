var _ = require('underscore');
var async = require('async');

module.exports = (function() {
  var handlers = {};
  return {

      add: function(key, fn) {

        if (!_.isString(key))
          return new Error('First argument should be an string');

        if (!_.isFunction(fn))
          return new Error('Second argument should be an function');

        var keys = (key.split('.').length > 1)
          ? key.split('.') : key;

        // TODO: implement fn to dynamicly create nested objects based
        handlers[keys[0]] = {};
        handlers[keys[0]][keys[1]] = fn;
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
      exec: function(client, arr, options, cb) {
        var appliedHandlers = {};

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