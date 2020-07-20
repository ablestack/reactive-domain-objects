import { IGlobalNodeOptions, INodeSyncOptions } from '.';
import { IMakeCollectionKey, IMakeRdoElement, ISyncableRDOKeyBasedCollection } from './rdo-collection-types';
export declare type JavaScriptStringifiedType = '[object Array]' | '[object Boolean]' | '[object Date]' | '[object Error]' | '[object Map]' | '[object Number]' | '[object Object]' | '[object RegExp]' | '[object Set]' | '[object String]' | '[object Undefined]';
export declare type NodeKind = 'Primitive' | 'Collection' | 'Object';
export declare type InternalNodeKind = Exclude<NodeKind, 'Primitive'>;
export declare type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableKeyBasedCollection' | 'Object';
export declare type NodeTypeInfo = {
    kind: NodeKind;
    type?: RdoFieldType;
    stringifiedType: JavaScriptStringifiedType;
};
export declare type NodePatchOperationType = 'add' | 'replace' | 'update' | 'delete';
export declare type CollectionNodePatchOperation<D> = {
    op: NodePatchOperationType;
    index: number;
    key: string | number;
    previousSourceValue: any;
    newSourceValue: any;
    rdo?: D;
};
/**
 *
 *
 * @export
 * @interface ISourceNodeWrapper
 * @template string | number The type of the generated Key for the contained elements
 * @template S The type of the contained source elements
 * @template D The type of the related RDO that the contained elements are to be transformed into
 */
export interface ISourceNodeWrapper<S, D> {
    readonly typeInfo: NodeTypeInfo;
    readonly value: S | Iterable<S> | null | undefined;
    readonly key: string | number | undefined;
    readonly sourceNodeTypePath: string;
    readonly sourceNodeInstancePath: string;
    readonly matchingNodeOptions: INodeSyncOptions<S, D> | undefined;
    readonly globalNodeOptions: IGlobalNodeOptions | undefined;
    readonly wrappedRdoNode: IRdoNodeWrapper<S, D> | undefined;
    setRdoNode(rdoNode: IRdoNodeWrapper<S, D>): void;
    childElementCount(): number;
}
export declare function isISourceNodeWrapper(o: any): o is ISourceNodeWrapper<any, any>;
export interface ISourceInternalNodeWrapper<S, D> extends ISourceNodeWrapper<S, D> {
}
export declare function isISourceInternalNodeWrapper(o: any): o is ISourceInternalNodeWrapper<any, any>;
export interface ISourceObjectNodeWrapper<S, D> extends ISourceInternalNodeWrapper<S, D> {
    getNodeKeys(): Iterable<string | number>;
    getNodeItem(key: string | number): S | null | undefined;
}
export declare function isISourceObjectNodeWrapper(o: any): o is ISourceObjectNodeWrapper<any, any>;
export interface ISourceCollectionNodeWrapper<S, D> extends ISourceInternalNodeWrapper<S, D>, IMakeCollectionKey<S> {
    elements(): Array<S>;
}
export declare function isISourceCollectionNodeWrapper(o: any): o is ISourceCollectionNodeWrapper<any, any>;
export declare type RdoNodeTypes<S, D> = D | Array<D> | Map<string | number, D> | Set<D> | ISyncableRDOKeyBasedCollection<S, D> | null | undefined;
export interface IRdoNodeWrapper<S, D> {
    readonly value: RdoNodeTypes<S, D>;
    readonly key: string | number | undefined;
    readonly wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any> | undefined;
    readonly typeInfo: NodeTypeInfo;
    readonly wrappedSourceNode: ISourceNodeWrapper<S, D>;
    readonly globalNodeOptions: IGlobalNodeOptions | undefined;
    readonly ignore: boolean;
    readonly isLeafNode: boolean;
    getNodeOptions(): INodeSyncOptions<any, any> | null;
    childElementCount(): number;
    smartSync(): boolean;
    getSourceNodeKeys(): Iterable<string | number>;
    getSourceNodeItem(key: string | number): S | null | undefined;
}
export declare function isIRdoNodeWrapper(o: any): o is IRdoNodeWrapper<any, any>;
export interface IRdoInternalNodeWrapper<S, D> extends IRdoNodeWrapper<S, D>, IMakeRdoElement<S, D> {
    getRdoNodeItem(key: string | number): D | null | undefined;
}
export declare function isIRdoInternalNodeWrapper(o: any): o is IRdoInternalNodeWrapper<any, any>;
export interface IMakeRdo<S, D> {
    makeRdo(sourceObject: S, parentRdoNodeWrapper: IRdoNodeWrapper<S, D>): D | undefined;
}
export declare function isIMakeRdo(o: any): o is IMakeRdo<any, any>;
export declare type ISyncChildNode = <S, D>({ wrappedParentRdoNode, rdoNodeItemKey, sourceNodeItemKey }: {
    wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any>;
    rdoNodeItemKey: string | number;
    sourceNodeItemKey: string | number;
}) => boolean;
export declare type IWrapRdoNode = <S, D>({ sourceNodeTypePath, sourceNodeInstancePath, rdoNode, sourceNode, wrappedParentRdoNode: parentRdoNode, rdoNodeItemKey, sourceNodeItemKey, }: {
    sourceNodeTypePath: string;
    sourceNodeInstancePath: string;
    rdoNode: D | undefined;
    sourceNode: S;
    wrappedParentRdoNode?: IRdoInternalNodeWrapper<any, any> | undefined;
    rdoNodeItemKey?: string | number | undefined;
    sourceNodeItemKey?: string | number | undefined;
}) => IRdoNodeWrapper<S, D>;
