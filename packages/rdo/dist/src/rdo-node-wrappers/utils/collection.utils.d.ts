import { IMakeCollectionKeyMethod } from '../..';
declare function isIterable(obj: any): boolean;
export declare const CollectionUtils: {
    Array: {
        getCollectionKeys: <T>({ collection, makeElementKey }: {
            collection: T[];
            makeElementKey: IMakeCollectionKeyMethod<T>;
        }) => string[];
        getElement: <T_1>({ collection, makeElementKey, key }: {
            collection: T_1[];
            makeElementKey: IMakeCollectionKeyMethod<T_1>;
            key: string;
        }) => T_1 | undefined;
        insertElement: <T_2>({ collection, key, value }: {
            collection: T_2[];
            key: string;
            value: T_2;
        }) => number;
        updateElement: <T_3>({ collection, makeElementKey, value }: {
            collection: T_3[];
            makeElementKey: IMakeCollectionKeyMethod<T_3>;
            value: T_3;
        }) => boolean;
        deleteElement: <T_4>({ collection, makeElementKey, key }: {
            collection: T_4[];
            makeElementKey: IMakeCollectionKeyMethod<T_4>;
            key: string;
        }) => boolean;
        clear: <T_5>({ collection }: {
            collection: T_5[];
        }) => boolean;
    };
    Set: {
        getCollectionKeys: <T_6>({ collection, makeElementKey }: {
            collection: Set<T_6>;
            makeElementKey: IMakeCollectionKeyMethod<T_6>;
        }) => string[];
        getElement: <T_7>({ collection, makeElementKey, key }: {
            collection: Set<T_7>;
            makeElementKey: IMakeCollectionKeyMethod<T_7>;
            key: string;
        }) => T_7 | undefined;
        insertElement: <T_8>({ collection, key, value }: {
            collection: Set<T_8>;
            key: string;
            value: T_8;
        }) => void;
        updateElement: <T_9>({ collection, makeElementKey, value }: {
            collection: Set<T_9>;
            makeElementKey: IMakeCollectionKeyMethod<T_9>;
            value: T_9;
        }) => boolean;
        deleteElement: <T_10>({ collection, makeElementKey, key }: {
            collection: Set<T_10>;
            makeElementKey: IMakeCollectionKeyMethod<T_10>;
            key: string;
        }) => boolean;
    };
    Record: {
        deleteElement: <T_11>({ record, key }: {
            record: Record<string, T_11>;
            key: string;
        }) => boolean;
    };
    isIterable: typeof isIterable;
};
export {};
