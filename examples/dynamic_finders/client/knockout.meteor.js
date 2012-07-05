// Generated by CoffeeScript 1.3.3

/*
Knockout Meteor plugin v0.2.2
(c) 2012 Steven Luscher, Ruboss - http://ruboss.com/
License: MIT (http://www.opensource.org/licenses/mit-license.php)

Create Knockout Observables from queries against Meteor Collections.
When the results of those queries change, knockout.meteor.js will
ensure that the Observables are updated.

http://github.com/steveluscher/knockout.meteor
*/


(function() {
  var AbstractFinder, FindMany, FindOne, MappedQuery, NotImplementedError, meteor,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  NotImplementedError = (function(_super) {

    __extends(NotImplementedError, _super);

    function NotImplementedError(func_name) {
      this.name = 'NotImplementedError';
      this.message = "'" + func_name + "' function must be implemented by subclass.";
    }

    return NotImplementedError;

  })(Error);

  meteor = {
    find: function(collection, selector, options) {
      if (options == null) {
        options = {};
      }
      return (new FindMany(collection, selector, options)).run();
    },
    findOne: function(collection, selector, options) {
      if (options == null) {
        options = {};
      }
      return (new FindOne(collection, selector, options)).run();
    }
  };

  AbstractFinder = (function() {

    function AbstractFinder(collection, selector, options) {
      var _this = this;
      this.collection = collection;
      this.selector = selector;
      this.options = options != null ? options : {};
      this.run = __bind(this.run, this);

      this.target = null;
      ko.computed(function() {
        ko.utils.unwrapObservable(_this.collection);
        ko.utils.unwrapObservable(_this.selector);
        ko.utils.unwrapObservable(_this.options);
      }).extend({
        throttle: 1
      }).subscribe(this.run);
    }

    AbstractFinder.prototype.run = function() {
      var collection, options, selector;
      if (this.query) {
        this.query.destroy();
      }
      collection = ko.utils.unwrapObservable(this.collection);
      selector = ko.utils.unwrapObservable(this.selector);
      options = ko.utils.unwrapObservable(this.options);
      this.applyDefaults(options);
      this.query = this.createQuery(collection, selector, options);
      return this.query.run();
    };

    AbstractFinder.prototype.applyDefaults = function(options) {
      _.defaults(options, {
        mapping: {},
        view_model: null
      });
      _.defaults(options.mapping, {
        key: function(item) {
          return ko.utils.unwrapObservable(item._id);
        },
        copy: []
      });
      if (options.mapping.copy && _.isArray(options.mapping.copy)) {
        options.mapping.copy = _.union(options.mapping.copy, ['_id']);
      }
      if (_.isFunction(options.view_model)) {
        return options.mapping.create = function(opts) {
          var view_model;
          if (!opts.data) {
            return ko.observable();
          }
          view_model = new options.view_model();
          return ko.mapping.fromJS(opts.data, options.mapping, view_model);
        };
      }
    };

    AbstractFinder.prototype.createQuery = function(collection, selector, options) {
      throw new NotImplementedError('createQuery');
    };

    return AbstractFinder;

  })();

  FindMany = (function(_super) {

    __extends(FindMany, _super);

    function FindMany() {
      return FindMany.__super__.constructor.apply(this, arguments);
    }

    FindMany.prototype.createQuery = function(collection, selector, options) {
      var data_func, meteor_cursor;
      meteor_cursor = collection.find(selector, options.meteor_options);
      data_func = function() {
        meteor_cursor.rewind();
        return meteor_cursor.fetch();
      };
      return new MappedQuery(this, data_func, options.mapping);
    };

    return FindMany;

  })(AbstractFinder);

  FindOne = (function(_super) {

    __extends(FindOne, _super);

    function FindOne() {
      return FindOne.__super__.constructor.apply(this, arguments);
    }

    FindOne.prototype.createQuery = function(collection, selector, options) {
      var data_func;
      data_func = function() {
        return collection.findOne(selector, options.meteor_options);
      };
      return new MappedQuery(this, data_func, options.mapping);
    };

    return FindOne;

  })(AbstractFinder);

  MappedQuery = (function() {

    function MappedQuery(finder, data_func, mapping) {
      this.finder = finder;
      this.data_func = data_func;
      this.mapping = mapping;
      this.execute = __bind(this.execute, this);

      this.onInvalidate = __bind(this.onInvalidate, this);

      this.active = true;
    }

    MappedQuery.prototype.destroy = function() {
      return this.active = false;
    };

    MappedQuery.prototype.onInvalidate = function() {
      if (this.active) {
        return this.run();
      }
    };

    MappedQuery.prototype.run = function() {
      var ctx;
      ctx = new Meteor.deps.Context();
      ctx.on_invalidate(this.onInvalidate);
      return ctx.run(this.execute);
    };

    MappedQuery.prototype.execute = function() {
      var data, old, result;
      data = this.data_func();
      if (this.finder.target && this.finder.target.__ko_mapping__) {
        old = ko.utils.unwrapObservable(this.finder.target);
        if (_.isUndefined(old) || (old && data && !_.isArray(old) && !_.isArray(data) && this.mapping.key(old) !== this.mapping.key(data))) {
          this.finder.target(ko.utils.unwrapObservable(ko.mapping.fromJS(data, this.mapping)));
        } else {
          ko.mapping.fromJS(data, this.finder.target);
        }
      } else {
        result = ko.mapping.fromJS(data, this.mapping);
        this.finder.target = ko.isObservable(result) ? result : ko.observable(result);
      }
      return this.finder.target;
    };

    return MappedQuery;

  })();

  ko.exportSymbol('meteor', meteor);

}).call(this);
