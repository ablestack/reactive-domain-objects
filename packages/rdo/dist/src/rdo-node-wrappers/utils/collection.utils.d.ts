import { MakeCollectionKeyMethod } from '../..';
declare function isIterable(obj: any): boolean;
export declare const CollectionUtils: {
    Array: {
        getCollectionKeys: <K extends string | number, T>({ collection, makeCollectionKey }: {
            collection: T[];
            makeCollectionKey: MakeCollectionKeyMethod<K, T>;
        }) => K[];
        getElement: <K_1 extends string | number, T_1>({ collection, makeCollectionKey, key }: {
            collection: T_1[];
            makeCollectionKey: MakeCollectionKeyMethod<K_1, T_1>;
            key: K_1;
        }) => T_1 | undefined;
        insertElement: <K_2 extends string | number, T_2>({ collection, key, value }: {
            collection: T_2[];
            key: K_2;
            value: T_2;
        }) => number;
        updateElement: <K_3 extends string | number, T_3>({ collection, makeCollectionKey, value }: {
            collection: T_3[];
            makeCollectionKey: MakeCollectionKeyMethod<K_3, T_3>;
            value: T_3;
        }) => boolean;
        deleteElement: <K_4 extends string | number, T_4>({ collection, makeCollectionKey, key }: {
            collection: T_4[];
            makeCollectionKey: MakeCollectionKeyMethod<K_4, T_4>;
            key: K_4;
        }) => T_4 | undefined;
        clear: <T_5>({ collection }: {
            collection: T_5[];
        }) => boolean;
    };
    Set: {
        getCollectionKeys: <K_5 extends string | number, T_6>({ collection, makeCollectionKey }: {
            collection: Set<T_6>;
            makeCollectionKey: MakeCollectionKeyMethod<K_5, T_6>;
        }) => K_5[];
        getElement: <K_6 extends string | number, T_7>({ collection, makeCollectionKey, key }: {
            collection: Set<T_7>;
            makeCollectionKey: MakeCollectionKeyMethod<K_6, T_7>;
            key: K_6;
        }) => T_7 | undefined;
        insertElement: <K_7 extends string | number, T_8>({ collection, key, value }: {
            collection: Set<T_8>;
            key: K_7;
            value: T_8;
        }) => void;
        updateElement: <K_8 extends string | number, T_9>({ collection, makeCollectionKey, value }: {
            collection: Set<T_9>;
            makeCollectionKey: MakeCollectionKeyMethod<K_8, T_9>;
            value: T_9;
        }) => boolean;
        deleteElement: <K_9 extends string | number, T_10>({ collection, makeCollectionKey, key }: {
            collection: Set<T_10>;
            makeCollectionKey: MakeCollectionKeyMethod<K_9, T_10>;
            key: K_9;
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
