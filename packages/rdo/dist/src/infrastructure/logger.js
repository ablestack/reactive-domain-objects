"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/interface-name-prefix */
const debug_1 = tslib_1.__importDefault(require("debug"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
class DefaultLogger {
    constructor(namespace) {
        this._logger = debug_1.default(`apollo-mobx-connector.${namespace}`);
        this._appLogLevel = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : 3;
    }
    log(logLevel, msg, ...logObjects) {
        if (logLevel > this._appLogLevel)
            return;
        if (logLevel === 1)
            console.error(msg, logObjects);
        else if (logLevel === 2)
            console.warn(msg, logObjects);
        else
            console.log(msg, logObjects);
        // Debug logger not working. Need to debug at some point. Falling back to console.log
        //if (logObjects) this._logger(msg, ...logObjects);
        //else this._logger(msg);
    }
    error(msg, ...logObjects) {
        this.log(1, `ERROR!!!: ${msg}`, logObjects);
    }
    warn(msg, ...logObjects) {
        this.log(2, `WARN!: ${msg}`, logObjects);
    }
    info(msg, ...logObjects) {
        this.log(3, `Info: ${msg}`, logObjects);
    }
    debug(msg, ...logObjects) {
        this.log(4, `Debug: ${msg}`, logObjects);
    }
    trace(msg, ...logObjects) {
        this.log(5, `Trace: ${msg}`, logObjects);
    }
}
let make = (namespace) => {
    return new DefaultLogger(namespace);
};
function setLoggerFactory(loggerFactory) {
    make = loggerFactory;
}
exports.Logger = { make, setLoggerFactory };
//# sourceMappingURL=logger.js.map