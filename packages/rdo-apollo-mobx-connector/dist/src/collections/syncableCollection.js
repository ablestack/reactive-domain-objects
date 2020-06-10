"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncableCollection = void 0;
const tslib_1 = require("tslib");
const mobx_1 = require("mobx");
const rdo_1 = require("@ablestack/rdo");
const logger_1 = require("@ablestack/rdo/infrastructure/logger");
const logger = logger_1.Logger.make('SyncableCollection');
/**
 *
 *
 * @export
 * @class SyncableCollection
 * @implements {ISyncableRDOCollection<S, D>}
 * @implements {Map<string, D>}
 * @template S
 * @template D
 * @description: A Map collection, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map in order to only trigger observable changes when necessary
 */
class SyncableCollection {
    constructor({ makeRdoCollectionKeyFromSourceElement, makeRdoCollectionKeyFromRdoElement, makeRdo, }) {
        this._array$ = new Array();
        this[Symbol.toStringTag] = '[object Map]';
        // -----------------------------------
        // ISyncableCollection
        // -----------------------------------
        this.getKeys = () => {
            return Array.from(this._map$.keys());
        };
        this.tryGetItemFromTargetCollection = (key) => {
            return this._map$.get(key);
        };
        this.insertItemToTargetCollection = (key, value) => {
            this._map$.set(key, value);
            rdo_1.CollectionUtils.Array.insertItem({ collection: this._array$, key, value });
        };
        this.updateItemInTargetCollection = (key, value) => {
            this._map$.set(key, value);
            rdo_1.CollectionUtils.Array.insertItem({ collection: this._array$, key, value });
        };
        this.tryDeleteItemFromTargetCollection = (key) => {
            const itemToDelete = this._map$.get(key);
            if (itemToDelete) {
                this._map$.delete(key);
                // Get index from array
                const indexOfItemToDelete = this.array$.indexOf(itemToDelete);
                if (indexOfItemToDelete !== -1) {
                    this.array$.splice(indexOfItemToDelete, 1);
                }
                else {
                    logger.error(`tryDeleteItemFromTargetCollection - could not find array item for key ${key}. Rebuilding array`);
                    this._array$ = Array.from(this._map$.values());
                }
                return true;
            }
            return false;
        };
        this.clear = () => {
            this._map$.clear();
            rdo_1.CollectionUtils.Array.clear({ collection: this._array$ });
        };
        this.makeRdoCollectionKeyFromSourceElement = makeRdoCollectionKeyFromSourceElement;
        this.makeRdoCollectionKeyFromRdoElement = makeRdoCollectionKeyFromRdoElement;
        this.makeRdo = makeRdo;
        this._map$ = new Map();
    }
    get size() {
        return this._map$.size;
    }
    get array$() {
        return this._array$;
    }
    // -----------------------------------
    // Map Interface
    // -----------------------------------
    delete(key) {
        return this.tryDeleteItemFromTargetCollection(key);
    }
    forEach(callbackfn, thisArg) {
        this._map$.forEach(callbackfn);
    }
    get(key) {
        return this._map$.get(key);
    }
    has(key) {
        return this._map$.has(key);
    }
    set(key, value) {
        this.insertItemToTargetCollection(key, value);
        return this;
    }
    [Symbol.iterator]() {
        return this._map$.entries();
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
}
tslib_1.__decorate([
    mobx_1.observable.shallow,
    tslib_1.__metadata("design:type", Map)
], SyncableCollection.prototype, "_map$", void 0);
tslib_1.__decorate([
    mobx_1.computed,
    tslib_1.__metadata("design:type", Number),
    tslib_1.__metadata("design:paramtypes", [])
], SyncableCollection.prototype, "size", null);
tslib_1.__decorate([
    mobx_1.observable.shallow,
    tslib_1.__metadata("design:type", Object)
], SyncableCollection.prototype, "_array$", void 0);
tslib_1.__decorate([
    mobx_1.computed,
    tslib_1.__metadata("design:type", Array),
    tslib_1.__metadata("design:paramtypes", [])
], SyncableCollection.prototype, "array$", null);
exports.SyncableCollection = SyncableCollection;
//# sourceMappingURL=syncableCollection.js.map