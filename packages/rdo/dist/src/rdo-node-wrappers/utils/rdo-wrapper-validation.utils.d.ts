declare function nonKeyedCollectionSizeCheck({ sourceNodeTypePath, collectionSize, collectionType }: {
    sourceNodeTypePath: string;
    collectionSize: number;
    collectionType: string;
}): void;
export declare const RdoWrapperValidationUtils: {
    nonKeyedCollectionSizeCheck: typeof nonKeyedCollectionSizeCheck;
};
export {};
