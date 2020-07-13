import { IGlobalNodeOptions, INodeSyncOptions } from '.';
import { IMakeCollectionKey, IMakeRdoElement, ISyncableRDOCollection } from './rdo-collection-types';
export declare type JavaScriptStringifiedType = '[object Array]' | '[object Boolean]' | '[object Date]' | '[object Error]' | '[object Map]' | '[object Number]' | '[object Object]' | '[object RegExp]' | '[object Set]' | '[object String]' | '[object Undefined]';
export declare type NodeKind = 'Primitive' | 'Collection' | 'Object';
export declare type InternalNodeKind = Exclude<NodeKind, 'Primitive'>;
export declare type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export declare type NodeTypeInfo = {
    kind: NodeKind;
    type?: RdoFieldType;
    stringifiedType: JavaScriptStringifiedType;
};
export declare type NodePatchOperationType = 'add' | 'replace' | 'update' | 'delete';
export declare type CollectionNodePatchOperation<K extends string | number, D> = {
    op: NodePatchOperationType;
    index: number;
    key: K;
    previousSourceValue: any;
    newSourceValue: any;
    rdo?: D;
};
/**
 *
 *
 * @export
 * @interface ISourceNodeWrapper
 * @template K The type of the generated Key for the contained elements
 * @template S The type of the contained source elements
 * @template D The type of the related RDO that the contained elements are to be transformed into
 */
export interface ISourceNodeWrapper<K extends string | number, S, D> {
    readonly typeInfo: NodeTypeInfo;
    readonly value: S | Iterable<S> | null | undefined;
    readonly key: K | undefined;
    readonly sourceNodeTypePath: string;
    readonly sourceNodeInstancePath: string;
    readonly matchingNodeOptions: INodeSyncOptions<K, S, D> | undefined;
    readonly globalNodeOptions: IGlobalNodeOptions | undefined;
    readonly wrappedRdoNode: IRdoNodeWrapper<K, S, D> | undefined;
    setRdoNode(rdoNode: IRdoNodeWrapper<K, S, D>): void;
    childElementCount(): number;
}
export declare function isISourceNodeWrapper(o: any): o is ISourceNodeWrapper<any, any, any>;
export interface ISourceInternalNodeWrapper<K extends string | number, S, D> extends ISourceNodeWrapper<K, S, D> {
}
export declare function isISourceInternalNodeWrapper(o: any): o is ISourceInternalNodeWrapper<any, any, any>;
export interface ISourceObjectNodeWrapper<S, D> extends ISourceInternalNodeWrapper<string, S, D> {
    getNodeKeys(): Iterable<string>;
    getNodeItem(key: string): S | null | undefined;
}
export declare function isISourceObjectNodeWrapper(o: any): o is ISourceObjectNodeWrapper<any, any>;
export interface ISourceCollectionNodeWrapper<K extends string | number, S, D> extends ISourceInternalNodeWrapper<K, S, D>, IMakeCollectionKey<K, S> {
    elements(): Array<S>;
}
export declare function isISourceCollectionNodeWrapper(o: any): o is ISourceCollectionNodeWrapper<any, any, any>;
export declare type RdoNodeTypes<K extends string | number, S, D> = D | Array<D> | Map<K, D> | Set<D> | ISyncableRDOCollection<K, S, D> | null | undefined;
export interface IRdoNodeWrapper<K extends string | number, S, D> {
    readonly value: RdoNodeTypes<K, S, D>;
    readonly key: K | undefined;
    readonly wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any, any> | undefined;
    readonly typeInfo: NodeTypeInfo;
    readonly wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
    readonly globalNodeOptions: IGlobalNodeOptions | undefined;
    readonly ignore: boolean;
    readonly isLeafNode: boolean;
    getNodeOptions(): INodeSyncOptions<any, any, any> | null;
    childElementCount(): number;
    smartSync(): boolean;
    getSourceNodeKeys(): Iterable<K>;
    getSourceNodeItem(key: K): S | null | undefined;
}
export declare function isIRdoNodeWrapper(o: any): o is IRdoNodeWrapper<any, any, any>;
export interface IRdoInternalNodeWrapper<K extends string | number, S, D> extends IRdoNodeWrapper<K, S, D>, IMakeRdoElement<S, D> {
    getItem(key: K): D | null | undefined;
}
export declare function isIRdoInternalNodeWrapper(o: any): o is IRdoInternalNodeWrapper<any, any, any>;
export interface IRdoCollectionNodeWrapper<K extends string | number, S, D> extends IRdoInternalNodeWrapper<K, S, D> {
    elements(): Iterable<D | undefined>;
}
export declare function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any, any>;
export interface IMakeRdo<K extends string | number, S, D> {
    makeRdo(sourceObject: S, parentRdoNodeWrapper: IRdoNodeWrapper<K, S, D>): D | undefined;
}
export declare function isIMakeRdo(o: any): o is IMakeRdo<any, any, any>;
export declare type ISyncChildNode = <K extends string | number, S, D>({ wrappedParentRdoNode, rdoNodeItemKey, sourceNodeItemKey }: {
    wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any, any>;
    rdoNodeItemKey: K;
    sourceNodeItemKey: K;
}) => boolean;
export declare type IWrapRdoNode = <K extends string | number, S, D>({ sourceNodeTypePath, sourceNodeInstancePath, rdoNode, sourceNode, wrappedParentRdoNode: parentRdoNode, rdoNodeItemKey, sourceNodeItemKey, }: {
    sourceNodeTypePath: string;
    sourceNodeInstancePath: string;
    rdoNode: D | undefined;
    sourceNode: S;
    wrappedParentRdoNode?: IRdoInternalNodeWrapper<any, any, any> | undefined;
    rdoNodeItemKey?: K | undefined;
    sourceNodeItemKey?: K | undefined;
}) => IRdoNodeWrapper<K, S, D>;
