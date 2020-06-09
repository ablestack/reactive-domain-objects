import { observable, computed } from 'mobx';
import { ISyncableRDOCollection, CollectionUtils } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';

const logger = Logger.make('SyncableCollection');

export class SyncableCollection<S extends object, D extends object> implements ISyncableRDOCollection<S, D> {
  private _makeRdoCollectionKeyFromSourceElement: (node: S) => string;
  private _makeRdoCollectionKeyFromRdoElement: (node: D) => string;
  private _makeRdo: (sourceItem: S) => D;

  @observable.shallow private _map$: Map<string, D>;

  @computed public get size(): number {
    return this._map$.size;
  }

  @computed public get map$(): Map<string, D> {
    return this._map$;
  }

  @observable.shallow private _array$ = new Array<D>();
  @computed public get array$(): Array<D> {
    return this._array$;
  }

  constructor({
    makeRdoCollectionKeyFromSourceElement,
    makeRdoCollectionKeyFromRdoElement,
    makeRdo,
  }: {
    makeRdoCollectionKeyFromSourceElement: (sourceNode: S) => string;
    makeRdoCollectionKeyFromRdoElement: (rdo: D) => string;
    makeRdo: (sourceNode: S) => D;
  }) {
    this._makeRdoCollectionKeyFromSourceElement = makeRdoCollectionKeyFromSourceElement;
    this._makeRdoCollectionKeyFromRdoElement = makeRdoCollectionKeyFromRdoElement;
    this._makeRdo = makeRdo;
    this._map$ = new Map<string, D>();
  }

  // -----------------------------------
  // IRdoFactory
  // -----------------------------------
  public makeRdoCollectionKeyFromSourceElement = (sourceNode: S) => {
    return this._makeRdoCollectionKeyFromSourceElement(sourceNode);
  };

  public makeRdoCollectionKeyFromRdoElement = (rdo: D) => {
    return this._makeRdoCollectionKeyFromRdoElement(rdo);
  };

  public makeRdo = (sourceItem: S) => {
    return this._makeRdo(sourceItem);
  };

  [Symbol.iterator](): Iterator<D> {
    return this.array$[Symbol.iterator]();
  }

  // -----------------------------------
  // ISyncableCollection
  // -----------------------------------
  public getKeys = () => {
    return Array.from(this._map$.keys());
  };

  public tryGetItemFromTargetCollection = (key: string) => {
    return this._map$.get(key);
  };

  public insertItemToTargetCollection = (key: string, value: D) => {
    this._map$.set(key, value);
    CollectionUtils.Array.insertItem<D>({ collection: this._array$!, key, value });
  };

  public updateItemInTargetCollection = (key: string, value: D) => {
    this._map$.set(key, value);
    CollectionUtils.Array.insertItem<D>({ collection: this._array$!, key, value });
  };

  public tryDeleteItemFromTargetCollection = (key: string) => {
    this._map$.delete(key);
    CollectionUtils.Array.deleteItem<D>({ collection: this._array$!, key, makeCollectionKey: this._makeRdoCollectionKeyFromRdoElement });
  };

  public clear = () => {
    this._map$.clear();
    CollectionUtils.Array.clear({ collection: this._array$! });
  };
}
