/* eslint-disable @typescript-eslint/interface-name-prefix */

import { SimpleDomainModel } from '../test';

export type JavaScriptBuiltInType =
  | '[object Array]'
  | '[object Boolean]'
  | '[object Date]'
  | '[object Error]'
  | '[object Map]'
  | '[object Number]'
  | '[object Object]'
  | '[object RegExp]'
  | '[object Set]'
  | '[object String]'
  | '[object Undefined]';

export type JsonNodeKind = 'objectProperty' | 'arrayElement';

export type SourceNodeType = 'Primitive' | 'Array' | 'Object';
export type SourceNodeTypeInfo = { type: SourceNodeType | undefined; builtInType: JavaScriptBuiltInType };

export type DomainNodeType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export type DomainNodeTypeInfo = { type: DomainNodeType | undefined; builtInType: JavaScriptBuiltInType };

export interface IGraphSynchronizer {
  smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootDomainNode }: { rootSourceNode: S; rootDomainNode: D });
}

export interface IGraphSyncOptions {
  customEqualityComparer?: IEqualityComparer; //customEqualityComparer is apolloComparer
  globalNodeOptions?: IGlobalPropertyNameTransformation;
  targetedNodeOptions?: Array<INodeSyncOptionsStrict<any, any>>;
}

export interface IGlobalPropertyNameTransformation {
  commonDomainFieldnamePostfix?: string;
  computeDomainFieldname?: ({ sourceNodePath, sourcePropKey, sourcePropVal }: { sourceNodePath: string; sourcePropKey: string; sourcePropVal: any }) => string;
}

/***************************************************************************
 * Node Sync Options
 *
 * We have *Strict interfaces is because we want to support one internal
 * use case where a `fromDomainNode` factory does not need to be supplied, but in all user-config supplied
 * use cases, require both `fromSourceNode` and `fromDomainNode` for a DomainNodeKeyFactory config
 *
 *****************************************************************************/

export interface INodeSyncOptionsStrict<S, D> {
  sourceNodeMatcher: INodeSelector<S>;
  ignore?: boolean;
  domainCollection?: IDomainModelFactory<S, D>;
}

export interface INodeSyncOptions<S, D> {
  sourceNodeMatcher: INodeSelector<S>;
  ignore?: boolean;
  domainCollection?: IDomainModelFactory<S, D>;
}

export interface INodeSyncOptionsStrict<S, D> {
  sourceNodeMatcher: INodeSelector<S>;
  ignore?: boolean;
  domainCollection?: IDomainModelFactory<S, D>;
}

export interface INodeSelector<S> {
  nodePath?: string;
  nodeContent?: (sourceNode: S) => boolean;
}

export interface IMakeKey<T> {
  (item: T): string;
}

export interface IMakeDomainModel<S, D> {
  (sourceObject: S): D;
}

export interface IDomainModelFactory<S, D> {
  makeCollectionKey?: IDomainNodeKeyFactory<S, D>;
  makeDomainModel: IMakeDomainModel<S, D>;
}

export interface IDomainModelFactoryStrict<S, D> {
  makeCollectionKey?: IDomainNodeKeyFactoryStrict<S, D>;
  makeDomainModel: IMakeDomainModel<S, D>;
}

// *See `Strict` note above top of file
export interface IDomainNodeKeyFactoryStrict<S, D> {
  fromSourceNode: IMakeKey<S>;
  fromDomainNode: IMakeKey<D>;
}

export interface IDomainNodeKeyFactory<S, D> {
  fromSourceNode: IMakeKey<S>;
  fromDomainNode?: IMakeKey<D>;
}

// --------------------------------------------------
// Types relating to sync custom behavior and options
// --------------------------------------------------

export function IsIDomainModelFactory(o: any): o is IDomainModelFactory<any, any> {
  return (
    o &&
    o.makeDomainNodeKeyFromSourceNode &&
    typeof o.makeDomainNodeKeyFromSourceNode === 'function' &&
    o.makeDomainNodeKeyFromDomainNode &&
    typeof o.makeDomainNodeKeyFromDomainNode === 'function' &&
    o.makeDomainModel &&
    typeof o.makeDomainModel === 'function'
  );
}

export interface ISyncableCollection<T> extends Iterable<T> {
  readonly size: number;
  getKeys: () => string[];
  tryGetItemFromTargetCollection: (key: string) => T | null | undefined;
  insertItemToTargetCollection: (key: string, value: T) => void;
  updateItemInTargetCollection: (key: string, value: T) => void;
  tryDeleteItemFromTargetCollection: (key: string) => void;
  clear: () => void;
}

export function IsISyncableCollection(o: any) {
  return (
    o &&
    o.getKeys &&
    typeof o.getKeys === 'function' &&
    o.tryGetItemFromTargetCollection &&
    typeof o.tryGetItemFromTargetCollection === 'function' &&
    o.insertItemToTargetCollection &&
    typeof o.insertItemToTargetCollection === 'function' &&
    o.tryDeleteItemFromTargetCollection &&
    typeof o.tryDeleteItemFromTargetCollection === 'function'
  );
}

export interface ISynchronizeState<S> {
  ({ sourceObject, graphSynchronizer }: { sourceObject: S | null | undefined; graphSynchronizer: IGraphSynchronizer }): boolean;
}

export interface IStateEqual<S> {
  (sourceObject: S | null | undefined, previousSourceObject: S | null | undefined): boolean;
}

export interface IBeforeSyncIfNeeded<S> {
  beforeSyncIfNeeded: ({ sourceObject, isSyncNeeded }: { sourceObject: S; isSyncNeeded: boolean }) => void;
}

export function IsIBeforeSyncIfNeeded(o: any): o is IBeforeSyncIfNeeded<any> {
  return o && o.beforeSyncIfNeeded && typeof o.beforeSyncIfNeeded === 'function';
}

export interface IBeforeSyncUpdate<S> {
  beforeSyncUpdate: ({ sourceObject }: { sourceObject: S }) => void;
}

export function IsIBeforeSyncUpdate(o: any): o is IBeforeSyncUpdate<any> {
  return o && o.beforeSyncUpdate && typeof o.beforeSyncUpdate === 'function';
}

export interface ICustomSync<S> {
  synchronizeState: ISynchronizeState<S>;
}

export function IsICustomSync(o: any): o is ICustomSync<any> {
  return o && o.synchronizeState && typeof o.synchronizeState === 'function';
}

export interface IAfterSyncUpdate<S> {
  afterSyncUpdate: ({ sourceObject }: { sourceObject: S }) => void;
}

export function IsIAfterSyncUpdate(o: any): o is IAfterSyncUpdate<any> {
  return o && o.afterSyncUpdate && typeof o.afterSyncUpdate === 'function';
}

export interface IAfterSyncIfNeeded<S> {
  afterSyncIfNeeded: ({ sourceObject, syncAttempted, domainModelChanged }: { sourceObject: S; syncAttempted: boolean; domainModelChanged: boolean }) => void;
}

export function IsIAfterSyncIfNeeded(o: any): o is IAfterSyncIfNeeded<any> {
  return o && o.afterSyncIfNeeded && typeof o.afterSyncIfNeeded === 'function';
}

export interface ICustomEqualityDomainModel<S> {
  isStateEqual: IStateEqual<S>;
}

export function IsICustomEqualityDomainModel(o: any): o is ICustomEqualityDomainModel<any> {
  return o && o.isStateEqual && typeof o.isStateEqual === 'function';
}

// --------------------------------------------------

export interface IEqualityComparer {
  (a: any, b: any): boolean;
}
