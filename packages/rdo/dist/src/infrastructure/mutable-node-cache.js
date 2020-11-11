"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutableNodeCache = void 0;
const logger_1 = require("./logger");
const logger = logger_1.Logger.make('MutableNodeCache');
const defaultDataKey = 'default';
class MutableNodeCache {
    constructor() {
        this._sourceMap = new Map();
    }
    set({ sourceNodeInstancePath, dataKey = defaultDataKey, data }) {
        let dataItem = this._sourceMap.get(sourceNodeInstancePath);
        if (!dataItem)
            dataItem = new Map();
        dataItem.set(dataKey, data);
        this._sourceMap.set(sourceNodeInstancePath, dataItem);
        //logger.trace('set', dataItem);
    }
    get({ sourceNodeInstancePath, dataKey = defaultDataKey }) {
        var _a;
        return (_a = this._sourceMap.get(sourceNodeInstancePath)) === null || _a === void 0 ? void 0 : _a.get(dataKey);
    }
    clear() {
        this._sourceMap.clear();
    }
}
exports.MutableNodeCache = MutableNodeCache;
//# sourceMappingURL=mutable-node-cache.js.map