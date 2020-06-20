import { MakeCollectionKeyMethod } from '../..';
declare function isIterable(obj: any): boolean;
export declare const CollectionUtils: {
    Array: {
        getCollectionKeys: <T>({ collection, makeCollectionKey }: {
            collection: T[];
            makeCollectionKey: MakeCollectionKeyMethod<T>;
        }) => string[];
        getElement: <T_1>({ collection, makeCollectionKey, key }: {
            collection: T_1[];
            makeCollectionKey: MakeCollectionKeyMethod<T_1>;
            key: string;
        }) => T_1 | undefined;
        insertElement: <T_2>({ collection, key, value }: {
            collection: T_2[];
            key: string;
            value: T_2;
        }) => number;
        updateElement: <T_3>({ collection, makeCollectionKey, value }: {
            collection: T_3[];
            makeCollectionKey: MakeCollectionKeyMethod<T_3>;
            value: T_3;
        }) => boolean;
        deleteElement: <T_4>({ collection, makeCollectionKey, key }: {
            collection: T_4[];
            makeCollectionKey: MakeCollectionKeyMethod<T_4>;
            key: string;
        }) => T_4 | undefined;
        clear: <T_5>({ collection }: {
            collection: T_5[];
        }) => boolean;
    };
    Set: {
        getCollectionKeys: <T_6>({ collection, makeCollectionKey }: {
            collection: Set<T_6>;
            makeCollectionKey: MakeCollectionKeyMethod<T_6>;
        }) => string[];
        getElement: <T_7>({ collection, makeCollectionKey, key }: {
            collection: Set<T_7>;
            makeCollectionKey: MakeCollectionKeyMethod<T_7>;
            key: string;
        }) => T_7 | undefined;
        insertElement: <T_8>({ collection, key, value }: {
            collection: Set<T_8>;
            key: string;
            value: T_8;
        }) => void;
        updateElement: <T_9>({ collection, makeCollectionKey, value }: {
            collection: Set<T_9>;
            makeCollectionKey: MakeCollectionKeyMethod<T_9>;
            value: T_9;
        }) => boolean;
        deleteElement: <T_10>({ collection, makeCollectionKey, key }: {
            collection: Set<T_10>;
            makeCollectionKey: MakeCollectionKeyMethod<T_10>;
            key: string;
        }) => T_10 | undefined;
    };
    Record: {
        deleteElement: <T_11>({ record, key }: {
            record: Record<string, T_11>;
            key: string;
        }) => T_11 | undefined;
    };
    isIterable: typeof isIterable;
};
export {};
