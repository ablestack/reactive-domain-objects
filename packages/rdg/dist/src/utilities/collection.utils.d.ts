import { IMakeKey } from '..';
declare function isIterable(obj: any): boolean;
export declare const CollectionUtils: {
    Array: {
        getKeys: <T>({ collection, makeKey }: {
            collection: T[];
            makeKey: IMakeKey<T>;
        }) => string[];
        getItem: <T_1>({ collection, makeKey, key }: {
            collection: T_1[];
            makeKey: IMakeKey<T_1>;
            key: string;
        }) => T_1 | undefined;
        insertItem: <T_2>({ collection, key, value }: {
            collection: T_2[];
            key: string;
            value: T_2;
        }) => number;
        updateItem: <T_3>({ collection, makeKey, value }: {
            collection: T_3[];
            makeKey: IMakeKey<T_3>;
            value: T_3;
        }) => void;
        deleteItem: <T_4>({ collection, makeKey, key }: {
            collection: T_4[];
            makeKey: IMakeKey<T_4>;
            key: string;
        }) => void;
        clear: <T_5>({ collection }: {
            collection: T_5[];
        }) => T_5[];
    };
    Set: {
        getKeys: <T_6>({ collection, makeKey }: {
            collection: Set<T_6>;
            makeKey: IMakeKey<T_6>;
        }) => string[];
        tryGetItem: <T_7>({ collection, makeKey, key }: {
            collection: Set<T_7>;
            makeKey: IMakeKey<T_7>;
            key: string;
        }) => T_7 | undefined;
        insertItem: <T_8>({ collection, key, value }: {
            collection: Set<T_8>;
            key: string;
            value: T_8;
        }) => void;
        tryUpdateItem: <T_9>({ collection, makeKey, value }: {
            collection: Set<T_9>;
            makeKey: IMakeKey<T_9>;
            value: T_9;
        }) => void;
        tryDeleteItem: <T_10>({ collection, makeKey, key }: {
            collection: Set<T_10>;
            makeKey: IMakeKey<T_10>;
            key: string;
        }) => void;
    };
    Record: {
        getKeys: <T_11>({ collection }: {
            collection: Record<string, TextDecodeOptions>;
        }) => string[];
        tryGetItem: <T_12>({ collection, key }: {
            collection: Record<string, T_12>;
            key: string;
        }) => T_12;
        insertItem: <T_13>({ collection, key, value }: {
            collection: Record<string, T_13>;
            key: string;
            value: T_13;
        }) => void;
        tryUpdateItem: <T_14>({ collection, key, value }: {
            collection: Record<string, T_14>;
            key: string;
            value: T_14;
        }) => void;
        tryDeleteItem: <T_15>({ collection, key }: {
            collection: Record<string, T_15>;
            key: string;
        }) => void;
    };
    isIterable: typeof isIterable;
};
export {};
