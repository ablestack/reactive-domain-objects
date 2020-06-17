/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IGlobalNodeOptions, INodeSyncOptions } from '.';
import { ISyncableRDOCollection, IMakeCollectionKey, isIMakeCollectionKey, IMakeRdoElement, isIMakeRdoElement } from './rdo-collection-types';

export type JavaScriptBuiltInType = '[object Array]' | '[object Boolean]' | '[object Date]' | '[object Error]' | '[object Map]' | '[object Number]' | '[object Object]' | '[object RegExp]' | '[object Set]' | '[object String]' | '[object Undefined]';

export type NodeKind = 'Primitive' | 'Collection' | 'Object';
//export type ChildElementsNodeKind = NodeKind | null;
export type InternalNodeKind = Exclude<NodeKind, 'Primitive'>;

export type SourceNodeTypeInfo = { kind: NodeKind; builtInType: JavaScriptBuiltInType };

export type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export type RdoNodeTypeInfo = { kind: NodeKind; type: RdoFieldType | undefined; builtInType: JavaScriptBuiltInType };

export interface ISourceNodeWrapper<S> {
  readonly typeInfo: SourceNodeTypeInfo;
  readonly value: S | Iterable<S> | null | undefined;
  readonly key: string | undefined;
  readonly sourceNodePath: string;
  readonly lastSourceNode: S | undefined;
  readonly matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
  readonly globalNodeOptions: IGlobalNodeOptions | undefined;
  readonly wrappedRdoNode: IRdoNodeWrapper<S, any> | undefined;
  setRdoNode(rdoNode: IRdoNodeWrapper<S, any>): void;
  childElementCount(): number;
}

export function isISourceNodeWrapper(o: any): o is ISourceNodeWrapper<any> {
  return o && o.typeInfo && 'value' in o && o.setRdoNode && o.childElementCount;
}

export interface ISourceInternalNodeWrapper<S> extends ISourceNodeWrapper<S> {
  nodeKeys(): Iterable<string>;
  getItem(key: string): S | null | undefined;
}

export function isISourceInternalNodeWrapper(o: any): o is ISourceInternalNodeWrapper<any> {
  return o && o.nodeKeys && o.getItem && isISourceNodeWrapper(o);
}

export interface ISourceCollectionNodeWrapper<S> extends ISourceInternalNodeWrapper<S>, IMakeCollectionKey<S> {
  //readonly childElementsNodeKind: NodeKind;
  elements(): Iterable<S>;
}

export function isISourceCollectionNodeWrapper(o: any): o is ISourceCollectionNodeWrapper<any> {
  return o && o.elements && isISourceInternalNodeWrapper(o) && isIMakeCollectionKey(o);
}

export type RdoNodeTypes<S, D> = D | Array<D> | Map<string, D> | Set<D> | ISyncableRDOCollection<S, D> | null | undefined;

export interface IRdoNodeWrapper<S, D> {
  readonly value: RdoNodeTypes<S, D>;
  readonly key: string | undefined;
  readonly wrappedParentRdoNode: IRdoNodeWrapper<any, any> | undefined;
  readonly typeInfo: RdoNodeTypeInfo;
  readonly wrappedSourceNode: ISourceNodeWrapper<S>;
  readonly globalNodeOptions: IGlobalNodeOptions | undefined;
  readonly ignore: boolean;
  getNodeOptions(): INodeSyncOptions<any, any> | null;
  childElementCount(): number;
  smartSync(): boolean;
}

export function isIRdoNodeWrapper(o: any): o is IRdoNodeWrapper<any, any> {
  return o && o.value !== undefined && o.typeInfo && o.wrappedSourceNode && 'ignore' in o && o.childElementCount && o.smartSync;
}

export interface IRdoInternalNodeWrapper<S, D> extends IRdoNodeWrapper<S, D> {
  itemKeys(): Iterable<string>;
  getElement(key: string): D | null | undefined;
  updateElement(key: string, value: D): boolean;
}

export function isIRdoInternalNodeWrapper(o: any): o is IRdoInternalNodeWrapper<any, any> {
  return o && o.itemKeys && o.getElement && o.updateElement && isIRdoNodeWrapper(o);
}

export interface IRdoCollectionNodeWrapper<S, D> extends IRdoInternalNodeWrapper<S, D>, IMakeRdoElement<S, D>, IMakeCollectionKey<D> {
  //readonly childElementsNodeKind: ChildElementsNodeKind;
  elements(): Iterable<D>;
  insertElement(key: string, value: D): void;
  deleteElement(key: string): boolean;
  clearElements(): boolean;
}

export function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any> {
  return o && o.elements && o.insertElement && o.deleteElement && o.clearElements && isIMakeRdoElement(o) && isIRdoInternalNodeWrapper(o) && isIMakeCollectionKey(o);
}

export interface IMakeRdo<S, D> {
  makeRdo(sourceObject: S, parentRdoNodeWrapper: IRdoNodeWrapper<S, D>): D | undefined;
}

export function isIMakeRdo(o: any): o is IMakeRdo<any, any> {
  return o && o.makeRdo;
}

export type ISyncChildNode<S, D> = ({
  wrappedParentRdoNode,
  rdoNodeItemValue,
  rdoNodeItemKey,
  sourceNodeItemKey,
}: {
  wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any>;
  rdoNodeItemValue: any;
  rdoNodeItemKey: string;
  sourceNodeItemKey: string;
}) => boolean;

export type IWrapRdoNode = ({
  sourceNodePath,
  rdoNode,
  sourceNode,
  wrappedParentRdoNode: parentRdoNode,
  rdoNodeItemKey,
  sourceNodeItemKey,
}: {
  sourceNodePath: string;
  rdoNode: object;
  sourceNode: object;
  wrappedParentRdoNode?: IRdoNodeWrapper<unknown, unknown> | undefined;
  rdoNodeItemKey?: string | undefined;
  sourceNodeItemKey?: string | undefined;
}) => IRdoNodeWrapper<unknown, unknown>;
