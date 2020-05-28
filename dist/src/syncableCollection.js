"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncableCollection = void 0;
const tslib_1 = require("tslib");
const _1 = require(".");
const mobx_1 = require("mobx");
const logger = _1.Logger.make('ViewModelSyncUtils');
let SyncableCollection = /** @class */ (() => {
    class SyncableCollection {
        constructor({ getItemKey, createItem }) {
            this._getItemKey = getItemKey;
            this._createItem = createItem;
            this._map$ = new Map();
        }
        get size$() {
            return this._map$.size;
        }
        get map$() {
            return this._map$;
        }
        get array$() {
            if (!this._array$) {
                this._array$ = Array.from(this.map$.values());
            }
            return this._array$;
        }
        /** */
        synchronizeState(sourceCollection) {
            this._sourceCollection = sourceCollection;
            const changed = _1.PatchUtils.patchMap({
                source: sourceCollection,
                destinationMap: this._map$,
                getItemKey: this._getItemKey,
                createItem: this._createItem,
                areEqual: (sourceItem, destinationItem) => _1.SyncUtils.areEqual(sourceItem, destinationItem),
                synchronizeState: (sourceItem, destinationItem) => {
                    _1.SyncUtils.autoSynchronize({ rootSourceData: sourceItem, rootSyncableObject: destinationItem });
                },
            });
            if (changed) {
                this._array$ = null;
            }
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
    ], SyncableCollection.prototype, "size$", null);
    tslib_1.__decorate([
        mobx_1.computed,
        tslib_1.__metadata("design:type", Map),
        tslib_1.__metadata("design:paramtypes", [])
    ], SyncableCollection.prototype, "map$", null);
    tslib_1.__decorate([
        mobx_1.observable.shallow,
        tslib_1.__metadata("design:type", Array)
    ], SyncableCollection.prototype, "_array$", void 0);
    tslib_1.__decorate([
        mobx_1.computed,
        tslib_1.__metadata("design:type", Array),
        tslib_1.__metadata("design:paramtypes", [])
    ], SyncableCollection.prototype, "array$", null);
    tslib_1.__decorate([
        mobx_1.action,
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", void 0)
    ], SyncableCollection.prototype, "synchronizeState", null);
    return SyncableCollection;
})();
exports.SyncableCollection = SyncableCollection;
//# sourceMappingURL=syncableCollection.js.map