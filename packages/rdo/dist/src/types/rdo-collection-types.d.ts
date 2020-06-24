import { IMakeRdo, CollectionNodePatchOperation } from './internal-types';
export declare type MakeCollectionKeyMethod<K extends string | number, T> = (item: T) => K;
export interface IMakeCollectionKey<K extends string | number, T> {
    makeCollectionKey: (item: T) => K;
}
export declare function isIMakeCollectionKey(o: any): o is IMakeCollectionKey<any, any>;
export interface IMakeRdoElement<S, D> {
    makeRdoElement(sourceObject: S): D | undefined;
}
export declare function isIMakeRdoElement(o: any): o is IMakeRdoElement<any, any>;
export interface ISyncableCollection<K extends string | number, S, D> extends IMakeCollectionKey<K, S> {
    readonly size: number;
    elements(): Iterable<D>;
    patchAdd(patchOp: Omit<CollectionNodePatchOperation<K, D>, 'op'>): any;
    patchDelete(patchOp: Omit<CollectionNodePatchOperation<K, D>, 'op'>): any;
}
export declare function IsISyncableCollection(o: any): o is ISyncableCollection<any, any, any>;
export interface ISyncableRDOCollection<K extends string | number, S, D> extends IMakeRdo<K, S, D>, ISyncableCollection<K, S, D> {
}
export declare function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any, any>;
