// Generated by CoffeeScript 1.3.3

/*
Knockout Meteor plugin v0.3
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
    find: function(collection, selector, options, mapping) {
      if (options == null) {
        options = {};
      }
      if (mapping == null) {
        mapping = {};
      }
      return (new FindMany(collection, selector, options, mapping)).run();
    },
    findOne: function(collection, selector, options, mapping) {
      if (options == null) {
        options = {};
      }
      if (mapping == null) {
        mapping = {};
      }
      return (new FindOne(collection, selector, options, mapping)).run();
    }
  };

  AbstractFinder = (function() {

    function AbstractFinder(collection, selector, options, mapping) {
      var _this = this;
      this.collection = collection;
      this.selector = selector;
      this.options = options != null ? options : {};
      this.mapping = mapping != null ? mapping : {};
      this.run = __bind(this.run, this);

      this.target = null;
      ko.computed(function() {
        ko.utils.unwrapObservable(_this.collection);
        ko.utils.unwrapObservable(_this.selector);
        ko.utils.unwrapObservable(_this.options);
        ko.utils.unwrapObservable(_this.mapping);
      }).extend({
        throttle: 1
      }).subscribe(this.run);
    }

    AbstractFinder.prototype.run = function() {
      var collection, mapping, options, selector;
      if (this.query) {
        this.query.destroy();
      }
      collection = ko.utils.unwrapObservable(this.collection);
      selector = ko.utils.unwrapObservable(this.selector);
      options = ko.utils.unwrapObservable(this.options);
      mapping = this.processMapping(ko.utils.unwrapObservable(this.mapping));
      this.query = this.createQuery(collection, selector, options, mapping);
      return this.query.run();
    };

    AbstractFinder.prototype.processMapping = function(raw_mapping) {
      var mapping, view_model;
      mapping = _.clone(raw_mapping);
      view_model = mapping.view_model;
      delete mapping.view_model;
      if (!_.isObject(mapping[""])) {
        mapping[""] = {};
      }
      _.defaults(mapping[""], {
        key: function(item) {
          return ko.utils.unwrapObservable(item._id);
        }
      });
      if (_.isFunction(view_model)) {
        mapping[""].create = function(opts) {
          if (!opts.data) {
            return ko.observable();
          }
          return ko.mapping.fromJS(opts.data, mapping, new view_model(opts.data));
        };
      }
      return mapping;
    };

    AbstractFinder.prototype.createQuery = function(collection, selector, options, mapping) {
      throw new NotImplementedError('createQuery');
    };

    return AbstractFinder;

  })();

  FindMany = (function(_super) {

    __extends(FindMany, _super);

    function FindMany() {
      return FindMany.__super__.constructor.apply(this, arguments);
    }

    FindMany.prototype.createQuery = function(collection, selector, options, mapping) {
      var data_func, meteor_cursor;
      meteor_cursor = collection.find(selector, options);
      data_func = function() {
        meteor_cursor.rewind();
        return meteor_cursor.fetch();
      };
      return new MappedQuery(this, data_func, mapping);
    };

    return FindMany;

  })(AbstractFinder);

  FindOne = (function(_super) {

    __extends(FindOne, _super);

    function FindOne() {
      return FindOne.__super__.constructor.apply(this, arguments);
    }

    FindOne.prototype.createQuery = function(collection, selector, options, mapping) {
      var data_func;
      data_func = function() {
        return collection.findOne(selector, options);
      };
      return new MappedQuery(this, data_func, mapping);
    };

    return FindOne;

  })(AbstractFinder);

  MappedQuery = (function() {

    function MappedQuery(finder, data_func, mapping) {
      this.finder = finder;
      this.data_func = data_func;
      this.mapping = mapping;
      this.execute = __bind(this.execute, this);

      this.active = true;
    }

    MappedQuery.prototype.destroy = function() {
      return this.active = false;
    };

    MappedQuery.prototype.run = function() {
      var results,
        _this = this;
      results = null;
      Deps.autorun(function(computation) {
        if (_this.active) {
          return results = _this.execute();
        }
      });
      return results;
    };

    MappedQuery.prototype.execute = function() {
      var data, old, result;
      data = this.data_func();
      if (this.finder.target && this.finder.target.__ko_mapping__) {
        old = ko.utils.unwrapObservable(this.finder.target);
        if (_.isUndefined(old) || (old && data && !_.isArray(old) && !_.isArray(data) && this.mapping[""].key(old) !== this.mapping[""].key(data))) {
          this.finder.target(ko.utils.unwrapObservable(ko.mapping.fromJS(data, this.mapping)));
        } else {
          ko.mapping.fromJS(data, this.finder.target);
        }
      } else {
        result = ko.mapping.fromJS(data, this.mapping);
        if (ko.isObservable(result)) {
          this.finder.target = result;
        } else {
          this.finder.target = ko.observable(result);
          this.finder.target.__ko_mapping__ = result.__ko_mapping__;
        }
      }
      return this.finder.target;
    };

    return MappedQuery;

  })();

  ko.exportSymbol('meteor', meteor);

}).call(this);
