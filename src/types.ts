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
  appendPrefixToObservableProperties?: string;
  pathMap?: Map<string, IPropertySyncOptions<any, any>>;
  typeMap?: Map<string, IPropertySyncOptions<any, any>>;
}

export interface IPropertySyncOptions<S extends object, D extends object> {
  ignore?: boolean;
  syncFactory: ISyncableDomainObjectFactory<S, D>;
}

export interface ISyncableDomainObjectFactory<S extends object, D extends object> {
  makeKey: (soureItem: S) => string;
  makeDomainObject: (sourceObject: S) => D;
}

export interface ISynchronizeState<S extends object> {
  ({ sourceObject, graphSynchronizer }: { sourceObject: S | null | undefined; graphSynchronizer: IGraphSynchronizer }): void;
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
