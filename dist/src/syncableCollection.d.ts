import { ISyncableObject } from '.';
export declare class SyncableCollection<S extends object, K, V extends ISyncableObject<S>> {
    private _sourceCollection;
    private _getItemKey;
    private _createItem;
    private _map$;
    get size$(): number;
    get map$(): Map<K, V>;
    private _array$;
    get array$(): Array<V>;
    constructor({ getItemKey, createItem }: {
        getItemKey: (soureItem: S) => K;
        createItem: (sourceItem: S) => V;
    });
    /** */
    synchronizeState(sourceCollection: Iterable<S>): void;
}
