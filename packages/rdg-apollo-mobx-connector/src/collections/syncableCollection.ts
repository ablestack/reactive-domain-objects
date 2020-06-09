import { observable, computed } from 'mobx';
import { ISyncableRDOCollection, CollectionUtils } from '@ablestack/rdg';
import { Logger } from '@ablestack/rdg/infrastructure/logger';

const logger = Logger.make('SyncableCollection');

export class SyncableCollection<S extends object, D extends object> implements ISyncableRDOCollection<S, D> {
  private _makeRDOCollectionKeyFromSourceElement: (node: S) => string;
  private _makeRDOCollectionKeyFromDomainElement: (node: D) => string;
  private _makeRDO: (sourceItem: S) => D;

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
    makeRDOCollectionKeyFromSourceElement,
    makeRDOCollectionKeyFromDomainElement,
    makeRDO,
  }: {
    makeRDOCollectionKeyFromSourceElement: (sourceNode: S) => string;
    makeRDOCollectionKeyFromDomainElement: (domainNode: D) => string;
    makeRDO: (sourceNode: S) => D;
  }) {
    this._makeRDOCollectionKeyFromSourceElement = makeRDOCollectionKeyFromSourceElement;
    this._makeRDOCollectionKeyFromDomainElement = makeRDOCollectionKeyFromDomainElement;
    this._makeRDO = makeRDO;
    this._map$ = new Map<string, D>();
  }

  // -----------------------------------
  // IRDOFactory
  // -----------------------------------
  public makeRDOCollectionKeyFromSourceElement = (sourceNode: S) => {
    return this._makeRDOCollectionKeyFromSourceElement(sourceNode);
  };

  public makeRDOCollectionKeyFromDomainElement = (domainNode: D) => {
    return this._makeRDOCollectionKeyFromDomainElement(domainNode);
  };

  public makeRDO = (sourceItem: S) => {
    return this._makeRDO(sourceItem);
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
    CollectionUtils.Array.deleteItem<D>({ collection: this._array$!, key, makeKey: this._makeRDOCollectionKeyFromDomainElement });
  };

  public clear = () => {
    this._map$.clear();
    CollectionUtils.Array.clear({ collection: this._array$! });
  };
}
