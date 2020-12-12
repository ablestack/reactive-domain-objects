//--------------------------------------------------------
// RDO - SYNC CUSTOMIZATION INTERFACES TYPES
//-------------------------------------------------------

export interface IHasCustomRdoFieldNames {
  tryGetRdoFieldname: ({ sourceNodeTypePath, sourceFieldname, sourceFieldVal }: { sourceNodeTypePath: string; sourceFieldname: string | number; sourceFieldVal: any }) => string | undefined;
}

export function IsIHasCustomRdoFieldNames(o: any): o is IHasCustomRdoFieldNames {
  return o && o.tryGetRdoFieldname && typeof o.tryGetRdoFieldname === 'function';
}

export interface ICustomSync<S> {
  synchronizeState: ({ sourceObject, continueSmartSync }: { sourceObject: S; continueSmartSync: IContinueSmartSync }) => boolean;
}

export function IsICustomSync(o: any): o is ICustomSync<any> {
  return o && o.synchronizeState && typeof o.synchronizeState === 'function';
}

export type IContinueSmartSync = <S, D>(smartSyncProps: SmartSyncProps<S, D>) => boolean;
export type SmartSyncProps<S, D> = { sourceNodeSubPath?: string; sourceNode: S; sourceNodeItemKey: string | number; rdoNode: D; rdoNodeItemKey: string | number };

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
  beforeSmartSync: ({ sourceObject, isSyncNeeded }: { sourceObject: S; isSyncNeeded: boolean }) => void;
}

export function IsIBeforeSmartSync(o: any): o is IBeforeSyncIfNeeded<any> {
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
  afterSyncIfNeeded: ({ sourceObject, rdoUpdateAttempted: syncAttempted, rdoWasChanged }: { sourceObject: S; rdoUpdateAttempted: boolean; rdoWasChanged: boolean }) => void;
}

export function IsIAfterSmartSync(o: any): o is IAfterSyncIfNeeded<any> {
  return o && o.afterSyncIfNeeded && typeof o.afterSyncIfNeeded === 'function';
}
