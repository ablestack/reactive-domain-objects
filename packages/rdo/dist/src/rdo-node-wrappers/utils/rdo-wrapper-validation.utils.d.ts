declare function nonKeyedCollectionSizeCheck({ sourceNodePath, collectionSize, collectionType }: {
    sourceNodePath: string;
    collectionSize: number;
    collectionType: string;
}): void;
export declare const RdoWrapperValidationUtils: {
    nonKeyedCollectionSizeCheck: typeof nonKeyedCollectionSizeCheck;
};
export {};
