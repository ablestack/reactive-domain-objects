/* eslint-disable @typescript-eslint/interface-name-prefix */

export type JavaScriptDefaultTypes =
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

export interface IGraphSynchronizer {
  synchronize<S extends Record<string, any>, D extends Record<string, any>>({ rootsourceObject, rootDomainObject }: { rootsourceObject: S; rootDomainObject: D });
}

export interface IGraphSyncOptions {
  defaultEqualityChecker?: IEqualityComparer; //defaultEqualityChecker is apolloComparer
  globalPropertyNameTransformations?: IGlobalPropertyNameTransformation;
  pathMap?: Map<string, IPropertySyncOptions<any, any>>;
  typeMap?: Map<string, IPropertySyncOptions<any, any>>;
}

export interface IGlobalPropertyNameTransformation {
  tryStandardPostfix?: string;
  makePropertyName?: (sourcePropertyName) => string;
}

export interface IPropertySyncOptions<S extends object, D extends object> {
  ignore?: boolean;
  syncFactory?: ISyncableDomainObjectFactory<S, D>;
}

export interface IMakeKey<S> {
  (soureItem: S): string;
}

export interface IMakeDomainObject<S, D> {
  (sourceObject: S): D;
}

export interface ISyncableDomainObjectFactory<S extends object, D extends object> {
  makeKey: IMakeKey<S>;
  makeDomainObject: IMakeDomainObject<S, D>;
}

export function IsISyncableDomainObjectFactory(o: any): o is ISyncableDomainObjectFactory<any, any> {
  return o && o.makeKey && typeof o.makeKey === 'function' && o.makeDomainObject && typeof o.makeDomainObject === 'function';
}

export interface ISyncableCollection<T> {
  getKeys: () => string[];
  getItem: (key: string) => T | null | undefined;
  upsertItem: (key: string, value: T) => void;
  deleteItem: (key: string) => void;
}

export function IsISyncableCollection(o: any) {
  return o && o.getKeys && typeof o.getKeys === 'function' && o.getItem && typeof o.getItem === 'function' && o.upsertItem && typeof o.upsertItem === 'function' && o.deleteItem && typeof o.deleteItem === 'function';
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
