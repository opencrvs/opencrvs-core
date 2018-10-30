"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'));
var DotEnv = require("dotenv");
var plugins_1 = require("src/config/plugins");
var server_1 = require("src/config/server");
var logger_1 = require("src/utils/logger");
var routes_1 = require("src/config/routes");
var constants_1 = require("src/constants");
var fs_1 = require("fs");
DotEnv.config({
    path: process.cwd() + "/.env"
});
var graphQLSchemaPath = process.cwd() + "/src/graphql/index.graphql";
var logger = logger_1.getLogger(Number(process.env.LOG_LEVEL), process.env.APP_NAME);
var publicCert = fs_1.readFileSync(constants_1.CERT_PUBLIC_KEY_PATH);
function createServer() {
    return __awaiter(this, void 0, void 0, function () {
        function start() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, server.start()];
                        case 1:
                            _a.sent();
                            server.log('info', "server started on port " + process.env.PORT);
                            return [2 /*return*/];
                    }
                });
            });
        }
        function stop() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, server.stop()];
                        case 1:
                            _a.sent();
                            server.log('info', 'server stopped');
                            return [2 /*return*/];
                    }
                });
            });
        }
        var server, plugins, routes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    server = server_1.getServer(process.env.NODE_ENV, process.env.PORT, logger);
                    plugins = plugins_1.getPlugins(process.env.NODE_ENV, graphQLSchemaPath);
                    return [4 /*yield*/, server.register(plugins)];
                case 1:
                    _a.sent();
                    server.auth.strategy('jwt', 'jwt', {
                        key: publicCert,
                        verifyOptions: {
                            algorithms: ['RS256'],
                            issuer: 'opencrvs:auth-service',
                            audience: 'opencrvs:gateway-user'
                        },
                        validate: function (payload, request) { return ({
                            isValid: true,
                            credentials: payload
                        }); }
                    });
                    server.auth["default"]('jwt');
                    routes = routes_1.getRoutes();
                    server.route(routes);
                    return [2 /*return*/, { server: server, start: start, stop: stop }];
            }
        });
    });
}
exports.createServer = createServer;
if (require.main === module) {
    createServer().then(function (server) { return server.start(); });
}
