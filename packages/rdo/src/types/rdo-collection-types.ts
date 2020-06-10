/* eslint-disable @typescript-eslint/interface-name-prefix */

//--------------------------------------------------------
// RDO COLLECTION - SYNC CUSTOMIZATION INTERFACES
//-------------------------------------------------------

export interface IMakeRdoCollectionKey<T> {
  (item: T): string;
}

export interface IMakeRDO<S, D> {
  (sourceObject: S): D;
}

// *See `Strict` note above top of file
export interface IRdoCollectionKeyFactoryStrict<S, D> {
  fromSourceElement: IMakeRdoCollectionKey<S>;
  fromRdoElement: IMakeRdoCollectionKey<D>;
}

export interface IRdoCollectionKeyFactory<S, D> {
  fromSourceElement?: IMakeRdoCollectionKey<S>;
  fromRdoElement?: IMakeRdoCollectionKey<D>;
}

export interface ISyncableCollection<T> extends Iterable<[string, T]> {
  readonly size: number;
  getKeys: () => string[];
  tryGetItemFromTargetCollection: (key: string) => T | null | undefined;
  insertItemToTargetCollection: (key: string, value: T) => void;
  updateItemInTargetCollection: (key: string, value: T) => void;
  tryDeleteItemFromTargetCollection: (key: string) => void;
  clear: () => void;
}

export function IsISyncableCollection(o: any): o is ISyncableCollection<any> {
  return (
    o &&
    o.getKeys &&
    typeof o.getKeys === 'function' &&
    o.tryGetItemFromTargetCollection &&
    typeof o.tryGetItemFromTargetCollection === 'function' &&
    o.insertItemToTargetCollection &&
    typeof o.insertItemToTargetCollection === 'function' &&
    o.tryDeleteItemFromTargetCollection &&
    typeof o.tryDeleteItemFromTargetCollection === 'function' &&
    o.clear &&
    typeof o.clear === 'function'
  );
}

export interface ISyncableRDOCollection<S, D> extends ISyncableCollection<D> {
  makeRdoCollectionKeyFromSourceElement?: IMakeRdoCollectionKey<S>;
  makeRdoCollectionKeyFromRdoElement?: IMakeRdoCollectionKey<D>;
  makeRdo: IMakeRDO<S, D>;
}

export function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any> {
  return o && o.makeRdo && typeof o.makeRdo === 'function' && IsISyncableCollection(o);
}

/***************************************************************************
 * NOTES:
 *
 * Node Sync Options
 *
 * We have *Strict interfaces is because we want to support one internal
 * use case where a `fromRdoElement` factory does not need to be supplied, but in all user-config supplied
 * use cases, require both `fromSourceElement` and `fromRdoElement` for a DomainNodeKeyFactory config
 *
 *****************************************************************************/
