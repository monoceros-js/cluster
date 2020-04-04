var isInfinite = function isInfinite(cluster) {
  return cluster === Infinity;
};
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
var isArray = function isArray(value) {
  return Array.isArray(value);
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  return function () {
    var Super = _getPrototypeOf(Derived),
        result;

    if (_isNativeReflectConstruct()) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

var MonocerosClusterError = /*#__PURE__*/function (_Error) {
  _inherits(MonocerosClusterError, _Error);

  var _super = _createSuper(MonocerosClusterError);

  function MonocerosClusterError(message) {
    var _this;

    _classCallCheck(this, MonocerosClusterError);

    _this = _super.call(this);
    _this.name = _this.constructor.name;
    _this.message = message;
    return _this;
  }

  return MonocerosClusterError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

function Cluster(parent) {
  this.parent = parent || Infinity;
  this.entities = {};

  this.register = function (name, entity, options) {
    if (!name) throw new MonocerosClusterError('Entity name must be provided');
    if (!entity) throw new MonocerosClusterError("Could not find entity trying to be registered as ".concat(name));

    if (options) {
      if (isFunction(options)) {
        options = {
          type: options
        };
      }

      if (isArray(options)) {
        options = {
          dependencies: options
        };
      }
    }

    options = options || {};

    for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      args[_key - 3] = arguments[_key];
    }

    this.entities[name] = {
      $uninitialized: entity,
      $type: options.type || Cluster.Body,
      $dependencies: options.dependencies || entity.$dependencies || [],
      $args: args && args.length > 0 ? args : []
    };
  };

  this.createCluster = function () {
    return new Cluster(this);
  };

  this.resolve = function (name) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    if (!name) {
      throw new MonocerosClusterError('Resolve requires the name of an entity to resolve');
    }

    args = args || [];

    if (this.entities.hasOwnProperty(name)) {
      return this.applyEntityType(name, args).resolve();
    }

    if (!isInfinite(this.parent) && this.parent.entities.hasOwnProperty(name)) {
      return this.parent.applyEntityType(name, args).resolve();
    }

    throw new MonocerosClusterError("Could not resolve entity named \"".concat(name, "\""));
  };

  this.applyEntityType = function (name, args) {
    var entity = this.entities[name];
    var _entity = entity,
        $uninitialized = _entity.$uninitialized,
        $type = _entity.$type,
        $dependencies = _entity.$dependencies,
        $args = _entity.$args;
    if (!$uninitialized) return entity;
    entity = this.resolveDependencies($uninitialized, $dependencies, $args.concat(args));
    this.entities[name] = new $type(entity);
    return this.entities[name];
  };

  this.resolveDependencies = function (entity, dependencies, args) {
    var _this = this;

    if (!isFunction(entity)) return entity;
    if (dependencies.length === 0 && args.length === 0) return entity;
    var deps = [];

    if (dependencies.length > 0) {
      dependencies.forEach(function (dep) {
        deps.push(_this.resolve(dep));
      });
    }

    deps.unshift({});
    return entity.bind.apply(entity, deps.concat(args));
  };
}

Cluster.Body = function (entity) {
  this.resolve = function () {
    return entity;
  };
};

Cluster.Singleton = function (entity) {
  var instance;

  this.resolve = function () {
    if (!instance) instance = entity();
    return instance;
  };
};

Cluster.Instance = function (entity) {
  this.resolve = function () {
    return new entity();
  };
};

export default Cluster;
