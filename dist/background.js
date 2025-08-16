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

  // node_modules/tiny-uid/index.js
  var require_tiny_uid = __commonJS({
    "node_modules/tiny-uid/index.js"(exports, module) {
      var generator = (base) => typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" ? () => {
        const num = crypto.getRandomValues(new Uint8Array(1))[0];
        return (num >= base ? num % base : num).toString(base);
      } : () => Math.floor(Math.random() * base).toString(base);
      var uid2 = (length = 7, hex = false) => Array.from({ length }, generator(hex ? 16 : 36)).join("");
      module.exports = uid2;
      module.exports.default = uid2;
    }
  });

  // node_modules/webextension-polyfill/dist/browser-polyfill.js
  var require_browser_polyfill = __commonJS({
    "node_modules/webextension-polyfill/dist/browser-polyfill.js"(exports, module) {
      (function(global, factory) {
        if (typeof define === "function" && define.amd) {
          define("webextension-polyfill", ["module"], factory);
        } else if (typeof exports !== "undefined") {
          factory(module);
        } else {
          var mod = {
            exports: {}
          };
          factory(mod);
          global.browser = mod.exports;
        }
      })(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : exports, function(module2) {
        "use strict";
        if (typeof globalThis != "object" || typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
          throw new Error("This script should only be loaded in a browser extension.");
        }
        if (typeof globalThis.browser === "undefined" || Object.getPrototypeOf(globalThis.browser) !== Object.prototype) {
          const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
          const SEND_RESPONSE_DEPRECATION_WARNING = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)";
          const wrapAPIs = (extensionAPIs) => {
            const apiMetadata = {
              "alarms": {
                "clear": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "clearAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "get": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "bookmarks": {
                "create": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "get": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getChildren": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getRecent": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getSubTree": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getTree": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "move": {
                  "minArgs": 2,
                  "maxArgs": 2
                },
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeTree": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "search": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "update": {
                  "minArgs": 2,
                  "maxArgs": 2
                }
              },
              "browserAction": {
                "disable": {
                  "minArgs": 0,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "enable": {
                  "minArgs": 0,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "getBadgeBackgroundColor": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getBadgeText": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getPopup": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getTitle": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "openPopup": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "setBadgeBackgroundColor": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "setBadgeText": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "setIcon": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "setPopup": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "setTitle": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                }
              },
              "browsingData": {
                "remove": {
                  "minArgs": 2,
                  "maxArgs": 2
                },
                "removeCache": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeCookies": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeDownloads": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeFormData": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeHistory": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeLocalStorage": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removePasswords": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removePluginData": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "settings": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "commands": {
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "contextMenus": {
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "update": {
                  "minArgs": 2,
                  "maxArgs": 2
                }
              },
              "cookies": {
                "get": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getAll": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getAllCookieStores": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "set": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "devtools": {
                "inspectedWindow": {
                  "eval": {
                    "minArgs": 1,
                    "maxArgs": 2,
                    "singleCallbackArg": false
                  }
                },
                "panels": {
                  "create": {
                    "minArgs": 3,
                    "maxArgs": 3,
                    "singleCallbackArg": true
                  },
                  "elements": {
                    "createSidebarPane": {
                      "minArgs": 1,
                      "maxArgs": 1
                    }
                  }
                }
              },
              "downloads": {
                "cancel": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "download": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "erase": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getFileIcon": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "open": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "pause": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeFile": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "resume": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "search": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "show": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                }
              },
              "extension": {
                "isAllowedFileSchemeAccess": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "isAllowedIncognitoAccess": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "history": {
                "addUrl": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "deleteAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "deleteRange": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "deleteUrl": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getVisits": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "search": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "i18n": {
                "detectLanguage": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getAcceptLanguages": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "identity": {
                "launchWebAuthFlow": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "idle": {
                "queryState": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "management": {
                "get": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "getSelf": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "setEnabled": {
                  "minArgs": 2,
                  "maxArgs": 2
                },
                "uninstallSelf": {
                  "minArgs": 0,
                  "maxArgs": 1
                }
              },
              "notifications": {
                "clear": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "create": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "getPermissionLevel": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "update": {
                  "minArgs": 2,
                  "maxArgs": 2
                }
              },
              "pageAction": {
                "getPopup": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getTitle": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "hide": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "setIcon": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "setPopup": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "setTitle": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "show": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                }
              },
              "permissions": {
                "contains": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "request": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "runtime": {
                "getBackgroundPage": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "getPlatformInfo": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "openOptionsPage": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "requestUpdateCheck": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "sendMessage": {
                  "minArgs": 1,
                  "maxArgs": 3
                },
                "sendNativeMessage": {
                  "minArgs": 2,
                  "maxArgs": 2
                },
                "setUninstallURL": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "sessions": {
                "getDevices": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "getRecentlyClosed": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "restore": {
                  "minArgs": 0,
                  "maxArgs": 1
                }
              },
              "storage": {
                "local": {
                  "clear": {
                    "minArgs": 0,
                    "maxArgs": 0
                  },
                  "get": {
                    "minArgs": 0,
                    "maxArgs": 1
                  },
                  "getBytesInUse": {
                    "minArgs": 0,
                    "maxArgs": 1
                  },
                  "remove": {
                    "minArgs": 1,
                    "maxArgs": 1
                  },
                  "set": {
                    "minArgs": 1,
                    "maxArgs": 1
                  }
                },
                "managed": {
                  "get": {
                    "minArgs": 0,
                    "maxArgs": 1
                  },
                  "getBytesInUse": {
                    "minArgs": 0,
                    "maxArgs": 1
                  }
                },
                "sync": {
                  "clear": {
                    "minArgs": 0,
                    "maxArgs": 0
                  },
                  "get": {
                    "minArgs": 0,
                    "maxArgs": 1
                  },
                  "getBytesInUse": {
                    "minArgs": 0,
                    "maxArgs": 1
                  },
                  "remove": {
                    "minArgs": 1,
                    "maxArgs": 1
                  },
                  "set": {
                    "minArgs": 1,
                    "maxArgs": 1
                  }
                }
              },
              "tabs": {
                "captureVisibleTab": {
                  "minArgs": 0,
                  "maxArgs": 2
                },
                "create": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "detectLanguage": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "discard": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "duplicate": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "executeScript": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "get": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getCurrent": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "getZoom": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "getZoomSettings": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "goBack": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "goForward": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "highlight": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "insertCSS": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "move": {
                  "minArgs": 2,
                  "maxArgs": 2
                },
                "query": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "reload": {
                  "minArgs": 0,
                  "maxArgs": 2
                },
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeCSS": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "sendMessage": {
                  "minArgs": 2,
                  "maxArgs": 3
                },
                "setZoom": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "setZoomSettings": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "update": {
                  "minArgs": 1,
                  "maxArgs": 2
                }
              },
              "topSites": {
                "get": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "webNavigation": {
                "getAllFrames": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getFrame": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "webRequest": {
                "handlerBehaviorChanged": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "windows": {
                "create": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "get": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "getCurrent": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "getLastFocused": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "update": {
                  "minArgs": 2,
                  "maxArgs": 2
                }
              }
            };
            if (Object.keys(apiMetadata).length === 0) {
              throw new Error("api-metadata.json has not been included in browser-polyfill");
            }
            class DefaultWeakMap extends WeakMap {
              constructor(createItem, items = void 0) {
                super(items);
                this.createItem = createItem;
              }
              get(key) {
                if (!this.has(key)) {
                  this.set(key, this.createItem(key));
                }
                return super.get(key);
              }
            }
            const isThenable = (value) => {
              return value && typeof value === "object" && typeof value.then === "function";
            };
            const makeCallback = (promise, metadata) => {
              return (...callbackArgs) => {
                if (extensionAPIs.runtime.lastError) {
                  promise.reject(new Error(extensionAPIs.runtime.lastError.message));
                } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
                  promise.resolve(callbackArgs[0]);
                } else {
                  promise.resolve(callbackArgs);
                }
              };
            };
            const pluralizeArguments = (numArgs) => numArgs == 1 ? "argument" : "arguments";
            const wrapAsyncFunction = (name, metadata) => {
              return function asyncFunctionWrapper(target, ...args) {
                if (args.length < metadata.minArgs) {
                  throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
                }
                if (args.length > metadata.maxArgs) {
                  throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
                }
                return new Promise((resolve, reject) => {
                  if (metadata.fallbackToNoCallback) {
                    try {
                      target[name](...args, makeCallback({
                        resolve,
                        reject
                      }, metadata));
                    } catch (cbError) {
                      console.warn(`${name} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `, cbError);
                      target[name](...args);
                      metadata.fallbackToNoCallback = false;
                      metadata.noCallback = true;
                      resolve();
                    }
                  } else if (metadata.noCallback) {
                    target[name](...args);
                    resolve();
                  } else {
                    target[name](...args, makeCallback({
                      resolve,
                      reject
                    }, metadata));
                  }
                });
              };
            };
            const wrapMethod = (target, method, wrapper) => {
              return new Proxy(method, {
                apply(targetMethod, thisObj, args) {
                  return wrapper.call(thisObj, target, ...args);
                }
              });
            };
            let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
            const wrapObject = (target, wrappers = {}, metadata = {}) => {
              let cache = /* @__PURE__ */ Object.create(null);
              let handlers = {
                has(proxyTarget2, prop) {
                  return prop in target || prop in cache;
                },
                get(proxyTarget2, prop, receiver) {
                  if (prop in cache) {
                    return cache[prop];
                  }
                  if (!(prop in target)) {
                    return void 0;
                  }
                  let value = target[prop];
                  if (typeof value === "function") {
                    if (typeof wrappers[prop] === "function") {
                      value = wrapMethod(target, target[prop], wrappers[prop]);
                    } else if (hasOwnProperty(metadata, prop)) {
                      let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                      value = wrapMethod(target, target[prop], wrapper);
                    } else {
                      value = value.bind(target);
                    }
                  } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
                    value = wrapObject(value, wrappers[prop], metadata[prop]);
                  } else if (hasOwnProperty(metadata, "*")) {
                    value = wrapObject(value, wrappers[prop], metadata["*"]);
                  } else {
                    Object.defineProperty(cache, prop, {
                      configurable: true,
                      enumerable: true,
                      get() {
                        return target[prop];
                      },
                      set(value2) {
                        target[prop] = value2;
                      }
                    });
                    return value;
                  }
                  cache[prop] = value;
                  return value;
                },
                set(proxyTarget2, prop, value, receiver) {
                  if (prop in cache) {
                    cache[prop] = value;
                  } else {
                    target[prop] = value;
                  }
                  return true;
                },
                defineProperty(proxyTarget2, prop, desc) {
                  return Reflect.defineProperty(cache, prop, desc);
                },
                deleteProperty(proxyTarget2, prop) {
                  return Reflect.deleteProperty(cache, prop);
                }
              };
              let proxyTarget = Object.create(target);
              return new Proxy(proxyTarget, handlers);
            };
            const wrapEvent = (wrapperMap) => ({
              addListener(target, listener, ...args) {
                target.addListener(wrapperMap.get(listener), ...args);
              },
              hasListener(target, listener) {
                return target.hasListener(wrapperMap.get(listener));
              },
              removeListener(target, listener) {
                target.removeListener(wrapperMap.get(listener));
              }
            });
            const onRequestFinishedWrappers = new DefaultWeakMap((listener) => {
              if (typeof listener !== "function") {
                return listener;
              }
              return function onRequestFinished(req) {
                const wrappedReq = wrapObject(
                  req,
                  {},
                  {
                    getContent: {
                      minArgs: 0,
                      maxArgs: 0
                    }
                  }
                );
                listener(wrappedReq);
              };
            });
            let loggedSendResponseDeprecationWarning = false;
            const onMessageWrappers = new DefaultWeakMap((listener) => {
              if (typeof listener !== "function") {
                return listener;
              }
              return function onMessage2(message, sender, sendResponse) {
                let didCallSendResponse = false;
                let wrappedSendResponse;
                let sendResponsePromise = new Promise((resolve) => {
                  wrappedSendResponse = function(response) {
                    if (!loggedSendResponseDeprecationWarning) {
                      console.warn(SEND_RESPONSE_DEPRECATION_WARNING, new Error().stack);
                      loggedSendResponseDeprecationWarning = true;
                    }
                    didCallSendResponse = true;
                    resolve(response);
                  };
                });
                let result;
                try {
                  result = listener(message, sender, wrappedSendResponse);
                } catch (err) {
                  result = Promise.reject(err);
                }
                const isResultThenable = result !== true && isThenable(result);
                if (result !== true && !isResultThenable && !didCallSendResponse) {
                  return false;
                }
                const sendPromisedResult = (promise) => {
                  promise.then((msg) => {
                    sendResponse(msg);
                  }, (error) => {
                    let message2;
                    if (error && (error instanceof Error || typeof error.message === "string")) {
                      message2 = error.message;
                    } else {
                      message2 = "An unexpected error occurred";
                    }
                    sendResponse({
                      __mozWebExtensionPolyfillReject__: true,
                      message: message2
                    });
                  }).catch((err) => {
                    console.error("Failed to send onMessage rejected reply", err);
                  });
                };
                if (isResultThenable) {
                  sendPromisedResult(result);
                } else {
                  sendPromisedResult(sendResponsePromise);
                }
                return true;
              };
            });
            const wrappedSendMessageCallback = ({
              reject,
              resolve
            }, reply) => {
              if (extensionAPIs.runtime.lastError) {
                if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
                  resolve();
                } else {
                  reject(new Error(extensionAPIs.runtime.lastError.message));
                }
              } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
                reject(new Error(reply.message));
              } else {
                resolve(reply);
              }
            };
            const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
              if (args.length < metadata.minArgs) {
                throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
              }
              if (args.length > metadata.maxArgs) {
                throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
              }
              return new Promise((resolve, reject) => {
                const wrappedCb = wrappedSendMessageCallback.bind(null, {
                  resolve,
                  reject
                });
                args.push(wrappedCb);
                apiNamespaceObj.sendMessage(...args);
              });
            };
            const staticWrappers = {
              devtools: {
                network: {
                  onRequestFinished: wrapEvent(onRequestFinishedWrappers)
                }
              },
              runtime: {
                onMessage: wrapEvent(onMessageWrappers),
                onMessageExternal: wrapEvent(onMessageWrappers),
                sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
                  minArgs: 1,
                  maxArgs: 3
                })
              },
              tabs: {
                sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
                  minArgs: 2,
                  maxArgs: 3
                })
              }
            };
            const settingMetadata = {
              clear: {
                minArgs: 1,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              set: {
                minArgs: 1,
                maxArgs: 1
              }
            };
            apiMetadata.privacy = {
              network: {
                "*": settingMetadata
              },
              services: {
                "*": settingMetadata
              },
              websites: {
                "*": settingMetadata
              }
            };
            return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
          };
          module2.exports = wrapAPIs(chrome);
        } else {
          module2.exports = globalThis.browser;
        }
      });
    }
  });

  // node_modules/webext-bridge/dist/chunk-G7AOUSAZ.js
  var import_tiny_uid = __toESM(require_tiny_uid(), 1);
  var createFingerprint = () => `uid::${(0, import_tiny_uid.default)(7)}`;
  var isValidConnectionArgs = (args, requiredKeys = ["endpointName", "fingerprint"]) => typeof args === "object" && args !== null && requiredKeys.every((k) => k in args);
  var decodeConnectionArgs = (encodedArgs) => {
    try {
      const args = JSON.parse(encodedArgs);
      return isValidConnectionArgs(args) ? args : null;
    } catch (error) {
      return null;
    }
  };
  var createDeliveryLogger = () => {
    let logs = [];
    return {
      add: (...receipts) => {
        logs = [...logs, ...receipts];
      },
      remove: (message) => {
        logs = typeof message === "string" ? logs.filter((receipt) => receipt.message.transactionId !== message) : logs.filter((receipt) => !message.includes(receipt));
      },
      entries: () => logs
    };
  };
  var PortMessage = class {
    static toBackground(port, message) {
      return port.postMessage(message);
    }
    static toExtensionContext(port, message) {
      return port.postMessage(message);
    }
  };

  // node_modules/webext-bridge/dist/chunk-REMFLVJH.js
  var __defProp2 = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp2.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var ENDPOINT_RE = /^((?:background$)|devtools|popup|options|content-script|window)(?:@(\d+)(?:\.(\d+))?)?$/;
  var parseEndpoint = (endpoint) => {
    const [, context, tabId, frameId] = endpoint.match(ENDPOINT_RE) || [];
    return {
      context,
      tabId: +tabId,
      frameId: frameId ? +frameId : void 0
    };
  };
  var formatEndpoint = ({ context, tabId, frameId }) => {
    if (["background", "popup", "options"].includes(context))
      return context;
    return `${context}@${tabId}${frameId ? `.${frameId}` : ""}`;
  };

  // node_modules/webext-bridge/dist/chunk-QIZ4XBKF.js
  var import_tiny_uid2 = __toESM(require_tiny_uid(), 1);

  // node_modules/serialize-error/index.js
  var commonProperties = [
    {
      property: "name",
      enumerable: false
    },
    {
      property: "message",
      enumerable: false
    },
    {
      property: "stack",
      enumerable: false
    },
    {
      property: "code",
      enumerable: true
    }
  ];
  var toJsonWasCalled = Symbol(".toJSON was called");
  var toJSON = (from) => {
    from[toJsonWasCalled] = true;
    const json = from.toJSON();
    delete from[toJsonWasCalled];
    return json;
  };
  var destroyCircular = ({
    from,
    seen,
    to_,
    forceEnumerable,
    maxDepth,
    depth
  }) => {
    const to = to_ || (Array.isArray(from) ? [] : {});
    seen.push(from);
    if (depth >= maxDepth) {
      return to;
    }
    if (typeof from.toJSON === "function" && from[toJsonWasCalled] !== true) {
      return toJSON(from);
    }
    for (const [key, value] of Object.entries(from)) {
      if (typeof Buffer === "function" && Buffer.isBuffer(value)) {
        to[key] = "[object Buffer]";
        continue;
      }
      if (value !== null && typeof value === "object" && typeof value.pipe === "function") {
        to[key] = "[object Stream]";
        continue;
      }
      if (typeof value === "function") {
        continue;
      }
      if (!value || typeof value !== "object") {
        to[key] = value;
        continue;
      }
      if (!seen.includes(from[key])) {
        depth++;
        to[key] = destroyCircular({
          from: from[key],
          seen: [...seen],
          forceEnumerable,
          maxDepth,
          depth
        });
        continue;
      }
      to[key] = "[Circular]";
    }
    for (const { property, enumerable } of commonProperties) {
      if (typeof from[property] === "string") {
        Object.defineProperty(to, property, {
          value: from[property],
          enumerable: forceEnumerable ? true : enumerable,
          configurable: true,
          writable: true
        });
      }
    }
    return to;
  };
  function serializeError(value, options = {}) {
    const { maxDepth = Number.POSITIVE_INFINITY } = options;
    if (typeof value === "object" && value !== null) {
      return destroyCircular({
        from: value,
        seen: [],
        forceEnumerable: true,
        maxDepth,
        depth: 0
      });
    }
    if (typeof value === "function") {
      return `[Function: ${value.name || "anonymous"}]`;
    }
    return value;
  }

  // node_modules/nanoevents/index.js
  var createNanoEvents = () => ({
    events: {},
    emit(event, ...args) {
      ;
      (this.events[event] || []).forEach((i) => i(...args));
    },
    on(event, cb) {
      ;
      (this.events[event] = this.events[event] || []).push(cb);
      return () => this.events[event] = (this.events[event] || []).filter((i) => i !== cb);
    }
  });

  // node_modules/webext-bridge/dist/chunk-QIZ4XBKF.js
  var import_tiny_uid3 = __toESM(require_tiny_uid(), 1);
  var createEndpointRuntime = (thisContext, routeMessage, localMessage) => {
    const runtimeId = (0, import_tiny_uid2.default)();
    const openTransactions = /* @__PURE__ */ new Map();
    const onMessageListeners = /* @__PURE__ */ new Map();
    const handleMessage = (message) => {
      if (message.destination.context === thisContext && !message.destination.frameId && !message.destination.tabId) {
        localMessage == null ? void 0 : localMessage(message);
        const { transactionId, messageID, messageType } = message;
        const handleReply = () => {
          const transactionP = openTransactions.get(transactionId);
          if (transactionP) {
            const { err, data } = message;
            if (err) {
              const dehydratedErr = err;
              const errCtr = self[dehydratedErr.name];
              const hydratedErr = new (typeof errCtr === "function" ? errCtr : Error)(dehydratedErr.message);
              for (const prop in dehydratedErr)
                hydratedErr[prop] = dehydratedErr[prop];
              transactionP.reject(hydratedErr);
            } else {
              transactionP.resolve(data);
            }
            openTransactions.delete(transactionId);
          }
        };
        const handleNewMessage = async () => {
          let reply;
          let err;
          let noHandlerFoundError = false;
          try {
            const cb = onMessageListeners.get(messageID);
            if (typeof cb === "function") {
              reply = await cb({
                sender: message.origin,
                id: messageID,
                data: message.data,
                timestamp: message.timestamp
              });
            } else {
              noHandlerFoundError = true;
              throw new Error(`[webext-bridge] No handler registered in '${thisContext}' to accept messages with id '${messageID}'`);
            }
          } catch (error) {
            err = error;
          } finally {
            if (err)
              message.err = serializeError(err);
            handleMessage(__spreadProps(__spreadValues({}, message), {
              messageType: "reply",
              data: reply,
              origin: { context: thisContext, tabId: null },
              destination: message.origin,
              hops: []
            }));
            if (err && !noHandlerFoundError)
              throw reply;
          }
        };
        switch (messageType) {
          case "reply":
            return handleReply();
          case "message":
            return handleNewMessage();
        }
      }
      message.hops.push(`${thisContext}::${runtimeId}`);
      return routeMessage(message);
    };
    return {
      handleMessage,
      endTransaction: (transactionID) => {
        const transactionP = openTransactions.get(transactionID);
        transactionP == null ? void 0 : transactionP.reject("Transaction was ended before it could complete");
        openTransactions.delete(transactionID);
      },
      sendMessage: (messageID, data, destination = "background") => {
        const endpoint = typeof destination === "string" ? parseEndpoint(destination) : destination;
        const errFn = "Bridge#sendMessage ->";
        if (!endpoint.context) {
          throw new TypeError(`${errFn} Destination must be any one of known destinations`);
        }
        return new Promise((resolve, reject) => {
          const payload = {
            messageID,
            data,
            destination: endpoint,
            messageType: "message",
            transactionId: (0, import_tiny_uid2.default)(),
            origin: { context: thisContext, tabId: null },
            hops: [],
            timestamp: Date.now()
          };
          openTransactions.set(payload.transactionId, { resolve, reject });
          try {
            handleMessage(payload);
          } catch (error) {
            openTransactions.delete(payload.transactionId);
            reject(error);
          }
        });
      },
      onMessage: (messageID, callback) => {
        onMessageListeners.set(messageID, callback);
        return () => onMessageListeners.delete(messageID);
      }
    };
  };
  var _Stream = class {
    constructor(endpointRuntime2, streamInfo) {
      this.endpointRuntime = endpointRuntime2;
      this.streamInfo = streamInfo;
      this.emitter = createNanoEvents();
      this.isClosed = false;
      this.handleStreamClose = () => {
        if (!this.isClosed) {
          this.isClosed = true;
          this.emitter.emit("closed", true);
          this.emitter.events = {};
        }
      };
      if (!_Stream.initDone) {
        endpointRuntime2.onMessage("__crx_bridge_stream_transfer__", (msg) => {
          const { streamId, streamTransfer, action } = msg.data;
          const stream = _Stream.openStreams.get(streamId);
          if (stream && !stream.isClosed) {
            if (action === "transfer")
              stream.emitter.emit("message", streamTransfer);
            if (action === "close") {
              _Stream.openStreams.delete(streamId);
              stream.handleStreamClose();
            }
          }
        });
        _Stream.initDone = true;
      }
      _Stream.openStreams.set(this.streamInfo.streamId, this);
    }
    get info() {
      return this.streamInfo;
    }
    send(msg) {
      if (this.isClosed)
        throw new Error("Attempting to send a message over closed stream. Use stream.onClose(<callback>) to keep an eye on stream status");
      this.endpointRuntime.sendMessage("__crx_bridge_stream_transfer__", {
        streamId: this.streamInfo.streamId,
        streamTransfer: msg,
        action: "transfer"
      }, this.streamInfo.endpoint);
    }
    close(msg) {
      if (msg)
        this.send(msg);
      this.handleStreamClose();
      this.endpointRuntime.sendMessage("__crx_bridge_stream_transfer__", {
        streamId: this.streamInfo.streamId,
        streamTransfer: null,
        action: "close"
      }, this.streamInfo.endpoint);
    }
    onMessage(callback) {
      return this.getDisposable("message", callback);
    }
    onClose(callback) {
      return this.getDisposable("closed", callback);
    }
    getDisposable(event, callback) {
      const off = this.emitter.on(event, callback);
      return Object.assign(off, {
        dispose: off,
        close: off
      });
    }
  };
  var Stream = _Stream;
  Stream.initDone = false;
  Stream.openStreams = /* @__PURE__ */ new Map();
  var createStreamWirings = (endpointRuntime2) => {
    const openStreams = /* @__PURE__ */ new Map();
    const onOpenStreamCallbacks = /* @__PURE__ */ new Map();
    const streamyEmitter = createNanoEvents();
    endpointRuntime2.onMessage("__crx_bridge_stream_open__", (message) => {
      return new Promise((resolve) => {
        const { sender, data } = message;
        const { channel } = data;
        let watching = false;
        let off = () => {
        };
        const readyup = () => {
          const callback = onOpenStreamCallbacks.get(channel);
          if (typeof callback === "function") {
            callback(new Stream(endpointRuntime2, __spreadProps(__spreadValues({}, data), { endpoint: sender })));
            if (watching)
              off();
            resolve(true);
          } else if (!watching) {
            watching = true;
            off = streamyEmitter.on("did-change-stream-callbacks", readyup);
          }
        };
        readyup();
      });
    });
    async function openStream2(channel, destination) {
      if (openStreams.has(channel))
        throw new Error("webext-bridge: A Stream is already open at this channel");
      const endpoint = typeof destination === "string" ? parseEndpoint(destination) : destination;
      const streamInfo = { streamId: (0, import_tiny_uid3.default)(), channel, endpoint };
      const stream = new Stream(endpointRuntime2, streamInfo);
      stream.onClose(() => openStreams.delete(channel));
      await endpointRuntime2.sendMessage("__crx_bridge_stream_open__", streamInfo, endpoint);
      openStreams.set(channel, stream);
      return stream;
    }
    function onOpenStreamChannel2(channel, callback) {
      if (onOpenStreamCallbacks.has(channel))
        throw new Error("webext-bridge: This channel has already been claimed. Stream allows only one-on-one communication");
      onOpenStreamCallbacks.set(channel, callback);
      streamyEmitter.emit("did-change-stream-callbacks");
    }
    return {
      openStream: openStream2,
      onOpenStreamChannel: onOpenStreamChannel2
    };
  };

  // node_modules/webext-bridge/dist/background.js
  var import_webextension_polyfill = __toESM(require_browser_polyfill(), 1);
  var pendingResponses = createDeliveryLogger();
  var connMap = /* @__PURE__ */ new Map();
  var oncePortConnectedCbs = /* @__PURE__ */ new Map();
  var onceSessionEndCbs = /* @__PURE__ */ new Map();
  var oncePortConnected = (endpointName, cb) => {
    oncePortConnectedCbs.set(endpointName, (oncePortConnectedCbs.get(endpointName) || /* @__PURE__ */ new Set()).add(cb));
    return () => {
      const su = oncePortConnectedCbs.get(endpointName);
      if ((su == null ? void 0 : su.delete(cb)) && (su == null ? void 0 : su.size) === 0)
        oncePortConnectedCbs.delete(endpointName);
    };
  };
  var onceSessionEnded = (sessionFingerprint, cb) => {
    onceSessionEndCbs.set(sessionFingerprint, (onceSessionEndCbs.get(sessionFingerprint) || /* @__PURE__ */ new Set()).add(cb));
  };
  var notifyEndpoint = (endpoint) => ({
    withFingerprint: (fingerprint) => {
      const nextChain = (v) => ({ and: () => v });
      const notifications = {
        aboutIncomingMessage: (message) => {
          const recipient = connMap.get(endpoint);
          PortMessage.toExtensionContext(recipient.port, {
            status: "incoming",
            message
          });
          return nextChain(notifications);
        },
        aboutSuccessfulDelivery: (receipt) => {
          const sender = connMap.get(endpoint);
          PortMessage.toExtensionContext(sender.port, {
            status: "delivered",
            receipt
          });
          return nextChain(notifications);
        },
        aboutMessageUndeliverability: (resolvedDestination, message) => {
          const sender = connMap.get(endpoint);
          if ((sender == null ? void 0 : sender.fingerprint) === fingerprint) {
            PortMessage.toExtensionContext(sender.port, {
              status: "undeliverable",
              resolvedDestination,
              message
            });
          }
          return nextChain(notifications);
        },
        whenDeliverableTo: (targetEndpoint) => {
          const notifyDeliverability = () => {
            const origin = connMap.get(endpoint);
            if ((origin == null ? void 0 : origin.fingerprint) === fingerprint && connMap.has(targetEndpoint)) {
              PortMessage.toExtensionContext(origin.port, {
                status: "deliverable",
                deliverableTo: targetEndpoint
              });
              return true;
            }
          };
          if (!notifyDeliverability()) {
            const unsub = oncePortConnected(targetEndpoint, notifyDeliverability);
            onceSessionEnded(fingerprint, unsub);
          }
          return nextChain(notifications);
        },
        aboutSessionEnded: (endedSessionFingerprint) => {
          const conn = connMap.get(endpoint);
          if ((conn == null ? void 0 : conn.fingerprint) === fingerprint) {
            PortMessage.toExtensionContext(conn.port, {
              status: "terminated",
              fingerprint: endedSessionFingerprint
            });
          }
          return nextChain(notifications);
        }
      };
      return notifications;
    }
  });
  var sessFingerprint = createFingerprint();
  var endpointRuntime = createEndpointRuntime("background", (message) => {
    var _a;
    if (message.origin.context === "background" && ["content-script", "devtools "].includes(message.destination.context) && !message.destination.tabId) {
      throw new TypeError("When sending messages from background page, use @tabId syntax to target specific tab");
    }
    const resolvedSender = formatEndpoint(__spreadValues(__spreadValues({}, message.origin), message.origin.context === "window" && { context: "content-script" }));
    const resolvedDestination = formatEndpoint(__spreadProps(__spreadValues(__spreadValues({}, message.destination), message.destination.context === "window" && {
      context: "content-script"
    }), {
      tabId: message.destination.tabId || message.origin.tabId
    }));
    message.destination.tabId = null;
    message.destination.frameId = null;
    const dest = () => connMap.get(resolvedDestination);
    const sender = () => connMap.get(resolvedSender);
    const deliver = () => {
      var _a2;
      notifyEndpoint(resolvedDestination).withFingerprint(dest().fingerprint).aboutIncomingMessage(message);
      const receipt = {
        message,
        to: dest().fingerprint,
        from: {
          endpointId: resolvedSender,
          fingerprint: (_a2 = sender()) == null ? void 0 : _a2.fingerprint
        }
      };
      if (message.messageType === "message")
        pendingResponses.add(receipt);
      if (message.messageType === "reply")
        pendingResponses.remove(message.messageID);
      if (sender()) {
        notifyEndpoint(resolvedSender).withFingerprint(sender().fingerprint).aboutSuccessfulDelivery(receipt);
      }
    };
    if ((_a = dest()) == null ? void 0 : _a.port) {
      deliver();
    } else if (message.messageType === "message") {
      if (message.origin.context === "background") {
        oncePortConnected(resolvedDestination, deliver);
      } else if (sender()) {
        notifyEndpoint(resolvedSender).withFingerprint(sender().fingerprint).aboutMessageUndeliverability(resolvedDestination, message).and().whenDeliverableTo(resolvedDestination);
      }
    }
  }, (message) => {
    const resolvedSender = formatEndpoint(__spreadValues(__spreadValues({}, message.origin), message.origin.context === "window" && { context: "content-script" }));
    const sender = connMap.get(resolvedSender);
    const receipt = {
      message,
      to: sessFingerprint,
      from: {
        endpointId: resolvedSender,
        fingerprint: sender.fingerprint
      }
    };
    notifyEndpoint(resolvedSender).withFingerprint(sender.fingerprint).aboutSuccessfulDelivery(receipt);
  });
  import_webextension_polyfill.default.runtime.onConnect.addListener((incomingPort) => {
    var _a;
    const connArgs = decodeConnectionArgs(incomingPort.name);
    if (!connArgs)
      return;
    connArgs.endpointName || (connArgs.endpointName = formatEndpoint({
      context: "content-script",
      tabId: incomingPort.sender.tab.id,
      frameId: incomingPort.sender.frameId
    }));
    const { tabId: linkedTabId, frameId: linkedFrameId } = parseEndpoint(connArgs.endpointName);
    connMap.set(connArgs.endpointName, {
      fingerprint: connArgs.fingerprint,
      port: incomingPort
    });
    (_a = oncePortConnectedCbs.get(connArgs.endpointName)) == null ? void 0 : _a.forEach((cb) => cb());
    oncePortConnectedCbs.delete(connArgs.endpointName);
    onceSessionEnded(connArgs.fingerprint, () => {
      const rogueMsgs = pendingResponses.entries().filter((pendingMessage) => pendingMessage.to === connArgs.fingerprint);
      pendingResponses.remove(rogueMsgs);
      rogueMsgs.forEach((rogueMessage) => {
        if (rogueMessage.from.endpointId === "background") {
          endpointRuntime.endTransaction(rogueMessage.message.transactionId);
        } else {
          notifyEndpoint(rogueMessage.from.endpointId).withFingerprint(rogueMessage.from.fingerprint).aboutSessionEnded(connArgs.fingerprint);
        }
      });
    });
    incomingPort.onDisconnect.addListener(() => {
      var _a2, _b;
      if (((_a2 = connMap.get(connArgs.endpointName)) == null ? void 0 : _a2.fingerprint) === connArgs.fingerprint)
        connMap.delete(connArgs.endpointName);
      (_b = onceSessionEndCbs.get(connArgs.fingerprint)) == null ? void 0 : _b.forEach((cb) => cb());
      onceSessionEndCbs.delete(connArgs.fingerprint);
    });
    incomingPort.onMessage.addListener((msg) => {
      var _a2, _b;
      if (msg.type === "sync") {
        const allActiveSessions = [...connMap.values()].map((conn) => conn.fingerprint);
        const stillPending = msg.pendingResponses.filter((fp) => allActiveSessions.includes(fp.to));
        pendingResponses.add(...stillPending);
        msg.pendingResponses.filter((deliveryReceipt) => !allActiveSessions.includes(deliveryReceipt.to)).forEach((deliveryReceipt) => notifyEndpoint(connArgs.endpointName).withFingerprint(connArgs.fingerprint).aboutSessionEnded(deliveryReceipt.to));
        msg.pendingDeliveries.forEach((intendedDestination) => notifyEndpoint(connArgs.endpointName).withFingerprint(connArgs.fingerprint).whenDeliverableTo(intendedDestination));
        return;
      }
      if (msg.type === "deliver" && ((_b = (_a2 = msg.message) == null ? void 0 : _a2.origin) == null ? void 0 : _b.context)) {
        msg.message.origin.tabId = linkedTabId;
        msg.message.origin.frameId = linkedFrameId;
        endpointRuntime.handleMessage(msg.message);
      }
    });
  });
  var { sendMessage, onMessage } = endpointRuntime;
  var { openStream, onOpenStreamChannel } = createStreamWirings(endpointRuntime);

  // src/background.js
  console.log("[AtlasXray] Background service worker is running");
})();
