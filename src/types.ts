/* eslint-disable @typescript-eslint/interface-name-prefix */

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

export type JsonNodeType = 'objectProperty' | 'arrayElement';

export interface IGraphSynchronizer {
  synchronize<S extends Record<string, any>, D extends Record<string, any>>({ rootsourceObject, rootDomainObject }: { rootsourceObject: S; rootDomainObject: D });
}

export interface IGraphSyncOptions {
  defaultEqualityChecker?: IEqualityComparer; //defaultEqualityChecker is apolloComparer
  globalPropertyNameTransformations?: IGlobalPropertyNameTransformation;
  sourcePathMap?: Array<IPathMap>;
  sourceTypeMap?: Array<ITypeMap>;
}

export interface IPathMap {
  path: string;
  options: IPropertySyncOptions<any, any>;
}

export interface ITypeMap {
  typeName: string;
  options: IPropertySyncOptions<any, any>;
}

export interface IGlobalPropertyNameTransformation {
  tryStandardPostfix?: string;
  makePropertyName?: (sourcePropertyName) => string;
}

export interface IPropertySyncOptions<S extends object, D extends object> {
  ignore?: boolean;
  domainObjectCreation?: IDomainObjectFactory<S, D>;
}

export interface IMakeKey<T> {
  (item: T): string;
}

export interface IMakeDomainObject<S, D> {
  (sourceObject: S): D;
}

export interface IDomainObjectFactory<S extends object, D extends object> {
  makeKeyFromSourceElement: IMakeKey<S>;
  makeKeyFromDomainItem?: IMakeKey<D>;
  makeTargetCollectionItemFromSourceItem: IMakeDomainObject<S, D>;
}

export function IsIDomainObjectFactory(o: any): o is IDomainObjectFactory<any, any> {
  return o && o.makeKeyFromSourceElement && typeof o.makeKeyFromSourceElement === 'function' && o.makeTargetCollectionItemFromSourceItem && typeof o.makeTargetCollectionItemFromSourceItem === 'function';
}

export interface ISyncableCollection<T> {
  getKeys: () => string[];
  getItemFromTargetCollection: (key: string) => T | null | undefined;
  insertItemToTargetCollection: (key: string, value: T) => void;
  updateItemInTargetCollection: (key: string, value: T) => void;
  deleteItemFromTargetCollection: (key: string) => void;
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

export interface ICustomSyncDomainObject<S extends object> {
  synchronizeState: ISynchronizeState<S>;
}

export function IsICustomSyncDomainObject(o: any): o is ICustomSyncDomainObject<any> {
  return o && o.synchronizeState && typeof o.synchronizeState === 'function';
}

export interface ICustomEqualityDomainObject<S extends object> {
  isStateEqual: IStateEqual<S>;
}

export function IsICustomEqualityDomainObject(o: any): o is ICustomEqualityDomainObject<any> {
  return o && o.isStateEqual && typeof o.isStateEqual === 'function';
}

export interface IEqualityComparer {
  (a: any, b: any): boolean;
}
