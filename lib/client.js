"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LibreLinkUpClient = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _axios = _interopRequireDefault(require("axios"));

var _utils = require("./utils");

var LIBRE_LINK_SERVER = 'https://api-us.libreview.io';
var urlMap = {
  login: '/llu/auth/login',
  connections: '/llu/connections',
  countries: '/llu/config/country?country=DE'
};

var LibreLinkUpClient = function LibreLinkUpClient(_ref) {
  var username = _ref.username,
      password = _ref.password,
      connectionIdentifier = _ref.connectionIdentifier;
  var jwtToken = null;
  var connectionId = null;

  var instance = _axios["default"].create({
    baseURL: LIBRE_LINK_SERVER,
    headers: {
      'accept-encoding': 'gzip',
      'cache-control': 'no-cache',
      connection: 'Keep-Alive',
      'content-type': 'application/json',
      product: 'llu.android',
      version: '4.7.0'
    }
  });

  instance.interceptors.request.use(function (config) {
    if (jwtToken && config.headers) {
      // eslint-disable-next-line no-param-reassign
      config.headers.authorization = "Bearer ".concat(jwtToken);
    }

    return config;
  }, function (e) {
    return e;
  }, {
    synchronous: true
  });

  var login = /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var loginResponse, redirectResponse, countryNodes, targetRegion, regionDefinition;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return instance.post(urlMap.login, {
                email: username,
                password: password
              });

            case 2:
              loginResponse = _context.sent;

              if (!(loginResponse.data.status === 2)) {
                _context.next = 5;
                break;
              }

              throw new Error('Bad credentials. Please ensure that you have entered the credentials of your LibreLinkUp account (and not of your LibreLink account).');

            case 5:
              if (!loginResponse.data.data.redirect) {
                _context.next = 16;
                break;
              }

              redirectResponse = loginResponse.data;
              _context.next = 9;
              return instance.get(urlMap.countries);

            case 9:
              countryNodes = _context.sent;
              targetRegion = redirectResponse.data.region;
              regionDefinition = countryNodes.data.data.regionalMap[targetRegion];

              if (regionDefinition) {
                _context.next = 14;
                break;
              }

              throw new Error("Unable to find region '".concat(redirectResponse.data.region, "'. \n          Available nodes are ").concat(Object.keys(countryNodes.data.data.regionalMap).join(', '), "."));

            case 14:
              instance.defaults.baseURL = regionDefinition.lslApi;
              return _context.abrupt("return", login());

            case 16:
              jwtToken = loginResponse.data.data.authTicket.token;
              return _context.abrupt("return", loginResponse.data);

            case 18:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function login() {
      return _ref2.apply(this, arguments);
    };
  }();

  var loginWrapper = function loginWrapper(func) {
    return /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;

              if (jwtToken) {
                _context2.next = 4;
                break;
              }

              _context2.next = 4;
              return login();

            case 4:
              return _context2.abrupt("return", func());

            case 7:
              _context2.prev = 7;
              _context2.t0 = _context2["catch"](0);
              _context2.next = 11;
              return login();

            case 11:
              return _context2.abrupt("return", func());

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 7]]);
    }));
  };

  var getConnections = loginWrapper( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
    var response;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return instance.get(urlMap.connections);

          case 2:
            response = _context3.sent;
            return _context3.abrupt("return", response.data);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  })));

  var getConnection = function getConnection(connections) {
    if (typeof connectionIdentifier === 'string') {
      var match = connections.find(function (_ref5) {
        var firstName = _ref5.firstName,
            lastName = _ref5.lastName;
        return "".concat(firstName, " ").concat(lastName).toLowerCase() === connectionIdentifier.toLowerCase();
      });

      if (!match) {
        throw new Error("Unable to identify connection by given name '".concat(connectionIdentifier, "'."));
      }

      return match.patientId;
    }

    if (typeof connectionIdentifier === 'function') {
      var _match = connectionIdentifier.call(null, connections);

      if (!_match) {
        throw new Error("Unable to identify connection by given name function");
      }

      return _match;
    }

    return connections[0].patientId;
  };

  var readRaw = loginWrapper( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
    var _connections, response;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (connectionId) {
              _context4.next = 5;
              break;
            }

            _context4.next = 3;
            return getConnections();

          case 3:
            _connections = _context4.sent;
            connectionId = getConnection(_connections.data);

          case 5:
            _context4.next = 7;
            return instance.get("".concat(urlMap.connections, "/").concat(connectionId, "/graph"));

          case 7:
            response = _context4.sent;
            return _context4.abrupt("return", response.data.data);

          case 9:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  })));

  var read = /*#__PURE__*/function () {
    var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
      var response;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return readRaw();

            case 2:
              response = _context5.sent;
              return _context5.abrupt("return", {
                current: (0, _utils.mapData)(response.connection.glucoseMeasurement),
                history: response.graphData.map(_utils.mapData)
              });

            case 4:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function read() {
      return _ref7.apply(this, arguments);
    };
  }();

  var observe = /*#__PURE__*/function () {
    var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function observe() {
      return _ref8.apply(this, arguments);
    };
  }();

  var averageInterval;

  var readAveraged = /*#__PURE__*/function () {
    var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(amount, callback) {
      var interval,
          mem,
          _args8 = arguments;
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              interval = _args8.length > 2 && _args8[2] !== undefined ? _args8[2] : 15000;
              mem = new Map();
              averageInterval = setInterval( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
                var _yield$read, current, history, memValues, averageValue, averageTrend;

                return _regenerator["default"].wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        _context7.next = 2;
                        return read();

                      case 2:
                        _yield$read = _context7.sent;
                        current = _yield$read.current;
                        history = _yield$read.history;
                        mem.set(current.date.toString(), current);

                        if (mem.size === amount) {
                          memValues = Array.from(mem.values());
                          averageValue = Math.round(memValues.reduce(function (acc, cur) {
                            return acc + cur.value;
                          }, 0) / amount);
                          averageTrend = _utils.trendMap[parseInt((Math.round(memValues.reduce(function (acc, cur) {
                            return acc + _utils.trendMap.indexOf(cur.trend);
                          }, 0) / amount * 100) / 100).toFixed(0), 10)];
                          mem = new Map();
                          callback.apply(null, [{
                            trend: averageTrend,
                            value: averageValue,
                            date: current.date,
                            isHigh: current.isHigh,
                            isLow: current.isLow
                          }, memValues, history]);
                        }

                      case 7:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7);
              })), interval);
              return _context8.abrupt("return", function () {
                return clearInterval(averageInterval);
              });

            case 4:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));

    return function readAveraged(_x, _x2) {
      return _ref9.apply(this, arguments);
    };
  }();

  return {
    observe: observe,
    readRaw: readRaw,
    read: read,
    readAveraged: readAveraged,
    login: login
  };
};

exports.LibreLinkUpClient = LibreLinkUpClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMSUJSRV9MSU5LX1NFUlZFUiIsInVybE1hcCIsImxvZ2luIiwiY29ubmVjdGlvbnMiLCJjb3VudHJpZXMiLCJMaWJyZUxpbmtVcENsaWVudCIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJjb25uZWN0aW9uSWRlbnRpZmllciIsImp3dFRva2VuIiwiY29ubmVjdGlvbklkIiwiaW5zdGFuY2UiLCJheGlvcyIsImNyZWF0ZSIsImJhc2VVUkwiLCJoZWFkZXJzIiwiY29ubmVjdGlvbiIsInByb2R1Y3QiLCJ2ZXJzaW9uIiwiaW50ZXJjZXB0b3JzIiwicmVxdWVzdCIsInVzZSIsImNvbmZpZyIsImF1dGhvcml6YXRpb24iLCJlIiwic3luY2hyb25vdXMiLCJwb3N0IiwiZW1haWwiLCJsb2dpblJlc3BvbnNlIiwiZGF0YSIsInN0YXR1cyIsIkVycm9yIiwicmVkaXJlY3QiLCJyZWRpcmVjdFJlc3BvbnNlIiwiZ2V0IiwiY291bnRyeU5vZGVzIiwidGFyZ2V0UmVnaW9uIiwicmVnaW9uIiwicmVnaW9uRGVmaW5pdGlvbiIsInJlZ2lvbmFsTWFwIiwiT2JqZWN0Iiwia2V5cyIsImpvaW4iLCJkZWZhdWx0cyIsImxzbEFwaSIsImF1dGhUaWNrZXQiLCJ0b2tlbiIsImxvZ2luV3JhcHBlciIsImZ1bmMiLCJnZXRDb25uZWN0aW9ucyIsInJlc3BvbnNlIiwiZ2V0Q29ubmVjdGlvbiIsIm1hdGNoIiwiZmluZCIsImZpcnN0TmFtZSIsImxhc3ROYW1lIiwidG9Mb3dlckNhc2UiLCJwYXRpZW50SWQiLCJjYWxsIiwicmVhZFJhdyIsInJlYWQiLCJjdXJyZW50IiwibWFwRGF0YSIsImdsdWNvc2VNZWFzdXJlbWVudCIsImhpc3RvcnkiLCJncmFwaERhdGEiLCJtYXAiLCJvYnNlcnZlIiwiYXZlcmFnZUludGVydmFsIiwicmVhZEF2ZXJhZ2VkIiwiYW1vdW50IiwiY2FsbGJhY2siLCJpbnRlcnZhbCIsIm1lbSIsIk1hcCIsInNldEludGVydmFsIiwic2V0IiwiZGF0ZSIsInRvU3RyaW5nIiwic2l6ZSIsIm1lbVZhbHVlcyIsIkFycmF5IiwiZnJvbSIsInZhbHVlcyIsImF2ZXJhZ2VWYWx1ZSIsIk1hdGgiLCJyb3VuZCIsInJlZHVjZSIsImFjYyIsImN1ciIsInZhbHVlIiwiYXZlcmFnZVRyZW5kIiwidHJlbmRNYXAiLCJwYXJzZUludCIsImluZGV4T2YiLCJ0cmVuZCIsInRvRml4ZWQiLCJhcHBseSIsImlzSGlnaCIsImlzTG93IiwiY2xlYXJJbnRlcnZhbCJdLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IExpYnJlQ2dtRGF0YSB9IGZyb20gJy4vdHlwZXMvY2xpZW50JztcbmltcG9ydCB7IEFjdGl2ZVNlbnNvciwgQ29ubmVjdGlvbiwgR2x1Y29zZUl0ZW0gfSBmcm9tICcuL3R5cGVzL2Nvbm5lY3Rpb24nO1xuaW1wb3J0IHsgQ29ubmVjdGlvbnNSZXNwb25zZSwgRGF0dW0gfSBmcm9tICcuL3R5cGVzL2Nvbm5lY3Rpb25zJztcbmltcG9ydCB7IENvdW50cnlSZXNwb25zZSwgQUUsIFJlZ2lvbmFsTWFwIH0gZnJvbSAnLi90eXBlcy9jb3VudHJpZXMnO1xuaW1wb3J0IHsgR3JhcGhEYXRhIH0gZnJvbSAnLi90eXBlcy9ncmFwaCc7XG5pbXBvcnQgeyBMb2dpblJlc3BvbnNlLCBMb2dpblJlZGlyZWN0UmVzcG9uc2UgfSBmcm9tICcuL3R5cGVzL2xvZ2luJztcbmltcG9ydCB7IG1hcERhdGEsIHRyZW5kTWFwIH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IExJQlJFX0xJTktfU0VSVkVSID0gJ2h0dHBzOi8vYXBpLXVzLmxpYnJldmlldy5pbyc7XG5cbnR5cGUgQ2xpZW50QXJncyA9IHtcbiAgdXNlcm5hbWU6IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbiAgY29ubmVjdGlvbklkZW50aWZpZXI/OiBzdHJpbmcgfCAoKGNvbm5lY3Rpb25zOiBEYXR1bVtdKSA9PiBzdHJpbmcpO1xufTtcblxudHlwZSBSZWFkUmF3UmVzcG9uc2UgPSB7XG4gIGNvbm5lY3Rpb246IENvbm5lY3Rpb247XG4gIGFjdGl2ZVNlbnNvcnM6IEFjdGl2ZVNlbnNvcltdO1xuICBncmFwaERhdGE6IEdsdWNvc2VJdGVtW107XG59O1xuXG50eXBlIFJlYWRSZXNwb25zZSA9IHtcbiAgY3VycmVudDogTGlicmVDZ21EYXRhO1xuICBoaXN0b3J5OiBMaWJyZUNnbURhdGFbXTtcbn07XG5cbmNvbnN0IHVybE1hcCA9IHtcbiAgbG9naW46ICcvbGx1L2F1dGgvbG9naW4nLFxuICBjb25uZWN0aW9uczogJy9sbHUvY29ubmVjdGlvbnMnLFxuICBjb3VudHJpZXM6ICcvbGx1L2NvbmZpZy9jb3VudHJ5P2NvdW50cnk9REUnLFxufTtcblxuZXhwb3J0IGNvbnN0IExpYnJlTGlua1VwQ2xpZW50ID0gKHtcbiAgdXNlcm5hbWUsXG4gIHBhc3N3b3JkLFxuICBjb25uZWN0aW9uSWRlbnRpZmllcixcbn06IENsaWVudEFyZ3MpID0+IHtcbiAgbGV0IGp3dFRva2VuOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgbGV0IGNvbm5lY3Rpb25JZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3QgaW5zdGFuY2UgPSBheGlvcy5jcmVhdGUoe1xuICAgIGJhc2VVUkw6IExJQlJFX0xJTktfU0VSVkVSLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdhY2NlcHQtZW5jb2RpbmcnOiAnZ3ppcCcsXG4gICAgICAnY2FjaGUtY29udHJvbCc6ICduby1jYWNoZScsXG4gICAgICBjb25uZWN0aW9uOiAnS2VlcC1BbGl2ZScsXG4gICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgcHJvZHVjdDogJ2xsdS5hbmRyb2lkJyxcbiAgICAgIHZlcnNpb246ICc0LjcuMCcsXG4gICAgfSxcbiAgfSk7XG4gIGluc3RhbmNlLmludGVyY2VwdG9ycy5yZXF1ZXN0LnVzZShcbiAgICBjb25maWcgPT4ge1xuICAgICAgaWYgKGp3dFRva2VuICYmIGNvbmZpZy5oZWFkZXJzKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgICBjb25maWcuaGVhZGVycy5hdXRob3JpemF0aW9uID0gYEJlYXJlciAke2p3dFRva2VufWA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb25maWc7XG4gICAgfSxcbiAgICBlID0+IGUsXG4gICAgeyBzeW5jaHJvbm91czogdHJ1ZSB9XG4gICk7XG5cbiAgY29uc3QgbG9naW4gPSBhc3luYyAoKTogUHJvbWlzZTxMb2dpblJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgbG9naW5SZXNwb25zZSA9IGF3YWl0IGluc3RhbmNlLnBvc3Q8XG4gICAgICBMb2dpblJlc3BvbnNlIHwgTG9naW5SZWRpcmVjdFJlc3BvbnNlXG4gICAgPih1cmxNYXAubG9naW4sIHtcbiAgICAgIGVtYWlsOiB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgIH0pO1xuXG4gICAgaWYgKGxvZ2luUmVzcG9uc2UuZGF0YS5zdGF0dXMgPT09IDIpIHRocm93IG5ldyBFcnJvcignQmFkIGNyZWRlbnRpYWxzLiBQbGVhc2UgZW5zdXJlIHRoYXQgeW91IGhhdmUgZW50ZXJlZCB0aGUgY3JlZGVudGlhbHMgb2YgeW91ciBMaWJyZUxpbmtVcCBhY2NvdW50IChhbmQgbm90IG9mIHlvdXIgTGlicmVMaW5rIGFjY291bnQpLicpO1xuXG4gICAgaWYgKChsb2dpblJlc3BvbnNlLmRhdGEgYXMgTG9naW5SZWRpcmVjdFJlc3BvbnNlKS5kYXRhLnJlZGlyZWN0KSB7XG4gICAgICBjb25zdCByZWRpcmVjdFJlc3BvbnNlID0gbG9naW5SZXNwb25zZS5kYXRhIGFzIExvZ2luUmVkaXJlY3RSZXNwb25zZTtcbiAgICAgIGNvbnN0IGNvdW50cnlOb2RlcyA9IGF3YWl0IGluc3RhbmNlLmdldDxDb3VudHJ5UmVzcG9uc2U+KFxuICAgICAgICB1cmxNYXAuY291bnRyaWVzXG4gICAgICApO1xuICAgICAgY29uc3QgdGFyZ2V0UmVnaW9uID0gcmVkaXJlY3RSZXNwb25zZS5kYXRhLnJlZ2lvbiBhcyBrZXlvZiBSZWdpb25hbE1hcDtcbiAgICAgIGNvbnN0IHJlZ2lvbkRlZmluaXRpb246IEFFIHwgdW5kZWZpbmVkID1cbiAgICAgICAgY291bnRyeU5vZGVzLmRhdGEuZGF0YS5yZWdpb25hbE1hcFt0YXJnZXRSZWdpb25dO1xuXG4gICAgICBpZiAoIXJlZ2lvbkRlZmluaXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gZmluZCByZWdpb24gJyR7cmVkaXJlY3RSZXNwb25zZS5kYXRhLnJlZ2lvbn0nLiBcbiAgICAgICAgICBBdmFpbGFibGUgbm9kZXMgYXJlICR7T2JqZWN0LmtleXMoXG4gICAgICAgICAgICBjb3VudHJ5Tm9kZXMuZGF0YS5kYXRhLnJlZ2lvbmFsTWFwXG4gICAgICAgICAgKS5qb2luKCcsICcpfS5gXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGluc3RhbmNlLmRlZmF1bHRzLmJhc2VVUkwgPSByZWdpb25EZWZpbml0aW9uLmxzbEFwaTtcbiAgICAgIHJldHVybiBsb2dpbigpO1xuICAgIH1cbiAgICBqd3RUb2tlbiA9IChsb2dpblJlc3BvbnNlLmRhdGEgYXMgTG9naW5SZXNwb25zZSkuZGF0YS5hdXRoVGlja2V0LnRva2VuO1xuXG4gICAgcmV0dXJuIGxvZ2luUmVzcG9uc2UuZGF0YSBhcyBMb2dpblJlc3BvbnNlO1xuICB9O1xuXG4gIGNvbnN0IGxvZ2luV3JhcHBlciA9XG4gICAgPFJldHVybj4oZnVuYzogKCkgPT4gUHJvbWlzZTxSZXR1cm4+KSA9PlxuICAgIGFzeW5jICgpOiBQcm9taXNlPFJldHVybj4gPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFqd3RUb2tlbikgYXdhaXQgbG9naW4oKTtcbiAgICAgICAgcmV0dXJuIGZ1bmMoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgYXdhaXQgbG9naW4oKTtcbiAgICAgICAgcmV0dXJuIGZ1bmMoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gIGNvbnN0IGdldENvbm5lY3Rpb25zID0gbG9naW5XcmFwcGVyPENvbm5lY3Rpb25zUmVzcG9uc2U+KGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGluc3RhbmNlLmdldDxDb25uZWN0aW9uc1Jlc3BvbnNlPihcbiAgICAgIHVybE1hcC5jb25uZWN0aW9uc1xuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgfSk7XG5cbiAgY29uc3QgZ2V0Q29ubmVjdGlvbiA9IChjb25uZWN0aW9uczogRGF0dW1bXSk6IHN0cmluZyA9PiB7XG4gICAgaWYgKHR5cGVvZiBjb25uZWN0aW9uSWRlbnRpZmllciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gY29ubmVjdGlvbnMuZmluZChcbiAgICAgICAgKHsgZmlyc3ROYW1lLCBsYXN0TmFtZSB9KSA9PlxuICAgICAgICAgIGAke2ZpcnN0TmFtZX0gJHtsYXN0TmFtZX1gLnRvTG93ZXJDYXNlKCkgPT09XG4gICAgICAgICAgY29ubmVjdGlvbklkZW50aWZpZXIudG9Mb3dlckNhc2UoKVxuICAgICAgKTtcblxuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBpZGVudGlmeSBjb25uZWN0aW9uIGJ5IGdpdmVuIG5hbWUgJyR7Y29ubmVjdGlvbklkZW50aWZpZXJ9Jy5gXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtYXRjaC5wYXRpZW50SWQ7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29ubmVjdGlvbklkZW50aWZpZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gY29ubmVjdGlvbklkZW50aWZpZXIuY2FsbChudWxsLCBjb25uZWN0aW9ucyk7XG5cbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gaWRlbnRpZnkgY29ubmVjdGlvbiBieSBnaXZlbiBuYW1lIGZ1bmN0aW9uYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9XG5cbiAgICByZXR1cm4gY29ubmVjdGlvbnNbMF0ucGF0aWVudElkO1xuICB9O1xuXG4gIGNvbnN0IHJlYWRSYXcgPSBsb2dpbldyYXBwZXI8UmVhZFJhd1Jlc3BvbnNlPihhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFjb25uZWN0aW9uSWQpIHtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb25zID0gYXdhaXQgZ2V0Q29ubmVjdGlvbnMoKTtcblxuICAgICAgY29ubmVjdGlvbklkID0gZ2V0Q29ubmVjdGlvbihjb25uZWN0aW9ucy5kYXRhKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGluc3RhbmNlLmdldDxHcmFwaERhdGE+KFxuICAgICAgYCR7dXJsTWFwLmNvbm5lY3Rpb25zfS8ke2Nvbm5lY3Rpb25JZH0vZ3JhcGhgXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLmRhdGE7XG4gIH0pO1xuXG4gIGNvbnN0IHJlYWQgPSBhc3luYyAoKTogUHJvbWlzZTxSZWFkUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlYWRSYXcoKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjdXJyZW50OiBtYXBEYXRhKHJlc3BvbnNlLmNvbm5lY3Rpb24uZ2x1Y29zZU1lYXN1cmVtZW50KSxcbiAgICAgIGhpc3Rvcnk6IHJlc3BvbnNlLmdyYXBoRGF0YS5tYXAobWFwRGF0YSksXG4gICAgfTtcbiAgfTtcblxuICBjb25zdCBvYnNlcnZlID0gYXN5bmMgKCkgPT4ge1xuICAgIC8vIEB0b2RvXG4gIH07XG5cbiAgbGV0IGF2ZXJhZ2VJbnRlcnZhbDogTm9kZUpTLlRpbWVyO1xuICBjb25zdCByZWFkQXZlcmFnZWQgPSBhc3luYyAoXG4gICAgYW1vdW50OiBudW1iZXIsXG4gICAgY2FsbGJhY2s6IChcbiAgICAgIGF2ZXJhZ2U6IExpYnJlQ2dtRGF0YSxcbiAgICAgIG1lbW9yeTogTGlicmVDZ21EYXRhW10sXG4gICAgICBoaXN0b3J5OiBMaWJyZUNnbURhdGFbXVxuICAgICkgPT4gdm9pZCxcbiAgICBpbnRlcnZhbCA9IDE1MDAwXG4gICkgPT4ge1xuICAgIGxldCBtZW06IE1hcDxzdHJpbmcsIExpYnJlQ2dtRGF0YT4gPSBuZXcgTWFwKCk7XG5cbiAgICBhdmVyYWdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB7IGN1cnJlbnQsIGhpc3RvcnkgfSA9IGF3YWl0IHJlYWQoKTtcbiAgICAgIG1lbS5zZXQoY3VycmVudC5kYXRlLnRvU3RyaW5nKCksIGN1cnJlbnQpO1xuXG4gICAgICBpZiAobWVtLnNpemUgPT09IGFtb3VudCkge1xuICAgICAgICBjb25zdCBtZW1WYWx1ZXMgPSBBcnJheS5mcm9tKG1lbS52YWx1ZXMoKSk7XG4gICAgICAgIGNvbnN0IGF2ZXJhZ2VWYWx1ZSA9IE1hdGgucm91bmQoXG4gICAgICAgICAgbWVtVmFsdWVzLnJlZHVjZSgoYWNjLCBjdXIpID0+IGFjYyArIGN1ci52YWx1ZSwgMCkgLyBhbW91bnRcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgYXZlcmFnZVRyZW5kID1cbiAgICAgICAgICB0cmVuZE1hcFtcbiAgICAgICAgICAgIHBhcnNlSW50KFxuICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgTWF0aC5yb3VuZChcbiAgICAgICAgICAgICAgICAgIChtZW1WYWx1ZXMucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAoYWNjLCBjdXIpID0+IGFjYyArIHRyZW5kTWFwLmluZGV4T2YoY3VyLnRyZW5kKSxcbiAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgKSAvXG4gICAgICAgICAgICAgICAgICAgIGFtb3VudCkgKlxuICAgICAgICAgICAgICAgICAgICAxMDBcbiAgICAgICAgICAgICAgICApIC8gMTAwXG4gICAgICAgICAgICAgICkudG9GaXhlZCgwKSxcbiAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgIClcbiAgICAgICAgICBdO1xuXG4gICAgICAgIG1lbSA9IG5ldyBNYXAoKTtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRyZW5kOiBhdmVyYWdlVHJlbmQsXG4gICAgICAgICAgICB2YWx1ZTogYXZlcmFnZVZhbHVlLFxuICAgICAgICAgICAgZGF0ZTogY3VycmVudC5kYXRlLFxuICAgICAgICAgICAgaXNIaWdoOiBjdXJyZW50LmlzSGlnaCxcbiAgICAgICAgICAgIGlzTG93OiBjdXJyZW50LmlzTG93LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbWVtVmFsdWVzLFxuICAgICAgICAgIGhpc3RvcnksXG4gICAgICAgIF0pO1xuICAgICAgfVxuICAgIH0sIGludGVydmFsKTtcblxuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGF2ZXJhZ2VJbnRlcnZhbCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBvYnNlcnZlLFxuICAgIHJlYWRSYXcsXG4gICAgcmVhZCxcbiAgICByZWFkQXZlcmFnZWQsXG4gICAgbG9naW4sXG4gIH07XG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7O0FBT0E7O0FBRUEsSUFBTUEsaUJBQWlCLEdBQUcsNkJBQTFCO0FBbUJBLElBQU1DLE1BQU0sR0FBRztFQUNiQyxLQUFLLEVBQUUsaUJBRE07RUFFYkMsV0FBVyxFQUFFLGtCQUZBO0VBR2JDLFNBQVMsRUFBRTtBQUhFLENBQWY7O0FBTU8sSUFBTUMsaUJBQWlCLEdBQUcsU0FBcEJBLGlCQUFvQixPQUlmO0VBQUEsSUFIaEJDLFFBR2dCLFFBSGhCQSxRQUdnQjtFQUFBLElBRmhCQyxR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