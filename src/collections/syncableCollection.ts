import { observable, computed, action } from 'mobx';
import { IDomainModelFactory, ISyncableCollection, CollectionUtils } from '..';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('SyncableCollection');

export class SyncableCollection<S extends object, D extends object> implements IDomainModelFactory<S, D>, ISyncableCollection<D> {
  private _makeDomainNodeKeyFromSourceNode: (node: S) => string;
  private _makeDomainNodeKeyFromDomainModel: (node: D) => string;
  private _makeDomainModel: (sourceItem: S) => D;

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
    makeDomainNodeKeyFromSourceNode,
    makeDomainNodeKeyFromDomainModel,
    makeDomainModel,
  }: {
    makeDomainNodeKeyFromSourceNode: (sourceNode: S) => string;
    makeDomainNodeKeyFromDomainModel: (domainNode: D) => string;
    makeDomainModel: (sourceNode: S) => D;
  }) {
    this._makeDomainNodeKeyFromSourceNode = makeDomainNodeKeyFromSourceNode;
    this._makeDomainNodeKeyFromDomainModel = makeDomainNodeKeyFromDomainModel;
    this._makeDomainModel = makeDomainModel;
    this._map$ = new Map<string, D>();
  }

  // -----------------------------------
  // IDomainModelFactory
  // -----------------------------------
  public makeDomainNodeKeyFromSourceNode = (sourceNode: S) => {
    return this._makeDomainNodeKeyFromSourceNode(sourceNode);
  };

  public makeDomainNodeKeyFromDomainModel = (domainNode: D) => {
    return this._makeDomainNodeKeyFromDomainModel(domainNode);
  };

  public makeDomainModel = (sourceItem: S) => {
    return this._makeDomainModel(sourceItem);
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
    CollectionUtils.Array.deleteItem<D>({ collection: this._array$!, key, makeKey: this._makeDomainNodeKeyFromDomainModel });
  };

  public clear = () => {
    this._map$.clear();
    CollectionUtils.Array.clear({ collection: this._array$! });
  };
}
