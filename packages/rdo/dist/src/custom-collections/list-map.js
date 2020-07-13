"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListMap = void 0;
const tslib_1 = require("tslib");
const mobx_1 = require("mobx");
const logger_1 = require("../infrastructure/logger");
const logger = logger_1.Logger.make('SyncableCollection');
/**
 *
 *
 * @export
 * @class ListMap
 * @implements {ISyncableRDOCollection<S, D>}
 * @implements {Map<K, D>}
 * @template S
 * @template D
 * @description: A readonly, syncable, Map-Array collection hybrid, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map so as to only trigger observable changes when necessary
 */
class ListMap {
    constructor({ makeCollectionKey, makeRdo, } = {}) {
        this.indexByKeyMap = new Map();
        this._array$ = new Array();
        this[Symbol.toStringTag] = 'ListMap';
        // -----------------------------------
        // ISyncableRdoCollection
        // -----------------------------------
        this.makeCollectionKey = (item) => {
            if (!this._makeCollectionKey)
                throw new Error('Could not find makeCollectionKey method');
            return this._makeCollectionKey(item);
        };
        this.handleNewKey = ({ index, key, nextRdo }) => {
            this._map$.set(key, nextRdo);
            this.indexByKeyMap.set(key, this._array$.length);
            this._array$.push(nextRdo);
            return true;
        };
        this.handleReplaceKey = ({ index, key, lastRdo, nextRdo }) => {
            this._map$.set(key, nextRdo);
            this._array$.splice(this.indexByKeyMap.get(key), 1, nextRdo);
            return true;
        };
        this.handleDeleteKey = ({ index, key, lastRdo }) => {
            this._map$.delete(key);
            this._array$.splice(this.indexByKeyMap.get(key), 1);
            this.indexByKeyMap.delete(key);
            return true;
        };
        this._makeCollectionKey = makeCollectionKey;
        this._makeRdo = makeRdo;
        this._map$ = new Map();
    }
    get size() {
        return this._map$.size;
    }
    get array$() {
        return this._array$;
    }
    // -----------------------------------
    // Readonly Map Interface
    // -----------------------------------
    forEach(callbackfn, thisArg) {
        this._map$.forEach(callbackfn);
    }
    get(key) {
        return this._map$.get(key);
    }
    has(key) {
        return this._map$.has(key);
    }
    entries() {
        return this._map$.entries();
    }
    keys() {
        return this._map$.keys();
    }
    values() {
        return this._map$.values();
    }
    [Symbol.iterator]() {
        return this._map$.entries();
    }
    elements() {
        return this._map$.values();
    }
    getItem(key) {
        return this._map$.get(key);
    }
    //------------------------------
    // RdoSyncableCollectionNW
    //------------------------------
    makeRdo(sourceItem, parentRdoNodeWrapper) {
        if (!this._makeRdo)
            return undefined;
        return this._makeRdo(sourceItem);
    }
}
tslib_1.__decorate([
    mobx_1.observable.shallow,
    tslib_1.__metadata("design:type", Map)
], ListMap.prototype, "_map$", void 0);
tslib_1.__decorate([
    mobx_1.computed,
    tslib_1.__metadata("design:type", Number),
    tslib_1.__metadata("design:paramtypes", [])
], ListMap.prototype, "size", null);
tslib_1.__decorate([
    mobx_1.observable.shallow,
    tslib_1.__metadata("design:type", Object)
], ListMap.prototype, "_array$", void 0);
tslib_1.__decorate([
    mobx_1.computed,
    tslib_1.__metadata("design:type", Array),
    tslib_1.__metadata("design:paramtypes", [])
], ListMap.prototype, "array$", null);
exports.ListMap = ListMap;
//# sourceMappingURL=list-map.js.map