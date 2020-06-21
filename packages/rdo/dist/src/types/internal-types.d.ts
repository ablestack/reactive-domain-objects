import { IGlobalNodeOptions, INodeSyncOptions } from '.';
import { ISyncableRDOCollection, IMakeCollectionKey, IMakeRdoElement } from './rdo-collection-types';
export declare type JavaScriptBuiltInType = '[object Array]' | '[object Boolean]' | '[object Date]' | '[object Error]' | '[object Map]' | '[object Number]' | '[object Object]' | '[object RegExp]' | '[object Set]' | '[object String]' | '[object Undefined]';
export declare type NodeKind = 'Primitive' | 'Collection' | 'Object';
export declare type InternalNodeKind = Exclude<NodeKind, 'Primitive'>;
export declare type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export declare type NodeTypeInfo = {
    kind: NodeKind;
    type?: RdoFieldType;
    builtInType: JavaScriptBuiltInType;
};
export interface ISourceNodeWrapper<K extends string | number | symbol, S, D> {
    readonly typeInfo: NodeTypeInfo;
    readonly value: S | Iterable<S> | null | undefined;
    readonly key: K | undefined;
    readonly sourceNodePath: string;
    readonly lastSourceNode: S | undefined;
    readonly matchingNodeOptions: INodeSyncOptions<K, S, D> | undefined;
    readonly globalNodeOptions: IGlobalNodeOptions | undefined;
    readonly wrappedRdoNode: IRdoNodeWrapper<K, S, D> | undefined;
    setRdoNode(rdoNode: IRdoNodeWrapper<K, S, D>): void;
    childElementCount(): number;
}
export declare function isISourceNodeWrapper(o: any): o is ISourceNodeWrapper<any, any, any>;
export interface ISourceInternalNodeWrapper<K extends string | number | symbol, S, D> extends ISourceNodeWrapper<K, S, D> {
    nodeKeys(): Iterable<K>;
    getItem(key: K): S | null | undefined;
}
export declare function isISourceInternalNodeWrapper(o: any): o is ISourceInternalNodeWrapper<any, any, any>;
export interface ISourceCollectionNodeWrapper<K extends string | number | symbol, S, D> extends ISourceInternalNodeWrapper<K, S, D>, IMakeCollectionKey<K, S> {
    elements(): Iterable<S>;
}
export declare function isISourceCollectionNodeWrapper(o: any): o is ISourceCollectionNodeWrapper<any, any, any>;
export declare type RdoNodeTypes<K extends string | number | symbol, S, D> = D | Array<D> | Map<K, D> | Set<D> | ISyncableRDOCollection<K, S, D> | null | undefined;
export interface IRdoNodeWrapper<K extends string | number | symbol, S, D> {
    readonly value: RdoNodeTypes<K, S, D>;
    readonly key: K | undefined;
    readonly wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any, any> | undefined;
    readonly typeInfo: NodeTypeInfo;
    readonly wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
    readonly globalNodeOptions: IGlobalNodeOptions | undefined;
    readonly ignore: boolean;
    getNodeOptions(): INodeSyncOptions<any, any, any> | null;
    childElementCount(): number;
    smartSync(): boolean;
}
export declare function isIRdoNodeWrapper(o: any): o is IRdoNodeWrapper<any, any, any>;
export interface IRdoInternalNodeWrapper<K extends string | number | symbol, S, D> extends IRdoNodeWrapper<K, S, D>, IMakeRdoElement<S, D> {
    itemKeys(): Iterable<K>;
    getItem(key: K): D | null | undefined;
    updateItem(key: K, value: D | undefined): boolean;
    insertItem(key: K, value: D | undefined): void;
}
export declare function isIRdoInternalNodeWrapper(o: any): o is IRdoInternalNodeWrapper<any, any, any>;
export interface IRdoCollectionNodeWrapper<K extends string | number | symbol, S, D> extends IRdoInternalNodeWrapper<K, S, D>, IMakeCollectionKey<K, D> {
    elements(): Iterable<D | undefined>;
    deleteElement(key: K): D | undefined;
    clearElements(): boolean;
}
export declare function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any, any>;
export interface IMakeRdo<K extends string | number | symbol, S, D> {
    makeRdo(sourceObject: S, parentRdoNodeWrapper: IRdoNodeWrapper<K, S, D>): D | undefined;
}
export declare function isIMakeRdo(o: any): o is IMakeRdo<any, any, any>;
export declare type ISyncChildNode = <K extends string | number | symbol, D>({ wrappedParentRdoNode, rdoNodeItemValue, rdoNodeItemKey, sourceNodeItemKey, }: {
    wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any, any>;
    rdoNodeItemValue: D;
    rdoNodeItemKey: K;
    sourceNodeItemKey: K;
}) => boolean;
export declare type IWrapRdoNode = <K extends string | number | symbol, S, D>({ sourceNodePath, rdoNode, sourceNode, wrappedParentRdoNode: parentRdoNode, rdoNodeItemKey, sourceNodeItemKey, }: {
    sourceNodePath: string;
    rdoNode: D | undefined;
    sourceNode: S;
    wrappedParentRdoNode?: IRdoInternalNodeWrapper<any, any, any> | undefined;
    rdoNodeItemKey?: K | undefined;
    sourceNodeItemKey?: K | undefined;
}) => IRdoNodeWrapper<K, S, D>;
