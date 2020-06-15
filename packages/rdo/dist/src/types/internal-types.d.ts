import { IGlobalNameOptions, IMakeRdo, INodeSyncOptions } from '.';
import { ISyncableRDOCollection, ICollectionKeyFactory } from './rdo-collection-types';
export declare type JavaScriptBuiltInType = '[object Array]' | '[object Boolean]' | '[object Date]' | '[object Error]' | '[object Map]' | '[object Number]' | '[object Object]' | '[object RegExp]' | '[object Set]' | '[object String]' | '[object Undefined]';
export declare type NodeKind = 'Primitive' | 'Collection' | 'Object';
export declare type InternalNodeKind = Exclude<NodeKind, 'Primitive'>;
export declare type SourceNodeTypeInfo = {
    kind: NodeKind;
    builtInType: JavaScriptBuiltInType;
};
export declare type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export declare type RdoNodeTypeInfo = {
    kind: NodeKind;
    type: RdoFieldType | undefined;
    builtInType: JavaScriptBuiltInType;
};
export interface ISourceNodeWrapper<S> {
    readonly typeInfo: SourceNodeTypeInfo;
    readonly value: S | Iterable<S> | null | undefined;
    readonly key: string | undefined;
    readonly sourceNodePath: string;
    readonly lastSourceNode: S | undefined;
    readonly matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    readonly globalNodeOptions: IGlobalNameOptions | undefined;
    readonly wrappedRdoNode: IRdoNodeWrapper<S, any> | undefined;
    setRdoNode(rdoNode: IRdoNodeWrapper<S, any>): void;
    childElementCount(): number;
}
export declare function isISourceNodeWrapper(o: any): o is ISourceNodeWrapper<any>;
export interface ISourceInternalNodeWrapper<S> extends ISourceNodeWrapper<S> {
    nodeKeys(): Iterable<string>;
    getItem(key: string): S | null | undefined;
}
export declare function isISourceInternalNodeWrapper(o: any): o is ISourceInternalNodeWrapper<any>;
export interface ISourceCollectionNodeWrapper<S> extends ISourceInternalNodeWrapper<S>, ICollectionKeyFactory<S> {
    elements(): Iterable<S>;
}
export declare function isISourceCollectionNodeWrapper(o: any): o is ISourceCollectionNodeWrapper<any>;
export declare type RdoNodeTypes<S, D> = D | Array<D> | Map<string, D> | Set<D> | ISyncableRDOCollection<S, D> | null | undefined;
export interface IRdoNodeWrapper<S, D> {
    readonly value: RdoNodeTypes<S, D>;
    readonly key: string | undefined;
    readonly wrappedParentRdoNode: IRdoNodeWrapper<any, any> | undefined;
    readonly typeInfo: RdoNodeTypeInfo;
    readonly wrappedSourceNode: ISourceNodeWrapper<S>;
    readonly matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    readonly globalNodeOptions: IGlobalNameOptions | undefined;
    readonly ignore: boolean;
    childElementCount(): number;
    smartSync(): boolean;
}
export declare function isIRdoNodeWrapper(o: any): o is IRdoNodeWrapper<any, any>;
export interface IRdoInternalNodeWrapper<S, D> extends IRdoNodeWrapper<S, D> {
    itemKeys(): Iterable<string>;
    getElement(key: string): D | null | undefined;
    updateElement(key: string, value: D): boolean;
}
export declare function isIRdoInternalNodeWrapper(o: any): o is IRdoInternalNodeWrapper<any, any>;
export interface IRdoCollectionNodeWrapper<S, D> extends IRdoInternalNodeWrapper<S, D>, IMakeRdo<S, D>, ICollectionKeyFactory<D> {
    elements(): Iterable<D>;
    insertElement(value: D): void;
    deleteElement(key: string): boolean;
    clearElements(): boolean;
}
export declare function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any>;
export declare type ISyncChildNode<S, D> = ({ parentRdoNode, rdoNodeItemKey, sourceNodeItemKey }: {
    parentRdoNode: IRdoInternalNodeWrapper<any, any>;
    rdoNodeItemKey: string;
    sourceNodeItemKey: string;
}) => boolean;
export declare type IWrapRdoNode = ({ sourceNodePath, rdoNode, sourceNode, wrappedParentRdoNode: parentRdoNode, rdoNodeItemKey, sourceNodeItemKey, }: {
    sourceNodePath: string;
    rdoNode: object;
    sourceNode: object;
    wrappedParentRdoNode?: IRdoNodeWrapper<unknown, unknown> | undefined;
    rdoNodeItemKey?: string | undefined;
    sourceNodeItemKey?: string | undefined;
}) => IRdoNodeWrapper<unknown, unknown>;
