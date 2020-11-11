declare function isIterable(obj: any): boolean;
export declare const CollectionUtils: {
    Array: {
        clear: <T>({ collection }: {
            collection: T[];
        }) => boolean;
    };
    Record: {
        deleteElement: <T_1>({ record, key }: {
            record: Record<string, T_1>;
            key: string;
        }) => T_1 | undefined;
    };
    isIterable: typeof isIterable;
};
export {};
