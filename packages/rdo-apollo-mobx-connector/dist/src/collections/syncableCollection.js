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
 * @description: A Map collection, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map so as to only trigger observable changes when necessary
 */
class SyncableCollection {
    constructor({ makeCollectionKeyFromSourceElement, makeCollectionKeyFromRdoElement, makeRdo, }) {
        this._array$ = new Array();
        this[Symbol.toStringTag] = '[object Map]';
        this.getCollectionKeys = () => {
            return Array.from(this._map$.keys());
        };
        this.getElement = (key) => {
            return this._map$.get(key);
        };
        this.insertElement = (key, value) => {
            if (!this._map$.has(key)) {
                this._map$.set(key, value);
                rdo_1.CollectionUtils.Array.insertElement({ collection: this._array$, key, value });
                return true;
            }
            else
                return false;
        };
        this.updateElement = (key, value) => {
            if (this.makeCollectionKeyFromRdoElement) {
                if (!this._map$.has(key)) {
                    this._map$.set(key, value);
                    rdo_1.CollectionUtils.Array.updateElement({ collection: this._array$, makeCollectionKey: this.makeCollectionKeyFromRdoElement, value });
                    return true;
                }
                else
                    return false;
            }
            else {
                throw new Error('makeCollectionKeyFromRdoElement element must be available for ISyncableRDOCollection update operations');
            }
        };
        this.deleteElement = (key) => {
            const itemToDelete = this._map$.get(key);
            if (itemToDelete) {
                this._map$.delete(key);
                // Get index from array
                const indexOfItemToDelete = this.array$.indexOf(itemToDelete);
                if (indexOfItemToDelete !== -1) {
                    this.array$.splice(indexOfItemToDelete, 1);
                }
                else {
                    logger.error(`tryDeleteItemFromTargetCollection - could not find array item for ISyncableRDOCollection ${key}. Rebuilding array`);
                    this._array$ = Array.from(this._map$.values());
                }
                return true;
            }
            return false;
        };
        this.clearElements = () => {
            this._map$.clear();
            return rdo_1.CollectionUtils.Array.clear({ collection: this._array$ });
        };
        this._makeCollectionKeyFromSourceElement = makeCollectionKeyFromSourceElement;
        this._makeCollectionKeyFromRdoElement = makeCollectionKeyFromRdoElement;
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
    // Map Interface
    // -----------------------------------
    delete(key) {
        return this.deleteElement(key);
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
        this.insertElement(key, value);
        return this;
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
    clear() {
        this.clearElements();
    }
    [Symbol.iterator]() {
        return this._map$.entries();
    }
    // -----------------------------------
    // ISyncableRdoCollection
    // -----------------------------------
    makeCollectionKeyFromSourceElement(item) {
        if (this._makeCollectionKeyFromSourceElement)
            return this._makeCollectionKeyFromSourceElement(item);
        else
            return undefined;
    }
    makeCollectionKeyFromRdoElement(item) {
        if (this._makeCollectionKeyFromRdoElement)
            return this._makeCollectionKeyFromRdoElement(item);
        else
            return undefined;
    }
    makeRdo(sourceItem) {
        return this._makeRdo(sourceItem);
    }
    elements() {
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