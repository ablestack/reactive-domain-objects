"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutableNodeCache = void 0;
class MutableNodeCache {
    constructor() {
        this._sourceMap = new Map();
    }
    set({ sourceNodeInstancePath, data }) {
        this._sourceMap.set(sourceNodeInstancePath, data);
    }
    get({ sourceNodeInstancePath }) {
        return this._sourceMap.get(sourceNodeInstancePath);
    }
    clear() {
        this._sourceMap.clear();
    }
}
exports.MutableNodeCache = MutableNodeCache;
//# sourceMappingURL=mutable-node-cache.js.map