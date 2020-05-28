declare function patchMap<S extends object, K, V extends object>({ source, destinationMap, getItemKey, createItem, synchronizeState, areEqual, }: {
    source: Iterable<S>;
    destinationMap: Map<K, V>;
    getItemKey: (soureItem: S) => K;
    createItem: (sourceItem: S) => V;
    synchronizeState: (sourceItem: S, destinationItem: V) => void;
    areEqual: (sourceItem: S, destinationItem: V) => boolean;
}): boolean;
export declare const PatchUtils: {
    patchMap: typeof patchMap;
};
export {};
