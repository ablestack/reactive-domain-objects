import { IMakeRdo } from './internal-types';
export declare type MakeCollectionKeyMethod<K extends string | number | symbol, T> = (item: T) => K | undefined;
export interface IMakeCollectionKey<K extends string | number | symbol, T> {
    makeCollectionKey: (item: T) => K | undefined;
}
export declare function isIMakeCollectionKey(o: any): o is IMakeCollectionKey<any, any>;
export interface IMakeCollectionKeyFromSourceElement<K extends string | number | symbol, T> {
    makeCollectionKeyFromSourceElement: IMakeCollectionKey<K, T>['makeCollectionKey'];
}
export declare function isIMakeCollectionKeyFromSourceElement(o: any): o is IMakeCollectionKeyFromSourceElement<any, any>;
export interface IMakeCollectionKeyFromRdoElement<K extends string | number | symbol, T> {
    makeCollectionKeyFromRdoElement: IMakeCollectionKey<K, T>['makeCollectionKey'];
}
export declare function isIMakeCollectionKeyFromRdoElement(o: any): o is IMakeCollectionKeyFromRdoElement<any, any>;
export interface IMakeRdoElement<S, D> {
    makeRdoElement(sourceObject: S): D | undefined;
}
export declare function isIMakeRdoElement(o: any): o is IMakeRdoElement<any, any>;
export interface ISyncableCollection<K extends string | number | symbol, S, D> extends IMakeCollectionKeyFromSourceElement<K, S>, IMakeCollectionKeyFromRdoElement<K, D> {
    readonly size: number;
    elements(): Iterable<D>;
    getCollectionKeys: () => K[];
    getElement: (key: K) => D | null | undefined;
    insertElement: (key: K, value: D) => void;
    updateElement: (key: K, value: D) => boolean;
    deleteElement: (key: K) => D | undefined;
    clearElements: () => boolean;
}
export declare function IsISyncableCollection(o: any): o is ISyncableCollection<any, any, any>;
export interface ISyncableRDOCollection<K extends string | number | symbol, S, D> extends IMakeRdo<K, S, D>, ISyncableCollection<K, S, D> {
}
export declare function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any, any>;
