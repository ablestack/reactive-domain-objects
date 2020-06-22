//--------------------------------------------------------
// RDO - SYNC CUSTOMIZATION INTERFACES TYPES
//-------------------------------------------------------

export interface IHasCustomRdoFieldNames<K extends string> {
  tryGetRdoFieldname: ({ sourceNodePath, sourceFieldname, sourceFieldVal }: { sourceNodePath: string; sourceFieldname: K; sourceFieldVal: any }) => K | undefined;
}

export function IsIHasCustomRdoFieldNames(o: any): o is IHasCustomRdoFieldNames<any> {
  return o && o.tryGetRdoFieldname && typeof o.tryGetRdoFieldname === 'function';
}

export interface ICustomSync<S> {
  synchronizeState: ({ sourceObject, continueSmartSync }: { sourceObject: S; continueSmartSync: IContinueSmartSync }) => boolean;
}

export function IsICustomSync(o: any): o is ICustomSync<any> {
  return o && o.synchronizeState && typeof o.synchronizeState === 'function';
}

export type IContinueSmartSync = <K extends string | number, S, D>(smartSyncProps: SmartSyncProps<K, S, D>) => boolean;
export type SmartSyncProps<K, S, D> = { sourceNodeItemKey: K; sourceItemValue: S; rdoNodeItemKey: K; rdoNodeItemValue: D; sourceNodeSubPath?: string };

export interface ICustomEqualityRDO<S> {
  isStateEqual: (sourceObject: S | null | undefined, previousSourceObject: S | null | undefined) => boolean;
}

export function IsICustomEqualityRDO(o: any): o is ICustomEqualityRDO<any> {
  return o && o.isStateEqual && typeof o.isStateEqual === 'function';
}

//--------------------------------------------------------
// RDO - SYNC LIFECYCLE INTERFACES TYPES
//-------------------------------------------------------

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

export interface IAfterSyncUpdate<S> {
  afterSyncUpdate: ({ sourceObject }: { sourceObject: S }) => void;
}

export function IsIAfterSyncUpdate(o: any): o is IAfterSyncUpdate<any> {
  return o && o.afterSyncUpdate && typeof o.afterSyncUpdate === 'function';
}

export interface IAfterSyncIfNeeded<S> {
  afterSyncIfNeeded: ({ sourceObject, syncAttempted, RDOChanged }: { sourceObject: S; syncAttempted: boolean; RDOChanged: boolean }) => void;
}

export function IsIAfterSyncIfNeeded(o: any): o is IAfterSyncIfNeeded<any> {
  return o && o.afterSyncIfNeeded && typeof o.afterSyncIfNeeded === 'function';
}
