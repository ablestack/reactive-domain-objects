/// <reference types="node" />
import { MakeCollectionKeyMethod } from '../..';
export declare const CollectionReconciliationUtils: {
    Array: {
        getCollectionKeys: <T>({ collection, makeCollectionKey }: {
            collection: T[];
            makeCollectionKey: MakeCollectionKeyMethod<T>;
        }) => import("fs").Mode[];
        getElement: <T_1>({ collection, makeCollectionKey, key }: {
            collection: T_1[];
            makeCollectionKey: MakeCollectionKeyMethod<T_1>;
            key: string | number;
        }) => T_1 | undefined;
        insertElement: <T_2>({ collection, key, value }: {
            collection: T_2[];
            key: string | number;
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
            key: string | number;
        }) => T_4 | undefined;
    };
    Set: {
        getCollectionKeys: <T_5>({ collection, makeCollectionKey }: {
            collection: Set<T_5>;
            makeCollectionKey: MakeCollectionKeyMethod<T_5>;
        }) => import("fs").Mode[];
        getElement: <T_6>({ collection, makeCollectionKey, key }: {
            collection: Set<T_6>;
            makeCollectionKey: MakeCollectionKeyMethod<T_6>;
            key: string | number;
        }) => T_6 | undefined;
        insertElement: <T_7>({ collection, key, value }: {
            collection: Set<T_7>;
            key: string | number;
            value: T_7;
        }) => void;
        updateElement: <T_8>({ collection, makeCollectionKey, value }: {
            collection: Set<T_8>;
            makeCollectionKey: MakeCollectionKeyMethod<T_8>;
            value: T_8;
        }) => boolean;
        deleteElement: <T_9>({ collection, makeCollectionKey, key }: {
            collection: Set<T_9>;
            makeCollectionKey: MakeCollectionKeyMethod<T_9>;
            key: string | number;
        }) => T_9 | undefined;
    };
};
