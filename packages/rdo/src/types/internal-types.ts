/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IGlobalNodeOptions, INodeSyncOptions } from '.';
import { IMakeCollectionKey, IMakeRdoElement, isIMakeCollectionKey, isIMakeRdoElement, ISyncableRDOKeyBasedCollection } from './rdo-collection-types';

export type JavaScriptStringifiedType = '[object Array]' | '[object Boolean]' | '[object Date]' | '[object Error]' | '[object Map]' | '[object Number]' | '[object Object]' | '[object RegExp]' | '[object Set]' | '[object String]' | '[object Undefined]';

export type NodeKind = 'Primitive' | 'Collection' | 'Object';
export type InternalNodeKind = Exclude<NodeKind, 'Primitive'>;
export type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableKeyBasedCollection' | 'Object';
export type NodeTypeInfo = { kind: NodeKind; type?: RdoFieldType; stringifiedType: JavaScriptStringifiedType };
export type NodePatchOperationType = 'add' | 'replace' | 'update' | 'delete';
export type CollectionNodePatchOperation<D> = { op: NodePatchOperationType; index: number; key: string | number; previousSourceValue: any; newSourceValue: any; rdo?: D };

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

export function isISourceNodeWrapper(o: any): o is ISourceNodeWrapper<any, any> {
  return o && o.typeInfo && 'value' in o && o.setRdoNode && o.childElementCount;
}

export interface ISourceInternalNodeWrapper<S, D> extends ISourceNodeWrapper<S, D> {}

export function isISourceInternalNodeWrapper(o: any): o is ISourceInternalNodeWrapper<any, any> {
  return o && isISourceNodeWrapper(o);
}

export interface ISourceObjectNodeWrapper<S, D> extends ISourceInternalNodeWrapper<S, D> {
  getNodeKeys(): Iterable<string | number>;
  getNodeItem(key: string | number): S | null | undefined;
}

export function isISourceObjectNodeWrapper(o: any): o is ISourceObjectNodeWrapper<any, any> {
  return o && o.getNodeKeys && o.getNodeItem && isISourceInternalNodeWrapper(o);
}

export interface ISourceCollectionNodeWrapper<S, D> extends ISourceInternalNodeWrapper<S, D>, IMakeCollectionKey<S> {
  elements(): Array<S>;
}

export function isISourceCollectionNodeWrapper(o: any): o is ISourceCollectionNodeWrapper<any, any> {
  return o && o.elements && isISourceInternalNodeWrapper(o) && isIMakeCollectionKey(o);
}

export type RdoNodeTypes<S, D> = D | Array<D> | Map<string | number, D> | Set<D> | ISyncableRDOKeyBasedCollection<S, D> | null | undefined;

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

export function isIRdoNodeWrapper(o: any): o is IRdoNodeWrapper<any, any> {
  return o && o.value !== undefined && o.typeInfo && o.wrappedSourceNode && 'ignore' in o && o.childElementCount && o.smartSync;
}

export interface IRdoInternalNodeWrapper<S, D> extends IRdoNodeWrapper<S, D>, IMakeRdoElement<S, D> {
  getRdoNodeItem(key: string | number): D | null | undefined;
}

export function isIRdoInternalNodeWrapper(o: any): o is IRdoInternalNodeWrapper<any, any> {
  return o && o.getRdoNodeItem && isIMakeRdoElement(o) && isIRdoNodeWrapper(o);
}

export interface IMakeRdo<S, D> {
  makeRdo(sourceObject: S, parentRdoNodeWrapper: IRdoNodeWrapper<S, D>): D | undefined;
}

export function isIMakeRdo(o: any): o is IMakeRdo<any, any> {
  return o && o.makeRdo;
}

export type ISyncChildNode = <S, D>({ wrappedParentRdoNode, rdoNodeItemKey, sourceNodeItemKey }: { wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any>; rdoNodeItemKey: string | number; sourceNodeItemKey: string | number }) => boolean;

export type IWrapRdoNode = <S, D>({
  sourceNodeTypePath,
  sourceNodeInstancePath,
  rdoNode,
  sourceNode,
  wrappedParentRdoNode: parentRdoNode,
  rdoNodeItemKey,
  sourceNodeItemKey,
}: {
  sourceNodeTypePath: string;
  sourceNodeInstancePath: string;
  rdoNode: D | undefined;
  sourceNode: S;
  wrappedParentRdoNode?: IRdoInternalNodeWrapper<any, any> | undefined;
  rdoNodeItemKey?: string | number | undefined;
  sourceNodeItemKey?: string | number | undefined;
}) => IRdoNodeWrapper<S, D>;
