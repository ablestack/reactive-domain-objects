import { IMakeRdo, IRdoInternalNodeWrapper } from './internal-types';
export declare type MakeCollectionKeyMethod<K extends string | number, T> = (item: T) => K;
export interface ITryMakeCollectionKey<K extends string | number, T> {
    tryMakeCollectionKey: (item: T, index: number) => K | undefined;
}
export declare function isITryMakeCollectionKey(o: any): o is IMakeCollectionKey<any, any>;
export interface IMakeCollectionKey<K extends string | number, T> {
    makeCollectionKey: (item: T, index: number) => K;
}
export declare function isIMakeCollectionKey(o: any): o is IMakeCollectionKey<any, any>;
export interface IMakeRdoElement<S, D> {
    makeRdoElement(sourceObject: S): D | undefined;
}
export declare function isIMakeRdoElement(o: any): o is IMakeRdoElement<any, any>;
export interface IRdoCollectionNodeWrapper<K extends string | number, S, D> extends IRdoInternalNodeWrapper<K, S, D> {
    elements(): Iterable<D | undefined>;
}
export declare function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any, any>;
export interface IRdoKeyBasedCollectionNodeWrapper<K extends string | number, S, D> extends IRdoInternalNodeWrapper<K, S, D> {
    onNewKey: NodeAddHandler<K>;
    onReplaceKey: NodeReplaceHandler<K>;
    onDeleteKey: NodeDeleteHandler<K>;
}
export declare function isIRdoKeyBasedCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any, any>;
export interface ISyncableKeyBasedCollection<K extends string | number, S, D> extends ITryMakeCollectionKey<K, S> {
    readonly size: number;
    elements(): Iterable<D>;
    handleNewKey({ index, key, nextRdo }: {
        index?: number;
        key: K;
        nextRdo: any;
    }): any;
    handleReplaceKey({ index, key, lastRdo, nextRdo }: {
        index?: number;
        key: K;
        lastRdo: any;
        nextRdo: any;
    }): any;
    handleDeleteKey({ index, key, lastRdo }: {
        index?: number;
        key: K;
        lastRdo: any;
    }): any;
}
export declare function IsISyncableCollection(o: any): o is ISyncableKeyBasedCollection<any, any, any>;
export interface ISyncableRDOKeyBasedCollection<K extends string | number, S, D> extends IMakeRdo<K, S, D>, ISyncableKeyBasedCollection<K, S, D> {
}
export declare function IsISyncableRDOCollection(o: any): o is ISyncableRDOKeyBasedCollection<any, any, any>;
export interface NodeAddHandler<K extends string | number> {
    ({ index, key, nextRdo }: {
        index?: number;
        key: K;
        nextRdo: any;
    }): boolean;
}
export interface NodeReplaceHandler<K extends string | number> {
    ({ index, key, lastRdo, nextRdo }: {
        index?: number;
        key: K;
        lastRdo: any;
        nextRdo: any;
    }): boolean;
}
export interface NodeDeleteHandler<K extends string | number> {
    ({ index, key, lastRdo }: {
        index?: number;
        key: K;
        lastRdo: any;
    }): boolean;
}
