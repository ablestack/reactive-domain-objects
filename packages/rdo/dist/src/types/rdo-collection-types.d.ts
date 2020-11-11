import { IMakeRdo, IRdoInternalNodeWrapper } from './internal-types';
export declare type MakeCollectionKeyMethod<T> = (item: T) => string | number;
export interface ITryMakeCollectionKey<T> {
    tryMakeCollectionKey: (item: T, index: number) => string | number | undefined;
}
export declare function isITryMakeCollectionKey(o: any): o is IMakeCollectionKey<any>;
export interface IMakeCollectionKey<T> {
    makeCollectionKey: (item: T, index: number) => string | number;
}
export declare function isIMakeCollectionKey(o: any): o is IMakeCollectionKey<any>;
export interface IMakeRdoElement<S, D> {
    makeRdoElement(sourceObject: S): D | undefined;
}
export declare function isIMakeRdoElement(o: any): o is IMakeRdoElement<any, any>;
export interface IRdoCollectionNodeWrapper<S, D> extends IRdoInternalNodeWrapper<S, D> {
    elements(): Iterable<D | undefined>;
}
export declare function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any>;
export interface IRdoKeyBasedCollectionNodeWrapper<S, D> extends IRdoInternalNodeWrapper<S, D> {
    onNewKey: NodeAddHandler;
    onReplaceKey: NodeReplaceHandler;
    onDeleteKey: NodeDeleteHandler;
}
export declare function isIRdoKeyBasedCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any>;
export interface ISyncableKeyBasedCollection<S, D> extends ITryMakeCollectionKey<S> {
    readonly size: number;
    elements(): Iterable<D>;
    handleNewKey({ index, key, nextRdo }: {
        index?: number;
        key: string | number;
        nextRdo: any;
    }): any;
    handleReplaceKey({ index, key, lastRdo, nextRdo }: {
        index?: number;
        key: string | number;
        lastRdo: any;
        nextRdo: any;
    }): any;
    handleDeleteKey({ index, key, lastRdo }: {
        index?: number;
        key: string | number;
        lastRdo: any;
    }): any;
}
export declare function IsISyncableCollection(o: any): o is ISyncableKeyBasedCollection<any, any>;
export interface ISyncableRDOKeyBasedCollection<S, D> extends IMakeRdo<S, D>, ISyncableKeyBasedCollection<S, D> {
}
export declare function IsISyncableRDOCollection(o: any): o is ISyncableRDOKeyBasedCollection<any, any>;
export interface NodeAddHandler {
    ({ index, key, nextRdo }: {
        index?: number;
        key: string | number;
        nextRdo: any;
    }): boolean;
}
export interface NodeReplaceHandler {
    ({ index, key, lastRdo, nextRdo }: {
        index?: number;
        key: string | number;
        lastRdo: any;
        nextRdo: any;
    }): boolean;
}
export interface NodeDeleteHandler {
    ({ index, key, lastRdo }: {
        index?: number;
        key: string | number;
        lastRdo: any;
    }): boolean;
}
