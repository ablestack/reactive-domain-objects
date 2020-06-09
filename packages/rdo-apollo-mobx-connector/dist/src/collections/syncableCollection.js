"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncableCollection = void 0;
const tslib_1 = require("tslib");
const mobx_1 = require("mobx");
const rdo_1 = require("@ablestack/rdo");
const logger_1 = require("@ablestack/rdo/infrastructure/logger");
const logger = logger_1.Logger.make('SyncableCollection');
class SyncableCollection {
    constructor({ makeRdoCollectionKeyFromSourceElement, makeRdoCollectionKeyFromRdoElement, makeRdo, }) {
        this._array$ = new Array();
        // -----------------------------------
        // IRdoFactory
        // -----------------------------------
        this.makeRdoCollectionKeyFromSourceElement = (sourceNode) => {
            return this._makeRdoCollectionKeyFromSourceElement(sourceNode);
        };
        this.makeRdoCollectionKeyFromRdoElement = (rdo) => {
            return this._makeRdoCollectionKeyFromRdoElement(rdo);
        };
        this.makeRdo = (sourceItem) => {
            return this._makeRdo(sourceItem);
        };
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
            this._map$.delete(key);
            rdo_1.CollectionUtils.Array.deleteItem({ collection: this._array$, key, makeCollectionKey: this._makeRdoCollectionKeyFromRdoElement });
        };
        this.clear = () => {
            this._map$.clear();
            rdo_1.CollectionUtils.Array.clear({ collection: this._array$ });
        };
        this._makeRdoCollectionKeyFromSourceElement = makeRdoCollectionKeyFromSourceElement;
        this._makeRdoCollectionKeyFromRdoElement = makeRdoCollectionKeyFromRdoElement;
        this._makeRdo = makeRdo;
        this._map$ = new Map();
    }
    get size() {
        return this._map$.size;
    }
    get map$() {
        return this._map$;
    }
    get array$() {
        return this._array$;
    }
    [Symbol.iterator]() {
        return this.array$[Symbol.iterator]();
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
    mobx_1.computed,
    tslib_1.__metadata("design:type", Map),
    tslib_1.__metadata("design:paramtypes", [])
], SyncableCollection.prototype, "map$", null);
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