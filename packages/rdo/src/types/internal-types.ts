/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IGlobalNodeOptions, INodeSyncOptions } from '.';
import { IMakeCollectionKey, IMakeRdoElement, isIMakeCollectionKey, isIMakeRdoElement, ISyncableRDOCollection } from './rdo-collection-types';

export type JavaScriptStringifiedType = '[object Array]' | '[object Boolean]' | '[object Date]' | '[object Error]' | '[object Map]' | '[object Number]' | '[object Object]' | '[object RegExp]' | '[object Set]' | '[object String]' | '[object Undefined]';

export type NodeKind = 'Primitive' | 'Collection' | 'Object';
export type InternalNodeKind = Exclude<NodeKind, 'Primitive'>;
export type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export type NodeTypeInfo = { kind: NodeKind; type?: RdoFieldType; stringifiedType: JavaScriptStringifiedType };
export type NodePatchOperationType = 'add' | 'replace' | 'update' | 'delete';
export type CollectionNodePatchOperation<K extends string | number, D> = { op: NodePatchOperationType; index: number; key: K; previousSourceValue: any; newSourceValue: any; rdo?: D };

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

export function isISourceNodeWrapper(o: any): o is ISourceNodeWrapper<any, any, any> {
  return o && o.typeInfo && 'value' in o && o.setRdoNode && o.childElementCount;
}

export interface ISourceInternalNodeWrapper<K extends string | number, S, D> extends ISourceNodeWrapper<K, S, D> {
  nodeKeys(): Iterable<K>;
  getItem(key: K): S | null | undefined;
}

export function isISourceInternalNodeWrapper(o: any): o is ISourceInternalNodeWrapper<any, any, any> {
  return o && o.nodeKeys && o.getItem && isISourceNodeWrapper(o);
}

export interface ISourceObjectNodeWrapper<S, D> extends ISourceInternalNodeWrapper<string, S, D> {}

export function isISourceObjectNodeWrapper(o: any): o is ISourceObjectNodeWrapper<any, any> {
  return o && o.nodeKeys && o.getItem && isISourceInternalNodeWrapper(o);
}

export interface ISourceCollectionNodeWrapper<K extends string | number, S, D> extends ISourceInternalNodeWrapper<K, S, D>, IMakeCollectionKey<K, S> {
  elements(): Array<S>;
  //mapOfElementByKey: Map<K, S>;
  //mapOfIndexByKey: Map<K, number>;
}

export function isISourceCollectionNodeWrapper(o: any): o is ISourceCollectionNodeWrapper<any, any, any> {
  return o && o.elements && isISourceInternalNodeWrapper(o) && isIMakeCollectionKey(o);
}

export type RdoNodeTypes<K extends string | number, S, D> = D | Array<D> | Map<K, D> | Set<D> | ISyncableRDOCollection<K, S, D> | null | undefined;

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
}

export function isIRdoNodeWrapper(o: any): o is IRdoNodeWrapper<any, any, any> {
  return o && o.value !== undefined && o.typeInfo && o.wrappedSourceNode && 'ignore' in o && o.childElementCount && o.smartSync;
}

export interface IRdoInternalNodeWrapper<K extends string | number, S, D> extends IRdoNodeWrapper<K, S, D>, IMakeRdoElement<S, D> {
  getItem(key: K): D | null | undefined;
}

export function isIRdoInternalNodeWrapper(o: any): o is IRdoInternalNodeWrapper<any, any, any> {
  return o && o.getItem && isIMakeRdoElement(o) && isIRdoNodeWrapper(o);
}

export interface IRdoCollectionNodeWrapper<K extends string | number, S, D> extends IRdoInternalNodeWrapper<K, S, D> {
  elements(): Iterable<D | undefined>;
}

export function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any, any> {
  return o && o.elements && isIRdoInternalNodeWrapper(o) && isIMakeCollectionKey(o);
}

export interface IMakeRdo<K extends string | number, S, D> {
  makeRdo(sourceObject: S, parentRdoNodeWrapper: IRdoNodeWrapper<K, S, D>): D | undefined;
}

export function isIMakeRdo(o: any): o is IMakeRdo<any, any, any> {
  return o && o.makeRdo;
}

export type ISyncChildNode = <K extends string | number, S, D>({ wrappedParentRdoNode, rdoNodeItemKey, sourceNodeItemKey }: { wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any, any>; rdoNodeItemKey: K; sourceNodeItemKey: K }) => boolean;

export type IWrapRdoNode = <K extends string | number, S, D>({
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
  wrappedParentRdoNode?: IRdoInternalNodeWrapper<any, any, any> | undefined;
  rdoNodeItemKey?: K | undefined;
  sourceNodeItemKey?: K | undefined;
}) => IRdoNodeWrapper<K, S, D>;
