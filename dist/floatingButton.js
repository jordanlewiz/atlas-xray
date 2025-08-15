(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/dexie/dist/dexie.js
  var require_dexie = __commonJS({
    "node_modules/dexie/dist/dexie.js"(exports, module2) {
      (function(global2, factory) {
        typeof exports === "object" && typeof module2 !== "undefined" ? module2.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, global2.Dexie = factory());
      })(exports, (function() {
        "use strict";
        var extendStatics2 = function(d, b) {
          extendStatics2 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
          };
          return extendStatics2(d, b);
        };
        function __extends2(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics2(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        }
        var __assign2 = function() {
          __assign2 = Object.assign || function __assign3(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
          };
          return __assign2.apply(this, arguments);
        };
        function __spreadArray2(to, from, pack) {
          if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
              if (!ar) ar = Array.prototype.slice.call(from, 0, i);
              ar[i] = from[i];
            }
          }
          return to.concat(ar || Array.prototype.slice.call(from));
        }
        var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
        var keys = Object.keys;
        var isArray2 = Array.isArray;
        if (typeof Promise !== "undefined" && !_global.Promise) {
          _global.Promise = Promise;
        }
        function extend(obj, extension) {
          if (typeof extension !== "object")
            return obj;
          keys(extension).forEach(function(key) {
            obj[key] = extension[key];
          });
          return obj;
        }
        var getProto = Object.getPrototypeOf;
        var _hasOwn = {}.hasOwnProperty;
        function hasOwn2(obj, prop) {
          return _hasOwn.call(obj, prop);
        }
        function props(proto, extension) {
          if (typeof extension === "function")
            extension = extension(getProto(proto));
          (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(function(key) {
            setProp(proto, key, extension[key]);
          });
        }
        var defineProperty = Object.defineProperty;
        function setProp(obj, prop, functionOrGetSet, options) {
          defineProperty(obj, prop, extend(functionOrGetSet && hasOwn2(functionOrGetSet, "get") && typeof functionOrGetSet.get === "function" ? { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } : { value: functionOrGetSet, configurable: true, writable: true }, options));
        }
        function derive(Child) {
          return {
            from: function(Parent) {
              Child.prototype = Object.create(Parent.prototype);
              setProp(Child.prototype, "constructor", Child);
              return {
                extend: props.bind(null, Child.prototype)
              };
            }
          };
        }
        var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        function getPropertyDescriptor(obj, prop) {
          var pd = getOwnPropertyDescriptor(obj, prop);
          var proto;
          return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
        }
        var _slice = [].slice;
        function slice2(args, start, end) {
          return _slice.call(args, start, end);
        }
        function override(origFunc, overridedFactory) {
          return overridedFactory(origFunc);
        }
        function assert2(b) {
          if (!b)
            throw new Error("Assertion Failed");
        }
        function asap$1(fn) {
          if (_global.setImmediate)
            setImmediate(fn);
          else
            setTimeout(fn, 0);
        }
        function arrayToObject(array, extractor) {
          return array.reduce(function(result2, item, i) {
            var nameAndValue = extractor(item, i);
            if (nameAndValue)
              result2[nameAndValue[0]] = nameAndValue[1];
            return result2;
          }, {});
        }
        function getByKeyPath(obj, keyPath) {
          if (typeof keyPath === "string" && hasOwn2(obj, keyPath))
            return obj[keyPath];
          if (!keyPath)
            return obj;
          if (typeof keyPath !== "string") {
            var rv = [];
            for (var i = 0, l = keyPath.length; i < l; ++i) {
              var val = getByKeyPath(obj, keyPath[i]);
              rv.push(val);
            }
            return rv;
          }
          var period = keyPath.indexOf(".");
          if (period !== -1) {
            var innerObj = obj[keyPath.substr(0, period)];
            return innerObj == null ? void 0 : getByKeyPath(innerObj, keyPath.substr(period + 1));
          }
          return void 0;
        }
        function setByKeyPath(obj, keyPath, value) {
          if (!obj || keyPath === void 0)
            return;
          if ("isFrozen" in Object && Object.isFrozen(obj))
            return;
          if (typeof keyPath !== "string" && "length" in keyPath) {
            assert2(typeof value !== "string" && "length" in value);
            for (var i = 0, l = keyPath.length; i < l; ++i) {
              setByKeyPath(obj, keyPath[i], value[i]);
            }
          } else {
            var period = keyPath.indexOf(".");
            if (period !== -1) {
              var currentKeyPath = keyPath.substr(0, period);
              var remainingKeyPath = keyPath.substr(period + 1);
              if (remainingKeyPath === "")
                if (value === void 0) {
                  if (isArray2(obj) && !isNaN(parseInt(currentKeyPath)))
                    obj.splice(currentKeyPath, 1);
                  else
                    delete obj[currentKeyPath];
                } else
                  obj[currentKeyPath] = value;
              else {
                var innerObj = obj[currentKeyPath];
                if (!innerObj || !hasOwn2(obj, currentKeyPath))
                  innerObj = obj[currentKeyPath] = {};
                setByKeyPath(innerObj, remainingKeyPath, value);
              }
            } else {
              if (value === void 0) {
                if (isArray2(obj) && !isNaN(parseInt(keyPath)))
                  obj.splice(keyPath, 1);
                else
                  delete obj[keyPath];
              } else
                obj[keyPath] = value;
            }
          }
        }
        function delByKeyPath(obj, keyPath) {
          if (typeof keyPath === "string")
            setByKeyPath(obj, keyPath, void 0);
          else if ("length" in keyPath)
            [].map.call(keyPath, function(kp) {
              setByKeyPath(obj, kp, void 0);
            });
        }
        function shallowClone(obj) {
          var rv = {};
          for (var m in obj) {
            if (hasOwn2(obj, m))
              rv[m] = obj[m];
          }
          return rv;
        }
        var concat = [].concat;
        function flatten(a) {
          return concat.apply([], a);
        }
        var intrinsicTypeNames = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(flatten([8, 16, 32, 64].map(function(num) {
          return ["Int", "Uint", "Float"].map(function(t) {
            return t + num + "Array";
          });
        }))).filter(function(t) {
          return _global[t];
        });
        var intrinsicTypes = new Set(intrinsicTypeNames.map(function(t) {
          return _global[t];
        }));
        function cloneSimpleObjectTree(o) {
          var rv = {};
          for (var k in o)
            if (hasOwn2(o, k)) {
              var v = o[k];
              rv[k] = !v || typeof v !== "object" || intrinsicTypes.has(v.constructor) ? v : cloneSimpleObjectTree(v);
            }
          return rv;
        }
        function objectIsEmpty(o) {
          for (var k in o)
            if (hasOwn2(o, k))
              return false;
          return true;
        }
        var circularRefs = null;
        function deepClone(any) {
          circularRefs = /* @__PURE__ */ new WeakMap();
          var rv = innerDeepClone(any);
          circularRefs = null;
          return rv;
        }
        function innerDeepClone(x) {
          if (!x || typeof x !== "object")
            return x;
          var rv = circularRefs.get(x);
          if (rv)
            return rv;
          if (isArray2(x)) {
            rv = [];
            circularRefs.set(x, rv);
            for (var i = 0, l = x.length; i < l; ++i) {
              rv.push(innerDeepClone(x[i]));
            }
          } else if (intrinsicTypes.has(x.constructor)) {
            rv = x;
          } else {
            var proto = getProto(x);
            rv = proto === Object.prototype ? {} : Object.create(proto);
            circularRefs.set(x, rv);
            for (var prop in x) {
              if (hasOwn2(x, prop)) {
                rv[prop] = innerDeepClone(x[prop]);
              }
            }
          }
          return rv;
        }
        var toString3 = {}.toString;
        function toStringTag(o) {
          return toString3.call(o).slice(8, -1);
        }
        var iteratorSymbol = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
        var getIteratorOf = typeof iteratorSymbol === "symbol" ? function(x) {
          var i;
          return x != null && (i = x[iteratorSymbol]) && i.apply(x);
        } : function() {
          return null;
        };
        function delArrayItem(a, x) {
          var i = a.indexOf(x);
          if (i >= 0)
            a.splice(i, 1);
          return i >= 0;
        }
        var NO_CHAR_ARRAY = {};
        function getArrayOf(arrayLike) {
          var i, a, x, it;
          if (arguments.length === 1) {
            if (isArray2(arrayLike))
              return arrayLike.slice();
            if (this === NO_CHAR_ARRAY && typeof arrayLike === "string")
              return [arrayLike];
            if (it = getIteratorOf(arrayLike)) {
              a = [];
              while (x = it.next(), !x.done)
                a.push(x.value);
              return a;
            }
            if (arrayLike == null)
              return [arrayLike];
            i = arrayLike.length;
            if (typeof i === "number") {
              a = new Array(i);
              while (i--)
                a[i] = arrayLike[i];
              return a;
            }
            return [arrayLike];
          }
          i = arguments.length;
          a = new Array(i);
          while (i--)
            a[i] = arguments[i];
          return a;
        }
        var isAsyncFunction = typeof Symbol !== "undefined" ? function(fn) {
          return fn[Symbol.toStringTag] === "AsyncFunction";
        } : function() {
          return false;
        };
        var dexieErrorNames = [
          "Modify",
          "Bulk",
          "OpenFailed",
          "VersionChange",
          "Schema",
          "Upgrade",
          "InvalidTable",
          "MissingAPI",
          "NoSuchDatabase",
          "InvalidArgument",
          "SubTransaction",
          "Unsupported",
          "Internal",
          "DatabaseClosed",
          "PrematureCommit",
          "ForeignAwait"
        ];
        var idbDomErrorNames = [
          "Unknown",
          "Constraint",
          "Data",
          "TransactionInactive",
          "ReadOnly",
          "Version",
          "NotFound",
          "InvalidState",
          "InvalidAccess",
          "Abort",
          "Timeout",
          "QuotaExceeded",
          "Syntax",
          "DataClone"
        ];
        var errorList = dexieErrorNames.concat(idbDomErrorNames);
        var defaultTexts = {
          VersionChanged: "Database version changed by other database connection",
          DatabaseClosed: "Database has been closed",
          Abort: "Transaction aborted",
          TransactionInactive: "Transaction has already completed or failed",
          MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
        };
        function DexieError(name, msg) {
          this.name = name;
          this.message = msg;
        }
        derive(DexieError).from(Error).extend({
          toString: function() {
            return this.name + ": " + this.message;
          }
        });
        function getMultiErrorMessage(msg, failures) {
          return msg + ". Errors: " + Object.keys(failures).map(function(key) {
            return failures[key].toString();
          }).filter(function(v, i, s) {
            return s.indexOf(v) === i;
          }).join("\n");
        }
        function ModifyError(msg, failures, successCount, failedKeys) {
          this.failures = failures;
          this.failedKeys = failedKeys;
          this.successCount = successCount;
          this.message = getMultiErrorMessage(msg, failures);
        }
        derive(ModifyError).from(DexieError);
        function BulkError(msg, failures) {
          this.name = "BulkError";
          this.failures = Object.keys(failures).map(function(pos) {
            return failures[pos];
          });
          this.failuresByPos = failures;
          this.message = getMultiErrorMessage(msg, this.failures);
        }
        derive(BulkError).from(DexieError);
        var errnames = errorList.reduce(function(obj, name) {
          return obj[name] = name + "Error", obj;
        }, {});
        var BaseException = DexieError;
        var exceptions = errorList.reduce(function(obj, name) {
          var fullName = name + "Error";
          function DexieError2(msgOrInner, inner) {
            this.name = fullName;
            if (!msgOrInner) {
              this.message = defaultTexts[name] || fullName;
              this.inner = null;
            } else if (typeof msgOrInner === "string") {
              this.message = "".concat(msgOrInner).concat(!inner ? "" : "\n " + inner);
              this.inner = inner || null;
            } else if (typeof msgOrInner === "object") {
              this.message = "".concat(msgOrInner.name, " ").concat(msgOrInner.message);
              this.inner = msgOrInner;
            }
          }
          derive(DexieError2).from(BaseException);
          obj[name] = DexieError2;
          return obj;
        }, {});
        exceptions.Syntax = SyntaxError;
        exceptions.Type = TypeError;
        exceptions.Range = RangeError;
        var exceptionMap = idbDomErrorNames.reduce(function(obj, name) {
          obj[name + "Error"] = exceptions[name];
          return obj;
        }, {});
        function mapError(domError, message) {
          if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
            return domError;
          var rv = new exceptionMap[domError.name](message || domError.message, domError);
          if ("stack" in domError) {
            setProp(rv, "stack", { get: function() {
              return this.inner.stack;
            } });
          }
          return rv;
        }
        var fullNameExceptions = errorList.reduce(function(obj, name) {
          if (["Syntax", "Type", "Range"].indexOf(name) === -1)
            obj[name + "Error"] = exceptions[name];
          return obj;
        }, {});
        fullNameExceptions.ModifyError = ModifyError;
        fullNameExceptions.DexieError = DexieError;
        fullNameExceptions.BulkError = BulkError;
        function nop() {
        }
        function mirror(val) {
          return val;
        }
        function pureFunctionChain(f1, f2) {
          if (f1 == null || f1 === mirror)
            return f2;
          return function(val) {
            return f2(f1(val));
          };
        }
        function callBoth(on1, on2) {
          return function() {
            on1.apply(this, arguments);
            on2.apply(this, arguments);
          };
        }
        function hookCreatingChain(f1, f2) {
          if (f1 === nop)
            return f2;
          return function() {
            var res = f1.apply(this, arguments);
            if (res !== void 0)
              arguments[0] = res;
            var onsuccess = this.onsuccess, onerror = this.onerror;
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess)
              this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
              this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res2 !== void 0 ? res2 : res;
          };
        }
        function hookDeletingChain(f1, f2) {
          if (f1 === nop)
            return f2;
          return function() {
            f1.apply(this, arguments);
            var onsuccess = this.onsuccess, onerror = this.onerror;
            this.onsuccess = this.onerror = null;
            f2.apply(this, arguments);
            if (onsuccess)
              this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
              this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
          };
        }
        function hookUpdatingChain(f1, f2) {
          if (f1 === nop)
            return f2;
          return function(modifications) {
            var res = f1.apply(this, arguments);
            extend(modifications, res);
            var onsuccess = this.onsuccess, onerror = this.onerror;
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess)
              this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
              this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res === void 0 ? res2 === void 0 ? void 0 : res2 : extend(res, res2);
          };
        }
        function reverseStoppableEventChain(f1, f2) {
          if (f1 === nop)
            return f2;
          return function() {
            if (f2.apply(this, arguments) === false)
              return false;
            return f1.apply(this, arguments);
          };
        }
        function promisableChain(f1, f2) {
          if (f1 === nop)
            return f2;
          return function() {
            var res = f1.apply(this, arguments);
            if (res && typeof res.then === "function") {
              var thiz = this, i = arguments.length, args = new Array(i);
              while (i--)
                args[i] = arguments[i];
              return res.then(function() {
                return f2.apply(thiz, args);
              });
            }
            return f2.apply(this, arguments);
          };
        }
        var debug = typeof location !== "undefined" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
        function setDebug(value, filter) {
          debug = value;
        }
        var INTERNAL = {};
        var ZONE_ECHO_LIMIT = 100, _a$1 = typeof Promise === "undefined" ? [] : (function() {
          var globalP = Promise.resolve();
          if (typeof crypto === "undefined" || !crypto.subtle)
            return [globalP, getProto(globalP), globalP];
          var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
          return [
            nativeP,
            getProto(nativeP),
            globalP
          ];
        })(), resolvedNativePromise = _a$1[0], nativePromiseProto = _a$1[1], resolvedGlobalPromise = _a$1[2], nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
        var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
        var patchGlobalPromise = !!resolvedGlobalPromise;
        function schedulePhysicalTick() {
          queueMicrotask(physicalTick);
        }
        var asap = function(callback, args) {
          microtickQueue.push([callback, args]);
          if (needsNewPhysicalTick) {
            schedulePhysicalTick();
            needsNewPhysicalTick = false;
          }
        };
        var isOutsideMicroTick = true, needsNewPhysicalTick = true, unhandledErrors = [], rejectingErrors = [], rejectionMapper = mirror;
        var globalPSD = {
          id: "global",
          global: true,
          ref: 0,
          unhandleds: [],
          onunhandled: nop,
          pgp: false,
          env: {},
          finalize: nop
        };
        var PSD = globalPSD;
        var microtickQueue = [];
        var numScheduledCalls = 0;
        var tickFinalizers = [];
        function DexiePromise(fn) {
          if (typeof this !== "object")
            throw new TypeError("Promises must be constructed via new");
          this._listeners = [];
          this._lib = false;
          var psd = this._PSD = PSD;
          if (typeof fn !== "function") {
            if (fn !== INTERNAL)
              throw new TypeError("Not a function");
            this._state = arguments[1];
            this._value = arguments[2];
            if (this._state === false)
              handleRejection(this, this._value);
            return;
          }
          this._state = null;
          this._value = null;
          ++psd.ref;
          executePromiseTask(this, fn);
        }
        var thenProp = {
          get: function() {
            var psd = PSD, microTaskId = totalEchoes;
            function then(onFulfilled, onRejected) {
              var _this = this;
              var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
              var cleanup = possibleAwait && !decrementExpectedAwaits();
              var rv = new DexiePromise(function(resolve, reject) {
                propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
              });
              if (this._consoleTask)
                rv._consoleTask = this._consoleTask;
              return rv;
            }
            then.prototype = INTERNAL;
            return then;
          },
          set: function(value) {
            setProp(this, "then", value && value.prototype === INTERNAL ? thenProp : {
              get: function() {
                return value;
              },
              set: thenProp.set
            });
          }
        };
        props(DexiePromise.prototype, {
          then: thenProp,
          _then: function(onFulfilled, onRejected) {
            propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
          },
          catch: function(onRejected) {
            if (arguments.length === 1)
              return this.then(null, onRejected);
            var type2 = arguments[0], handler = arguments[1];
            return typeof type2 === "function" ? this.then(null, function(err) {
              return err instanceof type2 ? handler(err) : PromiseReject(err);
            }) : this.then(null, function(err) {
              return err && err.name === type2 ? handler(err) : PromiseReject(err);
            });
          },
          finally: function(onFinally) {
            return this.then(function(value) {
              return DexiePromise.resolve(onFinally()).then(function() {
                return value;
              });
            }, function(err) {
              return DexiePromise.resolve(onFinally()).then(function() {
                return PromiseReject(err);
              });
            });
          },
          timeout: function(ms, msg) {
            var _this = this;
            return ms < Infinity ? new DexiePromise(function(resolve, reject) {
              var handle = setTimeout(function() {
                return reject(new exceptions.Timeout(msg));
              }, ms);
              _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
            }) : this;
          }
        });
        if (typeof Symbol !== "undefined" && Symbol.toStringTag)
          setProp(DexiePromise.prototype, Symbol.toStringTag, "Dexie.Promise");
        globalPSD.env = snapShot();
        function Listener(onFulfilled, onRejected, resolve, reject, zone) {
          this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
          this.onRejected = typeof onRejected === "function" ? onRejected : null;
          this.resolve = resolve;
          this.reject = reject;
          this.psd = zone;
        }
        props(DexiePromise, {
          all: function() {
            var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function(resolve, reject) {
              if (values.length === 0)
                resolve([]);
              var remaining = values.length;
              values.forEach(function(a, i) {
                return DexiePromise.resolve(a).then(function(x) {
                  values[i] = x;
                  if (!--remaining)
                    resolve(values);
                }, reject);
              });
            });
          },
          resolve: function(value) {
            if (value instanceof DexiePromise)
              return value;
            if (value && typeof value.then === "function")
              return new DexiePromise(function(resolve, reject) {
                value.then(resolve, reject);
              });
            var rv = new DexiePromise(INTERNAL, true, value);
            return rv;
          },
          reject: PromiseReject,
          race: function() {
            var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function(resolve, reject) {
              values.map(function(value) {
                return DexiePromise.resolve(value).then(resolve, reject);
              });
            });
          },
          PSD: {
            get: function() {
              return PSD;
            },
            set: function(value) {
              return PSD = value;
            }
          },
          totalEchoes: { get: function() {
            return totalEchoes;
          } },
          newPSD: newScope,
          usePSD,
          scheduler: {
            get: function() {
              return asap;
            },
            set: function(value) {
              asap = value;
            }
          },
          rejectionMapper: {
            get: function() {
              return rejectionMapper;
            },
            set: function(value) {
              rejectionMapper = value;
            }
          },
          follow: function(fn, zoneProps) {
            return new DexiePromise(function(resolve, reject) {
              return newScope(function(resolve2, reject2) {
                var psd = PSD;
                psd.unhandleds = [];
                psd.onunhandled = reject2;
                psd.finalize = callBoth(function() {
                  var _this = this;
                  run_at_end_of_this_or_next_physical_tick(function() {
                    _this.unhandleds.length === 0 ? resolve2() : reject2(_this.unhandleds[0]);
                  });
                }, psd.finalize);
                fn();
              }, zoneProps, resolve, reject);
            });
          }
        });
        if (NativePromise) {
          if (NativePromise.allSettled)
            setProp(DexiePromise, "allSettled", function() {
              var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
              return new DexiePromise(function(resolve) {
                if (possiblePromises.length === 0)
                  resolve([]);
                var remaining = possiblePromises.length;
                var results = new Array(remaining);
                possiblePromises.forEach(function(p, i) {
                  return DexiePromise.resolve(p).then(function(value) {
                    return results[i] = { status: "fulfilled", value };
                  }, function(reason) {
                    return results[i] = { status: "rejected", reason };
                  }).then(function() {
                    return --remaining || resolve(results);
                  });
                });
              });
            });
          if (NativePromise.any && typeof AggregateError !== "undefined")
            setProp(DexiePromise, "any", function() {
              var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
              return new DexiePromise(function(resolve, reject) {
                if (possiblePromises.length === 0)
                  reject(new AggregateError([]));
                var remaining = possiblePromises.length;
                var failures = new Array(remaining);
                possiblePromises.forEach(function(p, i) {
                  return DexiePromise.resolve(p).then(function(value) {
                    return resolve(value);
                  }, function(failure) {
                    failures[i] = failure;
                    if (!--remaining)
                      reject(new AggregateError(failures));
                  });
                });
              });
            });
          if (NativePromise.withResolvers)
            DexiePromise.withResolvers = NativePromise.withResolvers;
        }
        function executePromiseTask(promise, fn) {
          try {
            fn(function(value) {
              if (promise._state !== null)
                return;
              if (value === promise)
                throw new TypeError("A promise cannot be resolved with itself.");
              var shouldExecuteTick = promise._lib && beginMicroTickScope();
              if (value && typeof value.then === "function") {
                executePromiseTask(promise, function(resolve, reject) {
                  value instanceof DexiePromise ? value._then(resolve, reject) : value.then(resolve, reject);
                });
              } else {
                promise._state = true;
                promise._value = value;
                propagateAllListeners(promise);
              }
              if (shouldExecuteTick)
                endMicroTickScope();
            }, handleRejection.bind(null, promise));
          } catch (ex) {
            handleRejection(promise, ex);
          }
        }
        function handleRejection(promise, reason) {
          rejectingErrors.push(reason);
          if (promise._state !== null)
            return;
          var shouldExecuteTick = promise._lib && beginMicroTickScope();
          reason = rejectionMapper(reason);
          promise._state = false;
          promise._value = reason;
          addPossiblyUnhandledError(promise);
          propagateAllListeners(promise);
          if (shouldExecuteTick)
            endMicroTickScope();
        }
        function propagateAllListeners(promise) {
          var listeners = promise._listeners;
          promise._listeners = [];
          for (var i = 0, len = listeners.length; i < len; ++i) {
            propagateToListener(promise, listeners[i]);
          }
          var psd = promise._PSD;
          --psd.ref || psd.finalize();
          if (numScheduledCalls === 0) {
            ++numScheduledCalls;
            asap(function() {
              if (--numScheduledCalls === 0)
                finalizePhysicalTick();
            }, []);
          }
        }
        function propagateToListener(promise, listener) {
          if (promise._state === null) {
            promise._listeners.push(listener);
            return;
          }
          var cb = promise._state ? listener.onFulfilled : listener.onRejected;
          if (cb === null) {
            return (promise._state ? listener.resolve : listener.reject)(promise._value);
          }
          ++listener.psd.ref;
          ++numScheduledCalls;
          asap(callListener, [cb, promise, listener]);
        }
        function callListener(cb, promise, listener) {
          try {
            var ret, value = promise._value;
            if (!promise._state && rejectingErrors.length)
              rejectingErrors = [];
            ret = debug && promise._consoleTask ? promise._consoleTask.run(function() {
              return cb(value);
            }) : cb(value);
            if (!promise._state && rejectingErrors.indexOf(value) === -1) {
              markErrorAsHandled(promise);
            }
            listener.resolve(ret);
          } catch (e) {
            listener.reject(e);
          } finally {
            if (--numScheduledCalls === 0)
              finalizePhysicalTick();
            --listener.psd.ref || listener.psd.finalize();
          }
        }
        function physicalTick() {
          usePSD(globalPSD, function() {
            beginMicroTickScope() && endMicroTickScope();
          });
        }
        function beginMicroTickScope() {
          var wasRootExec = isOutsideMicroTick;
          isOutsideMicroTick = false;
          needsNewPhysicalTick = false;
          return wasRootExec;
        }
        function endMicroTickScope() {
          var callbacks, i, l;
          do {
            while (microtickQueue.length > 0) {
              callbacks = microtickQueue;
              microtickQueue = [];
              l = callbacks.length;
              for (i = 0; i < l; ++i) {
                var item = callbacks[i];
                item[0].apply(null, item[1]);
              }
            }
          } while (microtickQueue.length > 0);
          isOutsideMicroTick = true;
          needsNewPhysicalTick = true;
        }
        function finalizePhysicalTick() {
          var unhandledErrs = unhandledErrors;
          unhandledErrors = [];
          unhandledErrs.forEach(function(p) {
            p._PSD.onunhandled.call(null, p._value, p);
          });
          var finalizers = tickFinalizers.slice(0);
          var i = finalizers.length;
          while (i)
            finalizers[--i]();
        }
        function run_at_end_of_this_or_next_physical_tick(fn) {
          function finalizer() {
            fn();
            tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
          }
          tickFinalizers.push(finalizer);
          ++numScheduledCalls;
          asap(function() {
            if (--numScheduledCalls === 0)
              finalizePhysicalTick();
          }, []);
        }
        function addPossiblyUnhandledError(promise) {
          if (!unhandledErrors.some(function(p) {
            return p._value === promise._value;
          }))
            unhandledErrors.push(promise);
        }
        function markErrorAsHandled(promise) {
          var i = unhandledErrors.length;
          while (i)
            if (unhandledErrors[--i]._value === promise._value) {
              unhandledErrors.splice(i, 1);
              return;
            }
        }
        function PromiseReject(reason) {
          return new DexiePromise(INTERNAL, false, reason);
        }
        function wrap4(fn, errorCatcher) {
          var psd = PSD;
          return function() {
            var wasRootExec = beginMicroTickScope(), outerScope = PSD;
            try {
              switchToZone(psd, true);
              return fn.apply(this, arguments);
            } catch (e) {
              errorCatcher && errorCatcher(e);
            } finally {
              switchToZone(outerScope, false);
              if (wasRootExec)
                endMicroTickScope();
            }
          };
        }
        var task = { awaits: 0, echoes: 0, id: 0 };
        var taskCounter = 0;
        var zoneStack = [];
        var zoneEchoes = 0;
        var totalEchoes = 0;
        var zone_id_counter = 0;
        function newScope(fn, props2, a1, a2) {
          var parent = PSD, psd = Object.create(parent);
          psd.parent = parent;
          psd.ref = 0;
          psd.global = false;
          psd.id = ++zone_id_counter;
          globalPSD.env;
          psd.env = patchGlobalPromise ? {
            Promise: DexiePromise,
            PromiseProp: { value: DexiePromise, configurable: true, writable: true },
            all: DexiePromise.all,
            race: DexiePromise.race,
            allSettled: DexiePromise.allSettled,
            any: DexiePromise.any,
            resolve: DexiePromise.resolve,
            reject: DexiePromise.reject
          } : {};
          if (props2)
            extend(psd, props2);
          ++parent.ref;
          psd.finalize = function() {
            --this.parent.ref || this.parent.finalize();
          };
          var rv = usePSD(psd, fn, a1, a2);
          if (psd.ref === 0)
            psd.finalize();
          return rv;
        }
        function incrementExpectedAwaits() {
          if (!task.id)
            task.id = ++taskCounter;
          ++task.awaits;
          task.echoes += ZONE_ECHO_LIMIT;
          return task.id;
        }
        function decrementExpectedAwaits() {
          if (!task.awaits)
            return false;
          if (--task.awaits === 0)
            task.id = 0;
          task.echoes = task.awaits * ZONE_ECHO_LIMIT;
          return true;
        }
        if (("" + nativePromiseThen).indexOf("[native code]") === -1) {
          incrementExpectedAwaits = decrementExpectedAwaits = nop;
        }
        function onPossibleParallellAsync(possiblePromise) {
          if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
            incrementExpectedAwaits();
            return possiblePromise.then(function(x) {
              decrementExpectedAwaits();
              return x;
            }, function(e) {
              decrementExpectedAwaits();
              return rejection(e);
            });
          }
          return possiblePromise;
        }
        function zoneEnterEcho(targetZone) {
          ++totalEchoes;
          if (!task.echoes || --task.echoes === 0) {
            task.echoes = task.awaits = task.id = 0;
          }
          zoneStack.push(PSD);
          switchToZone(targetZone, true);
        }
        function zoneLeaveEcho() {
          var zone = zoneStack[zoneStack.length - 1];
          zoneStack.pop();
          switchToZone(zone, false);
        }
        function switchToZone(targetZone, bEnteringZone) {
          var currentZone = PSD;
          if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
            queueMicrotask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
          }
          if (targetZone === PSD)
            return;
          PSD = targetZone;
          if (currentZone === globalPSD)
            globalPSD.env = snapShot();
          if (patchGlobalPromise) {
            var GlobalPromise = globalPSD.env.Promise;
            var targetEnv = targetZone.env;
            if (currentZone.global || targetZone.global) {
              Object.defineProperty(_global, "Promise", targetEnv.PromiseProp);
              GlobalPromise.all = targetEnv.all;
              GlobalPromise.race = targetEnv.race;
              GlobalPromise.resolve = targetEnv.resolve;
              GlobalPromise.reject = targetEnv.reject;
              if (targetEnv.allSettled)
                GlobalPromise.allSettled = targetEnv.allSettled;
              if (targetEnv.any)
                GlobalPromise.any = targetEnv.any;
            }
          }
        }
        function snapShot() {
          var GlobalPromise = _global.Promise;
          return patchGlobalPromise ? {
            Promise: GlobalPromise,
            PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
            all: GlobalPromise.all,
            race: GlobalPromise.race,
            allSettled: GlobalPromise.allSettled,
            any: GlobalPromise.any,
            resolve: GlobalPromise.resolve,
            reject: GlobalPromise.reject
          } : {};
        }
        function usePSD(psd, fn, a1, a2, a3) {
          var outerScope = PSD;
          try {
            switchToZone(psd, true);
            return fn(a1, a2, a3);
          } finally {
            switchToZone(outerScope, false);
          }
        }
        function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
          return typeof fn !== "function" ? fn : function() {
            var outerZone = PSD;
            if (possibleAwait)
              incrementExpectedAwaits();
            switchToZone(zone, true);
            try {
              return fn.apply(this, arguments);
            } finally {
              switchToZone(outerZone, false);
              if (cleanup)
                queueMicrotask(decrementExpectedAwaits);
            }
          };
        }
        function execInGlobalContext(cb) {
          if (Promise === NativePromise && task.echoes === 0) {
            if (zoneEchoes === 0) {
              cb();
            } else {
              enqueueNativeMicroTask(cb);
            }
          } else {
            setTimeout(cb, 0);
          }
        }
        var rejection = DexiePromise.reject;
        function tempTransaction(db2, mode, storeNames, fn) {
          if (!db2.idbdb || !db2._state.openComplete && (!PSD.letThrough && !db2._vip)) {
            if (db2._state.openComplete) {
              return rejection(new exceptions.DatabaseClosed(db2._state.dbOpenError));
            }
            if (!db2._state.isBeingOpened) {
              if (!db2._state.autoOpen)
                return rejection(new exceptions.DatabaseClosed());
              db2.open().catch(nop);
            }
            return db2._state.dbReadyPromise.then(function() {
              return tempTransaction(db2, mode, storeNames, fn);
            });
          } else {
            var trans = db2._createTransaction(mode, storeNames, db2._dbSchema);
            try {
              trans.create();
              db2._state.PR1398_maxLoop = 3;
            } catch (ex) {
              if (ex.name === errnames.InvalidState && db2.isOpen() && --db2._state.PR1398_maxLoop > 0) {
                console.warn("Dexie: Need to reopen db");
                db2.close({ disableAutoOpen: false });
                return db2.open().then(function() {
                  return tempTransaction(db2, mode, storeNames, fn);
                });
              }
              return rejection(ex);
            }
            return trans._promise(mode, function(resolve, reject) {
              return newScope(function() {
                PSD.trans = trans;
                return fn(resolve, reject, trans);
              });
            }).then(function(result2) {
              if (mode === "readwrite")
                try {
                  trans.idbtrans.commit();
                } catch (_a3) {
                }
              return mode === "readonly" ? result2 : trans._completion.then(function() {
                return result2;
              });
            });
          }
        }
        var DEXIE_VERSION = "4.0.11";
        var maxString = String.fromCharCode(65535);
        var minKey = -Infinity;
        var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
        var STRING_EXPECTED = "String expected.";
        var connections = [];
        var DBNAMES_DB = "__dbnames";
        var READONLY = "readonly";
        var READWRITE = "readwrite";
        function combine(filter1, filter2) {
          return filter1 ? filter2 ? function() {
            return filter1.apply(this, arguments) && filter2.apply(this, arguments);
          } : filter1 : filter2;
        }
        var AnyRange = {
          type: 3,
          lower: -Infinity,
          lowerOpen: false,
          upper: [[]],
          upperOpen: false
        };
        function workaroundForUndefinedPrimKey(keyPath) {
          return typeof keyPath === "string" && !/\./.test(keyPath) ? function(obj) {
            if (obj[keyPath] === void 0 && keyPath in obj) {
              obj = deepClone(obj);
              delete obj[keyPath];
            }
            return obj;
          } : function(obj) {
            return obj;
          };
        }
        function Entity2() {
          throw exceptions.Type();
        }
        function cmp2(a, b) {
          try {
            var ta = type(a);
            var tb = type(b);
            if (ta !== tb) {
              if (ta === "Array")
                return 1;
              if (tb === "Array")
                return -1;
              if (ta === "binary")
                return 1;
              if (tb === "binary")
                return -1;
              if (ta === "string")
                return 1;
              if (tb === "string")
                return -1;
              if (ta === "Date")
                return 1;
              if (tb !== "Date")
                return NaN;
              return -1;
            }
            switch (ta) {
              case "number":
              case "Date":
              case "string":
                return a > b ? 1 : a < b ? -1 : 0;
              case "binary": {
                return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
              }
              case "Array":
                return compareArrays(a, b);
            }
          } catch (_a3) {
          }
          return NaN;
        }
        function compareArrays(a, b) {
          var al = a.length;
          var bl = b.length;
          var l = al < bl ? al : bl;
          for (var i = 0; i < l; ++i) {
            var res = cmp2(a[i], b[i]);
            if (res !== 0)
              return res;
          }
          return al === bl ? 0 : al < bl ? -1 : 1;
        }
        function compareUint8Arrays(a, b) {
          var al = a.length;
          var bl = b.length;
          var l = al < bl ? al : bl;
          for (var i = 0; i < l; ++i) {
            if (a[i] !== b[i])
              return a[i] < b[i] ? -1 : 1;
          }
          return al === bl ? 0 : al < bl ? -1 : 1;
        }
        function type(x) {
          var t = typeof x;
          if (t !== "object")
            return t;
          if (ArrayBuffer.isView(x))
            return "binary";
          var tsTag = toStringTag(x);
          return tsTag === "ArrayBuffer" ? "binary" : tsTag;
        }
        function getUint8Array(a) {
          if (a instanceof Uint8Array)
            return a;
          if (ArrayBuffer.isView(a))
            return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
          return new Uint8Array(a);
        }
        var Table = (function() {
          function Table2() {
          }
          Table2.prototype._trans = function(mode, fn, writeLocked) {
            var trans = this._tx || PSD.trans;
            var tableName = this.name;
            var task2 = debug && typeof console !== "undefined" && console.createTask && console.createTask("Dexie: ".concat(mode === "readonly" ? "read" : "write", " ").concat(this.name));
            function checkTableInTransaction(resolve, reject, trans2) {
              if (!trans2.schema[tableName])
                throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
              return fn(trans2.idbtrans, trans2);
            }
            var wasRootExec = beginMicroTickScope();
            try {
              var p = trans && trans.db._novip === this.db._novip ? trans === PSD.trans ? trans._promise(mode, checkTableInTransaction, writeLocked) : newScope(function() {
                return trans._promise(mode, checkTableInTransaction, writeLocked);
              }, { trans, transless: PSD.transless || PSD }) : tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
              if (task2) {
                p._consoleTask = task2;
                p = p.catch(function(err) {
                  console.trace(err);
                  return rejection(err);
                });
              }
              return p;
            } finally {
              if (wasRootExec)
                endMicroTickScope();
            }
          };
          Table2.prototype.get = function(keyOrCrit, cb) {
            var _this = this;
            if (keyOrCrit && keyOrCrit.constructor === Object)
              return this.where(keyOrCrit).first(cb);
            if (keyOrCrit == null)
              return rejection(new exceptions.Type("Invalid argument to Table.get()"));
            return this._trans("readonly", function(trans) {
              return _this.core.get({ trans, key: keyOrCrit }).then(function(res) {
                return _this.hook.reading.fire(res);
              });
            }).then(cb);
          };
          Table2.prototype.where = function(indexOrCrit) {
            if (typeof indexOrCrit === "string")
              return new this.db.WhereClause(this, indexOrCrit);
            if (isArray2(indexOrCrit))
              return new this.db.WhereClause(this, "[".concat(indexOrCrit.join("+"), "]"));
            var keyPaths = keys(indexOrCrit);
            if (keyPaths.length === 1)
              return this.where(keyPaths[0]).equals(indexOrCrit[keyPaths[0]]);
            var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function(ix) {
              if (ix.compound && keyPaths.every(function(keyPath) {
                return ix.keyPath.indexOf(keyPath) >= 0;
              })) {
                for (var i = 0; i < keyPaths.length; ++i) {
                  if (keyPaths.indexOf(ix.keyPath[i]) === -1)
                    return false;
                }
                return true;
              }
              return false;
            }).sort(function(a, b) {
              return a.keyPath.length - b.keyPath.length;
            })[0];
            if (compoundIndex && this.db._maxKey !== maxString) {
              var keyPathsInValidOrder = compoundIndex.keyPath.slice(0, keyPaths.length);
              return this.where(keyPathsInValidOrder).equals(keyPathsInValidOrder.map(function(kp) {
                return indexOrCrit[kp];
              }));
            }
            if (!compoundIndex && debug)
              console.warn("The query ".concat(JSON.stringify(indexOrCrit), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(keyPaths.join("+"), "]"));
            var idxByName = this.schema.idxByName;
            function equals(a, b) {
              return cmp2(a, b) === 0;
            }
            var _a3 = keyPaths.reduce(function(_a4, keyPath) {
              var prevIndex = _a4[0], prevFilterFn = _a4[1];
              var index = idxByName[keyPath];
              var value = indexOrCrit[keyPath];
              return [
                prevIndex || index,
                prevIndex || !index ? combine(prevFilterFn, index && index.multi ? function(x) {
                  var prop = getByKeyPath(x, keyPath);
                  return isArray2(prop) && prop.some(function(item) {
                    return equals(value, item);
                  });
                } : function(x) {
                  return equals(value, getByKeyPath(x, keyPath));
                }) : prevFilterFn
              ];
            }, [null, null]), idx = _a3[0], filterFunction = _a3[1];
            return idx ? this.where(idx.name).equals(indexOrCrit[idx.keyPath]).filter(filterFunction) : compoundIndex ? this.filter(filterFunction) : this.where(keyPaths).equals("");
          };
          Table2.prototype.filter = function(filterFunction) {
            return this.toCollection().and(filterFunction);
          };
          Table2.prototype.count = function(thenShortcut) {
            return this.toCollection().count(thenShortcut);
          };
          Table2.prototype.offset = function(offset) {
            return this.toCollection().offset(offset);
          };
          Table2.prototype.limit = function(numRows) {
            return this.toCollection().limit(numRows);
          };
          Table2.prototype.each = function(callback) {
            return this.toCollection().each(callback);
          };
          Table2.prototype.toArray = function(thenShortcut) {
            return this.toCollection().toArray(thenShortcut);
          };
          Table2.prototype.toCollection = function() {
            return new this.db.Collection(new this.db.WhereClause(this));
          };
          Table2.prototype.orderBy = function(index) {
            return new this.db.Collection(new this.db.WhereClause(this, isArray2(index) ? "[".concat(index.join("+"), "]") : index));
          };
          Table2.prototype.reverse = function() {
            return this.toCollection().reverse();
          };
          Table2.prototype.mapToClass = function(constructor) {
            var _a3 = this, db2 = _a3.db, tableName = _a3.name;
            this.schema.mappedClass = constructor;
            if (constructor.prototype instanceof Entity2) {
              constructor = (function(_super) {
                __extends2(class_1, _super);
                function class_1() {
                  return _super !== null && _super.apply(this, arguments) || this;
                }
                Object.defineProperty(class_1.prototype, "db", {
                  get: function() {
                    return db2;
                  },
                  enumerable: false,
                  configurable: true
                });
                class_1.prototype.table = function() {
                  return tableName;
                };
                return class_1;
              })(constructor);
            }
            var inheritedProps = /* @__PURE__ */ new Set();
            for (var proto = constructor.prototype; proto; proto = getProto(proto)) {
              Object.getOwnPropertyNames(proto).forEach(function(propName) {
                return inheritedProps.add(propName);
              });
            }
            var readHook = function(obj) {
              if (!obj)
                return obj;
              var res = Object.create(constructor.prototype);
              for (var m in obj)
                if (!inheritedProps.has(m))
                  try {
                    res[m] = obj[m];
                  } catch (_) {
                  }
              return res;
            };
            if (this.schema.readHook) {
              this.hook.reading.unsubscribe(this.schema.readHook);
            }
            this.schema.readHook = readHook;
            this.hook("reading", readHook);
            return constructor;
          };
          Table2.prototype.defineClass = function() {
            function Class(content) {
              extend(this, content);
            }
            return this.mapToClass(Class);
          };
          Table2.prototype.add = function(obj, key) {
            var _this = this;
            var _a3 = this.schema.primKey, auto = _a3.auto, keyPath = _a3.keyPath;
            var objToAdd = obj;
            if (keyPath && auto) {
              objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
            }
            return this._trans("readwrite", function(trans) {
              return _this.core.mutate({ trans, type: "add", keys: key != null ? [key] : null, values: [objToAdd] });
            }).then(function(res) {
              return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
            }).then(function(lastResult) {
              if (keyPath) {
                try {
                  setByKeyPath(obj, keyPath, lastResult);
                } catch (_) {
                }
              }
              return lastResult;
            });
          };
          Table2.prototype.update = function(keyOrObject, modifications) {
            if (typeof keyOrObject === "object" && !isArray2(keyOrObject)) {
              var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
              if (key === void 0)
                return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
              return this.where(":id").equals(key).modify(modifications);
            } else {
              return this.where(":id").equals(keyOrObject).modify(modifications);
            }
          };
          Table2.prototype.put = function(obj, key) {
            var _this = this;
            var _a3 = this.schema.primKey, auto = _a3.auto, keyPath = _a3.keyPath;
            var objToAdd = obj;
            if (keyPath && auto) {
              objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
            }
            return this._trans("readwrite", function(trans) {
              return _this.core.mutate({ trans, type: "put", values: [objToAdd], keys: key != null ? [key] : null });
            }).then(function(res) {
              return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
            }).then(function(lastResult) {
              if (keyPath) {
                try {
                  setByKeyPath(obj, keyPath, lastResult);
                } catch (_) {
                }
              }
              return lastResult;
            });
          };
          Table2.prototype.delete = function(key) {
            var _this = this;
            return this._trans("readwrite", function(trans) {
              return _this.core.mutate({ trans, type: "delete", keys: [key] });
            }).then(function(res) {
              return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
            });
          };
          Table2.prototype.clear = function() {
            var _this = this;
            return this._trans("readwrite", function(trans) {
              return _this.core.mutate({ trans, type: "deleteRange", range: AnyRange });
            }).then(function(res) {
              return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
            });
          };
          Table2.prototype.bulkGet = function(keys2) {
            var _this = this;
            return this._trans("readonly", function(trans) {
              return _this.core.getMany({
                keys: keys2,
                trans
              }).then(function(result2) {
                return result2.map(function(res) {
                  return _this.hook.reading.fire(res);
                });
              });
            });
          };
          Table2.prototype.bulkAdd = function(objects, keysOrOptions, options) {
            var _this = this;
            var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
            options = options || (keys2 ? void 0 : keysOrOptions);
            var wantResults = options ? options.allKeys : void 0;
            return this._trans("readwrite", function(trans) {
              var _a3 = _this.schema.primKey, auto = _a3.auto, keyPath = _a3.keyPath;
              if (keyPath && keys2)
                throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
              if (keys2 && keys2.length !== objects.length)
                throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
              var numObjects = objects.length;
              var objectsToAdd = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
              return _this.core.mutate({ trans, type: "add", keys: keys2, values: objectsToAdd, wantResults }).then(function(_a4) {
                var numFailures = _a4.numFailures, results = _a4.results, lastResult = _a4.lastResult, failures = _a4.failures;
                var result2 = wantResults ? results : lastResult;
                if (numFailures === 0)
                  return result2;
                throw new BulkError("".concat(_this.name, ".bulkAdd(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
              });
            });
          };
          Table2.prototype.bulkPut = function(objects, keysOrOptions, options) {
            var _this = this;
            var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
            options = options || (keys2 ? void 0 : keysOrOptions);
            var wantResults = options ? options.allKeys : void 0;
            return this._trans("readwrite", function(trans) {
              var _a3 = _this.schema.primKey, auto = _a3.auto, keyPath = _a3.keyPath;
              if (keyPath && keys2)
                throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
              if (keys2 && keys2.length !== objects.length)
                throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
              var numObjects = objects.length;
              var objectsToPut = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
              return _this.core.mutate({ trans, type: "put", keys: keys2, values: objectsToPut, wantResults }).then(function(_a4) {
                var numFailures = _a4.numFailures, results = _a4.results, lastResult = _a4.lastResult, failures = _a4.failures;
                var result2 = wantResults ? results : lastResult;
                if (numFailures === 0)
                  return result2;
                throw new BulkError("".concat(_this.name, ".bulkPut(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
              });
            });
          };
          Table2.prototype.bulkUpdate = function(keysAndChanges) {
            var _this = this;
            var coreTable = this.core;
            var keys2 = keysAndChanges.map(function(entry) {
              return entry.key;
            });
            var changeSpecs = keysAndChanges.map(function(entry) {
              return entry.changes;
            });
            var offsetMap = [];
            return this._trans("readwrite", function(trans) {
              return coreTable.getMany({ trans, keys: keys2, cache: "clone" }).then(function(objs) {
                var resultKeys = [];
                var resultObjs = [];
                keysAndChanges.forEach(function(_a3, idx) {
                  var key = _a3.key, changes = _a3.changes;
                  var obj = objs[idx];
                  if (obj) {
                    for (var _i = 0, _b = Object.keys(changes); _i < _b.length; _i++) {
                      var keyPath = _b[_i];
                      var value = changes[keyPath];
                      if (keyPath === _this.schema.primKey.keyPath) {
                        if (cmp2(value, key) !== 0) {
                          throw new exceptions.Constraint("Cannot update primary key in bulkUpdate()");
                        }
                      } else {
                        setByKeyPath(obj, keyPath, value);
                      }
                    }
                    offsetMap.push(idx);
                    resultKeys.push(key);
                    resultObjs.push(obj);
                  }
                });
                var numEntries = resultKeys.length;
                return coreTable.mutate({
                  trans,
                  type: "put",
                  keys: resultKeys,
                  values: resultObjs,
                  updates: {
                    keys: keys2,
                    changeSpecs
                  }
                }).then(function(_a3) {
                  var numFailures = _a3.numFailures, failures = _a3.failures;
                  if (numFailures === 0)
                    return numEntries;
                  for (var _i = 0, _b = Object.keys(failures); _i < _b.length; _i++) {
                    var offset = _b[_i];
                    var mappedOffset = offsetMap[Number(offset)];
                    if (mappedOffset != null) {
                      var failure = failures[offset];
                      delete failures[offset];
                      failures[mappedOffset] = failure;
                    }
                  }
                  throw new BulkError("".concat(_this.name, ".bulkUpdate(): ").concat(numFailures, " of ").concat(numEntries, " operations failed"), failures);
                });
              });
            });
          };
          Table2.prototype.bulkDelete = function(keys2) {
            var _this = this;
            var numKeys = keys2.length;
            return this._trans("readwrite", function(trans) {
              return _this.core.mutate({ trans, type: "delete", keys: keys2 });
            }).then(function(_a3) {
              var numFailures = _a3.numFailures, lastResult = _a3.lastResult, failures = _a3.failures;
              if (numFailures === 0)
                return lastResult;
              throw new BulkError("".concat(_this.name, ".bulkDelete(): ").concat(numFailures, " of ").concat(numKeys, " operations failed"), failures);
            });
          };
          return Table2;
        })();
        function Events(ctx) {
          var evs = {};
          var rv = function(eventName, subscriber) {
            if (subscriber) {
              var i2 = arguments.length, args = new Array(i2 - 1);
              while (--i2)
                args[i2 - 1] = arguments[i2];
              evs[eventName].subscribe.apply(null, args);
              return ctx;
            } else if (typeof eventName === "string") {
              return evs[eventName];
            }
          };
          rv.addEventType = add3;
          for (var i = 1, l = arguments.length; i < l; ++i) {
            add3(arguments[i]);
          }
          return rv;
          function add3(eventName, chainFunction, defaultFunction) {
            if (typeof eventName === "object")
              return addConfiguredEvents(eventName);
            if (!chainFunction)
              chainFunction = reverseStoppableEventChain;
            if (!defaultFunction)
              defaultFunction = nop;
            var context = {
              subscribers: [],
              fire: defaultFunction,
              subscribe: function(cb) {
                if (context.subscribers.indexOf(cb) === -1) {
                  context.subscribers.push(cb);
                  context.fire = chainFunction(context.fire, cb);
                }
              },
              unsubscribe: function(cb) {
                context.subscribers = context.subscribers.filter(function(fn) {
                  return fn !== cb;
                });
                context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
              }
            };
            evs[eventName] = rv[eventName] = context;
            return context;
          }
          function addConfiguredEvents(cfg) {
            keys(cfg).forEach(function(eventName) {
              var args = cfg[eventName];
              if (isArray2(args)) {
                add3(eventName, cfg[eventName][0], cfg[eventName][1]);
              } else if (args === "asap") {
                var context = add3(eventName, mirror, function fire() {
                  var i2 = arguments.length, args2 = new Array(i2);
                  while (i2--)
                    args2[i2] = arguments[i2];
                  context.subscribers.forEach(function(fn) {
                    asap$1(function fireEvent() {
                      fn.apply(null, args2);
                    });
                  });
                });
              } else
                throw new exceptions.InvalidArgument("Invalid event config");
            });
          }
        }
        function makeClassConstructor(prototype2, constructor) {
          derive(constructor).from({ prototype: prototype2 });
          return constructor;
        }
        function createTableConstructor(db2) {
          return makeClassConstructor(Table.prototype, function Table2(name, tableSchema, trans) {
            this.db = db2;
            this._tx = trans;
            this.name = name;
            this.schema = tableSchema;
            this.hook = db2._allTables[name] ? db2._allTables[name].hook : Events(null, {
              "creating": [hookCreatingChain, nop],
              "reading": [pureFunctionChain, mirror],
              "updating": [hookUpdatingChain, nop],
              "deleting": [hookDeletingChain, nop]
            });
          });
        }
        function isPlainKeyRange(ctx, ignoreLimitFilter) {
          return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
        }
        function addFilter(ctx, fn) {
          ctx.filter = combine(ctx.filter, fn);
        }
        function addReplayFilter(ctx, factory, isLimitFilter) {
          var curr = ctx.replayFilter;
          ctx.replayFilter = curr ? function() {
            return combine(curr(), factory());
          } : factory;
          ctx.justLimit = isLimitFilter && !curr;
        }
        function addMatchFilter(ctx, fn) {
          ctx.isMatch = combine(ctx.isMatch, fn);
        }
        function getIndexOrStore(ctx, coreSchema) {
          if (ctx.isPrimKey)
            return coreSchema.primaryKey;
          var index = coreSchema.getIndexByKeyPath(ctx.index);
          if (!index)
            throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
          return index;
        }
        function openCursor(ctx, coreTable, trans) {
          var index = getIndexOrStore(ctx, coreTable.schema);
          return coreTable.openCursor({
            trans,
            values: !ctx.keysOnly,
            reverse: ctx.dir === "prev",
            unique: !!ctx.unique,
            query: {
              index,
              range: ctx.range
            }
          });
        }
        function iter(ctx, fn, coreTrans, coreTable) {
          var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
          if (!ctx.or) {
            return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
          } else {
            var set_1 = {};
            var union = function(item, cursor, advance) {
              if (!filter || filter(cursor, advance, function(result2) {
                return cursor.stop(result2);
              }, function(err) {
                return cursor.fail(err);
              })) {
                var primaryKey = cursor.primaryKey;
                var key = "" + primaryKey;
                if (key === "[object ArrayBuffer]")
                  key = "" + new Uint8Array(primaryKey);
                if (!hasOwn2(set_1, key)) {
                  set_1[key] = true;
                  fn(item, cursor, advance);
                }
              }
            };
            return Promise.all([
              ctx.or._iterate(union, coreTrans),
              iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
            ]);
          }
        }
        function iterate(cursorPromise, filter, fn, valueMapper) {
          var mappedFn = valueMapper ? function(x, c, a) {
            return fn(valueMapper(x), c, a);
          } : fn;
          var wrappedFn = wrap4(mappedFn);
          return cursorPromise.then(function(cursor) {
            if (cursor) {
              return cursor.start(function() {
                var c = function() {
                  return cursor.continue();
                };
                if (!filter || filter(cursor, function(advancer) {
                  return c = advancer;
                }, function(val) {
                  cursor.stop(val);
                  c = nop;
                }, function(e) {
                  cursor.fail(e);
                  c = nop;
                }))
                  wrappedFn(cursor.value, cursor, function(advancer) {
                    return c = advancer;
                  });
                c();
              });
            }
          });
        }
        var PropModification2 = (function() {
          function PropModification3(spec) {
            this["@@propmod"] = spec;
          }
          PropModification3.prototype.execute = function(value) {
            var _a3;
            var spec = this["@@propmod"];
            if (spec.add !== void 0) {
              var term = spec.add;
              if (isArray2(term)) {
                return __spreadArray2(__spreadArray2([], isArray2(value) ? value : [], true), term, true).sort();
              }
              if (typeof term === "number")
                return (Number(value) || 0) + term;
              if (typeof term === "bigint") {
                try {
                  return BigInt(value) + term;
                } catch (_b) {
                  return BigInt(0) + term;
                }
              }
              throw new TypeError("Invalid term ".concat(term));
            }
            if (spec.remove !== void 0) {
              var subtrahend_1 = spec.remove;
              if (isArray2(subtrahend_1)) {
                return isArray2(value) ? value.filter(function(item) {
                  return !subtrahend_1.includes(item);
                }).sort() : [];
              }
              if (typeof subtrahend_1 === "number")
                return Number(value) - subtrahend_1;
              if (typeof subtrahend_1 === "bigint") {
                try {
                  return BigInt(value) - subtrahend_1;
                } catch (_c) {
                  return BigInt(0) - subtrahend_1;
                }
              }
              throw new TypeError("Invalid subtrahend ".concat(subtrahend_1));
            }
            var prefixToReplace = (_a3 = spec.replacePrefix) === null || _a3 === void 0 ? void 0 : _a3[0];
            if (prefixToReplace && typeof value === "string" && value.startsWith(prefixToReplace)) {
              return spec.replacePrefix[1] + value.substring(prefixToReplace.length);
            }
            return value;
          };
          return PropModification3;
        })();
        var Collection = (function() {
          function Collection2() {
          }
          Collection2.prototype._read = function(fn, cb) {
            var ctx = this._ctx;
            return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readonly", fn).then(cb);
          };
          Collection2.prototype._write = function(fn) {
            var ctx = this._ctx;
            return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readwrite", fn, "locked");
          };
          Collection2.prototype._addAlgorithm = function(fn) {
            var ctx = this._ctx;
            ctx.algorithm = combine(ctx.algorithm, fn);
          };
          Collection2.prototype._iterate = function(fn, coreTrans) {
            return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
          };
          Collection2.prototype.clone = function(props2) {
            var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
            if (props2)
              extend(ctx, props2);
            rv._ctx = ctx;
            return rv;
          };
          Collection2.prototype.raw = function() {
            this._ctx.valueMapper = null;
            return this;
          };
          Collection2.prototype.each = function(fn) {
            var ctx = this._ctx;
            return this._read(function(trans) {
              return iter(ctx, fn, trans, ctx.table.core);
            });
          };
          Collection2.prototype.count = function(cb) {
            var _this = this;
            return this._read(function(trans) {
              var ctx = _this._ctx;
              var coreTable = ctx.table.core;
              if (isPlainKeyRange(ctx, true)) {
                return coreTable.count({
                  trans,
                  query: {
                    index: getIndexOrStore(ctx, coreTable.schema),
                    range: ctx.range
                  }
                }).then(function(count2) {
                  return Math.min(count2, ctx.limit);
                });
              } else {
                var count = 0;
                return iter(ctx, function() {
                  ++count;
                  return false;
                }, trans, coreTable).then(function() {
                  return count;
                });
              }
            }).then(cb);
          };
          Collection2.prototype.sortBy = function(keyPath, cb) {
            var parts = keyPath.split(".").reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
            function getval(obj, i) {
              if (i)
                return getval(obj[parts[i]], i - 1);
              return obj[lastPart];
            }
            var order = this._ctx.dir === "next" ? 1 : -1;
            function sorter(a, b) {
              var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
              return cmp2(aVal, bVal) * order;
            }
            return this.toArray(function(a) {
              return a.sort(sorter);
            }).then(cb);
          };
          Collection2.prototype.toArray = function(cb) {
            var _this = this;
            return this._read(function(trans) {
              var ctx = _this._ctx;
              if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                var valueMapper_1 = ctx.valueMapper;
                var index = getIndexOrStore(ctx, ctx.table.core.schema);
                return ctx.table.core.query({
                  trans,
                  limit: ctx.limit,
                  values: true,
                  query: {
                    index,
                    range: ctx.range
                  }
                }).then(function(_a3) {
                  var result2 = _a3.result;
                  return valueMapper_1 ? result2.map(valueMapper_1) : result2;
                });
              } else {
                var a_1 = [];
                return iter(ctx, function(item) {
                  return a_1.push(item);
                }, trans, ctx.table.core).then(function() {
                  return a_1;
                });
              }
            }, cb);
          };
          Collection2.prototype.offset = function(offset) {
            var ctx = this._ctx;
            if (offset <= 0)
              return this;
            ctx.offset += offset;
            if (isPlainKeyRange(ctx)) {
              addReplayFilter(ctx, function() {
                var offsetLeft = offset;
                return function(cursor, advance) {
                  if (offsetLeft === 0)
                    return true;
                  if (offsetLeft === 1) {
                    --offsetLeft;
                    return false;
                  }
                  advance(function() {
                    cursor.advance(offsetLeft);
                    offsetLeft = 0;
                  });
                  return false;
                };
              });
            } else {
              addReplayFilter(ctx, function() {
                var offsetLeft = offset;
                return function() {
                  return --offsetLeft < 0;
                };
              });
            }
            return this;
          };
          Collection2.prototype.limit = function(numRows) {
            this._ctx.limit = Math.min(this._ctx.limit, numRows);
            addReplayFilter(this._ctx, function() {
              var rowsLeft = numRows;
              return function(cursor, advance, resolve) {
                if (--rowsLeft <= 0)
                  advance(resolve);
                return rowsLeft >= 0;
              };
            }, true);
            return this;
          };
          Collection2.prototype.until = function(filterFunction, bIncludeStopEntry) {
            addFilter(this._ctx, function(cursor, advance, resolve) {
              if (filterFunction(cursor.value)) {
                advance(resolve);
                return bIncludeStopEntry;
              } else {
                return true;
              }
            });
            return this;
          };
          Collection2.prototype.first = function(cb) {
            return this.limit(1).toArray(function(a) {
              return a[0];
            }).then(cb);
          };
          Collection2.prototype.last = function(cb) {
            return this.reverse().first(cb);
          };
          Collection2.prototype.filter = function(filterFunction) {
            addFilter(this._ctx, function(cursor) {
              return filterFunction(cursor.value);
            });
            addMatchFilter(this._ctx, filterFunction);
            return this;
          };
          Collection2.prototype.and = function(filter) {
            return this.filter(filter);
          };
          Collection2.prototype.or = function(indexName) {
            return new this.db.WhereClause(this._ctx.table, indexName, this);
          };
          Collection2.prototype.reverse = function() {
            this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
            if (this._ondirectionchange)
              this._ondirectionchange(this._ctx.dir);
            return this;
          };
          Collection2.prototype.desc = function() {
            return this.reverse();
          };
          Collection2.prototype.eachKey = function(cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            return this.each(function(val, cursor) {
              cb(cursor.key, cursor);
            });
          };
          Collection2.prototype.eachUniqueKey = function(cb) {
            this._ctx.unique = "unique";
            return this.eachKey(cb);
          };
          Collection2.prototype.eachPrimaryKey = function(cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            return this.each(function(val, cursor) {
              cb(cursor.primaryKey, cursor);
            });
          };
          Collection2.prototype.keys = function(cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            var a = [];
            return this.each(function(item, cursor) {
              a.push(cursor.key);
            }).then(function() {
              return a;
            }).then(cb);
          };
          Collection2.prototype.primaryKeys = function(cb) {
            var ctx = this._ctx;
            if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
              return this._read(function(trans) {
                var index = getIndexOrStore(ctx, ctx.table.core.schema);
                return ctx.table.core.query({
                  trans,
                  values: false,
                  limit: ctx.limit,
                  query: {
                    index,
                    range: ctx.range
                  }
                });
              }).then(function(_a3) {
                var result2 = _a3.result;
                return result2;
              }).then(cb);
            }
            ctx.keysOnly = !ctx.isMatch;
            var a = [];
            return this.each(function(item, cursor) {
              a.push(cursor.primaryKey);
            }).then(function() {
              return a;
            }).then(cb);
          };
          Collection2.prototype.uniqueKeys = function(cb) {
            this._ctx.unique = "unique";
            return this.keys(cb);
          };
          Collection2.prototype.firstKey = function(cb) {
            return this.limit(1).keys(function(a) {
              return a[0];
            }).then(cb);
          };
          Collection2.prototype.lastKey = function(cb) {
            return this.reverse().firstKey(cb);
          };
          Collection2.prototype.distinct = function() {
            var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
            if (!idx || !idx.multi)
              return this;
            var set = {};
            addFilter(this._ctx, function(cursor) {
              var strKey = cursor.primaryKey.toString();
              var found = hasOwn2(set, strKey);
              set[strKey] = true;
              return !found;
            });
            return this;
          };
          Collection2.prototype.modify = function(changes) {
            var _this = this;
            var ctx = this._ctx;
            return this._write(function(trans) {
              var modifyer;
              if (typeof changes === "function") {
                modifyer = changes;
              } else {
                var keyPaths = keys(changes);
                var numKeys = keyPaths.length;
                modifyer = function(item) {
                  var anythingModified = false;
                  for (var i = 0; i < numKeys; ++i) {
                    var keyPath = keyPaths[i];
                    var val = changes[keyPath];
                    var origVal = getByKeyPath(item, keyPath);
                    if (val instanceof PropModification2) {
                      setByKeyPath(item, keyPath, val.execute(origVal));
                      anythingModified = true;
                    } else if (origVal !== val) {
                      setByKeyPath(item, keyPath, val);
                      anythingModified = true;
                    }
                  }
                  return anythingModified;
                };
              }
              var coreTable = ctx.table.core;
              var _a3 = coreTable.schema.primaryKey, outbound = _a3.outbound, extractKey2 = _a3.extractKey;
              var limit = 200;
              var modifyChunkSize = _this.db._options.modifyChunkSize;
              if (modifyChunkSize) {
                if (typeof modifyChunkSize == "object") {
                  limit = modifyChunkSize[coreTable.name] || modifyChunkSize["*"] || 200;
                } else {
                  limit = modifyChunkSize;
                }
              }
              var totalFailures = [];
              var successCount = 0;
              var failedKeys = [];
              var applyMutateResult = function(expectedCount, res) {
                var failures = res.failures, numFailures = res.numFailures;
                successCount += expectedCount - numFailures;
                for (var _i = 0, _a4 = keys(failures); _i < _a4.length; _i++) {
                  var pos = _a4[_i];
                  totalFailures.push(failures[pos]);
                }
              };
              return _this.clone().primaryKeys().then(function(keys2) {
                var criteria = isPlainKeyRange(ctx) && ctx.limit === Infinity && (typeof changes !== "function" || changes === deleteCallback) && {
                  index: ctx.index,
                  range: ctx.range
                };
                var nextChunk = function(offset) {
                  var count = Math.min(limit, keys2.length - offset);
                  return coreTable.getMany({
                    trans,
                    keys: keys2.slice(offset, offset + count),
                    cache: "immutable"
                  }).then(function(values) {
                    var addValues = [];
                    var putValues = [];
                    var putKeys = outbound ? [] : null;
                    var deleteKeys = [];
                    for (var i = 0; i < count; ++i) {
                      var origValue = values[i];
                      var ctx_1 = {
                        value: deepClone(origValue),
                        primKey: keys2[offset + i]
                      };
                      if (modifyer.call(ctx_1, ctx_1.value, ctx_1) !== false) {
                        if (ctx_1.value == null) {
                          deleteKeys.push(keys2[offset + i]);
                        } else if (!outbound && cmp2(extractKey2(origValue), extractKey2(ctx_1.value)) !== 0) {
                          deleteKeys.push(keys2[offset + i]);
                          addValues.push(ctx_1.value);
                        } else {
                          putValues.push(ctx_1.value);
                          if (outbound)
                            putKeys.push(keys2[offset + i]);
                        }
                      }
                    }
                    return Promise.resolve(addValues.length > 0 && coreTable.mutate({ trans, type: "add", values: addValues }).then(function(res) {
                      for (var pos in res.failures) {
                        deleteKeys.splice(parseInt(pos), 1);
                      }
                      applyMutateResult(addValues.length, res);
                    })).then(function() {
                      return (putValues.length > 0 || criteria && typeof changes === "object") && coreTable.mutate({
                        trans,
                        type: "put",
                        keys: putKeys,
                        values: putValues,
                        criteria,
                        changeSpec: typeof changes !== "function" && changes,
                        isAdditionalChunk: offset > 0
                      }).then(function(res) {
                        return applyMutateResult(putValues.length, res);
                      });
                    }).then(function() {
                      return (deleteKeys.length > 0 || criteria && changes === deleteCallback) && coreTable.mutate({
                        trans,
                        type: "delete",
                        keys: deleteKeys,
                        criteria,
                        isAdditionalChunk: offset > 0
                      }).then(function(res) {
                        return applyMutateResult(deleteKeys.length, res);
                      });
                    }).then(function() {
                      return keys2.length > offset + count && nextChunk(offset + limit);
                    });
                  });
                };
                return nextChunk(0).then(function() {
                  if (totalFailures.length > 0)
                    throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
                  return keys2.length;
                });
              });
            });
          };
          Collection2.prototype.delete = function() {
            var ctx = this._ctx, range = ctx.range;
            if (isPlainKeyRange(ctx) && (ctx.isPrimKey || range.type === 3)) {
              return this._write(function(trans) {
                var primaryKey = ctx.table.core.schema.primaryKey;
                var coreRange = range;
                return ctx.table.core.count({ trans, query: { index: primaryKey, range: coreRange } }).then(function(count) {
                  return ctx.table.core.mutate({ trans, type: "deleteRange", range: coreRange }).then(function(_a3) {
                    var failures = _a3.failures;
                    _a3.lastResult;
                    _a3.results;
                    var numFailures = _a3.numFailures;
                    if (numFailures)
                      throw new ModifyError("Could not delete some values", Object.keys(failures).map(function(pos) {
                        return failures[pos];
                      }), count - numFailures);
                    return count - numFailures;
                  });
                });
              });
            }
            return this.modify(deleteCallback);
          };
          return Collection2;
        })();
        var deleteCallback = function(value, ctx) {
          return ctx.value = null;
        };
        function createCollectionConstructor(db2) {
          return makeClassConstructor(Collection.prototype, function Collection2(whereClause, keyRangeGenerator) {
            this.db = db2;
            var keyRange = AnyRange, error = null;
            if (keyRangeGenerator)
              try {
                keyRange = keyRangeGenerator();
              } catch (ex) {
                error = ex;
              }
            var whereCtx = whereClause._ctx;
            var table = whereCtx.table;
            var readingHook = table.hook.reading.fire;
            this._ctx = {
              table,
              index: whereCtx.index,
              isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
              range: keyRange,
              keysOnly: false,
              dir: "next",
              unique: "",
              algorithm: null,
              filter: null,
              replayFilter: null,
              justLimit: true,
              isMatch: null,
              offset: 0,
              limit: Infinity,
              error,
              or: whereCtx.or,
              valueMapper: readingHook !== mirror ? readingHook : null
            };
          });
        }
        function simpleCompare(a, b) {
          return a < b ? -1 : a === b ? 0 : 1;
        }
        function simpleCompareReverse(a, b) {
          return a > b ? -1 : a === b ? 0 : 1;
        }
        function fail(collectionOrWhereClause, err, T) {
          var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause.Collection(collectionOrWhereClause) : collectionOrWhereClause;
          collection._ctx.error = T ? new T(err) : new TypeError(err);
          return collection;
        }
        function emptyCollection(whereClause) {
          return new whereClause.Collection(whereClause, function() {
            return rangeEqual("");
          }).limit(0);
        }
        function upperFactory(dir) {
          return dir === "next" ? function(s) {
            return s.toUpperCase();
          } : function(s) {
            return s.toLowerCase();
          };
        }
        function lowerFactory(dir) {
          return dir === "next" ? function(s) {
            return s.toLowerCase();
          } : function(s) {
            return s.toUpperCase();
          };
        }
        function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp3, dir) {
          var length = Math.min(key.length, lowerNeedle.length);
          var llp = -1;
          for (var i = 0; i < length; ++i) {
            var lwrKeyChar = lowerKey[i];
            if (lwrKeyChar !== lowerNeedle[i]) {
              if (cmp3(key[i], upperNeedle[i]) < 0)
                return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
              if (cmp3(key[i], lowerNeedle[i]) < 0)
                return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
              if (llp >= 0)
                return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
              return null;
            }
            if (cmp3(key[i], lwrKeyChar) < 0)
              llp = i;
          }
          if (length < lowerNeedle.length && dir === "next")
            return key + upperNeedle.substr(key.length);
          if (length < key.length && dir === "prev")
            return key.substr(0, upperNeedle.length);
          return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
        }
        function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
          var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
          if (!needles.every(function(s) {
            return typeof s === "string";
          })) {
            return fail(whereClause, STRING_EXPECTED);
          }
          function initDirection(dir) {
            upper = upperFactory(dir);
            lower = lowerFactory(dir);
            compare = dir === "next" ? simpleCompare : simpleCompareReverse;
            var needleBounds = needles.map(function(needle) {
              return { lower: lower(needle), upper: upper(needle) };
            }).sort(function(a, b) {
              return compare(a.lower, b.lower);
            });
            upperNeedles = needleBounds.map(function(nb) {
              return nb.upper;
            });
            lowerNeedles = needleBounds.map(function(nb) {
              return nb.lower;
            });
            direction = dir;
            nextKeySuffix = dir === "next" ? "" : suffix;
          }
          initDirection("next");
          var c = new whereClause.Collection(whereClause, function() {
            return createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
          });
          c._ondirectionchange = function(direction2) {
            initDirection(direction2);
          };
          var firstPossibleNeedle = 0;
          c._addAlgorithm(function(cursor, advance, resolve) {
            var key = cursor.key;
            if (typeof key !== "string")
              return false;
            var lowerKey = lower(key);
            if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
              return true;
            } else {
              var lowestPossibleCasing = null;
              for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
                var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                if (casing === null && lowestPossibleCasing === null)
                  firstPossibleNeedle = i + 1;
                else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                  lowestPossibleCasing = casing;
                }
              }
              if (lowestPossibleCasing !== null) {
                advance(function() {
                  cursor.continue(lowestPossibleCasing + nextKeySuffix);
                });
              } else {
                advance(resolve);
              }
              return false;
            }
          });
          return c;
        }
        function createRange(lower, upper, lowerOpen, upperOpen) {
          return {
            type: 2,
            lower,
            upper,
            lowerOpen,
            upperOpen
          };
        }
        function rangeEqual(value) {
          return {
            type: 1,
            lower: value,
            upper: value
          };
        }
        var WhereClause = (function() {
          function WhereClause2() {
          }
          Object.defineProperty(WhereClause2.prototype, "Collection", {
            get: function() {
              return this._ctx.table.db.Collection;
            },
            enumerable: false,
            configurable: true
          });
          WhereClause2.prototype.between = function(lower, upper, includeLower, includeUpper) {
            includeLower = includeLower !== false;
            includeUpper = includeUpper === true;
            try {
              if (this._cmp(lower, upper) > 0 || this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper))
                return emptyCollection(this);
              return new this.Collection(this, function() {
                return createRange(lower, upper, !includeLower, !includeUpper);
              });
            } catch (e) {
              return fail(this, INVALID_KEY_ARGUMENT);
            }
          };
          WhereClause2.prototype.equals = function(value) {
            if (value == null)
              return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function() {
              return rangeEqual(value);
            });
          };
          WhereClause2.prototype.above = function(value) {
            if (value == null)
              return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function() {
              return createRange(value, void 0, true);
            });
          };
          WhereClause2.prototype.aboveOrEqual = function(value) {
            if (value == null)
              return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function() {
              return createRange(value, void 0, false);
            });
          };
          WhereClause2.prototype.below = function(value) {
            if (value == null)
              return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function() {
              return createRange(void 0, value, false, true);
            });
          };
          WhereClause2.prototype.belowOrEqual = function(value) {
            if (value == null)
              return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function() {
              return createRange(void 0, value);
            });
          };
          WhereClause2.prototype.startsWith = function(str) {
            if (typeof str !== "string")
              return fail(this, STRING_EXPECTED);
            return this.between(str, str + maxString, true, true);
          };
          WhereClause2.prototype.startsWithIgnoreCase = function(str) {
            if (str === "")
              return this.startsWith(str);
            return addIgnoreCaseAlgorithm(this, function(x, a) {
              return x.indexOf(a[0]) === 0;
            }, [str], maxString);
          };
          WhereClause2.prototype.equalsIgnoreCase = function(str) {
            return addIgnoreCaseAlgorithm(this, function(x, a) {
              return x === a[0];
            }, [str], "");
          };
          WhereClause2.prototype.anyOfIgnoreCase = function() {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0)
              return emptyCollection(this);
            return addIgnoreCaseAlgorithm(this, function(x, a) {
              return a.indexOf(x) !== -1;
            }, set, "");
          };
          WhereClause2.prototype.startsWithAnyOfIgnoreCase = function() {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0)
              return emptyCollection(this);
            return addIgnoreCaseAlgorithm(this, function(x, a) {
              return a.some(function(n) {
                return x.indexOf(n) === 0;
              });
            }, set, maxString);
          };
          WhereClause2.prototype.anyOf = function() {
            var _this = this;
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            var compare = this._cmp;
            try {
              set.sort(compare);
            } catch (e) {
              return fail(this, INVALID_KEY_ARGUMENT);
            }
            if (set.length === 0)
              return emptyCollection(this);
            var c = new this.Collection(this, function() {
              return createRange(set[0], set[set.length - 1]);
            });
            c._ondirectionchange = function(direction) {
              compare = direction === "next" ? _this._ascending : _this._descending;
              set.sort(compare);
            };
            var i = 0;
            c._addAlgorithm(function(cursor, advance, resolve) {
              var key = cursor.key;
              while (compare(key, set[i]) > 0) {
                ++i;
                if (i === set.length) {
                  advance(resolve);
                  return false;
                }
              }
              if (compare(key, set[i]) === 0) {
                return true;
              } else {
                advance(function() {
                  cursor.continue(set[i]);
                });
                return false;
              }
            });
            return c;
          };
          WhereClause2.prototype.notEqual = function(value) {
            return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], { includeLowers: false, includeUppers: false });
          };
          WhereClause2.prototype.noneOf = function() {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0)
              return new this.Collection(this);
            try {
              set.sort(this._ascending);
            } catch (e) {
              return fail(this, INVALID_KEY_ARGUMENT);
            }
            var ranges = set.reduce(function(res, val) {
              return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]];
            }, null);
            ranges.push([set[set.length - 1], this.db._maxKey]);
            return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
          };
          WhereClause2.prototype.inAnyRange = function(ranges, options) {
            var _this = this;
            var cmp3 = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min, max = this._max;
            if (ranges.length === 0)
              return emptyCollection(this);
            if (!ranges.every(function(range) {
              return range[0] !== void 0 && range[1] !== void 0 && ascending(range[0], range[1]) <= 0;
            })) {
              return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
            }
            var includeLowers = !options || options.includeLowers !== false;
            var includeUppers = options && options.includeUppers === true;
            function addRange2(ranges2, newRange) {
              var i = 0, l = ranges2.length;
              for (; i < l; ++i) {
                var range = ranges2[i];
                if (cmp3(newRange[0], range[1]) < 0 && cmp3(newRange[1], range[0]) > 0) {
                  range[0] = min(range[0], newRange[0]);
                  range[1] = max(range[1], newRange[1]);
                  break;
                }
              }
              if (i === l)
                ranges2.push(newRange);
              return ranges2;
            }
            var sortDirection = ascending;
            function rangeSorter(a, b) {
              return sortDirection(a[0], b[0]);
            }
            var set;
            try {
              set = ranges.reduce(addRange2, []);
              set.sort(rangeSorter);
            } catch (ex) {
              return fail(this, INVALID_KEY_ARGUMENT);
            }
            var rangePos = 0;
            var keyIsBeyondCurrentEntry = includeUppers ? function(key) {
              return ascending(key, set[rangePos][1]) > 0;
            } : function(key) {
              return ascending(key, set[rangePos][1]) >= 0;
            };
            var keyIsBeforeCurrentEntry = includeLowers ? function(key) {
              return descending(key, set[rangePos][0]) > 0;
            } : function(key) {
              return descending(key, set[rangePos][0]) >= 0;
            };
            function keyWithinCurrentRange(key) {
              return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
            }
            var checkKey = keyIsBeyondCurrentEntry;
            var c = new this.Collection(this, function() {
              return createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
            });
            c._ondirectionchange = function(direction) {
              if (direction === "next") {
                checkKey = keyIsBeyondCurrentEntry;
                sortDirection = ascending;
              } else {
                checkKey = keyIsBeforeCurrentEntry;
                sortDirection = descending;
              }
              set.sort(rangeSorter);
            };
            c._addAlgorithm(function(cursor, advance, resolve) {
              var key = cursor.key;
              while (checkKey(key)) {
                ++rangePos;
                if (rangePos === set.length) {
                  advance(resolve);
                  return false;
                }
              }
              if (keyWithinCurrentRange(key)) {
                return true;
              } else if (_this._cmp(key, set[rangePos][1]) === 0 || _this._cmp(key, set[rangePos][0]) === 0) {
                return false;
              } else {
                advance(function() {
                  if (sortDirection === ascending)
                    cursor.continue(set[rangePos][0]);
                  else
                    cursor.continue(set[rangePos][1]);
                });
                return false;
              }
            });
            return c;
          };
          WhereClause2.prototype.startsWithAnyOf = function() {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (!set.every(function(s) {
              return typeof s === "string";
            })) {
              return fail(this, "startsWithAnyOf() only works with strings");
            }
            if (set.length === 0)
              return emptyCollection(this);
            return this.inAnyRange(set.map(function(str) {
              return [str, str + maxString];
            }));
          };
          return WhereClause2;
        })();
        function createWhereClauseConstructor(db2) {
          return makeClassConstructor(WhereClause.prototype, function WhereClause2(table, index, orCollection) {
            this.db = db2;
            this._ctx = {
              table,
              index: index === ":id" ? null : index,
              or: orCollection
            };
            this._cmp = this._ascending = cmp2;
            this._descending = function(a, b) {
              return cmp2(b, a);
            };
            this._max = function(a, b) {
              return cmp2(a, b) > 0 ? a : b;
            };
            this._min = function(a, b) {
              return cmp2(a, b) < 0 ? a : b;
            };
            this._IDBKeyRange = db2._deps.IDBKeyRange;
            if (!this._IDBKeyRange)
              throw new exceptions.MissingAPI();
          });
        }
        function eventRejectHandler(reject) {
          return wrap4(function(event) {
            preventDefault(event);
            reject(event.target.error);
            return false;
          });
        }
        function preventDefault(event) {
          if (event.stopPropagation)
            event.stopPropagation();
          if (event.preventDefault)
            event.preventDefault();
        }
        var DEXIE_STORAGE_MUTATED_EVENT_NAME = "storagemutated";
        var STORAGE_MUTATED_DOM_EVENT_NAME = "x-storagemutated-1";
        var globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);
        var Transaction = (function() {
          function Transaction2() {
          }
          Transaction2.prototype._lock = function() {
            assert2(!PSD.global);
            ++this._reculock;
            if (this._reculock === 1 && !PSD.global)
              PSD.lockOwnerFor = this;
            return this;
          };
          Transaction2.prototype._unlock = function() {
            assert2(!PSD.global);
            if (--this._reculock === 0) {
              if (!PSD.global)
                PSD.lockOwnerFor = null;
              while (this._blockedFuncs.length > 0 && !this._locked()) {
                var fnAndPSD = this._blockedFuncs.shift();
                try {
                  usePSD(fnAndPSD[1], fnAndPSD[0]);
                } catch (e) {
                }
              }
            }
            return this;
          };
          Transaction2.prototype._locked = function() {
            return this._reculock && PSD.lockOwnerFor !== this;
          };
          Transaction2.prototype.create = function(idbtrans) {
            var _this = this;
            if (!this.mode)
              return this;
            var idbdb = this.db.idbdb;
            var dbOpenError = this.db._state.dbOpenError;
            assert2(!this.idbtrans);
            if (!idbtrans && !idbdb) {
              switch (dbOpenError && dbOpenError.name) {
                case "DatabaseClosedError":
                  throw new exceptions.DatabaseClosed(dbOpenError);
                case "MissingAPIError":
                  throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                default:
                  throw new exceptions.OpenFailed(dbOpenError);
              }
            }
            if (!this.active)
              throw new exceptions.TransactionInactive();
            assert2(this._completion._state === null);
            idbtrans = this.idbtrans = idbtrans || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : idbdb.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }));
            idbtrans.onerror = wrap4(function(ev) {
              preventDefault(ev);
              _this._reject(idbtrans.error);
            });
            idbtrans.onabort = wrap4(function(ev) {
              preventDefault(ev);
              _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
              _this.active = false;
              _this.on("abort").fire(ev);
            });
            idbtrans.oncomplete = wrap4(function() {
              _this.active = false;
              _this._resolve();
              if ("mutatedParts" in idbtrans) {
                globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
              }
            });
            return this;
          };
          Transaction2.prototype._promise = function(mode, fn, bWriteLock) {
            var _this = this;
            if (mode === "readwrite" && this.mode !== "readwrite")
              return rejection(new exceptions.ReadOnly("Transaction is readonly"));
            if (!this.active)
              return rejection(new exceptions.TransactionInactive());
            if (this._locked()) {
              return new DexiePromise(function(resolve, reject) {
                _this._blockedFuncs.push([function() {
                  _this._promise(mode, fn, bWriteLock).then(resolve, reject);
                }, PSD]);
              });
            } else if (bWriteLock) {
              return newScope(function() {
                var p2 = new DexiePromise(function(resolve, reject) {
                  _this._lock();
                  var rv = fn(resolve, reject, _this);
                  if (rv && rv.then)
                    rv.then(resolve, reject);
                });
                p2.finally(function() {
                  return _this._unlock();
                });
                p2._lib = true;
                return p2;
              });
            } else {
              var p = new DexiePromise(function(resolve, reject) {
                var rv = fn(resolve, reject, _this);
                if (rv && rv.then)
                  rv.then(resolve, reject);
              });
              p._lib = true;
              return p;
            }
          };
          Transaction2.prototype._root = function() {
            return this.parent ? this.parent._root() : this;
          };
          Transaction2.prototype.waitFor = function(promiseLike) {
            var root2 = this._root();
            var promise = DexiePromise.resolve(promiseLike);
            if (root2._waitingFor) {
              root2._waitingFor = root2._waitingFor.then(function() {
                return promise;
              });
            } else {
              root2._waitingFor = promise;
              root2._waitingQueue = [];
              var store = root2.idbtrans.objectStore(root2.storeNames[0]);
              (function spin() {
                ++root2._spinCount;
                while (root2._waitingQueue.length)
                  root2._waitingQueue.shift()();
                if (root2._waitingFor)
                  store.get(-Infinity).onsuccess = spin;
              })();
            }
            var currentWaitPromise = root2._waitingFor;
            return new DexiePromise(function(resolve, reject) {
              promise.then(function(res) {
                return root2._waitingQueue.push(wrap4(resolve.bind(null, res)));
              }, function(err) {
                return root2._waitingQueue.push(wrap4(reject.bind(null, err)));
              }).finally(function() {
                if (root2._waitingFor === currentWaitPromise) {
                  root2._waitingFor = null;
                }
              });
            });
          };
          Transaction2.prototype.abort = function() {
            if (this.active) {
              this.active = false;
              if (this.idbtrans)
                this.idbtrans.abort();
              this._reject(new exceptions.Abort());
            }
          };
          Transaction2.prototype.table = function(tableName) {
            var memoizedTables = this._memoizedTables || (this._memoizedTables = {});
            if (hasOwn2(memoizedTables, tableName))
              return memoizedTables[tableName];
            var tableSchema = this.schema[tableName];
            if (!tableSchema) {
              throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
            }
            var transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
            transactionBoundTable.core = this.db.core.table(tableName);
            memoizedTables[tableName] = transactionBoundTable;
            return transactionBoundTable;
          };
          return Transaction2;
        })();
        function createTransactionConstructor(db2) {
          return makeClassConstructor(Transaction.prototype, function Transaction2(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
            var _this = this;
            this.db = db2;
            this.mode = mode;
            this.storeNames = storeNames;
            this.schema = dbschema;
            this.chromeTransactionDurability = chromeTransactionDurability;
            this.idbtrans = null;
            this.on = Events(this, "complete", "error", "abort");
            this.parent = parent || null;
            this.active = true;
            this._reculock = 0;
            this._blockedFuncs = [];
            this._resolve = null;
            this._reject = null;
            this._waitingFor = null;
            this._waitingQueue = null;
            this._spinCount = 0;
            this._completion = new DexiePromise(function(resolve, reject) {
              _this._resolve = resolve;
              _this._reject = reject;
            });
            this._completion.then(function() {
              _this.active = false;
              _this.on.complete.fire();
            }, function(e) {
              var wasActive = _this.active;
              _this.active = false;
              _this.on.error.fire(e);
              _this.parent ? _this.parent._reject(e) : wasActive && _this.idbtrans && _this.idbtrans.abort();
              return rejection(e);
            });
          });
        }
        function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey) {
          return {
            name,
            keyPath,
            unique,
            multi,
            auto,
            compound,
            src: (unique && !isPrimKey ? "&" : "") + (multi ? "*" : "") + (auto ? "++" : "") + nameFromKeyPath(keyPath)
          };
        }
        function nameFromKeyPath(keyPath) {
          return typeof keyPath === "string" ? keyPath : keyPath ? "[" + [].join.call(keyPath, "+") + "]" : "";
        }
        function createTableSchema(name, primKey, indexes) {
          return {
            name,
            primKey,
            indexes,
            mappedClass: null,
            idxByName: arrayToObject(indexes, function(index) {
              return [index.name, index];
            })
          };
        }
        function safariMultiStoreFix(storeNames) {
          return storeNames.length === 1 ? storeNames[0] : storeNames;
        }
        var getMaxKey = function(IdbKeyRange) {
          try {
            IdbKeyRange.only([[]]);
            getMaxKey = function() {
              return [[]];
            };
            return [[]];
          } catch (e) {
            getMaxKey = function() {
              return maxString;
            };
            return maxString;
          }
        };
        function getKeyExtractor(keyPath) {
          if (keyPath == null) {
            return function() {
              return void 0;
            };
          } else if (typeof keyPath === "string") {
            return getSinglePathKeyExtractor(keyPath);
          } else {
            return function(obj) {
              return getByKeyPath(obj, keyPath);
            };
          }
        }
        function getSinglePathKeyExtractor(keyPath) {
          var split = keyPath.split(".");
          if (split.length === 1) {
            return function(obj) {
              return obj[keyPath];
            };
          } else {
            return function(obj) {
              return getByKeyPath(obj, keyPath);
            };
          }
        }
        function arrayify(arrayLike) {
          return [].slice.call(arrayLike);
        }
        var _id_counter = 0;
        function getKeyPathAlias(keyPath) {
          return keyPath == null ? ":id" : typeof keyPath === "string" ? keyPath : "[".concat(keyPath.join("+"), "]");
        }
        function createDBCore(db2, IdbKeyRange, tmpTrans) {
          function extractSchema(db3, trans) {
            var tables2 = arrayify(db3.objectStoreNames);
            return {
              schema: {
                name: db3.name,
                tables: tables2.map(function(table) {
                  return trans.objectStore(table);
                }).map(function(store) {
                  var keyPath = store.keyPath, autoIncrement = store.autoIncrement;
                  var compound = isArray2(keyPath);
                  var outbound = keyPath == null;
                  var indexByKeyPath = {};
                  var result2 = {
                    name: store.name,
                    primaryKey: {
                      name: null,
                      isPrimaryKey: true,
                      outbound,
                      compound,
                      keyPath,
                      autoIncrement,
                      unique: true,
                      extractKey: getKeyExtractor(keyPath)
                    },
                    indexes: arrayify(store.indexNames).map(function(indexName) {
                      return store.index(indexName);
                    }).map(function(index) {
                      var name = index.name, unique = index.unique, multiEntry = index.multiEntry, keyPath2 = index.keyPath;
                      var compound2 = isArray2(keyPath2);
                      var result3 = {
                        name,
                        compound: compound2,
                        keyPath: keyPath2,
                        unique,
                        multiEntry,
                        extractKey: getKeyExtractor(keyPath2)
                      };
                      indexByKeyPath[getKeyPathAlias(keyPath2)] = result3;
                      return result3;
                    }),
                    getIndexByKeyPath: function(keyPath2) {
                      return indexByKeyPath[getKeyPathAlias(keyPath2)];
                    }
                  };
                  indexByKeyPath[":id"] = result2.primaryKey;
                  if (keyPath != null) {
                    indexByKeyPath[getKeyPathAlias(keyPath)] = result2.primaryKey;
                  }
                  return result2;
                })
              },
              hasGetAll: tables2.length > 0 && "getAll" in trans.objectStore(tables2[0]) && !(typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
            };
          }
          function makeIDBKeyRange(range) {
            if (range.type === 3)
              return null;
            if (range.type === 4)
              throw new Error("Cannot convert never type to IDBKeyRange");
            var lower = range.lower, upper = range.upper, lowerOpen = range.lowerOpen, upperOpen = range.upperOpen;
            var idbRange = lower === void 0 ? upper === void 0 ? null : IdbKeyRange.upperBound(upper, !!upperOpen) : upper === void 0 ? IdbKeyRange.lowerBound(lower, !!lowerOpen) : IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
            return idbRange;
          }
          function createDbCoreTable(tableSchema) {
            var tableName = tableSchema.name;
            function mutate(_a4) {
              var trans = _a4.trans, type2 = _a4.type, keys2 = _a4.keys, values = _a4.values, range = _a4.range;
              return new Promise(function(resolve, reject) {
                resolve = wrap4(resolve);
                var store = trans.objectStore(tableName);
                var outbound = store.keyPath == null;
                var isAddOrPut = type2 === "put" || type2 === "add";
                if (!isAddOrPut && type2 !== "delete" && type2 !== "deleteRange")
                  throw new Error("Invalid operation type: " + type2);
                var length = (keys2 || values || { length: 1 }).length;
                if (keys2 && values && keys2.length !== values.length) {
                  throw new Error("Given keys array must have same length as given values array.");
                }
                if (length === 0)
                  return resolve({ numFailures: 0, failures: {}, results: [], lastResult: void 0 });
                var req;
                var reqs = [];
                var failures = [];
                var numFailures = 0;
                var errorHandler = function(event) {
                  ++numFailures;
                  preventDefault(event);
                };
                if (type2 === "deleteRange") {
                  if (range.type === 4)
                    return resolve({ numFailures, failures, results: [], lastResult: void 0 });
                  if (range.type === 3)
                    reqs.push(req = store.clear());
                  else
                    reqs.push(req = store.delete(makeIDBKeyRange(range)));
                } else {
                  var _a5 = isAddOrPut ? outbound ? [values, keys2] : [values, null] : [keys2, null], args1 = _a5[0], args2 = _a5[1];
                  if (isAddOrPut) {
                    for (var i = 0; i < length; ++i) {
                      reqs.push(req = args2 && args2[i] !== void 0 ? store[type2](args1[i], args2[i]) : store[type2](args1[i]));
                      req.onerror = errorHandler;
                    }
                  } else {
                    for (var i = 0; i < length; ++i) {
                      reqs.push(req = store[type2](args1[i]));
                      req.onerror = errorHandler;
                    }
                  }
                }
                var done = function(event) {
                  var lastResult = event.target.result;
                  reqs.forEach(function(req2, i2) {
                    return req2.error != null && (failures[i2] = req2.error);
                  });
                  resolve({
                    numFailures,
                    failures,
                    results: type2 === "delete" ? keys2 : reqs.map(function(req2) {
                      return req2.result;
                    }),
                    lastResult
                  });
                };
                req.onerror = function(event) {
                  errorHandler(event);
                  done(event);
                };
                req.onsuccess = done;
              });
            }
            function openCursor2(_a4) {
              var trans = _a4.trans, values = _a4.values, query2 = _a4.query, reverse = _a4.reverse, unique = _a4.unique;
              return new Promise(function(resolve, reject) {
                resolve = wrap4(resolve);
                var index = query2.index, range = query2.range;
                var store = trans.objectStore(tableName);
                var source = index.isPrimaryKey ? store : store.index(index.name);
                var direction = reverse ? unique ? "prevunique" : "prev" : unique ? "nextunique" : "next";
                var req = values || !("openKeyCursor" in source) ? source.openCursor(makeIDBKeyRange(range), direction) : source.openKeyCursor(makeIDBKeyRange(range), direction);
                req.onerror = eventRejectHandler(reject);
                req.onsuccess = wrap4(function(ev) {
                  var cursor = req.result;
                  if (!cursor) {
                    resolve(null);
                    return;
                  }
                  cursor.___id = ++_id_counter;
                  cursor.done = false;
                  var _cursorContinue = cursor.continue.bind(cursor);
                  var _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
                  if (_cursorContinuePrimaryKey)
                    _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
                  var _cursorAdvance = cursor.advance.bind(cursor);
                  var doThrowCursorIsNotStarted = function() {
                    throw new Error("Cursor not started");
                  };
                  var doThrowCursorIsStopped = function() {
                    throw new Error("Cursor not stopped");
                  };
                  cursor.trans = trans;
                  cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
                  cursor.fail = wrap4(reject);
                  cursor.next = function() {
                    var _this = this;
                    var gotOne = 1;
                    return this.start(function() {
                      return gotOne-- ? _this.continue() : _this.stop();
                    }).then(function() {
                      return _this;
                    });
                  };
                  cursor.start = function(callback) {
                    var iterationPromise = new Promise(function(resolveIteration, rejectIteration) {
                      resolveIteration = wrap4(resolveIteration);
                      req.onerror = eventRejectHandler(rejectIteration);
                      cursor.fail = rejectIteration;
                      cursor.stop = function(value) {
                        cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                        resolveIteration(value);
                      };
                    });
                    var guardedCallback = function() {
                      if (req.result) {
                        try {
                          callback();
                        } catch (err) {
                          cursor.fail(err);
                        }
                      } else {
                        cursor.done = true;
                        cursor.start = function() {
                          throw new Error("Cursor behind last entry");
                        };
                        cursor.stop();
                      }
                    };
                    req.onsuccess = wrap4(function(ev2) {
                      req.onsuccess = guardedCallback;
                      guardedCallback();
                    });
                    cursor.continue = _cursorContinue;
                    cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
                    cursor.advance = _cursorAdvance;
                    guardedCallback();
                    return iterationPromise;
                  };
                  resolve(cursor);
                }, reject);
              });
            }
            function query(hasGetAll2) {
              return function(request) {
                return new Promise(function(resolve, reject) {
                  resolve = wrap4(resolve);
                  var trans = request.trans, values = request.values, limit = request.limit, query2 = request.query;
                  var nonInfinitLimit = limit === Infinity ? void 0 : limit;
                  var index = query2.index, range = query2.range;
                  var store = trans.objectStore(tableName);
                  var source = index.isPrimaryKey ? store : store.index(index.name);
                  var idbKeyRange = makeIDBKeyRange(range);
                  if (limit === 0)
                    return resolve({ result: [] });
                  if (hasGetAll2) {
                    var req = values ? source.getAll(idbKeyRange, nonInfinitLimit) : source.getAllKeys(idbKeyRange, nonInfinitLimit);
                    req.onsuccess = function(event) {
                      return resolve({ result: event.target.result });
                    };
                    req.onerror = eventRejectHandler(reject);
                  } else {
                    var count_1 = 0;
                    var req_1 = values || !("openKeyCursor" in source) ? source.openCursor(idbKeyRange) : source.openKeyCursor(idbKeyRange);
                    var result_1 = [];
                    req_1.onsuccess = function(event) {
                      var cursor = req_1.result;
                      if (!cursor)
                        return resolve({ result: result_1 });
                      result_1.push(values ? cursor.value : cursor.primaryKey);
                      if (++count_1 === limit)
                        return resolve({ result: result_1 });
                      cursor.continue();
                    };
                    req_1.onerror = eventRejectHandler(reject);
                  }
                });
              };
            }
            return {
              name: tableName,
              schema: tableSchema,
              mutate,
              getMany: function(_a4) {
                var trans = _a4.trans, keys2 = _a4.keys;
                return new Promise(function(resolve, reject) {
                  resolve = wrap4(resolve);
                  var store = trans.objectStore(tableName);
                  var length = keys2.length;
                  var result2 = new Array(length);
                  var keyCount = 0;
                  var callbackCount = 0;
                  var req;
                  var successHandler = function(event) {
                    var req2 = event.target;
                    if ((result2[req2._pos] = req2.result) != null)
                      ;
                    if (++callbackCount === keyCount)
                      resolve(result2);
                  };
                  var errorHandler = eventRejectHandler(reject);
                  for (var i = 0; i < length; ++i) {
                    var key = keys2[i];
                    if (key != null) {
                      req = store.get(keys2[i]);
                      req._pos = i;
                      req.onsuccess = successHandler;
                      req.onerror = errorHandler;
                      ++keyCount;
                    }
                  }
                  if (keyCount === 0)
                    resolve(result2);
                });
              },
              get: function(_a4) {
                var trans = _a4.trans, key = _a4.key;
                return new Promise(function(resolve, reject) {
                  resolve = wrap4(resolve);
                  var store = trans.objectStore(tableName);
                  var req = store.get(key);
                  req.onsuccess = function(event) {
                    return resolve(event.target.result);
                  };
                  req.onerror = eventRejectHandler(reject);
                });
              },
              query: query(hasGetAll),
              openCursor: openCursor2,
              count: function(_a4) {
                var query2 = _a4.query, trans = _a4.trans;
                var index = query2.index, range = query2.range;
                return new Promise(function(resolve, reject) {
                  var store = trans.objectStore(tableName);
                  var source = index.isPrimaryKey ? store : store.index(index.name);
                  var idbKeyRange = makeIDBKeyRange(range);
                  var req = idbKeyRange ? source.count(idbKeyRange) : source.count();
                  req.onsuccess = wrap4(function(ev) {
                    return resolve(ev.target.result);
                  });
                  req.onerror = eventRejectHandler(reject);
                });
              }
            };
          }
          var _a3 = extractSchema(db2, tmpTrans), schema = _a3.schema, hasGetAll = _a3.hasGetAll;
          var tables = schema.tables.map(function(tableSchema) {
            return createDbCoreTable(tableSchema);
          });
          var tableMap = {};
          tables.forEach(function(table) {
            return tableMap[table.name] = table;
          });
          return {
            stack: "dbcore",
            transaction: db2.transaction.bind(db2),
            table: function(name) {
              var result2 = tableMap[name];
              if (!result2)
                throw new Error("Table '".concat(name, "' not found"));
              return tableMap[name];
            },
            MIN_KEY: -Infinity,
            MAX_KEY: getMaxKey(IdbKeyRange),
            schema
          };
        }
        function createMiddlewareStack(stackImpl, middlewares) {
          return middlewares.reduce(function(down, _a3) {
            var create = _a3.create;
            return __assign2(__assign2({}, down), create(down));
          }, stackImpl);
        }
        function createMiddlewareStacks(middlewares, idbdb, _a3, tmpTrans) {
          var IDBKeyRange = _a3.IDBKeyRange;
          _a3.indexedDB;
          var dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
          return {
            dbcore
          };
        }
        function generateMiddlewareStacks(db2, tmpTrans) {
          var idbdb = tmpTrans.db;
          var stacks = createMiddlewareStacks(db2._middlewares, idbdb, db2._deps, tmpTrans);
          db2.core = stacks.dbcore;
          db2.tables.forEach(function(table) {
            var tableName = table.name;
            if (db2.core.schema.tables.some(function(tbl) {
              return tbl.name === tableName;
            })) {
              table.core = db2.core.table(tableName);
              if (db2[tableName] instanceof db2.Table) {
                db2[tableName].core = table.core;
              }
            }
          });
        }
        function setApiOnPlace(db2, objs, tableNames, dbschema) {
          tableNames.forEach(function(tableName) {
            var schema = dbschema[tableName];
            objs.forEach(function(obj) {
              var propDesc = getPropertyDescriptor(obj, tableName);
              if (!propDesc || "value" in propDesc && propDesc.value === void 0) {
                if (obj === db2.Transaction.prototype || obj instanceof db2.Transaction) {
                  setProp(obj, tableName, {
                    get: function() {
                      return this.table(tableName);
                    },
                    set: function(value) {
                      defineProperty(this, tableName, { value, writable: true, configurable: true, enumerable: true });
                    }
                  });
                } else {
                  obj[tableName] = new db2.Table(tableName, schema);
                }
              }
            });
          });
        }
        function removeTablesApi(db2, objs) {
          objs.forEach(function(obj) {
            for (var key in obj) {
              if (obj[key] instanceof db2.Table)
                delete obj[key];
            }
          });
        }
        function lowerVersionFirst(a, b) {
          return a._cfg.version - b._cfg.version;
        }
        function runUpgraders(db2, oldVersion, idbUpgradeTrans, reject) {
          var globalSchema = db2._dbSchema;
          if (idbUpgradeTrans.objectStoreNames.contains("$meta") && !globalSchema.$meta) {
            globalSchema.$meta = createTableSchema("$meta", parseIndexSyntax("")[0], []);
            db2._storeNames.push("$meta");
          }
          var trans = db2._createTransaction("readwrite", db2._storeNames, globalSchema);
          trans.create(idbUpgradeTrans);
          trans._completion.catch(reject);
          var rejectTransaction = trans._reject.bind(trans);
          var transless = PSD.transless || PSD;
          newScope(function() {
            PSD.trans = trans;
            PSD.transless = transless;
            if (oldVersion === 0) {
              keys(globalSchema).forEach(function(tableName) {
                createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
              });
              generateMiddlewareStacks(db2, idbUpgradeTrans);
              DexiePromise.follow(function() {
                return db2.on.populate.fire(trans);
              }).catch(rejectTransaction);
            } else {
              generateMiddlewareStacks(db2, idbUpgradeTrans);
              return getExistingVersion(db2, trans, oldVersion).then(function(oldVersion2) {
                return updateTablesAndIndexes(db2, oldVersion2, trans, idbUpgradeTrans);
              }).catch(rejectTransaction);
            }
          });
        }
        function patchCurrentVersion(db2, idbUpgradeTrans) {
          createMissingTables(db2._dbSchema, idbUpgradeTrans);
          if (idbUpgradeTrans.db.version % 10 === 0 && !idbUpgradeTrans.objectStoreNames.contains("$meta")) {
            idbUpgradeTrans.db.createObjectStore("$meta").add(Math.ceil(idbUpgradeTrans.db.version / 10 - 1), "version");
          }
          var globalSchema = buildGlobalSchema(db2, db2.idbdb, idbUpgradeTrans);
          adjustToExistingIndexNames(db2, db2._dbSchema, idbUpgradeTrans);
          var diff = getSchemaDiff(globalSchema, db2._dbSchema);
          var _loop_1 = function(tableChange2) {
            if (tableChange2.change.length || tableChange2.recreate) {
              console.warn("Unable to patch indexes of table ".concat(tableChange2.name, " because it has changes on the type of index or primary key."));
              return { value: void 0 };
            }
            var store = idbUpgradeTrans.objectStore(tableChange2.name);
            tableChange2.add.forEach(function(idx) {
              if (debug)
                console.debug("Dexie upgrade patch: Creating missing index ".concat(tableChange2.name, ".").concat(idx.src));
              addIndex(store, idx);
            });
          };
          for (var _i = 0, _a3 = diff.change; _i < _a3.length; _i++) {
            var tableChange = _a3[_i];
            var state_1 = _loop_1(tableChange);
            if (typeof state_1 === "object")
              return state_1.value;
          }
        }
        function getExistingVersion(db2, trans, oldVersion) {
          if (trans.storeNames.includes("$meta")) {
            return trans.table("$meta").get("version").then(function(metaVersion) {
              return metaVersion != null ? metaVersion : oldVersion;
            });
          } else {
            return DexiePromise.resolve(oldVersion);
          }
        }
        function updateTablesAndIndexes(db2, oldVersion, trans, idbUpgradeTrans) {
          var queue = [];
          var versions = db2._versions;
          var globalSchema = db2._dbSchema = buildGlobalSchema(db2, db2.idbdb, idbUpgradeTrans);
          var versToRun = versions.filter(function(v) {
            return v._cfg.version >= oldVersion;
          });
          if (versToRun.length === 0) {
            return DexiePromise.resolve();
          }
          versToRun.forEach(function(version2) {
            queue.push(function() {
              var oldSchema = globalSchema;
              var newSchema = version2._cfg.dbschema;
              adjustToExistingIndexNames(db2, oldSchema, idbUpgradeTrans);
              adjustToExistingIndexNames(db2, newSchema, idbUpgradeTrans);
              globalSchema = db2._dbSchema = newSchema;
              var diff = getSchemaDiff(oldSchema, newSchema);
              diff.add.forEach(function(tuple) {
                createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
              });
              diff.change.forEach(function(change) {
                if (change.recreate) {
                  throw new exceptions.Upgrade("Not yet support for changing primary key");
                } else {
                  var store_1 = idbUpgradeTrans.objectStore(change.name);
                  change.add.forEach(function(idx) {
                    return addIndex(store_1, idx);
                  });
                  change.change.forEach(function(idx) {
                    store_1.deleteIndex(idx.name);
                    addIndex(store_1, idx);
                  });
                  change.del.forEach(function(idxName) {
                    return store_1.deleteIndex(idxName);
                  });
                }
              });
              var contentUpgrade = version2._cfg.contentUpgrade;
              if (contentUpgrade && version2._cfg.version > oldVersion) {
                generateMiddlewareStacks(db2, idbUpgradeTrans);
                trans._memoizedTables = {};
                var upgradeSchema_1 = shallowClone(newSchema);
                diff.del.forEach(function(table) {
                  upgradeSchema_1[table] = oldSchema[table];
                });
                removeTablesApi(db2, [db2.Transaction.prototype]);
                setApiOnPlace(db2, [db2.Transaction.prototype], keys(upgradeSchema_1), upgradeSchema_1);
                trans.schema = upgradeSchema_1;
                var contentUpgradeIsAsync_1 = isAsyncFunction(contentUpgrade);
                if (contentUpgradeIsAsync_1) {
                  incrementExpectedAwaits();
                }
                var returnValue_1;
                var promiseFollowed = DexiePromise.follow(function() {
                  returnValue_1 = contentUpgrade(trans);
                  if (returnValue_1) {
                    if (contentUpgradeIsAsync_1) {
                      var decrementor = decrementExpectedAwaits.bind(null, null);
                      returnValue_1.then(decrementor, decrementor);
                    }
                  }
                });
                return returnValue_1 && typeof returnValue_1.then === "function" ? DexiePromise.resolve(returnValue_1) : promiseFollowed.then(function() {
                  return returnValue_1;
                });
              }
            });
            queue.push(function(idbtrans) {
              var newSchema = version2._cfg.dbschema;
              deleteRemovedTables(newSchema, idbtrans);
              removeTablesApi(db2, [db2.Transaction.prototype]);
              setApiOnPlace(db2, [db2.Transaction.prototype], db2._storeNames, db2._dbSchema);
              trans.schema = db2._dbSchema;
            });
            queue.push(function(idbtrans) {
              if (db2.idbdb.objectStoreNames.contains("$meta")) {
                if (Math.ceil(db2.idbdb.version / 10) === version2._cfg.version) {
                  db2.idbdb.deleteObjectStore("$meta");
                  delete db2._dbSchema.$meta;
                  db2._storeNames = db2._storeNames.filter(function(name) {
                    return name !== "$meta";
                  });
                } else {
                  idbtrans.objectStore("$meta").put(version2._cfg.version, "version");
                }
              }
            });
          });
          function runQueue() {
            return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : DexiePromise.resolve();
          }
          return runQueue().then(function() {
            createMissingTables(globalSchema, idbUpgradeTrans);
          });
        }
        function getSchemaDiff(oldSchema, newSchema) {
          var diff = {
            del: [],
            add: [],
            change: []
          };
          var table;
          for (table in oldSchema) {
            if (!newSchema[table])
              diff.del.push(table);
          }
          for (table in newSchema) {
            var oldDef = oldSchema[table], newDef = newSchema[table];
            if (!oldDef) {
              diff.add.push([table, newDef]);
            } else {
              var change = {
                name: table,
                def: newDef,
                recreate: false,
                del: [],
                add: [],
                change: []
              };
              if ("" + (oldDef.primKey.keyPath || "") !== "" + (newDef.primKey.keyPath || "") || oldDef.primKey.auto !== newDef.primKey.auto) {
                change.recreate = true;
                diff.change.push(change);
              } else {
                var oldIndexes = oldDef.idxByName;
                var newIndexes = newDef.idxByName;
                var idxName = void 0;
                for (idxName in oldIndexes) {
                  if (!newIndexes[idxName])
                    change.del.push(idxName);
                }
                for (idxName in newIndexes) {
                  var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                  if (!oldIdx)
                    change.add.push(newIdx);
                  else if (oldIdx.src !== newIdx.src)
                    change.change.push(newIdx);
                }
                if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                  diff.change.push(change);
                }
              }
            }
          }
          return diff;
        }
        function createTable(idbtrans, tableName, primKey, indexes) {
          var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
          indexes.forEach(function(idx) {
            return addIndex(store, idx);
          });
          return store;
        }
        function createMissingTables(newSchema, idbtrans) {
          keys(newSchema).forEach(function(tableName) {
            if (!idbtrans.db.objectStoreNames.contains(tableName)) {
              if (debug)
                console.debug("Dexie: Creating missing table", tableName);
              createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
            }
          });
        }
        function deleteRemovedTables(newSchema, idbtrans) {
          [].slice.call(idbtrans.db.objectStoreNames).forEach(function(storeName) {
            return newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName);
          });
        }
        function addIndex(store, idx) {
          store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
        }
        function buildGlobalSchema(db2, idbdb, tmpTrans) {
          var globalSchema = {};
          var dbStoreNames = slice2(idbdb.objectStoreNames, 0);
          dbStoreNames.forEach(function(storeName) {
            var store = tmpTrans.objectStore(storeName);
            var keyPath = store.keyPath;
            var primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", true, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
            var indexes = [];
            for (var j = 0; j < store.indexNames.length; ++j) {
              var idbindex = store.index(store.indexNames[j]);
              keyPath = idbindex.keyPath;
              var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
              indexes.push(index);
            }
            globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
          });
          return globalSchema;
        }
        function readGlobalSchema(db2, idbdb, tmpTrans) {
          db2.verno = idbdb.version / 10;
          var globalSchema = db2._dbSchema = buildGlobalSchema(db2, idbdb, tmpTrans);
          db2._storeNames = slice2(idbdb.objectStoreNames, 0);
          setApiOnPlace(db2, [db2._allTables], keys(globalSchema), globalSchema);
        }
        function verifyInstalledSchema(db2, tmpTrans) {
          var installedSchema = buildGlobalSchema(db2, db2.idbdb, tmpTrans);
          var diff = getSchemaDiff(installedSchema, db2._dbSchema);
          return !(diff.add.length || diff.change.some(function(ch) {
            return ch.add.length || ch.change.length;
          }));
        }
        function adjustToExistingIndexNames(db2, schema, idbtrans) {
          var storeNames = idbtrans.db.objectStoreNames;
          for (var i = 0; i < storeNames.length; ++i) {
            var storeName = storeNames[i];
            var store = idbtrans.objectStore(storeName);
            db2._hasGetAll = "getAll" in store;
            for (var j = 0; j < store.indexNames.length; ++j) {
              var indexName = store.indexNames[j];
              var keyPath = store.index(indexName).keyPath;
              var dexieName = typeof keyPath === "string" ? keyPath : "[" + slice2(keyPath).join("+") + "]";
              if (schema[storeName]) {
                var indexSpec = schema[storeName].idxByName[dexieName];
                if (indexSpec) {
                  indexSpec.name = indexName;
                  delete schema[storeName].idxByName[dexieName];
                  schema[storeName].idxByName[indexName] = indexSpec;
                }
              }
            }
          }
          if (typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
            db2._hasGetAll = false;
          }
        }
        function parseIndexSyntax(primKeyAndIndexes) {
          return primKeyAndIndexes.split(",").map(function(index, indexNum) {
            index = index.trim();
            var name = index.replace(/([&*]|\+\+)/g, "");
            var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split("+") : name;
            return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray2(keyPath), indexNum === 0);
          });
        }
        var Version = (function() {
          function Version2() {
          }
          Version2.prototype._parseStoresSpec = function(stores, outSchema) {
            keys(stores).forEach(function(tableName) {
              if (stores[tableName] !== null) {
                var indexes = parseIndexSyntax(stores[tableName]);
                var primKey = indexes.shift();
                primKey.unique = true;
                if (primKey.multi)
                  throw new exceptions.Schema("Primary key cannot be multi-valued");
                indexes.forEach(function(idx) {
                  if (idx.auto)
                    throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                  if (!idx.keyPath)
                    throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                });
                outSchema[tableName] = createTableSchema(tableName, primKey, indexes);
              }
            });
          };
          Version2.prototype.stores = function(stores) {
            var db2 = this.db;
            this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
            var versions = db2._versions;
            var storesSpec = {};
            var dbschema = {};
            versions.forEach(function(version2) {
              extend(storesSpec, version2._cfg.storesSource);
              dbschema = version2._cfg.dbschema = {};
              version2._parseStoresSpec(storesSpec, dbschema);
            });
            db2._dbSchema = dbschema;
            removeTablesApi(db2, [db2._allTables, db2, db2.Transaction.prototype]);
            setApiOnPlace(db2, [db2._allTables, db2, db2.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
            db2._storeNames = keys(dbschema);
            return this;
          };
          Version2.prototype.upgrade = function(upgradeFunction) {
            this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
            return this;
          };
          return Version2;
        })();
        function createVersionConstructor(db2) {
          return makeClassConstructor(Version.prototype, function Version2(versionNumber) {
            this.db = db2;
            this._cfg = {
              version: versionNumber,
              storesSource: null,
              dbschema: {},
              tables: {},
              contentUpgrade: null
            };
          });
        }
        function getDbNamesTable(indexedDB2, IDBKeyRange) {
          var dbNamesDB = indexedDB2["_dbNamesDB"];
          if (!dbNamesDB) {
            dbNamesDB = indexedDB2["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
              addons: [],
              indexedDB: indexedDB2,
              IDBKeyRange
            });
            dbNamesDB.version(1).stores({ dbnames: "name" });
          }
          return dbNamesDB.table("dbnames");
        }
        function hasDatabasesNative(indexedDB2) {
          return indexedDB2 && typeof indexedDB2.databases === "function";
        }
        function getDatabaseNames(_a3) {
          var indexedDB2 = _a3.indexedDB, IDBKeyRange = _a3.IDBKeyRange;
          return hasDatabasesNative(indexedDB2) ? Promise.resolve(indexedDB2.databases()).then(function(infos) {
            return infos.map(function(info) {
              return info.name;
            }).filter(function(name) {
              return name !== DBNAMES_DB;
            });
          }) : getDbNamesTable(indexedDB2, IDBKeyRange).toCollection().primaryKeys();
        }
        function _onDatabaseCreated(_a3, name) {
          var indexedDB2 = _a3.indexedDB, IDBKeyRange = _a3.IDBKeyRange;
          !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).put({ name }).catch(nop);
        }
        function _onDatabaseDeleted(_a3, name) {
          var indexedDB2 = _a3.indexedDB, IDBKeyRange = _a3.IDBKeyRange;
          !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).delete(name).catch(nop);
        }
        function vip(fn) {
          return newScope(function() {
            PSD.letThrough = true;
            return fn();
          });
        }
        function idbReady() {
          var isSafari = !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent);
          if (!isSafari || !indexedDB.databases)
            return Promise.resolve();
          var intervalId;
          return new Promise(function(resolve) {
            var tryIdb = function() {
              return indexedDB.databases().finally(resolve);
            };
            intervalId = setInterval(tryIdb, 100);
            tryIdb();
          }).finally(function() {
            return clearInterval(intervalId);
          });
        }
        var _a2;
        function isEmptyRange(node) {
          return !("from" in node);
        }
        var RangeSet2 = function(fromOrTree, to) {
          if (this) {
            extend(this, arguments.length ? { d: 1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree } : { d: 0 });
          } else {
            var rv = new RangeSet2();
            if (fromOrTree && "d" in fromOrTree) {
              extend(rv, fromOrTree);
            }
            return rv;
          }
        };
        props(RangeSet2.prototype, (_a2 = {
          add: function(rangeSet) {
            mergeRanges2(this, rangeSet);
            return this;
          },
          addKey: function(key) {
            addRange(this, key, key);
            return this;
          },
          addKeys: function(keys2) {
            var _this = this;
            keys2.forEach(function(key) {
              return addRange(_this, key, key);
            });
            return this;
          },
          hasKey: function(key) {
            var node = getRangeSetIterator(this).next(key).value;
            return node && cmp2(node.from, key) <= 0 && cmp2(node.to, key) >= 0;
          }
        }, _a2[iteratorSymbol] = function() {
          return getRangeSetIterator(this);
        }, _a2));
        function addRange(target, from, to) {
          var diff = cmp2(from, to);
          if (isNaN(diff))
            return;
          if (diff > 0)
            throw RangeError();
          if (isEmptyRange(target))
            return extend(target, { from, to, d: 1 });
          var left = target.l;
          var right = target.r;
          if (cmp2(to, target.from) < 0) {
            left ? addRange(left, from, to) : target.l = { from, to, d: 1, l: null, r: null };
            return rebalance(target);
          }
          if (cmp2(from, target.to) > 0) {
            right ? addRange(right, from, to) : target.r = { from, to, d: 1, l: null, r: null };
            return rebalance(target);
          }
          if (cmp2(from, target.from) < 0) {
            target.from = from;
            target.l = null;
            target.d = right ? right.d + 1 : 1;
          }
          if (cmp2(to, target.to) > 0) {
            target.to = to;
            target.r = null;
            target.d = target.l ? target.l.d + 1 : 1;
          }
          var rightWasCutOff = !target.r;
          if (left && !target.l) {
            mergeRanges2(target, left);
          }
          if (right && rightWasCutOff) {
            mergeRanges2(target, right);
          }
        }
        function mergeRanges2(target, newSet) {
          function _addRangeSet(target2, _a3) {
            var from = _a3.from, to = _a3.to, l = _a3.l, r = _a3.r;
            addRange(target2, from, to);
            if (l)
              _addRangeSet(target2, l);
            if (r)
              _addRangeSet(target2, r);
          }
          if (!isEmptyRange(newSet))
            _addRangeSet(target, newSet);
        }
        function rangesOverlap2(rangeSet1, rangeSet2) {
          var i1 = getRangeSetIterator(rangeSet2);
          var nextResult1 = i1.next();
          if (nextResult1.done)
            return false;
          var a = nextResult1.value;
          var i2 = getRangeSetIterator(rangeSet1);
          var nextResult2 = i2.next(a.from);
          var b = nextResult2.value;
          while (!nextResult1.done && !nextResult2.done) {
            if (cmp2(b.from, a.to) <= 0 && cmp2(b.to, a.from) >= 0)
              return true;
            cmp2(a.from, b.from) < 0 ? a = (nextResult1 = i1.next(b.from)).value : b = (nextResult2 = i2.next(a.from)).value;
          }
          return false;
        }
        function getRangeSetIterator(node) {
          var state = isEmptyRange(node) ? null : { s: 0, n: node };
          return {
            next: function(key) {
              var keyProvided = arguments.length > 0;
              while (state) {
                switch (state.s) {
                  case 0:
                    state.s = 1;
                    if (keyProvided) {
                      while (state.n.l && cmp2(key, state.n.from) < 0)
                        state = { up: state, n: state.n.l, s: 1 };
                    } else {
                      while (state.n.l)
                        state = { up: state, n: state.n.l, s: 1 };
                    }
                  case 1:
                    state.s = 2;
                    if (!keyProvided || cmp2(key, state.n.to) <= 0)
                      return { value: state.n, done: false };
                  case 2:
                    if (state.n.r) {
                      state.s = 3;
                      state = { up: state, n: state.n.r, s: 0 };
                      continue;
                    }
                  case 3:
                    state = state.up;
                }
              }
              return { done: true };
            }
          };
        }
        function rebalance(target) {
          var _a3, _b;
          var diff = (((_a3 = target.r) === null || _a3 === void 0 ? void 0 : _a3.d) || 0) - (((_b = target.l) === null || _b === void 0 ? void 0 : _b.d) || 0);
          var r = diff > 1 ? "r" : diff < -1 ? "l" : "";
          if (r) {
            var l = r === "r" ? "l" : "r";
            var rootClone = __assign2({}, target);
            var oldRootRight = target[r];
            target.from = oldRootRight.from;
            target.to = oldRootRight.to;
            target[r] = oldRootRight[r];
            rootClone[r] = oldRootRight[l];
            target[l] = rootClone;
            rootClone.d = computeDepth(rootClone);
          }
          target.d = computeDepth(target);
        }
        function computeDepth(_a3) {
          var r = _a3.r, l = _a3.l;
          return (r ? l ? Math.max(r.d, l.d) : r.d : l ? l.d : 0) + 1;
        }
        function extendObservabilitySet(target, newSet) {
          keys(newSet).forEach(function(part) {
            if (target[part])
              mergeRanges2(target[part], newSet[part]);
            else
              target[part] = cloneSimpleObjectTree(newSet[part]);
          });
          return target;
        }
        function obsSetsOverlap(os1, os2) {
          return os1.all || os2.all || Object.keys(os1).some(function(key) {
            return os2[key] && rangesOverlap2(os2[key], os1[key]);
          });
        }
        var cache = {};
        var unsignaledParts = {};
        var isTaskEnqueued = false;
        function signalSubscribersLazily(part, optimistic) {
          extendObservabilitySet(unsignaledParts, part);
          if (!isTaskEnqueued) {
            isTaskEnqueued = true;
            setTimeout(function() {
              isTaskEnqueued = false;
              var parts = unsignaledParts;
              unsignaledParts = {};
              signalSubscribersNow(parts, false);
            }, 0);
          }
        }
        function signalSubscribersNow(updatedParts, deleteAffectedCacheEntries) {
          if (deleteAffectedCacheEntries === void 0) {
            deleteAffectedCacheEntries = false;
          }
          var queriesToSignal = /* @__PURE__ */ new Set();
          if (updatedParts.all) {
            for (var _i = 0, _a3 = Object.values(cache); _i < _a3.length; _i++) {
              var tblCache = _a3[_i];
              collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
            }
          } else {
            for (var key in updatedParts) {
              var parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
              if (parts) {
                var dbName = parts[1], tableName = parts[2];
                var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
                if (tblCache)
                  collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
              }
            }
          }
          queriesToSignal.forEach(function(requery) {
            return requery();
          });
        }
        function collectTableSubscribers(tblCache, updatedParts, outQueriesToSignal, deleteAffectedCacheEntries) {
          var updatedEntryLists = [];
          for (var _i = 0, _a3 = Object.entries(tblCache.queries.query); _i < _a3.length; _i++) {
            var _b = _a3[_i], indexName = _b[0], entries = _b[1];
            var filteredEntries = [];
            for (var _c = 0, entries_1 = entries; _c < entries_1.length; _c++) {
              var entry = entries_1[_c];
              if (obsSetsOverlap(updatedParts, entry.obsSet)) {
                entry.subscribers.forEach(function(requery) {
                  return outQueriesToSignal.add(requery);
                });
              } else if (deleteAffectedCacheEntries) {
                filteredEntries.push(entry);
              }
            }
            if (deleteAffectedCacheEntries)
              updatedEntryLists.push([indexName, filteredEntries]);
          }
          if (deleteAffectedCacheEntries) {
            for (var _d = 0, updatedEntryLists_1 = updatedEntryLists; _d < updatedEntryLists_1.length; _d++) {
              var _e = updatedEntryLists_1[_d], indexName = _e[0], filteredEntries = _e[1];
              tblCache.queries.query[indexName] = filteredEntries;
            }
          }
        }
        function dexieOpen(db2) {
          var state = db2._state;
          var indexedDB2 = db2._deps.indexedDB;
          if (state.isBeingOpened || db2.idbdb)
            return state.dbReadyPromise.then(function() {
              return state.dbOpenError ? rejection(state.dbOpenError) : db2;
            });
          state.isBeingOpened = true;
          state.dbOpenError = null;
          state.openComplete = false;
          var openCanceller = state.openCanceller;
          var nativeVerToOpen = Math.round(db2.verno * 10);
          var schemaPatchMode = false;
          function throwIfCancelled() {
            if (state.openCanceller !== openCanceller)
              throw new exceptions.DatabaseClosed("db.open() was cancelled");
          }
          var resolveDbReady = state.dbReadyResolve, upgradeTransaction = null, wasCreated = false;
          var tryOpenDB = function() {
            return new DexiePromise(function(resolve, reject) {
              throwIfCancelled();
              if (!indexedDB2)
                throw new exceptions.MissingAPI();
              var dbName = db2.name;
              var req = state.autoSchema || !nativeVerToOpen ? indexedDB2.open(dbName) : indexedDB2.open(dbName, nativeVerToOpen);
              if (!req)
                throw new exceptions.MissingAPI();
              req.onerror = eventRejectHandler(reject);
              req.onblocked = wrap4(db2._fireOnBlocked);
              req.onupgradeneeded = wrap4(function(e) {
                upgradeTransaction = req.transaction;
                if (state.autoSchema && !db2._options.allowEmptyDB) {
                  req.onerror = preventDefault;
                  upgradeTransaction.abort();
                  req.result.close();
                  var delreq = indexedDB2.deleteDatabase(dbName);
                  delreq.onsuccess = delreq.onerror = wrap4(function() {
                    reject(new exceptions.NoSuchDatabase("Database ".concat(dbName, " doesnt exist")));
                  });
                } else {
                  upgradeTransaction.onerror = eventRejectHandler(reject);
                  var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
                  wasCreated = oldVer < 1;
                  db2.idbdb = req.result;
                  if (schemaPatchMode) {
                    patchCurrentVersion(db2, upgradeTransaction);
                  }
                  runUpgraders(db2, oldVer / 10, upgradeTransaction, reject);
                }
              }, reject);
              req.onsuccess = wrap4(function() {
                upgradeTransaction = null;
                var idbdb = db2.idbdb = req.result;
                var objectStoreNames = slice2(idbdb.objectStoreNames);
                if (objectStoreNames.length > 0)
                  try {
                    var tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), "readonly");
                    if (state.autoSchema)
                      readGlobalSchema(db2, idbdb, tmpTrans);
                    else {
                      adjustToExistingIndexNames(db2, db2._dbSchema, tmpTrans);
                      if (!verifyInstalledSchema(db2, tmpTrans) && !schemaPatchMode) {
                        console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.");
                        idbdb.close();
                        nativeVerToOpen = idbdb.version + 1;
                        schemaPatchMode = true;
                        return resolve(tryOpenDB());
                      }
                    }
                    generateMiddlewareStacks(db2, tmpTrans);
                  } catch (e) {
                  }
                connections.push(db2);
                idbdb.onversionchange = wrap4(function(ev) {
                  state.vcFired = true;
                  db2.on("versionchange").fire(ev);
                });
                idbdb.onclose = wrap4(function(ev) {
                  db2.on("close").fire(ev);
                });
                if (wasCreated)
                  _onDatabaseCreated(db2._deps, dbName);
                resolve();
              }, reject);
            }).catch(function(err) {
              switch (err === null || err === void 0 ? void 0 : err.name) {
                case "UnknownError":
                  if (state.PR1398_maxLoop > 0) {
                    state.PR1398_maxLoop--;
                    console.warn("Dexie: Workaround for Chrome UnknownError on open()");
                    return tryOpenDB();
                  }
                  break;
                case "VersionError":
                  if (nativeVerToOpen > 0) {
                    nativeVerToOpen = 0;
                    return tryOpenDB();
                  }
                  break;
              }
              return DexiePromise.reject(err);
            });
          };
          return DexiePromise.race([
            openCanceller,
            (typeof navigator === "undefined" ? DexiePromise.resolve() : idbReady()).then(tryOpenDB)
          ]).then(function() {
            throwIfCancelled();
            state.onReadyBeingFired = [];
            return DexiePromise.resolve(vip(function() {
              return db2.on.ready.fire(db2.vip);
            })).then(function fireRemainders() {
              if (state.onReadyBeingFired.length > 0) {
                var remainders_1 = state.onReadyBeingFired.reduce(promisableChain, nop);
                state.onReadyBeingFired = [];
                return DexiePromise.resolve(vip(function() {
                  return remainders_1(db2.vip);
                })).then(fireRemainders);
              }
            });
          }).finally(function() {
            if (state.openCanceller === openCanceller) {
              state.onReadyBeingFired = null;
              state.isBeingOpened = false;
            }
          }).catch(function(err) {
            state.dbOpenError = err;
            try {
              upgradeTransaction && upgradeTransaction.abort();
            } catch (_a3) {
            }
            if (openCanceller === state.openCanceller) {
              db2._close();
            }
            return rejection(err);
          }).finally(function() {
            state.openComplete = true;
            resolveDbReady();
          }).then(function() {
            if (wasCreated) {
              var everything_1 = {};
              db2.tables.forEach(function(table) {
                table.schema.indexes.forEach(function(idx) {
                  if (idx.name)
                    everything_1["idb://".concat(db2.name, "/").concat(table.name, "/").concat(idx.name)] = new RangeSet2(-Infinity, [[[]]]);
                });
                everything_1["idb://".concat(db2.name, "/").concat(table.name, "/")] = everything_1["idb://".concat(db2.name, "/").concat(table.name, "/:dels")] = new RangeSet2(-Infinity, [[[]]]);
              });
              globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME).fire(everything_1);
              signalSubscribersNow(everything_1, true);
            }
            return db2;
          });
        }
        function awaitIterator(iterator) {
          var callNext = function(result2) {
            return iterator.next(result2);
          }, doThrow = function(error) {
            return iterator.throw(error);
          }, onSuccess = step(callNext), onError = step(doThrow);
          function step(getNext) {
            return function(val) {
              var next = getNext(val), value = next.value;
              return next.done ? value : !value || typeof value.then !== "function" ? isArray2(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
            };
          }
          return step(callNext)();
        }
        function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
          var i = arguments.length;
          if (i < 2)
            throw new exceptions.InvalidArgument("Too few arguments");
          var args = new Array(i - 1);
          while (--i)
            args[i - 1] = arguments[i];
          scopeFunc = args.pop();
          var tables = flatten(args);
          return [mode, tables, scopeFunc];
        }
        function enterTransactionScope(db2, mode, storeNames, parentTransaction, scopeFunc) {
          return DexiePromise.resolve().then(function() {
            var transless = PSD.transless || PSD;
            var trans = db2._createTransaction(mode, storeNames, db2._dbSchema, parentTransaction);
            trans.explicit = true;
            var zoneProps = {
              trans,
              transless
            };
            if (parentTransaction) {
              trans.idbtrans = parentTransaction.idbtrans;
            } else {
              try {
                trans.create();
                trans.idbtrans._explicit = true;
                db2._state.PR1398_maxLoop = 3;
              } catch (ex) {
                if (ex.name === errnames.InvalidState && db2.isOpen() && --db2._state.PR1398_maxLoop > 0) {
                  console.warn("Dexie: Need to reopen db");
                  db2.close({ disableAutoOpen: false });
                  return db2.open().then(function() {
                    return enterTransactionScope(db2, mode, storeNames, null, scopeFunc);
                  });
                }
                return rejection(ex);
              }
            }
            var scopeFuncIsAsync = isAsyncFunction(scopeFunc);
            if (scopeFuncIsAsync) {
              incrementExpectedAwaits();
            }
            var returnValue;
            var promiseFollowed = DexiePromise.follow(function() {
              returnValue = scopeFunc.call(trans, trans);
              if (returnValue) {
                if (scopeFuncIsAsync) {
                  var decrementor = decrementExpectedAwaits.bind(null, null);
                  returnValue.then(decrementor, decrementor);
                } else if (typeof returnValue.next === "function" && typeof returnValue.throw === "function") {
                  returnValue = awaitIterator(returnValue);
                }
              }
            }, zoneProps);
            return (returnValue && typeof returnValue.then === "function" ? DexiePromise.resolve(returnValue).then(function(x) {
              return trans.active ? x : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
            }) : promiseFollowed.then(function() {
              return returnValue;
            })).then(function(x) {
              if (parentTransaction)
                trans._resolve();
              return trans._completion.then(function() {
                return x;
              });
            }).catch(function(e) {
              trans._reject(e);
              return rejection(e);
            });
          });
        }
        function pad(a, value, count) {
          var result2 = isArray2(a) ? a.slice() : [a];
          for (var i = 0; i < count; ++i)
            result2.push(value);
          return result2;
        }
        function createVirtualIndexMiddleware(down) {
          return __assign2(__assign2({}, down), { table: function(tableName) {
            var table = down.table(tableName);
            var schema = table.schema;
            var indexLookup = {};
            var allVirtualIndexes = [];
            function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
              var keyPathAlias = getKeyPathAlias(keyPath);
              var indexList = indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || [];
              var keyLength = keyPath == null ? 0 : typeof keyPath === "string" ? 1 : keyPath.length;
              var isVirtual = keyTail > 0;
              var virtualIndex = __assign2(__assign2({}, lowLevelIndex), { name: isVirtual ? "".concat(keyPathAlias, "(virtual-from:").concat(lowLevelIndex.name, ")") : lowLevelIndex.name, lowLevelIndex, isVirtual, keyTail, keyLength, extractKey: getKeyExtractor(keyPath), unique: !isVirtual && lowLevelIndex.unique });
              indexList.push(virtualIndex);
              if (!virtualIndex.isPrimaryKey) {
                allVirtualIndexes.push(virtualIndex);
              }
              if (keyLength > 1) {
                var virtualKeyPath = keyLength === 2 ? keyPath[0] : keyPath.slice(0, keyLength - 1);
                addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
              }
              indexList.sort(function(a, b) {
                return a.keyTail - b.keyTail;
              });
              return virtualIndex;
            }
            var primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
            indexLookup[":id"] = [primaryKey];
            for (var _i = 0, _a3 = schema.indexes; _i < _a3.length; _i++) {
              var index = _a3[_i];
              addVirtualIndexes(index.keyPath, 0, index);
            }
            function findBestIndex(keyPath) {
              var result3 = indexLookup[getKeyPathAlias(keyPath)];
              return result3 && result3[0];
            }
            function translateRange(range, keyTail) {
              return {
                type: range.type === 1 ? 2 : range.type,
                lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
                lowerOpen: true,
                upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
                upperOpen: true
              };
            }
            function translateRequest(req) {
              var index2 = req.query.index;
              return index2.isVirtual ? __assign2(__assign2({}, req), { query: {
                index: index2.lowLevelIndex,
                range: translateRange(req.query.range, index2.keyTail)
              } }) : req;
            }
            var result2 = __assign2(__assign2({}, table), { schema: __assign2(__assign2({}, schema), { primaryKey, indexes: allVirtualIndexes, getIndexByKeyPath: findBestIndex }), count: function(req) {
              return table.count(translateRequest(req));
            }, query: function(req) {
              return table.query(translateRequest(req));
            }, openCursor: function(req) {
              var _a4 = req.query.index, keyTail = _a4.keyTail, isVirtual = _a4.isVirtual, keyLength = _a4.keyLength;
              if (!isVirtual)
                return table.openCursor(req);
              function createVirtualCursor(cursor) {
                function _continue(key) {
                  key != null ? cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) : req.unique ? cursor.continue(cursor.key.slice(0, keyLength).concat(req.reverse ? down.MIN_KEY : down.MAX_KEY, keyTail)) : cursor.continue();
                }
                var virtualCursor = Object.create(cursor, {
                  continue: { value: _continue },
                  continuePrimaryKey: {
                    value: function(key, primaryKey2) {
                      cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey2);
                    }
                  },
                  primaryKey: {
                    get: function() {
                      return cursor.primaryKey;
                    }
                  },
                  key: {
                    get: function() {
                      var key = cursor.key;
                      return keyLength === 1 ? key[0] : key.slice(0, keyLength);
                    }
                  },
                  value: {
                    get: function() {
                      return cursor.value;
                    }
                  }
                });
                return virtualCursor;
              }
              return table.openCursor(translateRequest(req)).then(function(cursor) {
                return cursor && createVirtualCursor(cursor);
              });
            } });
            return result2;
          } });
        }
        var virtualIndexMiddleware = {
          stack: "dbcore",
          name: "VirtualIndexMiddleware",
          level: 1,
          create: createVirtualIndexMiddleware
        };
        function getObjectDiff(a, b, rv, prfx) {
          rv = rv || {};
          prfx = prfx || "";
          keys(a).forEach(function(prop) {
            if (!hasOwn2(b, prop)) {
              rv[prfx + prop] = void 0;
            } else {
              var ap = a[prop], bp = b[prop];
              if (typeof ap === "object" && typeof bp === "object" && ap && bp) {
                var apTypeName = toStringTag(ap);
                var bpTypeName = toStringTag(bp);
                if (apTypeName !== bpTypeName) {
                  rv[prfx + prop] = b[prop];
                } else if (apTypeName === "Object") {
                  getObjectDiff(ap, bp, rv, prfx + prop + ".");
                } else if (ap !== bp) {
                  rv[prfx + prop] = b[prop];
                }
              } else if (ap !== bp)
                rv[prfx + prop] = b[prop];
            }
          });
          keys(b).forEach(function(prop) {
            if (!hasOwn2(a, prop)) {
              rv[prfx + prop] = b[prop];
            }
          });
          return rv;
        }
        function getEffectiveKeys(primaryKey, req) {
          if (req.type === "delete")
            return req.keys;
          return req.keys || req.values.map(primaryKey.extractKey);
        }
        var hooksMiddleware = {
          stack: "dbcore",
          name: "HooksMiddleware",
          level: 2,
          create: function(downCore) {
            return __assign2(__assign2({}, downCore), { table: function(tableName) {
              var downTable = downCore.table(tableName);
              var primaryKey = downTable.schema.primaryKey;
              var tableMiddleware = __assign2(__assign2({}, downTable), { mutate: function(req) {
                var dxTrans = PSD.trans;
                var _a3 = dxTrans.table(tableName).hook, deleting = _a3.deleting, creating = _a3.creating, updating = _a3.updating;
                switch (req.type) {
                  case "add":
                    if (creating.fire === nop)
                      break;
                    return dxTrans._promise("readwrite", function() {
                      return addPutOrDelete(req);
                    }, true);
                  case "put":
                    if (creating.fire === nop && updating.fire === nop)
                      break;
                    return dxTrans._promise("readwrite", function() {
                      return addPutOrDelete(req);
                    }, true);
                  case "delete":
                    if (deleting.fire === nop)
                      break;
                    return dxTrans._promise("readwrite", function() {
                      return addPutOrDelete(req);
                    }, true);
                  case "deleteRange":
                    if (deleting.fire === nop)
                      break;
                    return dxTrans._promise("readwrite", function() {
                      return deleteRange(req);
                    }, true);
                }
                return downTable.mutate(req);
                function addPutOrDelete(req2) {
                  var dxTrans2 = PSD.trans;
                  var keys2 = req2.keys || getEffectiveKeys(primaryKey, req2);
                  if (!keys2)
                    throw new Error("Keys missing");
                  req2 = req2.type === "add" || req2.type === "put" ? __assign2(__assign2({}, req2), { keys: keys2 }) : __assign2({}, req2);
                  if (req2.type !== "delete")
                    req2.values = __spreadArray2([], req2.values, true);
                  if (req2.keys)
                    req2.keys = __spreadArray2([], req2.keys, true);
                  return getExistingValues(downTable, req2, keys2).then(function(existingValues) {
                    var contexts = keys2.map(function(key, i) {
                      var existingValue = existingValues[i];
                      var ctx = { onerror: null, onsuccess: null };
                      if (req2.type === "delete") {
                        deleting.fire.call(ctx, key, existingValue, dxTrans2);
                      } else if (req2.type === "add" || existingValue === void 0) {
                        var generatedPrimaryKey = creating.fire.call(ctx, key, req2.values[i], dxTrans2);
                        if (key == null && generatedPrimaryKey != null) {
                          key = generatedPrimaryKey;
                          req2.keys[i] = key;
                          if (!primaryKey.outbound) {
                            setByKeyPath(req2.values[i], primaryKey.keyPath, key);
                          }
                        }
                      } else {
                        var objectDiff = getObjectDiff(existingValue, req2.values[i]);
                        var additionalChanges_1 = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans2);
                        if (additionalChanges_1) {
                          var requestedValue_1 = req2.values[i];
                          Object.keys(additionalChanges_1).forEach(function(keyPath) {
                            if (hasOwn2(requestedValue_1, keyPath)) {
                              requestedValue_1[keyPath] = additionalChanges_1[keyPath];
                            } else {
                              setByKeyPath(requestedValue_1, keyPath, additionalChanges_1[keyPath]);
                            }
                          });
                        }
                      }
                      return ctx;
                    });
                    return downTable.mutate(req2).then(function(_a4) {
                      var failures = _a4.failures, results = _a4.results, numFailures = _a4.numFailures, lastResult = _a4.lastResult;
                      for (var i = 0; i < keys2.length; ++i) {
                        var primKey = results ? results[i] : keys2[i];
                        var ctx = contexts[i];
                        if (primKey == null) {
                          ctx.onerror && ctx.onerror(failures[i]);
                        } else {
                          ctx.onsuccess && ctx.onsuccess(
                            req2.type === "put" && existingValues[i] ? req2.values[i] : primKey
                          );
                        }
                      }
                      return { failures, results, numFailures, lastResult };
                    }).catch(function(error) {
                      contexts.forEach(function(ctx) {
                        return ctx.onerror && ctx.onerror(error);
                      });
                      return Promise.reject(error);
                    });
                  });
                }
                function deleteRange(req2) {
                  return deleteNextChunk(req2.trans, req2.range, 1e4);
                }
                function deleteNextChunk(trans, range, limit) {
                  return downTable.query({ trans, values: false, query: { index: primaryKey, range }, limit }).then(function(_a4) {
                    var result2 = _a4.result;
                    return addPutOrDelete({ type: "delete", keys: result2, trans }).then(function(res) {
                      if (res.numFailures > 0)
                        return Promise.reject(res.failures[0]);
                      if (result2.length < limit) {
                        return { failures: [], numFailures: 0, lastResult: void 0 };
                      } else {
                        return deleteNextChunk(trans, __assign2(__assign2({}, range), { lower: result2[result2.length - 1], lowerOpen: true }), limit);
                      }
                    });
                  });
                }
              } });
              return tableMiddleware;
            } });
          }
        };
        function getExistingValues(table, req, effectiveKeys) {
          return req.type === "add" ? Promise.resolve([]) : table.getMany({ trans: req.trans, keys: effectiveKeys, cache: "immutable" });
        }
        function getFromTransactionCache(keys2, cache2, clone) {
          try {
            if (!cache2)
              return null;
            if (cache2.keys.length < keys2.length)
              return null;
            var result2 = [];
            for (var i = 0, j = 0; i < cache2.keys.length && j < keys2.length; ++i) {
              if (cmp2(cache2.keys[i], keys2[j]) !== 0)
                continue;
              result2.push(clone ? deepClone(cache2.values[i]) : cache2.values[i]);
              ++j;
            }
            return result2.length === keys2.length ? result2 : null;
          } catch (_a3) {
            return null;
          }
        }
        var cacheExistingValuesMiddleware = {
          stack: "dbcore",
          level: -1,
          create: function(core) {
            return {
              table: function(tableName) {
                var table = core.table(tableName);
                return __assign2(__assign2({}, table), { getMany: function(req) {
                  if (!req.cache) {
                    return table.getMany(req);
                  }
                  var cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
                  if (cachedResult) {
                    return DexiePromise.resolve(cachedResult);
                  }
                  return table.getMany(req).then(function(res) {
                    req.trans["_cache"] = {
                      keys: req.keys,
                      values: req.cache === "clone" ? deepClone(res) : res
                    };
                    return res;
                  });
                }, mutate: function(req) {
                  if (req.type !== "add")
                    req.trans["_cache"] = null;
                  return table.mutate(req);
                } });
              }
            };
          }
        };
        function isCachableContext(ctx, table) {
          return ctx.trans.mode === "readonly" && !!ctx.subscr && !ctx.trans.explicit && ctx.trans.db._options.cache !== "disabled" && !table.schema.primaryKey.outbound;
        }
        function isCachableRequest(type2, req) {
          switch (type2) {
            case "query":
              return req.values && !req.unique;
            case "get":
              return false;
            case "getMany":
              return false;
            case "count":
              return false;
            case "openCursor":
              return false;
          }
        }
        var observabilityMiddleware = {
          stack: "dbcore",
          level: 0,
          name: "Observability",
          create: function(core) {
            var dbName = core.schema.name;
            var FULL_RANGE = new RangeSet2(core.MIN_KEY, core.MAX_KEY);
            return __assign2(__assign2({}, core), { transaction: function(stores, mode, options) {
              if (PSD.subscr && mode !== "readonly") {
                throw new exceptions.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(PSD.querier));
              }
              return core.transaction(stores, mode, options);
            }, table: function(tableName) {
              var table = core.table(tableName);
              var schema = table.schema;
              var primaryKey = schema.primaryKey, indexes = schema.indexes;
              var extractKey2 = primaryKey.extractKey, outbound = primaryKey.outbound;
              var indexesWithAutoIncPK = primaryKey.autoIncrement && indexes.filter(function(index) {
                return index.compound && index.keyPath.includes(primaryKey.keyPath);
              });
              var tableClone = __assign2(__assign2({}, table), { mutate: function(req) {
                var _a3, _b;
                var trans = req.trans;
                var mutatedParts = req.mutatedParts || (req.mutatedParts = {});
                var getRangeSet = function(indexName) {
                  var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                  return mutatedParts[part] || (mutatedParts[part] = new RangeSet2());
                };
                var pkRangeSet = getRangeSet("");
                var delsRangeSet = getRangeSet(":dels");
                var type2 = req.type;
                var _c = req.type === "deleteRange" ? [req.range] : req.type === "delete" ? [req.keys] : req.values.length < 50 ? [getEffectiveKeys(primaryKey, req).filter(function(id) {
                  return id;
                }), req.values] : [], keys2 = _c[0], newObjs = _c[1];
                var oldCache = req.trans["_cache"];
                if (isArray2(keys2)) {
                  pkRangeSet.addKeys(keys2);
                  var oldObjs = type2 === "delete" || keys2.length === newObjs.length ? getFromTransactionCache(keys2, oldCache) : null;
                  if (!oldObjs) {
                    delsRangeSet.addKeys(keys2);
                  }
                  if (oldObjs || newObjs) {
                    trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
                  }
                } else if (keys2) {
                  var range = {
                    from: (_a3 = keys2.lower) !== null && _a3 !== void 0 ? _a3 : core.MIN_KEY,
                    to: (_b = keys2.upper) !== null && _b !== void 0 ? _b : core.MAX_KEY
                  };
                  delsRangeSet.add(range);
                  pkRangeSet.add(range);
                } else {
                  pkRangeSet.add(FULL_RANGE);
                  delsRangeSet.add(FULL_RANGE);
                  schema.indexes.forEach(function(idx) {
                    return getRangeSet(idx.name).add(FULL_RANGE);
                  });
                }
                return table.mutate(req).then(function(res) {
                  if (keys2 && (req.type === "add" || req.type === "put")) {
                    pkRangeSet.addKeys(res.results);
                    if (indexesWithAutoIncPK) {
                      indexesWithAutoIncPK.forEach(function(idx) {
                        var idxVals = req.values.map(function(v) {
                          return idx.extractKey(v);
                        });
                        var pkPos = idx.keyPath.findIndex(function(prop) {
                          return prop === primaryKey.keyPath;
                        });
                        for (var i = 0, len = res.results.length; i < len; ++i) {
                          idxVals[i][pkPos] = res.results[i];
                        }
                        getRangeSet(idx.name).addKeys(idxVals);
                      });
                    }
                  }
                  trans.mutatedParts = extendObservabilitySet(trans.mutatedParts || {}, mutatedParts);
                  return res;
                });
              } });
              var getRange = function(_a3) {
                var _b, _c;
                var _d = _a3.query, index = _d.index, range = _d.range;
                return [
                  index,
                  new RangeSet2((_b = range.lower) !== null && _b !== void 0 ? _b : core.MIN_KEY, (_c = range.upper) !== null && _c !== void 0 ? _c : core.MAX_KEY)
                ];
              };
              var readSubscribers = {
                get: function(req) {
                  return [primaryKey, new RangeSet2(req.key)];
                },
                getMany: function(req) {
                  return [primaryKey, new RangeSet2().addKeys(req.keys)];
                },
                count: getRange,
                query: getRange,
                openCursor: getRange
              };
              keys(readSubscribers).forEach(function(method) {
                tableClone[method] = function(req) {
                  var subscr = PSD.subscr;
                  var isLiveQuery = !!subscr;
                  var cachable = isCachableContext(PSD, table) && isCachableRequest(method, req);
                  var obsSet = cachable ? req.obsSet = {} : subscr;
                  if (isLiveQuery) {
                    var getRangeSet = function(indexName) {
                      var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                      return obsSet[part] || (obsSet[part] = new RangeSet2());
                    };
                    var pkRangeSet_1 = getRangeSet("");
                    var delsRangeSet_1 = getRangeSet(":dels");
                    var _a3 = readSubscribers[method](req), queriedIndex = _a3[0], queriedRanges = _a3[1];
                    if (method === "query" && queriedIndex.isPrimaryKey && !req.values) {
                      delsRangeSet_1.add(queriedRanges);
                    } else {
                      getRangeSet(queriedIndex.name || "").add(queriedRanges);
                    }
                    if (!queriedIndex.isPrimaryKey) {
                      if (method === "count") {
                        delsRangeSet_1.add(FULL_RANGE);
                      } else {
                        var keysPromise_1 = method === "query" && outbound && req.values && table.query(__assign2(__assign2({}, req), { values: false }));
                        return table[method].apply(this, arguments).then(function(res) {
                          if (method === "query") {
                            if (outbound && req.values) {
                              return keysPromise_1.then(function(_a4) {
                                var resultingKeys = _a4.result;
                                pkRangeSet_1.addKeys(resultingKeys);
                                return res;
                              });
                            }
                            var pKeys = req.values ? res.result.map(extractKey2) : res.result;
                            if (req.values) {
                              pkRangeSet_1.addKeys(pKeys);
                            } else {
                              delsRangeSet_1.addKeys(pKeys);
                            }
                          } else if (method === "openCursor") {
                            var cursor_1 = res;
                            var wantValues_1 = req.values;
                            return cursor_1 && Object.create(cursor_1, {
                              key: {
                                get: function() {
                                  delsRangeSet_1.addKey(cursor_1.primaryKey);
                                  return cursor_1.key;
                                }
                              },
                              primaryKey: {
                                get: function() {
                                  var pkey = cursor_1.primaryKey;
                                  delsRangeSet_1.addKey(pkey);
                                  return pkey;
                                }
                              },
                              value: {
                                get: function() {
                                  wantValues_1 && pkRangeSet_1.addKey(cursor_1.primaryKey);
                                  return cursor_1.value;
                                }
                              }
                            });
                          }
                          return res;
                        });
                      }
                    }
                  }
                  return table[method].apply(this, arguments);
                };
              });
              return tableClone;
            } });
          }
        };
        function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
          function addAffectedIndex(ix) {
            var rangeSet = getRangeSet(ix.name || "");
            function extractKey2(obj) {
              return obj != null ? ix.extractKey(obj) : null;
            }
            var addKeyOrKeys = function(key) {
              return ix.multiEntry && isArray2(key) ? key.forEach(function(key2) {
                return rangeSet.addKey(key2);
              }) : rangeSet.addKey(key);
            };
            (oldObjs || newObjs).forEach(function(_, i) {
              var oldKey = oldObjs && extractKey2(oldObjs[i]);
              var newKey = newObjs && extractKey2(newObjs[i]);
              if (cmp2(oldKey, newKey) !== 0) {
                if (oldKey != null)
                  addKeyOrKeys(oldKey);
                if (newKey != null)
                  addKeyOrKeys(newKey);
              }
            });
          }
          schema.indexes.forEach(addAffectedIndex);
        }
        function adjustOptimisticFromFailures(tblCache, req, res) {
          if (res.numFailures === 0)
            return req;
          if (req.type === "deleteRange") {
            return null;
          }
          var numBulkOps = req.keys ? req.keys.length : "values" in req && req.values ? req.values.length : 1;
          if (res.numFailures === numBulkOps) {
            return null;
          }
          var clone = __assign2({}, req);
          if (isArray2(clone.keys)) {
            clone.keys = clone.keys.filter(function(_, i) {
              return !(i in res.failures);
            });
          }
          if ("values" in clone && isArray2(clone.values)) {
            clone.values = clone.values.filter(function(_, i) {
              return !(i in res.failures);
            });
          }
          return clone;
        }
        function isAboveLower(key, range) {
          return range.lower === void 0 ? true : range.lowerOpen ? cmp2(key, range.lower) > 0 : cmp2(key, range.lower) >= 0;
        }
        function isBelowUpper(key, range) {
          return range.upper === void 0 ? true : range.upperOpen ? cmp2(key, range.upper) < 0 : cmp2(key, range.upper) <= 0;
        }
        function isWithinRange(key, range) {
          return isAboveLower(key, range) && isBelowUpper(key, range);
        }
        function applyOptimisticOps(result2, req, ops, table, cacheEntry, immutable) {
          if (!ops || ops.length === 0)
            return result2;
          var index = req.query.index;
          var multiEntry = index.multiEntry;
          var queryRange = req.query.range;
          var primaryKey = table.schema.primaryKey;
          var extractPrimKey = primaryKey.extractKey;
          var extractIndex = index.extractKey;
          var extractLowLevelIndex = (index.lowLevelIndex || index).extractKey;
          var finalResult = ops.reduce(function(result3, op) {
            var modifedResult = result3;
            var includedValues = [];
            if (op.type === "add" || op.type === "put") {
              var includedPKs = new RangeSet2();
              for (var i = op.values.length - 1; i >= 0; --i) {
                var value = op.values[i];
                var pk = extractPrimKey(value);
                if (includedPKs.hasKey(pk))
                  continue;
                var key = extractIndex(value);
                if (multiEntry && isArray2(key) ? key.some(function(k) {
                  return isWithinRange(k, queryRange);
                }) : isWithinRange(key, queryRange)) {
                  includedPKs.addKey(pk);
                  includedValues.push(value);
                }
              }
            }
            switch (op.type) {
              case "add": {
                var existingKeys_1 = new RangeSet2().addKeys(req.values ? result3.map(function(v) {
                  return extractPrimKey(v);
                }) : result3);
                modifedResult = result3.concat(req.values ? includedValues.filter(function(v) {
                  var key2 = extractPrimKey(v);
                  if (existingKeys_1.hasKey(key2))
                    return false;
                  existingKeys_1.addKey(key2);
                  return true;
                }) : includedValues.map(function(v) {
                  return extractPrimKey(v);
                }).filter(function(k) {
                  if (existingKeys_1.hasKey(k))
                    return false;
                  existingKeys_1.addKey(k);
                  return true;
                }));
                break;
              }
              case "put": {
                var keySet_1 = new RangeSet2().addKeys(op.values.map(function(v) {
                  return extractPrimKey(v);
                }));
                modifedResult = result3.filter(
                  function(item) {
                    return !keySet_1.hasKey(req.values ? extractPrimKey(item) : item);
                  }
                ).concat(
                  req.values ? includedValues : includedValues.map(function(v) {
                    return extractPrimKey(v);
                  })
                );
                break;
              }
              case "delete":
                var keysToDelete_1 = new RangeSet2().addKeys(op.keys);
                modifedResult = result3.filter(function(item) {
                  return !keysToDelete_1.hasKey(req.values ? extractPrimKey(item) : item);
                });
                break;
              case "deleteRange":
                var range_1 = op.range;
                modifedResult = result3.filter(function(item) {
                  return !isWithinRange(extractPrimKey(item), range_1);
                });
                break;
            }
            return modifedResult;
          }, result2);
          if (finalResult === result2)
            return result2;
          finalResult.sort(function(a, b) {
            return cmp2(extractLowLevelIndex(a), extractLowLevelIndex(b)) || cmp2(extractPrimKey(a), extractPrimKey(b));
          });
          if (req.limit && req.limit < Infinity) {
            if (finalResult.length > req.limit) {
              finalResult.length = req.limit;
            } else if (result2.length === req.limit && finalResult.length < req.limit) {
              cacheEntry.dirty = true;
            }
          }
          return immutable ? Object.freeze(finalResult) : finalResult;
        }
        function areRangesEqual(r1, r2) {
          return cmp2(r1.lower, r2.lower) === 0 && cmp2(r1.upper, r2.upper) === 0 && !!r1.lowerOpen === !!r2.lowerOpen && !!r1.upperOpen === !!r2.upperOpen;
        }
        function compareLowers(lower1, lower2, lowerOpen1, lowerOpen2) {
          if (lower1 === void 0)
            return lower2 !== void 0 ? -1 : 0;
          if (lower2 === void 0)
            return 1;
          var c = cmp2(lower1, lower2);
          if (c === 0) {
            if (lowerOpen1 && lowerOpen2)
              return 0;
            if (lowerOpen1)
              return 1;
            if (lowerOpen2)
              return -1;
          }
          return c;
        }
        function compareUppers(upper1, upper2, upperOpen1, upperOpen2) {
          if (upper1 === void 0)
            return upper2 !== void 0 ? 1 : 0;
          if (upper2 === void 0)
            return -1;
          var c = cmp2(upper1, upper2);
          if (c === 0) {
            if (upperOpen1 && upperOpen2)
              return 0;
            if (upperOpen1)
              return -1;
            if (upperOpen2)
              return 1;
          }
          return c;
        }
        function isSuperRange(r1, r2) {
          return compareLowers(r1.lower, r2.lower, r1.lowerOpen, r2.lowerOpen) <= 0 && compareUppers(r1.upper, r2.upper, r1.upperOpen, r2.upperOpen) >= 0;
        }
        function findCompatibleQuery(dbName, tableName, type2, req) {
          var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
          if (!tblCache)
            return [];
          var queries = tblCache.queries[type2];
          if (!queries)
            return [null, false, tblCache, null];
          var indexName = req.query ? req.query.index.name : null;
          var entries = queries[indexName || ""];
          if (!entries)
            return [null, false, tblCache, null];
          switch (type2) {
            case "query":
              var equalEntry = entries.find(function(entry) {
                return entry.req.limit === req.limit && entry.req.values === req.values && areRangesEqual(entry.req.query.range, req.query.range);
              });
              if (equalEntry)
                return [
                  equalEntry,
                  true,
                  tblCache,
                  entries
                ];
              var superEntry = entries.find(function(entry) {
                var limit = "limit" in entry.req ? entry.req.limit : Infinity;
                return limit >= req.limit && (req.values ? entry.req.values : true) && isSuperRange(entry.req.query.range, req.query.range);
              });
              return [superEntry, false, tblCache, entries];
            case "count":
              var countQuery = entries.find(function(entry) {
                return areRangesEqual(entry.req.query.range, req.query.range);
              });
              return [countQuery, !!countQuery, tblCache, entries];
          }
        }
        function subscribeToCacheEntry(cacheEntry, container, requery, signal) {
          cacheEntry.subscribers.add(requery);
          signal.addEventListener("abort", function() {
            cacheEntry.subscribers.delete(requery);
            if (cacheEntry.subscribers.size === 0) {
              enqueForDeletion(cacheEntry, container);
            }
          });
        }
        function enqueForDeletion(cacheEntry, container) {
          setTimeout(function() {
            if (cacheEntry.subscribers.size === 0) {
              delArrayItem(container, cacheEntry);
            }
          }, 3e3);
        }
        var cacheMiddleware = {
          stack: "dbcore",
          level: 0,
          name: "Cache",
          create: function(core) {
            var dbName = core.schema.name;
            var coreMW = __assign2(__assign2({}, core), { transaction: function(stores, mode, options) {
              var idbtrans = core.transaction(stores, mode, options);
              if (mode === "readwrite") {
                var ac_1 = new AbortController();
                var signal = ac_1.signal;
                var endTransaction = function(wasCommitted) {
                  return function() {
                    ac_1.abort();
                    if (mode === "readwrite") {
                      var affectedSubscribers_1 = /* @__PURE__ */ new Set();
                      for (var _i = 0, stores_1 = stores; _i < stores_1.length; _i++) {
                        var storeName = stores_1[_i];
                        var tblCache = cache["idb://".concat(dbName, "/").concat(storeName)];
                        if (tblCache) {
                          var table = core.table(storeName);
                          var ops = tblCache.optimisticOps.filter(function(op) {
                            return op.trans === idbtrans;
                          });
                          if (idbtrans._explicit && wasCommitted && idbtrans.mutatedParts) {
                            for (var _a3 = 0, _b = Object.values(tblCache.queries.query); _a3 < _b.length; _a3++) {
                              var entries = _b[_a3];
                              for (var _c = 0, _d = entries.slice(); _c < _d.length; _c++) {
                                var entry = _d[_c];
                                if (obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)) {
                                  delArrayItem(entries, entry);
                                  entry.subscribers.forEach(function(requery) {
                                    return affectedSubscribers_1.add(requery);
                                  });
                                }
                              }
                            }
                          } else if (ops.length > 0) {
                            tblCache.optimisticOps = tblCache.optimisticOps.filter(function(op) {
                              return op.trans !== idbtrans;
                            });
                            for (var _e = 0, _f = Object.values(tblCache.queries.query); _e < _f.length; _e++) {
                              var entries = _f[_e];
                              for (var _g = 0, _h = entries.slice(); _g < _h.length; _g++) {
                                var entry = _h[_g];
                                if (entry.res != null && idbtrans.mutatedParts) {
                                  if (wasCommitted && !entry.dirty) {
                                    var freezeResults = Object.isFrozen(entry.res);
                                    var modRes = applyOptimisticOps(entry.res, entry.req, ops, table, entry, freezeResults);
                                    if (entry.dirty) {
                                      delArrayItem(entries, entry);
                                      entry.subscribers.forEach(function(requery) {
                                        return affectedSubscribers_1.add(requery);
                                      });
                                    } else if (modRes !== entry.res) {
                                      entry.res = modRes;
                                      entry.promise = DexiePromise.resolve({ result: modRes });
                                    }
                                  } else {
                                    if (entry.dirty) {
                                      delArrayItem(entries, entry);
                                    }
                                    entry.subscribers.forEach(function(requery) {
                                      return affectedSubscribers_1.add(requery);
                                    });
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                      affectedSubscribers_1.forEach(function(requery) {
                        return requery();
                      });
                    }
                  };
                };
                idbtrans.addEventListener("abort", endTransaction(false), {
                  signal
                });
                idbtrans.addEventListener("error", endTransaction(false), {
                  signal
                });
                idbtrans.addEventListener("complete", endTransaction(true), {
                  signal
                });
              }
              return idbtrans;
            }, table: function(tableName) {
              var downTable = core.table(tableName);
              var primKey = downTable.schema.primaryKey;
              var tableMW = __assign2(__assign2({}, downTable), { mutate: function(req) {
                var trans = PSD.trans;
                if (primKey.outbound || trans.db._options.cache === "disabled" || trans.explicit || trans.idbtrans.mode !== "readwrite") {
                  return downTable.mutate(req);
                }
                var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
                if (!tblCache)
                  return downTable.mutate(req);
                var promise = downTable.mutate(req);
                if ((req.type === "add" || req.type === "put") && (req.values.length >= 50 || getEffectiveKeys(primKey, req).some(function(key) {
                  return key == null;
                }))) {
                  promise.then(function(res) {
                    var reqWithResolvedKeys = __assign2(__assign2({}, req), { values: req.values.map(function(value, i) {
                      var _a3;
                      if (res.failures[i])
                        return value;
                      var valueWithKey = ((_a3 = primKey.keyPath) === null || _a3 === void 0 ? void 0 : _a3.includes(".")) ? deepClone(value) : __assign2({}, value);
                      setByKeyPath(valueWithKey, primKey.keyPath, res.results[i]);
                      return valueWithKey;
                    }) });
                    var adjustedReq = adjustOptimisticFromFailures(tblCache, reqWithResolvedKeys, res);
                    tblCache.optimisticOps.push(adjustedReq);
                    queueMicrotask(function() {
                      return req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                    });
                  });
                } else {
                  tblCache.optimisticOps.push(req);
                  req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                  promise.then(function(res) {
                    if (res.numFailures > 0) {
                      delArrayItem(tblCache.optimisticOps, req);
                      var adjustedReq = adjustOptimisticFromFailures(tblCache, req, res);
                      if (adjustedReq) {
                        tblCache.optimisticOps.push(adjustedReq);
                      }
                      req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                    }
                  });
                  promise.catch(function() {
                    delArrayItem(tblCache.optimisticOps, req);
                    req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                  });
                }
                return promise;
              }, query: function(req) {
                var _a3;
                if (!isCachableContext(PSD, downTable) || !isCachableRequest("query", req))
                  return downTable.query(req);
                var freezeResults = ((_a3 = PSD.trans) === null || _a3 === void 0 ? void 0 : _a3.db._options.cache) === "immutable";
                var _b = PSD, requery = _b.requery, signal = _b.signal;
                var _c = findCompatibleQuery(dbName, tableName, "query", req), cacheEntry = _c[0], exactMatch = _c[1], tblCache = _c[2], container = _c[3];
                if (cacheEntry && exactMatch) {
                  cacheEntry.obsSet = req.obsSet;
                } else {
                  var promise = downTable.query(req).then(function(res) {
                    var result2 = res.result;
                    if (cacheEntry)
                      cacheEntry.res = result2;
                    if (freezeResults) {
                      for (var i = 0, l = result2.length; i < l; ++i) {
                        Object.freeze(result2[i]);
                      }
                      Object.freeze(result2);
                    } else {
                      res.result = deepClone(result2);
                    }
                    return res;
                  }).catch(function(error) {
                    if (container && cacheEntry)
                      delArrayItem(container, cacheEntry);
                    return Promise.reject(error);
                  });
                  cacheEntry = {
                    obsSet: req.obsSet,
                    promise,
                    subscribers: /* @__PURE__ */ new Set(),
                    type: "query",
                    req,
                    dirty: false
                  };
                  if (container) {
                    container.push(cacheEntry);
                  } else {
                    container = [cacheEntry];
                    if (!tblCache) {
                      tblCache = cache["idb://".concat(dbName, "/").concat(tableName)] = {
                        queries: {
                          query: {},
                          count: {}
                        },
                        objs: /* @__PURE__ */ new Map(),
                        optimisticOps: [],
                        unsignaledParts: {}
                      };
                    }
                    tblCache.queries.query[req.query.index.name || ""] = container;
                  }
                }
                subscribeToCacheEntry(cacheEntry, container, requery, signal);
                return cacheEntry.promise.then(function(res) {
                  return {
                    result: applyOptimisticOps(res.result, req, tblCache === null || tblCache === void 0 ? void 0 : tblCache.optimisticOps, downTable, cacheEntry, freezeResults)
                  };
                });
              } });
              return tableMW;
            } });
            return coreMW;
          }
        };
        function vipify(target, vipDb) {
          return new Proxy(target, {
            get: function(target2, prop, receiver) {
              if (prop === "db")
                return vipDb;
              return Reflect.get(target2, prop, receiver);
            }
          });
        }
        var Dexie$1 = (function() {
          function Dexie3(name, options) {
            var _this = this;
            this._middlewares = {};
            this.verno = 0;
            var deps = Dexie3.dependencies;
            this._options = options = __assign2({
              addons: Dexie3.addons,
              autoOpen: true,
              indexedDB: deps.indexedDB,
              IDBKeyRange: deps.IDBKeyRange,
              cache: "cloned"
            }, options);
            this._deps = {
              indexedDB: options.indexedDB,
              IDBKeyRange: options.IDBKeyRange
            };
            var addons = options.addons;
            this._dbSchema = {};
            this._versions = [];
            this._storeNames = [];
            this._allTables = {};
            this.idbdb = null;
            this._novip = this;
            var state = {
              dbOpenError: null,
              isBeingOpened: false,
              onReadyBeingFired: null,
              openComplete: false,
              dbReadyResolve: nop,
              dbReadyPromise: null,
              cancelOpen: nop,
              openCanceller: null,
              autoSchema: true,
              PR1398_maxLoop: 3,
              autoOpen: options.autoOpen
            };
            state.dbReadyPromise = new DexiePromise(function(resolve) {
              state.dbReadyResolve = resolve;
            });
            state.openCanceller = new DexiePromise(function(_, reject) {
              state.cancelOpen = reject;
            });
            this._state = state;
            this.name = name;
            this.on = Events(this, "populate", "blocked", "versionchange", "close", { ready: [promisableChain, nop] });
            this.on.ready.subscribe = override(this.on.ready.subscribe, function(subscribe) {
              return function(subscriber, bSticky) {
                Dexie3.vip(function() {
                  var state2 = _this._state;
                  if (state2.openComplete) {
                    if (!state2.dbOpenError)
                      DexiePromise.resolve().then(subscriber);
                    if (bSticky)
                      subscribe(subscriber);
                  } else if (state2.onReadyBeingFired) {
                    state2.onReadyBeingFired.push(subscriber);
                    if (bSticky)
                      subscribe(subscriber);
                  } else {
                    subscribe(subscriber);
                    var db_1 = _this;
                    if (!bSticky)
                      subscribe(function unsubscribe() {
                        db_1.on.ready.unsubscribe(subscriber);
                        db_1.on.ready.unsubscribe(unsubscribe);
                      });
                  }
                });
              };
            });
            this.Collection = createCollectionConstructor(this);
            this.Table = createTableConstructor(this);
            this.Transaction = createTransactionConstructor(this);
            this.Version = createVersionConstructor(this);
            this.WhereClause = createWhereClauseConstructor(this);
            this.on("versionchange", function(ev) {
              if (ev.newVersion > 0)
                console.warn("Another connection wants to upgrade database '".concat(_this.name, "'. Closing db now to resume the upgrade."));
              else
                console.warn("Another connection wants to delete database '".concat(_this.name, "'. Closing db now to resume the delete request."));
              _this.close({ disableAutoOpen: false });
            });
            this.on("blocked", function(ev) {
              if (!ev.newVersion || ev.newVersion < ev.oldVersion)
                console.warn("Dexie.delete('".concat(_this.name, "') was blocked"));
              else
                console.warn("Upgrade '".concat(_this.name, "' blocked by other connection holding version ").concat(ev.oldVersion / 10));
            });
            this._maxKey = getMaxKey(options.IDBKeyRange);
            this._createTransaction = function(mode, storeNames, dbschema, parentTransaction) {
              return new _this.Transaction(mode, storeNames, dbschema, _this._options.chromeTransactionDurability, parentTransaction);
            };
            this._fireOnBlocked = function(ev) {
              _this.on("blocked").fire(ev);
              connections.filter(function(c) {
                return c.name === _this.name && c !== _this && !c._state.vcFired;
              }).map(function(c) {
                return c.on("versionchange").fire(ev);
              });
            };
            this.use(cacheExistingValuesMiddleware);
            this.use(cacheMiddleware);
            this.use(observabilityMiddleware);
            this.use(virtualIndexMiddleware);
            this.use(hooksMiddleware);
            var vipDB = new Proxy(this, {
              get: function(_, prop, receiver) {
                if (prop === "_vip")
                  return true;
                if (prop === "table")
                  return function(tableName) {
                    return vipify(_this.table(tableName), vipDB);
                  };
                var rv = Reflect.get(_, prop, receiver);
                if (rv instanceof Table)
                  return vipify(rv, vipDB);
                if (prop === "tables")
                  return rv.map(function(t) {
                    return vipify(t, vipDB);
                  });
                if (prop === "_createTransaction")
                  return function() {
                    var tx = rv.apply(this, arguments);
                    return vipify(tx, vipDB);
                  };
                return rv;
              }
            });
            this.vip = vipDB;
            addons.forEach(function(addon) {
              return addon(_this);
            });
          }
          Dexie3.prototype.version = function(versionNumber) {
            if (isNaN(versionNumber) || versionNumber < 0.1)
              throw new exceptions.Type("Given version is not a positive number");
            versionNumber = Math.round(versionNumber * 10) / 10;
            if (this.idbdb || this._state.isBeingOpened)
              throw new exceptions.Schema("Cannot add version when database is open");
            this.verno = Math.max(this.verno, versionNumber);
            var versions = this._versions;
            var versionInstance = versions.filter(function(v) {
              return v._cfg.version === versionNumber;
            })[0];
            if (versionInstance)
              return versionInstance;
            versionInstance = new this.Version(versionNumber);
            versions.push(versionInstance);
            versions.sort(lowerVersionFirst);
            versionInstance.stores({});
            this._state.autoSchema = false;
            return versionInstance;
          };
          Dexie3.prototype._whenReady = function(fn) {
            var _this = this;
            return this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip) ? fn() : new DexiePromise(function(resolve, reject) {
              if (_this._state.openComplete) {
                return reject(new exceptions.DatabaseClosed(_this._state.dbOpenError));
              }
              if (!_this._state.isBeingOpened) {
                if (!_this._state.autoOpen) {
                  reject(new exceptions.DatabaseClosed());
                  return;
                }
                _this.open().catch(nop);
              }
              _this._state.dbReadyPromise.then(resolve, reject);
            }).then(fn);
          };
          Dexie3.prototype.use = function(_a3) {
            var stack = _a3.stack, create = _a3.create, level = _a3.level, name = _a3.name;
            if (name)
              this.unuse({ stack, name });
            var middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
            middlewares.push({ stack, create, level: level == null ? 10 : level, name });
            middlewares.sort(function(a, b) {
              return a.level - b.level;
            });
            return this;
          };
          Dexie3.prototype.unuse = function(_a3) {
            var stack = _a3.stack, name = _a3.name, create = _a3.create;
            if (stack && this._middlewares[stack]) {
              this._middlewares[stack] = this._middlewares[stack].filter(function(mw) {
                return create ? mw.create !== create : name ? mw.name !== name : false;
              });
            }
            return this;
          };
          Dexie3.prototype.open = function() {
            var _this = this;
            return usePSD(
              globalPSD,
              function() {
                return dexieOpen(_this);
              }
            );
          };
          Dexie3.prototype._close = function() {
            var state = this._state;
            var idx = connections.indexOf(this);
            if (idx >= 0)
              connections.splice(idx, 1);
            if (this.idbdb) {
              try {
                this.idbdb.close();
              } catch (e) {
              }
              this.idbdb = null;
            }
            if (!state.isBeingOpened) {
              state.dbReadyPromise = new DexiePromise(function(resolve) {
                state.dbReadyResolve = resolve;
              });
              state.openCanceller = new DexiePromise(function(_, reject) {
                state.cancelOpen = reject;
              });
            }
          };
          Dexie3.prototype.close = function(_a3) {
            var _b = _a3 === void 0 ? { disableAutoOpen: true } : _a3, disableAutoOpen = _b.disableAutoOpen;
            var state = this._state;
            if (disableAutoOpen) {
              if (state.isBeingOpened) {
                state.cancelOpen(new exceptions.DatabaseClosed());
              }
              this._close();
              state.autoOpen = false;
              state.dbOpenError = new exceptions.DatabaseClosed();
            } else {
              this._close();
              state.autoOpen = this._options.autoOpen || state.isBeingOpened;
              state.openComplete = false;
              state.dbOpenError = null;
            }
          };
          Dexie3.prototype.delete = function(closeOptions) {
            var _this = this;
            if (closeOptions === void 0) {
              closeOptions = { disableAutoOpen: true };
            }
            var hasInvalidArguments = arguments.length > 0 && typeof arguments[0] !== "object";
            var state = this._state;
            return new DexiePromise(function(resolve, reject) {
              var doDelete = function() {
                _this.close(closeOptions);
                var req = _this._deps.indexedDB.deleteDatabase(_this.name);
                req.onsuccess = wrap4(function() {
                  _onDatabaseDeleted(_this._deps, _this.name);
                  resolve();
                });
                req.onerror = eventRejectHandler(reject);
                req.onblocked = _this._fireOnBlocked;
              };
              if (hasInvalidArguments)
                throw new exceptions.InvalidArgument("Invalid closeOptions argument to db.delete()");
              if (state.isBeingOpened) {
                state.dbReadyPromise.then(doDelete);
              } else {
                doDelete();
              }
            });
          };
          Dexie3.prototype.backendDB = function() {
            return this.idbdb;
          };
          Dexie3.prototype.isOpen = function() {
            return this.idbdb !== null;
          };
          Dexie3.prototype.hasBeenClosed = function() {
            var dbOpenError = this._state.dbOpenError;
            return dbOpenError && dbOpenError.name === "DatabaseClosed";
          };
          Dexie3.prototype.hasFailed = function() {
            return this._state.dbOpenError !== null;
          };
          Dexie3.prototype.dynamicallyOpened = function() {
            return this._state.autoSchema;
          };
          Object.defineProperty(Dexie3.prototype, "tables", {
            get: function() {
              var _this = this;
              return keys(this._allTables).map(function(name) {
                return _this._allTables[name];
              });
            },
            enumerable: false,
            configurable: true
          });
          Dexie3.prototype.transaction = function() {
            var args = extractTransactionArgs.apply(this, arguments);
            return this._transaction.apply(this, args);
          };
          Dexie3.prototype._transaction = function(mode, tables, scopeFunc) {
            var _this = this;
            var parentTransaction = PSD.trans;
            if (!parentTransaction || parentTransaction.db !== this || mode.indexOf("!") !== -1)
              parentTransaction = null;
            var onlyIfCompatible = mode.indexOf("?") !== -1;
            mode = mode.replace("!", "").replace("?", "");
            var idbMode, storeNames;
            try {
              storeNames = tables.map(function(table) {
                var storeName = table instanceof _this.Table ? table.name : table;
                if (typeof storeName !== "string")
                  throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                return storeName;
              });
              if (mode == "r" || mode === READONLY)
                idbMode = READONLY;
              else if (mode == "rw" || mode == READWRITE)
                idbMode = READWRITE;
              else
                throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
              if (parentTransaction) {
                if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                  if (onlyIfCompatible) {
                    parentTransaction = null;
                  } else
                    throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                }
                if (parentTransaction) {
                  storeNames.forEach(function(storeName) {
                    if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                      if (onlyIfCompatible) {
                        parentTransaction = null;
                      } else
                        throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
                    }
                  });
                }
                if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                  parentTransaction = null;
                }
              }
            } catch (e) {
              return parentTransaction ? parentTransaction._promise(null, function(_, reject) {
                reject(e);
              }) : rejection(e);
            }
            var enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
            return parentTransaction ? parentTransaction._promise(idbMode, enterTransaction, "lock") : PSD.trans ? usePSD(PSD.transless, function() {
              return _this._whenReady(enterTransaction);
            }) : this._whenReady(enterTransaction);
          };
          Dexie3.prototype.table = function(tableName) {
            if (!hasOwn2(this._allTables, tableName)) {
              throw new exceptions.InvalidTable("Table ".concat(tableName, " does not exist"));
            }
            return this._allTables[tableName];
          };
          return Dexie3;
        })();
        var symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol ? Symbol.observable : "@@observable";
        var Observable2 = (function() {
          function Observable3(subscribe) {
            this._subscribe = subscribe;
          }
          Observable3.prototype.subscribe = function(x, error, complete) {
            return this._subscribe(!x || typeof x === "function" ? { next: x, error, complete } : x);
          };
          Observable3.prototype[symbolObservable] = function() {
            return this;
          };
          return Observable3;
        })();
        var domDeps;
        try {
          domDeps = {
            indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
            IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
          };
        } catch (e) {
          domDeps = { indexedDB: null, IDBKeyRange: null };
        }
        function liveQuery2(querier) {
          var hasValue = false;
          var currentValue;
          var observable = new Observable2(function(observer) {
            var scopeFuncIsAsync = isAsyncFunction(querier);
            function execute2(ctx) {
              var wasRootExec = beginMicroTickScope();
              try {
                if (scopeFuncIsAsync) {
                  incrementExpectedAwaits();
                }
                var rv = newScope(querier, ctx);
                if (scopeFuncIsAsync) {
                  rv = rv.finally(decrementExpectedAwaits);
                }
                return rv;
              } finally {
                wasRootExec && endMicroTickScope();
              }
            }
            var closed = false;
            var abortController;
            var accumMuts = {};
            var currentObs = {};
            var subscription = {
              get closed() {
                return closed;
              },
              unsubscribe: function() {
                if (closed)
                  return;
                closed = true;
                if (abortController)
                  abortController.abort();
                if (startedListening)
                  globalEvents.storagemutated.unsubscribe(mutationListener);
              }
            };
            observer.start && observer.start(subscription);
            var startedListening = false;
            var doQuery = function() {
              return execInGlobalContext(_doQuery);
            };
            function shouldNotify() {
              return obsSetsOverlap(currentObs, accumMuts);
            }
            var mutationListener = function(parts) {
              extendObservabilitySet(accumMuts, parts);
              if (shouldNotify()) {
                doQuery();
              }
            };
            var _doQuery = function() {
              if (closed || !domDeps.indexedDB) {
                return;
              }
              accumMuts = {};
              var subscr = {};
              if (abortController)
                abortController.abort();
              abortController = new AbortController();
              var ctx = {
                subscr,
                signal: abortController.signal,
                requery: doQuery,
                querier,
                trans: null
              };
              var ret = execute2(ctx);
              Promise.resolve(ret).then(function(result2) {
                hasValue = true;
                currentValue = result2;
                if (closed || ctx.signal.aborted) {
                  return;
                }
                accumMuts = {};
                currentObs = subscr;
                if (!objectIsEmpty(currentObs) && !startedListening) {
                  globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
                  startedListening = true;
                }
                execInGlobalContext(function() {
                  return !closed && observer.next && observer.next(result2);
                });
              }, function(err) {
                hasValue = false;
                if (!["DatabaseClosedError", "AbortError"].includes(err === null || err === void 0 ? void 0 : err.name)) {
                  if (!closed)
                    execInGlobalContext(function() {
                      if (closed)
                        return;
                      observer.error && observer.error(err);
                    });
                }
              });
            };
            setTimeout(doQuery, 0);
            return subscription;
          });
          observable.hasValue = function() {
            return hasValue;
          };
          observable.getValue = function() {
            return currentValue;
          };
          return observable;
        }
        var Dexie2 = Dexie$1;
        props(Dexie2, __assign2(__assign2({}, fullNameExceptions), {
          delete: function(databaseName) {
            var db2 = new Dexie2(databaseName, { addons: [] });
            return db2.delete();
          },
          exists: function(name) {
            return new Dexie2(name, { addons: [] }).open().then(function(db2) {
              db2.close();
              return true;
            }).catch("NoSuchDatabaseError", function() {
              return false;
            });
          },
          getDatabaseNames: function(cb) {
            try {
              return getDatabaseNames(Dexie2.dependencies).then(cb);
            } catch (_a3) {
              return rejection(new exceptions.MissingAPI());
            }
          },
          defineClass: function() {
            function Class(content) {
              extend(this, content);
            }
            return Class;
          },
          ignoreTransaction: function(scopeFunc) {
            return PSD.trans ? usePSD(PSD.transless, scopeFunc) : scopeFunc();
          },
          vip,
          async: function(generatorFn) {
            return function() {
              try {
                var rv = awaitIterator(generatorFn.apply(this, arguments));
                if (!rv || typeof rv.then !== "function")
                  return DexiePromise.resolve(rv);
                return rv;
              } catch (e) {
                return rejection(e);
              }
            };
          },
          spawn: function(generatorFn, args, thiz) {
            try {
              var rv = awaitIterator(generatorFn.apply(thiz, args || []));
              if (!rv || typeof rv.then !== "function")
                return DexiePromise.resolve(rv);
              return rv;
            } catch (e) {
              return rejection(e);
            }
          },
          currentTransaction: {
            get: function() {
              return PSD.trans || null;
            }
          },
          waitFor: function(promiseOrFunction, optionalTimeout) {
            var promise = DexiePromise.resolve(typeof promiseOrFunction === "function" ? Dexie2.ignoreTransaction(promiseOrFunction) : promiseOrFunction).timeout(optionalTimeout || 6e4);
            return PSD.trans ? PSD.trans.waitFor(promise) : promise;
          },
          Promise: DexiePromise,
          debug: {
            get: function() {
              return debug;
            },
            set: function(value) {
              setDebug(value);
            }
          },
          derive,
          extend,
          props,
          override,
          Events,
          on: globalEvents,
          liveQuery: liveQuery2,
          extendObservabilitySet,
          getByKeyPath,
          setByKeyPath,
          delByKeyPath,
          shallowClone,
          deepClone,
          getObjectDiff,
          cmp: cmp2,
          asap: asap$1,
          minKey,
          addons: [],
          connections,
          errnames,
          dependencies: domDeps,
          cache,
          semVer: DEXIE_VERSION,
          version: DEXIE_VERSION.split(".").map(function(n) {
            return parseInt(n);
          }).reduce(function(p, c, i) {
            return p + c / Math.pow(10, i * 2);
          })
        }));
        Dexie2.maxKey = getMaxKey(Dexie2.dependencies.IDBKeyRange);
        if (typeof dispatchEvent !== "undefined" && typeof addEventListener !== "undefined") {
          globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(updatedParts) {
            if (!propagatingLocally) {
              var event_1;
              event_1 = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
                detail: updatedParts
              });
              propagatingLocally = true;
              dispatchEvent(event_1);
              propagatingLocally = false;
            }
          });
          addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, function(_a3) {
            var detail = _a3.detail;
            if (!propagatingLocally) {
              propagateLocally(detail);
            }
          });
        }
        function propagateLocally(updateParts) {
          var wasMe = propagatingLocally;
          try {
            propagatingLocally = true;
            globalEvents.storagemutated.fire(updateParts);
            signalSubscribersNow(updateParts, true);
          } finally {
            propagatingLocally = wasMe;
          }
        }
        var propagatingLocally = false;
        var bc;
        var createBC = function() {
        };
        if (typeof BroadcastChannel !== "undefined") {
          createBC = function() {
            bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
            bc.onmessage = function(ev) {
              return ev.data && propagateLocally(ev.data);
            };
          };
          createBC();
          if (typeof bc.unref === "function") {
            bc.unref();
          }
          globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(changedParts) {
            if (!propagatingLocally) {
              bc.postMessage(changedParts);
            }
          });
        }
        if (typeof addEventListener !== "undefined") {
          addEventListener("pagehide", function(event) {
            if (!Dexie$1.disableBfCache && event.persisted) {
              if (debug)
                console.debug("Dexie: handling persisted pagehide");
              bc === null || bc === void 0 ? void 0 : bc.close();
              for (var _i = 0, connections_1 = connections; _i < connections_1.length; _i++) {
                var db2 = connections_1[_i];
                db2.close({ disableAutoOpen: false });
              }
            }
          });
          addEventListener("pageshow", function(event) {
            if (!Dexie$1.disableBfCache && event.persisted) {
              if (debug)
                console.debug("Dexie: handling persisted pageshow");
              createBC();
              propagateLocally({ all: new RangeSet2(-Infinity, [[]]) });
            }
          });
        }
        function add2(value) {
          return new PropModification2({ add: value });
        }
        function remove2(value) {
          return new PropModification2({ remove: value });
        }
        function replacePrefix2(a, b) {
          return new PropModification2({ replacePrefix: [a, b] });
        }
        DexiePromise.rejectionMapper = mapError;
        setDebug(debug);
        var namedExports = /* @__PURE__ */ Object.freeze({
          __proto__: null,
          Dexie: Dexie$1,
          liveQuery: liveQuery2,
          Entity: Entity2,
          cmp: cmp2,
          PropModification: PropModification2,
          replacePrefix: replacePrefix2,
          add: add2,
          remove: remove2,
          "default": Dexie$1,
          RangeSet: RangeSet2,
          mergeRanges: mergeRanges2,
          rangesOverlap: rangesOverlap2
        });
        __assign2(Dexie$1, namedExports, { default: Dexie$1 });
        return Dexie$1;
      }));
    }
  });

  // node_modules/dexie/import-wrapper.mjs
  var import_dexie = __toESM(require_dexie(), 1);
  var DexieSymbol = Symbol.for("Dexie");
  var Dexie = globalThis[DexieSymbol] || (globalThis[DexieSymbol] = import_dexie.default);
  if (import_dexie.default.semVer !== Dexie.semVer) {
    throw new Error(`Two different versions of Dexie loaded in the same app: ${import_dexie.default.semVer} and ${Dexie.semVer}`);
  }
  var {
    liveQuery,
    mergeRanges,
    rangesOverlap,
    RangeSet,
    cmp,
    Entity,
    PropModification,
    replacePrefix,
    add,
    remove
  } = Dexie;
  var import_wrapper_default = Dexie;

  // src/utils/dexieDB.js
  var db = new import_wrapper_default("AtlasXrayDB");
  db.version(3).stores({
    projects: "projectKey",
    // one row per project
    updates: "updateId, projectKey, updatedAt, [projectKey+updatedAt]",
    // one row per update, with indexes
    views: "projectKey",
    // cached per-project computed views
    meta: "key"
    // sync info, feature flags, schema version
  });
  async function setProject(projectKey, data) {
    await db.projects.put({ projectKey, ...data });
  }
  async function setMeta(key, value) {
    await db.meta.put({ key, value });
  }
  async function getMeta(key) {
    const entry = await db.meta.get(key);
    return entry ? entry.value : null;
  }
  async function setItem(key, value) {
    await setMeta(key, value);
  }
  async function getItem(key) {
    return getMeta(key);
  }

  // node_modules/tslib/tslib.es6.mjs
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var __assign = function() {
    __assign = Object.assign || function __assign2(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  }
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result2) {
        result2.done ? resolve(result2.value) : adopt(result2.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1) throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  }

  // node_modules/ts-invariant/lib/invariant.js
  var genericMessage = "Invariant Violation";
  var _a = Object.setPrototypeOf;
  var setPrototypeOf = _a === void 0 ? function(obj, proto) {
    obj.__proto__ = proto;
    return obj;
  } : _a;
  var InvariantError = (
    /** @class */
    (function(_super) {
      __extends(InvariantError2, _super);
      function InvariantError2(message) {
        if (message === void 0) {
          message = genericMessage;
        }
        var _this = _super.call(this, typeof message === "number" ? genericMessage + ": " + message + " (see https://github.com/apollographql/invariant-packages)" : message) || this;
        _this.framesToPop = 1;
        _this.name = genericMessage;
        setPrototypeOf(_this, InvariantError2.prototype);
        return _this;
      }
      return InvariantError2;
    })(Error)
  );
  function invariant(condition, message) {
    if (!condition) {
      throw new InvariantError(message);
    }
  }
  var verbosityLevels = ["debug", "log", "warn", "error", "silent"];
  var verbosityLevel = verbosityLevels.indexOf("log");
  function wrapConsoleMethod(name) {
    return function() {
      if (verbosityLevels.indexOf(name) >= verbosityLevel) {
        var method = console[name] || console.log;
        return method.apply(console, arguments);
      }
    };
  }
  (function(invariant5) {
    invariant5.debug = wrapConsoleMethod("debug");
    invariant5.log = wrapConsoleMethod("log");
    invariant5.warn = wrapConsoleMethod("warn");
    invariant5.error = wrapConsoleMethod("error");
  })(invariant || (invariant = {}));
  function setVerbosity(level) {
    var old = verbosityLevels[verbosityLevel];
    verbosityLevel = Math.max(0, verbosityLevels.indexOf(level));
    return old;
  }

  // node_modules/@apollo/client/version.js
  var version = "3.13.9";

  // node_modules/@apollo/client/utilities/globals/maybe.js
  function maybe(thunk) {
    try {
      return thunk();
    } catch (_a2) {
    }
  }

  // node_modules/@apollo/client/utilities/globals/global.js
  var global_default = maybe(function() {
    return globalThis;
  }) || maybe(function() {
    return window;
  }) || maybe(function() {
    return self;
  }) || maybe(function() {
    return global;
  }) || // We don't expect the Function constructor ever to be invoked at runtime, as
  // long as at least one of globalThis, window, self, or global is defined, so
  // we are under no obligation to make it easy for static analysis tools to
  // detect syntactic usage of the Function constructor. If you think you can
  // improve your static analysis to detect this obfuscation, think again. This
  // is an arms race you cannot win, at least not in JavaScript.
  maybe(function() {
    return maybe.constructor("return this")();
  });

  // node_modules/@apollo/client/utilities/common/makeUniqueId.js
  var prefixCounts = /* @__PURE__ */ new Map();
  function makeUniqueId(prefix) {
    var count = prefixCounts.get(prefix) || 1;
    prefixCounts.set(prefix, count + 1);
    return "".concat(prefix, ":").concat(count, ":").concat(Math.random().toString(36).slice(2));
  }

  // node_modules/@apollo/client/utilities/common/stringifyForDisplay.js
  function stringifyForDisplay(value, space) {
    if (space === void 0) {
      space = 0;
    }
    var undefId = makeUniqueId("stringifyForDisplay");
    return JSON.stringify(value, function(key, value2) {
      return value2 === void 0 ? undefId : value2;
    }, space).split(JSON.stringify(undefId)).join("<undefined>");
  }

  // node_modules/@apollo/client/utilities/globals/invariantWrappers.js
  function wrap(fn) {
    return function(message) {
      var args = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
      }
      if (typeof message === "number") {
        var arg0 = message;
        message = getHandledErrorMsg(arg0);
        if (!message) {
          message = getFallbackErrorMsg(arg0, args);
          args = [];
        }
      }
      fn.apply(void 0, [message].concat(args));
    };
  }
  var invariant2 = Object.assign(function invariant3(condition, message) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    if (!condition) {
      invariant(condition, getHandledErrorMsg(message, args) || getFallbackErrorMsg(message, args));
    }
  }, {
    debug: wrap(invariant.debug),
    log: wrap(invariant.log),
    warn: wrap(invariant.warn),
    error: wrap(invariant.error)
  });
  function newInvariantError(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      optionalParams[_i - 1] = arguments[_i];
    }
    return new InvariantError(getHandledErrorMsg(message, optionalParams) || getFallbackErrorMsg(message, optionalParams));
  }
  var ApolloErrorMessageHandler = Symbol.for("ApolloErrorMessageHandler_" + version);
  function stringify(arg) {
    if (typeof arg == "string") {
      return arg;
    }
    try {
      return stringifyForDisplay(arg, 2).slice(0, 1e3);
    } catch (_a2) {
      return "<non-serializable>";
    }
  }
  function getHandledErrorMsg(message, messageArgs) {
    if (messageArgs === void 0) {
      messageArgs = [];
    }
    if (!message)
      return;
    return global_default[ApolloErrorMessageHandler] && global_default[ApolloErrorMessageHandler](message, messageArgs.map(stringify));
  }
  function getFallbackErrorMsg(message, messageArgs) {
    if (messageArgs === void 0) {
      messageArgs = [];
    }
    if (!message)
      return;
    return "An error occurred! For more details, see the full error text at https://go.apollo.dev/c/err#".concat(encodeURIComponent(JSON.stringify({
      version,
      message,
      args: messageArgs.map(stringify)
    })));
  }

  // node_modules/@apollo/client/utilities/globals/index.js
  var DEV = globalThis.__DEV__ !== false;

  // node_modules/graphql/jsutils/devAssert.mjs
  function devAssert(condition, message) {
    const booleanCondition = Boolean(condition);
    if (!booleanCondition) {
      throw new Error(message);
    }
  }

  // node_modules/graphql/jsutils/isObjectLike.mjs
  function isObjectLike(value) {
    return typeof value == "object" && value !== null;
  }

  // node_modules/graphql/jsutils/invariant.mjs
  function invariant4(condition, message) {
    const booleanCondition = Boolean(condition);
    if (!booleanCondition) {
      throw new Error(
        message != null ? message : "Unexpected invariant triggered."
      );
    }
  }

  // node_modules/graphql/language/location.mjs
  var LineRegExp = /\r\n|[\n\r]/g;
  function getLocation(source, position) {
    let lastLineStart = 0;
    let line = 1;
    for (const match of source.body.matchAll(LineRegExp)) {
      typeof match.index === "number" || invariant4(false);
      if (match.index >= position) {
        break;
      }
      lastLineStart = match.index + match[0].length;
      line += 1;
    }
    return {
      line,
      column: position + 1 - lastLineStart
    };
  }

  // node_modules/graphql/language/printLocation.mjs
  function printLocation(location2) {
    return printSourceLocation(
      location2.source,
      getLocation(location2.source, location2.start)
    );
  }
  function printSourceLocation(source, sourceLocation) {
    const firstLineColumnOffset = source.locationOffset.column - 1;
    const body = "".padStart(firstLineColumnOffset) + source.body;
    const lineIndex = sourceLocation.line - 1;
    const lineOffset = source.locationOffset.line - 1;
    const lineNum = sourceLocation.line + lineOffset;
    const columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
    const columnNum = sourceLocation.column + columnOffset;
    const locationStr = `${source.name}:${lineNum}:${columnNum}
`;
    const lines = body.split(/\r\n|[\n\r]/g);
    const locationLine = lines[lineIndex];
    if (locationLine.length > 120) {
      const subLineIndex = Math.floor(columnNum / 80);
      const subLineColumnNum = columnNum % 80;
      const subLines = [];
      for (let i = 0; i < locationLine.length; i += 80) {
        subLines.push(locationLine.slice(i, i + 80));
      }
      return locationStr + printPrefixedLines([
        [`${lineNum} |`, subLines[0]],
        ...subLines.slice(1, subLineIndex + 1).map((subLine) => ["|", subLine]),
        ["|", "^".padStart(subLineColumnNum)],
        ["|", subLines[subLineIndex + 1]]
      ]);
    }
    return locationStr + printPrefixedLines([
      // Lines specified like this: ["prefix", "string"],
      [`${lineNum - 1} |`, lines[lineIndex - 1]],
      [`${lineNum} |`, locationLine],
      ["|", "^".padStart(columnNum)],
      [`${lineNum + 1} |`, lines[lineIndex + 1]]
    ]);
  }
  function printPrefixedLines(lines) {
    const existingLines = lines.filter(([_, line]) => line !== void 0);
    const padLen = Math.max(...existingLines.map(([prefix]) => prefix.length));
    return existingLines.map(([prefix, line]) => prefix.padStart(padLen) + (line ? " " + line : "")).join("\n");
  }

  // node_modules/graphql/error/GraphQLError.mjs
  function toNormalizedOptions(args) {
    const firstArg = args[0];
    if (firstArg == null || "kind" in firstArg || "length" in firstArg) {
      return {
        nodes: firstArg,
        source: args[1],
        positions: args[2],
        path: args[3],
        originalError: args[4],
        extensions: args[5]
      };
    }
    return firstArg;
  }
  var GraphQLError = class _GraphQLError extends Error {
    /**
     * An array of `{ line, column }` locations within the source GraphQL document
     * which correspond to this error.
     *
     * Errors during validation often contain multiple locations, for example to
     * point out two things with the same name. Errors during execution include a
     * single location, the field which produced the error.
     *
     * Enumerable, and appears in the result of JSON.stringify().
     */
    /**
     * An array describing the JSON-path into the execution response which
     * corresponds to this error. Only included for errors during execution.
     *
     * Enumerable, and appears in the result of JSON.stringify().
     */
    /**
     * An array of GraphQL AST Nodes corresponding to this error.
     */
    /**
     * The source GraphQL document for the first location of this error.
     *
     * Note that if this Error represents more than one node, the source may not
     * represent nodes after the first node.
     */
    /**
     * An array of character offsets within the source GraphQL document
     * which correspond to this error.
     */
    /**
     * The original error thrown from a field resolver during execution.
     */
    /**
     * Extension fields to add to the formatted error.
     */
    /**
     * @deprecated Please use the `GraphQLErrorOptions` constructor overload instead.
     */
    constructor(message, ...rawArgs) {
      var _this$nodes, _nodeLocations$, _ref;
      const { nodes, source, positions, path, originalError, extensions } = toNormalizedOptions(rawArgs);
      super(message);
      this.name = "GraphQLError";
      this.path = path !== null && path !== void 0 ? path : void 0;
      this.originalError = originalError !== null && originalError !== void 0 ? originalError : void 0;
      this.nodes = undefinedIfEmpty(
        Array.isArray(nodes) ? nodes : nodes ? [nodes] : void 0
      );
      const nodeLocations = undefinedIfEmpty(
        (_this$nodes = this.nodes) === null || _this$nodes === void 0 ? void 0 : _this$nodes.map((node) => node.loc).filter((loc) => loc != null)
      );
      this.source = source !== null && source !== void 0 ? source : nodeLocations === null || nodeLocations === void 0 ? void 0 : (_nodeLocations$ = nodeLocations[0]) === null || _nodeLocations$ === void 0 ? void 0 : _nodeLocations$.source;
      this.positions = positions !== null && positions !== void 0 ? positions : nodeLocations === null || nodeLocations === void 0 ? void 0 : nodeLocations.map((loc) => loc.start);
      this.locations = positions && source ? positions.map((pos) => getLocation(source, pos)) : nodeLocations === null || nodeLocations === void 0 ? void 0 : nodeLocations.map((loc) => getLocation(loc.source, loc.start));
      const originalExtensions = isObjectLike(
        originalError === null || originalError === void 0 ? void 0 : originalError.extensions
      ) ? originalError === null || originalError === void 0 ? void 0 : originalError.extensions : void 0;
      this.extensions = (_ref = extensions !== null && extensions !== void 0 ? extensions : originalExtensions) !== null && _ref !== void 0 ? _ref : /* @__PURE__ */ Object.create(null);
      Object.defineProperties(this, {
        message: {
          writable: true,
          enumerable: true
        },
        name: {
          enumerable: false
        },
        nodes: {
          enumerable: false
        },
        source: {
          enumerable: false
        },
        positions: {
          enumerable: false
        },
        originalError: {
          enumerable: false
        }
      });
      if (originalError !== null && originalError !== void 0 && originalError.stack) {
        Object.defineProperty(this, "stack", {
          value: originalError.stack,
          writable: true,
          configurable: true
        });
      } else if (Error.captureStackTrace) {
        Error.captureStackTrace(this, _GraphQLError);
      } else {
        Object.defineProperty(this, "stack", {
          value: Error().stack,
          writable: true,
          configurable: true
        });
      }
    }
    get [Symbol.toStringTag]() {
      return "GraphQLError";
    }
    toString() {
      let output = this.message;
      if (this.nodes) {
        for (const node of this.nodes) {
          if (node.loc) {
            output += "\n\n" + printLocation(node.loc);
          }
        }
      } else if (this.source && this.locations) {
        for (const location2 of this.locations) {
          output += "\n\n" + printSourceLocation(this.source, location2);
        }
      }
      return output;
    }
    toJSON() {
      const formattedError = {
        message: this.message
      };
      if (this.locations != null) {
        formattedError.locations = this.locations;
      }
      if (this.path != null) {
        formattedError.path = this.path;
      }
      if (this.extensions != null && Object.keys(this.extensions).length > 0) {
        formattedError.extensions = this.extensions;
      }
      return formattedError;
    }
  };
  function undefinedIfEmpty(array) {
    return array === void 0 || array.length === 0 ? void 0 : array;
  }

  // node_modules/graphql/error/syntaxError.mjs
  function syntaxError(source, position, description) {
    return new GraphQLError(`Syntax Error: ${description}`, {
      source,
      positions: [position]
    });
  }

  // node_modules/graphql/language/ast.mjs
  var Location = class {
    /**
     * The character offset at which this Node begins.
     */
    /**
     * The character offset at which this Node ends.
     */
    /**
     * The Token at which this Node begins.
     */
    /**
     * The Token at which this Node ends.
     */
    /**
     * The Source document the AST represents.
     */
    constructor(startToken, endToken, source) {
      this.start = startToken.start;
      this.end = endToken.end;
      this.startToken = startToken;
      this.endToken = endToken;
      this.source = source;
    }
    get [Symbol.toStringTag]() {
      return "Location";
    }
    toJSON() {
      return {
        start: this.start,
        end: this.end
      };
    }
  };
  var Token = class {
    /**
     * The kind of Token.
     */
    /**
     * The character offset at which this Node begins.
     */
    /**
     * The character offset at which this Node ends.
     */
    /**
     * The 1-indexed line number on which this Token appears.
     */
    /**
     * The 1-indexed column number at which this Token begins.
     */
    /**
     * For non-punctuation tokens, represents the interpreted value of the token.
     *
     * Note: is undefined for punctuation tokens, but typed as string for
     * convenience in the parser.
     */
    /**
     * Tokens exist as nodes in a double-linked-list amongst all tokens
     * including ignored tokens. <SOF> is always the first node and <EOF>
     * the last.
     */
    constructor(kind, start, end, line, column, value) {
      this.kind = kind;
      this.start = start;
      this.end = end;
      this.line = line;
      this.column = column;
      this.value = value;
      this.prev = null;
      this.next = null;
    }
    get [Symbol.toStringTag]() {
      return "Token";
    }
    toJSON() {
      return {
        kind: this.kind,
        value: this.value,
        line: this.line,
        column: this.column
      };
    }
  };
  var QueryDocumentKeys = {
    Name: [],
    Document: ["definitions"],
    OperationDefinition: [
      "name",
      "variableDefinitions",
      "directives",
      "selectionSet"
    ],
    VariableDefinition: ["variable", "type", "defaultValue", "directives"],
    Variable: ["name"],
    SelectionSet: ["selections"],
    Field: ["alias", "name", "arguments", "directives", "selectionSet"],
    Argument: ["name", "value"],
    FragmentSpread: ["name", "directives"],
    InlineFragment: ["typeCondition", "directives", "selectionSet"],
    FragmentDefinition: [
      "name",
      // Note: fragment variable definitions are deprecated and will removed in v17.0.0
      "variableDefinitions",
      "typeCondition",
      "directives",
      "selectionSet"
    ],
    IntValue: [],
    FloatValue: [],
    StringValue: [],
    BooleanValue: [],
    NullValue: [],
    EnumValue: [],
    ListValue: ["values"],
    ObjectValue: ["fields"],
    ObjectField: ["name", "value"],
    Directive: ["name", "arguments"],
    NamedType: ["name"],
    ListType: ["type"],
    NonNullType: ["type"],
    SchemaDefinition: ["description", "directives", "operationTypes"],
    OperationTypeDefinition: ["type"],
    ScalarTypeDefinition: ["description", "name", "directives"],
    ObjectTypeDefinition: [
      "description",
      "name",
      "interfaces",
      "directives",
      "fields"
    ],
    FieldDefinition: ["description", "name", "arguments", "type", "directives"],
    InputValueDefinition: [
      "description",
      "name",
      "type",
      "defaultValue",
      "directives"
    ],
    InterfaceTypeDefinition: [
      "description",
      "name",
      "interfaces",
      "directives",
      "fields"
    ],
    UnionTypeDefinition: ["description", "name", "directives", "types"],
    EnumTypeDefinition: ["description", "name", "directives", "values"],
    EnumValueDefinition: ["description", "name", "directives"],
    InputObjectTypeDefinition: ["description", "name", "directives", "fields"],
    DirectiveDefinition: ["description", "name", "arguments", "locations"],
    SchemaExtension: ["directives", "operationTypes"],
    ScalarTypeExtension: ["name", "directives"],
    ObjectTypeExtension: ["name", "interfaces", "directives", "fields"],
    InterfaceTypeExtension: ["name", "interfaces", "directives", "fields"],
    UnionTypeExtension: ["name", "directives", "types"],
    EnumTypeExtension: ["name", "directives", "values"],
    InputObjectTypeExtension: ["name", "directives", "fields"]
  };
  var kindValues = new Set(Object.keys(QueryDocumentKeys));
  function isNode(maybeNode) {
    const maybeKind = maybeNode === null || maybeNode === void 0 ? void 0 : maybeNode.kind;
    return typeof maybeKind === "string" && kindValues.has(maybeKind);
  }
  var OperationTypeNode;
  (function(OperationTypeNode2) {
    OperationTypeNode2["QUERY"] = "query";
    OperationTypeNode2["MUTATION"] = "mutation";
    OperationTypeNode2["SUBSCRIPTION"] = "subscription";
  })(OperationTypeNode || (OperationTypeNode = {}));

  // node_modules/graphql/language/directiveLocation.mjs
  var DirectiveLocation;
  (function(DirectiveLocation2) {
    DirectiveLocation2["QUERY"] = "QUERY";
    DirectiveLocation2["MUTATION"] = "MUTATION";
    DirectiveLocation2["SUBSCRIPTION"] = "SUBSCRIPTION";
    DirectiveLocation2["FIELD"] = "FIELD";
    DirectiveLocation2["FRAGMENT_DEFINITION"] = "FRAGMENT_DEFINITION";
    DirectiveLocation2["FRAGMENT_SPREAD"] = "FRAGMENT_SPREAD";
    DirectiveLocation2["INLINE_FRAGMENT"] = "INLINE_FRAGMENT";
    DirectiveLocation2["VARIABLE_DEFINITION"] = "VARIABLE_DEFINITION";
    DirectiveLocation2["SCHEMA"] = "SCHEMA";
    DirectiveLocation2["SCALAR"] = "SCALAR";
    DirectiveLocation2["OBJECT"] = "OBJECT";
    DirectiveLocation2["FIELD_DEFINITION"] = "FIELD_DEFINITION";
    DirectiveLocation2["ARGUMENT_DEFINITION"] = "ARGUMENT_DEFINITION";
    DirectiveLocation2["INTERFACE"] = "INTERFACE";
    DirectiveLocation2["UNION"] = "UNION";
    DirectiveLocation2["ENUM"] = "ENUM";
    DirectiveLocation2["ENUM_VALUE"] = "ENUM_VALUE";
    DirectiveLocation2["INPUT_OBJECT"] = "INPUT_OBJECT";
    DirectiveLocation2["INPUT_FIELD_DEFINITION"] = "INPUT_FIELD_DEFINITION";
  })(DirectiveLocation || (DirectiveLocation = {}));

  // node_modules/graphql/language/kinds.mjs
  var Kind;
  (function(Kind2) {
    Kind2["NAME"] = "Name";
    Kind2["DOCUMENT"] = "Document";
    Kind2["OPERATION_DEFINITION"] = "OperationDefinition";
    Kind2["VARIABLE_DEFINITION"] = "VariableDefinition";
    Kind2["SELECTION_SET"] = "SelectionSet";
    Kind2["FIELD"] = "Field";
    Kind2["ARGUMENT"] = "Argument";
    Kind2["FRAGMENT_SPREAD"] = "FragmentSpread";
    Kind2["INLINE_FRAGMENT"] = "InlineFragment";
    Kind2["FRAGMENT_DEFINITION"] = "FragmentDefinition";
    Kind2["VARIABLE"] = "Variable";
    Kind2["INT"] = "IntValue";
    Kind2["FLOAT"] = "FloatValue";
    Kind2["STRING"] = "StringValue";
    Kind2["BOOLEAN"] = "BooleanValue";
    Kind2["NULL"] = "NullValue";
    Kind2["ENUM"] = "EnumValue";
    Kind2["LIST"] = "ListValue";
    Kind2["OBJECT"] = "ObjectValue";
    Kind2["OBJECT_FIELD"] = "ObjectField";
    Kind2["DIRECTIVE"] = "Directive";
    Kind2["NAMED_TYPE"] = "NamedType";
    Kind2["LIST_TYPE"] = "ListType";
    Kind2["NON_NULL_TYPE"] = "NonNullType";
    Kind2["SCHEMA_DEFINITION"] = "SchemaDefinition";
    Kind2["OPERATION_TYPE_DEFINITION"] = "OperationTypeDefinition";
    Kind2["SCALAR_TYPE_DEFINITION"] = "ScalarTypeDefinition";
    Kind2["OBJECT_TYPE_DEFINITION"] = "ObjectTypeDefinition";
    Kind2["FIELD_DEFINITION"] = "FieldDefinition";
    Kind2["INPUT_VALUE_DEFINITION"] = "InputValueDefinition";
    Kind2["INTERFACE_TYPE_DEFINITION"] = "InterfaceTypeDefinition";
    Kind2["UNION_TYPE_DEFINITION"] = "UnionTypeDefinition";
    Kind2["ENUM_TYPE_DEFINITION"] = "EnumTypeDefinition";
    Kind2["ENUM_VALUE_DEFINITION"] = "EnumValueDefinition";
    Kind2["INPUT_OBJECT_TYPE_DEFINITION"] = "InputObjectTypeDefinition";
    Kind2["DIRECTIVE_DEFINITION"] = "DirectiveDefinition";
    Kind2["SCHEMA_EXTENSION"] = "SchemaExtension";
    Kind2["SCALAR_TYPE_EXTENSION"] = "ScalarTypeExtension";
    Kind2["OBJECT_TYPE_EXTENSION"] = "ObjectTypeExtension";
    Kind2["INTERFACE_TYPE_EXTENSION"] = "InterfaceTypeExtension";
    Kind2["UNION_TYPE_EXTENSION"] = "UnionTypeExtension";
    Kind2["ENUM_TYPE_EXTENSION"] = "EnumTypeExtension";
    Kind2["INPUT_OBJECT_TYPE_EXTENSION"] = "InputObjectTypeExtension";
  })(Kind || (Kind = {}));

  // node_modules/graphql/language/characterClasses.mjs
  function isWhiteSpace(code) {
    return code === 9 || code === 32;
  }
  function isDigit(code) {
    return code >= 48 && code <= 57;
  }
  function isLetter(code) {
    return code >= 97 && code <= 122 || // A-Z
    code >= 65 && code <= 90;
  }
  function isNameStart(code) {
    return isLetter(code) || code === 95;
  }
  function isNameContinue(code) {
    return isLetter(code) || isDigit(code) || code === 95;
  }

  // node_modules/graphql/language/blockString.mjs
  function dedentBlockStringLines(lines) {
    var _firstNonEmptyLine2;
    let commonIndent = Number.MAX_SAFE_INTEGER;
    let firstNonEmptyLine = null;
    let lastNonEmptyLine = -1;
    for (let i = 0; i < lines.length; ++i) {
      var _firstNonEmptyLine;
      const line = lines[i];
      const indent2 = leadingWhitespace(line);
      if (indent2 === line.length) {
        continue;
      }
      firstNonEmptyLine = (_firstNonEmptyLine = firstNonEmptyLine) !== null && _firstNonEmptyLine !== void 0 ? _firstNonEmptyLine : i;
      lastNonEmptyLine = i;
      if (i !== 0 && indent2 < commonIndent) {
        commonIndent = indent2;
      }
    }
    return lines.map((line, i) => i === 0 ? line : line.slice(commonIndent)).slice(
      (_firstNonEmptyLine2 = firstNonEmptyLine) !== null && _firstNonEmptyLine2 !== void 0 ? _firstNonEmptyLine2 : 0,
      lastNonEmptyLine + 1
    );
  }
  function leadingWhitespace(str) {
    let i = 0;
    while (i < str.length && isWhiteSpace(str.charCodeAt(i))) {
      ++i;
    }
    return i;
  }
  function printBlockString(value, options) {
    const escapedValue = value.replace(/"""/g, '\\"""');
    const lines = escapedValue.split(/\r\n|[\n\r]/g);
    const isSingleLine = lines.length === 1;
    const forceLeadingNewLine = lines.length > 1 && lines.slice(1).every((line) => line.length === 0 || isWhiteSpace(line.charCodeAt(0)));
    const hasTrailingTripleQuotes = escapedValue.endsWith('\\"""');
    const hasTrailingQuote = value.endsWith('"') && !hasTrailingTripleQuotes;
    const hasTrailingSlash = value.endsWith("\\");
    const forceTrailingNewline = hasTrailingQuote || hasTrailingSlash;
    const printAsMultipleLines = !(options !== null && options !== void 0 && options.minimize) && // add leading and trailing new lines only if it improves readability
    (!isSingleLine || value.length > 70 || forceTrailingNewline || forceLeadingNewLine || hasTrailingTripleQuotes);
    let result2 = "";
    const skipLeadingNewLine = isSingleLine && isWhiteSpace(value.charCodeAt(0));
    if (printAsMultipleLines && !skipLeadingNewLine || forceLeadingNewLine) {
      result2 += "\n";
    }
    result2 += escapedValue;
    if (printAsMultipleLines || forceTrailingNewline) {
      result2 += "\n";
    }
    return '"""' + result2 + '"""';
  }

  // node_modules/graphql/language/tokenKind.mjs
  var TokenKind;
  (function(TokenKind2) {
    TokenKind2["SOF"] = "<SOF>";
    TokenKind2["EOF"] = "<EOF>";
    TokenKind2["BANG"] = "!";
    TokenKind2["DOLLAR"] = "$";
    TokenKind2["AMP"] = "&";
    TokenKind2["PAREN_L"] = "(";
    TokenKind2["PAREN_R"] = ")";
    TokenKind2["SPREAD"] = "...";
    TokenKind2["COLON"] = ":";
    TokenKind2["EQUALS"] = "=";
    TokenKind2["AT"] = "@";
    TokenKind2["BRACKET_L"] = "[";
    TokenKind2["BRACKET_R"] = "]";
    TokenKind2["BRACE_L"] = "{";
    TokenKind2["PIPE"] = "|";
    TokenKind2["BRACE_R"] = "}";
    TokenKind2["NAME"] = "Name";
    TokenKind2["INT"] = "Int";
    TokenKind2["FLOAT"] = "Float";
    TokenKind2["STRING"] = "String";
    TokenKind2["BLOCK_STRING"] = "BlockString";
    TokenKind2["COMMENT"] = "Comment";
  })(TokenKind || (TokenKind = {}));

  // node_modules/graphql/language/lexer.mjs
  var Lexer = class {
    /**
     * The previously focused non-ignored token.
     */
    /**
     * The currently focused non-ignored token.
     */
    /**
     * The (1-indexed) line containing the current token.
     */
    /**
     * The character offset at which the current line begins.
     */
    constructor(source) {
      const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0);
      this.source = source;
      this.lastToken = startOfFileToken;
      this.token = startOfFileToken;
      this.line = 1;
      this.lineStart = 0;
    }
    get [Symbol.toStringTag]() {
      return "Lexer";
    }
    /**
     * Advances the token stream to the next non-ignored token.
     */
    advance() {
      this.lastToken = this.token;
      const token = this.token = this.lookahead();
      return token;
    }
    /**
     * Looks ahead and returns the next non-ignored token, but does not change
     * the state of Lexer.
     */
    lookahead() {
      let token = this.token;
      if (token.kind !== TokenKind.EOF) {
        do {
          if (token.next) {
            token = token.next;
          } else {
            const nextToken = readNextToken(this, token.end);
            token.next = nextToken;
            nextToken.prev = token;
            token = nextToken;
          }
        } while (token.kind === TokenKind.COMMENT);
      }
      return token;
    }
  };
  function isPunctuatorTokenKind(kind) {
    return kind === TokenKind.BANG || kind === TokenKind.DOLLAR || kind === TokenKind.AMP || kind === TokenKind.PAREN_L || kind === TokenKind.PAREN_R || kind === TokenKind.SPREAD || kind === TokenKind.COLON || kind === TokenKind.EQUALS || kind === TokenKind.AT || kind === TokenKind.BRACKET_L || kind === TokenKind.BRACKET_R || kind === TokenKind.BRACE_L || kind === TokenKind.PIPE || kind === TokenKind.BRACE_R;
  }
  function isUnicodeScalarValue(code) {
    return code >= 0 && code <= 55295 || code >= 57344 && code <= 1114111;
  }
  function isSupplementaryCodePoint(body, location2) {
    return isLeadingSurrogate(body.charCodeAt(location2)) && isTrailingSurrogate(body.charCodeAt(location2 + 1));
  }
  function isLeadingSurrogate(code) {
    return code >= 55296 && code <= 56319;
  }
  function isTrailingSurrogate(code) {
    return code >= 56320 && code <= 57343;
  }
  function printCodePointAt(lexer, location2) {
    const code = lexer.source.body.codePointAt(location2);
    if (code === void 0) {
      return TokenKind.EOF;
    } else if (code >= 32 && code <= 126) {
      const char = String.fromCodePoint(code);
      return char === '"' ? `'"'` : `"${char}"`;
    }
    return "U+" + code.toString(16).toUpperCase().padStart(4, "0");
  }
  function createToken(lexer, kind, start, end, value) {
    const line = lexer.line;
    const col = 1 + start - lexer.lineStart;
    return new Token(kind, start, end, line, col, value);
  }
  function readNextToken(lexer, start) {
    const body = lexer.source.body;
    const bodyLength = body.length;
    let position = start;
    while (position < bodyLength) {
      const code = body.charCodeAt(position);
      switch (code) {
        // Ignored ::
        //   - UnicodeBOM
        //   - WhiteSpace
        //   - LineTerminator
        //   - Comment
        //   - Comma
        //
        // UnicodeBOM :: "Byte Order Mark (U+FEFF)"
        //
        // WhiteSpace ::
        //   - "Horizontal Tab (U+0009)"
        //   - "Space (U+0020)"
        //
        // Comma :: ,
        case 65279:
        // <BOM>
        case 9:
        // \t
        case 32:
        // <space>
        case 44:
          ++position;
          continue;
        // LineTerminator ::
        //   - "New Line (U+000A)"
        //   - "Carriage Return (U+000D)" [lookahead != "New Line (U+000A)"]
        //   - "Carriage Return (U+000D)" "New Line (U+000A)"
        case 10:
          ++position;
          ++lexer.line;
          lexer.lineStart = position;
          continue;
        case 13:
          if (body.charCodeAt(position + 1) === 10) {
            position += 2;
          } else {
            ++position;
          }
          ++lexer.line;
          lexer.lineStart = position;
          continue;
        // Comment
        case 35:
          return readComment(lexer, position);
        // Token ::
        //   - Punctuator
        //   - Name
        //   - IntValue
        //   - FloatValue
        //   - StringValue
        //
        // Punctuator :: one of ! $ & ( ) ... : = @ [ ] { | }
        case 33:
          return createToken(lexer, TokenKind.BANG, position, position + 1);
        case 36:
          return createToken(lexer, TokenKind.DOLLAR, position, position + 1);
        case 38:
          return createToken(lexer, TokenKind.AMP, position, position + 1);
        case 40:
          return createToken(lexer, TokenKind.PAREN_L, position, position + 1);
        case 41:
          return createToken(lexer, TokenKind.PAREN_R, position, position + 1);
        case 46:
          if (body.charCodeAt(position + 1) === 46 && body.charCodeAt(position + 2) === 46) {
            return createToken(lexer, TokenKind.SPREAD, position, position + 3);
          }
          break;
        case 58:
          return createToken(lexer, TokenKind.COLON, position, position + 1);
        case 61:
          return createToken(lexer, TokenKind.EQUALS, position, position + 1);
        case 64:
          return createToken(lexer, TokenKind.AT, position, position + 1);
        case 91:
          return createToken(lexer, TokenKind.BRACKET_L, position, position + 1);
        case 93:
          return createToken(lexer, TokenKind.BRACKET_R, position, position + 1);
        case 123:
          return createToken(lexer, TokenKind.BRACE_L, position, position + 1);
        case 124:
          return createToken(lexer, TokenKind.PIPE, position, position + 1);
        case 125:
          return createToken(lexer, TokenKind.BRACE_R, position, position + 1);
        // StringValue
        case 34:
          if (body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
            return readBlockString(lexer, position);
          }
          return readString(lexer, position);
      }
      if (isDigit(code) || code === 45) {
        return readNumber(lexer, position, code);
      }
      if (isNameStart(code)) {
        return readName(lexer, position);
      }
      throw syntaxError(
        lexer.source,
        position,
        code === 39 ? `Unexpected single quote character ('), did you mean to use a double quote (")?` : isUnicodeScalarValue(code) || isSupplementaryCodePoint(body, position) ? `Unexpected character: ${printCodePointAt(lexer, position)}.` : `Invalid character: ${printCodePointAt(lexer, position)}.`
      );
    }
    return createToken(lexer, TokenKind.EOF, bodyLength, bodyLength);
  }
  function readComment(lexer, start) {
    const body = lexer.source.body;
    const bodyLength = body.length;
    let position = start + 1;
    while (position < bodyLength) {
      const code = body.charCodeAt(position);
      if (code === 10 || code === 13) {
        break;
      }
      if (isUnicodeScalarValue(code)) {
        ++position;
      } else if (isSupplementaryCodePoint(body, position)) {
        position += 2;
      } else {
        break;
      }
    }
    return createToken(
      lexer,
      TokenKind.COMMENT,
      start,
      position,
      body.slice(start + 1, position)
    );
  }
  function readNumber(lexer, start, firstCode) {
    const body = lexer.source.body;
    let position = start;
    let code = firstCode;
    let isFloat = false;
    if (code === 45) {
      code = body.charCodeAt(++position);
    }
    if (code === 48) {
      code = body.charCodeAt(++position);
      if (isDigit(code)) {
        throw syntaxError(
          lexer.source,
          position,
          `Invalid number, unexpected digit after 0: ${printCodePointAt(
            lexer,
            position
          )}.`
        );
      }
    } else {
      position = readDigits(lexer, position, code);
      code = body.charCodeAt(position);
    }
    if (code === 46) {
      isFloat = true;
      code = body.charCodeAt(++position);
      position = readDigits(lexer, position, code);
      code = body.charCodeAt(position);
    }
    if (code === 69 || code === 101) {
      isFloat = true;
      code = body.charCodeAt(++position);
      if (code === 43 || code === 45) {
        code = body.charCodeAt(++position);
      }
      position = readDigits(lexer, position, code);
      code = body.charCodeAt(position);
    }
    if (code === 46 || isNameStart(code)) {
      throw syntaxError(
        lexer.source,
        position,
        `Invalid number, expected digit but got: ${printCodePointAt(
          lexer,
          position
        )}.`
      );
    }
    return createToken(
      lexer,
      isFloat ? TokenKind.FLOAT : TokenKind.INT,
      start,
      position,
      body.slice(start, position)
    );
  }
  function readDigits(lexer, start, firstCode) {
    if (!isDigit(firstCode)) {
      throw syntaxError(
        lexer.source,
        start,
        `Invalid number, expected digit but got: ${printCodePointAt(
          lexer,
          start
        )}.`
      );
    }
    const body = lexer.source.body;
    let position = start + 1;
    while (isDigit(body.charCodeAt(position))) {
      ++position;
    }
    return position;
  }
  function readString(lexer, start) {
    const body = lexer.source.body;
    const bodyLength = body.length;
    let position = start + 1;
    let chunkStart = position;
    let value = "";
    while (position < bodyLength) {
      const code = body.charCodeAt(position);
      if (code === 34) {
        value += body.slice(chunkStart, position);
        return createToken(lexer, TokenKind.STRING, start, position + 1, value);
      }
      if (code === 92) {
        value += body.slice(chunkStart, position);
        const escape = body.charCodeAt(position + 1) === 117 ? body.charCodeAt(position + 2) === 123 ? readEscapedUnicodeVariableWidth(lexer, position) : readEscapedUnicodeFixedWidth(lexer, position) : readEscapedCharacter(lexer, position);
        value += escape.value;
        position += escape.size;
        chunkStart = position;
        continue;
      }
      if (code === 10 || code === 13) {
        break;
      }
      if (isUnicodeScalarValue(code)) {
        ++position;
      } else if (isSupplementaryCodePoint(body, position)) {
        position += 2;
      } else {
        throw syntaxError(
          lexer.source,
          position,
          `Invalid character within String: ${printCodePointAt(
            lexer,
            position
          )}.`
        );
      }
    }
    throw syntaxError(lexer.source, position, "Unterminated string.");
  }
  function readEscapedUnicodeVariableWidth(lexer, position) {
    const body = lexer.source.body;
    let point = 0;
    let size = 3;
    while (size < 12) {
      const code = body.charCodeAt(position + size++);
      if (code === 125) {
        if (size < 5 || !isUnicodeScalarValue(point)) {
          break;
        }
        return {
          value: String.fromCodePoint(point),
          size
        };
      }
      point = point << 4 | readHexDigit(code);
      if (point < 0) {
        break;
      }
    }
    throw syntaxError(
      lexer.source,
      position,
      `Invalid Unicode escape sequence: "${body.slice(
        position,
        position + size
      )}".`
    );
  }
  function readEscapedUnicodeFixedWidth(lexer, position) {
    const body = lexer.source.body;
    const code = read16BitHexCode(body, position + 2);
    if (isUnicodeScalarValue(code)) {
      return {
        value: String.fromCodePoint(code),
        size: 6
      };
    }
    if (isLeadingSurrogate(code)) {
      if (body.charCodeAt(position + 6) === 92 && body.charCodeAt(position + 7) === 117) {
        const trailingCode = read16BitHexCode(body, position + 8);
        if (isTrailingSurrogate(trailingCode)) {
          return {
            value: String.fromCodePoint(code, trailingCode),
            size: 12
          };
        }
      }
    }
    throw syntaxError(
      lexer.source,
      position,
      `Invalid Unicode escape sequence: "${body.slice(position, position + 6)}".`
    );
  }
  function read16BitHexCode(body, position) {
    return readHexDigit(body.charCodeAt(position)) << 12 | readHexDigit(body.charCodeAt(position + 1)) << 8 | readHexDigit(body.charCodeAt(position + 2)) << 4 | readHexDigit(body.charCodeAt(position + 3));
  }
  function readHexDigit(code) {
    return code >= 48 && code <= 57 ? code - 48 : code >= 65 && code <= 70 ? code - 55 : code >= 97 && code <= 102 ? code - 87 : -1;
  }
  function readEscapedCharacter(lexer, position) {
    const body = lexer.source.body;
    const code = body.charCodeAt(position + 1);
    switch (code) {
      case 34:
        return {
          value: '"',
          size: 2
        };
      case 92:
        return {
          value: "\\",
          size: 2
        };
      case 47:
        return {
          value: "/",
          size: 2
        };
      case 98:
        return {
          value: "\b",
          size: 2
        };
      case 102:
        return {
          value: "\f",
          size: 2
        };
      case 110:
        return {
          value: "\n",
          size: 2
        };
      case 114:
        return {
          value: "\r",
          size: 2
        };
      case 116:
        return {
          value: "	",
          size: 2
        };
    }
    throw syntaxError(
      lexer.source,
      position,
      `Invalid character escape sequence: "${body.slice(
        position,
        position + 2
      )}".`
    );
  }
  function readBlockString(lexer, start) {
    const body = lexer.source.body;
    const bodyLength = body.length;
    let lineStart = lexer.lineStart;
    let position = start + 3;
    let chunkStart = position;
    let currentLine = "";
    const blockLines = [];
    while (position < bodyLength) {
      const code = body.charCodeAt(position);
      if (code === 34 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
        currentLine += body.slice(chunkStart, position);
        blockLines.push(currentLine);
        const token = createToken(
          lexer,
          TokenKind.BLOCK_STRING,
          start,
          position + 3,
          // Return a string of the lines joined with U+000A.
          dedentBlockStringLines(blockLines).join("\n")
        );
        lexer.line += blockLines.length - 1;
        lexer.lineStart = lineStart;
        return token;
      }
      if (code === 92 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34 && body.charCodeAt(position + 3) === 34) {
        currentLine += body.slice(chunkStart, position);
        chunkStart = position + 1;
        position += 4;
        continue;
      }
      if (code === 10 || code === 13) {
        currentLine += body.slice(chunkStart, position);
        blockLines.push(currentLine);
        if (code === 13 && body.charCodeAt(position + 1) === 10) {
          position += 2;
        } else {
          ++position;
        }
        currentLine = "";
        chunkStart = position;
        lineStart = position;
        continue;
      }
      if (isUnicodeScalarValue(code)) {
        ++position;
      } else if (isSupplementaryCodePoint(body, position)) {
        position += 2;
      } else {
        throw syntaxError(
          lexer.source,
          position,
          `Invalid character within String: ${printCodePointAt(
            lexer,
            position
          )}.`
        );
      }
    }
    throw syntaxError(lexer.source, position, "Unterminated string.");
  }
  function readName(lexer, start) {
    const body = lexer.source.body;
    const bodyLength = body.length;
    let position = start + 1;
    while (position < bodyLength) {
      const code = body.charCodeAt(position);
      if (isNameContinue(code)) {
        ++position;
      } else {
        break;
      }
    }
    return createToken(
      lexer,
      TokenKind.NAME,
      start,
      position,
      body.slice(start, position)
    );
  }

  // node_modules/graphql/jsutils/inspect.mjs
  var MAX_ARRAY_LENGTH = 10;
  var MAX_RECURSIVE_DEPTH = 2;
  function inspect(value) {
    return formatValue(value, []);
  }
  function formatValue(value, seenValues) {
    switch (typeof value) {
      case "string":
        return JSON.stringify(value);
      case "function":
        return value.name ? `[function ${value.name}]` : "[function]";
      case "object":
        return formatObjectValue(value, seenValues);
      default:
        return String(value);
    }
  }
  function formatObjectValue(value, previouslySeenValues) {
    if (value === null) {
      return "null";
    }
    if (previouslySeenValues.includes(value)) {
      return "[Circular]";
    }
    const seenValues = [...previouslySeenValues, value];
    if (isJSONable(value)) {
      const jsonValue = value.toJSON();
      if (jsonValue !== value) {
        return typeof jsonValue === "string" ? jsonValue : formatValue(jsonValue, seenValues);
      }
    } else if (Array.isArray(value)) {
      return formatArray(value, seenValues);
    }
    return formatObject(value, seenValues);
  }
  function isJSONable(value) {
    return typeof value.toJSON === "function";
  }
  function formatObject(object, seenValues) {
    const entries = Object.entries(object);
    if (entries.length === 0) {
      return "{}";
    }
    if (seenValues.length > MAX_RECURSIVE_DEPTH) {
      return "[" + getObjectTag(object) + "]";
    }
    const properties = entries.map(
      ([key, value]) => key + ": " + formatValue(value, seenValues)
    );
    return "{ " + properties.join(", ") + " }";
  }
  function formatArray(array, seenValues) {
    if (array.length === 0) {
      return "[]";
    }
    if (seenValues.length > MAX_RECURSIVE_DEPTH) {
      return "[Array]";
    }
    const len = Math.min(MAX_ARRAY_LENGTH, array.length);
    const remaining = array.length - len;
    const items = [];
    for (let i = 0; i < len; ++i) {
      items.push(formatValue(array[i], seenValues));
    }
    if (remaining === 1) {
      items.push("... 1 more item");
    } else if (remaining > 1) {
      items.push(`... ${remaining} more items`);
    }
    return "[" + items.join(", ") + "]";
  }
  function getObjectTag(object) {
    const tag = Object.prototype.toString.call(object).replace(/^\[object /, "").replace(/]$/, "");
    if (tag === "Object" && typeof object.constructor === "function") {
      const name = object.constructor.name;
      if (typeof name === "string" && name !== "") {
        return name;
      }
    }
    return tag;
  }

  // node_modules/graphql/jsutils/instanceOf.mjs
  var isProduction = globalThis.process && // eslint-disable-next-line no-undef
  false;
  var instanceOf = (
    /* c8 ignore next 6 */
    // FIXME: https://github.com/graphql/graphql-js/issues/2317
    isProduction ? function instanceOf2(value, constructor) {
      return value instanceof constructor;
    } : function instanceOf3(value, constructor) {
      if (value instanceof constructor) {
        return true;
      }
      if (typeof value === "object" && value !== null) {
        var _value$constructor;
        const className = constructor.prototype[Symbol.toStringTag];
        const valueClassName = (
          // We still need to support constructor's name to detect conflicts with older versions of this library.
          Symbol.toStringTag in value ? value[Symbol.toStringTag] : (_value$constructor = value.constructor) === null || _value$constructor === void 0 ? void 0 : _value$constructor.name
        );
        if (className === valueClassName) {
          const stringifiedValue = inspect(value);
          throw new Error(`Cannot use ${className} "${stringifiedValue}" from another module or realm.

Ensure that there is only one instance of "graphql" in the node_modules
directory. If different versions of "graphql" are the dependencies of other
relied on modules, use "resolutions" to ensure only one version is installed.

https://yarnpkg.com/en/docs/selective-version-resolutions

Duplicate "graphql" modules cannot be used at the same time since different
versions may have different capabilities and behavior. The data from one
version used in the function from another could produce confusing and
spurious results.`);
        }
      }
      return false;
    }
  );

  // node_modules/graphql/language/source.mjs
  var Source = class {
    constructor(body, name = "GraphQL request", locationOffset = {
      line: 1,
      column: 1
    }) {
      typeof body === "string" || devAssert(false, `Body must be a string. Received: ${inspect(body)}.`);
      this.body = body;
      this.name = name;
      this.locationOffset = locationOffset;
      this.locationOffset.line > 0 || devAssert(
        false,
        "line in locationOffset is 1-indexed and must be positive."
      );
      this.locationOffset.column > 0 || devAssert(
        false,
        "column in locationOffset is 1-indexed and must be positive."
      );
    }
    get [Symbol.toStringTag]() {
      return "Source";
    }
  };
  function isSource(source) {
    return instanceOf(source, Source);
  }

  // node_modules/graphql/language/parser.mjs
  function parse(source, options) {
    const parser = new Parser(source, options);
    const document2 = parser.parseDocument();
    Object.defineProperty(document2, "tokenCount", {
      enumerable: false,
      value: parser.tokenCount
    });
    return document2;
  }
  var Parser = class {
    constructor(source, options = {}) {
      const sourceObj = isSource(source) ? source : new Source(source);
      this._lexer = new Lexer(sourceObj);
      this._options = options;
      this._tokenCounter = 0;
    }
    get tokenCount() {
      return this._tokenCounter;
    }
    /**
     * Converts a name lex token into a name parse node.
     */
    parseName() {
      const token = this.expectToken(TokenKind.NAME);
      return this.node(token, {
        kind: Kind.NAME,
        value: token.value
      });
    }
    // Implements the parsing rules in the Document section.
    /**
     * Document : Definition+
     */
    parseDocument() {
      return this.node(this._lexer.token, {
        kind: Kind.DOCUMENT,
        definitions: this.many(
          TokenKind.SOF,
          this.parseDefinition,
          TokenKind.EOF
        )
      });
    }
    /**
     * Definition :
     *   - ExecutableDefinition
     *   - TypeSystemDefinition
     *   - TypeSystemExtension
     *
     * ExecutableDefinition :
     *   - OperationDefinition
     *   - FragmentDefinition
     *
     * TypeSystemDefinition :
     *   - SchemaDefinition
     *   - TypeDefinition
     *   - DirectiveDefinition
     *
     * TypeDefinition :
     *   - ScalarTypeDefinition
     *   - ObjectTypeDefinition
     *   - InterfaceTypeDefinition
     *   - UnionTypeDefinition
     *   - EnumTypeDefinition
     *   - InputObjectTypeDefinition
     */
    parseDefinition() {
      if (this.peek(TokenKind.BRACE_L)) {
        return this.parseOperationDefinition();
      }
      const hasDescription = this.peekDescription();
      const keywordToken = hasDescription ? this._lexer.lookahead() : this._lexer.token;
      if (keywordToken.kind === TokenKind.NAME) {
        switch (keywordToken.value) {
          case "schema":
            return this.parseSchemaDefinition();
          case "scalar":
            return this.parseScalarTypeDefinition();
          case "type":
            return this.parseObjectTypeDefinition();
          case "interface":
            return this.parseInterfaceTypeDefinition();
          case "union":
            return this.parseUnionTypeDefinition();
          case "enum":
            return this.parseEnumTypeDefinition();
          case "input":
            return this.parseInputObjectTypeDefinition();
          case "directive":
            return this.parseDirectiveDefinition();
        }
        if (hasDescription) {
          throw syntaxError(
            this._lexer.source,
            this._lexer.token.start,
            "Unexpected description, descriptions are supported only on type definitions."
          );
        }
        switch (keywordToken.value) {
          case "query":
          case "mutation":
          case "subscription":
            return this.parseOperationDefinition();
          case "fragment":
            return this.parseFragmentDefinition();
          case "extend":
            return this.parseTypeSystemExtension();
        }
      }
      throw this.unexpected(keywordToken);
    }
    // Implements the parsing rules in the Operations section.
    /**
     * OperationDefinition :
     *  - SelectionSet
     *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
     */
    parseOperationDefinition() {
      const start = this._lexer.token;
      if (this.peek(TokenKind.BRACE_L)) {
        return this.node(start, {
          kind: Kind.OPERATION_DEFINITION,
          operation: OperationTypeNode.QUERY,
          name: void 0,
          variableDefinitions: [],
          directives: [],
          selectionSet: this.parseSelectionSet()
        });
      }
      const operation = this.parseOperationType();
      let name;
      if (this.peek(TokenKind.NAME)) {
        name = this.parseName();
      }
      return this.node(start, {
        kind: Kind.OPERATION_DEFINITION,
        operation,
        name,
        variableDefinitions: this.parseVariableDefinitions(),
        directives: this.parseDirectives(false),
        selectionSet: this.parseSelectionSet()
      });
    }
    /**
     * OperationType : one of query mutation subscription
     */
    parseOperationType() {
      const operationToken = this.expectToken(TokenKind.NAME);
      switch (operationToken.value) {
        case "query":
          return OperationTypeNode.QUERY;
        case "mutation":
          return OperationTypeNode.MUTATION;
        case "subscription":
          return OperationTypeNode.SUBSCRIPTION;
      }
      throw this.unexpected(operationToken);
    }
    /**
     * VariableDefinitions : ( VariableDefinition+ )
     */
    parseVariableDefinitions() {
      return this.optionalMany(
        TokenKind.PAREN_L,
        this.parseVariableDefinition,
        TokenKind.PAREN_R
      );
    }
    /**
     * VariableDefinition : Variable : Type DefaultValue? Directives[Const]?
     */
    parseVariableDefinition() {
      return this.node(this._lexer.token, {
        kind: Kind.VARIABLE_DEFINITION,
        variable: this.parseVariable(),
        type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
        defaultValue: this.expectOptionalToken(TokenKind.EQUALS) ? this.parseConstValueLiteral() : void 0,
        directives: this.parseConstDirectives()
      });
    }
    /**
     * Variable : $ Name
     */
    parseVariable() {
      const start = this._lexer.token;
      this.expectToken(TokenKind.DOLLAR);
      return this.node(start, {
        kind: Kind.VARIABLE,
        name: this.parseName()
      });
    }
    /**
     * ```
     * SelectionSet : { Selection+ }
     * ```
     */
    parseSelectionSet() {
      return this.node(this._lexer.token, {
        kind: Kind.SELECTION_SET,
        selections: this.many(
          TokenKind.BRACE_L,
          this.parseSelection,
          TokenKind.BRACE_R
        )
      });
    }
    /**
     * Selection :
     *   - Field
     *   - FragmentSpread
     *   - InlineFragment
     */
    parseSelection() {
      return this.peek(TokenKind.SPREAD) ? this.parseFragment() : this.parseField();
    }
    /**
     * Field : Alias? Name Arguments? Directives? SelectionSet?
     *
     * Alias : Name :
     */
    parseField() {
      const start = this._lexer.token;
      const nameOrAlias = this.parseName();
      let alias;
      let name;
      if (this.expectOptionalToken(TokenKind.COLON)) {
        alias = nameOrAlias;
        name = this.parseName();
      } else {
        name = nameOrAlias;
      }
      return this.node(start, {
        kind: Kind.FIELD,
        alias,
        name,
        arguments: this.parseArguments(false),
        directives: this.parseDirectives(false),
        selectionSet: this.peek(TokenKind.BRACE_L) ? this.parseSelectionSet() : void 0
      });
    }
    /**
     * Arguments[Const] : ( Argument[?Const]+ )
     */
    parseArguments(isConst) {
      const item = isConst ? this.parseConstArgument : this.parseArgument;
      return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
    }
    /**
     * Argument[Const] : Name : Value[?Const]
     */
    parseArgument(isConst = false) {
      const start = this._lexer.token;
      const name = this.parseName();
      this.expectToken(TokenKind.COLON);
      return this.node(start, {
        kind: Kind.ARGUMENT,
        name,
        value: this.parseValueLiteral(isConst)
      });
    }
    parseConstArgument() {
      return this.parseArgument(true);
    }
    // Implements the parsing rules in the Fragments section.
    /**
     * Corresponds to both FragmentSpread and InlineFragment in the spec.
     *
     * FragmentSpread : ... FragmentName Directives?
     *
     * InlineFragment : ... TypeCondition? Directives? SelectionSet
     */
    parseFragment() {
      const start = this._lexer.token;
      this.expectToken(TokenKind.SPREAD);
      const hasTypeCondition = this.expectOptionalKeyword("on");
      if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
        return this.node(start, {
          kind: Kind.FRAGMENT_SPREAD,
          name: this.parseFragmentName(),
          directives: this.parseDirectives(false)
        });
      }
      return this.node(start, {
        kind: Kind.INLINE_FRAGMENT,
        typeCondition: hasTypeCondition ? this.parseNamedType() : void 0,
        directives: this.parseDirectives(false),
        selectionSet: this.parseSelectionSet()
      });
    }
    /**
     * FragmentDefinition :
     *   - fragment FragmentName on TypeCondition Directives? SelectionSet
     *
     * TypeCondition : NamedType
     */
    parseFragmentDefinition() {
      const start = this._lexer.token;
      this.expectKeyword("fragment");
      if (this._options.allowLegacyFragmentVariables === true) {
        return this.node(start, {
          kind: Kind.FRAGMENT_DEFINITION,
          name: this.parseFragmentName(),
          variableDefinitions: this.parseVariableDefinitions(),
          typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet()
        });
      }
      return this.node(start, {
        kind: Kind.FRAGMENT_DEFINITION,
        name: this.parseFragmentName(),
        typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
        directives: this.parseDirectives(false),
        selectionSet: this.parseSelectionSet()
      });
    }
    /**
     * FragmentName : Name but not `on`
     */
    parseFragmentName() {
      if (this._lexer.token.value === "on") {
        throw this.unexpected();
      }
      return this.parseName();
    }
    // Implements the parsing rules in the Values section.
    /**
     * Value[Const] :
     *   - [~Const] Variable
     *   - IntValue
     *   - FloatValue
     *   - StringValue
     *   - BooleanValue
     *   - NullValue
     *   - EnumValue
     *   - ListValue[?Const]
     *   - ObjectValue[?Const]
     *
     * BooleanValue : one of `true` `false`
     *
     * NullValue : `null`
     *
     * EnumValue : Name but not `true`, `false` or `null`
     */
    parseValueLiteral(isConst) {
      const token = this._lexer.token;
      switch (token.kind) {
        case TokenKind.BRACKET_L:
          return this.parseList(isConst);
        case TokenKind.BRACE_L:
          return this.parseObject(isConst);
        case TokenKind.INT:
          this.advanceLexer();
          return this.node(token, {
            kind: Kind.INT,
            value: token.value
          });
        case TokenKind.FLOAT:
          this.advanceLexer();
          return this.node(token, {
            kind: Kind.FLOAT,
            value: token.value
          });
        case TokenKind.STRING:
        case TokenKind.BLOCK_STRING:
          return this.parseStringLiteral();
        case TokenKind.NAME:
          this.advanceLexer();
          switch (token.value) {
            case "true":
              return this.node(token, {
                kind: Kind.BOOLEAN,
                value: true
              });
            case "false":
              return this.node(token, {
                kind: Kind.BOOLEAN,
                value: false
              });
            case "null":
              return this.node(token, {
                kind: Kind.NULL
              });
            default:
              return this.node(token, {
                kind: Kind.ENUM,
                value: token.value
              });
          }
        case TokenKind.DOLLAR:
          if (isConst) {
            this.expectToken(TokenKind.DOLLAR);
            if (this._lexer.token.kind === TokenKind.NAME) {
              const varName = this._lexer.token.value;
              throw syntaxError(
                this._lexer.source,
                token.start,
                `Unexpected variable "$${varName}" in constant value.`
              );
            } else {
              throw this.unexpected(token);
            }
          }
          return this.parseVariable();
        default:
          throw this.unexpected();
      }
    }
    parseConstValueLiteral() {
      return this.parseValueLiteral(true);
    }
    parseStringLiteral() {
      const token = this._lexer.token;
      this.advanceLexer();
      return this.node(token, {
        kind: Kind.STRING,
        value: token.value,
        block: token.kind === TokenKind.BLOCK_STRING
      });
    }
    /**
     * ListValue[Const] :
     *   - [ ]
     *   - [ Value[?Const]+ ]
     */
    parseList(isConst) {
      const item = () => this.parseValueLiteral(isConst);
      return this.node(this._lexer.token, {
        kind: Kind.LIST,
        values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R)
      });
    }
    /**
     * ```
     * ObjectValue[Const] :
     *   - { }
     *   - { ObjectField[?Const]+ }
     * ```
     */
    parseObject(isConst) {
      const item = () => this.parseObjectField(isConst);
      return this.node(this._lexer.token, {
        kind: Kind.OBJECT,
        fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R)
      });
    }
    /**
     * ObjectField[Const] : Name : Value[?Const]
     */
    parseObjectField(isConst) {
      const start = this._lexer.token;
      const name = this.parseName();
      this.expectToken(TokenKind.COLON);
      return this.node(start, {
        kind: Kind.OBJECT_FIELD,
        name,
        value: this.parseValueLiteral(isConst)
      });
    }
    // Implements the parsing rules in the Directives section.
    /**
     * Directives[Const] : Directive[?Const]+
     */
    parseDirectives(isConst) {
      const directives = [];
      while (this.peek(TokenKind.AT)) {
        directives.push(this.parseDirective(isConst));
      }
      return directives;
    }
    parseConstDirectives() {
      return this.parseDirectives(true);
    }
    /**
     * ```
     * Directive[Const] : @ Name Arguments[?Const]?
     * ```
     */
    parseDirective(isConst) {
      const start = this._lexer.token;
      this.expectToken(TokenKind.AT);
      return this.node(start, {
        kind: Kind.DIRECTIVE,
        name: this.parseName(),
        arguments: this.parseArguments(isConst)
      });
    }
    // Implements the parsing rules in the Types section.
    /**
     * Type :
     *   - NamedType
     *   - ListType
     *   - NonNullType
     */
    parseTypeReference() {
      const start = this._lexer.token;
      let type;
      if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
        const innerType = this.parseTypeReference();
        this.expectToken(TokenKind.BRACKET_R);
        type = this.node(start, {
          kind: Kind.LIST_TYPE,
          type: innerType
        });
      } else {
        type = this.parseNamedType();
      }
      if (this.expectOptionalToken(TokenKind.BANG)) {
        return this.node(start, {
          kind: Kind.NON_NULL_TYPE,
          type
        });
      }
      return type;
    }
    /**
     * NamedType : Name
     */
    parseNamedType() {
      return this.node(this._lexer.token, {
        kind: Kind.NAMED_TYPE,
        name: this.parseName()
      });
    }
    // Implements the parsing rules in the Type Definition section.
    peekDescription() {
      return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
    }
    /**
     * Description : StringValue
     */
    parseDescription() {
      if (this.peekDescription()) {
        return this.parseStringLiteral();
      }
    }
    /**
     * ```
     * SchemaDefinition : Description? schema Directives[Const]? { OperationTypeDefinition+ }
     * ```
     */
    parseSchemaDefinition() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      this.expectKeyword("schema");
      const directives = this.parseConstDirectives();
      const operationTypes = this.many(
        TokenKind.BRACE_L,
        this.parseOperationTypeDefinition,
        TokenKind.BRACE_R
      );
      return this.node(start, {
        kind: Kind.SCHEMA_DEFINITION,
        description,
        directives,
        operationTypes
      });
    }
    /**
     * OperationTypeDefinition : OperationType : NamedType
     */
    parseOperationTypeDefinition() {
      const start = this._lexer.token;
      const operation = this.parseOperationType();
      this.expectToken(TokenKind.COLON);
      const type = this.parseNamedType();
      return this.node(start, {
        kind: Kind.OPERATION_TYPE_DEFINITION,
        operation,
        type
      });
    }
    /**
     * ScalarTypeDefinition : Description? scalar Name Directives[Const]?
     */
    parseScalarTypeDefinition() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      this.expectKeyword("scalar");
      const name = this.parseName();
      const directives = this.parseConstDirectives();
      return this.node(start, {
        kind: Kind.SCALAR_TYPE_DEFINITION,
        description,
        name,
        directives
      });
    }
    /**
     * ObjectTypeDefinition :
     *   Description?
     *   type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition?
     */
    parseObjectTypeDefinition() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      this.expectKeyword("type");
      const name = this.parseName();
      const interfaces = this.parseImplementsInterfaces();
      const directives = this.parseConstDirectives();
      const fields = this.parseFieldsDefinition();
      return this.node(start, {
        kind: Kind.OBJECT_TYPE_DEFINITION,
        description,
        name,
        interfaces,
        directives,
        fields
      });
    }
    /**
     * ImplementsInterfaces :
     *   - implements `&`? NamedType
     *   - ImplementsInterfaces & NamedType
     */
    parseImplementsInterfaces() {
      return this.expectOptionalKeyword("implements") ? this.delimitedMany(TokenKind.AMP, this.parseNamedType) : [];
    }
    /**
     * ```
     * FieldsDefinition : { FieldDefinition+ }
     * ```
     */
    parseFieldsDefinition() {
      return this.optionalMany(
        TokenKind.BRACE_L,
        this.parseFieldDefinition,
        TokenKind.BRACE_R
      );
    }
    /**
     * FieldDefinition :
     *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
     */
    parseFieldDefinition() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      const name = this.parseName();
      const args = this.parseArgumentDefs();
      this.expectToken(TokenKind.COLON);
      const type = this.parseTypeReference();
      const directives = this.parseConstDirectives();
      return this.node(start, {
        kind: Kind.FIELD_DEFINITION,
        description,
        name,
        arguments: args,
        type,
        directives
      });
    }
    /**
     * ArgumentsDefinition : ( InputValueDefinition+ )
     */
    parseArgumentDefs() {
      return this.optionalMany(
        TokenKind.PAREN_L,
        this.parseInputValueDef,
        TokenKind.PAREN_R
      );
    }
    /**
     * InputValueDefinition :
     *   - Description? Name : Type DefaultValue? Directives[Const]?
     */
    parseInputValueDef() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      const name = this.parseName();
      this.expectToken(TokenKind.COLON);
      const type = this.parseTypeReference();
      let defaultValue;
      if (this.expectOptionalToken(TokenKind.EQUALS)) {
        defaultValue = this.parseConstValueLiteral();
      }
      const directives = this.parseConstDirectives();
      return this.node(start, {
        kind: Kind.INPUT_VALUE_DEFINITION,
        description,
        name,
        type,
        defaultValue,
        directives
      });
    }
    /**
     * InterfaceTypeDefinition :
     *   - Description? interface Name Directives[Const]? FieldsDefinition?
     */
    parseInterfaceTypeDefinition() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      this.expectKeyword("interface");
      const name = this.parseName();
      const interfaces = this.parseImplementsInterfaces();
      const directives = this.parseConstDirectives();
      const fields = this.parseFieldsDefinition();
      return this.node(start, {
        kind: Kind.INTERFACE_TYPE_DEFINITION,
        description,
        name,
        interfaces,
        directives,
        fields
      });
    }
    /**
     * UnionTypeDefinition :
     *   - Description? union Name Directives[Const]? UnionMemberTypes?
     */
    parseUnionTypeDefinition() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      this.expectKeyword("union");
      const name = this.parseName();
      const directives = this.parseConstDirectives();
      const types = this.parseUnionMemberTypes();
      return this.node(start, {
        kind: Kind.UNION_TYPE_DEFINITION,
        description,
        name,
        directives,
        types
      });
    }
    /**
     * UnionMemberTypes :
     *   - = `|`? NamedType
     *   - UnionMemberTypes | NamedType
     */
    parseUnionMemberTypes() {
      return this.expectOptionalToken(TokenKind.EQUALS) ? this.delimitedMany(TokenKind.PIPE, this.parseNamedType) : [];
    }
    /**
     * EnumTypeDefinition :
     *   - Description? enum Name Directives[Const]? EnumValuesDefinition?
     */
    parseEnumTypeDefinition() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      this.expectKeyword("enum");
      const name = this.parseName();
      const directives = this.parseConstDirectives();
      const values = this.parseEnumValuesDefinition();
      return this.node(start, {
        kind: Kind.ENUM_TYPE_DEFINITION,
        description,
        name,
        directives,
        values
      });
    }
    /**
     * ```
     * EnumValuesDefinition : { EnumValueDefinition+ }
     * ```
     */
    parseEnumValuesDefinition() {
      return this.optionalMany(
        TokenKind.BRACE_L,
        this.parseEnumValueDefinition,
        TokenKind.BRACE_R
      );
    }
    /**
     * EnumValueDefinition : Description? EnumValue Directives[Const]?
     */
    parseEnumValueDefinition() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      const name = this.parseEnumValueName();
      const directives = this.parseConstDirectives();
      return this.node(start, {
        kind: Kind.ENUM_VALUE_DEFINITION,
        description,
        name,
        directives
      });
    }
    /**
     * EnumValue : Name but not `true`, `false` or `null`
     */
    parseEnumValueName() {
      if (this._lexer.token.value === "true" || this._lexer.token.value === "false" || this._lexer.token.value === "null") {
        throw syntaxError(
          this._lexer.source,
          this._lexer.token.start,
          `${getTokenDesc(
            this._lexer.token
          )} is reserved and cannot be used for an enum value.`
        );
      }
      return this.parseName();
    }
    /**
     * InputObjectTypeDefinition :
     *   - Description? input Name Directives[Const]? InputFieldsDefinition?
     */
    parseInputObjectTypeDefinition() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      this.expectKeyword("input");
      const name = this.parseName();
      const directives = this.parseConstDirectives();
      const fields = this.parseInputFieldsDefinition();
      return this.node(start, {
        kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
        description,
        name,
        directives,
        fields
      });
    }
    /**
     * ```
     * InputFieldsDefinition : { InputValueDefinition+ }
     * ```
     */
    parseInputFieldsDefinition() {
      return this.optionalMany(
        TokenKind.BRACE_L,
        this.parseInputValueDef,
        TokenKind.BRACE_R
      );
    }
    /**
     * TypeSystemExtension :
     *   - SchemaExtension
     *   - TypeExtension
     *
     * TypeExtension :
     *   - ScalarTypeExtension
     *   - ObjectTypeExtension
     *   - InterfaceTypeExtension
     *   - UnionTypeExtension
     *   - EnumTypeExtension
     *   - InputObjectTypeDefinition
     */
    parseTypeSystemExtension() {
      const keywordToken = this._lexer.lookahead();
      if (keywordToken.kind === TokenKind.NAME) {
        switch (keywordToken.value) {
          case "schema":
            return this.parseSchemaExtension();
          case "scalar":
            return this.parseScalarTypeExtension();
          case "type":
            return this.parseObjectTypeExtension();
          case "interface":
            return this.parseInterfaceTypeExtension();
          case "union":
            return this.parseUnionTypeExtension();
          case "enum":
            return this.parseEnumTypeExtension();
          case "input":
            return this.parseInputObjectTypeExtension();
        }
      }
      throw this.unexpected(keywordToken);
    }
    /**
     * ```
     * SchemaExtension :
     *  - extend schema Directives[Const]? { OperationTypeDefinition+ }
     *  - extend schema Directives[Const]
     * ```
     */
    parseSchemaExtension() {
      const start = this._lexer.token;
      this.expectKeyword("extend");
      this.expectKeyword("schema");
      const directives = this.parseConstDirectives();
      const operationTypes = this.optionalMany(
        TokenKind.BRACE_L,
        this.parseOperationTypeDefinition,
        TokenKind.BRACE_R
      );
      if (directives.length === 0 && operationTypes.length === 0) {
        throw this.unexpected();
      }
      return this.node(start, {
        kind: Kind.SCHEMA_EXTENSION,
        directives,
        operationTypes
      });
    }
    /**
     * ScalarTypeExtension :
     *   - extend scalar Name Directives[Const]
     */
    parseScalarTypeExtension() {
      const start = this._lexer.token;
      this.expectKeyword("extend");
      this.expectKeyword("scalar");
      const name = this.parseName();
      const directives = this.parseConstDirectives();
      if (directives.length === 0) {
        throw this.unexpected();
      }
      return this.node(start, {
        kind: Kind.SCALAR_TYPE_EXTENSION,
        name,
        directives
      });
    }
    /**
     * ObjectTypeExtension :
     *  - extend type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
     *  - extend type Name ImplementsInterfaces? Directives[Const]
     *  - extend type Name ImplementsInterfaces
     */
    parseObjectTypeExtension() {
      const start = this._lexer.token;
      this.expectKeyword("extend");
      this.expectKeyword("type");
      const name = this.parseName();
      const interfaces = this.parseImplementsInterfaces();
      const directives = this.parseConstDirectives();
      const fields = this.parseFieldsDefinition();
      if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
        throw this.unexpected();
      }
      return this.node(start, {
        kind: Kind.OBJECT_TYPE_EXTENSION,
        name,
        interfaces,
        directives,
        fields
      });
    }
    /**
     * InterfaceTypeExtension :
     *  - extend interface Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
     *  - extend interface Name ImplementsInterfaces? Directives[Const]
     *  - extend interface Name ImplementsInterfaces
     */
    parseInterfaceTypeExtension() {
      const start = this._lexer.token;
      this.expectKeyword("extend");
      this.expectKeyword("interface");
      const name = this.parseName();
      const interfaces = this.parseImplementsInterfaces();
      const directives = this.parseConstDirectives();
      const fields = this.parseFieldsDefinition();
      if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
        throw this.unexpected();
      }
      return this.node(start, {
        kind: Kind.INTERFACE_TYPE_EXTENSION,
        name,
        interfaces,
        directives,
        fields
      });
    }
    /**
     * UnionTypeExtension :
     *   - extend union Name Directives[Const]? UnionMemberTypes
     *   - extend union Name Directives[Const]
     */
    parseUnionTypeExtension() {
      const start = this._lexer.token;
      this.expectKeyword("extend");
      this.expectKeyword("union");
      const name = this.parseName();
      const directives = this.parseConstDirectives();
      const types = this.parseUnionMemberTypes();
      if (directives.length === 0 && types.length === 0) {
        throw this.unexpected();
      }
      return this.node(start, {
        kind: Kind.UNION_TYPE_EXTENSION,
        name,
        directives,
        types
      });
    }
    /**
     * EnumTypeExtension :
     *   - extend enum Name Directives[Const]? EnumValuesDefinition
     *   - extend enum Name Directives[Const]
     */
    parseEnumTypeExtension() {
      const start = this._lexer.token;
      this.expectKeyword("extend");
      this.expectKeyword("enum");
      const name = this.parseName();
      const directives = this.parseConstDirectives();
      const values = this.parseEnumValuesDefinition();
      if (directives.length === 0 && values.length === 0) {
        throw this.unexpected();
      }
      return this.node(start, {
        kind: Kind.ENUM_TYPE_EXTENSION,
        name,
        directives,
        values
      });
    }
    /**
     * InputObjectTypeExtension :
     *   - extend input Name Directives[Const]? InputFieldsDefinition
     *   - extend input Name Directives[Const]
     */
    parseInputObjectTypeExtension() {
      const start = this._lexer.token;
      this.expectKeyword("extend");
      this.expectKeyword("input");
      const name = this.parseName();
      const directives = this.parseConstDirectives();
      const fields = this.parseInputFieldsDefinition();
      if (directives.length === 0 && fields.length === 0) {
        throw this.unexpected();
      }
      return this.node(start, {
        kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
        name,
        directives,
        fields
      });
    }
    /**
     * ```
     * DirectiveDefinition :
     *   - Description? directive @ Name ArgumentsDefinition? `repeatable`? on DirectiveLocations
     * ```
     */
    parseDirectiveDefinition() {
      const start = this._lexer.token;
      const description = this.parseDescription();
      this.expectKeyword("directive");
      this.expectToken(TokenKind.AT);
      const name = this.parseName();
      const args = this.parseArgumentDefs();
      const repeatable = this.expectOptionalKeyword("repeatable");
      this.expectKeyword("on");
      const locations = this.parseDirectiveLocations();
      return this.node(start, {
        kind: Kind.DIRECTIVE_DEFINITION,
        description,
        name,
        arguments: args,
        repeatable,
        locations
      });
    }
    /**
     * DirectiveLocations :
     *   - `|`? DirectiveLocation
     *   - DirectiveLocations | DirectiveLocation
     */
    parseDirectiveLocations() {
      return this.delimitedMany(TokenKind.PIPE, this.parseDirectiveLocation);
    }
    /*
     * DirectiveLocation :
     *   - ExecutableDirectiveLocation
     *   - TypeSystemDirectiveLocation
     *
     * ExecutableDirectiveLocation : one of
     *   `QUERY`
     *   `MUTATION`
     *   `SUBSCRIPTION`
     *   `FIELD`
     *   `FRAGMENT_DEFINITION`
     *   `FRAGMENT_SPREAD`
     *   `INLINE_FRAGMENT`
     *
     * TypeSystemDirectiveLocation : one of
     *   `SCHEMA`
     *   `SCALAR`
     *   `OBJECT`
     *   `FIELD_DEFINITION`
     *   `ARGUMENT_DEFINITION`
     *   `INTERFACE`
     *   `UNION`
     *   `ENUM`
     *   `ENUM_VALUE`
     *   `INPUT_OBJECT`
     *   `INPUT_FIELD_DEFINITION`
     */
    parseDirectiveLocation() {
      const start = this._lexer.token;
      const name = this.parseName();
      if (Object.prototype.hasOwnProperty.call(DirectiveLocation, name.value)) {
        return name;
      }
      throw this.unexpected(start);
    }
    // Core parsing utility functions
    /**
     * Returns a node that, if configured to do so, sets a "loc" field as a
     * location object, used to identify the place in the source that created a
     * given parsed object.
     */
    node(startToken, node) {
      if (this._options.noLocation !== true) {
        node.loc = new Location(
          startToken,
          this._lexer.lastToken,
          this._lexer.source
        );
      }
      return node;
    }
    /**
     * Determines if the next token is of a given kind
     */
    peek(kind) {
      return this._lexer.token.kind === kind;
    }
    /**
     * If the next token is of the given kind, return that token after advancing the lexer.
     * Otherwise, do not change the parser state and throw an error.
     */
    expectToken(kind) {
      const token = this._lexer.token;
      if (token.kind === kind) {
        this.advanceLexer();
        return token;
      }
      throw syntaxError(
        this._lexer.source,
        token.start,
        `Expected ${getTokenKindDesc(kind)}, found ${getTokenDesc(token)}.`
      );
    }
    /**
     * If the next token is of the given kind, return "true" after advancing the lexer.
     * Otherwise, do not change the parser state and return "false".
     */
    expectOptionalToken(kind) {
      const token = this._lexer.token;
      if (token.kind === kind) {
        this.advanceLexer();
        return true;
      }
      return false;
    }
    /**
     * If the next token is a given keyword, advance the lexer.
     * Otherwise, do not change the parser state and throw an error.
     */
    expectKeyword(value) {
      const token = this._lexer.token;
      if (token.kind === TokenKind.NAME && token.value === value) {
        this.advanceLexer();
      } else {
        throw syntaxError(
          this._lexer.source,
          token.start,
          `Expected "${value}", found ${getTokenDesc(token)}.`
        );
      }
    }
    /**
     * If the next token is a given keyword, return "true" after advancing the lexer.
     * Otherwise, do not change the parser state and return "false".
     */
    expectOptionalKeyword(value) {
      const token = this._lexer.token;
      if (token.kind === TokenKind.NAME && token.value === value) {
        this.advanceLexer();
        return true;
      }
      return false;
    }
    /**
     * Helper function for creating an error when an unexpected lexed token is encountered.
     */
    unexpected(atToken) {
      const token = atToken !== null && atToken !== void 0 ? atToken : this._lexer.token;
      return syntaxError(
        this._lexer.source,
        token.start,
        `Unexpected ${getTokenDesc(token)}.`
      );
    }
    /**
     * Returns a possibly empty list of parse nodes, determined by the parseFn.
     * This list begins with a lex token of openKind and ends with a lex token of closeKind.
     * Advances the parser to the next lex token after the closing token.
     */
    any(openKind, parseFn, closeKind) {
      this.expectToken(openKind);
      const nodes = [];
      while (!this.expectOptionalToken(closeKind)) {
        nodes.push(parseFn.call(this));
      }
      return nodes;
    }
    /**
     * Returns a list of parse nodes, determined by the parseFn.
     * It can be empty only if open token is missing otherwise it will always return non-empty list
     * that begins with a lex token of openKind and ends with a lex token of closeKind.
     * Advances the parser to the next lex token after the closing token.
     */
    optionalMany(openKind, parseFn, closeKind) {
      if (this.expectOptionalToken(openKind)) {
        const nodes = [];
        do {
          nodes.push(parseFn.call(this));
        } while (!this.expectOptionalToken(closeKind));
        return nodes;
      }
      return [];
    }
    /**
     * Returns a non-empty list of parse nodes, determined by the parseFn.
     * This list begins with a lex token of openKind and ends with a lex token of closeKind.
     * Advances the parser to the next lex token after the closing token.
     */
    many(openKind, parseFn, closeKind) {
      this.expectToken(openKind);
      const nodes = [];
      do {
        nodes.push(parseFn.call(this));
      } while (!this.expectOptionalToken(closeKind));
      return nodes;
    }
    /**
     * Returns a non-empty list of parse nodes, determined by the parseFn.
     * This list may begin with a lex token of delimiterKind followed by items separated by lex tokens of tokenKind.
     * Advances the parser to the next lex token after last item in the list.
     */
    delimitedMany(delimiterKind, parseFn) {
      this.expectOptionalToken(delimiterKind);
      const nodes = [];
      do {
        nodes.push(parseFn.call(this));
      } while (this.expectOptionalToken(delimiterKind));
      return nodes;
    }
    advanceLexer() {
      const { maxTokens } = this._options;
      const token = this._lexer.advance();
      if (token.kind !== TokenKind.EOF) {
        ++this._tokenCounter;
        if (maxTokens !== void 0 && this._tokenCounter > maxTokens) {
          throw syntaxError(
            this._lexer.source,
            token.start,
            `Document contains more that ${maxTokens} tokens. Parsing aborted.`
          );
        }
      }
    }
  };
  function getTokenDesc(token) {
    const value = token.value;
    return getTokenKindDesc(token.kind) + (value != null ? ` "${value}"` : "");
  }
  function getTokenKindDesc(kind) {
    return isPunctuatorTokenKind(kind) ? `"${kind}"` : kind;
  }

  // node_modules/graphql/language/printString.mjs
  function printString(str) {
    return `"${str.replace(escapedRegExp, escapedReplacer)}"`;
  }
  var escapedRegExp = /[\x00-\x1f\x22\x5c\x7f-\x9f]/g;
  function escapedReplacer(str) {
    return escapeSequences[str.charCodeAt(0)];
  }
  var escapeSequences = [
    "\\u0000",
    "\\u0001",
    "\\u0002",
    "\\u0003",
    "\\u0004",
    "\\u0005",
    "\\u0006",
    "\\u0007",
    "\\b",
    "\\t",
    "\\n",
    "\\u000B",
    "\\f",
    "\\r",
    "\\u000E",
    "\\u000F",
    "\\u0010",
    "\\u0011",
    "\\u0012",
    "\\u0013",
    "\\u0014",
    "\\u0015",
    "\\u0016",
    "\\u0017",
    "\\u0018",
    "\\u0019",
    "\\u001A",
    "\\u001B",
    "\\u001C",
    "\\u001D",
    "\\u001E",
    "\\u001F",
    "",
    "",
    '\\"',
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    // 2F
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    // 3F
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    // 4F
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "\\\\",
    "",
    "",
    "",
    // 5F
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    // 6F
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "\\u007F",
    "\\u0080",
    "\\u0081",
    "\\u0082",
    "\\u0083",
    "\\u0084",
    "\\u0085",
    "\\u0086",
    "\\u0087",
    "\\u0088",
    "\\u0089",
    "\\u008A",
    "\\u008B",
    "\\u008C",
    "\\u008D",
    "\\u008E",
    "\\u008F",
    "\\u0090",
    "\\u0091",
    "\\u0092",
    "\\u0093",
    "\\u0094",
    "\\u0095",
    "\\u0096",
    "\\u0097",
    "\\u0098",
    "\\u0099",
    "\\u009A",
    "\\u009B",
    "\\u009C",
    "\\u009D",
    "\\u009E",
    "\\u009F"
  ];

  // node_modules/graphql/language/visitor.mjs
  var BREAK = Object.freeze({});
  function visit(root2, visitor, visitorKeys = QueryDocumentKeys) {
    const enterLeaveMap = /* @__PURE__ */ new Map();
    for (const kind of Object.values(Kind)) {
      enterLeaveMap.set(kind, getEnterLeaveForKind(visitor, kind));
    }
    let stack = void 0;
    let inArray = Array.isArray(root2);
    let keys = [root2];
    let index = -1;
    let edits = [];
    let node = root2;
    let key = void 0;
    let parent = void 0;
    const path = [];
    const ancestors = [];
    do {
      index++;
      const isLeaving = index === keys.length;
      const isEdited = isLeaving && edits.length !== 0;
      if (isLeaving) {
        key = ancestors.length === 0 ? void 0 : path[path.length - 1];
        node = parent;
        parent = ancestors.pop();
        if (isEdited) {
          if (inArray) {
            node = node.slice();
            let editOffset = 0;
            for (const [editKey, editValue] of edits) {
              const arrayKey = editKey - editOffset;
              if (editValue === null) {
                node.splice(arrayKey, 1);
                editOffset++;
              } else {
                node[arrayKey] = editValue;
              }
            }
          } else {
            node = { ...node };
            for (const [editKey, editValue] of edits) {
              node[editKey] = editValue;
            }
          }
        }
        index = stack.index;
        keys = stack.keys;
        edits = stack.edits;
        inArray = stack.inArray;
        stack = stack.prev;
      } else if (parent) {
        key = inArray ? index : keys[index];
        node = parent[key];
        if (node === null || node === void 0) {
          continue;
        }
        path.push(key);
      }
      let result2;
      if (!Array.isArray(node)) {
        var _enterLeaveMap$get, _enterLeaveMap$get2;
        isNode(node) || devAssert(false, `Invalid AST Node: ${inspect(node)}.`);
        const visitFn = isLeaving ? (_enterLeaveMap$get = enterLeaveMap.get(node.kind)) === null || _enterLeaveMap$get === void 0 ? void 0 : _enterLeaveMap$get.leave : (_enterLeaveMap$get2 = enterLeaveMap.get(node.kind)) === null || _enterLeaveMap$get2 === void 0 ? void 0 : _enterLeaveMap$get2.enter;
        result2 = visitFn === null || visitFn === void 0 ? void 0 : visitFn.call(visitor, node, key, parent, path, ancestors);
        if (result2 === BREAK) {
          break;
        }
        if (result2 === false) {
          if (!isLeaving) {
            path.pop();
            continue;
          }
        } else if (result2 !== void 0) {
          edits.push([key, result2]);
          if (!isLeaving) {
            if (isNode(result2)) {
              node = result2;
            } else {
              path.pop();
              continue;
            }
          }
        }
      }
      if (result2 === void 0 && isEdited) {
        edits.push([key, node]);
      }
      if (isLeaving) {
        path.pop();
      } else {
        var _node$kind;
        stack = {
          inArray,
          index,
          keys,
          edits,
          prev: stack
        };
        inArray = Array.isArray(node);
        keys = inArray ? node : (_node$kind = visitorKeys[node.kind]) !== null && _node$kind !== void 0 ? _node$kind : [];
        index = -1;
        edits = [];
        if (parent) {
          ancestors.push(parent);
        }
        parent = node;
      }
    } while (stack !== void 0);
    if (edits.length !== 0) {
      return edits[edits.length - 1][1];
    }
    return root2;
  }
  function getEnterLeaveForKind(visitor, kind) {
    const kindVisitor = visitor[kind];
    if (typeof kindVisitor === "object") {
      return kindVisitor;
    } else if (typeof kindVisitor === "function") {
      return {
        enter: kindVisitor,
        leave: void 0
      };
    }
    return {
      enter: visitor.enter,
      leave: visitor.leave
    };
  }

  // node_modules/graphql/language/printer.mjs
  function print(ast) {
    return visit(ast, printDocASTReducer);
  }
  var MAX_LINE_LENGTH = 80;
  var printDocASTReducer = {
    Name: {
      leave: (node) => node.value
    },
    Variable: {
      leave: (node) => "$" + node.name
    },
    // Document
    Document: {
      leave: (node) => join(node.definitions, "\n\n")
    },
    OperationDefinition: {
      leave(node) {
        const varDefs = wrap2("(", join(node.variableDefinitions, ", "), ")");
        const prefix = join(
          [
            node.operation,
            join([node.name, varDefs]),
            join(node.directives, " ")
          ],
          " "
        );
        return (prefix === "query" ? "" : prefix + " ") + node.selectionSet;
      }
    },
    VariableDefinition: {
      leave: ({ variable, type, defaultValue, directives }) => variable + ": " + type + wrap2(" = ", defaultValue) + wrap2(" ", join(directives, " "))
    },
    SelectionSet: {
      leave: ({ selections }) => block(selections)
    },
    Field: {
      leave({ alias, name, arguments: args, directives, selectionSet }) {
        const prefix = wrap2("", alias, ": ") + name;
        let argsLine = prefix + wrap2("(", join(args, ", "), ")");
        if (argsLine.length > MAX_LINE_LENGTH) {
          argsLine = prefix + wrap2("(\n", indent(join(args, "\n")), "\n)");
        }
        return join([argsLine, join(directives, " "), selectionSet], " ");
      }
    },
    Argument: {
      leave: ({ name, value }) => name + ": " + value
    },
    // Fragments
    FragmentSpread: {
      leave: ({ name, directives }) => "..." + name + wrap2(" ", join(directives, " "))
    },
    InlineFragment: {
      leave: ({ typeCondition, directives, selectionSet }) => join(
        [
          "...",
          wrap2("on ", typeCondition),
          join(directives, " "),
          selectionSet
        ],
        " "
      )
    },
    FragmentDefinition: {
      leave: ({ name, typeCondition, variableDefinitions, directives, selectionSet }) => (
        // or removed in the future.
        `fragment ${name}${wrap2("(", join(variableDefinitions, ", "), ")")} on ${typeCondition} ${wrap2("", join(directives, " "), " ")}` + selectionSet
      )
    },
    // Value
    IntValue: {
      leave: ({ value }) => value
    },
    FloatValue: {
      leave: ({ value }) => value
    },
    StringValue: {
      leave: ({ value, block: isBlockString }) => isBlockString ? printBlockString(value) : printString(value)
    },
    BooleanValue: {
      leave: ({ value }) => value ? "true" : "false"
    },
    NullValue: {
      leave: () => "null"
    },
    EnumValue: {
      leave: ({ value }) => value
    },
    ListValue: {
      leave: ({ values }) => "[" + join(values, ", ") + "]"
    },
    ObjectValue: {
      leave: ({ fields }) => "{" + join(fields, ", ") + "}"
    },
    ObjectField: {
      leave: ({ name, value }) => name + ": " + value
    },
    // Directive
    Directive: {
      leave: ({ name, arguments: args }) => "@" + name + wrap2("(", join(args, ", "), ")")
    },
    // Type
    NamedType: {
      leave: ({ name }) => name
    },
    ListType: {
      leave: ({ type }) => "[" + type + "]"
    },
    NonNullType: {
      leave: ({ type }) => type + "!"
    },
    // Type System Definitions
    SchemaDefinition: {
      leave: ({ description, directives, operationTypes }) => wrap2("", description, "\n") + join(["schema", join(directives, " "), block(operationTypes)], " ")
    },
    OperationTypeDefinition: {
      leave: ({ operation, type }) => operation + ": " + type
    },
    ScalarTypeDefinition: {
      leave: ({ description, name, directives }) => wrap2("", description, "\n") + join(["scalar", name, join(directives, " ")], " ")
    },
    ObjectTypeDefinition: {
      leave: ({ description, name, interfaces, directives, fields }) => wrap2("", description, "\n") + join(
        [
          "type",
          name,
          wrap2("implements ", join(interfaces, " & ")),
          join(directives, " "),
          block(fields)
        ],
        " "
      )
    },
    FieldDefinition: {
      leave: ({ description, name, arguments: args, type, directives }) => wrap2("", description, "\n") + name + (hasMultilineItems(args) ? wrap2("(\n", indent(join(args, "\n")), "\n)") : wrap2("(", join(args, ", "), ")")) + ": " + type + wrap2(" ", join(directives, " "))
    },
    InputValueDefinition: {
      leave: ({ description, name, type, defaultValue, directives }) => wrap2("", description, "\n") + join(
        [name + ": " + type, wrap2("= ", defaultValue), join(directives, " ")],
        " "
      )
    },
    InterfaceTypeDefinition: {
      leave: ({ description, name, interfaces, directives, fields }) => wrap2("", description, "\n") + join(
        [
          "interface",
          name,
          wrap2("implements ", join(interfaces, " & ")),
          join(directives, " "),
          block(fields)
        ],
        " "
      )
    },
    UnionTypeDefinition: {
      leave: ({ description, name, directives, types }) => wrap2("", description, "\n") + join(
        ["union", name, join(directives, " "), wrap2("= ", join(types, " | "))],
        " "
      )
    },
    EnumTypeDefinition: {
      leave: ({ description, name, directives, values }) => wrap2("", description, "\n") + join(["enum", name, join(directives, " "), block(values)], " ")
    },
    EnumValueDefinition: {
      leave: ({ description, name, directives }) => wrap2("", description, "\n") + join([name, join(directives, " ")], " ")
    },
    InputObjectTypeDefinition: {
      leave: ({ description, name, directives, fields }) => wrap2("", description, "\n") + join(["input", name, join(directives, " "), block(fields)], " ")
    },
    DirectiveDefinition: {
      leave: ({ description, name, arguments: args, repeatable, locations }) => wrap2("", description, "\n") + "directive @" + name + (hasMultilineItems(args) ? wrap2("(\n", indent(join(args, "\n")), "\n)") : wrap2("(", join(args, ", "), ")")) + (repeatable ? " repeatable" : "") + " on " + join(locations, " | ")
    },
    SchemaExtension: {
      leave: ({ directives, operationTypes }) => join(
        ["extend schema", join(directives, " "), block(operationTypes)],
        " "
      )
    },
    ScalarTypeExtension: {
      leave: ({ name, directives }) => join(["extend scalar", name, join(directives, " ")], " ")
    },
    ObjectTypeExtension: {
      leave: ({ name, interfaces, directives, fields }) => join(
        [
          "extend type",
          name,
          wrap2("implements ", join(interfaces, " & ")),
          join(directives, " "),
          block(fields)
        ],
        " "
      )
    },
    InterfaceTypeExtension: {
      leave: ({ name, interfaces, directives, fields }) => join(
        [
          "extend interface",
          name,
          wrap2("implements ", join(interfaces, " & ")),
          join(directives, " "),
          block(fields)
        ],
        " "
      )
    },
    UnionTypeExtension: {
      leave: ({ name, directives, types }) => join(
        [
          "extend union",
          name,
          join(directives, " "),
          wrap2("= ", join(types, " | "))
        ],
        " "
      )
    },
    EnumTypeExtension: {
      leave: ({ name, directives, values }) => join(["extend enum", name, join(directives, " "), block(values)], " ")
    },
    InputObjectTypeExtension: {
      leave: ({ name, directives, fields }) => join(["extend input", name, join(directives, " "), block(fields)], " ")
    }
  };
  function join(maybeArray, separator = "") {
    var _maybeArray$filter$jo;
    return (_maybeArray$filter$jo = maybeArray === null || maybeArray === void 0 ? void 0 : maybeArray.filter((x) => x).join(separator)) !== null && _maybeArray$filter$jo !== void 0 ? _maybeArray$filter$jo : "";
  }
  function block(array) {
    return wrap2("{\n", indent(join(array, "\n")), "\n}");
  }
  function wrap2(start, maybeString, end = "") {
    return maybeString != null && maybeString !== "" ? start + maybeString + end : "";
  }
  function indent(str) {
    return wrap2("  ", str.replace(/\n/g, "\n  "));
  }
  function hasMultilineItems(maybeArray) {
    var _maybeArray$some;
    return (_maybeArray$some = maybeArray === null || maybeArray === void 0 ? void 0 : maybeArray.some((str) => str.includes("\n"))) !== null && _maybeArray$some !== void 0 ? _maybeArray$some : false;
  }

  // node_modules/graphql/language/predicates.mjs
  function isSelectionNode(node) {
    return node.kind === Kind.FIELD || node.kind === Kind.FRAGMENT_SPREAD || node.kind === Kind.INLINE_FRAGMENT;
  }

  // node_modules/@apollo/client/utilities/graphql/directives.js
  function shouldInclude(_a2, variables) {
    var directives = _a2.directives;
    if (!directives || !directives.length) {
      return true;
    }
    return getInclusionDirectives(directives).every(function(_a3) {
      var directive = _a3.directive, ifArgument = _a3.ifArgument;
      var evaledValue = false;
      if (ifArgument.value.kind === "Variable") {
        evaledValue = variables && variables[ifArgument.value.name.value];
        invariant2(evaledValue !== void 0, 78, directive.name.value);
      } else {
        evaledValue = ifArgument.value.value;
      }
      return directive.name.value === "skip" ? !evaledValue : evaledValue;
    });
  }
  function hasDirectives(names, root2, all) {
    var nameSet = new Set(names);
    var uniqueCount = nameSet.size;
    visit(root2, {
      Directive: function(node) {
        if (nameSet.delete(node.name.value) && (!all || !nameSet.size)) {
          return BREAK;
        }
      }
    });
    return all ? !nameSet.size : nameSet.size < uniqueCount;
  }
  function hasClientExports(document2) {
    return document2 && hasDirectives(["client", "export"], document2, true);
  }
  function isInclusionDirective(_a2) {
    var value = _a2.name.value;
    return value === "skip" || value === "include";
  }
  function getInclusionDirectives(directives) {
    var result2 = [];
    if (directives && directives.length) {
      directives.forEach(function(directive) {
        if (!isInclusionDirective(directive))
          return;
        var directiveArguments = directive.arguments;
        var directiveName = directive.name.value;
        invariant2(directiveArguments && directiveArguments.length === 1, 79, directiveName);
        var ifArgument = directiveArguments[0];
        invariant2(ifArgument.name && ifArgument.name.value === "if", 80, directiveName);
        var ifValue = ifArgument.value;
        invariant2(ifValue && (ifValue.kind === "Variable" || ifValue.kind === "BooleanValue"), 81, directiveName);
        result2.push({ directive, ifArgument });
      });
    }
    return result2;
  }
  function getFragmentMaskMode(fragment) {
    var _a2, _b;
    var directive = (_a2 = fragment.directives) === null || _a2 === void 0 ? void 0 : _a2.find(function(_a3) {
      var name = _a3.name;
      return name.value === "unmask";
    });
    if (!directive) {
      return "mask";
    }
    var modeArg = (_b = directive.arguments) === null || _b === void 0 ? void 0 : _b.find(function(_a3) {
      var name = _a3.name;
      return name.value === "mode";
    });
    if (globalThis.__DEV__ !== false) {
      if (modeArg) {
        if (modeArg.value.kind === Kind.VARIABLE) {
          globalThis.__DEV__ !== false && invariant2.warn(82);
        } else if (modeArg.value.kind !== Kind.STRING) {
          globalThis.__DEV__ !== false && invariant2.warn(83);
        } else if (modeArg.value.value !== "migrate") {
          globalThis.__DEV__ !== false && invariant2.warn(84, modeArg.value.value);
        }
      }
    }
    if (modeArg && "value" in modeArg.value && modeArg.value.value === "migrate") {
      return "migrate";
    }
    return "unmask";
  }

  // node_modules/@wry/trie/lib/index.js
  var defaultMakeData = () => /* @__PURE__ */ Object.create(null);
  var { forEach, slice } = Array.prototype;
  var { hasOwnProperty } = Object.prototype;
  var Trie = class _Trie {
    constructor(weakness = true, makeData = defaultMakeData) {
      this.weakness = weakness;
      this.makeData = makeData;
    }
    lookup() {
      return this.lookupArray(arguments);
    }
    lookupArray(array) {
      let node = this;
      forEach.call(array, (key) => node = node.getChildTrie(key));
      return hasOwnProperty.call(node, "data") ? node.data : node.data = this.makeData(slice.call(array));
    }
    peek() {
      return this.peekArray(arguments);
    }
    peekArray(array) {
      let node = this;
      for (let i = 0, len = array.length; node && i < len; ++i) {
        const map = node.mapFor(array[i], false);
        node = map && map.get(array[i]);
      }
      return node && node.data;
    }
    remove() {
      return this.removeArray(arguments);
    }
    removeArray(array) {
      let data;
      if (array.length) {
        const head = array[0];
        const map = this.mapFor(head, false);
        const child = map && map.get(head);
        if (child) {
          data = child.removeArray(slice.call(array, 1));
          if (!child.data && !child.weak && !(child.strong && child.strong.size)) {
            map.delete(head);
          }
        }
      } else {
        data = this.data;
        delete this.data;
      }
      return data;
    }
    getChildTrie(key) {
      const map = this.mapFor(key, true);
      let child = map.get(key);
      if (!child)
        map.set(key, child = new _Trie(this.weakness, this.makeData));
      return child;
    }
    mapFor(key, create) {
      return this.weakness && isObjRef(key) ? this.weak || (create ? this.weak = /* @__PURE__ */ new WeakMap() : void 0) : this.strong || (create ? this.strong = /* @__PURE__ */ new Map() : void 0);
    }
  };
  function isObjRef(value) {
    switch (typeof value) {
      case "object":
        if (value === null)
          break;
      // Fall through to return true...
      case "function":
        return true;
    }
    return false;
  }

  // node_modules/@apollo/client/utilities/common/canUse.js
  var isReactNative = maybe(function() {
    return navigator.product;
  }) == "ReactNative";
  var canUseWeakMap = typeof WeakMap === "function" && !(isReactNative && !global.HermesInternal);
  var canUseWeakSet = typeof WeakSet === "function";
  var canUseSymbol = typeof Symbol === "function" && typeof Symbol.for === "function";
  var canUseAsyncIteratorSymbol = canUseSymbol && Symbol.asyncIterator;
  var canUseDOM = typeof maybe(function() {
    return window.document.createElement;
  }) === "function";
  var usingJSDOM = (
    // Following advice found in this comment from @domenic (maintainer of jsdom):
    // https://github.com/jsdom/jsdom/issues/1537#issuecomment-229405327
    //
    // Since we control the version of Jest and jsdom used when running Apollo
    // Client tests, and that version is recent enought to include " jsdom/x.y.z"
    // at the end of the user agent string, I believe this case is all we need to
    // check. Testing for "Node.js" was recommended for backwards compatibility
    // with older version of jsdom, but we don't have that problem.
    maybe(function() {
      return navigator.userAgent.indexOf("jsdom") >= 0;
    }) || false
  );

  // node_modules/@apollo/client/utilities/common/objects.js
  function isNonNullObject(obj) {
    return obj !== null && typeof obj === "object";
  }

  // node_modules/@apollo/client/utilities/graphql/fragments.js
  function getFragmentQueryDocument(document2, fragmentName) {
    var actualFragmentName = fragmentName;
    var fragments = [];
    document2.definitions.forEach(function(definition) {
      if (definition.kind === "OperationDefinition") {
        throw newInvariantError(
          85,
          definition.operation,
          definition.name ? " named '".concat(definition.name.value, "'") : ""
        );
      }
      if (definition.kind === "FragmentDefinition") {
        fragments.push(definition);
      }
    });
    if (typeof actualFragmentName === "undefined") {
      invariant2(fragments.length === 1, 86, fragments.length);
      actualFragmentName = fragments[0].name.value;
    }
    var query = __assign(__assign({}, document2), { definitions: __spreadArray([
      {
        kind: "OperationDefinition",
        // OperationTypeNode is an enum
        operation: "query",
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "FragmentSpread",
              name: {
                kind: "Name",
                value: actualFragmentName
              }
            }
          ]
        }
      }
    ], document2.definitions, true) });
    return query;
  }
  function createFragmentMap(fragments) {
    if (fragments === void 0) {
      fragments = [];
    }
    var symTable = {};
    fragments.forEach(function(fragment) {
      symTable[fragment.name.value] = fragment;
    });
    return symTable;
  }
  function getFragmentFromSelection(selection, fragmentMap) {
    switch (selection.kind) {
      case "InlineFragment":
        return selection;
      case "FragmentSpread": {
        var fragmentName = selection.name.value;
        if (typeof fragmentMap === "function") {
          return fragmentMap(fragmentName);
        }
        var fragment = fragmentMap && fragmentMap[fragmentName];
        invariant2(fragment, 87, fragmentName);
        return fragment || null;
      }
      default:
        return null;
    }
  }
  function isFullyUnmaskedOperation(document2) {
    var isUnmasked = true;
    visit(document2, {
      FragmentSpread: function(node) {
        isUnmasked = !!node.directives && node.directives.some(function(directive) {
          return directive.name.value === "unmask";
        });
        if (!isUnmasked) {
          return BREAK;
        }
      }
    });
    return isUnmasked;
  }

  // node_modules/@wry/caches/lib/strong.js
  function defaultDispose() {
  }
  var StrongCache = class {
    constructor(max = Infinity, dispose = defaultDispose) {
      this.max = max;
      this.dispose = dispose;
      this.map = /* @__PURE__ */ new Map();
      this.newest = null;
      this.oldest = null;
    }
    has(key) {
      return this.map.has(key);
    }
    get(key) {
      const node = this.getNode(key);
      return node && node.value;
    }
    get size() {
      return this.map.size;
    }
    getNode(key) {
      const node = this.map.get(key);
      if (node && node !== this.newest) {
        const { older, newer } = node;
        if (newer) {
          newer.older = older;
        }
        if (older) {
          older.newer = newer;
        }
        node.older = this.newest;
        node.older.newer = node;
        node.newer = null;
        this.newest = node;
        if (node === this.oldest) {
          this.oldest = newer;
        }
      }
      return node;
    }
    set(key, value) {
      let node = this.getNode(key);
      if (node) {
        return node.value = value;
      }
      node = {
        key,
        value,
        newer: null,
        older: this.newest
      };
      if (this.newest) {
        this.newest.newer = node;
      }
      this.newest = node;
      this.oldest = this.oldest || node;
      this.map.set(key, node);
      return node.value;
    }
    clean() {
      while (this.oldest && this.map.size > this.max) {
        this.delete(this.oldest.key);
      }
    }
    delete(key) {
      const node = this.map.get(key);
      if (node) {
        if (node === this.newest) {
          this.newest = node.older;
        }
        if (node === this.oldest) {
          this.oldest = node.newer;
        }
        if (node.newer) {
          node.newer.older = node.older;
        }
        if (node.older) {
          node.older.newer = node.newer;
        }
        this.map.delete(key);
        this.dispose(node.value, key);
        return true;
      }
      return false;
    }
  };

  // node_modules/@wry/caches/lib/weak.js
  function noop() {
  }
  var defaultDispose2 = noop;
  var _WeakRef = typeof WeakRef !== "undefined" ? WeakRef : function(value) {
    return { deref: () => value };
  };
  var _WeakMap = typeof WeakMap !== "undefined" ? WeakMap : Map;
  var _FinalizationRegistry = typeof FinalizationRegistry !== "undefined" ? FinalizationRegistry : function() {
    return {
      register: noop,
      unregister: noop
    };
  };
  var finalizationBatchSize = 10024;
  var WeakCache = class {
    constructor(max = Infinity, dispose = defaultDispose2) {
      this.max = max;
      this.dispose = dispose;
      this.map = new _WeakMap();
      this.newest = null;
      this.oldest = null;
      this.unfinalizedNodes = /* @__PURE__ */ new Set();
      this.finalizationScheduled = false;
      this.size = 0;
      this.finalize = () => {
        const iterator = this.unfinalizedNodes.values();
        for (let i = 0; i < finalizationBatchSize; i++) {
          const node = iterator.next().value;
          if (!node)
            break;
          this.unfinalizedNodes.delete(node);
          const key = node.key;
          delete node.key;
          node.keyRef = new _WeakRef(key);
          this.registry.register(key, node, node);
        }
        if (this.unfinalizedNodes.size > 0) {
          queueMicrotask(this.finalize);
        } else {
          this.finalizationScheduled = false;
        }
      };
      this.registry = new _FinalizationRegistry(this.deleteNode.bind(this));
    }
    has(key) {
      return this.map.has(key);
    }
    get(key) {
      const node = this.getNode(key);
      return node && node.value;
    }
    getNode(key) {
      const node = this.map.get(key);
      if (node && node !== this.newest) {
        const { older, newer } = node;
        if (newer) {
          newer.older = older;
        }
        if (older) {
          older.newer = newer;
        }
        node.older = this.newest;
        node.older.newer = node;
        node.newer = null;
        this.newest = node;
        if (node === this.oldest) {
          this.oldest = newer;
        }
      }
      return node;
    }
    set(key, value) {
      let node = this.getNode(key);
      if (node) {
        return node.value = value;
      }
      node = {
        key,
        value,
        newer: null,
        older: this.newest
      };
      if (this.newest) {
        this.newest.newer = node;
      }
      this.newest = node;
      this.oldest = this.oldest || node;
      this.scheduleFinalization(node);
      this.map.set(key, node);
      this.size++;
      return node.value;
    }
    clean() {
      while (this.oldest && this.size > this.max) {
        this.deleteNode(this.oldest);
      }
    }
    deleteNode(node) {
      if (node === this.newest) {
        this.newest = node.older;
      }
      if (node === this.oldest) {
        this.oldest = node.newer;
      }
      if (node.newer) {
        node.newer.older = node.older;
      }
      if (node.older) {
        node.older.newer = node.newer;
      }
      this.size--;
      const key = node.key || node.keyRef && node.keyRef.deref();
      this.dispose(node.value, key);
      if (!node.keyRef) {
        this.unfinalizedNodes.delete(node);
      } else {
        this.registry.unregister(node);
      }
      if (key)
        this.map.delete(key);
    }
    delete(key) {
      const node = this.map.get(key);
      if (node) {
        this.deleteNode(node);
        return true;
      }
      return false;
    }
    scheduleFinalization(node) {
      this.unfinalizedNodes.add(node);
      if (!this.finalizationScheduled) {
        this.finalizationScheduled = true;
        queueMicrotask(this.finalize);
      }
    }
  };

  // node_modules/@apollo/client/utilities/caching/caches.js
  var scheduledCleanup = /* @__PURE__ */ new WeakSet();
  function schedule(cache) {
    if (cache.size <= (cache.max || -1)) {
      return;
    }
    if (!scheduledCleanup.has(cache)) {
      scheduledCleanup.add(cache);
      setTimeout(function() {
        cache.clean();
        scheduledCleanup.delete(cache);
      }, 100);
    }
  }
  var AutoCleanedWeakCache = function(max, dispose) {
    var cache = new WeakCache(max, dispose);
    cache.set = function(key, value) {
      var ret = WeakCache.prototype.set.call(this, key, value);
      schedule(this);
      return ret;
    };
    return cache;
  };
  var AutoCleanedStrongCache = function(max, dispose) {
    var cache = new StrongCache(max, dispose);
    cache.set = function(key, value) {
      var ret = StrongCache.prototype.set.call(this, key, value);
      schedule(this);
      return ret;
    };
    return cache;
  };

  // node_modules/@apollo/client/utilities/caching/sizes.js
  var cacheSizeSymbol = Symbol.for("apollo.cacheSize");
  var cacheSizes = __assign({}, global_default[cacheSizeSymbol]);

  // node_modules/@apollo/client/utilities/caching/getMemoryInternals.js
  var globalCaches = {};
  function registerGlobalCache(name, getSize) {
    globalCaches[name] = getSize;
  }
  var getApolloClientMemoryInternals = globalThis.__DEV__ !== false ? _getApolloClientMemoryInternals : void 0;
  var getInMemoryCacheMemoryInternals = globalThis.__DEV__ !== false ? _getInMemoryCacheMemoryInternals : void 0;
  var getApolloCacheMemoryInternals = globalThis.__DEV__ !== false ? _getApolloCacheMemoryInternals : void 0;
  function getCurrentCacheSizes() {
    var defaults = {
      parser: 1e3,
      canonicalStringify: 1e3,
      print: 2e3,
      "documentTransform.cache": 2e3,
      "queryManager.getDocumentInfo": 2e3,
      "PersistedQueryLink.persistedQueryHashes": 2e3,
      "fragmentRegistry.transform": 2e3,
      "fragmentRegistry.lookup": 1e3,
      "fragmentRegistry.findFragmentSpreads": 4e3,
      "cache.fragmentQueryDocuments": 1e3,
      "removeTypenameFromVariables.getVariableDefinitions": 2e3,
      "inMemoryCache.maybeBroadcastWatch": 5e3,
      "inMemoryCache.executeSelectionSet": 5e4,
      "inMemoryCache.executeSubSelectedArray": 1e4
    };
    return Object.fromEntries(Object.entries(defaults).map(function(_a2) {
      var k = _a2[0], v = _a2[1];
      return [
        k,
        cacheSizes[k] || v
      ];
    }));
  }
  function _getApolloClientMemoryInternals() {
    var _a2, _b, _c, _d, _e;
    if (!(globalThis.__DEV__ !== false))
      throw new Error("only supported in development mode");
    return {
      limits: getCurrentCacheSizes(),
      sizes: __assign({ print: (_a2 = globalCaches.print) === null || _a2 === void 0 ? void 0 : _a2.call(globalCaches), parser: (_b = globalCaches.parser) === null || _b === void 0 ? void 0 : _b.call(globalCaches), canonicalStringify: (_c = globalCaches.canonicalStringify) === null || _c === void 0 ? void 0 : _c.call(globalCaches), links: linkInfo(this.link), queryManager: {
        getDocumentInfo: this["queryManager"]["transformCache"].size,
        documentTransforms: transformInfo(this["queryManager"].documentTransform)
      } }, (_e = (_d = this.cache).getMemoryInternals) === null || _e === void 0 ? void 0 : _e.call(_d))
    };
  }
  function _getApolloCacheMemoryInternals() {
    return {
      cache: {
        fragmentQueryDocuments: getWrapperInformation(this["getFragmentDoc"])
      }
    };
  }
  function _getInMemoryCacheMemoryInternals() {
    var fragments = this.config.fragments;
    return __assign(__assign({}, _getApolloCacheMemoryInternals.apply(this)), { addTypenameDocumentTransform: transformInfo(this["addTypenameTransform"]), inMemoryCache: {
      executeSelectionSet: getWrapperInformation(this["storeReader"]["executeSelectionSet"]),
      executeSubSelectedArray: getWrapperInformation(this["storeReader"]["executeSubSelectedArray"]),
      maybeBroadcastWatch: getWrapperInformation(this["maybeBroadcastWatch"])
    }, fragmentRegistry: {
      findFragmentSpreads: getWrapperInformation(fragments === null || fragments === void 0 ? void 0 : fragments.findFragmentSpreads),
      lookup: getWrapperInformation(fragments === null || fragments === void 0 ? void 0 : fragments.lookup),
      transform: getWrapperInformation(fragments === null || fragments === void 0 ? void 0 : fragments.transform)
    } });
  }
  function isWrapper(f) {
    return !!f && "dirtyKey" in f;
  }
  function getWrapperInformation(f) {
    return isWrapper(f) ? f.size : void 0;
  }
  function isDefined(value) {
    return value != null;
  }
  function transformInfo(transform) {
    return recurseTransformInfo(transform).map(function(cache) {
      return { cache };
    });
  }
  function recurseTransformInfo(transform) {
    return transform ? __spreadArray(__spreadArray([
      getWrapperInformation(transform === null || transform === void 0 ? void 0 : transform["performWork"])
    ], recurseTransformInfo(transform === null || transform === void 0 ? void 0 : transform["left"]), true), recurseTransformInfo(transform === null || transform === void 0 ? void 0 : transform["right"]), true).filter(isDefined) : [];
  }
  function linkInfo(link) {
    var _a2;
    return link ? __spreadArray(__spreadArray([
      (_a2 = link === null || link === void 0 ? void 0 : link.getMemoryInternals) === null || _a2 === void 0 ? void 0 : _a2.call(link)
    ], linkInfo(link === null || link === void 0 ? void 0 : link.left), true), linkInfo(link === null || link === void 0 ? void 0 : link.right), true).filter(isDefined) : [];
  }

  // node_modules/@apollo/client/utilities/common/canonicalStringify.js
  var canonicalStringify = Object.assign(function canonicalStringify2(value) {
    return JSON.stringify(value, stableObjectReplacer);
  }, {
    reset: function() {
      sortingMap = new AutoCleanedStrongCache(
        cacheSizes.canonicalStringify || 1e3
        /* defaultCacheSizes.canonicalStringify */
      );
    }
  });
  if (globalThis.__DEV__ !== false) {
    registerGlobalCache("canonicalStringify", function() {
      return sortingMap.size;
    });
  }
  var sortingMap;
  canonicalStringify.reset();
  function stableObjectReplacer(key, value) {
    if (value && typeof value === "object") {
      var proto = Object.getPrototypeOf(value);
      if (proto === Object.prototype || proto === null) {
        var keys = Object.keys(value);
        if (keys.every(everyKeyInOrder))
          return value;
        var unsortedKey = JSON.stringify(keys);
        var sortedKeys = sortingMap.get(unsortedKey);
        if (!sortedKeys) {
          keys.sort();
          var sortedKey = JSON.stringify(keys);
          sortedKeys = sortingMap.get(sortedKey) || keys;
          sortingMap.set(unsortedKey, sortedKeys);
          sortingMap.set(sortedKey, sortedKeys);
        }
        var sortedObject_1 = Object.create(proto);
        sortedKeys.forEach(function(key2) {
          sortedObject_1[key2] = value[key2];
        });
        return sortedObject_1;
      }
    }
    return value;
  }
  function everyKeyInOrder(key, i, keys) {
    return i === 0 || keys[i - 1] <= key;
  }

  // node_modules/@apollo/client/utilities/graphql/storeUtils.js
  function makeReference(id) {
    return { __ref: String(id) };
  }
  function isReference(obj) {
    return Boolean(obj && typeof obj === "object" && typeof obj.__ref === "string");
  }
  function isDocumentNode(value) {
    return isNonNullObject(value) && value.kind === "Document" && Array.isArray(value.definitions);
  }
  function isStringValue(value) {
    return value.kind === "StringValue";
  }
  function isBooleanValue(value) {
    return value.kind === "BooleanValue";
  }
  function isIntValue(value) {
    return value.kind === "IntValue";
  }
  function isFloatValue(value) {
    return value.kind === "FloatValue";
  }
  function isVariable(value) {
    return value.kind === "Variable";
  }
  function isObjectValue(value) {
    return value.kind === "ObjectValue";
  }
  function isListValue(value) {
    return value.kind === "ListValue";
  }
  function isEnumValue(value) {
    return value.kind === "EnumValue";
  }
  function isNullValue(value) {
    return value.kind === "NullValue";
  }
  function valueToObjectRepresentation(argObj, name, value, variables) {
    if (isIntValue(value) || isFloatValue(value)) {
      argObj[name.value] = Number(value.value);
    } else if (isBooleanValue(value) || isStringValue(value)) {
      argObj[name.value] = value.value;
    } else if (isObjectValue(value)) {
      var nestedArgObj_1 = {};
      value.fields.map(function(obj) {
        return valueToObjectRepresentation(nestedArgObj_1, obj.name, obj.value, variables);
      });
      argObj[name.value] = nestedArgObj_1;
    } else if (isVariable(value)) {
      var variableValue = (variables || {})[value.name.value];
      argObj[name.value] = variableValue;
    } else if (isListValue(value)) {
      argObj[name.value] = value.values.map(function(listValue) {
        var nestedArgArrayObj = {};
        valueToObjectRepresentation(nestedArgArrayObj, name, listValue, variables);
        return nestedArgArrayObj[name.value];
      });
    } else if (isEnumValue(value)) {
      argObj[name.value] = value.value;
    } else if (isNullValue(value)) {
      argObj[name.value] = null;
    } else {
      throw newInvariantError(96, name.value, value.kind);
    }
  }
  function storeKeyNameFromField(field, variables) {
    var directivesObj = null;
    if (field.directives) {
      directivesObj = {};
      field.directives.forEach(function(directive) {
        directivesObj[directive.name.value] = {};
        if (directive.arguments) {
          directive.arguments.forEach(function(_a2) {
            var name = _a2.name, value = _a2.value;
            return valueToObjectRepresentation(directivesObj[directive.name.value], name, value, variables);
          });
        }
      });
    }
    var argObj = null;
    if (field.arguments && field.arguments.length) {
      argObj = {};
      field.arguments.forEach(function(_a2) {
        var name = _a2.name, value = _a2.value;
        return valueToObjectRepresentation(argObj, name, value, variables);
      });
    }
    return getStoreKeyName(field.name.value, argObj, directivesObj);
  }
  var KNOWN_DIRECTIVES = [
    "connection",
    "include",
    "skip",
    "client",
    "rest",
    "export",
    "nonreactive"
  ];
  var storeKeyNameStringify = canonicalStringify;
  var getStoreKeyName = Object.assign(function(fieldName, args, directives) {
    if (args && directives && directives["connection"] && directives["connection"]["key"]) {
      if (directives["connection"]["filter"] && directives["connection"]["filter"].length > 0) {
        var filterKeys = directives["connection"]["filter"] ? directives["connection"]["filter"] : [];
        filterKeys.sort();
        var filteredArgs_1 = {};
        filterKeys.forEach(function(key) {
          filteredArgs_1[key] = args[key];
        });
        return "".concat(directives["connection"]["key"], "(").concat(storeKeyNameStringify(filteredArgs_1), ")");
      } else {
        return directives["connection"]["key"];
      }
    }
    var completeFieldName = fieldName;
    if (args) {
      var stringifiedArgs = storeKeyNameStringify(args);
      completeFieldName += "(".concat(stringifiedArgs, ")");
    }
    if (directives) {
      Object.keys(directives).forEach(function(key) {
        if (KNOWN_DIRECTIVES.indexOf(key) !== -1)
          return;
        if (directives[key] && Object.keys(directives[key]).length) {
          completeFieldName += "@".concat(key, "(").concat(storeKeyNameStringify(directives[key]), ")");
        } else {
          completeFieldName += "@".concat(key);
        }
      });
    }
    return completeFieldName;
  }, {
    setStringify: function(s) {
      var previous = storeKeyNameStringify;
      storeKeyNameStringify = s;
      return previous;
    }
  });
  function argumentsObjectFromField(field, variables) {
    if (field.arguments && field.arguments.length) {
      var argObj_1 = {};
      field.arguments.forEach(function(_a2) {
        var name = _a2.name, value = _a2.value;
        return valueToObjectRepresentation(argObj_1, name, value, variables);
      });
      return argObj_1;
    }
    return null;
  }
  function resultKeyNameFromField(field) {
    return field.alias ? field.alias.value : field.name.value;
  }
  function getTypenameFromResult(result2, selectionSet, fragmentMap) {
    var fragments;
    for (var _i = 0, _a2 = selectionSet.selections; _i < _a2.length; _i++) {
      var selection = _a2[_i];
      if (isField(selection)) {
        if (selection.name.value === "__typename") {
          return result2[resultKeyNameFromField(selection)];
        }
      } else if (fragments) {
        fragments.push(selection);
      } else {
        fragments = [selection];
      }
    }
    if (typeof result2.__typename === "string") {
      return result2.__typename;
    }
    if (fragments) {
      for (var _b = 0, fragments_1 = fragments; _b < fragments_1.length; _b++) {
        var selection = fragments_1[_b];
        var typename = getTypenameFromResult(result2, getFragmentFromSelection(selection, fragmentMap).selectionSet, fragmentMap);
        if (typeof typename === "string") {
          return typename;
        }
      }
    }
  }
  function isField(selection) {
    return selection.kind === "Field";
  }
  function isInlineFragment(selection) {
    return selection.kind === "InlineFragment";
  }

  // node_modules/@apollo/client/utilities/graphql/getFromAST.js
  function checkDocument(doc) {
    invariant2(doc && doc.kind === "Document", 88);
    var operations = doc.definitions.filter(function(d) {
      return d.kind !== "FragmentDefinition";
    }).map(function(definition) {
      if (definition.kind !== "OperationDefinition") {
        throw newInvariantError(89, definition.kind);
      }
      return definition;
    });
    invariant2(operations.length <= 1, 90, operations.length);
    return doc;
  }
  function getOperationDefinition(doc) {
    checkDocument(doc);
    return doc.definitions.filter(function(definition) {
      return definition.kind === "OperationDefinition";
    })[0];
  }
  function getOperationName(doc) {
    return doc.definitions.filter(function(definition) {
      return definition.kind === "OperationDefinition" && !!definition.name;
    }).map(function(x) {
      return x.name.value;
    })[0] || null;
  }
  function getFragmentDefinitions(doc) {
    return doc.definitions.filter(function(definition) {
      return definition.kind === "FragmentDefinition";
    });
  }
  function getQueryDefinition(doc) {
    var queryDef = getOperationDefinition(doc);
    invariant2(queryDef && queryDef.operation === "query", 91);
    return queryDef;
  }
  function getFragmentDefinition(doc) {
    invariant2(doc.kind === "Document", 92);
    invariant2(doc.definitions.length <= 1, 93);
    var fragmentDef = doc.definitions[0];
    invariant2(fragmentDef.kind === "FragmentDefinition", 94);
    return fragmentDef;
  }
  function getMainDefinition(queryDoc) {
    checkDocument(queryDoc);
    var fragmentDefinition;
    for (var _i = 0, _a2 = queryDoc.definitions; _i < _a2.length; _i++) {
      var definition = _a2[_i];
      if (definition.kind === "OperationDefinition") {
        var operation = definition.operation;
        if (operation === "query" || operation === "mutation" || operation === "subscription") {
          return definition;
        }
      }
      if (definition.kind === "FragmentDefinition" && !fragmentDefinition) {
        fragmentDefinition = definition;
      }
    }
    if (fragmentDefinition) {
      return fragmentDefinition;
    }
    throw newInvariantError(95);
  }
  function getDefaultValues(definition) {
    var defaultValues = /* @__PURE__ */ Object.create(null);
    var defs = definition && definition.variableDefinitions;
    if (defs && defs.length) {
      defs.forEach(function(def) {
        if (def.defaultValue) {
          valueToObjectRepresentation(defaultValues, def.variable.name, def.defaultValue);
        }
      });
    }
    return defaultValues;
  }

  // node_modules/@wry/context/lib/slot.js
  var currentContext = null;
  var MISSING_VALUE = {};
  var idCounter = 1;
  var makeSlotClass = () => class Slot {
    constructor() {
      this.id = [
        "slot",
        idCounter++,
        Date.now(),
        Math.random().toString(36).slice(2)
      ].join(":");
    }
    hasValue() {
      for (let context = currentContext; context; context = context.parent) {
        if (this.id in context.slots) {
          const value = context.slots[this.id];
          if (value === MISSING_VALUE)
            break;
          if (context !== currentContext) {
            currentContext.slots[this.id] = value;
          }
          return true;
        }
      }
      if (currentContext) {
        currentContext.slots[this.id] = MISSING_VALUE;
      }
      return false;
    }
    getValue() {
      if (this.hasValue()) {
        return currentContext.slots[this.id];
      }
    }
    withValue(value, callback, args, thisArg) {
      const slots = {
        __proto__: null,
        [this.id]: value
      };
      const parent = currentContext;
      currentContext = { parent, slots };
      try {
        return callback.apply(thisArg, args);
      } finally {
        currentContext = parent;
      }
    }
    // Capture the current context and wrap a callback function so that it
    // reestablishes the captured context when called.
    static bind(callback) {
      const context = currentContext;
      return function() {
        const saved = currentContext;
        try {
          currentContext = context;
          return callback.apply(this, arguments);
        } finally {
          currentContext = saved;
        }
      };
    }
    // Immediately run a callback function without any captured context.
    static noContext(callback, args, thisArg) {
      if (currentContext) {
        const saved = currentContext;
        try {
          currentContext = null;
          return callback.apply(thisArg, args);
        } finally {
          currentContext = saved;
        }
      } else {
        return callback.apply(thisArg, args);
      }
    }
  };
  function maybe2(fn) {
    try {
      return fn();
    } catch (ignored) {
    }
  }
  var globalKey = "@wry/context:Slot";
  var host = (
    // Prefer globalThis when available.
    // https://github.com/benjamn/wryware/issues/347
    maybe2(() => globalThis) || // Fall back to global, which works in Node.js and may be converted by some
    // bundlers to the appropriate identifier (window, self, ...) depending on the
    // bundling target. https://github.com/endojs/endo/issues/576#issuecomment-1178515224
    maybe2(() => global) || // Otherwise, use a dummy host that's local to this module. We used to fall
    // back to using the Array constructor as a namespace, but that was flagged in
    // https://github.com/benjamn/wryware/issues/347, and can be avoided.
    /* @__PURE__ */ Object.create(null)
  );
  var globalHost = host;
  var Slot = globalHost[globalKey] || // Earlier versions of this package stored the globalKey property on the Array
  // constructor, so we check there as well, to prevent Slot class duplication.
  Array[globalKey] || (function(Slot2) {
    try {
      Object.defineProperty(globalHost, globalKey, {
        value: Slot2,
        enumerable: false,
        writable: false,
        // When it was possible for globalHost to be the Array constructor (a
        // legacy Slot dedup strategy), it was important for the property to be
        // configurable:true so it could be deleted. That does not seem to be as
        // important when globalHost is the global object, but I don't want to
        // cause similar problems again, and configurable:true seems safest.
        // https://github.com/endojs/endo/issues/576#issuecomment-1178274008
        configurable: true
      });
    } finally {
      return Slot2;
    }
  })(makeSlotClass());

  // node_modules/@wry/context/lib/index.js
  var { bind, noContext } = Slot;

  // node_modules/optimism/lib/context.js
  var parentEntrySlot = new Slot();

  // node_modules/optimism/lib/helpers.js
  var { hasOwnProperty: hasOwnProperty2 } = Object.prototype;
  var arrayFromSet = Array.from || function(set) {
    const array = [];
    set.forEach((item) => array.push(item));
    return array;
  };
  function maybeUnsubscribe(entryOrDep) {
    const { unsubscribe } = entryOrDep;
    if (typeof unsubscribe === "function") {
      entryOrDep.unsubscribe = void 0;
      unsubscribe();
    }
  }

  // node_modules/optimism/lib/entry.js
  var emptySetPool = [];
  var POOL_TARGET_SIZE = 100;
  function assert(condition, optionalMessage) {
    if (!condition) {
      throw new Error(optionalMessage || "assertion failure");
    }
  }
  function valueIs(a, b) {
    const len = a.length;
    return (
      // Unknown values are not equal to each other.
      len > 0 && // Both values must be ordinary (or both exceptional) to be equal.
      len === b.length && // The underlying value or exception must be the same.
      a[len - 1] === b[len - 1]
    );
  }
  function valueGet(value) {
    switch (value.length) {
      case 0:
        throw new Error("unknown value");
      case 1:
        return value[0];
      case 2:
        throw value[1];
    }
  }
  function valueCopy(value) {
    return value.slice(0);
  }
  var Entry = class _Entry {
    constructor(fn) {
      this.fn = fn;
      this.parents = /* @__PURE__ */ new Set();
      this.childValues = /* @__PURE__ */ new Map();
      this.dirtyChildren = null;
      this.dirty = true;
      this.recomputing = false;
      this.value = [];
      this.deps = null;
      ++_Entry.count;
    }
    peek() {
      if (this.value.length === 1 && !mightBeDirty(this)) {
        rememberParent(this);
        return this.value[0];
      }
    }
    // This is the most important method of the Entry API, because it
    // determines whether the cached this.value can be returned immediately,
    // or must be recomputed. The overall performance of the caching system
    // depends on the truth of the following observations: (1) this.dirty is
    // usually false, (2) this.dirtyChildren is usually null/empty, and thus
    // (3) valueGet(this.value) is usually returned without recomputation.
    recompute(args) {
      assert(!this.recomputing, "already recomputing");
      rememberParent(this);
      return mightBeDirty(this) ? reallyRecompute(this, args) : valueGet(this.value);
    }
    setDirty() {
      if (this.dirty)
        return;
      this.dirty = true;
      reportDirty(this);
      maybeUnsubscribe(this);
    }
    dispose() {
      this.setDirty();
      forgetChildren(this);
      eachParent(this, (parent, child) => {
        parent.setDirty();
        forgetChild(parent, this);
      });
    }
    forget() {
      this.dispose();
    }
    dependOn(dep2) {
      dep2.add(this);
      if (!this.deps) {
        this.deps = emptySetPool.pop() || /* @__PURE__ */ new Set();
      }
      this.deps.add(dep2);
    }
    forgetDeps() {
      if (this.deps) {
        arrayFromSet(this.deps).forEach((dep2) => dep2.delete(this));
        this.deps.clear();
        emptySetPool.push(this.deps);
        this.deps = null;
      }
    }
  };
  Entry.count = 0;
  function rememberParent(child) {
    const parent = parentEntrySlot.getValue();
    if (parent) {
      child.parents.add(parent);
      if (!parent.childValues.has(child)) {
        parent.childValues.set(child, []);
      }
      if (mightBeDirty(child)) {
        reportDirtyChild(parent, child);
      } else {
        reportCleanChild(parent, child);
      }
      return parent;
    }
  }
  function reallyRecompute(entry, args) {
    forgetChildren(entry);
    parentEntrySlot.withValue(entry, recomputeNewValue, [entry, args]);
    if (maybeSubscribe(entry, args)) {
      setClean(entry);
    }
    return valueGet(entry.value);
  }
  function recomputeNewValue(entry, args) {
    entry.recomputing = true;
    const { normalizeResult } = entry;
    let oldValueCopy;
    if (normalizeResult && entry.value.length === 1) {
      oldValueCopy = valueCopy(entry.value);
    }
    entry.value.length = 0;
    try {
      entry.value[0] = entry.fn.apply(null, args);
      if (normalizeResult && oldValueCopy && !valueIs(oldValueCopy, entry.value)) {
        try {
          entry.value[0] = normalizeResult(entry.value[0], oldValueCopy[0]);
        } catch (_a2) {
        }
      }
    } catch (e) {
      entry.value[1] = e;
    }
    entry.recomputing = false;
  }
  function mightBeDirty(entry) {
    return entry.dirty || !!(entry.dirtyChildren && entry.dirtyChildren.size);
  }
  function setClean(entry) {
    entry.dirty = false;
    if (mightBeDirty(entry)) {
      return;
    }
    reportClean(entry);
  }
  function reportDirty(child) {
    eachParent(child, reportDirtyChild);
  }
  function reportClean(child) {
    eachParent(child, reportCleanChild);
  }
  function eachParent(child, callback) {
    const parentCount = child.parents.size;
    if (parentCount) {
      const parents = arrayFromSet(child.parents);
      for (let i = 0; i < parentCount; ++i) {
        callback(parents[i], child);
      }
    }
  }
  function reportDirtyChild(parent, child) {
    assert(parent.childValues.has(child));
    assert(mightBeDirty(child));
    const parentWasClean = !mightBeDirty(parent);
    if (!parent.dirtyChildren) {
      parent.dirtyChildren = emptySetPool.pop() || /* @__PURE__ */ new Set();
    } else if (parent.dirtyChildren.has(child)) {
      return;
    }
    parent.dirtyChildren.add(child);
    if (parentWasClean) {
      reportDirty(parent);
    }
  }
  function reportCleanChild(parent, child) {
    assert(parent.childValues.has(child));
    assert(!mightBeDirty(child));
    const childValue = parent.childValues.get(child);
    if (childValue.length === 0) {
      parent.childValues.set(child, valueCopy(child.value));
    } else if (!valueIs(childValue, child.value)) {
      parent.setDirty();
    }
    removeDirtyChild(parent, child);
    if (mightBeDirty(parent)) {
      return;
    }
    reportClean(parent);
  }
  function removeDirtyChild(parent, child) {
    const dc = parent.dirtyChildren;
    if (dc) {
      dc.delete(child);
      if (dc.size === 0) {
        if (emptySetPool.length < POOL_TARGET_SIZE) {
          emptySetPool.push(dc);
        }
        parent.dirtyChildren = null;
      }
    }
  }
  function forgetChildren(parent) {
    if (parent.childValues.size > 0) {
      parent.childValues.forEach((_value, child) => {
        forgetChild(parent, child);
      });
    }
    parent.forgetDeps();
    assert(parent.dirtyChildren === null);
  }
  function forgetChild(parent, child) {
    child.parents.delete(parent);
    parent.childValues.delete(child);
    removeDirtyChild(parent, child);
  }
  function maybeSubscribe(entry, args) {
    if (typeof entry.subscribe === "function") {
      try {
        maybeUnsubscribe(entry);
        entry.unsubscribe = entry.subscribe.apply(null, args);
      } catch (e) {
        entry.setDirty();
        return false;
      }
    }
    return true;
  }

  // node_modules/optimism/lib/dep.js
  var EntryMethods = {
    setDirty: true,
    dispose: true,
    forget: true
    // Fully remove parent Entry from LRU cache and computation graph
  };
  function dep(options) {
    const depsByKey = /* @__PURE__ */ new Map();
    const subscribe = options && options.subscribe;
    function depend(key) {
      const parent = parentEntrySlot.getValue();
      if (parent) {
        let dep2 = depsByKey.get(key);
        if (!dep2) {
          depsByKey.set(key, dep2 = /* @__PURE__ */ new Set());
        }
        parent.dependOn(dep2);
        if (typeof subscribe === "function") {
          maybeUnsubscribe(dep2);
          dep2.unsubscribe = subscribe(key);
        }
      }
    }
    depend.dirty = function dirty(key, entryMethodName) {
      const dep2 = depsByKey.get(key);
      if (dep2) {
        const m = entryMethodName && hasOwnProperty2.call(EntryMethods, entryMethodName) ? entryMethodName : "setDirty";
        arrayFromSet(dep2).forEach((entry) => entry[m]());
        depsByKey.delete(key);
        maybeUnsubscribe(dep2);
      }
    };
    return depend;
  }

  // node_modules/optimism/lib/index.js
  var defaultKeyTrie;
  function defaultMakeCacheKey(...args) {
    const trie = defaultKeyTrie || (defaultKeyTrie = new Trie(typeof WeakMap === "function"));
    return trie.lookupArray(args);
  }
  var caches = /* @__PURE__ */ new Set();
  function wrap3(originalFunction, { max = Math.pow(2, 16), keyArgs, makeCacheKey = defaultMakeCacheKey, normalizeResult, subscribe, cache: cacheOption = StrongCache } = /* @__PURE__ */ Object.create(null)) {
    const cache = typeof cacheOption === "function" ? new cacheOption(max, (entry) => entry.dispose()) : cacheOption;
    const optimistic = function() {
      const key = makeCacheKey.apply(null, keyArgs ? keyArgs.apply(null, arguments) : arguments);
      if (key === void 0) {
        return originalFunction.apply(null, arguments);
      }
      let entry = cache.get(key);
      if (!entry) {
        cache.set(key, entry = new Entry(originalFunction));
        entry.normalizeResult = normalizeResult;
        entry.subscribe = subscribe;
        entry.forget = () => cache.delete(key);
      }
      const value = entry.recompute(Array.prototype.slice.call(arguments));
      cache.set(key, entry);
      caches.add(cache);
      if (!parentEntrySlot.hasValue()) {
        caches.forEach((cache2) => cache2.clean());
        caches.clear();
      }
      return value;
    };
    Object.defineProperty(optimistic, "size", {
      get: () => cache.size,
      configurable: false,
      enumerable: false
    });
    Object.freeze(optimistic.options = {
      max,
      keyArgs,
      makeCacheKey,
      normalizeResult,
      subscribe,
      cache
    });
    function dirtyKey(key) {
      const entry = key && cache.get(key);
      if (entry) {
        entry.setDirty();
      }
    }
    optimistic.dirtyKey = dirtyKey;
    optimistic.dirty = function dirty() {
      dirtyKey(makeCacheKey.apply(null, arguments));
    };
    function peekKey(key) {
      const entry = key && cache.get(key);
      if (entry) {
        return entry.peek();
      }
    }
    optimistic.peekKey = peekKey;
    optimistic.peek = function peek() {
      return peekKey(makeCacheKey.apply(null, arguments));
    };
    function forgetKey(key) {
      return key ? cache.delete(key) : false;
    }
    optimistic.forgetKey = forgetKey;
    optimistic.forget = function forget() {
      return forgetKey(makeCacheKey.apply(null, arguments));
    };
    optimistic.makeCacheKey = makeCacheKey;
    optimistic.getKey = keyArgs ? function getKey() {
      return makeCacheKey.apply(null, keyArgs.apply(null, arguments));
    } : makeCacheKey;
    return Object.freeze(optimistic);
  }

  // node_modules/@apollo/client/utilities/graphql/DocumentTransform.js
  function identity(document2) {
    return document2;
  }
  var DocumentTransform = (
    /** @class */
    (function() {
      function DocumentTransform2(transform, options) {
        if (options === void 0) {
          options = /* @__PURE__ */ Object.create(null);
        }
        this.resultCache = canUseWeakSet ? /* @__PURE__ */ new WeakSet() : /* @__PURE__ */ new Set();
        this.transform = transform;
        if (options.getCacheKey) {
          this.getCacheKey = options.getCacheKey;
        }
        this.cached = options.cache !== false;
        this.resetCache();
      }
      DocumentTransform2.prototype.getCacheKey = function(document2) {
        return [document2];
      };
      DocumentTransform2.identity = function() {
        return new DocumentTransform2(identity, { cache: false });
      };
      DocumentTransform2.split = function(predicate, left, right) {
        if (right === void 0) {
          right = DocumentTransform2.identity();
        }
        return Object.assign(new DocumentTransform2(
          function(document2) {
            var documentTransform = predicate(document2) ? left : right;
            return documentTransform.transformDocument(document2);
          },
          // Reasonably assume both `left` and `right` transforms handle their own caching
          { cache: false }
        ), { left, right });
      };
      DocumentTransform2.prototype.resetCache = function() {
        var _this = this;
        if (this.cached) {
          var stableCacheKeys_1 = new Trie(canUseWeakMap);
          this.performWork = wrap3(DocumentTransform2.prototype.performWork.bind(this), {
            makeCacheKey: function(document2) {
              var cacheKeys = _this.getCacheKey(document2);
              if (cacheKeys) {
                invariant2(Array.isArray(cacheKeys), 77);
                return stableCacheKeys_1.lookupArray(cacheKeys);
              }
            },
            max: cacheSizes["documentTransform.cache"],
            cache: WeakCache
          });
        }
      };
      DocumentTransform2.prototype.performWork = function(document2) {
        checkDocument(document2);
        return this.transform(document2);
      };
      DocumentTransform2.prototype.transformDocument = function(document2) {
        if (this.resultCache.has(document2)) {
          return document2;
        }
        var transformedDocument = this.performWork(document2);
        this.resultCache.add(transformedDocument);
        return transformedDocument;
      };
      DocumentTransform2.prototype.concat = function(otherTransform) {
        var _this = this;
        return Object.assign(new DocumentTransform2(
          function(document2) {
            return otherTransform.transformDocument(_this.transformDocument(document2));
          },
          // Reasonably assume both transforms handle their own caching
          { cache: false }
        ), {
          left: this,
          right: otherTransform
        });
      };
      return DocumentTransform2;
    })()
  );

  // node_modules/@apollo/client/utilities/graphql/print.js
  var printCache;
  var print2 = Object.assign(function(ast) {
    var result2 = printCache.get(ast);
    if (!result2) {
      result2 = print(ast);
      printCache.set(ast, result2);
    }
    return result2;
  }, {
    reset: function() {
      printCache = new AutoCleanedWeakCache(
        cacheSizes.print || 2e3
        /* defaultCacheSizes.print */
      );
    }
  });
  print2.reset();
  if (globalThis.__DEV__ !== false) {
    registerGlobalCache("print", function() {
      return printCache ? printCache.size : 0;
    });
  }

  // node_modules/@apollo/client/utilities/common/arrays.js
  var isArray = Array.isArray;
  function isNonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
  }

  // node_modules/@apollo/client/utilities/graphql/transform.js
  var TYPENAME_FIELD = {
    kind: Kind.FIELD,
    name: {
      kind: Kind.NAME,
      value: "__typename"
    }
  };
  function isEmpty(op, fragmentMap) {
    return !op || op.selectionSet.selections.every(function(selection) {
      return selection.kind === Kind.FRAGMENT_SPREAD && isEmpty(fragmentMap[selection.name.value], fragmentMap);
    });
  }
  function nullIfDocIsEmpty(doc) {
    return isEmpty(getOperationDefinition(doc) || getFragmentDefinition(doc), createFragmentMap(getFragmentDefinitions(doc))) ? null : doc;
  }
  function getDirectiveMatcher(configs) {
    var names = /* @__PURE__ */ new Map();
    var tests = /* @__PURE__ */ new Map();
    configs.forEach(function(directive) {
      if (directive) {
        if (directive.name) {
          names.set(directive.name, directive);
        } else if (directive.test) {
          tests.set(directive.test, directive);
        }
      }
    });
    return function(directive) {
      var config = names.get(directive.name.value);
      if (!config && tests.size) {
        tests.forEach(function(testConfig, test) {
          if (test(directive)) {
            config = testConfig;
          }
        });
      }
      return config;
    };
  }
  function makeInUseGetterFunction(defaultKey) {
    var map = /* @__PURE__ */ new Map();
    return function inUseGetterFunction(key) {
      if (key === void 0) {
        key = defaultKey;
      }
      var inUse = map.get(key);
      if (!inUse) {
        map.set(key, inUse = {
          // Variable and fragment spread names used directly within this
          // operation or fragment definition, as identified by key. These sets
          // will be populated during the first traversal of the document in
          // removeDirectivesFromDocument below.
          variables: /* @__PURE__ */ new Set(),
          fragmentSpreads: /* @__PURE__ */ new Set()
        });
      }
      return inUse;
    };
  }
  function removeDirectivesFromDocument(directives, doc) {
    checkDocument(doc);
    var getInUseByOperationName = makeInUseGetterFunction("");
    var getInUseByFragmentName = makeInUseGetterFunction("");
    var getInUse = function(ancestors) {
      for (var p = 0, ancestor = void 0; p < ancestors.length && (ancestor = ancestors[p]); ++p) {
        if (isArray(ancestor))
          continue;
        if (ancestor.kind === Kind.OPERATION_DEFINITION) {
          return getInUseByOperationName(ancestor.name && ancestor.name.value);
        }
        if (ancestor.kind === Kind.FRAGMENT_DEFINITION) {
          return getInUseByFragmentName(ancestor.name.value);
        }
      }
      globalThis.__DEV__ !== false && invariant2.error(97);
      return null;
    };
    var operationCount = 0;
    for (var i = doc.definitions.length - 1; i >= 0; --i) {
      if (doc.definitions[i].kind === Kind.OPERATION_DEFINITION) {
        ++operationCount;
      }
    }
    var directiveMatcher = getDirectiveMatcher(directives);
    var shouldRemoveField = function(nodeDirectives) {
      return isNonEmptyArray(nodeDirectives) && nodeDirectives.map(directiveMatcher).some(function(config) {
        return config && config.remove;
      });
    };
    var originalFragmentDefsByPath = /* @__PURE__ */ new Map();
    var firstVisitMadeChanges = false;
    var fieldOrInlineFragmentVisitor = {
      enter: function(node) {
        if (shouldRemoveField(node.directives)) {
          firstVisitMadeChanges = true;
          return null;
        }
      }
    };
    var docWithoutDirectiveSubtrees = visit(doc, {
      // These two AST node types share the same implementation, defined above.
      Field: fieldOrInlineFragmentVisitor,
      InlineFragment: fieldOrInlineFragmentVisitor,
      VariableDefinition: {
        enter: function() {
          return false;
        }
      },
      Variable: {
        enter: function(node, _key, _parent, _path, ancestors) {
          var inUse = getInUse(ancestors);
          if (inUse) {
            inUse.variables.add(node.name.value);
          }
        }
      },
      FragmentSpread: {
        enter: function(node, _key, _parent, _path, ancestors) {
          if (shouldRemoveField(node.directives)) {
            firstVisitMadeChanges = true;
            return null;
          }
          var inUse = getInUse(ancestors);
          if (inUse) {
            inUse.fragmentSpreads.add(node.name.value);
          }
        }
      },
      FragmentDefinition: {
        enter: function(node, _key, _parent, path) {
          originalFragmentDefsByPath.set(JSON.stringify(path), node);
        },
        leave: function(node, _key, _parent, path) {
          var originalNode = originalFragmentDefsByPath.get(JSON.stringify(path));
          if (node === originalNode) {
            return node;
          }
          if (
            // This logic applies only if the document contains one or more
            // operations, since removing all fragments from a document containing
            // only fragments makes the document useless.
            operationCount > 0 && node.selectionSet.selections.every(function(selection) {
              return selection.kind === Kind.FIELD && selection.name.value === "__typename";
            })
          ) {
            getInUseByFragmentName(node.name.value).removed = true;
            firstVisitMadeChanges = true;
            return null;
          }
        }
      },
      Directive: {
        leave: function(node) {
          if (directiveMatcher(node)) {
            firstVisitMadeChanges = true;
            return null;
          }
        }
      }
    });
    if (!firstVisitMadeChanges) {
      return doc;
    }
    var populateTransitiveVars = function(inUse) {
      if (!inUse.transitiveVars) {
        inUse.transitiveVars = new Set(inUse.variables);
        if (!inUse.removed) {
          inUse.fragmentSpreads.forEach(function(childFragmentName) {
            populateTransitiveVars(getInUseByFragmentName(childFragmentName)).transitiveVars.forEach(function(varName) {
              inUse.transitiveVars.add(varName);
            });
          });
        }
      }
      return inUse;
    };
    var allFragmentNamesUsed = /* @__PURE__ */ new Set();
    docWithoutDirectiveSubtrees.definitions.forEach(function(def) {
      if (def.kind === Kind.OPERATION_DEFINITION) {
        populateTransitiveVars(getInUseByOperationName(def.name && def.name.value)).fragmentSpreads.forEach(function(childFragmentName) {
          allFragmentNamesUsed.add(childFragmentName);
        });
      } else if (def.kind === Kind.FRAGMENT_DEFINITION && // If there are no operations in the document, then all fragment
      // definitions count as usages of their own fragment names. This heuristic
      // prevents accidentally removing all fragment definitions from the
      // document just because it contains no operations that use the fragments.
      operationCount === 0 && !getInUseByFragmentName(def.name.value).removed) {
        allFragmentNamesUsed.add(def.name.value);
      }
    });
    allFragmentNamesUsed.forEach(function(fragmentName) {
      populateTransitiveVars(getInUseByFragmentName(fragmentName)).fragmentSpreads.forEach(function(childFragmentName) {
        allFragmentNamesUsed.add(childFragmentName);
      });
    });
    var fragmentWillBeRemoved = function(fragmentName) {
      return !!// A fragment definition will be removed if there are no spreads that refer
      // to it, or the fragment was explicitly removed because it had no fields
      // other than __typename.
      (!allFragmentNamesUsed.has(fragmentName) || getInUseByFragmentName(fragmentName).removed);
    };
    var enterVisitor = {
      enter: function(node) {
        if (fragmentWillBeRemoved(node.name.value)) {
          return null;
        }
      }
    };
    return nullIfDocIsEmpty(visit(docWithoutDirectiveSubtrees, {
      // If the fragment is going to be removed, then leaving any dangling
      // FragmentSpread nodes with the same name would be a mistake.
      FragmentSpread: enterVisitor,
      // This is where the fragment definition is actually removed.
      FragmentDefinition: enterVisitor,
      OperationDefinition: {
        leave: function(node) {
          if (node.variableDefinitions) {
            var usedVariableNames_1 = populateTransitiveVars(
              // If an operation is anonymous, we use the empty string as its key.
              getInUseByOperationName(node.name && node.name.value)
            ).transitiveVars;
            if (usedVariableNames_1.size < node.variableDefinitions.length) {
              return __assign(__assign({}, node), { variableDefinitions: node.variableDefinitions.filter(function(varDef) {
                return usedVariableNames_1.has(varDef.variable.name.value);
              }) });
            }
          }
        }
      }
    }));
  }
  var addTypenameToDocument = Object.assign(function(doc) {
    return visit(doc, {
      SelectionSet: {
        enter: function(node, _key, parent) {
          if (parent && parent.kind === Kind.OPERATION_DEFINITION) {
            return;
          }
          var selections = node.selections;
          if (!selections) {
            return;
          }
          var skip = selections.some(function(selection) {
            return isField(selection) && (selection.name.value === "__typename" || selection.name.value.lastIndexOf("__", 0) === 0);
          });
          if (skip) {
            return;
          }
          var field = parent;
          if (isField(field) && field.directives && field.directives.some(function(d) {
            return d.name.value === "export";
          })) {
            return;
          }
          return __assign(__assign({}, node), { selections: __spreadArray(__spreadArray([], selections, true), [TYPENAME_FIELD], false) });
        }
      }
    });
  }, {
    added: function(field) {
      return field === TYPENAME_FIELD;
    }
  });
  function buildQueryFromSelectionSet(document2) {
    var definition = getMainDefinition(document2);
    var definitionOperation = definition.operation;
    if (definitionOperation === "query") {
      return document2;
    }
    var modifiedDoc = visit(document2, {
      OperationDefinition: {
        enter: function(node) {
          return __assign(__assign({}, node), { operation: "query" });
        }
      }
    });
    return modifiedDoc;
  }
  function removeClientSetsFromDocument(document2) {
    checkDocument(document2);
    var modifiedDoc = removeDirectivesFromDocument([
      {
        test: function(directive) {
          return directive.name.value === "client";
        },
        remove: true
      }
    ], document2);
    return modifiedDoc;
  }
  function addNonReactiveToNamedFragments(document2) {
    checkDocument(document2);
    return visit(document2, {
      FragmentSpread: function(node) {
        var _a2;
        if ((_a2 = node.directives) === null || _a2 === void 0 ? void 0 : _a2.some(function(directive) {
          return directive.name.value === "unmask";
        })) {
          return;
        }
        return __assign(__assign({}, node), { directives: __spreadArray(__spreadArray([], node.directives || [], true), [
          {
            kind: Kind.DIRECTIVE,
            name: { kind: Kind.NAME, value: "nonreactive" }
          }
        ], false) });
      }
    });
  }

  // node_modules/@apollo/client/utilities/common/mergeDeep.js
  var hasOwnProperty3 = Object.prototype.hasOwnProperty;
  function mergeDeep() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      sources[_i] = arguments[_i];
    }
    return mergeDeepArray(sources);
  }
  function mergeDeepArray(sources) {
    var target = sources[0] || {};
    var count = sources.length;
    if (count > 1) {
      var merger = new DeepMerger();
      for (var i = 1; i < count; ++i) {
        target = merger.merge(target, sources[i]);
      }
    }
    return target;
  }
  var defaultReconciler = function(target, source, property) {
    return this.merge(target[property], source[property]);
  };
  var DeepMerger = (
    /** @class */
    (function() {
      function DeepMerger2(reconciler) {
        if (reconciler === void 0) {
          reconciler = defaultReconciler;
        }
        this.reconciler = reconciler;
        this.isObject = isNonNullObject;
        this.pastCopies = /* @__PURE__ */ new Set();
      }
      DeepMerger2.prototype.merge = function(target, source) {
        var _this = this;
        var context = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          context[_i - 2] = arguments[_i];
        }
        if (isNonNullObject(source) && isNonNullObject(target)) {
          Object.keys(source).forEach(function(sourceKey) {
            if (hasOwnProperty3.call(target, sourceKey)) {
              var targetValue = target[sourceKey];
              if (source[sourceKey] !== targetValue) {
                var result2 = _this.reconciler.apply(_this, __spreadArray([
                  target,
                  source,
                  sourceKey
                ], context, false));
                if (result2 !== targetValue) {
                  target = _this.shallowCopyForMerge(target);
                  target[sourceKey] = result2;
                }
              }
            } else {
              target = _this.shallowCopyForMerge(target);
              target[sourceKey] = source[sourceKey];
            }
          });
          return target;
        }
        return source;
      };
      DeepMerger2.prototype.shallowCopyForMerge = function(value) {
        if (isNonNullObject(value)) {
          if (!this.pastCopies.has(value)) {
            if (Array.isArray(value)) {
              value = value.slice(0);
            } else {
              value = __assign({ __proto__: Object.getPrototypeOf(value) }, value);
            }
            this.pastCopies.add(value);
          }
        }
        return value;
      };
      return DeepMerger2;
    })()
  );

  // node_modules/zen-observable-ts/module.js
  function _createForOfIteratorHelperLoose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function() {
        if (i >= o.length) return { done: true };
        return { done: false, value: o[i++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  }
  var hasSymbols = function() {
    return typeof Symbol === "function";
  };
  var hasSymbol = function(name) {
    return hasSymbols() && Boolean(Symbol[name]);
  };
  var getSymbol = function(name) {
    return hasSymbol(name) ? Symbol[name] : "@@" + name;
  };
  if (hasSymbols() && !hasSymbol("observable")) {
    Symbol.observable = Symbol("observable");
  }
  var SymbolIterator = getSymbol("iterator");
  var SymbolObservable = getSymbol("observable");
  var SymbolSpecies = getSymbol("species");
  function getMethod(obj, key) {
    var value = obj[key];
    if (value == null) return void 0;
    if (typeof value !== "function") throw new TypeError(value + " is not a function");
    return value;
  }
  function getSpecies(obj) {
    var ctor = obj.constructor;
    if (ctor !== void 0) {
      ctor = ctor[SymbolSpecies];
      if (ctor === null) {
        ctor = void 0;
      }
    }
    return ctor !== void 0 ? ctor : Observable;
  }
  function isObservable(x) {
    return x instanceof Observable;
  }
  function hostReportError(e) {
    if (hostReportError.log) {
      hostReportError.log(e);
    } else {
      setTimeout(function() {
        throw e;
      });
    }
  }
  function enqueue(fn) {
    Promise.resolve().then(function() {
      try {
        fn();
      } catch (e) {
        hostReportError(e);
      }
    });
  }
  function cleanupSubscription(subscription) {
    var cleanup = subscription._cleanup;
    if (cleanup === void 0) return;
    subscription._cleanup = void 0;
    if (!cleanup) {
      return;
    }
    try {
      if (typeof cleanup === "function") {
        cleanup();
      } else {
        var unsubscribe = getMethod(cleanup, "unsubscribe");
        if (unsubscribe) {
          unsubscribe.call(cleanup);
        }
      }
    } catch (e) {
      hostReportError(e);
    }
  }
  function closeSubscription(subscription) {
    subscription._observer = void 0;
    subscription._queue = void 0;
    subscription._state = "closed";
  }
  function flushSubscription(subscription) {
    var queue = subscription._queue;
    if (!queue) {
      return;
    }
    subscription._queue = void 0;
    subscription._state = "ready";
    for (var i = 0; i < queue.length; ++i) {
      notifySubscription(subscription, queue[i].type, queue[i].value);
      if (subscription._state === "closed") break;
    }
  }
  function notifySubscription(subscription, type, value) {
    subscription._state = "running";
    var observer = subscription._observer;
    try {
      var m = getMethod(observer, type);
      switch (type) {
        case "next":
          if (m) m.call(observer, value);
          break;
        case "error":
          closeSubscription(subscription);
          if (m) m.call(observer, value);
          else throw value;
          break;
        case "complete":
          closeSubscription(subscription);
          if (m) m.call(observer);
          break;
      }
    } catch (e) {
      hostReportError(e);
    }
    if (subscription._state === "closed") cleanupSubscription(subscription);
    else if (subscription._state === "running") subscription._state = "ready";
  }
  function onNotify(subscription, type, value) {
    if (subscription._state === "closed") return;
    if (subscription._state === "buffering") {
      subscription._queue.push({
        type,
        value
      });
      return;
    }
    if (subscription._state !== "ready") {
      subscription._state = "buffering";
      subscription._queue = [{
        type,
        value
      }];
      enqueue(function() {
        return flushSubscription(subscription);
      });
      return;
    }
    notifySubscription(subscription, type, value);
  }
  var Subscription = /* @__PURE__ */ (function() {
    function Subscription2(observer, subscriber) {
      this._cleanup = void 0;
      this._observer = observer;
      this._queue = void 0;
      this._state = "initializing";
      var subscriptionObserver = new SubscriptionObserver(this);
      try {
        this._cleanup = subscriber.call(void 0, subscriptionObserver);
      } catch (e) {
        subscriptionObserver.error(e);
      }
      if (this._state === "initializing") this._state = "ready";
    }
    var _proto = Subscription2.prototype;
    _proto.unsubscribe = function unsubscribe() {
      if (this._state !== "closed") {
        closeSubscription(this);
        cleanupSubscription(this);
      }
    };
    _createClass(Subscription2, [{
      key: "closed",
      get: function() {
        return this._state === "closed";
      }
    }]);
    return Subscription2;
  })();
  var SubscriptionObserver = /* @__PURE__ */ (function() {
    function SubscriptionObserver2(subscription) {
      this._subscription = subscription;
    }
    var _proto2 = SubscriptionObserver2.prototype;
    _proto2.next = function next(value) {
      onNotify(this._subscription, "next", value);
    };
    _proto2.error = function error(value) {
      onNotify(this._subscription, "error", value);
    };
    _proto2.complete = function complete() {
      onNotify(this._subscription, "complete");
    };
    _createClass(SubscriptionObserver2, [{
      key: "closed",
      get: function() {
        return this._subscription._state === "closed";
      }
    }]);
    return SubscriptionObserver2;
  })();
  var Observable = /* @__PURE__ */ (function() {
    function Observable2(subscriber) {
      if (!(this instanceof Observable2)) throw new TypeError("Observable cannot be called as a function");
      if (typeof subscriber !== "function") throw new TypeError("Observable initializer must be a function");
      this._subscriber = subscriber;
    }
    var _proto3 = Observable2.prototype;
    _proto3.subscribe = function subscribe(observer) {
      if (typeof observer !== "object" || observer === null) {
        observer = {
          next: observer,
          error: arguments[1],
          complete: arguments[2]
        };
      }
      return new Subscription(observer, this._subscriber);
    };
    _proto3.forEach = function forEach2(fn) {
      var _this = this;
      return new Promise(function(resolve, reject) {
        if (typeof fn !== "function") {
          reject(new TypeError(fn + " is not a function"));
          return;
        }
        function done() {
          subscription.unsubscribe();
          resolve();
        }
        var subscription = _this.subscribe({
          next: function(value) {
            try {
              fn(value, done);
            } catch (e) {
              reject(e);
              subscription.unsubscribe();
            }
          },
          error: reject,
          complete: resolve
        });
      });
    };
    _proto3.map = function map(fn) {
      var _this2 = this;
      if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
      var C = getSpecies(this);
      return new C(function(observer) {
        return _this2.subscribe({
          next: function(value) {
            try {
              value = fn(value);
            } catch (e) {
              return observer.error(e);
            }
            observer.next(value);
          },
          error: function(e) {
            observer.error(e);
          },
          complete: function() {
            observer.complete();
          }
        });
      });
    };
    _proto3.filter = function filter(fn) {
      var _this3 = this;
      if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
      var C = getSpecies(this);
      return new C(function(observer) {
        return _this3.subscribe({
          next: function(value) {
            try {
              if (!fn(value)) return;
            } catch (e) {
              return observer.error(e);
            }
            observer.next(value);
          },
          error: function(e) {
            observer.error(e);
          },
          complete: function() {
            observer.complete();
          }
        });
      });
    };
    _proto3.reduce = function reduce(fn) {
      var _this4 = this;
      if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
      var C = getSpecies(this);
      var hasSeed = arguments.length > 1;
      var hasValue = false;
      var seed = arguments[1];
      var acc = seed;
      return new C(function(observer) {
        return _this4.subscribe({
          next: function(value) {
            var first = !hasValue;
            hasValue = true;
            if (!first || hasSeed) {
              try {
                acc = fn(acc, value);
              } catch (e) {
                return observer.error(e);
              }
            } else {
              acc = value;
            }
          },
          error: function(e) {
            observer.error(e);
          },
          complete: function() {
            if (!hasValue && !hasSeed) return observer.error(new TypeError("Cannot reduce an empty sequence"));
            observer.next(acc);
            observer.complete();
          }
        });
      });
    };
    _proto3.concat = function concat() {
      var _this5 = this;
      for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
        sources[_key] = arguments[_key];
      }
      var C = getSpecies(this);
      return new C(function(observer) {
        var subscription;
        var index = 0;
        function startNext(next) {
          subscription = next.subscribe({
            next: function(v) {
              observer.next(v);
            },
            error: function(e) {
              observer.error(e);
            },
            complete: function() {
              if (index === sources.length) {
                subscription = void 0;
                observer.complete();
              } else {
                startNext(C.from(sources[index++]));
              }
            }
          });
        }
        startNext(_this5);
        return function() {
          if (subscription) {
            subscription.unsubscribe();
            subscription = void 0;
          }
        };
      });
    };
    _proto3.flatMap = function flatMap(fn) {
      var _this6 = this;
      if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
      var C = getSpecies(this);
      return new C(function(observer) {
        var subscriptions = [];
        var outer = _this6.subscribe({
          next: function(value) {
            if (fn) {
              try {
                value = fn(value);
              } catch (e) {
                return observer.error(e);
              }
            }
            var inner = C.from(value).subscribe({
              next: function(value2) {
                observer.next(value2);
              },
              error: function(e) {
                observer.error(e);
              },
              complete: function() {
                var i = subscriptions.indexOf(inner);
                if (i >= 0) subscriptions.splice(i, 1);
                completeIfDone();
              }
            });
            subscriptions.push(inner);
          },
          error: function(e) {
            observer.error(e);
          },
          complete: function() {
            completeIfDone();
          }
        });
        function completeIfDone() {
          if (outer.closed && subscriptions.length === 0) observer.complete();
        }
        return function() {
          subscriptions.forEach(function(s) {
            return s.unsubscribe();
          });
          outer.unsubscribe();
        };
      });
    };
    _proto3[SymbolObservable] = function() {
      return this;
    };
    Observable2.from = function from(x) {
      var C = typeof this === "function" ? this : Observable2;
      if (x == null) throw new TypeError(x + " is not an object");
      var method = getMethod(x, SymbolObservable);
      if (method) {
        var observable = method.call(x);
        if (Object(observable) !== observable) throw new TypeError(observable + " is not an object");
        if (isObservable(observable) && observable.constructor === C) return observable;
        return new C(function(observer) {
          return observable.subscribe(observer);
        });
      }
      if (hasSymbol("iterator")) {
        method = getMethod(x, SymbolIterator);
        if (method) {
          return new C(function(observer) {
            enqueue(function() {
              if (observer.closed) return;
              for (var _iterator = _createForOfIteratorHelperLoose(method.call(x)), _step; !(_step = _iterator()).done; ) {
                var item = _step.value;
                observer.next(item);
                if (observer.closed) return;
              }
              observer.complete();
            });
          });
        }
      }
      if (Array.isArray(x)) {
        return new C(function(observer) {
          enqueue(function() {
            if (observer.closed) return;
            for (var i = 0; i < x.length; ++i) {
              observer.next(x[i]);
              if (observer.closed) return;
            }
            observer.complete();
          });
        });
      }
      throw new TypeError(x + " is not observable");
    };
    Observable2.of = function of() {
      for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        items[_key2] = arguments[_key2];
      }
      var C = typeof this === "function" ? this : Observable2;
      return new C(function(observer) {
        enqueue(function() {
          if (observer.closed) return;
          for (var i = 0; i < items.length; ++i) {
            observer.next(items[i]);
            if (observer.closed) return;
          }
          observer.complete();
        });
      });
    };
    _createClass(Observable2, null, [{
      key: SymbolSpecies,
      get: function() {
        return this;
      }
    }]);
    return Observable2;
  })();
  if (hasSymbols()) {
    Object.defineProperty(Observable, Symbol("extensions"), {
      value: {
        symbol: SymbolObservable,
        hostReportError
      },
      configurable: true
    });
  }

  // node_modules/symbol-observable/es/ponyfill.js
  function symbolObservablePonyfill(root2) {
    var result2;
    var Symbol2 = root2.Symbol;
    if (typeof Symbol2 === "function") {
      if (Symbol2.observable) {
        result2 = Symbol2.observable;
      } else {
        if (typeof Symbol2.for === "function") {
          result2 = Symbol2.for("https://github.com/benlesh/symbol-observable");
        } else {
          result2 = Symbol2("https://github.com/benlesh/symbol-observable");
        }
        try {
          Symbol2.observable = result2;
        } catch (err) {
        }
      }
    } else {
      result2 = "@@observable";
    }
    return result2;
  }

  // node_modules/symbol-observable/es/index.js
  var root;
  if (typeof self !== "undefined") {
    root = self;
  } else if (typeof window !== "undefined") {
    root = window;
  } else if (typeof global !== "undefined") {
    root = global;
  } else if (typeof module !== "undefined") {
    root = module;
  } else {
    root = Function("return this")();
  }
  var result = symbolObservablePonyfill(root);

  // node_modules/@apollo/client/utilities/observables/Observable.js
  var prototype = Observable.prototype;
  var fakeObsSymbol = "@@observable";
  if (!prototype[fakeObsSymbol]) {
    prototype[fakeObsSymbol] = function() {
      return this;
    };
  }

  // node_modules/@apollo/client/utilities/promises/preventUnhandledRejection.js
  function preventUnhandledRejection(promise) {
    promise.catch(function() {
    });
    return promise;
  }

  // node_modules/@apollo/client/utilities/common/cloneDeep.js
  var toString = Object.prototype.toString;
  function cloneDeep(value) {
    return cloneDeepHelper(value);
  }
  function cloneDeepHelper(val, seen) {
    switch (toString.call(val)) {
      case "[object Array]": {
        seen = seen || /* @__PURE__ */ new Map();
        if (seen.has(val))
          return seen.get(val);
        var copy_1 = val.slice(0);
        seen.set(val, copy_1);
        copy_1.forEach(function(child, i) {
          copy_1[i] = cloneDeepHelper(child, seen);
        });
        return copy_1;
      }
      case "[object Object]": {
        seen = seen || /* @__PURE__ */ new Map();
        if (seen.has(val))
          return seen.get(val);
        var copy_2 = Object.create(Object.getPrototypeOf(val));
        seen.set(val, copy_2);
        Object.keys(val).forEach(function(key) {
          copy_2[key] = cloneDeepHelper(val[key], seen);
        });
        return copy_2;
      }
      default:
        return val;
    }
  }

  // node_modules/@apollo/client/utilities/common/maybeDeepFreeze.js
  function deepFreeze(value) {
    var workSet = /* @__PURE__ */ new Set([value]);
    workSet.forEach(function(obj) {
      if (isNonNullObject(obj) && shallowFreeze(obj) === obj) {
        Object.getOwnPropertyNames(obj).forEach(function(name) {
          if (isNonNullObject(obj[name]))
            workSet.add(obj[name]);
        });
      }
    });
    return value;
  }
  function shallowFreeze(obj) {
    if (globalThis.__DEV__ !== false && !Object.isFrozen(obj)) {
      try {
        Object.freeze(obj);
      } catch (e) {
        if (e instanceof TypeError)
          return null;
        throw e;
      }
    }
    return obj;
  }
  function maybeDeepFreeze(obj) {
    if (globalThis.__DEV__ !== false) {
      deepFreeze(obj);
    }
    return obj;
  }

  // node_modules/@apollo/client/utilities/observables/iteration.js
  function iterateObserversSafely(observers, method, argument) {
    var observersWithMethod = [];
    observers.forEach(function(obs) {
      return obs[method] && observersWithMethod.push(obs);
    });
    observersWithMethod.forEach(function(obs) {
      return obs[method](argument);
    });
  }

  // node_modules/@apollo/client/utilities/observables/asyncMap.js
  function asyncMap(observable, mapFn, catchFn) {
    return new Observable(function(observer) {
      var promiseQueue = {
        // Normally we would initialize promiseQueue to Promise.resolve(), but
        // in this case, for backwards compatibility, we need to be careful to
        // invoke the first callback synchronously.
        then: function(callback) {
          return new Promise(function(resolve) {
            return resolve(callback());
          });
        }
      };
      function makeCallback(examiner, key) {
        return function(arg) {
          if (examiner) {
            var both = function() {
              return observer.closed ? (
                /* will be swallowed */
                0
              ) : examiner(arg);
            };
            promiseQueue = promiseQueue.then(both, both).then(function(result2) {
              return observer.next(result2);
            }, function(error) {
              return observer.error(error);
            });
          } else {
            observer[key](arg);
          }
        };
      }
      var handler = {
        next: makeCallback(mapFn, "next"),
        error: makeCallback(catchFn, "error"),
        complete: function() {
          promiseQueue.then(function() {
            return observer.complete();
          });
        }
      };
      var sub = observable.subscribe(handler);
      return function() {
        return sub.unsubscribe();
      };
    });
  }

  // node_modules/@apollo/client/utilities/observables/subclassing.js
  function fixObservableSubclass(subclass) {
    function set(key) {
      Object.defineProperty(subclass, key, { value: Observable });
    }
    if (canUseSymbol && Symbol.species) {
      set(Symbol.species);
    }
    set("@@species");
    return subclass;
  }

  // node_modules/@apollo/client/utilities/observables/Concast.js
  function isPromiseLike(value) {
    return value && typeof value.then === "function";
  }
  var Concast = (
    /** @class */
    (function(_super) {
      __extends(Concast2, _super);
      function Concast2(sources) {
        var _this = _super.call(this, function(observer) {
          _this.addObserver(observer);
          return function() {
            return _this.removeObserver(observer);
          };
        }) || this;
        _this.observers = /* @__PURE__ */ new Set();
        _this.promise = new Promise(function(resolve, reject) {
          _this.resolve = resolve;
          _this.reject = reject;
        });
        _this.handlers = {
          next: function(result2) {
            if (_this.sub !== null) {
              _this.latest = ["next", result2];
              _this.notify("next", result2);
              iterateObserversSafely(_this.observers, "next", result2);
            }
          },
          error: function(error) {
            var sub = _this.sub;
            if (sub !== null) {
              if (sub)
                setTimeout(function() {
                  return sub.unsubscribe();
                });
              _this.sub = null;
              _this.latest = ["error", error];
              _this.reject(error);
              _this.notify("error", error);
              iterateObserversSafely(_this.observers, "error", error);
            }
          },
          complete: function() {
            var _a2 = _this, sub = _a2.sub, _b = _a2.sources, sources2 = _b === void 0 ? [] : _b;
            if (sub !== null) {
              var value = sources2.shift();
              if (!value) {
                if (sub)
                  setTimeout(function() {
                    return sub.unsubscribe();
                  });
                _this.sub = null;
                if (_this.latest && _this.latest[0] === "next") {
                  _this.resolve(_this.latest[1]);
                } else {
                  _this.resolve();
                }
                _this.notify("complete");
                iterateObserversSafely(_this.observers, "complete");
              } else if (isPromiseLike(value)) {
                value.then(function(obs) {
                  return _this.sub = obs.subscribe(_this.handlers);
                }, _this.handlers.error);
              } else {
                _this.sub = value.subscribe(_this.handlers);
              }
            }
          }
        };
        _this.nextResultListeners = /* @__PURE__ */ new Set();
        _this.cancel = function(reason) {
          _this.reject(reason);
          _this.sources = [];
          _this.handlers.error(reason);
        };
        _this.promise.catch(function(_) {
        });
        if (typeof sources === "function") {
          sources = [new Observable(sources)];
        }
        if (isPromiseLike(sources)) {
          sources.then(function(iterable) {
            return _this.start(iterable);
          }, _this.handlers.error);
        } else {
          _this.start(sources);
        }
        return _this;
      }
      Concast2.prototype.start = function(sources) {
        if (this.sub !== void 0)
          return;
        this.sources = Array.from(sources);
        this.handlers.complete();
      };
      Concast2.prototype.deliverLastMessage = function(observer) {
        if (this.latest) {
          var nextOrError = this.latest[0];
          var method = observer[nextOrError];
          if (method) {
            method.call(observer, this.latest[1]);
          }
          if (this.sub === null && nextOrError === "next" && observer.complete) {
            observer.complete();
          }
        }
      };
      Concast2.prototype.addObserver = function(observer) {
        if (!this.observers.has(observer)) {
          this.deliverLastMessage(observer);
          this.observers.add(observer);
        }
      };
      Concast2.prototype.removeObserver = function(observer) {
        if (this.observers.delete(observer) && this.observers.size < 1) {
          this.handlers.complete();
        }
      };
      Concast2.prototype.notify = function(method, arg) {
        var nextResultListeners = this.nextResultListeners;
        if (nextResultListeners.size) {
          this.nextResultListeners = /* @__PURE__ */ new Set();
          nextResultListeners.forEach(function(listener) {
            return listener(method, arg);
          });
        }
      };
      Concast2.prototype.beforeNext = function(callback) {
        var called = false;
        this.nextResultListeners.add(function(method, arg) {
          if (!called) {
            called = true;
            callback(method, arg);
          }
        });
      };
      return Concast2;
    })(Observable)
  );
  fixObservableSubclass(Concast);

  // node_modules/@apollo/client/utilities/common/incrementalResult.js
  function isExecutionPatchIncrementalResult(value) {
    return "incremental" in value;
  }
  function isExecutionPatchInitialResult(value) {
    return "hasNext" in value && "data" in value;
  }
  function isExecutionPatchResult(value) {
    return isExecutionPatchIncrementalResult(value) || isExecutionPatchInitialResult(value);
  }
  function isApolloPayloadResult(value) {
    return isNonNullObject(value) && "payload" in value;
  }
  function mergeIncrementalData(prevResult, result2) {
    var mergedData = prevResult;
    var merger = new DeepMerger();
    if (isExecutionPatchIncrementalResult(result2) && isNonEmptyArray(result2.incremental)) {
      result2.incremental.forEach(function(_a2) {
        var data = _a2.data, path = _a2.path;
        for (var i = path.length - 1; i >= 0; --i) {
          var key = path[i];
          var isNumericKey = !isNaN(+key);
          var parent_1 = isNumericKey ? [] : {};
          parent_1[key] = data;
          data = parent_1;
        }
        mergedData = merger.merge(mergedData, data);
      });
    }
    return mergedData;
  }

  // node_modules/@apollo/client/utilities/common/errorHandling.js
  function graphQLResultHasError(result2) {
    var errors = getGraphQLErrorsFromResult(result2);
    return isNonEmptyArray(errors);
  }
  function getGraphQLErrorsFromResult(result2) {
    var graphQLErrors = isNonEmptyArray(result2.errors) ? result2.errors.slice(0) : [];
    if (isExecutionPatchIncrementalResult(result2) && isNonEmptyArray(result2.incremental)) {
      result2.incremental.forEach(function(incrementalResult) {
        if (incrementalResult.errors) {
          graphQLErrors.push.apply(graphQLErrors, incrementalResult.errors);
        }
      });
    }
    return graphQLErrors;
  }

  // node_modules/@apollo/client/utilities/common/compact.js
  function compact() {
    var objects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      objects[_i] = arguments[_i];
    }
    var result2 = /* @__PURE__ */ Object.create(null);
    objects.forEach(function(obj) {
      if (!obj)
        return;
      Object.keys(obj).forEach(function(key) {
        var value = obj[key];
        if (value !== void 0) {
          result2[key] = value;
        }
      });
    });
    return result2;
  }

  // node_modules/@apollo/client/utilities/common/mergeOptions.js
  function mergeOptions(defaults, options) {
    return compact(defaults, options, options.variables && {
      variables: compact(__assign(__assign({}, defaults && defaults.variables), options.variables))
    });
  }

  // node_modules/@apollo/client/link/utils/fromError.js
  function fromError(errorValue) {
    return new Observable(function(observer) {
      observer.error(errorValue);
    });
  }

  // node_modules/@apollo/client/link/utils/throwServerError.js
  var throwServerError = function(response, result2, message) {
    var error = new Error(message);
    error.name = "ServerError";
    error.response = response;
    error.statusCode = response.status;
    error.result = result2;
    throw error;
  };

  // node_modules/@apollo/client/link/utils/validateOperation.js
  function validateOperation(operation) {
    var OPERATION_FIELDS = [
      "query",
      "operationName",
      "variables",
      "extensions",
      "context"
    ];
    for (var _i = 0, _a2 = Object.keys(operation); _i < _a2.length; _i++) {
      var key = _a2[_i];
      if (OPERATION_FIELDS.indexOf(key) < 0) {
        throw newInvariantError(46, key);
      }
    }
    return operation;
  }

  // node_modules/@apollo/client/link/utils/createOperation.js
  function createOperation(starting, operation) {
    var context = __assign({}, starting);
    var setContext = function(next) {
      if (typeof next === "function") {
        context = __assign(__assign({}, context), next(context));
      } else {
        context = __assign(__assign({}, context), next);
      }
    };
    var getContext = function() {
      return __assign({}, context);
    };
    Object.defineProperty(operation, "setContext", {
      enumerable: false,
      value: setContext
    });
    Object.defineProperty(operation, "getContext", {
      enumerable: false,
      value: getContext
    });
    return operation;
  }

  // node_modules/@apollo/client/link/utils/transformOperation.js
  function transformOperation(operation) {
    var transformedOperation = {
      variables: operation.variables || {},
      extensions: operation.extensions || {},
      operationName: operation.operationName,
      query: operation.query
    };
    if (!transformedOperation.operationName) {
      transformedOperation.operationName = typeof transformedOperation.query !== "string" ? getOperationName(transformedOperation.query) || void 0 : "";
    }
    return transformedOperation;
  }

  // node_modules/@apollo/client/link/utils/filterOperationVariables.js
  function filterOperationVariables(variables, query) {
    var result2 = __assign({}, variables);
    var unusedNames = new Set(Object.keys(variables));
    visit(query, {
      Variable: function(node, _key, parent) {
        if (parent && parent.kind !== "VariableDefinition") {
          unusedNames.delete(node.name.value);
        }
      }
    });
    unusedNames.forEach(function(name) {
      delete result2[name];
    });
    return result2;
  }

  // node_modules/@apollo/client/link/core/ApolloLink.js
  function passthrough(op, forward) {
    return forward ? forward(op) : Observable.of();
  }
  function toLink(handler) {
    return typeof handler === "function" ? new ApolloLink(handler) : handler;
  }
  function isTerminating(link) {
    return link.request.length <= 1;
  }
  var ApolloLink = (
    /** @class */
    (function() {
      function ApolloLink2(request) {
        if (request)
          this.request = request;
      }
      ApolloLink2.empty = function() {
        return new ApolloLink2(function() {
          return Observable.of();
        });
      };
      ApolloLink2.from = function(links) {
        if (links.length === 0)
          return ApolloLink2.empty();
        return links.map(toLink).reduce(function(x, y) {
          return x.concat(y);
        });
      };
      ApolloLink2.split = function(test, left, right) {
        var leftLink = toLink(left);
        var rightLink = toLink(right || new ApolloLink2(passthrough));
        var ret;
        if (isTerminating(leftLink) && isTerminating(rightLink)) {
          ret = new ApolloLink2(function(operation) {
            return test(operation) ? leftLink.request(operation) || Observable.of() : rightLink.request(operation) || Observable.of();
          });
        } else {
          ret = new ApolloLink2(function(operation, forward) {
            return test(operation) ? leftLink.request(operation, forward) || Observable.of() : rightLink.request(operation, forward) || Observable.of();
          });
        }
        return Object.assign(ret, { left: leftLink, right: rightLink });
      };
      ApolloLink2.execute = function(link, operation) {
        return link.request(createOperation(operation.context, transformOperation(validateOperation(operation)))) || Observable.of();
      };
      ApolloLink2.concat = function(first, second) {
        var firstLink = toLink(first);
        if (isTerminating(firstLink)) {
          globalThis.__DEV__ !== false && invariant2.warn(38, firstLink);
          return firstLink;
        }
        var nextLink = toLink(second);
        var ret;
        if (isTerminating(nextLink)) {
          ret = new ApolloLink2(function(operation) {
            return firstLink.request(operation, function(op) {
              return nextLink.request(op) || Observable.of();
            }) || Observable.of();
          });
        } else {
          ret = new ApolloLink2(function(operation, forward) {
            return firstLink.request(operation, function(op) {
              return nextLink.request(op, forward) || Observable.of();
            }) || Observable.of();
          });
        }
        return Object.assign(ret, { left: firstLink, right: nextLink });
      };
      ApolloLink2.prototype.split = function(test, left, right) {
        return this.concat(ApolloLink2.split(test, left, right || new ApolloLink2(passthrough)));
      };
      ApolloLink2.prototype.concat = function(next) {
        return ApolloLink2.concat(this, next);
      };
      ApolloLink2.prototype.request = function(operation, forward) {
        throw newInvariantError(39);
      };
      ApolloLink2.prototype.onError = function(error, observer) {
        if (observer && observer.error) {
          observer.error(error);
          return false;
        }
        throw error;
      };
      ApolloLink2.prototype.setOnError = function(fn) {
        this.onError = fn;
        return this;
      };
      return ApolloLink2;
    })()
  );

  // node_modules/@apollo/client/link/core/execute.js
  var execute = ApolloLink.execute;

  // node_modules/@apollo/client/link/http/iterators/async.js
  function asyncIterator(source) {
    var _a2;
    var iterator = source[Symbol.asyncIterator]();
    return _a2 = {
      next: function() {
        return iterator.next();
      }
    }, _a2[Symbol.asyncIterator] = function() {
      return this;
    }, _a2;
  }

  // node_modules/@apollo/client/link/http/iterators/nodeStream.js
  function nodeStreamIterator(stream) {
    var cleanup = null;
    var error = null;
    var done = false;
    var data = [];
    var waiting = [];
    function onData(chunk) {
      if (error)
        return;
      if (waiting.length) {
        var shiftedArr = waiting.shift();
        if (Array.isArray(shiftedArr) && shiftedArr[0]) {
          return shiftedArr[0]({ value: chunk, done: false });
        }
      }
      data.push(chunk);
    }
    function onError(err) {
      error = err;
      var all = waiting.slice();
      all.forEach(function(pair) {
        pair[1](err);
      });
      !cleanup || cleanup();
    }
    function onEnd() {
      done = true;
      var all = waiting.slice();
      all.forEach(function(pair) {
        pair[0]({ value: void 0, done: true });
      });
      !cleanup || cleanup();
    }
    cleanup = function() {
      cleanup = null;
      stream.removeListener("data", onData);
      stream.removeListener("error", onError);
      stream.removeListener("end", onEnd);
      stream.removeListener("finish", onEnd);
      stream.removeListener("close", onEnd);
    };
    stream.on("data", onData);
    stream.on("error", onError);
    stream.on("end", onEnd);
    stream.on("finish", onEnd);
    stream.on("close", onEnd);
    function getNext() {
      return new Promise(function(resolve, reject) {
        if (error)
          return reject(error);
        if (data.length)
          return resolve({ value: data.shift(), done: false });
        if (done)
          return resolve({ value: void 0, done: true });
        waiting.push([resolve, reject]);
      });
    }
    var iterator = {
      next: function() {
        return getNext();
      }
    };
    if (canUseAsyncIteratorSymbol) {
      iterator[Symbol.asyncIterator] = function() {
        return this;
      };
    }
    return iterator;
  }

  // node_modules/@apollo/client/link/http/iterators/promise.js
  function promiseIterator(promise) {
    var resolved = false;
    var iterator = {
      next: function() {
        if (resolved)
          return Promise.resolve({
            value: void 0,
            done: true
          });
        resolved = true;
        return new Promise(function(resolve, reject) {
          promise.then(function(value) {
            resolve({ value, done: false });
          }).catch(reject);
        });
      }
    };
    if (canUseAsyncIteratorSymbol) {
      iterator[Symbol.asyncIterator] = function() {
        return this;
      };
    }
    return iterator;
  }

  // node_modules/@apollo/client/link/http/iterators/reader.js
  function readerIterator(reader) {
    var iterator = {
      next: function() {
        return reader.read();
      }
    };
    if (canUseAsyncIteratorSymbol) {
      iterator[Symbol.asyncIterator] = function() {
        return this;
      };
    }
    return iterator;
  }

  // node_modules/@apollo/client/link/http/responseIterator.js
  function isNodeResponse(value) {
    return !!value.body;
  }
  function isReadableStream(value) {
    return !!value.getReader;
  }
  function isAsyncIterableIterator(value) {
    return !!(canUseAsyncIteratorSymbol && value[Symbol.asyncIterator]);
  }
  function isStreamableBlob(value) {
    return !!value.stream;
  }
  function isBlob(value) {
    return !!value.arrayBuffer;
  }
  function isNodeReadableStream(value) {
    return !!value.pipe;
  }
  function responseIterator(response) {
    var body = response;
    if (isNodeResponse(response))
      body = response.body;
    if (isAsyncIterableIterator(body))
      return asyncIterator(body);
    if (isReadableStream(body))
      return readerIterator(body.getReader());
    if (isStreamableBlob(body)) {
      return readerIterator(body.stream().getReader());
    }
    if (isBlob(body))
      return promiseIterator(body.arrayBuffer());
    if (isNodeReadableStream(body))
      return nodeStreamIterator(body);
    throw new Error("Unknown body type for responseIterator. Please pass a streamable response.");
  }

  // node_modules/@apollo/client/errors/index.js
  var PROTOCOL_ERRORS_SYMBOL = Symbol();
  function graphQLResultHasProtocolErrors(result2) {
    if (result2.extensions) {
      return Array.isArray(result2.extensions[PROTOCOL_ERRORS_SYMBOL]);
    }
    return false;
  }
  function isApolloError(err) {
    return err.hasOwnProperty("graphQLErrors");
  }
  var generateErrorMessage = function(err) {
    var errors = __spreadArray(__spreadArray(__spreadArray([], err.graphQLErrors, true), err.clientErrors, true), err.protocolErrors, true);
    if (err.networkError)
      errors.push(err.networkError);
    return errors.map(function(err2) {
      return isNonNullObject(err2) && err2.message || "Error message not found.";
    }).join("\n");
  };
  var ApolloError = (
    /** @class */
    (function(_super) {
      __extends(ApolloError2, _super);
      function ApolloError2(_a2) {
        var graphQLErrors = _a2.graphQLErrors, protocolErrors = _a2.protocolErrors, clientErrors = _a2.clientErrors, networkError = _a2.networkError, errorMessage = _a2.errorMessage, extraInfo = _a2.extraInfo;
        var _this = _super.call(this, errorMessage) || this;
        _this.name = "ApolloError";
        _this.graphQLErrors = graphQLErrors || [];
        _this.protocolErrors = protocolErrors || [];
        _this.clientErrors = clientErrors || [];
        _this.networkError = networkError || null;
        _this.message = errorMessage || generateErrorMessage(_this);
        _this.extraInfo = extraInfo;
        _this.cause = __spreadArray(__spreadArray(__spreadArray([
          networkError
        ], graphQLErrors || [], true), protocolErrors || [], true), clientErrors || [], true).find(function(e) {
          return !!e;
        }) || null;
        _this.__proto__ = ApolloError2.prototype;
        return _this;
      }
      return ApolloError2;
    })(Error)
  );

  // node_modules/@apollo/client/link/http/parseAndCheckHttpResponse.js
  var hasOwnProperty4 = Object.prototype.hasOwnProperty;
  function readMultipartBody(response, nextValue) {
    return __awaiter(this, void 0, void 0, function() {
      var decoder, contentType, delimiter, boundaryVal, boundary, buffer, iterator, running, _a2, value, done, chunk, searchFrom, bi, message, i, headers, contentType_1, body, result2, next;
      var _b, _c;
      var _d;
      return __generator(this, function(_e) {
        switch (_e.label) {
          case 0:
            if (TextDecoder === void 0) {
              throw new Error("TextDecoder must be defined in the environment: please import a polyfill.");
            }
            decoder = new TextDecoder("utf-8");
            contentType = (_d = response.headers) === null || _d === void 0 ? void 0 : _d.get("content-type");
            delimiter = "boundary=";
            boundaryVal = (contentType === null || contentType === void 0 ? void 0 : contentType.includes(delimiter)) ? contentType === null || contentType === void 0 ? void 0 : contentType.substring((contentType === null || contentType === void 0 ? void 0 : contentType.indexOf(delimiter)) + delimiter.length).replace(/['"]/g, "").replace(/\;(.*)/gm, "").trim() : "-";
            boundary = "\r\n--".concat(boundaryVal);
            buffer = "";
            iterator = responseIterator(response);
            running = true;
            _e.label = 1;
          case 1:
            if (!running) return [3, 3];
            return [4, iterator.next()];
          case 2:
            _a2 = _e.sent(), value = _a2.value, done = _a2.done;
            chunk = typeof value === "string" ? value : decoder.decode(value);
            searchFrom = buffer.length - boundary.length + 1;
            running = !done;
            buffer += chunk;
            bi = buffer.indexOf(boundary, searchFrom);
            while (bi > -1) {
              message = void 0;
              _b = [
                buffer.slice(0, bi),
                buffer.slice(bi + boundary.length)
              ], message = _b[0], buffer = _b[1];
              i = message.indexOf("\r\n\r\n");
              headers = parseHeaders(message.slice(0, i));
              contentType_1 = headers["content-type"];
              if (contentType_1 && contentType_1.toLowerCase().indexOf("application/json") === -1) {
                throw new Error("Unsupported patch content type: application/json is required.");
              }
              body = message.slice(i);
              if (body) {
                result2 = parseJsonBody(response, body);
                if (Object.keys(result2).length > 1 || "data" in result2 || "incremental" in result2 || "errors" in result2 || "payload" in result2) {
                  if (isApolloPayloadResult(result2)) {
                    next = {};
                    if ("payload" in result2) {
                      if (Object.keys(result2).length === 1 && result2.payload === null) {
                        return [
                          2
                          /*return*/
                        ];
                      }
                      next = __assign({}, result2.payload);
                    }
                    if ("errors" in result2) {
                      next = __assign(__assign({}, next), { extensions: __assign(__assign({}, "extensions" in next ? next.extensions : null), (_c = {}, _c[PROTOCOL_ERRORS_SYMBOL] = result2.errors, _c)) });
                    }
                    nextValue(next);
                  } else {
                    nextValue(result2);
                  }
                } else if (
                  // If the chunk contains only a "hasNext: false", we can call
                  // observer.complete() immediately.
                  Object.keys(result2).length === 1 && "hasNext" in result2 && !result2.hasNext
                ) {
                  return [
                    2
                    /*return*/
                  ];
                }
              }
              bi = buffer.indexOf(boundary);
            }
            return [3, 1];
          case 3:
            return [
              2
              /*return*/
            ];
        }
      });
    });
  }
  function parseHeaders(headerText) {
    var headersInit = {};
    headerText.split("\n").forEach(function(line) {
      var i = line.indexOf(":");
      if (i > -1) {
        var name_1 = line.slice(0, i).trim().toLowerCase();
        var value = line.slice(i + 1).trim();
        headersInit[name_1] = value;
      }
    });
    return headersInit;
  }
  function parseJsonBody(response, bodyText) {
    if (response.status >= 300) {
      var getResult = function() {
        try {
          return JSON.parse(bodyText);
        } catch (err) {
          return bodyText;
        }
      };
      throwServerError(response, getResult(), "Response not successful: Received status code ".concat(response.status));
    }
    try {
      return JSON.parse(bodyText);
    } catch (err) {
      var parseError = err;
      parseError.name = "ServerParseError";
      parseError.response = response;
      parseError.statusCode = response.status;
      parseError.bodyText = bodyText;
      throw parseError;
    }
  }
  function handleError(err, observer) {
    if (err.result && err.result.errors && err.result.data) {
      observer.next(err.result);
    }
    observer.error(err);
  }
  function parseAndCheckHttpResponse(operations) {
    return function(response) {
      return response.text().then(function(bodyText) {
        return parseJsonBody(response, bodyText);
      }).then(function(result2) {
        if (!Array.isArray(result2) && !hasOwnProperty4.call(result2, "data") && !hasOwnProperty4.call(result2, "errors")) {
          throwServerError(response, result2, "Server response was missing for query '".concat(Array.isArray(operations) ? operations.map(function(op) {
            return op.operationName;
          }) : operations.operationName, "'."));
        }
        return result2;
      });
    };
  }

  // node_modules/@apollo/client/link/http/serializeFetchParameter.js
  var serializeFetchParameter = function(p, label) {
    var serialized;
    try {
      serialized = JSON.stringify(p);
    } catch (e) {
      var parseError = newInvariantError(42, label, e.message);
      parseError.parseError = e;
      throw parseError;
    }
    return serialized;
  };

  // node_modules/@apollo/client/link/http/selectHttpOptionsAndBody.js
  var defaultHttpOptions = {
    includeQuery: true,
    includeExtensions: false,
    preserveHeaderCase: false
  };
  var defaultHeaders = {
    // headers are case insensitive (https://stackoverflow.com/a/5259004)
    accept: "*/*",
    // The content-type header describes the type of the body of the request, and
    // so it typically only is sent with requests that actually have bodies. One
    // could imagine that Apollo Client would remove this header when constructing
    // a GET request (which has no body), but we historically have not done that.
    // This means that browsers will preflight all Apollo Client requests (even
    // GET requests). Apollo Server's CSRF prevention feature (introduced in
    // AS3.7) takes advantage of this fact and does not block requests with this
    // header. If you want to drop this header from GET requests, then you should
    // probably replace it with a `apollo-require-preflight` header, or servers
    // with CSRF prevention enabled might block your GET request. See
    // https://www.apollographql.com/docs/apollo-server/security/cors/#preventing-cross-site-request-forgery-csrf
    // for more details.
    "content-type": "application/json"
  };
  var defaultOptions = {
    method: "POST"
  };
  var fallbackHttpConfig = {
    http: defaultHttpOptions,
    headers: defaultHeaders,
    options: defaultOptions
  };
  var defaultPrinter = function(ast, printer) {
    return printer(ast);
  };
  function selectHttpOptionsAndBodyInternal(operation, printer) {
    var configs = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      configs[_i - 2] = arguments[_i];
    }
    var options = {};
    var http = {};
    configs.forEach(function(config) {
      options = __assign(__assign(__assign({}, options), config.options), { headers: __assign(__assign({}, options.headers), config.headers) });
      if (config.credentials) {
        options.credentials = config.credentials;
      }
      http = __assign(__assign({}, http), config.http);
    });
    if (options.headers) {
      options.headers = removeDuplicateHeaders(options.headers, http.preserveHeaderCase);
    }
    var operationName = operation.operationName, extensions = operation.extensions, variables = operation.variables, query = operation.query;
    var body = { operationName, variables };
    if (http.includeExtensions)
      body.extensions = extensions;
    if (http.includeQuery)
      body.query = printer(query, print2);
    return {
      options,
      body
    };
  }
  function removeDuplicateHeaders(headers, preserveHeaderCase) {
    if (!preserveHeaderCase) {
      var normalizedHeaders_1 = {};
      Object.keys(Object(headers)).forEach(function(name) {
        normalizedHeaders_1[name.toLowerCase()] = headers[name];
      });
      return normalizedHeaders_1;
    }
    var headerData = {};
    Object.keys(Object(headers)).forEach(function(name) {
      headerData[name.toLowerCase()] = {
        originalName: name,
        value: headers[name]
      };
    });
    var normalizedHeaders = {};
    Object.keys(headerData).forEach(function(name) {
      normalizedHeaders[headerData[name].originalName] = headerData[name].value;
    });
    return normalizedHeaders;
  }

  // node_modules/@apollo/client/link/http/checkFetcher.js
  var checkFetcher = function(fetcher) {
    if (!fetcher && typeof fetch === "undefined") {
      throw newInvariantError(40);
    }
  };

  // node_modules/@apollo/client/link/http/selectURI.js
  var selectURI = function(operation, fallbackURI) {
    var context = operation.getContext();
    var contextURI = context.uri;
    if (contextURI) {
      return contextURI;
    } else if (typeof fallbackURI === "function") {
      return fallbackURI(operation);
    } else {
      return fallbackURI || "/graphql";
    }
  };

  // node_modules/@apollo/client/link/http/rewriteURIForGET.js
  function rewriteURIForGET(chosenURI, body) {
    var queryParams = [];
    var addQueryParam = function(key, value) {
      queryParams.push("".concat(key, "=").concat(encodeURIComponent(value)));
    };
    if ("query" in body) {
      addQueryParam("query", body.query);
    }
    if (body.operationName) {
      addQueryParam("operationName", body.operationName);
    }
    if (body.variables) {
      var serializedVariables = void 0;
      try {
        serializedVariables = serializeFetchParameter(body.variables, "Variables map");
      } catch (parseError) {
        return { parseError };
      }
      addQueryParam("variables", serializedVariables);
    }
    if (body.extensions) {
      var serializedExtensions = void 0;
      try {
        serializedExtensions = serializeFetchParameter(body.extensions, "Extensions map");
      } catch (parseError) {
        return { parseError };
      }
      addQueryParam("extensions", serializedExtensions);
    }
    var fragment = "", preFragment = chosenURI;
    var fragmentStart = chosenURI.indexOf("#");
    if (fragmentStart !== -1) {
      fragment = chosenURI.substr(fragmentStart);
      preFragment = chosenURI.substr(0, fragmentStart);
    }
    var queryParamsPrefix = preFragment.indexOf("?") === -1 ? "?" : "&";
    var newURI = preFragment + queryParamsPrefix + queryParams.join("&") + fragment;
    return { newURI };
  }

  // node_modules/@apollo/client/link/http/createHttpLink.js
  var backupFetch = maybe(function() {
    return fetch;
  });
  var createHttpLink = function(linkOptions) {
    if (linkOptions === void 0) {
      linkOptions = {};
    }
    var _a2 = linkOptions.uri, uri = _a2 === void 0 ? "/graphql" : _a2, preferredFetch = linkOptions.fetch, _b = linkOptions.print, print3 = _b === void 0 ? defaultPrinter : _b, includeExtensions = linkOptions.includeExtensions, preserveHeaderCase = linkOptions.preserveHeaderCase, useGETForQueries = linkOptions.useGETForQueries, _c = linkOptions.includeUnusedVariables, includeUnusedVariables = _c === void 0 ? false : _c, requestOptions = __rest(linkOptions, ["uri", "fetch", "print", "includeExtensions", "preserveHeaderCase", "useGETForQueries", "includeUnusedVariables"]);
    if (globalThis.__DEV__ !== false) {
      checkFetcher(preferredFetch || backupFetch);
    }
    var linkConfig = {
      http: { includeExtensions, preserveHeaderCase },
      options: requestOptions.fetchOptions,
      credentials: requestOptions.credentials,
      headers: requestOptions.headers
    };
    return new ApolloLink(function(operation) {
      var chosenURI = selectURI(operation, uri);
      var context = operation.getContext();
      var clientAwarenessHeaders = {};
      if (context.clientAwareness) {
        var _a3 = context.clientAwareness, name_1 = _a3.name, version2 = _a3.version;
        if (name_1) {
          clientAwarenessHeaders["apollographql-client-name"] = name_1;
        }
        if (version2) {
          clientAwarenessHeaders["apollographql-client-version"] = version2;
        }
      }
      var contextHeaders = __assign(__assign({}, clientAwarenessHeaders), context.headers);
      var contextConfig = {
        http: context.http,
        options: context.fetchOptions,
        credentials: context.credentials,
        headers: contextHeaders
      };
      if (hasDirectives(["client"], operation.query)) {
        var transformedQuery = removeClientSetsFromDocument(operation.query);
        if (!transformedQuery) {
          return fromError(new Error("HttpLink: Trying to send a client-only query to the server. To send to the server, ensure a non-client field is added to the query or set the `transformOptions.removeClientFields` option to `true`."));
        }
        operation.query = transformedQuery;
      }
      var _b2 = selectHttpOptionsAndBodyInternal(operation, print3, fallbackHttpConfig, linkConfig, contextConfig), options = _b2.options, body = _b2.body;
      if (body.variables && !includeUnusedVariables) {
        body.variables = filterOperationVariables(body.variables, operation.query);
      }
      var controller;
      if (!options.signal && typeof AbortController !== "undefined") {
        controller = new AbortController();
        options.signal = controller.signal;
      }
      var definitionIsMutation = function(d) {
        return d.kind === "OperationDefinition" && d.operation === "mutation";
      };
      var definitionIsSubscription = function(d) {
        return d.kind === "OperationDefinition" && d.operation === "subscription";
      };
      var isSubscription = definitionIsSubscription(getMainDefinition(operation.query));
      var hasDefer = hasDirectives(["defer"], operation.query);
      if (useGETForQueries && !operation.query.definitions.some(definitionIsMutation)) {
        options.method = "GET";
      }
      if (hasDefer || isSubscription) {
        options.headers = options.headers || {};
        var acceptHeader = "multipart/mixed;";
        if (isSubscription && hasDefer) {
          globalThis.__DEV__ !== false && invariant2.warn(41);
        }
        if (isSubscription) {
          acceptHeader += "boundary=graphql;subscriptionSpec=1.0,application/json";
        } else if (hasDefer) {
          acceptHeader += "deferSpec=20220824,application/json";
        }
        options.headers.accept = acceptHeader;
      }
      if (options.method === "GET") {
        var _c2 = rewriteURIForGET(chosenURI, body), newURI = _c2.newURI, parseError = _c2.parseError;
        if (parseError) {
          return fromError(parseError);
        }
        chosenURI = newURI;
      } else {
        try {
          options.body = serializeFetchParameter(body, "Payload");
        } catch (parseError2) {
          return fromError(parseError2);
        }
      }
      return new Observable(function(observer) {
        var currentFetch = preferredFetch || maybe(function() {
          return fetch;
        }) || backupFetch;
        var observerNext = observer.next.bind(observer);
        currentFetch(chosenURI, options).then(function(response) {
          var _a4;
          operation.setContext({ response });
          var ctype = (_a4 = response.headers) === null || _a4 === void 0 ? void 0 : _a4.get("content-type");
          if (ctype !== null && /^multipart\/mixed/i.test(ctype)) {
            return readMultipartBody(response, observerNext);
          } else {
            return parseAndCheckHttpResponse(operation)(response).then(observerNext);
          }
        }).then(function() {
          controller = void 0;
          observer.complete();
        }).catch(function(err) {
          controller = void 0;
          handleError(err, observer);
        });
        return function() {
          if (controller)
            controller.abort();
        };
      });
    });
  };

  // node_modules/@apollo/client/link/http/HttpLink.js
  var HttpLink = (
    /** @class */
    (function(_super) {
      __extends(HttpLink2, _super);
      function HttpLink2(options) {
        if (options === void 0) {
          options = {};
        }
        var _this = _super.call(this, createHttpLink(options).request) || this;
        _this.options = options;
        return _this;
      }
      return HttpLink2;
    })(ApolloLink)
  );

  // node_modules/@wry/equality/lib/index.js
  var { toString: toString2, hasOwnProperty: hasOwnProperty5 } = Object.prototype;
  var fnToStr = Function.prototype.toString;
  var previousComparisons = /* @__PURE__ */ new Map();
  function equal(a, b) {
    try {
      return check(a, b);
    } finally {
      previousComparisons.clear();
    }
  }
  var lib_default = equal;
  function check(a, b) {
    if (a === b) {
      return true;
    }
    const aTag = toString2.call(a);
    const bTag = toString2.call(b);
    if (aTag !== bTag) {
      return false;
    }
    switch (aTag) {
      case "[object Array]":
        if (a.length !== b.length)
          return false;
      // Fall through to object case...
      case "[object Object]": {
        if (previouslyCompared(a, b))
          return true;
        const aKeys = definedKeys(a);
        const bKeys = definedKeys(b);
        const keyCount = aKeys.length;
        if (keyCount !== bKeys.length)
          return false;
        for (let k = 0; k < keyCount; ++k) {
          if (!hasOwnProperty5.call(b, aKeys[k])) {
            return false;
          }
        }
        for (let k = 0; k < keyCount; ++k) {
          const key = aKeys[k];
          if (!check(a[key], b[key])) {
            return false;
          }
        }
        return true;
      }
      case "[object Error]":
        return a.name === b.name && a.message === b.message;
      case "[object Number]":
        if (a !== a)
          return b !== b;
      // Fall through to shared +a === +b case...
      case "[object Boolean]":
      case "[object Date]":
        return +a === +b;
      case "[object RegExp]":
      case "[object String]":
        return a == `${b}`;
      case "[object Map]":
      case "[object Set]": {
        if (a.size !== b.size)
          return false;
        if (previouslyCompared(a, b))
          return true;
        const aIterator = a.entries();
        const isMap = aTag === "[object Map]";
        while (true) {
          const info = aIterator.next();
          if (info.done)
            break;
          const [aKey, aValue] = info.value;
          if (!b.has(aKey)) {
            return false;
          }
          if (isMap && !check(aValue, b.get(aKey))) {
            return false;
          }
        }
        return true;
      }
      case "[object Uint16Array]":
      case "[object Uint8Array]":
      // Buffer, in Node.js.
      case "[object Uint32Array]":
      case "[object Int32Array]":
      case "[object Int8Array]":
      case "[object Int16Array]":
      case "[object ArrayBuffer]":
        a = new Uint8Array(a);
        b = new Uint8Array(b);
      // Fall through...
      case "[object DataView]": {
        let len = a.byteLength;
        if (len === b.byteLength) {
          while (len-- && a[len] === b[len]) {
          }
        }
        return len === -1;
      }
      case "[object AsyncFunction]":
      case "[object GeneratorFunction]":
      case "[object AsyncGeneratorFunction]":
      case "[object Function]": {
        const aCode = fnToStr.call(a);
        if (aCode !== fnToStr.call(b)) {
          return false;
        }
        return !endsWith(aCode, nativeCodeSuffix);
      }
    }
    return false;
  }
  function definedKeys(obj) {
    return Object.keys(obj).filter(isDefinedKey, obj);
  }
  function isDefinedKey(key) {
    return this[key] !== void 0;
  }
  var nativeCodeSuffix = "{ [native code] }";
  function endsWith(full, suffix) {
    const fromIndex = full.length - suffix.length;
    return fromIndex >= 0 && full.indexOf(suffix, fromIndex) === fromIndex;
  }
  function previouslyCompared(a, b) {
    let bSet = previousComparisons.get(a);
    if (bSet) {
      if (bSet.has(b))
        return true;
    } else {
      previousComparisons.set(a, bSet = /* @__PURE__ */ new Set());
    }
    bSet.add(b);
    return false;
  }

  // node_modules/@apollo/client/core/equalByQuery.js
  function equalByQuery(query, _a2, _b, variables) {
    var aData = _a2.data, aRest = __rest(_a2, ["data"]);
    var bData = _b.data, bRest = __rest(_b, ["data"]);
    return lib_default(aRest, bRest) && equalBySelectionSet(getMainDefinition(query).selectionSet, aData, bData, {
      fragmentMap: createFragmentMap(getFragmentDefinitions(query)),
      variables
    });
  }
  function equalBySelectionSet(selectionSet, aResult, bResult, context) {
    if (aResult === bResult) {
      return true;
    }
    var seenSelections = /* @__PURE__ */ new Set();
    return selectionSet.selections.every(function(selection) {
      if (seenSelections.has(selection))
        return true;
      seenSelections.add(selection);
      if (!shouldInclude(selection, context.variables))
        return true;
      if (selectionHasNonreactiveDirective(selection))
        return true;
      if (isField(selection)) {
        var resultKey = resultKeyNameFromField(selection);
        var aResultChild = aResult && aResult[resultKey];
        var bResultChild = bResult && bResult[resultKey];
        var childSelectionSet = selection.selectionSet;
        if (!childSelectionSet) {
          return lib_default(aResultChild, bResultChild);
        }
        var aChildIsArray = Array.isArray(aResultChild);
        var bChildIsArray = Array.isArray(bResultChild);
        if (aChildIsArray !== bChildIsArray)
          return false;
        if (aChildIsArray && bChildIsArray) {
          var length_1 = aResultChild.length;
          if (bResultChild.length !== length_1) {
            return false;
          }
          for (var i = 0; i < length_1; ++i) {
            if (!equalBySelectionSet(childSelectionSet, aResultChild[i], bResultChild[i], context)) {
              return false;
            }
          }
          return true;
        }
        return equalBySelectionSet(childSelectionSet, aResultChild, bResultChild, context);
      } else {
        var fragment = getFragmentFromSelection(selection, context.fragmentMap);
        if (fragment) {
          if (selectionHasNonreactiveDirective(fragment))
            return true;
          return equalBySelectionSet(
            fragment.selectionSet,
            // Notice that we reuse the same aResult and bResult values here,
            // since the fragment ...spread does not specify a field name, but
            // consists of multiple fields (within the fragment's selection set)
            // that should be applied to the current result value(s).
            aResult,
            bResult,
            context
          );
        }
      }
    });
  }
  function selectionHasNonreactiveDirective(selection) {
    return !!selection.directives && selection.directives.some(directiveIsNonreactive);
  }
  function directiveIsNonreactive(dir) {
    return dir.name.value === "nonreactive";
  }

  // node_modules/@apollo/client/masking/utils.js
  var MapImpl = canUseWeakMap ? WeakMap : Map;
  var SetImpl = canUseWeakSet ? WeakSet : Set;
  var disableWarningsSlot = new Slot();
  var issuedWarning = false;
  function warnOnImproperCacheImplementation() {
    if (!issuedWarning) {
      issuedWarning = true;
      globalThis.__DEV__ !== false && invariant2.warn(52);
    }
  }

  // node_modules/@apollo/client/masking/maskDefinition.js
  function maskDefinition(data, selectionSet, context) {
    return disableWarningsSlot.withValue(true, function() {
      var masked = maskSelectionSet(data, selectionSet, context, false);
      if (Object.isFrozen(data)) {
        maybeDeepFreeze(masked);
      }
      return masked;
    });
  }
  function getMutableTarget(data, mutableTargets) {
    if (mutableTargets.has(data)) {
      return mutableTargets.get(data);
    }
    var mutableTarget = Array.isArray(data) ? [] : /* @__PURE__ */ Object.create(null);
    mutableTargets.set(data, mutableTarget);
    return mutableTarget;
  }
  function maskSelectionSet(data, selectionSet, context, migration, path) {
    var _a2;
    var knownChanged = context.knownChanged;
    var memo = getMutableTarget(data, context.mutableTargets);
    if (Array.isArray(data)) {
      for (var _i = 0, _b = Array.from(data.entries()); _i < _b.length; _i++) {
        var _c = _b[_i], index = _c[0], item = _c[1];
        if (item === null) {
          memo[index] = null;
          continue;
        }
        var masked = maskSelectionSet(item, selectionSet, context, migration, globalThis.__DEV__ !== false ? "".concat(path || "", "[").concat(index, "]") : void 0);
        if (knownChanged.has(masked)) {
          knownChanged.add(memo);
        }
        memo[index] = masked;
      }
      return knownChanged.has(memo) ? memo : data;
    }
    for (var _d = 0, _e = selectionSet.selections; _d < _e.length; _d++) {
      var selection = _e[_d];
      var value = void 0;
      if (migration) {
        knownChanged.add(memo);
      }
      if (selection.kind === Kind.FIELD) {
        var keyName = resultKeyNameFromField(selection);
        var childSelectionSet = selection.selectionSet;
        value = memo[keyName] || data[keyName];
        if (value === void 0) {
          continue;
        }
        if (childSelectionSet && value !== null) {
          var masked = maskSelectionSet(data[keyName], childSelectionSet, context, migration, globalThis.__DEV__ !== false ? "".concat(path || "", ".").concat(keyName) : void 0);
          if (knownChanged.has(masked)) {
            value = masked;
          }
        }
        if (!(globalThis.__DEV__ !== false)) {
          memo[keyName] = value;
        }
        if (globalThis.__DEV__ !== false) {
          if (migration && keyName !== "__typename" && // either the field is not present in the memo object
          // or it has a `get` descriptor, not a `value` descriptor
          // => it is a warning accessor and we can overwrite it
          // with another accessor
          !((_a2 = Object.getOwnPropertyDescriptor(memo, keyName)) === null || _a2 === void 0 ? void 0 : _a2.value)) {
            Object.defineProperty(memo, keyName, getAccessorWarningDescriptor(keyName, value, path || "", context.operationName, context.operationType));
          } else {
            delete memo[keyName];
            memo[keyName] = value;
          }
        }
      }
      if (selection.kind === Kind.INLINE_FRAGMENT && (!selection.typeCondition || context.cache.fragmentMatches(selection, data.__typename))) {
        value = maskSelectionSet(data, selection.selectionSet, context, migration, path);
      }
      if (selection.kind === Kind.FRAGMENT_SPREAD) {
        var fragmentName = selection.name.value;
        var fragment = context.fragmentMap[fragmentName] || (context.fragmentMap[fragmentName] = context.cache.lookupFragment(fragmentName));
        invariant2(fragment, 47, fragmentName);
        var mode = getFragmentMaskMode(selection);
        if (mode !== "mask") {
          value = maskSelectionSet(data, fragment.selectionSet, context, mode === "migrate", path);
        }
      }
      if (knownChanged.has(value)) {
        knownChanged.add(memo);
      }
    }
    if ("__typename" in data && !("__typename" in memo)) {
      memo.__typename = data.__typename;
    }
    if (Object.keys(memo).length !== Object.keys(data).length) {
      knownChanged.add(memo);
    }
    return knownChanged.has(memo) ? memo : data;
  }
  function getAccessorWarningDescriptor(fieldName, value, path, operationName, operationType) {
    var getValue = function() {
      if (disableWarningsSlot.getValue()) {
        return value;
      }
      globalThis.__DEV__ !== false && invariant2.warn(48, operationName ? "".concat(operationType, " '").concat(operationName, "'") : "anonymous ".concat(operationType), "".concat(path, ".").concat(fieldName).replace(/^\./, ""));
      getValue = function() {
        return value;
      };
      return value;
    };
    return {
      get: function() {
        return getValue();
      },
      set: function(newValue) {
        getValue = function() {
          return newValue;
        };
      },
      enumerable: true,
      configurable: true
    };
  }

  // node_modules/@apollo/client/masking/maskFragment.js
  function maskFragment(data, document2, cache, fragmentName) {
    if (!cache.fragmentMatches) {
      if (globalThis.__DEV__ !== false) {
        warnOnImproperCacheImplementation();
      }
      return data;
    }
    var fragments = document2.definitions.filter(function(node) {
      return node.kind === Kind.FRAGMENT_DEFINITION;
    });
    if (typeof fragmentName === "undefined") {
      invariant2(fragments.length === 1, 49, fragments.length);
      fragmentName = fragments[0].name.value;
    }
    var fragment = fragments.find(function(fragment2) {
      return fragment2.name.value === fragmentName;
    });
    invariant2(!!fragment, 50, fragmentName);
    if (data == null) {
      return data;
    }
    if (lib_default(data, {})) {
      return data;
    }
    return maskDefinition(data, fragment.selectionSet, {
      operationType: "fragment",
      operationName: fragment.name.value,
      fragmentMap: createFragmentMap(getFragmentDefinitions(document2)),
      cache,
      mutableTargets: new MapImpl(),
      knownChanged: new SetImpl()
    });
  }

  // node_modules/@apollo/client/masking/maskOperation.js
  function maskOperation(data, document2, cache) {
    var _a2;
    if (!cache.fragmentMatches) {
      if (globalThis.__DEV__ !== false) {
        warnOnImproperCacheImplementation();
      }
      return data;
    }
    var definition = getOperationDefinition(document2);
    invariant2(definition, 51);
    if (data == null) {
      return data;
    }
    return maskDefinition(data, definition.selectionSet, {
      operationType: definition.operation,
      operationName: (_a2 = definition.name) === null || _a2 === void 0 ? void 0 : _a2.value,
      fragmentMap: createFragmentMap(getFragmentDefinitions(document2)),
      cache,
      mutableTargets: new MapImpl(),
      knownChanged: new SetImpl()
    });
  }

  // node_modules/@apollo/client/cache/core/cache.js
  var ApolloCache = (
    /** @class */
    (function() {
      function ApolloCache2() {
        this.assumeImmutableResults = false;
        this.getFragmentDoc = wrap3(getFragmentQueryDocument, {
          max: cacheSizes["cache.fragmentQueryDocuments"] || 1e3,
          cache: WeakCache
        });
      }
      ApolloCache2.prototype.lookupFragment = function(fragmentName) {
        return null;
      };
      ApolloCache2.prototype.batch = function(options) {
        var _this = this;
        var optimisticId = typeof options.optimistic === "string" ? options.optimistic : options.optimistic === false ? null : void 0;
        var updateResult;
        this.performTransaction(function() {
          return updateResult = options.update(_this);
        }, optimisticId);
        return updateResult;
      };
      ApolloCache2.prototype.recordOptimisticTransaction = function(transaction, optimisticId) {
        this.performTransaction(transaction, optimisticId);
      };
      ApolloCache2.prototype.transformDocument = function(document2) {
        return document2;
      };
      ApolloCache2.prototype.transformForLink = function(document2) {
        return document2;
      };
      ApolloCache2.prototype.identify = function(object) {
        return;
      };
      ApolloCache2.prototype.gc = function() {
        return [];
      };
      ApolloCache2.prototype.modify = function(options) {
        return false;
      };
      ApolloCache2.prototype.readQuery = function(options, optimistic) {
        if (optimistic === void 0) {
          optimistic = !!options.optimistic;
        }
        return this.read(__assign(__assign({}, options), { rootId: options.id || "ROOT_QUERY", optimistic }));
      };
      ApolloCache2.prototype.watchFragment = function(options) {
        var _this = this;
        var fragment = options.fragment, fragmentName = options.fragmentName, from = options.from, _a2 = options.optimistic, optimistic = _a2 === void 0 ? true : _a2, otherOptions = __rest(options, ["fragment", "fragmentName", "from", "optimistic"]);
        var query = this.getFragmentDoc(fragment, fragmentName);
        var id = typeof from === "undefined" || typeof from === "string" ? from : this.identify(from);
        var dataMasking = !!options[Symbol.for("apollo.dataMasking")];
        if (globalThis.__DEV__ !== false) {
          var actualFragmentName = fragmentName || getFragmentDefinition(fragment).name.value;
          if (!id) {
            globalThis.__DEV__ !== false && invariant2.warn(1, actualFragmentName);
          }
        }
        var diffOptions = __assign(__assign({}, otherOptions), { returnPartialData: true, id, query, optimistic });
        var latestDiff;
        return new Observable(function(observer) {
          return _this.watch(__assign(__assign({}, diffOptions), { immediate: true, callback: function(diff) {
            var data = dataMasking ? maskFragment(diff.result, fragment, _this, fragmentName) : diff.result;
            if (
              // Always ensure we deliver the first result
              latestDiff && equalByQuery(
                query,
                { data: latestDiff.result },
                { data },
                // TODO: Fix the type on WatchFragmentOptions so that TVars
                // extends OperationVariables
                options.variables
              )
            ) {
              return;
            }
            var result2 = {
              data,
              complete: !!diff.complete
            };
            if (diff.missing) {
              result2.missing = mergeDeepArray(diff.missing.map(function(error) {
                return error.missing;
              }));
            }
            latestDiff = __assign(__assign({}, diff), { result: data });
            observer.next(result2);
          } }));
        });
      };
      ApolloCache2.prototype.readFragment = function(options, optimistic) {
        if (optimistic === void 0) {
          optimistic = !!options.optimistic;
        }
        return this.read(__assign(__assign({}, options), { query: this.getFragmentDoc(options.fragment, options.fragmentName), rootId: options.id, optimistic }));
      };
      ApolloCache2.prototype.writeQuery = function(_a2) {
        var id = _a2.id, data = _a2.data, options = __rest(_a2, ["id", "data"]);
        return this.write(Object.assign(options, {
          dataId: id || "ROOT_QUERY",
          result: data
        }));
      };
      ApolloCache2.prototype.writeFragment = function(_a2) {
        var id = _a2.id, data = _a2.data, fragment = _a2.fragment, fragmentName = _a2.fragmentName, options = __rest(_a2, ["id", "data", "fragment", "fragmentName"]);
        return this.write(Object.assign(options, {
          query: this.getFragmentDoc(fragment, fragmentName),
          dataId: id,
          result: data
        }));
      };
      ApolloCache2.prototype.updateQuery = function(options, update) {
        return this.batch({
          update: function(cache) {
            var value = cache.readQuery(options);
            var data = update(value);
            if (data === void 0 || data === null)
              return value;
            cache.writeQuery(__assign(__assign({}, options), { data }));
            return data;
          }
        });
      };
      ApolloCache2.prototype.updateFragment = function(options, update) {
        return this.batch({
          update: function(cache) {
            var value = cache.readFragment(options);
            var data = update(value);
            if (data === void 0 || data === null)
              return value;
            cache.writeFragment(__assign(__assign({}, options), { data }));
            return data;
          }
        });
      };
      return ApolloCache2;
    })()
  );
  if (globalThis.__DEV__ !== false) {
    ApolloCache.prototype.getMemoryInternals = getApolloCacheMemoryInternals;
  }

  // node_modules/@apollo/client/cache/core/types/common.js
  var MissingFieldError = (
    /** @class */
    (function(_super) {
      __extends(MissingFieldError2, _super);
      function MissingFieldError2(message, path, query, variables) {
        var _a2;
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.path = path;
        _this.query = query;
        _this.variables = variables;
        if (Array.isArray(_this.path)) {
          _this.missing = _this.message;
          for (var i = _this.path.length - 1; i >= 0; --i) {
            _this.missing = (_a2 = {}, _a2[_this.path[i]] = _this.missing, _a2);
          }
        } else {
          _this.missing = _this.path;
        }
        _this.__proto__ = MissingFieldError2.prototype;
        return _this;
      }
      return MissingFieldError2;
    })(Error)
  );

  // node_modules/@apollo/client/cache/inmemory/helpers.js
  var hasOwn = Object.prototype.hasOwnProperty;
  function isNullish(value) {
    return value === null || value === void 0;
  }
  function defaultDataIdFromObject(_a2, context) {
    var __typename = _a2.__typename, id = _a2.id, _id = _a2._id;
    if (typeof __typename === "string") {
      if (context) {
        context.keyObject = !isNullish(id) ? { id } : !isNullish(_id) ? { _id } : void 0;
      }
      if (isNullish(id) && !isNullish(_id)) {
        id = _id;
      }
      if (!isNullish(id)) {
        return "".concat(__typename, ":").concat(typeof id === "number" || typeof id === "string" ? id : JSON.stringify(id));
      }
    }
  }
  var defaultConfig = {
    dataIdFromObject: defaultDataIdFromObject,
    addTypename: true,
    resultCaching: true,
    // Thanks to the shouldCanonizeResults helper, this should be the only line
    // you have to change to reenable canonization by default in the future.
    canonizeResults: false
  };
  function normalizeConfig(config) {
    return compact(defaultConfig, config);
  }
  function shouldCanonizeResults(config) {
    var value = config.canonizeResults;
    return value === void 0 ? defaultConfig.canonizeResults : value;
  }
  function getTypenameFromStoreObject(store, objectOrReference) {
    return isReference(objectOrReference) ? store.get(objectOrReference.__ref, "__typename") : objectOrReference && objectOrReference.__typename;
  }
  var TypeOrFieldNameRegExp = /^[_a-z][_0-9a-z]*/i;
  function fieldNameFromStoreName(storeFieldName) {
    var match = storeFieldName.match(TypeOrFieldNameRegExp);
    return match ? match[0] : storeFieldName;
  }
  function selectionSetMatchesResult(selectionSet, result2, variables) {
    if (isNonNullObject(result2)) {
      return isArray(result2) ? result2.every(function(item) {
        return selectionSetMatchesResult(selectionSet, item, variables);
      }) : selectionSet.selections.every(function(field) {
        if (isField(field) && shouldInclude(field, variables)) {
          var key = resultKeyNameFromField(field);
          return hasOwn.call(result2, key) && (!field.selectionSet || selectionSetMatchesResult(field.selectionSet, result2[key], variables));
        }
        return true;
      });
    }
    return false;
  }
  function storeValueIsStoreObject(value) {
    return isNonNullObject(value) && !isReference(value) && !isArray(value);
  }
  function makeProcessedFieldsMerger() {
    return new DeepMerger();
  }
  function extractFragmentContext(document2, fragments) {
    var fragmentMap = createFragmentMap(getFragmentDefinitions(document2));
    return {
      fragmentMap,
      lookupFragment: function(name) {
        var def = fragmentMap[name];
        if (!def && fragments) {
          def = fragments.lookup(name);
        }
        return def || null;
      }
    };
  }

  // node_modules/@apollo/client/cache/inmemory/entityStore.js
  var DELETE = /* @__PURE__ */ Object.create(null);
  var delModifier = function() {
    return DELETE;
  };
  var INVALIDATE = /* @__PURE__ */ Object.create(null);
  var EntityStore = (
    /** @class */
    (function() {
      function EntityStore2(policies, group) {
        var _this = this;
        this.policies = policies;
        this.group = group;
        this.data = /* @__PURE__ */ Object.create(null);
        this.rootIds = /* @__PURE__ */ Object.create(null);
        this.refs = /* @__PURE__ */ Object.create(null);
        this.getFieldValue = function(objectOrReference, storeFieldName) {
          return maybeDeepFreeze(isReference(objectOrReference) ? _this.get(objectOrReference.__ref, storeFieldName) : objectOrReference && objectOrReference[storeFieldName]);
        };
        this.canRead = function(objOrRef) {
          return isReference(objOrRef) ? _this.has(objOrRef.__ref) : typeof objOrRef === "object";
        };
        this.toReference = function(objOrIdOrRef, mergeIntoStore) {
          if (typeof objOrIdOrRef === "string") {
            return makeReference(objOrIdOrRef);
          }
          if (isReference(objOrIdOrRef)) {
            return objOrIdOrRef;
          }
          var id = _this.policies.identify(objOrIdOrRef)[0];
          if (id) {
            var ref = makeReference(id);
            if (mergeIntoStore) {
              _this.merge(id, objOrIdOrRef);
            }
            return ref;
          }
        };
      }
      EntityStore2.prototype.toObject = function() {
        return __assign({}, this.data);
      };
      EntityStore2.prototype.has = function(dataId) {
        return this.lookup(dataId, true) !== void 0;
      };
      EntityStore2.prototype.get = function(dataId, fieldName) {
        this.group.depend(dataId, fieldName);
        if (hasOwn.call(this.data, dataId)) {
          var storeObject = this.data[dataId];
          if (storeObject && hasOwn.call(storeObject, fieldName)) {
            return storeObject[fieldName];
          }
        }
        if (fieldName === "__typename" && hasOwn.call(this.policies.rootTypenamesById, dataId)) {
          return this.policies.rootTypenamesById[dataId];
        }
        if (this instanceof Layer) {
          return this.parent.get(dataId, fieldName);
        }
      };
      EntityStore2.prototype.lookup = function(dataId, dependOnExistence) {
        if (dependOnExistence)
          this.group.depend(dataId, "__exists");
        if (hasOwn.call(this.data, dataId)) {
          return this.data[dataId];
        }
        if (this instanceof Layer) {
          return this.parent.lookup(dataId, dependOnExistence);
        }
        if (this.policies.rootTypenamesById[dataId]) {
          return /* @__PURE__ */ Object.create(null);
        }
      };
      EntityStore2.prototype.merge = function(older, newer) {
        var _this = this;
        var dataId;
        if (isReference(older))
          older = older.__ref;
        if (isReference(newer))
          newer = newer.__ref;
        var existing = typeof older === "string" ? this.lookup(dataId = older) : older;
        var incoming = typeof newer === "string" ? this.lookup(dataId = newer) : newer;
        if (!incoming)
          return;
        invariant2(typeof dataId === "string", 2);
        var merged = new DeepMerger(storeObjectReconciler).merge(existing, incoming);
        this.data[dataId] = merged;
        if (merged !== existing) {
          delete this.refs[dataId];
          if (this.group.caching) {
            var fieldsToDirty_1 = /* @__PURE__ */ Object.create(null);
            if (!existing)
              fieldsToDirty_1.__exists = 1;
            Object.keys(incoming).forEach(function(storeFieldName) {
              if (!existing || existing[storeFieldName] !== merged[storeFieldName]) {
                fieldsToDirty_1[storeFieldName] = 1;
                var fieldName = fieldNameFromStoreName(storeFieldName);
                if (fieldName !== storeFieldName && !_this.policies.hasKeyArgs(merged.__typename, fieldName)) {
                  fieldsToDirty_1[fieldName] = 1;
                }
                if (merged[storeFieldName] === void 0 && !(_this instanceof Layer)) {
                  delete merged[storeFieldName];
                }
              }
            });
            if (fieldsToDirty_1.__typename && !(existing && existing.__typename) && // Since we return default root __typename strings
            // automatically from store.get, we don't need to dirty the
            // ROOT_QUERY.__typename field if merged.__typename is equal
            // to the default string (usually "Query").
            this.policies.rootTypenamesById[dataId] === merged.__typename) {
              delete fieldsToDirty_1.__typename;
            }
            Object.keys(fieldsToDirty_1).forEach(function(fieldName) {
              return _this.group.dirty(dataId, fieldName);
            });
          }
        }
      };
      EntityStore2.prototype.modify = function(dataId, fields) {
        var _this = this;
        var storeObject = this.lookup(dataId);
        if (storeObject) {
          var changedFields_1 = /* @__PURE__ */ Object.create(null);
          var needToMerge_1 = false;
          var allDeleted_1 = true;
          var sharedDetails_1 = {
            DELETE,
            INVALIDATE,
            isReference,
            toReference: this.toReference,
            canRead: this.canRead,
            readField: function(fieldNameOrOptions, from) {
              return _this.policies.readField(typeof fieldNameOrOptions === "string" ? {
                fieldName: fieldNameOrOptions,
                from: from || makeReference(dataId)
              } : fieldNameOrOptions, { store: _this });
            }
          };
          Object.keys(storeObject).forEach(function(storeFieldName) {
            var fieldName = fieldNameFromStoreName(storeFieldName);
            var fieldValue = storeObject[storeFieldName];
            if (fieldValue === void 0)
              return;
            var modify = typeof fields === "function" ? fields : fields[storeFieldName] || fields[fieldName];
            if (modify) {
              var newValue = modify === delModifier ? DELETE : modify(maybeDeepFreeze(fieldValue), __assign(__assign({}, sharedDetails_1), { fieldName, storeFieldName, storage: _this.getStorage(dataId, storeFieldName) }));
              if (newValue === INVALIDATE) {
                _this.group.dirty(dataId, storeFieldName);
              } else {
                if (newValue === DELETE)
                  newValue = void 0;
                if (newValue !== fieldValue) {
                  changedFields_1[storeFieldName] = newValue;
                  needToMerge_1 = true;
                  fieldValue = newValue;
                  if (globalThis.__DEV__ !== false) {
                    var checkReference = function(ref) {
                      if (_this.lookup(ref.__ref) === void 0) {
                        globalThis.__DEV__ !== false && invariant2.warn(3, ref);
                        return true;
                      }
                    };
                    if (isReference(newValue)) {
                      checkReference(newValue);
                    } else if (Array.isArray(newValue)) {
                      var seenReference = false;
                      var someNonReference = void 0;
                      for (var _i = 0, newValue_1 = newValue; _i < newValue_1.length; _i++) {
                        var value = newValue_1[_i];
                        if (isReference(value)) {
                          seenReference = true;
                          if (checkReference(value))
                            break;
                        } else {
                          if (typeof value === "object" && !!value) {
                            var id = _this.policies.identify(value)[0];
                            if (id) {
                              someNonReference = value;
                            }
                          }
                        }
                        if (seenReference && someNonReference !== void 0) {
                          globalThis.__DEV__ !== false && invariant2.warn(4, someNonReference);
                          break;
                        }
                      }
                    }
                  }
                }
              }
            }
            if (fieldValue !== void 0) {
              allDeleted_1 = false;
            }
          });
          if (needToMerge_1) {
            this.merge(dataId, changedFields_1);
            if (allDeleted_1) {
              if (this instanceof Layer) {
                this.data[dataId] = void 0;
              } else {
                delete this.data[dataId];
              }
              this.group.dirty(dataId, "__exists");
            }
            return true;
          }
        }
        return false;
      };
      EntityStore2.prototype.delete = function(dataId, fieldName, args) {
        var _a2;
        var storeObject = this.lookup(dataId);
        if (storeObject) {
          var typename = this.getFieldValue(storeObject, "__typename");
          var storeFieldName = fieldName && args ? this.policies.getStoreFieldName({ typename, fieldName, args }) : fieldName;
          return this.modify(dataId, storeFieldName ? (_a2 = {}, _a2[storeFieldName] = delModifier, _a2) : delModifier);
        }
        return false;
      };
      EntityStore2.prototype.evict = function(options, limit) {
        var evicted = false;
        if (options.id) {
          if (hasOwn.call(this.data, options.id)) {
            evicted = this.delete(options.id, options.fieldName, options.args);
          }
          if (this instanceof Layer && this !== limit) {
            evicted = this.parent.evict(options, limit) || evicted;
          }
          if (options.fieldName || evicted) {
            this.group.dirty(options.id, options.fieldName || "__exists");
          }
        }
        return evicted;
      };
      EntityStore2.prototype.clear = function() {
        this.replace(null);
      };
      EntityStore2.prototype.extract = function() {
        var _this = this;
        var obj = this.toObject();
        var extraRootIds = [];
        this.getRootIdSet().forEach(function(id) {
          if (!hasOwn.call(_this.policies.rootTypenamesById, id)) {
            extraRootIds.push(id);
          }
        });
        if (extraRootIds.length) {
          obj.__META = { extraRootIds: extraRootIds.sort() };
        }
        return obj;
      };
      EntityStore2.prototype.replace = function(newData) {
        var _this = this;
        Object.keys(this.data).forEach(function(dataId) {
          if (!(newData && hasOwn.call(newData, dataId))) {
            _this.delete(dataId);
          }
        });
        if (newData) {
          var __META = newData.__META, rest_1 = __rest(newData, ["__META"]);
          Object.keys(rest_1).forEach(function(dataId) {
            _this.merge(dataId, rest_1[dataId]);
          });
          if (__META) {
            __META.extraRootIds.forEach(this.retain, this);
          }
        }
      };
      EntityStore2.prototype.retain = function(rootId) {
        return this.rootIds[rootId] = (this.rootIds[rootId] || 0) + 1;
      };
      EntityStore2.prototype.release = function(rootId) {
        if (this.rootIds[rootId] > 0) {
          var count = --this.rootIds[rootId];
          if (!count)
            delete this.rootIds[rootId];
          return count;
        }
        return 0;
      };
      EntityStore2.prototype.getRootIdSet = function(ids) {
        if (ids === void 0) {
          ids = /* @__PURE__ */ new Set();
        }
        Object.keys(this.rootIds).forEach(ids.add, ids);
        if (this instanceof Layer) {
          this.parent.getRootIdSet(ids);
        } else {
          Object.keys(this.policies.rootTypenamesById).forEach(ids.add, ids);
        }
        return ids;
      };
      EntityStore2.prototype.gc = function() {
        var _this = this;
        var ids = this.getRootIdSet();
        var snapshot = this.toObject();
        ids.forEach(function(id) {
          if (hasOwn.call(snapshot, id)) {
            Object.keys(_this.findChildRefIds(id)).forEach(ids.add, ids);
            delete snapshot[id];
          }
        });
        var idsToRemove = Object.keys(snapshot);
        if (idsToRemove.length) {
          var root_1 = this;
          while (root_1 instanceof Layer)
            root_1 = root_1.parent;
          idsToRemove.forEach(function(id) {
            return root_1.delete(id);
          });
        }
        return idsToRemove;
      };
      EntityStore2.prototype.findChildRefIds = function(dataId) {
        if (!hasOwn.call(this.refs, dataId)) {
          var found_1 = this.refs[dataId] = /* @__PURE__ */ Object.create(null);
          var root2 = this.data[dataId];
          if (!root2)
            return found_1;
          var workSet_1 = /* @__PURE__ */ new Set([root2]);
          workSet_1.forEach(function(obj) {
            if (isReference(obj)) {
              found_1[obj.__ref] = true;
            }
            if (isNonNullObject(obj)) {
              Object.keys(obj).forEach(function(key) {
                var child = obj[key];
                if (isNonNullObject(child)) {
                  workSet_1.add(child);
                }
              });
            }
          });
        }
        return this.refs[dataId];
      };
      EntityStore2.prototype.makeCacheKey = function() {
        return this.group.keyMaker.lookupArray(arguments);
      };
      return EntityStore2;
    })()
  );
  var CacheGroup = (
    /** @class */
    (function() {
      function CacheGroup2(caching, parent) {
        if (parent === void 0) {
          parent = null;
        }
        this.caching = caching;
        this.parent = parent;
        this.d = null;
        this.resetCaching();
      }
      CacheGroup2.prototype.resetCaching = function() {
        this.d = this.caching ? dep() : null;
        this.keyMaker = new Trie(canUseWeakMap);
      };
      CacheGroup2.prototype.depend = function(dataId, storeFieldName) {
        if (this.d) {
          this.d(makeDepKey(dataId, storeFieldName));
          var fieldName = fieldNameFromStoreName(storeFieldName);
          if (fieldName !== storeFieldName) {
            this.d(makeDepKey(dataId, fieldName));
          }
          if (this.parent) {
            this.parent.depend(dataId, storeFieldName);
          }
        }
      };
      CacheGroup2.prototype.dirty = function(dataId, storeFieldName) {
        if (this.d) {
          this.d.dirty(
            makeDepKey(dataId, storeFieldName),
            // When storeFieldName === "__exists", that means the entity identified
            // by dataId has either disappeared from the cache or was newly added,
            // so the result caching system would do well to "forget everything it
            // knows" about that object. To achieve that kind of invalidation, we
            // not only dirty the associated result cache entry, but also remove it
            // completely from the dependency graph. For the optimism implementation
            // details, see https://github.com/benjamn/optimism/pull/195.
            storeFieldName === "__exists" ? "forget" : "setDirty"
          );
        }
      };
      return CacheGroup2;
    })()
  );
  function makeDepKey(dataId, storeFieldName) {
    return storeFieldName + "#" + dataId;
  }
  function maybeDependOnExistenceOfEntity(store, entityId) {
    if (supportsResultCaching(store)) {
      store.group.depend(entityId, "__exists");
    }
  }
  (function(EntityStore2) {
    var Root = (
      /** @class */
      (function(_super) {
        __extends(Root2, _super);
        function Root2(_a2) {
          var policies = _a2.policies, _b = _a2.resultCaching, resultCaching = _b === void 0 ? true : _b, seed = _a2.seed;
          var _this = _super.call(this, policies, new CacheGroup(resultCaching)) || this;
          _this.stump = new Stump(_this);
          _this.storageTrie = new Trie(canUseWeakMap);
          if (seed)
            _this.replace(seed);
          return _this;
        }
        Root2.prototype.addLayer = function(layerId, replay) {
          return this.stump.addLayer(layerId, replay);
        };
        Root2.prototype.removeLayer = function() {
          return this;
        };
        Root2.prototype.getStorage = function() {
          return this.storageTrie.lookupArray(arguments);
        };
        return Root2;
      })(EntityStore2)
    );
    EntityStore2.Root = Root;
  })(EntityStore || (EntityStore = {}));
  var Layer = (
    /** @class */
    (function(_super) {
      __extends(Layer2, _super);
      function Layer2(id, parent, replay, group) {
        var _this = _super.call(this, parent.policies, group) || this;
        _this.id = id;
        _this.parent = parent;
        _this.replay = replay;
        _this.group = group;
        replay(_this);
        return _this;
      }
      Layer2.prototype.addLayer = function(layerId, replay) {
        return new Layer2(layerId, this, replay, this.group);
      };
      Layer2.prototype.removeLayer = function(layerId) {
        var _this = this;
        var parent = this.parent.removeLayer(layerId);
        if (layerId === this.id) {
          if (this.group.caching) {
            Object.keys(this.data).forEach(function(dataId) {
              var ownStoreObject = _this.data[dataId];
              var parentStoreObject = parent["lookup"](dataId);
              if (!parentStoreObject) {
                _this.delete(dataId);
              } else if (!ownStoreObject) {
                _this.group.dirty(dataId, "__exists");
                Object.keys(parentStoreObject).forEach(function(storeFieldName) {
                  _this.group.dirty(dataId, storeFieldName);
                });
              } else if (ownStoreObject !== parentStoreObject) {
                Object.keys(ownStoreObject).forEach(function(storeFieldName) {
                  if (!equal(ownStoreObject[storeFieldName], parentStoreObject[storeFieldName])) {
                    _this.group.dirty(dataId, storeFieldName);
                  }
                });
              }
            });
          }
          return parent;
        }
        if (parent === this.parent)
          return this;
        return parent.addLayer(this.id, this.replay);
      };
      Layer2.prototype.toObject = function() {
        return __assign(__assign({}, this.parent.toObject()), this.data);
      };
      Layer2.prototype.findChildRefIds = function(dataId) {
        var fromParent = this.parent.findChildRefIds(dataId);
        return hasOwn.call(this.data, dataId) ? __assign(__assign({}, fromParent), _super.prototype.findChildRefIds.call(this, dataId)) : fromParent;
      };
      Layer2.prototype.getStorage = function() {
        var p = this.parent;
        while (p.parent)
          p = p.parent;
        return p.getStorage.apply(
          p,
          // @ts-expect-error
          arguments
        );
      };
      return Layer2;
    })(EntityStore)
  );
  var Stump = (
    /** @class */
    (function(_super) {
      __extends(Stump2, _super);
      function Stump2(root2) {
        return _super.call(this, "EntityStore.Stump", root2, function() {
        }, new CacheGroup(root2.group.caching, root2.group)) || this;
      }
      Stump2.prototype.removeLayer = function() {
        return this;
      };
      Stump2.prototype.merge = function(older, newer) {
        return this.parent.merge(older, newer);
      };
      return Stump2;
    })(Layer)
  );
  function storeObjectReconciler(existingObject, incomingObject, property) {
    var existingValue = existingObject[property];
    var incomingValue = incomingObject[property];
    return equal(existingValue, incomingValue) ? existingValue : incomingValue;
  }
  function supportsResultCaching(store) {
    return !!(store instanceof EntityStore && store.group.caching);
  }

  // node_modules/@apollo/client/cache/inmemory/object-canon.js
  function shallowCopy(value) {
    if (isNonNullObject(value)) {
      return isArray(value) ? value.slice(0) : __assign({ __proto__: Object.getPrototypeOf(value) }, value);
    }
    return value;
  }
  var ObjectCanon = (
    /** @class */
    (function() {
      function ObjectCanon2() {
        this.known = new (canUseWeakSet ? WeakSet : Set)();
        this.pool = new Trie(canUseWeakMap);
        this.passes = /* @__PURE__ */ new WeakMap();
        this.keysByJSON = /* @__PURE__ */ new Map();
        this.empty = this.admit({});
      }
      ObjectCanon2.prototype.isKnown = function(value) {
        return isNonNullObject(value) && this.known.has(value);
      };
      ObjectCanon2.prototype.pass = function(value) {
        if (isNonNullObject(value)) {
          var copy = shallowCopy(value);
          this.passes.set(copy, value);
          return copy;
        }
        return value;
      };
      ObjectCanon2.prototype.admit = function(value) {
        var _this = this;
        if (isNonNullObject(value)) {
          var original = this.passes.get(value);
          if (original)
            return original;
          var proto = Object.getPrototypeOf(value);
          switch (proto) {
            case Array.prototype: {
              if (this.known.has(value))
                return value;
              var array = value.map(this.admit, this);
              var node = this.pool.lookupArray(array);
              if (!node.array) {
                this.known.add(node.array = array);
                if (globalThis.__DEV__ !== false) {
                  Object.freeze(array);
                }
              }
              return node.array;
            }
            case null:
            case Object.prototype: {
              if (this.known.has(value))
                return value;
              var proto_1 = Object.getPrototypeOf(value);
              var array_1 = [proto_1];
              var keys = this.sortedKeys(value);
              array_1.push(keys.json);
              var firstValueIndex_1 = array_1.length;
              keys.sorted.forEach(function(key) {
                array_1.push(_this.admit(value[key]));
              });
              var node = this.pool.lookupArray(array_1);
              if (!node.object) {
                var obj_1 = node.object = Object.create(proto_1);
                this.known.add(obj_1);
                keys.sorted.forEach(function(key, i) {
                  obj_1[key] = array_1[firstValueIndex_1 + i];
                });
                if (globalThis.__DEV__ !== false) {
                  Object.freeze(obj_1);
                }
              }
              return node.object;
            }
          }
        }
        return value;
      };
      ObjectCanon2.prototype.sortedKeys = function(obj) {
        var keys = Object.keys(obj);
        var node = this.pool.lookupArray(keys);
        if (!node.keys) {
          keys.sort();
          var json = JSON.stringify(keys);
          if (!(node.keys = this.keysByJSON.get(json))) {
            this.keysByJSON.set(json, node.keys = { sorted: keys, json });
          }
        }
        return node.keys;
      };
      return ObjectCanon2;
    })()
  );

  // node_modules/@apollo/client/cache/inmemory/readFromStore.js
  function execSelectionSetKeyArgs(options) {
    return [
      options.selectionSet,
      options.objectOrReference,
      options.context,
      // We split out this property so we can pass different values
      // independently without modifying options.context itself.
      options.context.canonizeResults
    ];
  }
  var StoreReader = (
    /** @class */
    (function() {
      function StoreReader2(config) {
        var _this = this;
        this.knownResults = new (canUseWeakMap ? WeakMap : Map)();
        this.config = compact(config, {
          addTypename: config.addTypename !== false,
          canonizeResults: shouldCanonizeResults(config)
        });
        this.canon = config.canon || new ObjectCanon();
        this.executeSelectionSet = wrap3(function(options) {
          var _a2;
          var canonizeResults = options.context.canonizeResults;
          var peekArgs = execSelectionSetKeyArgs(options);
          peekArgs[3] = !canonizeResults;
          var other = (_a2 = _this.executeSelectionSet).peek.apply(_a2, peekArgs);
          if (other) {
            if (canonizeResults) {
              return __assign(__assign({}, other), {
                // If we previously read this result without canonizing it, we can
                // reuse that result simply by canonizing it now.
                result: _this.canon.admit(other.result)
              });
            }
            return other;
          }
          maybeDependOnExistenceOfEntity(options.context.store, options.enclosingRef.__ref);
          return _this.execSelectionSetImpl(options);
        }, {
          max: this.config.resultCacheMaxSize || cacheSizes["inMemoryCache.executeSelectionSet"] || 5e4,
          keyArgs: execSelectionSetKeyArgs,
          // Note that the parameters of makeCacheKey are determined by the
          // array returned by keyArgs.
          makeCacheKey: function(selectionSet, parent, context, canonizeResults) {
            if (supportsResultCaching(context.store)) {
              return context.store.makeCacheKey(selectionSet, isReference(parent) ? parent.__ref : parent, context.varString, canonizeResults);
            }
          }
        });
        this.executeSubSelectedArray = wrap3(function(options) {
          maybeDependOnExistenceOfEntity(options.context.store, options.enclosingRef.__ref);
          return _this.execSubSelectedArrayImpl(options);
        }, {
          max: this.config.resultCacheMaxSize || cacheSizes["inMemoryCache.executeSubSelectedArray"] || 1e4,
          makeCacheKey: function(_a2) {
            var field = _a2.field, array = _a2.array, context = _a2.context;
            if (supportsResultCaching(context.store)) {
              return context.store.makeCacheKey(field, array, context.varString);
            }
          }
        });
      }
      StoreReader2.prototype.resetCanon = function() {
        this.canon = new ObjectCanon();
      };
      StoreReader2.prototype.diffQueryAgainstStore = function(_a2) {
        var store = _a2.store, query = _a2.query, _b = _a2.rootId, rootId = _b === void 0 ? "ROOT_QUERY" : _b, variables = _a2.variables, _c = _a2.returnPartialData, returnPartialData = _c === void 0 ? true : _c, _d = _a2.canonizeResults, canonizeResults = _d === void 0 ? this.config.canonizeResults : _d;
        var policies = this.config.cache.policies;
        variables = __assign(__assign({}, getDefaultValues(getQueryDefinition(query))), variables);
        var rootRef = makeReference(rootId);
        var execResult = this.executeSelectionSet({
          selectionSet: getMainDefinition(query).selectionSet,
          objectOrReference: rootRef,
          enclosingRef: rootRef,
          context: __assign({ store, query, policies, variables, varString: canonicalStringify(variables), canonizeResults }, extractFragmentContext(query, this.config.fragments))
        });
        var missing;
        if (execResult.missing) {
          missing = [
            new MissingFieldError(firstMissing(execResult.missing), execResult.missing, query, variables)
          ];
          if (!returnPartialData) {
            throw missing[0];
          }
        }
        return {
          result: execResult.result,
          complete: !missing,
          missing
        };
      };
      StoreReader2.prototype.isFresh = function(result2, parent, selectionSet, context) {
        if (supportsResultCaching(context.store) && this.knownResults.get(result2) === selectionSet) {
          var latest = this.executeSelectionSet.peek(
            selectionSet,
            parent,
            context,
            // If result is canonical, then it could only have been previously
            // cached by the canonizing version of executeSelectionSet, so we can
            // avoid checking both possibilities here.
            this.canon.isKnown(result2)
          );
          if (latest && result2 === latest.result) {
            return true;
          }
        }
        return false;
      };
      StoreReader2.prototype.execSelectionSetImpl = function(_a2) {
        var _this = this;
        var selectionSet = _a2.selectionSet, objectOrReference = _a2.objectOrReference, enclosingRef = _a2.enclosingRef, context = _a2.context;
        if (isReference(objectOrReference) && !context.policies.rootTypenamesById[objectOrReference.__ref] && !context.store.has(objectOrReference.__ref)) {
          return {
            result: this.canon.empty,
            missing: "Dangling reference to missing ".concat(objectOrReference.__ref, " object")
          };
        }
        var variables = context.variables, policies = context.policies, store = context.store;
        var typename = store.getFieldValue(objectOrReference, "__typename");
        var objectsToMerge = [];
        var missing;
        var missingMerger = new DeepMerger();
        if (this.config.addTypename && typeof typename === "string" && !policies.rootIdsByTypename[typename]) {
          objectsToMerge.push({ __typename: typename });
        }
        function handleMissing(result3, resultName) {
          var _a3;
          if (result3.missing) {
            missing = missingMerger.merge(missing, (_a3 = {}, _a3[resultName] = result3.missing, _a3));
          }
          return result3.result;
        }
        var workSet = new Set(selectionSet.selections);
        workSet.forEach(function(selection) {
          var _a3, _b;
          if (!shouldInclude(selection, variables))
            return;
          if (isField(selection)) {
            var fieldValue = policies.readField({
              fieldName: selection.name.value,
              field: selection,
              variables: context.variables,
              from: objectOrReference
            }, context);
            var resultName = resultKeyNameFromField(selection);
            if (fieldValue === void 0) {
              if (!addTypenameToDocument.added(selection)) {
                missing = missingMerger.merge(missing, (_a3 = {}, _a3[resultName] = "Can't find field '".concat(selection.name.value, "' on ").concat(isReference(objectOrReference) ? objectOrReference.__ref + " object" : "object " + JSON.stringify(objectOrReference, null, 2)), _a3));
              }
            } else if (isArray(fieldValue)) {
              if (fieldValue.length > 0) {
                fieldValue = handleMissing(_this.executeSubSelectedArray({
                  field: selection,
                  array: fieldValue,
                  enclosingRef,
                  context
                }), resultName);
              }
            } else if (!selection.selectionSet) {
              if (context.canonizeResults) {
                fieldValue = _this.canon.pass(fieldValue);
              }
            } else if (fieldValue != null) {
              fieldValue = handleMissing(_this.executeSelectionSet({
                selectionSet: selection.selectionSet,
                objectOrReference: fieldValue,
                enclosingRef: isReference(fieldValue) ? fieldValue : enclosingRef,
                context
              }), resultName);
            }
            if (fieldValue !== void 0) {
              objectsToMerge.push((_b = {}, _b[resultName] = fieldValue, _b));
            }
          } else {
            var fragment = getFragmentFromSelection(selection, context.lookupFragment);
            if (!fragment && selection.kind === Kind.FRAGMENT_SPREAD) {
              throw newInvariantError(10, selection.name.value);
            }
            if (fragment && policies.fragmentMatches(fragment, typename)) {
              fragment.selectionSet.selections.forEach(workSet.add, workSet);
            }
          }
        });
        var result2 = mergeDeepArray(objectsToMerge);
        var finalResult = { result: result2, missing };
        var frozen = context.canonizeResults ? this.canon.admit(finalResult) : maybeDeepFreeze(finalResult);
        if (frozen.result) {
          this.knownResults.set(frozen.result, selectionSet);
        }
        return frozen;
      };
      StoreReader2.prototype.execSubSelectedArrayImpl = function(_a2) {
        var _this = this;
        var field = _a2.field, array = _a2.array, enclosingRef = _a2.enclosingRef, context = _a2.context;
        var missing;
        var missingMerger = new DeepMerger();
        function handleMissing(childResult, i) {
          var _a3;
          if (childResult.missing) {
            missing = missingMerger.merge(missing, (_a3 = {}, _a3[i] = childResult.missing, _a3));
          }
          return childResult.result;
        }
        if (field.selectionSet) {
          array = array.filter(context.store.canRead);
        }
        array = array.map(function(item, i) {
          if (item === null) {
            return null;
          }
          if (isArray(item)) {
            return handleMissing(_this.executeSubSelectedArray({
              field,
              array: item,
              enclosingRef,
              context
            }), i);
          }
          if (field.selectionSet) {
            return handleMissing(_this.executeSelectionSet({
              selectionSet: field.selectionSet,
              objectOrReference: item,
              enclosingRef: isReference(item) ? item : enclosingRef,
              context
            }), i);
          }
          if (globalThis.__DEV__ !== false) {
            assertSelectionSetForIdValue(context.store, field, item);
          }
          return item;
        });
        return {
          result: context.canonizeResults ? this.canon.admit(array) : array,
          missing
        };
      };
      return StoreReader2;
    })()
  );
  function firstMissing(tree) {
    try {
      JSON.stringify(tree, function(_, value) {
        if (typeof value === "string")
          throw value;
        return value;
      });
    } catch (result2) {
      return result2;
    }
  }
  function assertSelectionSetForIdValue(store, field, fieldValue) {
    if (!field.selectionSet) {
      var workSet_1 = /* @__PURE__ */ new Set([fieldValue]);
      workSet_1.forEach(function(value) {
        if (isNonNullObject(value)) {
          invariant2(
            !isReference(value),
            11,
            getTypenameFromStoreObject(store, value),
            field.name.value
          );
          Object.values(value).forEach(workSet_1.add, workSet_1);
        }
      });
    }
  }

  // node_modules/@apollo/client/cache/inmemory/reactiveVars.js
  var cacheSlot = new Slot();
  var cacheInfoMap = /* @__PURE__ */ new WeakMap();
  function getCacheInfo(cache) {
    var info = cacheInfoMap.get(cache);
    if (!info) {
      cacheInfoMap.set(cache, info = {
        vars: /* @__PURE__ */ new Set(),
        dep: dep()
      });
    }
    return info;
  }
  function forgetCache(cache) {
    getCacheInfo(cache).vars.forEach(function(rv) {
      return rv.forgetCache(cache);
    });
  }
  function recallCache(cache) {
    getCacheInfo(cache).vars.forEach(function(rv) {
      return rv.attachCache(cache);
    });
  }
  function makeVar(value) {
    var caches2 = /* @__PURE__ */ new Set();
    var listeners = /* @__PURE__ */ new Set();
    var rv = function(newValue) {
      if (arguments.length > 0) {
        if (value !== newValue) {
          value = newValue;
          caches2.forEach(function(cache2) {
            getCacheInfo(cache2).dep.dirty(rv);
            broadcast(cache2);
          });
          var oldListeners = Array.from(listeners);
          listeners.clear();
          oldListeners.forEach(function(listener) {
            return listener(value);
          });
        }
      } else {
        var cache = cacheSlot.getValue();
        if (cache) {
          attach(cache);
          getCacheInfo(cache).dep(rv);
        }
      }
      return value;
    };
    rv.onNextChange = function(listener) {
      listeners.add(listener);
      return function() {
        listeners.delete(listener);
      };
    };
    var attach = rv.attachCache = function(cache) {
      caches2.add(cache);
      getCacheInfo(cache).vars.add(rv);
      return rv;
    };
    rv.forgetCache = function(cache) {
      return caches2.delete(cache);
    };
    return rv;
  }
  function broadcast(cache) {
    if (cache.broadcastWatches) {
      cache.broadcastWatches();
    }
  }

  // node_modules/@apollo/client/cache/inmemory/key-extractor.js
  var specifierInfoCache = /* @__PURE__ */ Object.create(null);
  function lookupSpecifierInfo(spec) {
    var cacheKey = JSON.stringify(spec);
    return specifierInfoCache[cacheKey] || (specifierInfoCache[cacheKey] = /* @__PURE__ */ Object.create(null));
  }
  function keyFieldsFnFromSpecifier(specifier) {
    var info = lookupSpecifierInfo(specifier);
    return info.keyFieldsFn || (info.keyFieldsFn = function(object, context) {
      var extract = function(from, key) {
        return context.readField(key, from);
      };
      var keyObject = context.keyObject = collectSpecifierPaths(specifier, function(schemaKeyPath) {
        var extracted = extractKeyPath(
          context.storeObject,
          schemaKeyPath,
          // Using context.readField to extract paths from context.storeObject
          // allows the extraction to see through Reference objects and respect
          // custom read functions.
          extract
        );
        if (extracted === void 0 && object !== context.storeObject && hasOwn.call(object, schemaKeyPath[0])) {
          extracted = extractKeyPath(object, schemaKeyPath, extractKey);
        }
        invariant2(extracted !== void 0, 5, schemaKeyPath.join("."), object);
        return extracted;
      });
      return "".concat(context.typename, ":").concat(JSON.stringify(keyObject));
    });
  }
  function keyArgsFnFromSpecifier(specifier) {
    var info = lookupSpecifierInfo(specifier);
    return info.keyArgsFn || (info.keyArgsFn = function(args, _a2) {
      var field = _a2.field, variables = _a2.variables, fieldName = _a2.fieldName;
      var collected = collectSpecifierPaths(specifier, function(keyPath) {
        var firstKey = keyPath[0];
        var firstChar = firstKey.charAt(0);
        if (firstChar === "@") {
          if (field && isNonEmptyArray(field.directives)) {
            var directiveName_1 = firstKey.slice(1);
            var d = field.directives.find(function(d2) {
              return d2.name.value === directiveName_1;
            });
            var directiveArgs = d && argumentsObjectFromField(d, variables);
            return directiveArgs && extractKeyPath(
              directiveArgs,
              // If keyPath.length === 1, this code calls extractKeyPath with an
              // empty path, which works because it uses directiveArgs as the
              // extracted value.
              keyPath.slice(1)
            );
          }
          return;
        }
        if (firstChar === "$") {
          var variableName = firstKey.slice(1);
          if (variables && hasOwn.call(variables, variableName)) {
            var varKeyPath = keyPath.slice(0);
            varKeyPath[0] = variableName;
            return extractKeyPath(variables, varKeyPath);
          }
          return;
        }
        if (args) {
          return extractKeyPath(args, keyPath);
        }
      });
      var suffix = JSON.stringify(collected);
      if (args || suffix !== "{}") {
        fieldName += ":" + suffix;
      }
      return fieldName;
    });
  }
  function collectSpecifierPaths(specifier, extractor) {
    var merger = new DeepMerger();
    return getSpecifierPaths(specifier).reduce(function(collected, path) {
      var _a2;
      var toMerge = extractor(path);
      if (toMerge !== void 0) {
        for (var i = path.length - 1; i >= 0; --i) {
          toMerge = (_a2 = {}, _a2[path[i]] = toMerge, _a2);
        }
        collected = merger.merge(collected, toMerge);
      }
      return collected;
    }, /* @__PURE__ */ Object.create(null));
  }
  function getSpecifierPaths(spec) {
    var info = lookupSpecifierInfo(spec);
    if (!info.paths) {
      var paths_1 = info.paths = [];
      var currentPath_1 = [];
      spec.forEach(function(s, i) {
        if (isArray(s)) {
          getSpecifierPaths(s).forEach(function(p) {
            return paths_1.push(currentPath_1.concat(p));
          });
          currentPath_1.length = 0;
        } else {
          currentPath_1.push(s);
          if (!isArray(spec[i + 1])) {
            paths_1.push(currentPath_1.slice(0));
            currentPath_1.length = 0;
          }
        }
      });
    }
    return info.paths;
  }
  function extractKey(object, key) {
    return object[key];
  }
  function extractKeyPath(object, path, extract) {
    extract = extract || extractKey;
    return normalize(path.reduce(function reducer(obj, key) {
      return isArray(obj) ? obj.map(function(child) {
        return reducer(child, key);
      }) : obj && extract(obj, key);
    }, object));
  }
  function normalize(value) {
    if (isNonNullObject(value)) {
      if (isArray(value)) {
        return value.map(normalize);
      }
      return collectSpecifierPaths(Object.keys(value).sort(), function(path) {
        return extractKeyPath(value, path);
      });
    }
    return value;
  }

  // node_modules/@apollo/client/cache/inmemory/policies.js
  function argsFromFieldSpecifier(spec) {
    return spec.args !== void 0 ? spec.args : spec.field ? argumentsObjectFromField(spec.field, spec.variables) : null;
  }
  var nullKeyFieldsFn = function() {
    return void 0;
  };
  var simpleKeyArgsFn = function(_args, context) {
    return context.fieldName;
  };
  var mergeTrueFn = function(existing, incoming, _a2) {
    var mergeObjects = _a2.mergeObjects;
    return mergeObjects(existing, incoming);
  };
  var mergeFalseFn = function(_, incoming) {
    return incoming;
  };
  var Policies = (
    /** @class */
    (function() {
      function Policies2(config) {
        this.config = config;
        this.typePolicies = /* @__PURE__ */ Object.create(null);
        this.toBeAdded = /* @__PURE__ */ Object.create(null);
        this.supertypeMap = /* @__PURE__ */ new Map();
        this.fuzzySubtypes = /* @__PURE__ */ new Map();
        this.rootIdsByTypename = /* @__PURE__ */ Object.create(null);
        this.rootTypenamesById = /* @__PURE__ */ Object.create(null);
        this.usingPossibleTypes = false;
        this.config = __assign({ dataIdFromObject: defaultDataIdFromObject }, config);
        this.cache = this.config.cache;
        this.setRootTypename("Query");
        this.setRootTypename("Mutation");
        this.setRootTypename("Subscription");
        if (config.possibleTypes) {
          this.addPossibleTypes(config.possibleTypes);
        }
        if (config.typePolicies) {
          this.addTypePolicies(config.typePolicies);
        }
      }
      Policies2.prototype.identify = function(object, partialContext) {
        var _a2;
        var policies = this;
        var typename = partialContext && (partialContext.typename || ((_a2 = partialContext.storeObject) === null || _a2 === void 0 ? void 0 : _a2.__typename)) || object.__typename;
        if (typename === this.rootTypenamesById.ROOT_QUERY) {
          return ["ROOT_QUERY"];
        }
        var storeObject = partialContext && partialContext.storeObject || object;
        var context = __assign(__assign({}, partialContext), { typename, storeObject, readField: partialContext && partialContext.readField || function() {
          var options = normalizeReadFieldOptions(arguments, storeObject);
          return policies.readField(options, {
            store: policies.cache["data"],
            variables: options.variables
          });
        } });
        var id;
        var policy = typename && this.getTypePolicy(typename);
        var keyFn = policy && policy.keyFn || this.config.dataIdFromObject;
        disableWarningsSlot.withValue(true, function() {
          while (keyFn) {
            var specifierOrId = keyFn(__assign(__assign({}, object), storeObject), context);
            if (isArray(specifierOrId)) {
              keyFn = keyFieldsFnFromSpecifier(specifierOrId);
            } else {
              id = specifierOrId;
              break;
            }
          }
        });
        id = id ? String(id) : void 0;
        return context.keyObject ? [id, context.keyObject] : [id];
      };
      Policies2.prototype.addTypePolicies = function(typePolicies) {
        var _this = this;
        Object.keys(typePolicies).forEach(function(typename) {
          var _a2 = typePolicies[typename], queryType = _a2.queryType, mutationType = _a2.mutationType, subscriptionType = _a2.subscriptionType, incoming = __rest(_a2, ["queryType", "mutationType", "subscriptionType"]);
          if (queryType)
            _this.setRootTypename("Query", typename);
          if (mutationType)
            _this.setRootTypename("Mutation", typename);
          if (subscriptionType)
            _this.setRootTypename("Subscription", typename);
          if (hasOwn.call(_this.toBeAdded, typename)) {
            _this.toBeAdded[typename].push(incoming);
          } else {
            _this.toBeAdded[typename] = [incoming];
          }
        });
      };
      Policies2.prototype.updateTypePolicy = function(typename, incoming) {
        var _this = this;
        var existing = this.getTypePolicy(typename);
        var keyFields = incoming.keyFields, fields = incoming.fields;
        function setMerge(existing2, merge) {
          existing2.merge = typeof merge === "function" ? merge : merge === true ? mergeTrueFn : merge === false ? mergeFalseFn : existing2.merge;
        }
        setMerge(existing, incoming.merge);
        existing.keyFn = // Pass false to disable normalization for this typename.
        keyFields === false ? nullKeyFieldsFn : isArray(keyFields) ? keyFieldsFnFromSpecifier(keyFields) : typeof keyFields === "function" ? keyFields : existing.keyFn;
        if (fields) {
          Object.keys(fields).forEach(function(fieldName) {
            var existing2 = _this.getFieldPolicy(typename, fieldName, true);
            var incoming2 = fields[fieldName];
            if (typeof incoming2 === "function") {
              existing2.read = incoming2;
            } else {
              var keyArgs = incoming2.keyArgs, read = incoming2.read, merge = incoming2.merge;
              existing2.keyFn = // Pass false to disable argument-based differentiation of
              // field identities.
              keyArgs === false ? simpleKeyArgsFn : isArray(keyArgs) ? keyArgsFnFromSpecifier(keyArgs) : typeof keyArgs === "function" ? keyArgs : existing2.keyFn;
              if (typeof read === "function") {
                existing2.read = read;
              }
              setMerge(existing2, merge);
            }
            if (existing2.read && existing2.merge) {
              existing2.keyFn = existing2.keyFn || simpleKeyArgsFn;
            }
          });
        }
      };
      Policies2.prototype.setRootTypename = function(which, typename) {
        if (typename === void 0) {
          typename = which;
        }
        var rootId = "ROOT_" + which.toUpperCase();
        var old = this.rootTypenamesById[rootId];
        if (typename !== old) {
          invariant2(!old || old === which, 6, which);
          if (old)
            delete this.rootIdsByTypename[old];
          this.rootIdsByTypename[typename] = rootId;
          this.rootTypenamesById[rootId] = typename;
        }
      };
      Policies2.prototype.addPossibleTypes = function(possibleTypes) {
        var _this = this;
        this.usingPossibleTypes = true;
        Object.keys(possibleTypes).forEach(function(supertype) {
          _this.getSupertypeSet(supertype, true);
          possibleTypes[supertype].forEach(function(subtype) {
            _this.getSupertypeSet(subtype, true).add(supertype);
            var match = subtype.match(TypeOrFieldNameRegExp);
            if (!match || match[0] !== subtype) {
              _this.fuzzySubtypes.set(subtype, new RegExp(subtype));
            }
          });
        });
      };
      Policies2.prototype.getTypePolicy = function(typename) {
        var _this = this;
        if (!hasOwn.call(this.typePolicies, typename)) {
          var policy_1 = this.typePolicies[typename] = /* @__PURE__ */ Object.create(null);
          policy_1.fields = /* @__PURE__ */ Object.create(null);
          var supertypes_1 = this.supertypeMap.get(typename);
          if (!supertypes_1 && this.fuzzySubtypes.size) {
            supertypes_1 = this.getSupertypeSet(typename, true);
            this.fuzzySubtypes.forEach(function(regExp, fuzzy) {
              if (regExp.test(typename)) {
                var fuzzySupertypes = _this.supertypeMap.get(fuzzy);
                if (fuzzySupertypes) {
                  fuzzySupertypes.forEach(function(supertype) {
                    return supertypes_1.add(supertype);
                  });
                }
              }
            });
          }
          if (supertypes_1 && supertypes_1.size) {
            supertypes_1.forEach(function(supertype) {
              var _a2 = _this.getTypePolicy(supertype), fields = _a2.fields, rest = __rest(_a2, ["fields"]);
              Object.assign(policy_1, rest);
              Object.assign(policy_1.fields, fields);
            });
          }
        }
        var inbox = this.toBeAdded[typename];
        if (inbox && inbox.length) {
          inbox.splice(0).forEach(function(policy) {
            _this.updateTypePolicy(typename, policy);
          });
        }
        return this.typePolicies[typename];
      };
      Policies2.prototype.getFieldPolicy = function(typename, fieldName, createIfMissing) {
        if (typename) {
          var fieldPolicies = this.getTypePolicy(typename).fields;
          return fieldPolicies[fieldName] || createIfMissing && (fieldPolicies[fieldName] = /* @__PURE__ */ Object.create(null));
        }
      };
      Policies2.prototype.getSupertypeSet = function(subtype, createIfMissing) {
        var supertypeSet = this.supertypeMap.get(subtype);
        if (!supertypeSet && createIfMissing) {
          this.supertypeMap.set(subtype, supertypeSet = /* @__PURE__ */ new Set());
        }
        return supertypeSet;
      };
      Policies2.prototype.fragmentMatches = function(fragment, typename, result2, variables) {
        var _this = this;
        if (!fragment.typeCondition)
          return true;
        if (!typename)
          return false;
        var supertype = fragment.typeCondition.name.value;
        if (typename === supertype)
          return true;
        if (this.usingPossibleTypes && this.supertypeMap.has(supertype)) {
          var typenameSupertypeSet = this.getSupertypeSet(typename, true);
          var workQueue_1 = [typenameSupertypeSet];
          var maybeEnqueue_1 = function(subtype) {
            var supertypeSet2 = _this.getSupertypeSet(subtype, false);
            if (supertypeSet2 && supertypeSet2.size && workQueue_1.indexOf(supertypeSet2) < 0) {
              workQueue_1.push(supertypeSet2);
            }
          };
          var needToCheckFuzzySubtypes = !!(result2 && this.fuzzySubtypes.size);
          var checkingFuzzySubtypes = false;
          for (var i = 0; i < workQueue_1.length; ++i) {
            var supertypeSet = workQueue_1[i];
            if (supertypeSet.has(supertype)) {
              if (!typenameSupertypeSet.has(supertype)) {
                if (checkingFuzzySubtypes) {
                  globalThis.__DEV__ !== false && invariant2.warn(7, typename, supertype);
                }
                typenameSupertypeSet.add(supertype);
              }
              return true;
            }
            supertypeSet.forEach(maybeEnqueue_1);
            if (needToCheckFuzzySubtypes && // Start checking fuzzy subtypes only after exhausting all
            // non-fuzzy subtypes (after the final iteration of the loop).
            i === workQueue_1.length - 1 && // We could wait to compare fragment.selectionSet to result
            // after we verify the supertype, but this check is often less
            // expensive than that search, and we will have to do the
            // comparison anyway whenever we find a potential match.
            selectionSetMatchesResult(fragment.selectionSet, result2, variables)) {
              needToCheckFuzzySubtypes = false;
              checkingFuzzySubtypes = true;
              this.fuzzySubtypes.forEach(function(regExp, fuzzyString) {
                var match = typename.match(regExp);
                if (match && match[0] === typename) {
                  maybeEnqueue_1(fuzzyString);
                }
              });
            }
          }
        }
        return false;
      };
      Policies2.prototype.hasKeyArgs = function(typename, fieldName) {
        var policy = this.getFieldPolicy(typename, fieldName, false);
        return !!(policy && policy.keyFn);
      };
      Policies2.prototype.getStoreFieldName = function(fieldSpec) {
        var typename = fieldSpec.typename, fieldName = fieldSpec.fieldName;
        var policy = this.getFieldPolicy(typename, fieldName, false);
        var storeFieldName;
        var keyFn = policy && policy.keyFn;
        if (keyFn && typename) {
          var context = {
            typename,
            fieldName,
            field: fieldSpec.field || null,
            variables: fieldSpec.variables
          };
          var args = argsFromFieldSpecifier(fieldSpec);
          while (keyFn) {
            var specifierOrString = keyFn(args, context);
            if (isArray(specifierOrString)) {
              keyFn = keyArgsFnFromSpecifier(specifierOrString);
            } else {
              storeFieldName = specifierOrString || fieldName;
              break;
            }
          }
        }
        if (storeFieldName === void 0) {
          storeFieldName = fieldSpec.field ? storeKeyNameFromField(fieldSpec.field, fieldSpec.variables) : getStoreKeyName(fieldName, argsFromFieldSpecifier(fieldSpec));
        }
        if (storeFieldName === false) {
          return fieldName;
        }
        return fieldName === fieldNameFromStoreName(storeFieldName) ? storeFieldName : fieldName + ":" + storeFieldName;
      };
      Policies2.prototype.readField = function(options, context) {
        var objectOrReference = options.from;
        if (!objectOrReference)
          return;
        var nameOrField = options.field || options.fieldName;
        if (!nameOrField)
          return;
        if (options.typename === void 0) {
          var typename = context.store.getFieldValue(objectOrReference, "__typename");
          if (typename)
            options.typename = typename;
        }
        var storeFieldName = this.getStoreFieldName(options);
        var fieldName = fieldNameFromStoreName(storeFieldName);
        var existing = context.store.getFieldValue(objectOrReference, storeFieldName);
        var policy = this.getFieldPolicy(options.typename, fieldName, false);
        var read = policy && policy.read;
        if (read) {
          var readOptions = makeFieldFunctionOptions(this, objectOrReference, options, context, context.store.getStorage(isReference(objectOrReference) ? objectOrReference.__ref : objectOrReference, storeFieldName));
          return cacheSlot.withValue(this.cache, read, [
            existing,
            readOptions
          ]);
        }
        return existing;
      };
      Policies2.prototype.getReadFunction = function(typename, fieldName) {
        var policy = this.getFieldPolicy(typename, fieldName, false);
        return policy && policy.read;
      };
      Policies2.prototype.getMergeFunction = function(parentTypename, fieldName, childTypename) {
        var policy = this.getFieldPolicy(parentTypename, fieldName, false);
        var merge = policy && policy.merge;
        if (!merge && childTypename) {
          policy = this.getTypePolicy(childTypename);
          merge = policy && policy.merge;
        }
        return merge;
      };
      Policies2.prototype.runMergeFunction = function(existing, incoming, _a2, context, storage) {
        var field = _a2.field, typename = _a2.typename, merge = _a2.merge;
        if (merge === mergeTrueFn) {
          return makeMergeObjectsFunction(context.store)(existing, incoming);
        }
        if (merge === mergeFalseFn) {
          return incoming;
        }
        if (context.overwrite) {
          existing = void 0;
        }
        return merge(existing, incoming, makeFieldFunctionOptions(
          this,
          // Unlike options.readField for read functions, we do not fall
          // back to the current object if no foreignObjOrRef is provided,
          // because it's not clear what the current object should be for
          // merge functions: the (possibly undefined) existing object, or
          // the incoming object? If you think your merge function needs
          // to read sibling fields in order to produce a new value for
          // the current field, you might want to rethink your strategy,
          // because that's a recipe for making merge behavior sensitive
          // to the order in which fields are written into the cache.
          // However, readField(name, ref) is useful for merge functions
          // that need to deduplicate child objects and references.
          void 0,
          {
            typename,
            fieldName: field.name.value,
            field,
            variables: context.variables
          },
          context,
          storage || /* @__PURE__ */ Object.create(null)
        ));
      };
      return Policies2;
    })()
  );
  function makeFieldFunctionOptions(policies, objectOrReference, fieldSpec, context, storage) {
    var storeFieldName = policies.getStoreFieldName(fieldSpec);
    var fieldName = fieldNameFromStoreName(storeFieldName);
    var variables = fieldSpec.variables || context.variables;
    var _a2 = context.store, toReference = _a2.toReference, canRead = _a2.canRead;
    return {
      args: argsFromFieldSpecifier(fieldSpec),
      field: fieldSpec.field || null,
      fieldName,
      storeFieldName,
      variables,
      isReference,
      toReference,
      storage,
      cache: policies.cache,
      canRead,
      readField: function() {
        return policies.readField(normalizeReadFieldOptions(arguments, objectOrReference, variables), context);
      },
      mergeObjects: makeMergeObjectsFunction(context.store)
    };
  }
  function normalizeReadFieldOptions(readFieldArgs, objectOrReference, variables) {
    var fieldNameOrOptions = readFieldArgs[0], from = readFieldArgs[1], argc = readFieldArgs.length;
    var options;
    if (typeof fieldNameOrOptions === "string") {
      options = {
        fieldName: fieldNameOrOptions,
        // Default to objectOrReference only when no second argument was
        // passed for the from parameter, not when undefined is explicitly
        // passed as the second argument.
        from: argc > 1 ? from : objectOrReference
      };
    } else {
      options = __assign({}, fieldNameOrOptions);
      if (!hasOwn.call(options, "from")) {
        options.from = objectOrReference;
      }
    }
    if (globalThis.__DEV__ !== false && options.from === void 0) {
      globalThis.__DEV__ !== false && invariant2.warn(8, stringifyForDisplay(Array.from(readFieldArgs)));
    }
    if (void 0 === options.variables) {
      options.variables = variables;
    }
    return options;
  }
  function makeMergeObjectsFunction(store) {
    return function mergeObjects(existing, incoming) {
      if (isArray(existing) || isArray(incoming)) {
        throw newInvariantError(9);
      }
      if (isNonNullObject(existing) && isNonNullObject(incoming)) {
        var eType = store.getFieldValue(existing, "__typename");
        var iType = store.getFieldValue(incoming, "__typename");
        var typesDiffer = eType && iType && eType !== iType;
        if (typesDiffer) {
          return incoming;
        }
        if (isReference(existing) && storeValueIsStoreObject(incoming)) {
          store.merge(existing.__ref, incoming);
          return existing;
        }
        if (storeValueIsStoreObject(existing) && isReference(incoming)) {
          store.merge(existing, incoming.__ref);
          return incoming;
        }
        if (storeValueIsStoreObject(existing) && storeValueIsStoreObject(incoming)) {
          return __assign(__assign({}, existing), incoming);
        }
      }
      return incoming;
    };
  }

  // node_modules/@apollo/client/cache/inmemory/writeToStore.js
  function getContextFlavor(context, clientOnly, deferred) {
    var key = "".concat(clientOnly).concat(deferred);
    var flavored = context.flavors.get(key);
    if (!flavored) {
      context.flavors.set(key, flavored = context.clientOnly === clientOnly && context.deferred === deferred ? context : __assign(__assign({}, context), { clientOnly, deferred }));
    }
    return flavored;
  }
  var StoreWriter = (
    /** @class */
    (function() {
      function StoreWriter2(cache, reader, fragments) {
        this.cache = cache;
        this.reader = reader;
        this.fragments = fragments;
      }
      StoreWriter2.prototype.writeToStore = function(store, _a2) {
        var _this = this;
        var query = _a2.query, result2 = _a2.result, dataId = _a2.dataId, variables = _a2.variables, overwrite = _a2.overwrite;
        var operationDefinition = getOperationDefinition(query);
        var merger = makeProcessedFieldsMerger();
        variables = __assign(__assign({}, getDefaultValues(operationDefinition)), variables);
        var context = __assign(__assign({ store, written: /* @__PURE__ */ Object.create(null), merge: function(existing, incoming) {
          return merger.merge(existing, incoming);
        }, variables, varString: canonicalStringify(variables) }, extractFragmentContext(query, this.fragments)), { overwrite: !!overwrite, incomingById: /* @__PURE__ */ new Map(), clientOnly: false, deferred: false, flavors: /* @__PURE__ */ new Map() });
        var ref = this.processSelectionSet({
          result: result2 || /* @__PURE__ */ Object.create(null),
          dataId,
          selectionSet: operationDefinition.selectionSet,
          mergeTree: { map: /* @__PURE__ */ new Map() },
          context
        });
        if (!isReference(ref)) {
          throw newInvariantError(12, result2);
        }
        context.incomingById.forEach(function(_a3, dataId2) {
          var storeObject = _a3.storeObject, mergeTree = _a3.mergeTree, fieldNodeSet = _a3.fieldNodeSet;
          var entityRef = makeReference(dataId2);
          if (mergeTree && mergeTree.map.size) {
            var applied = _this.applyMerges(mergeTree, entityRef, storeObject, context);
            if (isReference(applied)) {
              return;
            }
            storeObject = applied;
          }
          if (globalThis.__DEV__ !== false && !context.overwrite) {
            var fieldsWithSelectionSets_1 = /* @__PURE__ */ Object.create(null);
            fieldNodeSet.forEach(function(field) {
              if (field.selectionSet) {
                fieldsWithSelectionSets_1[field.name.value] = true;
              }
            });
            var hasSelectionSet_1 = function(storeFieldName) {
              return fieldsWithSelectionSets_1[fieldNameFromStoreName(storeFieldName)] === true;
            };
            var hasMergeFunction_1 = function(storeFieldName) {
              var childTree = mergeTree && mergeTree.map.get(storeFieldName);
              return Boolean(childTree && childTree.info && childTree.info.merge);
            };
            Object.keys(storeObject).forEach(function(storeFieldName) {
              if (hasSelectionSet_1(storeFieldName) && !hasMergeFunction_1(storeFieldName)) {
                warnAboutDataLoss(entityRef, storeObject, storeFieldName, context.store);
              }
            });
          }
          store.merge(dataId2, storeObject);
        });
        store.retain(ref.__ref);
        return ref;
      };
      StoreWriter2.prototype.processSelectionSet = function(_a2) {
        var _this = this;
        var dataId = _a2.dataId, result2 = _a2.result, selectionSet = _a2.selectionSet, context = _a2.context, mergeTree = _a2.mergeTree;
        var policies = this.cache.policies;
        var incoming = /* @__PURE__ */ Object.create(null);
        var typename = dataId && policies.rootTypenamesById[dataId] || getTypenameFromResult(result2, selectionSet, context.fragmentMap) || dataId && context.store.get(dataId, "__typename");
        if ("string" === typeof typename) {
          incoming.__typename = typename;
        }
        var readField = function() {
          var options = normalizeReadFieldOptions(arguments, incoming, context.variables);
          if (isReference(options.from)) {
            var info = context.incomingById.get(options.from.__ref);
            if (info) {
              var result_1 = policies.readField(__assign(__assign({}, options), { from: info.storeObject }), context);
              if (result_1 !== void 0) {
                return result_1;
              }
            }
          }
          return policies.readField(options, context);
        };
        var fieldNodeSet = /* @__PURE__ */ new Set();
        this.flattenFields(
          selectionSet,
          result2,
          // This WriteContext will be the default context value for fields returned
          // by the flattenFields method, but some fields may be assigned a modified
          // context, depending on the presence of @client and other directives.
          context,
          typename
        ).forEach(function(context2, field) {
          var _a3;
          var resultFieldKey = resultKeyNameFromField(field);
          var value = result2[resultFieldKey];
          fieldNodeSet.add(field);
          if (value !== void 0) {
            var storeFieldName = policies.getStoreFieldName({
              typename,
              fieldName: field.name.value,
              field,
              variables: context2.variables
            });
            var childTree = getChildMergeTree(mergeTree, storeFieldName);
            var incomingValue = _this.processFieldValue(
              value,
              field,
              // Reset context.clientOnly and context.deferred to their default
              // values before processing nested selection sets.
              field.selectionSet ? getContextFlavor(context2, false, false) : context2,
              childTree
            );
            var childTypename = void 0;
            if (field.selectionSet && (isReference(incomingValue) || storeValueIsStoreObject(incomingValue))) {
              childTypename = readField("__typename", incomingValue);
            }
            var merge = policies.getMergeFunction(typename, field.name.value, childTypename);
            if (merge) {
              childTree.info = {
                // TODO Check compatibility against any existing childTree.field?
                field,
                typename,
                merge
              };
            } else {
              maybeRecycleChildMergeTree(mergeTree, storeFieldName);
            }
            incoming = context2.merge(incoming, (_a3 = {}, _a3[storeFieldName] = incomingValue, _a3));
          } else if (globalThis.__DEV__ !== false && !context2.clientOnly && !context2.deferred && !addTypenameToDocument.added(field) && // If the field has a read function, it may be a synthetic field or
          // provide a default value, so its absence from the written data should
          // not be cause for alarm.
          !policies.getReadFunction(typename, field.name.value)) {
            globalThis.__DEV__ !== false && invariant2.error(13, resultKeyNameFromField(field), result2);
          }
        });
        try {
          var _b = policies.identify(result2, {
            typename,
            selectionSet,
            fragmentMap: context.fragmentMap,
            storeObject: incoming,
            readField
          }), id = _b[0], keyObject = _b[1];
          dataId = dataId || id;
          if (keyObject) {
            incoming = context.merge(incoming, keyObject);
          }
        } catch (e) {
          if (!dataId)
            throw e;
        }
        if ("string" === typeof dataId) {
          var dataRef = makeReference(dataId);
          var sets = context.written[dataId] || (context.written[dataId] = []);
          if (sets.indexOf(selectionSet) >= 0)
            return dataRef;
          sets.push(selectionSet);
          if (this.reader && this.reader.isFresh(result2, dataRef, selectionSet, context)) {
            return dataRef;
          }
          var previous_1 = context.incomingById.get(dataId);
          if (previous_1) {
            previous_1.storeObject = context.merge(previous_1.storeObject, incoming);
            previous_1.mergeTree = mergeMergeTrees(previous_1.mergeTree, mergeTree);
            fieldNodeSet.forEach(function(field) {
              return previous_1.fieldNodeSet.add(field);
            });
          } else {
            context.incomingById.set(dataId, {
              storeObject: incoming,
              // Save a reference to mergeTree only if it is not empty, because
              // empty MergeTrees may be recycled by maybeRecycleChildMergeTree and
              // reused for entirely different parts of the result tree.
              mergeTree: mergeTreeIsEmpty(mergeTree) ? void 0 : mergeTree,
              fieldNodeSet
            });
          }
          return dataRef;
        }
        return incoming;
      };
      StoreWriter2.prototype.processFieldValue = function(value, field, context, mergeTree) {
        var _this = this;
        if (!field.selectionSet || value === null) {
          return globalThis.__DEV__ !== false ? cloneDeep(value) : value;
        }
        if (isArray(value)) {
          return value.map(function(item, i) {
            var value2 = _this.processFieldValue(item, field, context, getChildMergeTree(mergeTree, i));
            maybeRecycleChildMergeTree(mergeTree, i);
            return value2;
          });
        }
        return this.processSelectionSet({
          result: value,
          selectionSet: field.selectionSet,
          context,
          mergeTree
        });
      };
      StoreWriter2.prototype.flattenFields = function(selectionSet, result2, context, typename) {
        if (typename === void 0) {
          typename = getTypenameFromResult(result2, selectionSet, context.fragmentMap);
        }
        var fieldMap = /* @__PURE__ */ new Map();
        var policies = this.cache.policies;
        var limitingTrie = new Trie(false);
        (function flatten(selectionSet2, inheritedContext) {
          var visitedNode = limitingTrie.lookup(
            selectionSet2,
            // Because we take inheritedClientOnly and inheritedDeferred into
            // consideration here (in addition to selectionSet), it's possible for
            // the same selection set to be flattened more than once, if it appears
            // in the query with different @client and/or @directive configurations.
            inheritedContext.clientOnly,
            inheritedContext.deferred
          );
          if (visitedNode.visited)
            return;
          visitedNode.visited = true;
          selectionSet2.selections.forEach(function(selection) {
            if (!shouldInclude(selection, context.variables))
              return;
            var clientOnly = inheritedContext.clientOnly, deferred = inheritedContext.deferred;
            if (
              // Since the presence of @client or @defer on this field can only
              // cause clientOnly or deferred to become true, we can skip the
              // forEach loop if both clientOnly and deferred are already true.
              !(clientOnly && deferred) && isNonEmptyArray(selection.directives)
            ) {
              selection.directives.forEach(function(dir) {
                var name = dir.name.value;
                if (name === "client")
                  clientOnly = true;
                if (name === "defer") {
                  var args = argumentsObjectFromField(dir, context.variables);
                  if (!args || args.if !== false) {
                    deferred = true;
                  }
                }
              });
            }
            if (isField(selection)) {
              var existing = fieldMap.get(selection);
              if (existing) {
                clientOnly = clientOnly && existing.clientOnly;
                deferred = deferred && existing.deferred;
              }
              fieldMap.set(selection, getContextFlavor(context, clientOnly, deferred));
            } else {
              var fragment = getFragmentFromSelection(selection, context.lookupFragment);
              if (!fragment && selection.kind === Kind.FRAGMENT_SPREAD) {
                throw newInvariantError(14, selection.name.value);
              }
              if (fragment && policies.fragmentMatches(fragment, typename, result2, context.variables)) {
                flatten(fragment.selectionSet, getContextFlavor(context, clientOnly, deferred));
              }
            }
          });
        })(selectionSet, context);
        return fieldMap;
      };
      StoreWriter2.prototype.applyMerges = function(mergeTree, existing, incoming, context, getStorageArgs) {
        var _a2;
        var _this = this;
        if (mergeTree.map.size && !isReference(incoming)) {
          var e_1 = (
            // Items in the same position in different arrays are not
            // necessarily related to each other, so when incoming is an array
            // we process its elements as if there was no existing data.
            !isArray(incoming) && // Likewise, existing must be either a Reference or a StoreObject
            // in order for its fields to be safe to merge with the fields of
            // the incoming object.
            (isReference(existing) || storeValueIsStoreObject(existing)) ? existing : void 0
          );
          var i_1 = incoming;
          if (e_1 && !getStorageArgs) {
            getStorageArgs = [isReference(e_1) ? e_1.__ref : e_1];
          }
          var changedFields_1;
          var getValue_1 = function(from, name) {
            return isArray(from) ? typeof name === "number" ? from[name] : void 0 : context.store.getFieldValue(from, String(name));
          };
          mergeTree.map.forEach(function(childTree, storeFieldName) {
            var eVal = getValue_1(e_1, storeFieldName);
            var iVal = getValue_1(i_1, storeFieldName);
            if (void 0 === iVal)
              return;
            if (getStorageArgs) {
              getStorageArgs.push(storeFieldName);
            }
            var aVal = _this.applyMerges(childTree, eVal, iVal, context, getStorageArgs);
            if (aVal !== iVal) {
              changedFields_1 = changedFields_1 || /* @__PURE__ */ new Map();
              changedFields_1.set(storeFieldName, aVal);
            }
            if (getStorageArgs) {
              invariant2(getStorageArgs.pop() === storeFieldName);
            }
          });
          if (changedFields_1) {
            incoming = isArray(i_1) ? i_1.slice(0) : __assign({}, i_1);
            changedFields_1.forEach(function(value, name) {
              incoming[name] = value;
            });
          }
        }
        if (mergeTree.info) {
          return this.cache.policies.runMergeFunction(existing, incoming, mergeTree.info, context, getStorageArgs && (_a2 = context.store).getStorage.apply(_a2, getStorageArgs));
        }
        return incoming;
      };
      return StoreWriter2;
    })()
  );
  var emptyMergeTreePool = [];
  function getChildMergeTree(_a2, name) {
    var map = _a2.map;
    if (!map.has(name)) {
      map.set(name, emptyMergeTreePool.pop() || { map: /* @__PURE__ */ new Map() });
    }
    return map.get(name);
  }
  function mergeMergeTrees(left, right) {
    if (left === right || !right || mergeTreeIsEmpty(right))
      return left;
    if (!left || mergeTreeIsEmpty(left))
      return right;
    var info = left.info && right.info ? __assign(__assign({}, left.info), right.info) : left.info || right.info;
    var needToMergeMaps = left.map.size && right.map.size;
    var map = needToMergeMaps ? /* @__PURE__ */ new Map() : left.map.size ? left.map : right.map;
    var merged = { info, map };
    if (needToMergeMaps) {
      var remainingRightKeys_1 = new Set(right.map.keys());
      left.map.forEach(function(leftTree, key) {
        merged.map.set(key, mergeMergeTrees(leftTree, right.map.get(key)));
        remainingRightKeys_1.delete(key);
      });
      remainingRightKeys_1.forEach(function(key) {
        merged.map.set(key, mergeMergeTrees(right.map.get(key), left.map.get(key)));
      });
    }
    return merged;
  }
  function mergeTreeIsEmpty(tree) {
    return !tree || !(tree.info || tree.map.size);
  }
  function maybeRecycleChildMergeTree(_a2, name) {
    var map = _a2.map;
    var childTree = map.get(name);
    if (childTree && mergeTreeIsEmpty(childTree)) {
      emptyMergeTreePool.push(childTree);
      map.delete(name);
    }
  }
  var warnings = /* @__PURE__ */ new Set();
  function warnAboutDataLoss(existingRef, incomingObj, storeFieldName, store) {
    var getChild = function(objOrRef) {
      var child = store.getFieldValue(objOrRef, storeFieldName);
      return typeof child === "object" && child;
    };
    var existing = getChild(existingRef);
    if (!existing)
      return;
    var incoming = getChild(incomingObj);
    if (!incoming)
      return;
    if (isReference(existing))
      return;
    if (equal(existing, incoming))
      return;
    if (Object.keys(existing).every(function(key) {
      return store.getFieldValue(incoming, key) !== void 0;
    })) {
      return;
    }
    var parentType = store.getFieldValue(existingRef, "__typename") || store.getFieldValue(incomingObj, "__typename");
    var fieldName = fieldNameFromStoreName(storeFieldName);
    var typeDotName = "".concat(parentType, ".").concat(fieldName);
    if (warnings.has(typeDotName))
      return;
    warnings.add(typeDotName);
    var childTypenames = [];
    if (!isArray(existing) && !isArray(incoming)) {
      [existing, incoming].forEach(function(child) {
        var typename = store.getFieldValue(child, "__typename");
        if (typeof typename === "string" && !childTypenames.includes(typename)) {
          childTypenames.push(typename);
        }
      });
    }
    globalThis.__DEV__ !== false && invariant2.warn(15, fieldName, parentType, childTypenames.length ? "either ensure all objects of type " + childTypenames.join(" and ") + " have an ID or a custom merge function, or " : "", typeDotName, __assign({}, existing), __assign({}, incoming));
  }

  // node_modules/@apollo/client/cache/inmemory/inMemoryCache.js
  var InMemoryCache = (
    /** @class */
    (function(_super) {
      __extends(InMemoryCache2, _super);
      function InMemoryCache2(config) {
        if (config === void 0) {
          config = {};
        }
        var _this = _super.call(this) || this;
        _this.watches = /* @__PURE__ */ new Set();
        _this.addTypenameTransform = new DocumentTransform(addTypenameToDocument);
        _this.assumeImmutableResults = true;
        _this.makeVar = makeVar;
        _this.txCount = 0;
        _this.config = normalizeConfig(config);
        _this.addTypename = !!_this.config.addTypename;
        _this.policies = new Policies({
          cache: _this,
          dataIdFromObject: _this.config.dataIdFromObject,
          possibleTypes: _this.config.possibleTypes,
          typePolicies: _this.config.typePolicies
        });
        _this.init();
        return _this;
      }
      InMemoryCache2.prototype.init = function() {
        var rootStore = this.data = new EntityStore.Root({
          policies: this.policies,
          resultCaching: this.config.resultCaching
        });
        this.optimisticData = rootStore.stump;
        this.resetResultCache();
      };
      InMemoryCache2.prototype.resetResultCache = function(resetResultIdentities) {
        var _this = this;
        var previousReader = this.storeReader;
        var fragments = this.config.fragments;
        this.storeWriter = new StoreWriter(this, this.storeReader = new StoreReader({
          cache: this,
          addTypename: this.addTypename,
          resultCacheMaxSize: this.config.resultCacheMaxSize,
          canonizeResults: shouldCanonizeResults(this.config),
          canon: resetResultIdentities ? void 0 : previousReader && previousReader.canon,
          fragments
        }), fragments);
        this.maybeBroadcastWatch = wrap3(function(c, options) {
          return _this.broadcastWatch(c, options);
        }, {
          max: this.config.resultCacheMaxSize || cacheSizes["inMemoryCache.maybeBroadcastWatch"] || 5e3,
          makeCacheKey: function(c) {
            var store = c.optimistic ? _this.optimisticData : _this.data;
            if (supportsResultCaching(store)) {
              var optimistic = c.optimistic, id = c.id, variables = c.variables;
              return store.makeCacheKey(
                c.query,
                // Different watches can have the same query, optimistic
                // status, rootId, and variables, but if their callbacks are
                // different, the (identical) result needs to be delivered to
                // each distinct callback. The easiest way to achieve that
                // separation is to include c.callback in the cache key for
                // maybeBroadcastWatch calls. See issue #5733.
                c.callback,
                canonicalStringify({ optimistic, id, variables })
              );
            }
          }
        });
        (/* @__PURE__ */ new Set([this.data.group, this.optimisticData.group])).forEach(function(group) {
          return group.resetCaching();
        });
      };
      InMemoryCache2.prototype.restore = function(data) {
        this.init();
        if (data)
          this.data.replace(data);
        return this;
      };
      InMemoryCache2.prototype.extract = function(optimistic) {
        if (optimistic === void 0) {
          optimistic = false;
        }
        return (optimistic ? this.optimisticData : this.data).extract();
      };
      InMemoryCache2.prototype.read = function(options) {
        var _a2 = options.returnPartialData, returnPartialData = _a2 === void 0 ? false : _a2;
        try {
          return this.storeReader.diffQueryAgainstStore(__assign(__assign({}, options), { store: options.optimistic ? this.optimisticData : this.data, config: this.config, returnPartialData })).result || null;
        } catch (e) {
          if (e instanceof MissingFieldError) {
            return null;
          }
          throw e;
        }
      };
      InMemoryCache2.prototype.write = function(options) {
        try {
          ++this.txCount;
          return this.storeWriter.writeToStore(this.data, options);
        } finally {
          if (!--this.txCount && options.broadcast !== false) {
            this.broadcastWatches();
          }
        }
      };
      InMemoryCache2.prototype.modify = function(options) {
        if (hasOwn.call(options, "id") && !options.id) {
          return false;
        }
        var store = options.optimistic ? this.optimisticData : this.data;
        try {
          ++this.txCount;
          return store.modify(options.id || "ROOT_QUERY", options.fields);
        } finally {
          if (!--this.txCount && options.broadcast !== false) {
            this.broadcastWatches();
          }
        }
      };
      InMemoryCache2.prototype.diff = function(options) {
        return this.storeReader.diffQueryAgainstStore(__assign(__assign({}, options), { store: options.optimistic ? this.optimisticData : this.data, rootId: options.id || "ROOT_QUERY", config: this.config }));
      };
      InMemoryCache2.prototype.watch = function(watch) {
        var _this = this;
        if (!this.watches.size) {
          recallCache(this);
        }
        this.watches.add(watch);
        if (watch.immediate) {
          this.maybeBroadcastWatch(watch);
        }
        return function() {
          if (_this.watches.delete(watch) && !_this.watches.size) {
            forgetCache(_this);
          }
          _this.maybeBroadcastWatch.forget(watch);
        };
      };
      InMemoryCache2.prototype.gc = function(options) {
        var _a2;
        canonicalStringify.reset();
        print2.reset();
        this.addTypenameTransform.resetCache();
        (_a2 = this.config.fragments) === null || _a2 === void 0 ? void 0 : _a2.resetCaches();
        var ids = this.optimisticData.gc();
        if (options && !this.txCount) {
          if (options.resetResultCache) {
            this.resetResultCache(options.resetResultIdentities);
          } else if (options.resetResultIdentities) {
            this.storeReader.resetCanon();
          }
        }
        return ids;
      };
      InMemoryCache2.prototype.retain = function(rootId, optimistic) {
        return (optimistic ? this.optimisticData : this.data).retain(rootId);
      };
      InMemoryCache2.prototype.release = function(rootId, optimistic) {
        return (optimistic ? this.optimisticData : this.data).release(rootId);
      };
      InMemoryCache2.prototype.identify = function(object) {
        if (isReference(object))
          return object.__ref;
        try {
          return this.policies.identify(object)[0];
        } catch (e) {
          globalThis.__DEV__ !== false && invariant2.warn(e);
        }
      };
      InMemoryCache2.prototype.evict = function(options) {
        if (!options.id) {
          if (hasOwn.call(options, "id")) {
            return false;
          }
          options = __assign(__assign({}, options), { id: "ROOT_QUERY" });
        }
        try {
          ++this.txCount;
          return this.optimisticData.evict(options, this.data);
        } finally {
          if (!--this.txCount && options.broadcast !== false) {
            this.broadcastWatches();
          }
        }
      };
      InMemoryCache2.prototype.reset = function(options) {
        var _this = this;
        this.init();
        canonicalStringify.reset();
        if (options && options.discardWatches) {
          this.watches.forEach(function(watch) {
            return _this.maybeBroadcastWatch.forget(watch);
          });
          this.watches.clear();
          forgetCache(this);
        } else {
          this.broadcastWatches();
        }
        return Promise.resolve();
      };
      InMemoryCache2.prototype.removeOptimistic = function(idToRemove) {
        var newOptimisticData = this.optimisticData.removeLayer(idToRemove);
        if (newOptimisticData !== this.optimisticData) {
          this.optimisticData = newOptimisticData;
          this.broadcastWatches();
        }
      };
      InMemoryCache2.prototype.batch = function(options) {
        var _this = this;
        var update = options.update, _a2 = options.optimistic, optimistic = _a2 === void 0 ? true : _a2, removeOptimistic = options.removeOptimistic, onWatchUpdated = options.onWatchUpdated;
        var updateResult;
        var perform = function(layer) {
          var _a3 = _this, data = _a3.data, optimisticData = _a3.optimisticData;
          ++_this.txCount;
          if (layer) {
            _this.data = _this.optimisticData = layer;
          }
          try {
            return updateResult = update(_this);
          } finally {
            --_this.txCount;
            _this.data = data;
            _this.optimisticData = optimisticData;
          }
        };
        var alreadyDirty = /* @__PURE__ */ new Set();
        if (onWatchUpdated && !this.txCount) {
          this.broadcastWatches(__assign(__assign({}, options), { onWatchUpdated: function(watch) {
            alreadyDirty.add(watch);
            return false;
          } }));
        }
        if (typeof optimistic === "string") {
          this.optimisticData = this.optimisticData.addLayer(optimistic, perform);
        } else if (optimistic === false) {
          perform(this.data);
        } else {
          perform();
        }
        if (typeof removeOptimistic === "string") {
          this.optimisticData = this.optimisticData.removeLayer(removeOptimistic);
        }
        if (onWatchUpdated && alreadyDirty.size) {
          this.broadcastWatches(__assign(__assign({}, options), { onWatchUpdated: function(watch, diff) {
            var result2 = onWatchUpdated.call(this, watch, diff);
            if (result2 !== false) {
              alreadyDirty.delete(watch);
            }
            return result2;
          } }));
          if (alreadyDirty.size) {
            alreadyDirty.forEach(function(watch) {
              return _this.maybeBroadcastWatch.dirty(watch);
            });
          }
        } else {
          this.broadcastWatches(options);
        }
        return updateResult;
      };
      InMemoryCache2.prototype.performTransaction = function(update, optimisticId) {
        return this.batch({
          update,
          optimistic: optimisticId || optimisticId !== null
        });
      };
      InMemoryCache2.prototype.transformDocument = function(document2) {
        return this.addTypenameToDocument(this.addFragmentsToDocument(document2));
      };
      InMemoryCache2.prototype.fragmentMatches = function(fragment, typename) {
        return this.policies.fragmentMatches(fragment, typename);
      };
      InMemoryCache2.prototype.lookupFragment = function(fragmentName) {
        var _a2;
        return ((_a2 = this.config.fragments) === null || _a2 === void 0 ? void 0 : _a2.lookup(fragmentName)) || null;
      };
      InMemoryCache2.prototype.broadcastWatches = function(options) {
        var _this = this;
        if (!this.txCount) {
          this.watches.forEach(function(c) {
            return _this.maybeBroadcastWatch(c, options);
          });
        }
      };
      InMemoryCache2.prototype.addFragmentsToDocument = function(document2) {
        var fragments = this.config.fragments;
        return fragments ? fragments.transform(document2) : document2;
      };
      InMemoryCache2.prototype.addTypenameToDocument = function(document2) {
        if (this.addTypename) {
          return this.addTypenameTransform.transformDocument(document2);
        }
        return document2;
      };
      InMemoryCache2.prototype.broadcastWatch = function(c, options) {
        var lastDiff = c.lastDiff;
        var diff = this.diff(c);
        if (options) {
          if (c.optimistic && typeof options.optimistic === "string") {
            diff.fromOptimisticTransaction = true;
          }
          if (options.onWatchUpdated && options.onWatchUpdated.call(this, c, diff, lastDiff) === false) {
            return;
          }
        }
        if (!lastDiff || !equal(lastDiff.result, diff.result)) {
          c.callback(c.lastDiff = diff, lastDiff);
        }
      };
      return InMemoryCache2;
    })(ApolloCache)
  );
  if (globalThis.__DEV__ !== false) {
    InMemoryCache.prototype.getMemoryInternals = getInMemoryCacheMemoryInternals;
  }

  // node_modules/@apollo/client/core/networkStatus.js
  var NetworkStatus;
  (function(NetworkStatus2) {
    NetworkStatus2[NetworkStatus2["loading"] = 1] = "loading";
    NetworkStatus2[NetworkStatus2["setVariables"] = 2] = "setVariables";
    NetworkStatus2[NetworkStatus2["fetchMore"] = 3] = "fetchMore";
    NetworkStatus2[NetworkStatus2["refetch"] = 4] = "refetch";
    NetworkStatus2[NetworkStatus2["poll"] = 6] = "poll";
    NetworkStatus2[NetworkStatus2["ready"] = 7] = "ready";
    NetworkStatus2[NetworkStatus2["error"] = 8] = "error";
  })(NetworkStatus || (NetworkStatus = {}));
  function isNetworkRequestInFlight(networkStatus) {
    return networkStatus ? networkStatus < 7 : false;
  }

  // node_modules/@apollo/client/core/ObservableQuery.js
  var assign = Object.assign;
  var hasOwnProperty6 = Object.hasOwnProperty;
  var ObservableQuery = (
    /** @class */
    (function(_super) {
      __extends(ObservableQuery2, _super);
      function ObservableQuery2(_a2) {
        var queryManager = _a2.queryManager, queryInfo = _a2.queryInfo, options = _a2.options;
        var _this = this;
        var startedInactive = ObservableQuery2.inactiveOnCreation.getValue();
        _this = _super.call(this, function(observer) {
          _this._getOrCreateQuery();
          try {
            var subObserver = observer._subscription._observer;
            if (subObserver && !subObserver.error) {
              subObserver.error = defaultSubscriptionObserverErrorCallback;
            }
          } catch (_a3) {
          }
          var first = !_this.observers.size;
          _this.observers.add(observer);
          var last = _this.last;
          if (last && last.error) {
            observer.error && observer.error(last.error);
          } else if (last && last.result) {
            observer.next && observer.next(_this.maskResult(last.result));
          }
          if (first) {
            _this.reobserve().catch(function() {
            });
          }
          return function() {
            if (_this.observers.delete(observer) && !_this.observers.size) {
              _this.tearDownQuery();
            }
          };
        }) || this;
        _this.observers = /* @__PURE__ */ new Set();
        _this.subscriptions = /* @__PURE__ */ new Set();
        _this.dirty = false;
        _this._getOrCreateQuery = function() {
          if (startedInactive) {
            queryManager["queries"].set(_this.queryId, queryInfo);
            startedInactive = false;
          }
          return _this.queryManager.getOrCreateQuery(_this.queryId);
        };
        _this.queryInfo = queryInfo;
        _this.queryManager = queryManager;
        _this.waitForOwnResult = skipCacheDataFor(options.fetchPolicy);
        _this.isTornDown = false;
        _this.subscribeToMore = _this.subscribeToMore.bind(_this);
        _this.maskResult = _this.maskResult.bind(_this);
        var _b = queryManager.defaultOptions.watchQuery, _c = _b === void 0 ? {} : _b, _d = _c.fetchPolicy, defaultFetchPolicy = _d === void 0 ? "cache-first" : _d;
        var _e = options.fetchPolicy, fetchPolicy = _e === void 0 ? defaultFetchPolicy : _e, _f = options.initialFetchPolicy, initialFetchPolicy = _f === void 0 ? fetchPolicy === "standby" ? defaultFetchPolicy : fetchPolicy : _f;
        _this.options = __assign(__assign({}, options), {
          // Remember the initial options.fetchPolicy so we can revert back to this
          // policy when variables change. This information can also be specified
          // (or overridden) by providing options.initialFetchPolicy explicitly.
          initialFetchPolicy,
          // This ensures this.options.fetchPolicy always has a string value, in
          // case options.fetchPolicy was not provided.
          fetchPolicy
        });
        _this.queryId = queryInfo.queryId || queryManager.generateQueryId();
        var opDef = getOperationDefinition(_this.query);
        _this.queryName = opDef && opDef.name && opDef.name.value;
        return _this;
      }
      Object.defineProperty(ObservableQuery2.prototype, "query", {
        // The `query` computed property will always reflect the document transformed
        // by the last run query. `this.options.query` will always reflect the raw
        // untransformed query to ensure document transforms with runtime conditionals
        // are run on the original document.
        get: function() {
          return this.lastQuery || this.options.query;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(ObservableQuery2.prototype, "variables", {
        // Computed shorthand for this.options.variables, preserved for
        // backwards compatibility.
        /**
         * An object containing the variables that were provided for the query.
         */
        get: function() {
          return this.options.variables;
        },
        enumerable: false,
        configurable: true
      });
      ObservableQuery2.prototype.result = function() {
        var _this = this;
        return new Promise(function(resolve, reject) {
          var observer = {
            next: function(result2) {
              resolve(result2);
              _this.observers.delete(observer);
              if (!_this.observers.size) {
                _this.queryManager.removeQuery(_this.queryId);
              }
              setTimeout(function() {
                subscription.unsubscribe();
              }, 0);
            },
            error: reject
          };
          var subscription = _this.subscribe(observer);
        });
      };
      ObservableQuery2.prototype.resetDiff = function() {
        this.queryInfo.resetDiff();
      };
      ObservableQuery2.prototype.getCurrentFullResult = function(saveAsLastResult) {
        if (saveAsLastResult === void 0) {
          saveAsLastResult = true;
        }
        var lastResult = this.getLastResult(true);
        var networkStatus = this.queryInfo.networkStatus || lastResult && lastResult.networkStatus || NetworkStatus.ready;
        var result2 = __assign(__assign({}, lastResult), { loading: isNetworkRequestInFlight(networkStatus), networkStatus });
        var _a2 = this.options.fetchPolicy, fetchPolicy = _a2 === void 0 ? "cache-first" : _a2;
        if (
          // These fetch policies should never deliver data from the cache, unless
          // redelivering a previously delivered result.
          skipCacheDataFor(fetchPolicy) || // If this.options.query has @client(always: true) fields, we cannot
          // trust diff.result, since it was read from the cache without running
          // local resolvers (and it's too late to run resolvers now, since we must
          // return a result synchronously).
          this.queryManager.getDocumentInfo(this.query).hasForcedResolvers
        ) {
        } else if (this.waitForOwnResult) {
          this.queryInfo["updateWatch"]();
        } else {
          var diff = this.queryInfo.getDiff();
          if (diff.complete || this.options.returnPartialData) {
            result2.data = diff.result;
          }
          if (equal(result2.data, {})) {
            result2.data = void 0;
          }
          if (diff.complete) {
            delete result2.partial;
            if (diff.complete && result2.networkStatus === NetworkStatus.loading && (fetchPolicy === "cache-first" || fetchPolicy === "cache-only")) {
              result2.networkStatus = NetworkStatus.ready;
              result2.loading = false;
            }
          } else {
            result2.partial = true;
          }
          if (result2.networkStatus === NetworkStatus.ready && (result2.error || result2.errors)) {
            result2.networkStatus = NetworkStatus.error;
          }
          if (globalThis.__DEV__ !== false && !diff.complete && !this.options.partialRefetch && !result2.loading && !result2.data && !result2.error) {
            logMissingFieldErrors(diff.missing);
          }
        }
        if (saveAsLastResult) {
          this.updateLastResult(result2);
        }
        return result2;
      };
      ObservableQuery2.prototype.getCurrentResult = function(saveAsLastResult) {
        if (saveAsLastResult === void 0) {
          saveAsLastResult = true;
        }
        return this.maskResult(this.getCurrentFullResult(saveAsLastResult));
      };
      ObservableQuery2.prototype.isDifferentFromLastResult = function(newResult, variables) {
        if (!this.last) {
          return true;
        }
        var documentInfo = this.queryManager.getDocumentInfo(this.query);
        var dataMasking = this.queryManager.dataMasking;
        var query = dataMasking ? documentInfo.nonReactiveQuery : this.query;
        var resultIsDifferent = dataMasking || documentInfo.hasNonreactiveDirective ? !equalByQuery(query, this.last.result, newResult, this.variables) : !equal(this.last.result, newResult);
        return resultIsDifferent || variables && !equal(this.last.variables, variables);
      };
      ObservableQuery2.prototype.getLast = function(key, variablesMustMatch) {
        var last = this.last;
        if (last && last[key] && (!variablesMustMatch || equal(last.variables, this.variables))) {
          return last[key];
        }
      };
      ObservableQuery2.prototype.getLastResult = function(variablesMustMatch) {
        return this.getLast("result", variablesMustMatch);
      };
      ObservableQuery2.prototype.getLastError = function(variablesMustMatch) {
        return this.getLast("error", variablesMustMatch);
      };
      ObservableQuery2.prototype.resetLastResults = function() {
        delete this.last;
        this.isTornDown = false;
      };
      ObservableQuery2.prototype.resetQueryStoreErrors = function() {
        this.queryManager.resetErrors(this.queryId);
      };
      ObservableQuery2.prototype.refetch = function(variables) {
        var _a2;
        var reobserveOptions = {
          // Always disable polling for refetches.
          pollInterval: 0
        };
        var fetchPolicy = this.options.fetchPolicy;
        if (fetchPolicy === "no-cache") {
          reobserveOptions.fetchPolicy = "no-cache";
        } else {
          reobserveOptions.fetchPolicy = "network-only";
        }
        if (globalThis.__DEV__ !== false && variables && hasOwnProperty6.call(variables, "variables")) {
          var queryDef = getQueryDefinition(this.query);
          var vars = queryDef.variableDefinitions;
          if (!vars || !vars.some(function(v) {
            return v.variable.name.value === "variables";
          })) {
            globalThis.__DEV__ !== false && invariant2.warn(
              21,
              variables,
              ((_a2 = queryDef.name) === null || _a2 === void 0 ? void 0 : _a2.value) || queryDef
            );
          }
        }
        if (variables && !equal(this.options.variables, variables)) {
          reobserveOptions.variables = this.options.variables = __assign(__assign({}, this.options.variables), variables);
        }
        this.queryInfo.resetLastWrite();
        return this.reobserve(reobserveOptions, NetworkStatus.refetch);
      };
      ObservableQuery2.prototype.fetchMore = function(fetchMoreOptions) {
        var _this = this;
        var combinedOptions = __assign(__assign({}, fetchMoreOptions.query ? fetchMoreOptions : __assign(__assign(__assign(__assign({}, this.options), { query: this.options.query }), fetchMoreOptions), { variables: __assign(__assign({}, this.options.variables), fetchMoreOptions.variables) })), {
          // The fetchMore request goes immediately to the network and does
          // not automatically write its result to the cache (hence no-cache
          // instead of network-only), because we allow the caller of
          // fetchMore to provide an updateQuery callback that determines how
          // the data gets written to the cache.
          fetchPolicy: "no-cache"
        });
        combinedOptions.query = this.transformDocument(combinedOptions.query);
        var qid = this.queryManager.generateQueryId();
        this.lastQuery = fetchMoreOptions.query ? this.transformDocument(this.options.query) : combinedOptions.query;
        var queryInfo = this.queryInfo;
        var originalNetworkStatus = queryInfo.networkStatus;
        queryInfo.networkStatus = NetworkStatus.fetchMore;
        if (combinedOptions.notifyOnNetworkStatusChange) {
          this.observe();
        }
        var updatedQuerySet = /* @__PURE__ */ new Set();
        var updateQuery = fetchMoreOptions === null || fetchMoreOptions === void 0 ? void 0 : fetchMoreOptions.updateQuery;
        var isCached = this.options.fetchPolicy !== "no-cache";
        if (!isCached) {
          invariant2(updateQuery, 22);
        }
        return this.queryManager.fetchQuery(qid, combinedOptions, NetworkStatus.fetchMore).then(function(fetchMoreResult) {
          _this.queryManager.removeQuery(qid);
          if (queryInfo.networkStatus === NetworkStatus.fetchMore) {
            queryInfo.networkStatus = originalNetworkStatus;
          }
          if (isCached) {
            _this.queryManager.cache.batch({
              update: function(cache) {
                var updateQuery2 = fetchMoreOptions.updateQuery;
                if (updateQuery2) {
                  cache.updateQuery({
                    query: _this.query,
                    variables: _this.variables,
                    returnPartialData: true,
                    optimistic: false
                  }, function(previous) {
                    return updateQuery2(previous, {
                      fetchMoreResult: fetchMoreResult.data,
                      variables: combinedOptions.variables
                    });
                  });
                } else {
                  cache.writeQuery({
                    query: combinedOptions.query,
                    variables: combinedOptions.variables,
                    data: fetchMoreResult.data
                  });
                }
              },
              onWatchUpdated: function(watch) {
                updatedQuerySet.add(watch.query);
              }
            });
          } else {
            var lastResult = _this.getLast("result");
            var data = updateQuery(lastResult.data, {
              fetchMoreResult: fetchMoreResult.data,
              variables: combinedOptions.variables
            });
            _this.reportResult(__assign(__assign({}, lastResult), { networkStatus: originalNetworkStatus, loading: isNetworkRequestInFlight(originalNetworkStatus), data }), _this.variables);
          }
          return _this.maskResult(fetchMoreResult);
        }).finally(function() {
          if (isCached && !updatedQuerySet.has(_this.query)) {
            _this.reobserveCacheFirst();
          }
        });
      };
      ObservableQuery2.prototype.subscribeToMore = function(options) {
        var _this = this;
        var subscription = this.queryManager.startGraphQLSubscription({
          query: options.document,
          variables: options.variables,
          context: options.context
        }).subscribe({
          next: function(subscriptionData) {
            var updateQuery = options.updateQuery;
            if (updateQuery) {
              _this.updateQuery(function(previous, updateOptions) {
                return updateQuery(previous, __assign({ subscriptionData }, updateOptions));
              });
            }
          },
          error: function(err) {
            if (options.onError) {
              options.onError(err);
              return;
            }
            globalThis.__DEV__ !== false && invariant2.error(23, err);
          }
        });
        this.subscriptions.add(subscription);
        return function() {
          if (_this.subscriptions.delete(subscription)) {
            subscription.unsubscribe();
          }
        };
      };
      ObservableQuery2.prototype.setOptions = function(newOptions) {
        return this.reobserve(newOptions);
      };
      ObservableQuery2.prototype.silentSetOptions = function(newOptions) {
        var mergedOptions = compact(this.options, newOptions || {});
        assign(this.options, mergedOptions);
      };
      ObservableQuery2.prototype.setVariables = function(variables) {
        if (equal(this.variables, variables)) {
          return this.observers.size ? this.result() : Promise.resolve();
        }
        this.options.variables = variables;
        if (!this.observers.size) {
          return Promise.resolve();
        }
        return this.reobserve({
          // Reset options.fetchPolicy to its original value.
          fetchPolicy: this.options.initialFetchPolicy,
          variables
        }, NetworkStatus.setVariables);
      };
      ObservableQuery2.prototype.updateQuery = function(mapFn) {
        var queryManager = this.queryManager;
        var _a2 = queryManager.cache.diff({
          query: this.options.query,
          variables: this.variables,
          returnPartialData: true,
          optimistic: false
        }), result2 = _a2.result, complete = _a2.complete;
        var newResult = mapFn(result2, {
          variables: this.variables,
          complete: !!complete,
          previousData: result2
        });
        if (newResult) {
          queryManager.cache.writeQuery({
            query: this.options.query,
            data: newResult,
            variables: this.variables
          });
          queryManager.broadcastQueries();
        }
      };
      ObservableQuery2.prototype.startPolling = function(pollInterval) {
        this.options.pollInterval = pollInterval;
        this.updatePolling();
      };
      ObservableQuery2.prototype.stopPolling = function() {
        this.options.pollInterval = 0;
        this.updatePolling();
      };
      ObservableQuery2.prototype.applyNextFetchPolicy = function(reason, options) {
        if (options.nextFetchPolicy) {
          var _a2 = options.fetchPolicy, fetchPolicy = _a2 === void 0 ? "cache-first" : _a2, _b = options.initialFetchPolicy, initialFetchPolicy = _b === void 0 ? fetchPolicy : _b;
          if (fetchPolicy === "standby") {
          } else if (typeof options.nextFetchPolicy === "function") {
            options.fetchPolicy = options.nextFetchPolicy(fetchPolicy, {
              reason,
              options,
              observable: this,
              initialFetchPolicy
            });
          } else if (reason === "variables-changed") {
            options.fetchPolicy = initialFetchPolicy;
          } else {
            options.fetchPolicy = options.nextFetchPolicy;
          }
        }
        return options.fetchPolicy;
      };
      ObservableQuery2.prototype.fetch = function(options, newNetworkStatus, query) {
        var queryInfo = this._getOrCreateQuery();
        queryInfo.setObservableQuery(this);
        return this.queryManager["fetchConcastWithInfo"](queryInfo, options, newNetworkStatus, query);
      };
      ObservableQuery2.prototype.updatePolling = function() {
        var _this = this;
        if (this.queryManager.ssrMode) {
          return;
        }
        var _a2 = this, pollingInfo = _a2.pollingInfo, pollInterval = _a2.options.pollInterval;
        if (!pollInterval || !this.hasObservers()) {
          if (pollingInfo) {
            clearTimeout(pollingInfo.timeout);
            delete this.pollingInfo;
          }
          return;
        }
        if (pollingInfo && pollingInfo.interval === pollInterval) {
          return;
        }
        invariant2(pollInterval, 24);
        var info = pollingInfo || (this.pollingInfo = {});
        info.interval = pollInterval;
        var maybeFetch = function() {
          var _a3, _b;
          if (_this.pollingInfo) {
            if (!isNetworkRequestInFlight(_this.queryInfo.networkStatus) && !((_b = (_a3 = _this.options).skipPollAttempt) === null || _b === void 0 ? void 0 : _b.call(_a3))) {
              _this.reobserve({
                // Most fetchPolicy options don't make sense to use in a polling context, as
                // users wouldn't want to be polling the cache directly. However, network-only and
                // no-cache are both useful for when the user wants to control whether or not the
                // polled results are written to the cache.
                fetchPolicy: _this.options.initialFetchPolicy === "no-cache" ? "no-cache" : "network-only"
              }, NetworkStatus.poll).then(poll, poll);
            } else {
              poll();
            }
          }
        };
        var poll = function() {
          var info2 = _this.pollingInfo;
          if (info2) {
            clearTimeout(info2.timeout);
            info2.timeout = setTimeout(maybeFetch, info2.interval);
          }
        };
        poll();
      };
      ObservableQuery2.prototype.updateLastResult = function(newResult, variables) {
        if (variables === void 0) {
          variables = this.variables;
        }
        var error = this.getLastError();
        if (error && this.last && !equal(variables, this.last.variables)) {
          error = void 0;
        }
        return this.last = __assign({ result: this.queryManager.assumeImmutableResults ? newResult : cloneDeep(newResult), variables }, error ? { error } : null);
      };
      ObservableQuery2.prototype.reobserveAsConcast = function(newOptions, newNetworkStatus) {
        var _this = this;
        this.isTornDown = false;
        var useDisposableConcast = (
          // Refetching uses a disposable Concast to allow refetches using different
          // options/variables, without permanently altering the options of the
          // original ObservableQuery.
          newNetworkStatus === NetworkStatus.refetch || // The fetchMore method does not actually call the reobserve method, but,
          // if it did, it would definitely use a disposable Concast.
          newNetworkStatus === NetworkStatus.fetchMore || // Polling uses a disposable Concast so the polling options (which force
          // fetchPolicy to be "network-only" or "no-cache") won't override the original options.
          newNetworkStatus === NetworkStatus.poll
        );
        var oldVariables = this.options.variables;
        var oldFetchPolicy = this.options.fetchPolicy;
        var mergedOptions = compact(this.options, newOptions || {});
        var options = useDisposableConcast ? (
          // Disposable Concast fetches receive a shallow copy of this.options
          // (merged with newOptions), leaving this.options unmodified.
          mergedOptions
        ) : assign(this.options, mergedOptions);
        var query = this.transformDocument(options.query);
        this.lastQuery = query;
        if (!useDisposableConcast) {
          this.updatePolling();
          if (newOptions && newOptions.variables && !equal(newOptions.variables, oldVariables) && // Don't mess with the fetchPolicy if it's currently "standby".
          options.fetchPolicy !== "standby" && // If we're changing the fetchPolicy anyway, don't try to change it here
          // using applyNextFetchPolicy. The explicit options.fetchPolicy wins.
          (options.fetchPolicy === oldFetchPolicy || // A `nextFetchPolicy` function has even higher priority, though,
          // so in that case `applyNextFetchPolicy` must be called.
          typeof options.nextFetchPolicy === "function")) {
            this.applyNextFetchPolicy("variables-changed", options);
            if (newNetworkStatus === void 0) {
              newNetworkStatus = NetworkStatus.setVariables;
            }
          }
        }
        this.waitForOwnResult && (this.waitForOwnResult = skipCacheDataFor(options.fetchPolicy));
        var finishWaitingForOwnResult = function() {
          if (_this.concast === concast) {
            _this.waitForOwnResult = false;
          }
        };
        var variables = options.variables && __assign({}, options.variables);
        var _a2 = this.fetch(options, newNetworkStatus, query), concast = _a2.concast, fromLink = _a2.fromLink;
        var observer = {
          next: function(result2) {
            if (equal(_this.variables, variables)) {
              finishWaitingForOwnResult();
              _this.reportResult(result2, variables);
            }
          },
          error: function(error) {
            if (equal(_this.variables, variables)) {
              if (!isApolloError(error)) {
                error = new ApolloError({ networkError: error });
              }
              finishWaitingForOwnResult();
              _this.reportError(error, variables);
            }
          }
        };
        if (!useDisposableConcast && (fromLink || !this.concast)) {
          if (this.concast && this.observer) {
            this.concast.removeObserver(this.observer);
          }
          this.concast = concast;
          this.observer = observer;
        }
        concast.addObserver(observer);
        return concast;
      };
      ObservableQuery2.prototype.reobserve = function(newOptions, newNetworkStatus) {
        return preventUnhandledRejection(this.reobserveAsConcast(newOptions, newNetworkStatus).promise.then(this.maskResult));
      };
      ObservableQuery2.prototype.resubscribeAfterError = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var last = this.last;
        this.resetLastResults();
        var subscription = this.subscribe.apply(this, args);
        this.last = last;
        return subscription;
      };
      ObservableQuery2.prototype.observe = function() {
        this.reportResult(
          // Passing false is important so that this.getCurrentResult doesn't
          // save the fetchMore result as this.lastResult, causing it to be
          // ignored due to the this.isDifferentFromLastResult check in
          // this.reportResult.
          this.getCurrentFullResult(false),
          this.variables
        );
      };
      ObservableQuery2.prototype.reportResult = function(result2, variables) {
        var lastError = this.getLastError();
        var isDifferent = this.isDifferentFromLastResult(result2, variables);
        if (lastError || !result2.partial || this.options.returnPartialData) {
          this.updateLastResult(result2, variables);
        }
        if (lastError || isDifferent) {
          iterateObserversSafely(this.observers, "next", this.maskResult(result2));
        }
      };
      ObservableQuery2.prototype.reportError = function(error, variables) {
        var errorResult = __assign(__assign({}, this.getLastResult()), { error, errors: error.graphQLErrors, networkStatus: NetworkStatus.error, loading: false });
        this.updateLastResult(errorResult, variables);
        iterateObserversSafely(this.observers, "error", this.last.error = error);
      };
      ObservableQuery2.prototype.hasObservers = function() {
        return this.observers.size > 0;
      };
      ObservableQuery2.prototype.tearDownQuery = function() {
        if (this.isTornDown)
          return;
        if (this.concast && this.observer) {
          this.concast.removeObserver(this.observer);
          delete this.concast;
          delete this.observer;
        }
        this.stopPolling();
        this.subscriptions.forEach(function(sub) {
          return sub.unsubscribe();
        });
        this.subscriptions.clear();
        this.queryManager.stopQuery(this.queryId);
        this.observers.clear();
        this.isTornDown = true;
      };
      ObservableQuery2.prototype.transformDocument = function(document2) {
        return this.queryManager.transform(document2);
      };
      ObservableQuery2.prototype.maskResult = function(result2) {
        return result2 && "data" in result2 ? __assign(__assign({}, result2), { data: this.queryManager.maskOperation({
          document: this.query,
          data: result2.data,
          fetchPolicy: this.options.fetchPolicy,
          id: this.queryId
        }) }) : result2;
      };
      ObservableQuery2.prototype.resetNotifications = function() {
        this.cancelNotifyTimeout();
        this.dirty = false;
      };
      ObservableQuery2.prototype.cancelNotifyTimeout = function() {
        if (this.notifyTimeout) {
          clearTimeout(this.notifyTimeout);
          this.notifyTimeout = void 0;
        }
      };
      ObservableQuery2.prototype.scheduleNotify = function() {
        var _this = this;
        if (this.dirty)
          return;
        this.dirty = true;
        if (!this.notifyTimeout) {
          this.notifyTimeout = setTimeout(function() {
            return _this.notify();
          }, 0);
        }
      };
      ObservableQuery2.prototype.notify = function() {
        this.cancelNotifyTimeout();
        if (this.dirty) {
          if (this.options.fetchPolicy == "cache-only" || this.options.fetchPolicy == "cache-and-network" || !isNetworkRequestInFlight(this.queryInfo.networkStatus)) {
            var diff = this.queryInfo.getDiff();
            if (diff.fromOptimisticTransaction) {
              this.observe();
            } else {
              this.reobserveCacheFirst();
            }
          }
        }
        this.dirty = false;
      };
      ObservableQuery2.prototype.reobserveCacheFirst = function() {
        var _a2 = this.options, fetchPolicy = _a2.fetchPolicy, nextFetchPolicy = _a2.nextFetchPolicy;
        if (fetchPolicy === "cache-and-network" || fetchPolicy === "network-only") {
          return this.reobserve({
            fetchPolicy: "cache-first",
            // Use a temporary nextFetchPolicy function that replaces itself with the
            // previous nextFetchPolicy value and returns the original fetchPolicy.
            nextFetchPolicy: function(currentFetchPolicy, context) {
              this.nextFetchPolicy = nextFetchPolicy;
              if (typeof this.nextFetchPolicy === "function") {
                return this.nextFetchPolicy(currentFetchPolicy, context);
              }
              return fetchPolicy;
            }
          });
        }
        return this.reobserve();
      };
      ObservableQuery2.inactiveOnCreation = new Slot();
      return ObservableQuery2;
    })(Observable)
  );
  fixObservableSubclass(ObservableQuery);
  function defaultSubscriptionObserverErrorCallback(error) {
    globalThis.__DEV__ !== false && invariant2.error(25, error.message, error.stack);
  }
  function logMissingFieldErrors(missing) {
    if (globalThis.__DEV__ !== false && missing) {
      globalThis.__DEV__ !== false && invariant2.debug(26, missing);
    }
  }
  function skipCacheDataFor(fetchPolicy) {
    return fetchPolicy === "network-only" || fetchPolicy === "no-cache" || fetchPolicy === "standby";
  }

  // node_modules/@apollo/client/core/QueryInfo.js
  var destructiveMethodCounts = new (canUseWeakMap ? WeakMap : Map)();
  function wrapDestructiveCacheMethod(cache, methodName) {
    var original = cache[methodName];
    if (typeof original === "function") {
      cache[methodName] = function() {
        destructiveMethodCounts.set(
          cache,
          // The %1e15 allows the count to wrap around to 0 safely every
          // quadrillion evictions, so there's no risk of overflow. To be
          // clear, this is more of a pedantic principle than something
          // that matters in any conceivable practical scenario.
          (destructiveMethodCounts.get(cache) + 1) % 1e15
        );
        return original.apply(this, arguments);
      };
    }
  }
  var QueryInfo = (
    /** @class */
    (function() {
      function QueryInfo2(queryManager, queryId) {
        if (queryId === void 0) {
          queryId = queryManager.generateQueryId();
        }
        this.queryId = queryId;
        this.document = null;
        this.lastRequestId = 1;
        this.stopped = false;
        this.observableQuery = null;
        var cache = this.cache = queryManager.cache;
        if (!destructiveMethodCounts.has(cache)) {
          destructiveMethodCounts.set(cache, 0);
          wrapDestructiveCacheMethod(cache, "evict");
          wrapDestructiveCacheMethod(cache, "modify");
          wrapDestructiveCacheMethod(cache, "reset");
        }
      }
      QueryInfo2.prototype.init = function(query) {
        var networkStatus = query.networkStatus || NetworkStatus.loading;
        if (this.variables && this.networkStatus !== NetworkStatus.loading && !equal(this.variables, query.variables)) {
          networkStatus = NetworkStatus.setVariables;
        }
        if (!equal(query.variables, this.variables)) {
          this.lastDiff = void 0;
          this.cancel();
        }
        Object.assign(this, {
          document: query.document,
          variables: query.variables,
          networkError: null,
          graphQLErrors: this.graphQLErrors || [],
          networkStatus
        });
        if (query.observableQuery) {
          this.setObservableQuery(query.observableQuery);
        }
        if (query.lastRequestId) {
          this.lastRequestId = query.lastRequestId;
        }
        return this;
      };
      QueryInfo2.prototype.resetDiff = function() {
        this.lastDiff = void 0;
      };
      QueryInfo2.prototype.getDiff = function() {
        var options = this.getDiffOptions();
        if (this.lastDiff && equal(options, this.lastDiff.options)) {
          return this.lastDiff.diff;
        }
        this.updateWatch(this.variables);
        var oq = this.observableQuery;
        if (oq && oq.options.fetchPolicy === "no-cache") {
          return { complete: false };
        }
        var diff = this.cache.diff(options);
        this.updateLastDiff(diff, options);
        return diff;
      };
      QueryInfo2.prototype.updateLastDiff = function(diff, options) {
        this.lastDiff = diff ? {
          diff,
          options: options || this.getDiffOptions()
        } : void 0;
      };
      QueryInfo2.prototype.getDiffOptions = function(variables) {
        var _a2;
        if (variables === void 0) {
          variables = this.variables;
        }
        return {
          query: this.document,
          variables,
          returnPartialData: true,
          optimistic: true,
          canonizeResults: (_a2 = this.observableQuery) === null || _a2 === void 0 ? void 0 : _a2.options.canonizeResults
        };
      };
      QueryInfo2.prototype.setDiff = function(diff) {
        var _a2, _b;
        var oldDiff = this.lastDiff && this.lastDiff.diff;
        if (diff && !diff.complete && ((_a2 = this.observableQuery) === null || _a2 === void 0 ? void 0 : _a2.getLastError())) {
          return;
        }
        this.updateLastDiff(diff);
        if (!equal(oldDiff && oldDiff.result, diff && diff.result)) {
          (_b = this.observableQuery) === null || _b === void 0 ? void 0 : _b["scheduleNotify"]();
        }
      };
      QueryInfo2.prototype.setObservableQuery = function(oq) {
        if (oq === this.observableQuery)
          return;
        this.observableQuery = oq;
        if (oq) {
          oq["queryInfo"] = this;
        }
      };
      QueryInfo2.prototype.stop = function() {
        var _a2;
        if (!this.stopped) {
          this.stopped = true;
          (_a2 = this.observableQuery) === null || _a2 === void 0 ? void 0 : _a2["resetNotifications"]();
          this.cancel();
          var oq = this.observableQuery;
          if (oq)
            oq.stopPolling();
        }
      };
      QueryInfo2.prototype.cancel = function() {
        var _a2;
        (_a2 = this.cancelWatch) === null || _a2 === void 0 ? void 0 : _a2.call(this);
        this.cancelWatch = void 0;
      };
      QueryInfo2.prototype.updateWatch = function(variables) {
        var _this = this;
        if (variables === void 0) {
          variables = this.variables;
        }
        var oq = this.observableQuery;
        if (oq && oq.options.fetchPolicy === "no-cache") {
          return;
        }
        var watchOptions = __assign(__assign({}, this.getDiffOptions(variables)), { watcher: this, callback: function(diff) {
          return _this.setDiff(diff);
        } });
        if (!this.lastWatch || !equal(watchOptions, this.lastWatch)) {
          this.cancel();
          this.cancelWatch = this.cache.watch(this.lastWatch = watchOptions);
        }
      };
      QueryInfo2.prototype.resetLastWrite = function() {
        this.lastWrite = void 0;
      };
      QueryInfo2.prototype.shouldWrite = function(result2, variables) {
        var lastWrite = this.lastWrite;
        return !(lastWrite && // If cache.evict has been called since the last time we wrote this
        // data into the cache, there's a chance writing this result into
        // the cache will repair what was evicted.
        lastWrite.dmCount === destructiveMethodCounts.get(this.cache) && equal(variables, lastWrite.variables) && equal(result2.data, lastWrite.result.data));
      };
      QueryInfo2.prototype.markResult = function(result2, document2, options, cacheWriteBehavior) {
        var _this = this;
        var _a2;
        var merger = new DeepMerger();
        var graphQLErrors = isNonEmptyArray(result2.errors) ? result2.errors.slice(0) : [];
        (_a2 = this.observableQuery) === null || _a2 === void 0 ? void 0 : _a2["resetNotifications"]();
        if ("incremental" in result2 && isNonEmptyArray(result2.incremental)) {
          var mergedData = mergeIncrementalData(this.getDiff().result, result2);
          result2.data = mergedData;
        } else if ("hasNext" in result2 && result2.hasNext) {
          var diff = this.getDiff();
          result2.data = merger.merge(diff.result, result2.data);
        }
        this.graphQLErrors = graphQLErrors;
        if (options.fetchPolicy === "no-cache") {
          this.updateLastDiff({ result: result2.data, complete: true }, this.getDiffOptions(options.variables));
        } else if (cacheWriteBehavior !== 0) {
          if (shouldWriteResult(result2, options.errorPolicy)) {
            this.cache.performTransaction(function(cache) {
              if (_this.shouldWrite(result2, options.variables)) {
                cache.writeQuery({
                  query: document2,
                  data: result2.data,
                  variables: options.variables,
                  overwrite: cacheWriteBehavior === 1
                });
                _this.lastWrite = {
                  result: result2,
                  variables: options.variables,
                  dmCount: destructiveMethodCounts.get(_this.cache)
                };
              } else {
                if (_this.lastDiff && _this.lastDiff.diff.complete) {
                  result2.data = _this.lastDiff.diff.result;
                  return;
                }
              }
              var diffOptions = _this.getDiffOptions(options.variables);
              var diff2 = cache.diff(diffOptions);
              if (!_this.stopped && equal(_this.variables, options.variables)) {
                _this.updateWatch(options.variables);
              }
              _this.updateLastDiff(diff2, diffOptions);
              if (diff2.complete) {
                result2.data = diff2.result;
              }
            });
          } else {
            this.lastWrite = void 0;
          }
        }
      };
      QueryInfo2.prototype.markReady = function() {
        this.networkError = null;
        return this.networkStatus = NetworkStatus.ready;
      };
      QueryInfo2.prototype.markError = function(error) {
        var _a2;
        this.networkStatus = NetworkStatus.error;
        this.lastWrite = void 0;
        (_a2 = this.observableQuery) === null || _a2 === void 0 ? void 0 : _a2["resetNotifications"]();
        if (error.graphQLErrors) {
          this.graphQLErrors = error.graphQLErrors;
        }
        if (error.networkError) {
          this.networkError = error.networkError;
        }
        return error;
      };
      return QueryInfo2;
    })()
  );
  function shouldWriteResult(result2, errorPolicy) {
    if (errorPolicy === void 0) {
      errorPolicy = "none";
    }
    var ignoreErrors = errorPolicy === "ignore" || errorPolicy === "all";
    var writeWithErrors = !graphQLResultHasError(result2);
    if (!writeWithErrors && ignoreErrors && result2.data) {
      writeWithErrors = true;
    }
    return writeWithErrors;
  }

  // node_modules/@apollo/client/core/QueryManager.js
  var hasOwnProperty7 = Object.prototype.hasOwnProperty;
  var IGNORE = /* @__PURE__ */ Object.create(null);
  var QueryManager = (
    /** @class */
    (function() {
      function QueryManager2(options) {
        var _this = this;
        this.clientAwareness = {};
        this.queries = /* @__PURE__ */ new Map();
        this.fetchCancelFns = /* @__PURE__ */ new Map();
        this.transformCache = new AutoCleanedWeakCache(
          cacheSizes["queryManager.getDocumentInfo"] || 2e3
          /* defaultCacheSizes["queryManager.getDocumentInfo"] */
        );
        this.queryIdCounter = 1;
        this.requestIdCounter = 1;
        this.mutationIdCounter = 1;
        this.inFlightLinkObservables = new Trie(false);
        this.noCacheWarningsByQueryId = /* @__PURE__ */ new Set();
        var defaultDocumentTransform = new DocumentTransform(
          function(document2) {
            return _this.cache.transformDocument(document2);
          },
          // Allow the apollo cache to manage its own transform caches
          { cache: false }
        );
        this.cache = options.cache;
        this.link = options.link;
        this.defaultOptions = options.defaultOptions;
        this.queryDeduplication = options.queryDeduplication;
        this.clientAwareness = options.clientAwareness;
        this.localState = options.localState;
        this.ssrMode = options.ssrMode;
        this.assumeImmutableResults = options.assumeImmutableResults;
        this.dataMasking = options.dataMasking;
        var documentTransform = options.documentTransform;
        this.documentTransform = documentTransform ? defaultDocumentTransform.concat(documentTransform).concat(defaultDocumentTransform) : defaultDocumentTransform;
        this.defaultContext = options.defaultContext || /* @__PURE__ */ Object.create(null);
        if (this.onBroadcast = options.onBroadcast) {
          this.mutationStore = /* @__PURE__ */ Object.create(null);
        }
      }
      QueryManager2.prototype.stop = function() {
        var _this = this;
        this.queries.forEach(function(_info, queryId) {
          _this.stopQueryNoBroadcast(queryId);
        });
        this.cancelPendingFetches(newInvariantError(27));
      };
      QueryManager2.prototype.cancelPendingFetches = function(error) {
        this.fetchCancelFns.forEach(function(cancel) {
          return cancel(error);
        });
        this.fetchCancelFns.clear();
      };
      QueryManager2.prototype.mutate = function(_a2) {
        return __awaiter(this, arguments, void 0, function(_b) {
          var mutationId, hasClientExports2, mutationStoreValue, isOptimistic, self2;
          var _c, _d;
          var mutation = _b.mutation, variables = _b.variables, optimisticResponse = _b.optimisticResponse, updateQueries = _b.updateQueries, _e = _b.refetchQueries, refetchQueries = _e === void 0 ? [] : _e, _f = _b.awaitRefetchQueries, awaitRefetchQueries = _f === void 0 ? false : _f, updateWithProxyFn = _b.update, onQueryUpdated = _b.onQueryUpdated, _g = _b.fetchPolicy, fetchPolicy = _g === void 0 ? ((_c = this.defaultOptions.mutate) === null || _c === void 0 ? void 0 : _c.fetchPolicy) || "network-only" : _g, _h = _b.errorPolicy, errorPolicy = _h === void 0 ? ((_d = this.defaultOptions.mutate) === null || _d === void 0 ? void 0 : _d.errorPolicy) || "none" : _h, keepRootFields = _b.keepRootFields, context = _b.context;
          return __generator(this, function(_j) {
            switch (_j.label) {
              case 0:
                invariant2(mutation, 28);
                invariant2(fetchPolicy === "network-only" || fetchPolicy === "no-cache", 29);
                mutationId = this.generateMutationId();
                mutation = this.cache.transformForLink(this.transform(mutation));
                hasClientExports2 = this.getDocumentInfo(mutation).hasClientExports;
                variables = this.getVariables(mutation, variables);
                if (!hasClientExports2) return [3, 2];
                return [4, this.localState.addExportedVariables(mutation, variables, context)];
              case 1:
                variables = _j.sent();
                _j.label = 2;
              case 2:
                mutationStoreValue = this.mutationStore && (this.mutationStore[mutationId] = {
                  mutation,
                  variables,
                  loading: true,
                  error: null
                });
                isOptimistic = optimisticResponse && this.markMutationOptimistic(optimisticResponse, {
                  mutationId,
                  document: mutation,
                  variables,
                  fetchPolicy,
                  errorPolicy,
                  context,
                  updateQueries,
                  update: updateWithProxyFn,
                  keepRootFields
                });
                this.broadcastQueries();
                self2 = this;
                return [2, new Promise(function(resolve, reject) {
                  return asyncMap(self2.getObservableFromLink(mutation, __assign(__assign({}, context), { optimisticResponse: isOptimistic ? optimisticResponse : void 0 }), variables, {}, false), function(result2) {
                    if (graphQLResultHasError(result2) && errorPolicy === "none") {
                      throw new ApolloError({
                        graphQLErrors: getGraphQLErrorsFromResult(result2)
                      });
                    }
                    if (mutationStoreValue) {
                      mutationStoreValue.loading = false;
                      mutationStoreValue.error = null;
                    }
                    var storeResult = __assign({}, result2);
                    if (typeof refetchQueries === "function") {
                      refetchQueries = refetchQueries(storeResult);
                    }
                    if (errorPolicy === "ignore" && graphQLResultHasError(storeResult)) {
                      delete storeResult.errors;
                    }
                    return self2.markMutationResult({
                      mutationId,
                      result: storeResult,
                      document: mutation,
                      variables,
                      fetchPolicy,
                      errorPolicy,
                      context,
                      update: updateWithProxyFn,
                      updateQueries,
                      awaitRefetchQueries,
                      refetchQueries,
                      removeOptimistic: isOptimistic ? mutationId : void 0,
                      onQueryUpdated,
                      keepRootFields
                    });
                  }).subscribe({
                    next: function(storeResult) {
                      self2.broadcastQueries();
                      if (!("hasNext" in storeResult) || storeResult.hasNext === false) {
                        resolve(__assign(__assign({}, storeResult), { data: self2.maskOperation({
                          document: mutation,
                          data: storeResult.data,
                          fetchPolicy,
                          id: mutationId
                        }) }));
                      }
                    },
                    error: function(err) {
                      if (mutationStoreValue) {
                        mutationStoreValue.loading = false;
                        mutationStoreValue.error = err;
                      }
                      if (isOptimistic) {
                        self2.cache.removeOptimistic(mutationId);
                      }
                      self2.broadcastQueries();
                      reject(err instanceof ApolloError ? err : new ApolloError({
                        networkError: err
                      }));
                    }
                  });
                })];
            }
          });
        });
      };
      QueryManager2.prototype.markMutationResult = function(mutation, cache) {
        var _this = this;
        if (cache === void 0) {
          cache = this.cache;
        }
        var result2 = mutation.result;
        var cacheWrites = [];
        var skipCache = mutation.fetchPolicy === "no-cache";
        if (!skipCache && shouldWriteResult(result2, mutation.errorPolicy)) {
          if (!isExecutionPatchIncrementalResult(result2)) {
            cacheWrites.push({
              result: result2.data,
              dataId: "ROOT_MUTATION",
              query: mutation.document,
              variables: mutation.variables
            });
          }
          if (isExecutionPatchIncrementalResult(result2) && isNonEmptyArray(result2.incremental)) {
            var diff = cache.diff({
              id: "ROOT_MUTATION",
              // The cache complains if passed a mutation where it expects a
              // query, so we transform mutations and subscriptions to queries
              // (only once, thanks to this.transformCache).
              query: this.getDocumentInfo(mutation.document).asQuery,
              variables: mutation.variables,
              optimistic: false,
              returnPartialData: true
            });
            var mergedData = void 0;
            if (diff.result) {
              mergedData = mergeIncrementalData(diff.result, result2);
            }
            if (typeof mergedData !== "undefined") {
              result2.data = mergedData;
              cacheWrites.push({
                result: mergedData,
                dataId: "ROOT_MUTATION",
                query: mutation.document,
                variables: mutation.variables
              });
            }
          }
          var updateQueries_1 = mutation.updateQueries;
          if (updateQueries_1) {
            this.queries.forEach(function(_a2, queryId) {
              var observableQuery = _a2.observableQuery;
              var queryName = observableQuery && observableQuery.queryName;
              if (!queryName || !hasOwnProperty7.call(updateQueries_1, queryName)) {
                return;
              }
              var updater = updateQueries_1[queryName];
              var _b = _this.queries.get(queryId), document2 = _b.document, variables = _b.variables;
              var _c = cache.diff({
                query: document2,
                variables,
                returnPartialData: true,
                optimistic: false
              }), currentQueryResult = _c.result, complete = _c.complete;
              if (complete && currentQueryResult) {
                var nextQueryResult = updater(currentQueryResult, {
                  mutationResult: result2,
                  queryName: document2 && getOperationName(document2) || void 0,
                  queryVariables: variables
                });
                if (nextQueryResult) {
                  cacheWrites.push({
                    result: nextQueryResult,
                    dataId: "ROOT_QUERY",
                    query: document2,
                    variables
                  });
                }
              }
            });
          }
        }
        if (cacheWrites.length > 0 || (mutation.refetchQueries || "").length > 0 || mutation.update || mutation.onQueryUpdated || mutation.removeOptimistic) {
          var results_1 = [];
          this.refetchQueries({
            updateCache: function(cache2) {
              if (!skipCache) {
                cacheWrites.forEach(function(write) {
                  return cache2.write(write);
                });
              }
              var update = mutation.update;
              var isFinalResult = !isExecutionPatchResult(result2) || isExecutionPatchIncrementalResult(result2) && !result2.hasNext;
              if (update) {
                if (!skipCache) {
                  var diff2 = cache2.diff({
                    id: "ROOT_MUTATION",
                    // The cache complains if passed a mutation where it expects a
                    // query, so we transform mutations and subscriptions to queries
                    // (only once, thanks to this.transformCache).
                    query: _this.getDocumentInfo(mutation.document).asQuery,
                    variables: mutation.variables,
                    optimistic: false,
                    returnPartialData: true
                  });
                  if (diff2.complete) {
                    result2 = __assign(__assign({}, result2), { data: diff2.result });
                    if ("incremental" in result2) {
                      delete result2.incremental;
                    }
                    if ("hasNext" in result2) {
                      delete result2.hasNext;
                    }
                  }
                }
                if (isFinalResult) {
                  update(cache2, result2, {
                    context: mutation.context,
                    variables: mutation.variables
                  });
                }
              }
              if (!skipCache && !mutation.keepRootFields && isFinalResult) {
                cache2.modify({
                  id: "ROOT_MUTATION",
                  fields: function(value, _a2) {
                    var fieldName = _a2.fieldName, DELETE2 = _a2.DELETE;
                    return fieldName === "__typename" ? value : DELETE2;
                  }
                });
              }
            },
            include: mutation.refetchQueries,
            // Write the final mutation.result to the root layer of the cache.
            optimistic: false,
            // Remove the corresponding optimistic layer at the same time as we
            // write the final non-optimistic result.
            removeOptimistic: mutation.removeOptimistic,
            // Let the caller of client.mutate optionally determine the refetching
            // behavior for watched queries after the mutation.update function runs.
            // If no onQueryUpdated function was provided for this mutation, pass
            // null instead of undefined to disable the default refetching behavior.
            onQueryUpdated: mutation.onQueryUpdated || null
          }).forEach(function(result3) {
            return results_1.push(result3);
          });
          if (mutation.awaitRefetchQueries || mutation.onQueryUpdated) {
            return Promise.all(results_1).then(function() {
              return result2;
            });
          }
        }
        return Promise.resolve(result2);
      };
      QueryManager2.prototype.markMutationOptimistic = function(optimisticResponse, mutation) {
        var _this = this;
        var data = typeof optimisticResponse === "function" ? optimisticResponse(mutation.variables, { IGNORE }) : optimisticResponse;
        if (data === IGNORE) {
          return false;
        }
        this.cache.recordOptimisticTransaction(function(cache) {
          try {
            _this.markMutationResult(__assign(__assign({}, mutation), { result: { data } }), cache);
          } catch (error) {
            globalThis.__DEV__ !== false && invariant2.error(error);
          }
        }, mutation.mutationId);
        return true;
      };
      QueryManager2.prototype.fetchQuery = function(queryId, options, networkStatus) {
        return this.fetchConcastWithInfo(this.getOrCreateQuery(queryId), options, networkStatus).concast.promise;
      };
      QueryManager2.prototype.getQueryStore = function() {
        var store = /* @__PURE__ */ Object.create(null);
        this.queries.forEach(function(info, queryId) {
          store[queryId] = {
            variables: info.variables,
            networkStatus: info.networkStatus,
            networkError: info.networkError,
            graphQLErrors: info.graphQLErrors
          };
        });
        return store;
      };
      QueryManager2.prototype.resetErrors = function(queryId) {
        var queryInfo = this.queries.get(queryId);
        if (queryInfo) {
          queryInfo.networkError = void 0;
          queryInfo.graphQLErrors = [];
        }
      };
      QueryManager2.prototype.transform = function(document2) {
        return this.documentTransform.transformDocument(document2);
      };
      QueryManager2.prototype.getDocumentInfo = function(document2) {
        var transformCache = this.transformCache;
        if (!transformCache.has(document2)) {
          var cacheEntry = {
            // TODO These three calls (hasClientExports, shouldForceResolvers, and
            // usesNonreactiveDirective) are performing independent full traversals
            // of the transformed document. We should consider merging these
            // traversals into a single pass in the future, though the work is
            // cached after the first time.
            hasClientExports: hasClientExports(document2),
            hasForcedResolvers: this.localState.shouldForceResolvers(document2),
            hasNonreactiveDirective: hasDirectives(["nonreactive"], document2),
            nonReactiveQuery: addNonReactiveToNamedFragments(document2),
            clientQuery: this.localState.clientQuery(document2),
            serverQuery: removeDirectivesFromDocument([
              { name: "client", remove: true },
              { name: "connection" },
              { name: "nonreactive" },
              { name: "unmask" }
            ], document2),
            defaultVars: getDefaultValues(getOperationDefinition(document2)),
            // Transform any mutation or subscription operations to query operations
            // so we can read/write them from/to the cache.
            asQuery: __assign(__assign({}, document2), { definitions: document2.definitions.map(function(def) {
              if (def.kind === "OperationDefinition" && def.operation !== "query") {
                return __assign(__assign({}, def), { operation: "query" });
              }
              return def;
            }) })
          };
          transformCache.set(document2, cacheEntry);
        }
        return transformCache.get(document2);
      };
      QueryManager2.prototype.getVariables = function(document2, variables) {
        return __assign(__assign({}, this.getDocumentInfo(document2).defaultVars), variables);
      };
      QueryManager2.prototype.watchQuery = function(options) {
        var query = this.transform(options.query);
        options = __assign(__assign({}, options), { variables: this.getVariables(query, options.variables) });
        if (typeof options.notifyOnNetworkStatusChange === "undefined") {
          options.notifyOnNetworkStatusChange = false;
        }
        var queryInfo = new QueryInfo(this);
        var observable = new ObservableQuery({
          queryManager: this,
          queryInfo,
          options
        });
        observable["lastQuery"] = query;
        if (!ObservableQuery["inactiveOnCreation"].getValue()) {
          this.queries.set(observable.queryId, queryInfo);
        }
        queryInfo.init({
          document: query,
          observableQuery: observable,
          variables: observable.variables
        });
        return observable;
      };
      QueryManager2.prototype.query = function(options, queryId) {
        var _this = this;
        if (queryId === void 0) {
          queryId = this.generateQueryId();
        }
        invariant2(options.query, 30);
        invariant2(options.query.kind === "Document", 31);
        invariant2(!options.returnPartialData, 32);
        invariant2(!options.pollInterval, 33);
        var query = this.transform(options.query);
        return this.fetchQuery(queryId, __assign(__assign({}, options), { query })).then(function(result2) {
          return result2 && __assign(__assign({}, result2), { data: _this.maskOperation({
            document: query,
            data: result2.data,
            fetchPolicy: options.fetchPolicy,
            id: queryId
          }) });
        }).finally(function() {
          return _this.stopQuery(queryId);
        });
      };
      QueryManager2.prototype.generateQueryId = function() {
        return String(this.queryIdCounter++);
      };
      QueryManager2.prototype.generateRequestId = function() {
        return this.requestIdCounter++;
      };
      QueryManager2.prototype.generateMutationId = function() {
        return String(this.mutationIdCounter++);
      };
      QueryManager2.prototype.stopQueryInStore = function(queryId) {
        this.stopQueryInStoreNoBroadcast(queryId);
        this.broadcastQueries();
      };
      QueryManager2.prototype.stopQueryInStoreNoBroadcast = function(queryId) {
        var queryInfo = this.queries.get(queryId);
        if (queryInfo)
          queryInfo.stop();
      };
      QueryManager2.prototype.clearStore = function(options) {
        if (options === void 0) {
          options = {
            discardWatches: true
          };
        }
        this.cancelPendingFetches(newInvariantError(34));
        this.queries.forEach(function(queryInfo) {
          if (queryInfo.observableQuery) {
            queryInfo.networkStatus = NetworkStatus.loading;
          } else {
            queryInfo.stop();
          }
        });
        if (this.mutationStore) {
          this.mutationStore = /* @__PURE__ */ Object.create(null);
        }
        return this.cache.reset(options);
      };
      QueryManager2.prototype.getObservableQueries = function(include) {
        var _this = this;
        if (include === void 0) {
          include = "active";
        }
        var queries = /* @__PURE__ */ new Map();
        var queryNames = /* @__PURE__ */ new Map();
        var queryNamesAndQueryStrings = /* @__PURE__ */ new Map();
        var legacyQueryOptions = /* @__PURE__ */ new Set();
        if (Array.isArray(include)) {
          include.forEach(function(desc) {
            if (typeof desc === "string") {
              queryNames.set(desc, desc);
              queryNamesAndQueryStrings.set(desc, false);
            } else if (isDocumentNode(desc)) {
              var queryString = print2(_this.transform(desc));
              queryNames.set(queryString, getOperationName(desc));
              queryNamesAndQueryStrings.set(queryString, false);
            } else if (isNonNullObject(desc) && desc.query) {
              legacyQueryOptions.add(desc);
            }
          });
        }
        this.queries.forEach(function(_a2, queryId) {
          var oq = _a2.observableQuery, document2 = _a2.document;
          if (oq) {
            if (include === "all") {
              queries.set(queryId, oq);
              return;
            }
            var queryName = oq.queryName, fetchPolicy = oq.options.fetchPolicy;
            if (fetchPolicy === "standby" || include === "active" && !oq.hasObservers()) {
              return;
            }
            if (include === "active" || queryName && queryNamesAndQueryStrings.has(queryName) || document2 && queryNamesAndQueryStrings.has(print2(document2))) {
              queries.set(queryId, oq);
              if (queryName)
                queryNamesAndQueryStrings.set(queryName, true);
              if (document2)
                queryNamesAndQueryStrings.set(print2(document2), true);
            }
          }
        });
        if (legacyQueryOptions.size) {
          legacyQueryOptions.forEach(function(options) {
            var queryId = makeUniqueId("legacyOneTimeQuery");
            var queryInfo = _this.getOrCreateQuery(queryId).init({
              document: options.query,
              variables: options.variables
            });
            var oq = new ObservableQuery({
              queryManager: _this,
              queryInfo,
              options: __assign(__assign({}, options), { fetchPolicy: "network-only" })
            });
            invariant2(oq.queryId === queryId);
            queryInfo.setObservableQuery(oq);
            queries.set(queryId, oq);
          });
        }
        if (globalThis.__DEV__ !== false && queryNamesAndQueryStrings.size) {
          queryNamesAndQueryStrings.forEach(function(included, nameOrQueryString) {
            if (!included) {
              var queryName = queryNames.get(nameOrQueryString);
              if (queryName) {
                globalThis.__DEV__ !== false && invariant2.warn(35, queryName);
              } else {
                globalThis.__DEV__ !== false && invariant2.warn(36);
              }
            }
          });
        }
        return queries;
      };
      QueryManager2.prototype.reFetchObservableQueries = function(includeStandby) {
        var _this = this;
        if (includeStandby === void 0) {
          includeStandby = false;
        }
        var observableQueryPromises = [];
        this.getObservableQueries(includeStandby ? "all" : "active").forEach(function(observableQuery, queryId) {
          var fetchPolicy = observableQuery.options.fetchPolicy;
          observableQuery.resetLastResults();
          if (includeStandby || fetchPolicy !== "standby" && fetchPolicy !== "cache-only") {
            observableQueryPromises.push(observableQuery.refetch());
          }
          (_this.queries.get(queryId) || observableQuery["queryInfo"]).setDiff(null);
        });
        this.broadcastQueries();
        return Promise.all(observableQueryPromises);
      };
      QueryManager2.prototype.startGraphQLSubscription = function(options) {
        var _this = this;
        var query = options.query, variables = options.variables;
        var fetchPolicy = options.fetchPolicy, _a2 = options.errorPolicy, errorPolicy = _a2 === void 0 ? "none" : _a2, _b = options.context, context = _b === void 0 ? {} : _b, _c = options.extensions, extensions = _c === void 0 ? {} : _c;
        query = this.transform(query);
        variables = this.getVariables(query, variables);
        var makeObservable = function(variables2) {
          return _this.getObservableFromLink(query, context, variables2, extensions).map(function(result2) {
            if (fetchPolicy !== "no-cache") {
              if (shouldWriteResult(result2, errorPolicy)) {
                _this.cache.write({
                  query,
                  result: result2.data,
                  dataId: "ROOT_SUBSCRIPTION",
                  variables: variables2
                });
              }
              _this.broadcastQueries();
            }
            var hasErrors = graphQLResultHasError(result2);
            var hasProtocolErrors = graphQLResultHasProtocolErrors(result2);
            if (hasErrors || hasProtocolErrors) {
              var errors = {};
              if (hasErrors) {
                errors.graphQLErrors = result2.errors;
              }
              if (hasProtocolErrors) {
                errors.protocolErrors = result2.extensions[PROTOCOL_ERRORS_SYMBOL];
              }
              if (errorPolicy === "none" || hasProtocolErrors) {
                throw new ApolloError(errors);
              }
            }
            if (errorPolicy === "ignore") {
              delete result2.errors;
            }
            return result2;
          });
        };
        if (this.getDocumentInfo(query).hasClientExports) {
          var observablePromise_1 = this.localState.addExportedVariables(query, variables, context).then(makeObservable);
          return new Observable(function(observer) {
            var sub = null;
            observablePromise_1.then(function(observable) {
              return sub = observable.subscribe(observer);
            }, observer.error);
            return function() {
              return sub && sub.unsubscribe();
            };
          });
        }
        return makeObservable(variables);
      };
      QueryManager2.prototype.stopQuery = function(queryId) {
        this.stopQueryNoBroadcast(queryId);
        this.broadcastQueries();
      };
      QueryManager2.prototype.stopQueryNoBroadcast = function(queryId) {
        this.stopQueryInStoreNoBroadcast(queryId);
        this.removeQuery(queryId);
      };
      QueryManager2.prototype.removeQuery = function(queryId) {
        var _a2;
        this.fetchCancelFns.delete(queryId);
        if (this.queries.has(queryId)) {
          (_a2 = this.queries.get(queryId)) === null || _a2 === void 0 ? void 0 : _a2.stop();
          this.queries.delete(queryId);
        }
      };
      QueryManager2.prototype.broadcastQueries = function() {
        if (this.onBroadcast)
          this.onBroadcast();
        this.queries.forEach(function(info) {
          var _a2;
          return (_a2 = info.observableQuery) === null || _a2 === void 0 ? void 0 : _a2["notify"]();
        });
      };
      QueryManager2.prototype.getLocalState = function() {
        return this.localState;
      };
      QueryManager2.prototype.getObservableFromLink = function(query, context, variables, extensions, deduplication) {
        var _this = this;
        var _a2;
        if (deduplication === void 0) {
          deduplication = (_a2 = context === null || context === void 0 ? void 0 : context.queryDeduplication) !== null && _a2 !== void 0 ? _a2 : this.queryDeduplication;
        }
        var observable;
        var _b = this.getDocumentInfo(query), serverQuery = _b.serverQuery, clientQuery = _b.clientQuery;
        if (serverQuery) {
          var _c = this, inFlightLinkObservables_1 = _c.inFlightLinkObservables, link = _c.link;
          var operation = {
            query: serverQuery,
            variables,
            operationName: getOperationName(serverQuery) || void 0,
            context: this.prepareContext(__assign(__assign({}, context), { forceFetch: !deduplication })),
            extensions
          };
          context = operation.context;
          if (deduplication) {
            var printedServerQuery_1 = print2(serverQuery);
            var varJson_1 = canonicalStringify(variables);
            var entry = inFlightLinkObservables_1.lookup(printedServerQuery_1, varJson_1);
            observable = entry.observable;
            if (!observable) {
              var concast_1 = new Concast([
                execute(link, operation)
              ]);
              observable = entry.observable = concast_1;
              concast_1.beforeNext(function cb(method, arg) {
                if (method === "next" && "hasNext" in arg && arg.hasNext) {
                  concast_1.beforeNext(cb);
                } else {
                  inFlightLinkObservables_1.remove(printedServerQuery_1, varJson_1);
                }
              });
            }
          } else {
            observable = new Concast([
              execute(link, operation)
            ]);
          }
        } else {
          observable = new Concast([Observable.of({ data: {} })]);
          context = this.prepareContext(context);
        }
        if (clientQuery) {
          observable = asyncMap(observable, function(result2) {
            return _this.localState.runResolvers({
              document: clientQuery,
              remoteResult: result2,
              context,
              variables
            });
          });
        }
        return observable;
      };
      QueryManager2.prototype.getResultsFromLink = function(queryInfo, cacheWriteBehavior, options) {
        var requestId = queryInfo.lastRequestId = this.generateRequestId();
        var linkDocument = this.cache.transformForLink(options.query);
        return asyncMap(this.getObservableFromLink(linkDocument, options.context, options.variables), function(result2) {
          var graphQLErrors = getGraphQLErrorsFromResult(result2);
          var hasErrors = graphQLErrors.length > 0;
          var errorPolicy = options.errorPolicy;
          if (requestId >= queryInfo.lastRequestId) {
            if (hasErrors && errorPolicy === "none") {
              throw queryInfo.markError(new ApolloError({
                graphQLErrors
              }));
            }
            queryInfo.markResult(result2, linkDocument, options, cacheWriteBehavior);
            queryInfo.markReady();
          }
          var aqr = {
            data: result2.data,
            loading: false,
            networkStatus: NetworkStatus.ready
          };
          if (hasErrors && errorPolicy === "none") {
            aqr.data = void 0;
          }
          if (hasErrors && errorPolicy !== "ignore") {
            aqr.errors = graphQLErrors;
            aqr.networkStatus = NetworkStatus.error;
          }
          return aqr;
        }, function(networkError) {
          var error = isApolloError(networkError) ? networkError : new ApolloError({ networkError });
          if (requestId >= queryInfo.lastRequestId) {
            queryInfo.markError(error);
          }
          throw error;
        });
      };
      QueryManager2.prototype.fetchConcastWithInfo = function(queryInfo, options, networkStatus, query) {
        var _this = this;
        if (networkStatus === void 0) {
          networkStatus = NetworkStatus.loading;
        }
        if (query === void 0) {
          query = options.query;
        }
        var variables = this.getVariables(query, options.variables);
        var defaults = this.defaultOptions.watchQuery;
        var _a2 = options.fetchPolicy, fetchPolicy = _a2 === void 0 ? defaults && defaults.fetchPolicy || "cache-first" : _a2, _b = options.errorPolicy, errorPolicy = _b === void 0 ? defaults && defaults.errorPolicy || "none" : _b, _c = options.returnPartialData, returnPartialData = _c === void 0 ? false : _c, _d = options.notifyOnNetworkStatusChange, notifyOnNetworkStatusChange = _d === void 0 ? false : _d, _e = options.context, context = _e === void 0 ? {} : _e;
        var normalized = Object.assign({}, options, {
          query,
          variables,
          fetchPolicy,
          errorPolicy,
          returnPartialData,
          notifyOnNetworkStatusChange,
          context
        });
        var fromVariables = function(variables2) {
          normalized.variables = variables2;
          var sourcesWithInfo2 = _this.fetchQueryByPolicy(queryInfo, normalized, networkStatus);
          if (
            // If we're in standby, postpone advancing options.fetchPolicy using
            // applyNextFetchPolicy.
            normalized.fetchPolicy !== "standby" && // The "standby" policy currently returns [] from fetchQueryByPolicy, so
            // this is another way to detect when nothing was done/fetched.
            sourcesWithInfo2.sources.length > 0 && queryInfo.observableQuery
          ) {
            queryInfo.observableQuery["applyNextFetchPolicy"]("after-fetch", options);
          }
          return sourcesWithInfo2;
        };
        var cleanupCancelFn = function() {
          return _this.fetchCancelFns.delete(queryInfo.queryId);
        };
        this.fetchCancelFns.set(queryInfo.queryId, function(reason) {
          cleanupCancelFn();
          setTimeout(function() {
            return concast.cancel(reason);
          });
        });
        var concast, containsDataFromLink;
        if (this.getDocumentInfo(normalized.query).hasClientExports) {
          concast = new Concast(this.localState.addExportedVariables(normalized.query, normalized.variables, normalized.context).then(fromVariables).then(function(sourcesWithInfo2) {
            return sourcesWithInfo2.sources;
          }));
          containsDataFromLink = true;
        } else {
          var sourcesWithInfo = fromVariables(normalized.variables);
          containsDataFromLink = sourcesWithInfo.fromLink;
          concast = new Concast(sourcesWithInfo.sources);
        }
        concast.promise.then(cleanupCancelFn, cleanupCancelFn);
        return {
          concast,
          fromLink: containsDataFromLink
        };
      };
      QueryManager2.prototype.refetchQueries = function(_a2) {
        var _this = this;
        var updateCache = _a2.updateCache, include = _a2.include, _b = _a2.optimistic, optimistic = _b === void 0 ? false : _b, _c = _a2.removeOptimistic, removeOptimistic = _c === void 0 ? optimistic ? makeUniqueId("refetchQueries") : void 0 : _c, onQueryUpdated = _a2.onQueryUpdated;
        var includedQueriesById = /* @__PURE__ */ new Map();
        if (include) {
          this.getObservableQueries(include).forEach(function(oq, queryId) {
            includedQueriesById.set(queryId, {
              oq,
              lastDiff: (_this.queries.get(queryId) || oq["queryInfo"]).getDiff()
            });
          });
        }
        var results = /* @__PURE__ */ new Map();
        if (updateCache) {
          this.cache.batch({
            update: updateCache,
            // Since you can perform any combination of cache reads and/or writes in
            // the cache.batch update function, its optimistic option can be either
            // a boolean or a string, representing three distinct modes of
            // operation:
            //
            // * false: read/write only the root layer
            // * true: read/write the topmost layer
            // * string: read/write a fresh optimistic layer with that ID string
            //
            // When typeof optimistic === "string", a new optimistic layer will be
            // temporarily created within cache.batch with that string as its ID. If
            // we then pass that same string as the removeOptimistic option, we can
            // make cache.batch immediately remove the optimistic layer after
            // running the updateCache function, triggering only one broadcast.
            //
            // However, the refetchQueries method accepts only true or false for its
            // optimistic option (not string). We interpret true to mean a temporary
            // optimistic layer should be created, to allow efficiently rolling back
            // the effect of the updateCache function, which involves passing a
            // string instead of true as the optimistic option to cache.batch, when
            // refetchQueries receives optimistic: true.
            //
            // In other words, we are deliberately not supporting the use case of
            // writing to an *existing* optimistic layer (using the refetchQueries
            // updateCache function), since that would potentially interfere with
            // other optimistic updates in progress. Instead, you can read/write
            // only the root layer by passing optimistic: false to refetchQueries,
            // or you can read/write a brand new optimistic layer that will be
            // automatically removed by passing optimistic: true.
            optimistic: optimistic && removeOptimistic || false,
            // The removeOptimistic option can also be provided by itself, even if
            // optimistic === false, to remove some previously-added optimistic
            // layer safely and efficiently, like we do in markMutationResult.
            //
            // If an explicit removeOptimistic string is provided with optimistic:
            // true, the removeOptimistic string will determine the ID of the
            // temporary optimistic layer, in case that ever matters.
            removeOptimistic,
            onWatchUpdated: function(watch, diff, lastDiff) {
              var oq = watch.watcher instanceof QueryInfo && watch.watcher.observableQuery;
              if (oq) {
                if (onQueryUpdated) {
                  includedQueriesById.delete(oq.queryId);
                  var result2 = onQueryUpdated(oq, diff, lastDiff);
                  if (result2 === true) {
                    result2 = oq.refetch();
                  }
                  if (result2 !== false) {
                    results.set(oq, result2);
                  }
                  return result2;
                }
                if (onQueryUpdated !== null) {
                  includedQueriesById.set(oq.queryId, { oq, lastDiff, diff });
                }
              }
            }
          });
        }
        if (includedQueriesById.size) {
          includedQueriesById.forEach(function(_a3, queryId) {
            var oq = _a3.oq, lastDiff = _a3.lastDiff, diff = _a3.diff;
            var result2;
            if (onQueryUpdated) {
              if (!diff) {
                diff = _this.cache.diff(oq["queryInfo"]["getDiffOptions"]());
              }
              result2 = onQueryUpdated(oq, diff, lastDiff);
            }
            if (!onQueryUpdated || result2 === true) {
              result2 = oq.refetch();
            }
            if (result2 !== false) {
              results.set(oq, result2);
            }
            if (queryId.indexOf("legacyOneTimeQuery") >= 0) {
              _this.stopQueryNoBroadcast(queryId);
            }
          });
        }
        if (removeOptimistic) {
          this.cache.removeOptimistic(removeOptimistic);
        }
        return results;
      };
      QueryManager2.prototype.maskOperation = function(options) {
        var _a2, _b, _c;
        var document2 = options.document, data = options.data;
        if (globalThis.__DEV__ !== false) {
          var fetchPolicy = options.fetchPolicy, id = options.id;
          var operationType = (_a2 = getOperationDefinition(document2)) === null || _a2 === void 0 ? void 0 : _a2.operation;
          var operationId = ((_b = operationType === null || operationType === void 0 ? void 0 : operationType[0]) !== null && _b !== void 0 ? _b : "o") + id;
          if (this.dataMasking && fetchPolicy === "no-cache" && !isFullyUnmaskedOperation(document2) && !this.noCacheWarningsByQueryId.has(operationId)) {
            this.noCacheWarningsByQueryId.add(operationId);
            globalThis.__DEV__ !== false && invariant2.warn(
              37,
              (_c = getOperationName(document2)) !== null && _c !== void 0 ? _c : "Unnamed ".concat(operationType !== null && operationType !== void 0 ? operationType : "operation")
            );
          }
        }
        return this.dataMasking ? maskOperation(data, document2, this.cache) : data;
      };
      QueryManager2.prototype.maskFragment = function(options) {
        var data = options.data, fragment = options.fragment, fragmentName = options.fragmentName;
        return this.dataMasking ? maskFragment(data, fragment, this.cache, fragmentName) : data;
      };
      QueryManager2.prototype.fetchQueryByPolicy = function(queryInfo, _a2, networkStatus) {
        var _this = this;
        var query = _a2.query, variables = _a2.variables, fetchPolicy = _a2.fetchPolicy, refetchWritePolicy = _a2.refetchWritePolicy, errorPolicy = _a2.errorPolicy, returnPartialData = _a2.returnPartialData, context = _a2.context, notifyOnNetworkStatusChange = _a2.notifyOnNetworkStatusChange;
        var oldNetworkStatus = queryInfo.networkStatus;
        queryInfo.init({
          document: query,
          variables,
          networkStatus
        });
        var readCache = function() {
          return queryInfo.getDiff();
        };
        var resultsFromCache = function(diff2, networkStatus2) {
          if (networkStatus2 === void 0) {
            networkStatus2 = queryInfo.networkStatus || NetworkStatus.loading;
          }
          var data = diff2.result;
          if (globalThis.__DEV__ !== false && !returnPartialData && !equal(data, {})) {
            logMissingFieldErrors(diff2.missing);
          }
          var fromData = function(data2) {
            return Observable.of(__assign({ data: data2, loading: isNetworkRequestInFlight(networkStatus2), networkStatus: networkStatus2 }, diff2.complete ? null : { partial: true }));
          };
          if (data && _this.getDocumentInfo(query).hasForcedResolvers) {
            return _this.localState.runResolvers({
              document: query,
              remoteResult: { data },
              context,
              variables,
              onlyRunForcedResolvers: true
            }).then(function(resolved) {
              return fromData(resolved.data || void 0);
            });
          }
          if (errorPolicy === "none" && networkStatus2 === NetworkStatus.refetch && Array.isArray(diff2.missing)) {
            return fromData(void 0);
          }
          return fromData(data);
        };
        var cacheWriteBehavior = fetchPolicy === "no-cache" ? 0 : networkStatus === NetworkStatus.refetch && refetchWritePolicy !== "merge" ? 1 : 2;
        var resultsFromLink = function() {
          return _this.getResultsFromLink(queryInfo, cacheWriteBehavior, {
            query,
            variables,
            context,
            fetchPolicy,
            errorPolicy
          });
        };
        var shouldNotify = notifyOnNetworkStatusChange && typeof oldNetworkStatus === "number" && oldNetworkStatus !== networkStatus && isNetworkRequestInFlight(networkStatus);
        switch (fetchPolicy) {
          default:
          case "cache-first": {
            var diff = readCache();
            if (diff.complete) {
              return {
                fromLink: false,
                sources: [resultsFromCache(diff, queryInfo.markReady())]
              };
            }
            if (returnPartialData || shouldNotify) {
              return {
                fromLink: true,
                sources: [resultsFromCache(diff), resultsFromLink()]
              };
            }
            return { fromLink: true, sources: [resultsFromLink()] };
          }
          case "cache-and-network": {
            var diff = readCache();
            if (diff.complete || returnPartialData || shouldNotify) {
              return {
                fromLink: true,
                sources: [resultsFromCache(diff), resultsFromLink()]
              };
            }
            return { fromLink: true, sources: [resultsFromLink()] };
          }
          case "cache-only":
            return {
              fromLink: false,
              sources: [resultsFromCache(readCache(), queryInfo.markReady())]
            };
          case "network-only":
            if (shouldNotify) {
              return {
                fromLink: true,
                sources: [resultsFromCache(readCache()), resultsFromLink()]
              };
            }
            return { fromLink: true, sources: [resultsFromLink()] };
          case "no-cache":
            if (shouldNotify) {
              return {
                fromLink: true,
                // Note that queryInfo.getDiff() for no-cache queries does not call
                // cache.diff, but instead returns a { complete: false } stub result
                // when there is no queryInfo.diff already defined.
                sources: [resultsFromCache(queryInfo.getDiff()), resultsFromLink()]
              };
            }
            return { fromLink: true, sources: [resultsFromLink()] };
          case "standby":
            return { fromLink: false, sources: [] };
        }
      };
      QueryManager2.prototype.getOrCreateQuery = function(queryId) {
        if (queryId && !this.queries.has(queryId)) {
          this.queries.set(queryId, new QueryInfo(this, queryId));
        }
        return this.queries.get(queryId);
      };
      QueryManager2.prototype.prepareContext = function(context) {
        if (context === void 0) {
          context = {};
        }
        var newContext = this.localState.prepareContext(context);
        return __assign(__assign(__assign({}, this.defaultContext), newContext), { clientAwareness: this.clientAwareness });
      };
      return QueryManager2;
    })()
  );

  // node_modules/@apollo/client/core/LocalState.js
  var LocalState = (
    /** @class */
    (function() {
      function LocalState2(_a2) {
        var cache = _a2.cache, client2 = _a2.client, resolvers = _a2.resolvers, fragmentMatcher = _a2.fragmentMatcher;
        this.selectionsToResolveCache = /* @__PURE__ */ new WeakMap();
        this.cache = cache;
        if (client2) {
          this.client = client2;
        }
        if (resolvers) {
          this.addResolvers(resolvers);
        }
        if (fragmentMatcher) {
          this.setFragmentMatcher(fragmentMatcher);
        }
      }
      LocalState2.prototype.addResolvers = function(resolvers) {
        var _this = this;
        this.resolvers = this.resolvers || {};
        if (Array.isArray(resolvers)) {
          resolvers.forEach(function(resolverGroup) {
            _this.resolvers = mergeDeep(_this.resolvers, resolverGroup);
          });
        } else {
          this.resolvers = mergeDeep(this.resolvers, resolvers);
        }
      };
      LocalState2.prototype.setResolvers = function(resolvers) {
        this.resolvers = {};
        this.addResolvers(resolvers);
      };
      LocalState2.prototype.getResolvers = function() {
        return this.resolvers || {};
      };
      LocalState2.prototype.runResolvers = function(_a2) {
        return __awaiter(this, arguments, void 0, function(_b) {
          var document2 = _b.document, remoteResult = _b.remoteResult, context = _b.context, variables = _b.variables, _c = _b.onlyRunForcedResolvers, onlyRunForcedResolvers = _c === void 0 ? false : _c;
          return __generator(this, function(_d) {
            if (document2) {
              return [2, this.resolveDocument(document2, remoteResult.data, context, variables, this.fragmentMatcher, onlyRunForcedResolvers).then(function(localResult) {
                return __assign(__assign({}, remoteResult), { data: localResult.result });
              })];
            }
            return [2, remoteResult];
          });
        });
      };
      LocalState2.prototype.setFragmentMatcher = function(fragmentMatcher) {
        this.fragmentMatcher = fragmentMatcher;
      };
      LocalState2.prototype.getFragmentMatcher = function() {
        return this.fragmentMatcher;
      };
      LocalState2.prototype.clientQuery = function(document2) {
        if (hasDirectives(["client"], document2)) {
          if (this.resolvers) {
            return document2;
          }
        }
        return null;
      };
      LocalState2.prototype.serverQuery = function(document2) {
        return removeClientSetsFromDocument(document2);
      };
      LocalState2.prototype.prepareContext = function(context) {
        var cache = this.cache;
        return __assign(__assign({}, context), {
          cache,
          // Getting an entry's cache key is useful for local state resolvers.
          getCacheKey: function(obj) {
            return cache.identify(obj);
          }
        });
      };
      LocalState2.prototype.addExportedVariables = function(document_1) {
        return __awaiter(this, arguments, void 0, function(document2, variables, context) {
          if (variables === void 0) {
            variables = {};
          }
          if (context === void 0) {
            context = {};
          }
          return __generator(this, function(_a2) {
            if (document2) {
              return [2, this.resolveDocument(document2, this.buildRootValueFromCache(document2, variables) || {}, this.prepareContext(context), variables).then(function(data) {
                return __assign(__assign({}, variables), data.exportedVariables);
              })];
            }
            return [2, __assign({}, variables)];
          });
        });
      };
      LocalState2.prototype.shouldForceResolvers = function(document2) {
        var forceResolvers = false;
        visit(document2, {
          Directive: {
            enter: function(node) {
              if (node.name.value === "client" && node.arguments) {
                forceResolvers = node.arguments.some(function(arg) {
                  return arg.name.value === "always" && arg.value.kind === "BooleanValue" && arg.value.value === true;
                });
                if (forceResolvers) {
                  return BREAK;
                }
              }
            }
          }
        });
        return forceResolvers;
      };
      LocalState2.prototype.buildRootValueFromCache = function(document2, variables) {
        return this.cache.diff({
          query: buildQueryFromSelectionSet(document2),
          variables,
          returnPartialData: true,
          optimistic: false
        }).result;
      };
      LocalState2.prototype.resolveDocument = function(document_1, rootValue_1) {
        return __awaiter(this, arguments, void 0, function(document2, rootValue, context, variables, fragmentMatcher, onlyRunForcedResolvers) {
          var mainDefinition, fragments, fragmentMap, selectionsToResolve, definitionOperation, defaultOperationType, _a2, cache, client2, execContext, isClientFieldDescendant;
          if (context === void 0) {
            context = {};
          }
          if (variables === void 0) {
            variables = {};
          }
          if (fragmentMatcher === void 0) {
            fragmentMatcher = function() {
              return true;
            };
          }
          if (onlyRunForcedResolvers === void 0) {
            onlyRunForcedResolvers = false;
          }
          return __generator(this, function(_b) {
            mainDefinition = getMainDefinition(document2);
            fragments = getFragmentDefinitions(document2);
            fragmentMap = createFragmentMap(fragments);
            selectionsToResolve = this.collectSelectionsToResolve(mainDefinition, fragmentMap);
            definitionOperation = mainDefinition.operation;
            defaultOperationType = definitionOperation ? definitionOperation.charAt(0).toUpperCase() + definitionOperation.slice(1) : "Query";
            _a2 = this, cache = _a2.cache, client2 = _a2.client;
            execContext = {
              fragmentMap,
              context: __assign(__assign({}, context), { cache, client: client2 }),
              variables,
              fragmentMatcher,
              defaultOperationType,
              exportedVariables: {},
              selectionsToResolve,
              onlyRunForcedResolvers
            };
            isClientFieldDescendant = false;
            return [2, this.resolveSelectionSet(mainDefinition.selectionSet, isClientFieldDescendant, rootValue, execContext).then(function(result2) {
              return {
                result: result2,
                exportedVariables: execContext.exportedVariables
              };
            })];
          });
        });
      };
      LocalState2.prototype.resolveSelectionSet = function(selectionSet, isClientFieldDescendant, rootValue, execContext) {
        return __awaiter(this, void 0, void 0, function() {
          var fragmentMap, context, variables, resultsToMerge, execute2;
          var _this = this;
          return __generator(this, function(_a2) {
            fragmentMap = execContext.fragmentMap, context = execContext.context, variables = execContext.variables;
            resultsToMerge = [rootValue];
            execute2 = function(selection) {
              return __awaiter(_this, void 0, void 0, function() {
                var fragment, typeCondition;
                return __generator(this, function(_a3) {
                  if (!isClientFieldDescendant && !execContext.selectionsToResolve.has(selection)) {
                    return [
                      2
                      /*return*/
                    ];
                  }
                  if (!shouldInclude(selection, variables)) {
                    return [
                      2
                      /*return*/
                    ];
                  }
                  if (isField(selection)) {
                    return [2, this.resolveField(selection, isClientFieldDescendant, rootValue, execContext).then(function(fieldResult) {
                      var _a4;
                      if (typeof fieldResult !== "undefined") {
                        resultsToMerge.push((_a4 = {}, _a4[resultKeyNameFromField(selection)] = fieldResult, _a4));
                      }
                    })];
                  }
                  if (isInlineFragment(selection)) {
                    fragment = selection;
                  } else {
                    fragment = fragmentMap[selection.name.value];
                    invariant2(fragment, 19, selection.name.value);
                  }
                  if (fragment && fragment.typeCondition) {
                    typeCondition = fragment.typeCondition.name.value;
                    if (execContext.fragmentMatcher(rootValue, typeCondition, context)) {
                      return [2, this.resolveSelectionSet(fragment.selectionSet, isClientFieldDescendant, rootValue, execContext).then(function(fragmentResult) {
                        resultsToMerge.push(fragmentResult);
                      })];
                    }
                  }
                  return [
                    2
                    /*return*/
                  ];
                });
              });
            };
            return [2, Promise.all(selectionSet.selections.map(execute2)).then(function() {
              return mergeDeepArray(resultsToMerge);
            })];
          });
        });
      };
      LocalState2.prototype.resolveField = function(field, isClientFieldDescendant, rootValue, execContext) {
        return __awaiter(this, void 0, void 0, function() {
          var variables, fieldName, aliasedFieldName, aliasUsed, defaultResult, resultPromise, resolverType, resolverMap, resolve;
          var _this = this;
          return __generator(this, function(_a2) {
            if (!rootValue) {
              return [2, null];
            }
            variables = execContext.variables;
            fieldName = field.name.value;
            aliasedFieldName = resultKeyNameFromField(field);
            aliasUsed = fieldName !== aliasedFieldName;
            defaultResult = rootValue[aliasedFieldName] || rootValue[fieldName];
            resultPromise = Promise.resolve(defaultResult);
            if (!execContext.onlyRunForcedResolvers || this.shouldForceResolvers(field)) {
              resolverType = rootValue.__typename || execContext.defaultOperationType;
              resolverMap = this.resolvers && this.resolvers[resolverType];
              if (resolverMap) {
                resolve = resolverMap[aliasUsed ? fieldName : aliasedFieldName];
                if (resolve) {
                  resultPromise = Promise.resolve(
                    // In case the resolve function accesses reactive variables,
                    // set cacheSlot to the current cache instance.
                    cacheSlot.withValue(this.cache, resolve, [
                      rootValue,
                      argumentsObjectFromField(field, variables),
                      execContext.context,
                      { field, fragmentMap: execContext.fragmentMap }
                    ])
                  );
                }
              }
            }
            return [2, resultPromise.then(function(result2) {
              var _a3, _b;
              if (result2 === void 0) {
                result2 = defaultResult;
              }
              if (field.directives) {
                field.directives.forEach(function(directive) {
                  if (directive.name.value === "export" && directive.arguments) {
                    directive.arguments.forEach(function(arg) {
                      if (arg.name.value === "as" && arg.value.kind === "StringValue") {
                        execContext.exportedVariables[arg.value.value] = result2;
                      }
                    });
                  }
                });
              }
              if (!field.selectionSet) {
                return result2;
              }
              if (result2 == null) {
                return result2;
              }
              var isClientField = (_b = (_a3 = field.directives) === null || _a3 === void 0 ? void 0 : _a3.some(function(d) {
                return d.name.value === "client";
              })) !== null && _b !== void 0 ? _b : false;
              if (Array.isArray(result2)) {
                return _this.resolveSubSelectedArray(field, isClientFieldDescendant || isClientField, result2, execContext);
              }
              if (field.selectionSet) {
                return _this.resolveSelectionSet(field.selectionSet, isClientFieldDescendant || isClientField, result2, execContext);
              }
            })];
          });
        });
      };
      LocalState2.prototype.resolveSubSelectedArray = function(field, isClientFieldDescendant, result2, execContext) {
        var _this = this;
        return Promise.all(result2.map(function(item) {
          if (item === null) {
            return null;
          }
          if (Array.isArray(item)) {
            return _this.resolveSubSelectedArray(field, isClientFieldDescendant, item, execContext);
          }
          if (field.selectionSet) {
            return _this.resolveSelectionSet(field.selectionSet, isClientFieldDescendant, item, execContext);
          }
        }));
      };
      LocalState2.prototype.collectSelectionsToResolve = function(mainDefinition, fragmentMap) {
        var isSingleASTNode = function(node) {
          return !Array.isArray(node);
        };
        var selectionsToResolveCache = this.selectionsToResolveCache;
        function collectByDefinition(definitionNode) {
          if (!selectionsToResolveCache.has(definitionNode)) {
            var matches_1 = /* @__PURE__ */ new Set();
            selectionsToResolveCache.set(definitionNode, matches_1);
            visit(definitionNode, {
              Directive: function(node, _, __, ___, ancestors) {
                if (node.name.value === "client") {
                  ancestors.forEach(function(node2) {
                    if (isSingleASTNode(node2) && isSelectionNode(node2)) {
                      matches_1.add(node2);
                    }
                  });
                }
              },
              FragmentSpread: function(spread, _, __, ___, ancestors) {
                var fragment = fragmentMap[spread.name.value];
                invariant2(fragment, 20, spread.name.value);
                var fragmentSelections = collectByDefinition(fragment);
                if (fragmentSelections.size > 0) {
                  ancestors.forEach(function(node) {
                    if (isSingleASTNode(node) && isSelectionNode(node)) {
                      matches_1.add(node);
                    }
                  });
                  matches_1.add(spread);
                  fragmentSelections.forEach(function(selection) {
                    matches_1.add(selection);
                  });
                }
              }
            });
          }
          return selectionsToResolveCache.get(definitionNode);
        }
        return collectByDefinition(mainDefinition);
      };
      return LocalState2;
    })()
  );

  // node_modules/@apollo/client/core/ApolloClient.js
  var hasSuggestedDevtools = false;
  var ApolloClient = (
    /** @class */
    (function() {
      function ApolloClient2(options) {
        var _this = this;
        var _a2;
        this.resetStoreCallbacks = [];
        this.clearStoreCallbacks = [];
        if (!options.cache) {
          throw newInvariantError(16);
        }
        var uri = options.uri, credentials = options.credentials, headers = options.headers, cache = options.cache, documentTransform = options.documentTransform, _b = options.ssrMode, ssrMode = _b === void 0 ? false : _b, _c = options.ssrForceFetchDelay, ssrForceFetchDelay = _c === void 0 ? 0 : _c, connectToDevTools = options.connectToDevTools, _d = options.queryDeduplication, queryDeduplication = _d === void 0 ? true : _d, defaultOptions2 = options.defaultOptions, defaultContext = options.defaultContext, _e = options.assumeImmutableResults, assumeImmutableResults = _e === void 0 ? cache.assumeImmutableResults : _e, resolvers = options.resolvers, typeDefs = options.typeDefs, fragmentMatcher = options.fragmentMatcher, clientAwarenessName = options.name, clientAwarenessVersion = options.version, devtools = options.devtools, dataMasking = options.dataMasking;
        var link = options.link;
        if (!link) {
          link = uri ? new HttpLink({ uri, credentials, headers }) : ApolloLink.empty();
        }
        this.link = link;
        this.cache = cache;
        this.disableNetworkFetches = ssrMode || ssrForceFetchDelay > 0;
        this.queryDeduplication = queryDeduplication;
        this.defaultOptions = defaultOptions2 || /* @__PURE__ */ Object.create(null);
        this.typeDefs = typeDefs;
        this.devtoolsConfig = __assign(__assign({}, devtools), { enabled: (_a2 = devtools === null || devtools === void 0 ? void 0 : devtools.enabled) !== null && _a2 !== void 0 ? _a2 : connectToDevTools });
        if (this.devtoolsConfig.enabled === void 0) {
          this.devtoolsConfig.enabled = globalThis.__DEV__ !== false;
        }
        if (ssrForceFetchDelay) {
          setTimeout(function() {
            return _this.disableNetworkFetches = false;
          }, ssrForceFetchDelay);
        }
        this.watchQuery = this.watchQuery.bind(this);
        this.query = this.query.bind(this);
        this.mutate = this.mutate.bind(this);
        this.watchFragment = this.watchFragment.bind(this);
        this.resetStore = this.resetStore.bind(this);
        this.reFetchObservableQueries = this.reFetchObservableQueries.bind(this);
        this.version = version;
        this.localState = new LocalState({
          cache,
          client: this,
          resolvers,
          fragmentMatcher
        });
        this.queryManager = new QueryManager({
          cache: this.cache,
          link: this.link,
          defaultOptions: this.defaultOptions,
          defaultContext,
          documentTransform,
          queryDeduplication,
          ssrMode,
          dataMasking: !!dataMasking,
          clientAwareness: {
            name: clientAwarenessName,
            version: clientAwarenessVersion
          },
          localState: this.localState,
          assumeImmutableResults,
          onBroadcast: this.devtoolsConfig.enabled ? function() {
            if (_this.devToolsHookCb) {
              _this.devToolsHookCb({
                action: {},
                state: {
                  queries: _this.queryManager.getQueryStore(),
                  mutations: _this.queryManager.mutationStore || {}
                },
                dataWithOptimisticResults: _this.cache.extract(true)
              });
            }
          } : void 0
        });
        if (this.devtoolsConfig.enabled)
          this.connectToDevTools();
      }
      ApolloClient2.prototype.connectToDevTools = function() {
        if (typeof window === "undefined") {
          return;
        }
        var windowWithDevTools = window;
        var devtoolsSymbol = Symbol.for("apollo.devtools");
        (windowWithDevTools[devtoolsSymbol] = windowWithDevTools[devtoolsSymbol] || []).push(this);
        windowWithDevTools.__APOLLO_CLIENT__ = this;
        if (!hasSuggestedDevtools && globalThis.__DEV__ !== false) {
          hasSuggestedDevtools = true;
          if (window.document && window.top === window.self && /^(https?|file):$/.test(window.location.protocol)) {
            setTimeout(function() {
              if (!window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__) {
                var nav = window.navigator;
                var ua = nav && nav.userAgent;
                var url = void 0;
                if (typeof ua === "string") {
                  if (ua.indexOf("Chrome/") > -1) {
                    url = "https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm";
                  } else if (ua.indexOf("Firefox/") > -1) {
                    url = "https://addons.mozilla.org/en-US/firefox/addon/apollo-developer-tools/";
                  }
                }
                if (url) {
                  globalThis.__DEV__ !== false && invariant2.log("Download the Apollo DevTools for a better development experience: %s", url);
                }
              }
            }, 1e4);
          }
        }
      };
      Object.defineProperty(ApolloClient2.prototype, "documentTransform", {
        /**
         * The `DocumentTransform` used to modify GraphQL documents before a request
         * is made. If a custom `DocumentTransform` is not provided, this will be the
         * default document transform.
         */
        get: function() {
          return this.queryManager.documentTransform;
        },
        enumerable: false,
        configurable: true
      });
      ApolloClient2.prototype.stop = function() {
        this.queryManager.stop();
      };
      ApolloClient2.prototype.watchQuery = function(options) {
        if (this.defaultOptions.watchQuery) {
          options = mergeOptions(this.defaultOptions.watchQuery, options);
        }
        if (this.disableNetworkFetches && (options.fetchPolicy === "network-only" || options.fetchPolicy === "cache-and-network")) {
          options = __assign(__assign({}, options), { fetchPolicy: "cache-first" });
        }
        return this.queryManager.watchQuery(options);
      };
      ApolloClient2.prototype.query = function(options) {
        if (this.defaultOptions.query) {
          options = mergeOptions(this.defaultOptions.query, options);
        }
        invariant2(options.fetchPolicy !== "cache-and-network", 17);
        if (this.disableNetworkFetches && options.fetchPolicy === "network-only") {
          options = __assign(__assign({}, options), { fetchPolicy: "cache-first" });
        }
        return this.queryManager.query(options);
      };
      ApolloClient2.prototype.mutate = function(options) {
        if (this.defaultOptions.mutate) {
          options = mergeOptions(this.defaultOptions.mutate, options);
        }
        return this.queryManager.mutate(options);
      };
      ApolloClient2.prototype.subscribe = function(options) {
        var _this = this;
        var id = this.queryManager.generateQueryId();
        return this.queryManager.startGraphQLSubscription(options).map(function(result2) {
          return __assign(__assign({}, result2), { data: _this.queryManager.maskOperation({
            document: options.query,
            data: result2.data,
            fetchPolicy: options.fetchPolicy,
            id
          }) });
        });
      };
      ApolloClient2.prototype.readQuery = function(options, optimistic) {
        if (optimistic === void 0) {
          optimistic = false;
        }
        return this.cache.readQuery(options, optimistic);
      };
      ApolloClient2.prototype.watchFragment = function(options) {
        var _a2;
        return this.cache.watchFragment(__assign(__assign({}, options), (_a2 = {}, _a2[Symbol.for("apollo.dataMasking")] = this.queryManager.dataMasking, _a2)));
      };
      ApolloClient2.prototype.readFragment = function(options, optimistic) {
        if (optimistic === void 0) {
          optimistic = false;
        }
        return this.cache.readFragment(options, optimistic);
      };
      ApolloClient2.prototype.writeQuery = function(options) {
        var ref = this.cache.writeQuery(options);
        if (options.broadcast !== false) {
          this.queryManager.broadcastQueries();
        }
        return ref;
      };
      ApolloClient2.prototype.writeFragment = function(options) {
        var ref = this.cache.writeFragment(options);
        if (options.broadcast !== false) {
          this.queryManager.broadcastQueries();
        }
        return ref;
      };
      ApolloClient2.prototype.__actionHookForDevTools = function(cb) {
        this.devToolsHookCb = cb;
      };
      ApolloClient2.prototype.__requestRaw = function(payload) {
        return execute(this.link, payload);
      };
      ApolloClient2.prototype.resetStore = function() {
        var _this = this;
        return Promise.resolve().then(function() {
          return _this.queryManager.clearStore({
            discardWatches: false
          });
        }).then(function() {
          return Promise.all(_this.resetStoreCallbacks.map(function(fn) {
            return fn();
          }));
        }).then(function() {
          return _this.reFetchObservableQueries();
        });
      };
      ApolloClient2.prototype.clearStore = function() {
        var _this = this;
        return Promise.resolve().then(function() {
          return _this.queryManager.clearStore({
            discardWatches: true
          });
        }).then(function() {
          return Promise.all(_this.clearStoreCallbacks.map(function(fn) {
            return fn();
          }));
        });
      };
      ApolloClient2.prototype.onResetStore = function(cb) {
        var _this = this;
        this.resetStoreCallbacks.push(cb);
        return function() {
          _this.resetStoreCallbacks = _this.resetStoreCallbacks.filter(function(c) {
            return c !== cb;
          });
        };
      };
      ApolloClient2.prototype.onClearStore = function(cb) {
        var _this = this;
        this.clearStoreCallbacks.push(cb);
        return function() {
          _this.clearStoreCallbacks = _this.clearStoreCallbacks.filter(function(c) {
            return c !== cb;
          });
        };
      };
      ApolloClient2.prototype.reFetchObservableQueries = function(includeStandby) {
        return this.queryManager.reFetchObservableQueries(includeStandby);
      };
      ApolloClient2.prototype.refetchQueries = function(options) {
        var map = this.queryManager.refetchQueries(options);
        var queries = [];
        var results = [];
        map.forEach(function(result3, obsQuery) {
          queries.push(obsQuery);
          results.push(result3);
        });
        var result2 = Promise.all(results);
        result2.queries = queries;
        result2.results = results;
        result2.catch(function(error) {
          globalThis.__DEV__ !== false && invariant2.debug(18, error);
        });
        return result2;
      };
      ApolloClient2.prototype.getObservableQueries = function(include) {
        if (include === void 0) {
          include = "active";
        }
        return this.queryManager.getObservableQueries(include);
      };
      ApolloClient2.prototype.extract = function(optimistic) {
        return this.cache.extract(optimistic);
      };
      ApolloClient2.prototype.restore = function(serializedState) {
        return this.cache.restore(serializedState);
      };
      ApolloClient2.prototype.addResolvers = function(resolvers) {
        this.localState.addResolvers(resolvers);
      };
      ApolloClient2.prototype.setResolvers = function(resolvers) {
        this.localState.setResolvers(resolvers);
      };
      ApolloClient2.prototype.getResolvers = function() {
        return this.localState.getResolvers();
      };
      ApolloClient2.prototype.setLocalStateFragmentMatcher = function(fragmentMatcher) {
        this.localState.setFragmentMatcher(fragmentMatcher);
      };
      ApolloClient2.prototype.setLink = function(newLink) {
        this.link = this.queryManager.link = newLink;
      };
      Object.defineProperty(ApolloClient2.prototype, "defaultContext", {
        get: function() {
          return this.queryManager.defaultContext;
        },
        enumerable: false,
        configurable: true
      });
      return ApolloClient2;
    })()
  );
  if (globalThis.__DEV__ !== false) {
    ApolloClient.prototype.getMemoryInternals = getApolloClientMemoryInternals;
  }

  // node_modules/graphql-tag/lib/index.js
  var docCache = /* @__PURE__ */ new Map();
  var fragmentSourceMap = /* @__PURE__ */ new Map();
  var printFragmentWarnings = true;
  var experimentalFragmentVariables = false;
  function normalize2(string) {
    return string.replace(/[\s,]+/g, " ").trim();
  }
  function cacheKeyFromLoc(loc) {
    return normalize2(loc.source.body.substring(loc.start, loc.end));
  }
  function processFragments(ast) {
    var seenKeys = /* @__PURE__ */ new Set();
    var definitions = [];
    ast.definitions.forEach(function(fragmentDefinition) {
      if (fragmentDefinition.kind === "FragmentDefinition") {
        var fragmentName = fragmentDefinition.name.value;
        var sourceKey = cacheKeyFromLoc(fragmentDefinition.loc);
        var sourceKeySet = fragmentSourceMap.get(fragmentName);
        if (sourceKeySet && !sourceKeySet.has(sourceKey)) {
          if (printFragmentWarnings) {
            console.warn("Warning: fragment with name " + fragmentName + " already exists.\ngraphql-tag enforces all fragment names across your application to be unique; read more about\nthis in the docs: http://dev.apollodata.com/core/fragments.html#unique-names");
          }
        } else if (!sourceKeySet) {
          fragmentSourceMap.set(fragmentName, sourceKeySet = /* @__PURE__ */ new Set());
        }
        sourceKeySet.add(sourceKey);
        if (!seenKeys.has(sourceKey)) {
          seenKeys.add(sourceKey);
          definitions.push(fragmentDefinition);
        }
      } else {
        definitions.push(fragmentDefinition);
      }
    });
    return __assign(__assign({}, ast), { definitions });
  }
  function stripLoc(doc) {
    var workSet = new Set(doc.definitions);
    workSet.forEach(function(node) {
      if (node.loc)
        delete node.loc;
      Object.keys(node).forEach(function(key) {
        var value = node[key];
        if (value && typeof value === "object") {
          workSet.add(value);
        }
      });
    });
    var loc = doc.loc;
    if (loc) {
      delete loc.startToken;
      delete loc.endToken;
    }
    return doc;
  }
  function parseDocument(source) {
    var cacheKey = normalize2(source);
    if (!docCache.has(cacheKey)) {
      var parsed = parse(source, {
        experimentalFragmentVariables,
        allowLegacyFragmentVariables: experimentalFragmentVariables
      });
      if (!parsed || parsed.kind !== "Document") {
        throw new Error("Not a valid GraphQL document.");
      }
      docCache.set(cacheKey, stripLoc(processFragments(parsed)));
    }
    return docCache.get(cacheKey);
  }
  function gql(literals) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
    if (typeof literals === "string") {
      literals = [literals];
    }
    var result2 = literals[0];
    args.forEach(function(arg, i) {
      if (arg && arg.kind === "Document") {
        result2 += arg.loc.source.body;
      } else {
        result2 += arg;
      }
      result2 += literals[i + 1];
    });
    return parseDocument(result2);
  }
  function resetCaches() {
    docCache.clear();
    fragmentSourceMap.clear();
  }
  function disableFragmentWarnings() {
    printFragmentWarnings = false;
  }
  function enableExperimentalFragmentVariables() {
    experimentalFragmentVariables = true;
  }
  function disableExperimentalFragmentVariables() {
    experimentalFragmentVariables = false;
  }
  var extras = {
    gql,
    resetCaches,
    disableFragmentWarnings,
    enableExperimentalFragmentVariables,
    disableExperimentalFragmentVariables
  };
  (function(gql_1) {
    gql_1.gql = extras.gql, gql_1.resetCaches = extras.resetCaches, gql_1.disableFragmentWarnings = extras.disableFragmentWarnings, gql_1.enableExperimentalFragmentVariables = extras.enableExperimentalFragmentVariables, gql_1.disableExperimentalFragmentVariables = extras.disableExperimentalFragmentVariables;
  })(gql || (gql = {}));
  gql["default"] = gql;

  // node_modules/@apollo/client/core/index.js
  setVerbosity(globalThis.__DEV__ !== false ? "log" : "silent");

  // src/services/apolloClient.js
  async function cookieHeaderFor(url) {
    return new Promise((resolve, reject) => {
      if (!chrome.cookies) {
        resolve("");
        return;
      }
      chrome.cookies.getAll({ url }, (cookies) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
        resolve(cookieHeader);
      });
    });
  }
  var customFetch = async (uri, options) => {
    const cookie = await cookieHeaderFor("https://home.atlassian.com");
    return fetch(uri, {
      ...options,
      headers: {
        ...options.headers,
        "content-type": "application/json",
        "cookie": cookie,
        "origin": "https://home.atlassian.com",
        "referer": "https://home.atlassian.com/",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Atl-Client-Name": "townsquare-frontend",
        "Atl-Client-Version": "6c7228"
      }
    });
  };
  var httpLink = new HttpLink({
    uri: "https://home.atlassian.com/gateway/api/townsquare/s/2b2b6771-c929-476f-8b6f-ca6ebcace8a2/graphql",
    fetch: customFetch
  });
  var client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    connectToDevTools: true
  });
  window.__APOLLO_CLIENT__ = client;
  var apolloClient = client;

  // src/graphql/projectViewQuery.js
  var PROJECT_VIEW_QUERY = `
  query ProjectViewQuery(
  $key: String!
  $trackViewEvent: TrackViewEvent
  $workspaceId: ID
  $onboardingKeyFilter: OnboardingItemKey!
  $areMilestonesEnabled: Boolean!
  $cloudId: String
  $isNavRefreshEnabled: Boolean!
) {
  project: projectByKey(key: $key, trackViewEvent: $trackViewEvent) {
    uuid
    name
    key
    owner {
      aaid
      id
    }
    members {
      ...utils_isUserInList
    }
    watchers {
      ...utils_isUserInList
    }
    private
    archived
    state {
      value
    }
    ...ProjectArchivedPanel
    ...ProjectHeader
    ...ProjectTabs
    ...ProjectContent @include(if: $isNavRefreshEnabled)
    ...ProjectSidebar_2SVbDg @skip(if: $isNavRefreshEnabled)
    ...useRedirectToDefaultTab
    id
  }
  currentUser(workspaceId: $workspaceId) {
    aaid
    onboarding(filter: {keys: [$onboardingKeyFilter]}) {
      edges {
        __typename
      }
    }
    id
  }
  ...OnboardingSpotlightTour_2tC7yX
}

fragment AddOrEditButton on CustomFieldNode {
  __isCustomFieldNode: __typename
  id
  definition {
    __typename
    ... on CustomFieldDefinitionNode {
      __isCustomFieldDefinitionNode: __typename
      type
    }
    ... on UserCustomFieldDefinition {
      canSetMultipleValues
    }
    ... on TextSelectCustomFieldDefinition {
      canSetMultipleValues
    }
    ... on Node {
      __isNode: __typename
      id
    }
  }
}

fragment Comment on Comment {
  id
  ari
  commentText
  creationDate
  editDate
  creator {
    aaid
    ...UserAvatar
    id
  }
}

fragment Comments on CommentConnection {
  edges {
    node {
      id
      editDate
      ...Comment
    }
  }
}

fragment DraftProjectUpdate on DraftUpdate {
  input
  modifiedDate
  author {
    pii {
      accountId
      name
      picture
    }
    id
  }
}

fragment FollowersSidebarSection on UserConnection {
  count
  edges {
    node {
      pii {
        name
        picture
        accountId
      }
      id
    }
  }
}

fragment FollowersSidebarSection_Owner on UserPII {
  accountId
}

fragment FollowersSidebarSection_ProjectKey on Project {
  key
}

fragment FreeformNumberField on NumberCustomField {
  ...AddOrEditButton
  id
  definition {
    __typename
    ... on CustomFieldDefinitionNode {
      __isCustomFieldDefinitionNode: __typename
      name
      description
    }
    ... on Node {
      __isNode: __typename
      id
    }
  }
  value {
    id
    numberValue: value
  }
}

fragment FreeformTextField on TextCustomField {
  ...AddOrEditButton
  id
  definition {
    __typename
    ... on CustomFieldDefinitionNode {
      __isCustomFieldDefinitionNode: __typename
      name
      description
    }
    ... on Node {
      __isNode: __typename
      id
    }
  }
  value {
    id
    textValue: value
  }
}

fragment GenericWorkTrackingLinks on Project {
  id
  workTrackingLinks: links(type: WORK_TRACKING, first: 1) {
    ...ProjectLinks
  }
}

fragment GoalItem on Goal {
  ...PlatformGoalIcon
  ...progressBarMetricTarget
  ...MetricChart
  progress {
    percentage
  }
  name
  key
  id
}

fragment InviteUserPromptPopup on Project {
  watchers {
    count
  }
}

fragment LinkedGoals on Project {
  id
  uuid
  goals {
    edges {
      node {
        id
        ...GoalItem
      }
    }
  }
}

fragment LinkedProject on ProjectDependency {
  dependencyId: id
  incomingProject {
    id
  }
  outgoingProject {
    id
    ...ProjectName_data
    state {
      ...ProjectState
    }
  }
}

fragment LinkedProjects on Project {
  id
  key
  dependencies {
    edges {
      node {
        linkType
        outgoingProject {
          key
          id
        }
        ...LinkedProject
        id
      }
    }
  }
}

fragment MetaActions on Project {
  key
  private
  ...ProjectStateAndTargetDate
  ...ProjectFollowButton
  ...InviteUserPromptPopup
  ...ProjectActions
}

fragment MetricChart on Goal {
  ...WrappedWithMetricPopup
  id
  progress {
    type
    percentage
  }
  subGoals {
    count
  }
  metricTargets {
    edges {
      node {
        ...common_metricTarget_direct
        id
      }
    }
  }
}

fragment MilestoneFields on Milestone {
  id
  title
  targetDate
  targetDateType
  status
}

fragment Milestones on Project {
  creationDate
  startDate
  milestones(first: 20) {
    edges {
      node {
        id
        status
        ...MilestoneFields
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}

fragment NewProjectUpdate on Project {
  id
  key
  uuid
  workspace {
    uuid
    id
    aiConfig {
      enabled
    }
  }
  watchers {
    count
  }
  creationDate
  startDate
  targetDate
  state {
    value
  }
  latestUserUpdate {
    editDate
    creationDate
    summary
    notes {
      title
      summary
      id
    }
    id
  }
  ...ProjectTargetDateAutoUpdated
  draftUpdate {
    ...DraftProjectUpdate
    input
    id
  }
}

fragment OnboardingSpotlightTour_2tC7yX on Query {
  currentUser(workspaceId: $workspaceId) {
    id
  }
}

fragment PlatformGoalIcon on Goal {
  icon {
    key
    appearance
  }
}

fragment ProjectAboutTab on Project {
  ...ProjectDescription
  ...ProjectComments
}

fragment ProjectActions on Project {
  id
  name
  archived
  private
}

fragment ProjectArchivedPanel on Project {
  id
  state {
    value
  }
}

fragment ProjectComments on Project {
  id
  uuid
  ari
  workspace {
    uuid
    id
  }
  comments {
    edges {
      node {
        id
      }
    }
    ...Comments
  }
}

fragment ProjectContent on Project {
  watching
  userUpdateCount
  ...ProjectAboutTab
  ...ProjectUpdatesTab
}

fragment ProjectContributors_OtPnR on Project {
  id
  name
  key
  canEditMembers
  private
  owner {
    aaid
    id
  }
  contributors {
    edges {
      node {
        __typename
        ... on User {
          aaid
          ...UserItem
        }
        ... on Team {
          id
          teamId
          name
          ...TeamAndMembersItem_OtPnR
        }
        ... on Node {
          __isNode: __typename
          id
        }
      }
    }
  }
  members {
    count
    edges {
      node {
        aaid
        id
      }
    }
  }
}

fragment ProjectDescription on Project {
  id
  uuid
  name
  theWhat
  theWhy
  theMeasurement
  workspace {
    uuid
    id
  }
}

fragment ProjectFollowButton on Project {
  id
  uuid
  watching
}

fragment ProjectHeader on Project {
  id
  name
  key
  ...ProjectKey
  ...ProjectIconPicker
  ...ProjectStateAndTargetDate
}

fragment ProjectIcon on Project {
  private
  iconUrl {
    square {
      light
      dark
      transparent
    }
  }
}

fragment ProjectIconPicker on Project {
  id
  uuid
  icon {
    id
    color
    shortName
  }
  ...ProjectIcon
}

fragment ProjectKey on Project {
  key
}

fragment ProjectLinks on LinkConnection {
  edges {
    node {
      id
      name
      url
    }
  }
}

fragment ProjectName_data on Project {
  id
  key
  name
  uuid
  ...ProjectIcon
}

fragment ProjectOwner on Project {
  id
  key
  canEditMembers
  owner {
    aaid
    pii {
      name
      picture
      accountStatus
      email
    }
    ...UserAvatar
    id
  }
}

fragment ProjectSidebar_2SVbDg on Project {
  ari
  id
  key
  ...MetaActions
  ...ProjectOwner
  ...ProjectContributors_OtPnR
  ...LinkedGoals
  ...LinkedProjects
  ...WorkTrackingLinks
  ...RelatedLinks
  ...Milestones @include(if: $areMilestonesEnabled)
  ...FollowersSidebarSection_ProjectKey
  milestoneCount: milestones {
    count
  }
  tags {
    ...Tags
  }
  customFields {
    ...SidebarFields
  }
  watchers {
    ...FollowersSidebarSection
  }
  owner {
    pii {
      ...FollowersSidebarSection_Owner
    }
    id
  }
  ...ProjectStartDate
}

fragment ProjectStartDate on Project {
  id
  startDate
  ...ProjectStartDatePicker
}

fragment ProjectStartDatePicker on Project {
  startDate
  targetDate
  targetDateSet
  creationDate
  state {
    value
  }
}

fragment ProjectState on ProjectState {
  label
  localizedLabel {
    messageId
  }
  projectStateValue: value
  atCompletionState {
    value
    label
    localizedLabel {
      messageId
    }
  }
}

fragment ProjectStateAndTargetDate on Project {
  state {
    value
    atCompletionState {
      value
    }
  }
  creationDate
  startDate
  targetDate
  targetDateConfidence
}

fragment ProjectTabs on Project {
  id
  key
  watching
  userUpdateCount
  learningsCount: learnings(first: 100, type: LEARNING) {
    edges {
      __typename
      cursor
      node {
        __typename
        id
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
  risksCount: learnings(first: 100, type: RISK) {
    edges {
      __typename
      cursor
      node {
        __typename
        id
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
  decisionsCount: learnings(first: 100, type: DECISION) {
    edges {
      __typename
      cursor
      node {
        __typename
        id
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
  ...ProjectAboutTab
  ...ProjectUpdatesTab
}

fragment ProjectTargetDateAutoUpdated on Project {
  key
  targetDate
  changelog(hasUpdateId: false) {
    count
    edges {
      node {
        newValue
        oldValue
        id
      }
    }
  }
}

fragment ProjectUpdateComposer on Project {
  ...ProjectUpdateDueDateContext
  ...NewProjectUpdate
  draftUpdate {
    ...DraftProjectUpdate
    id
  }
  id
  uuid
  workspace {
    uuid
    id
  }
}

fragment ProjectUpdateDueDateContext on Project {
  state {
    value
  }
  latestUpdateDate
}

fragment ProjectUpdatesTab on Project {
  key
  state {
    value
  }
  watching
  targetDate
  targetDateConfidence
  ...ProjectUpdateComposer
  draftUpdate {
    id
  }
}

fragment RelatedLinks on Project {
  id
  relatedLinks: links(type: RELATED) {
    ...ProjectLinks
  }
}

fragment RemoveMemberButton on User {
  id
  aaid
  pii {
    name
  }
}

fragment SelectField on TextSelectCustomField {
  ...AddOrEditButton
  id
  definition {
    __typename
    ... on TextSelectCustomFieldDefinition {
      name
      description
      canSetMultipleValues
      allowedValues {
        edges {
          node {
            id
            value
          }
        }
      }
    }
    ... on Node {
      __isNode: __typename
      id
    }
  }
  values {
    edges {
      node {
        id
        value
      }
    }
  }
}

fragment SidebarFields on CustomFieldConnection {
  edges {
    node {
      __typename
      ... on TextCustomField {
        ...FreeformTextField
      }
      ... on NumberCustomField {
        ...FreeformNumberField
      }
      ... on UserCustomField {
        ...UserField
      }
      ... on TextSelectCustomField {
        ...SelectField
      }
      ... on Node {
        __isNode: __typename
        id
      }
    }
  }
}

fragment Tag on Tag {
  ...Tag_createTagOption
}

fragment Tag_createTagOption on Tag {
  id
  name
  uuid
  description
  projectUsageCount
  goalUsageCount
  helpPointerUsageCount
  watcherCount
}

fragment Tags on TagConnection {
  edges {
    node {
      id
      uuid
      name
      ...Tag
      ...Tag_createTagOption
    }
  }
}

fragment TeamAndMembersItem_OtPnR on Team {
  ...TeamItem_OtPnR
  name
  id
  teamId
  teamDetails {
    membershipSettings
  }
  permission(cloudId: $cloudId)
  membersOfProject(key: $key) {
    edges {
      node {
        aaid
        ...UserItem
        id
      }
    }
  }
}

fragment TeamAvatar on Team {
  id
  name
  teamId
  teamDetails {
    isVerified
  }
  avatarUrl
}

fragment TeamItem_OtPnR on Team {
  id
  name
  teamId
  ...TeamAvatar
  ...TeamOptionsMenu_OtPnR
}

fragment TeamOptionsMenu_OtPnR on Team {
  id
  teamId
  name
  watching
  permission(cloudId: $cloudId)
  teamDetails {
    membershipSettings
  }
  membersOfProject(key: $key) {
    edges {
      node {
        aaid
        ...UserItem
        id
      }
    }
  }
}

fragment UserAvatar on User {
  aaid
  pii {
    picture
    name
    accountStatus
    accountId
  }
}

fragment UserAvatar_1TWJ92 on User {
  aaid
  pii {
    picture
    name
    accountStatus
    accountId
    extendedProfile {
      jobTitle
    }
  }
}

fragment UserField on UserCustomField {
  ...AddOrEditButton
  id
  definition {
    __typename
    ... on UserCustomFieldDefinition {
      name
      description
      canSetMultipleValues
    }
    ... on Node {
      __isNode: __typename
      id
    }
  }
  values {
    edges {
      node {
        id
        aaid
        ...UserAvatar_1TWJ92
      }
    }
  }
}

fragment UserItem on User {
  ...UserAvatar_1TWJ92
  ...RemoveMemberButton
}

fragment WorkTrackingLinks on Project {
  id
  uuid
  key
  ari
  workTrackingLinks: links(type: WORK_TRACKING, first: 1) {
    edges {
      node {
        id
        url
      }
    }
  }
  fusion {
    synced
  }
  workspace {
    site {
      productActivations {
        edges {
          node {
            __typename
            ... on JiraProductActivation {
              atlasForJiraCloudEnabled
            }
          }
        }
      }
    }
    id
  }
  ...GenericWorkTrackingLinks
}

fragment WrappedWithMetricPopup on Goal {
  id
  progress {
    percentage
  }
  metricTargets {
    edges {
      node {
        ...common_metricTarget_direct
        metric {
          archived
          id
        }
        id
      }
    }
  }
}

fragment common_metricTarget_direct on MetricTarget {
  startValue
  targetValue
  snapshotValue {
    value
    id
  }
  metric {
    id
    name
    type
    subType
    externalEntityId
  }
}

fragment progressBarMetricTarget on Goal {
  progress {
    type
    percentage
  }
  metricTargets {
    edges {
      node {
        snapshotValue {
          value
          id
        }
        startValue
        targetValue
        metric {
          type
          subType
          id
        }
        id
      }
    }
  }
}

fragment useRedirectToDefaultTab on Project {
  watching
  key
}

fragment utils_isUserInList on UserConnection {
  edges {
    node {
      aaid
      id
    }
  }
}
`;

  // src/graphql/projectStatusHistoryQuery.js
  var PROJECT_STATUS_HISTORY_QUERY = `
  query ProjectStatusHistoryQuery(
  $projectKey: String!
) {
  project: projectByKey(key: $projectKey) {
    latestUpdateDate
    ...ProjectHistoryBars
    id
  }
}

fragment ProjectHistoryBars on Project {
  owner {
    aaid
    id
  }
  creationDate
  startDate
  targetDate
  state {
    value
  }
  updates {
    edges {
      node {
        id
        creationDate
        missedUpdate
        updateType
        newState {
          label
          localizedLabel {
            messageId
          }
          value
        }
        newTargetDate
        newTargetDateConfidence
        oldTargetDate
        oldTargetDateConfidence
      }
    }
  }
  projectMemberships {
    edges {
      node {
        user {
          ...UserAvatar
          aaid
          id
        }
        joined
      }
    }
  }
  projectTeamLinks {
    edges {
      node {
        team {
          ...TeamAvatar
          teamId
          members {
            edges {
              node {
                aaid
              }
            }
          }
          id
        }
        creationDate
      }
    }
  }
}

fragment TeamAvatar on Team {
  id
  name
  teamId
  teamDetails {
    isVerified
  }
  avatarUrl
}

fragment UserAvatar on User {
  aaid
  pii {
    picture
    name
    accountStatus
    accountId
  }
}
`;

  // src/components/floatingButton.js
  async function fetchAndLogProjectView(projectId, cloudId) {
    const variables = {
      key: projectId,
      trackViewEvent: "DIRECT",
      workspaceId: null,
      onboardingKeyFilter: "PROJECT_SPOTLIGHT",
      areMilestonesEnabled: false,
      cloudId: cloudId || "",
      isNavRefreshEnabled: true
    };
    console.log(`[AtlasXray] Triggering Apollo GraphQL fetch for projectId: ${projectId}, cloudId: ${cloudId}, workspaceId: ${variables.workspaceId}`);
    try {
      const { data } = await apolloClient.query({
        query: gql`${PROJECT_VIEW_QUERY}`,
        variables
      });
      console.log(`[AtlasXray] Apollo GraphQL fetch successful for [ProjectViewQuery] projectId: ${projectId}`, data);
      await setProject(projectId, data);
    } catch (err) {
      console.error(`[AtlasXray] Failed to fetch project view data for projectId: ${projectId}`, err);
    }
    try {
      const { data } = await apolloClient.query({
        query: gql`${PROJECT_STATUS_HISTORY_QUERY}`,
        variables: { projectKey: projectId }
      });
      console.log(`[AtlasXray] Apollo GraphQL fetch successful for [ProjectStatusHistoryQuery] projectId: ${projectId}`, data);
      await setProject(projectId, data);
    } catch (err) {
      console.error(`[AtlasXray] Failed to fetch project view data for projectId: ${projectId}`, err);
    }
  }
  (function() {
    var button = document.createElement("button");
    button.innerText = "Atlas Xray Loaded";
    button.style.position = "fixed";
    button.style.top = "20px";
    button.style.right = "20px";
    button.style.zIndex = "9999";
    button.style.padding = "10px 18px";
    button.style.background = "#0052cc";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "6px";
    button.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.style.fontFamily = "inherit";
    document.body.appendChild(button);
    var projectLinkPattern = /\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/;
    async function saveProjectIdIfNew(projectId, cloudId) {
      const key = `projectId:${projectId}`;
      const existing = await getItem(key);
      if (!existing) {
        await setItem(key, projectId);
        fetchAndLogProjectView(projectId, cloudId);
      }
    }
    function findMatchingProjectLinks() {
      var links = Array.from(document.querySelectorAll("a[href]"));
      var matches = links.filter((link) => projectLinkPattern.test(link.getAttribute("href")));
      matches.forEach((link) => {
        var match = link.getAttribute("href").match(projectLinkPattern);
        if (match && match[3]) {
          const cloudId = match[1];
          const projectId = match[3];
          saveProjectIdIfNew(projectId, cloudId);
        }
      });
      return matches;
    }
    findMatchingProjectLinks();
    var observer = new MutationObserver(() => {
      findMatchingProjectLinks();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  })();
})();
/*! Bundled license information:

dexie/dist/dexie.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)
*/
