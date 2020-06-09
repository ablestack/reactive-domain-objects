/** */
declare function synchronizeCollection<S, T>({ sourceCollection, getTargetCollectionSize, getTargetCollectionKeys, makeRdoCollectionKeyFromSourceElement, makeItemForTargetCollection, tryGetItemFromTargetCollection, insertItemToTargetCollection, tryDeleteItemFromTargetCollection, trySyncElement, }: {
    sourceCollection: Iterable<S>;
    getTargetCollectionSize: () => number;
    getTargetCollectionKeys?: () => string[];
    makeRdoCollectionKeyFromSourceElement?: (sourceItem: S) => string;
    makeItemForTargetCollection: (s: any) => T;
    tryGetItemFromTargetCollection?: (key: string) => T | undefined;
    insertItemToTargetCollection: (key: string, value: T) => void;
    tryDeleteItemFromTargetCollection?: (key: string) => void;
    trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey }: {
        sourceElementKey: string;
        sourceElementVal: S;
        targetElementKey: string;
        targetElementVal: T;
    }) => boolean;
}): boolean;
export declare const SyncUtils: {
    synchronizeCollection: typeof synchronizeCollection;
};
export {};
