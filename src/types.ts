/* eslint-disable @typescript-eslint/interface-name-prefix */

import { SimpleObjectDomainModel } from '../test';

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
  synchronize<S extends Record<string, any>, D extends Record<string, any>>({ rootsourceObject, rootDomainModel }: { rootsourceObject: S; rootDomainModel: D });
}

export interface IGraphSyncOptions {
  defaultEqualityChecker?: IEqualityComparer; //defaultEqualityChecker is apolloComparer
  globalOptions?: IGlobalPropertyNameTransformation;
  targetedOptions?: Array<IPropertySyncOptions<any, any>>;
}

export interface IGlobalPropertyNameTransformation {
  tryStandardPostfix?: string;
  makePropertyName?: (sourcePropertyName) => string;
}

export interface IPropertySyncOptions<S extends object, D extends object> {
  selector: INodeSelector<S>;
  ignore?: boolean;
  domainModelCreation?: IDomainModelFactory<S, D>;
}

export interface INodeSelector<S> {
  path?: string;
  matcher?: (sourceNode: S) => boolean;
}

export interface IMakeKey<T> {
  (item: T): string;
}

export interface IMakeDomainModel<S, D> {
  (sourceObject: S): D;
}

export interface IDomainModelFactory<S extends object, D extends object> {
  makeKeyFromSourceNode: IMakeKey<S>;
  makeKeyFromDomainNode: IMakeKey<D>;
  makeDomainModel: IMakeDomainModel<S, D>;
}

export function IsIDomainModelFactory(o: any): o is IDomainModelFactory<any, any> {
  return (
    o &&
    o.makeKeyFromSourceNode &&
    typeof o.makeKeyFromSourceNode === 'function' &&
    o.makeKeyFromDomainNode &&
    typeof o.makeKeyFromDomainNode === 'function' &&
    o.makeDomainModel &&
    typeof o.makeDomainModel === 'function'
  );
}

export interface ISyncableCollection<T> extends Iterable<T> {
  readonly size: number;
  getKeys: () => string[];
  getItemFromTargetCollection: (key: string) => T | null | undefined;
  insertItemToTargetCollection: (key: string, value: T) => void;
  updateItemInTargetCollection: (key: string, value: T) => void;
  deleteItemFromTargetCollection: (key: string) => void;
  clear: () => void;
}

export function IsISyncableCollection(o: any) {
  return (
    o &&
    o.getKeys &&
    typeof o.getKeys === 'function' &&
    o.getItemFromTargetCollection &&
    typeof o.getItemFromTargetCollection === 'function' &&
    o.insertItemToTargetCollection &&
    typeof o.insertItemToTargetCollection === 'function' &&
    o.deleteItemFromTargetCollection &&
    typeof o.deleteItemFromTargetCollection === 'function'
  );
}

export interface ISynchronizeState<S extends object> {
  ({ sourceObject, graphSynchronizer }: { sourceObject: S | null | undefined; graphSynchronizer: IGraphSynchronizer }): boolean;
}

export interface IStateEqual<S extends object> {
  (sourceObject: S | null | undefined, previousSourceObject: S | null | undefined): boolean;
}

export interface ICustomSyncDomainModel<S extends object> {
  synchronizeState: ISynchronizeState<S>;
}

export function IsICustomSyncDomainModel(o: any): o is ICustomSyncDomainModel<any> {
  return o && o.synchronizeState && typeof o.synchronizeState === 'function';
}

export interface ICustomEqualityDomainModel<S extends object> {
  isStateEqual: IStateEqual<S>;
}

export function IsICustomEqualityDomainModel(o: any): o is ICustomEqualityDomainModel<any> {
  return o && o.isStateEqual && typeof o.isStateEqual === 'function';
}

export interface IEqualityComparer {
  (a: any, b: any): boolean;
}
