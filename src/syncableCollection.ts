import { observable, computed, action } from 'mobx';
import { ISyncableDomainObjectFactory, ICustomEqualityDomainObject, ICustomSyncDomainObject } from '.';
import { ISyncableCollection } from './types';
import { Logger } from './logger';

const logger = Logger.make('SyncableCollection');

export class SyncableCollection<S extends object, D extends object> implements ISyncableDomainObjectFactory<S, D>, ISyncableCollection<D> {
  private _makeItemKey: (soureItem: S) => string;
  private _makeItem: (sourceItem: S) => D;

  @observable.shallow private _map$: Map<string, D>;

  @computed public get size$(): number {
    return this._map$.size;
  }

  @computed public get map$(): Map<string, D> {
    return this._map$;
  }

  @observable.shallow private _array$: Array<D> | null | undefined;
  @computed public get array$(): Array<D> {
    if (!this._array$) {
      this._array$ = Array.from(this.map$.values());
    }
    return this._array$;
  }

  constructor({ makeItemKey, makeItem }: { makeItemKey: (soureItem: S) => string; makeItem: (sourceItem: S) => D }) {
    this._makeItemKey = makeItemKey;
    this._makeItem = makeItem;
    this._map$ = new Map<string, D>();
  }

  // -----------------------------------
  // ISyncableDomainObjectFactory
  // -----------------------------------
  public makeKey = (soureItem: S) => {
    return this._makeItemKey(soureItem);
  };

  public makeDomainObject = (sourceItem: S) => {
    return this._makeItem(sourceItem);
  };

  // -----------------------------------
  // ISyncableCollection
  // -----------------------------------
  public getKeys = () => {
    return Array.from(this._map$.keys());
  };
  public getItem = (key: string) => {
    return this._map$.get(key);
  };

  public upsertItem = (key: string, value: D) => {
    this._map$.set(key, value);
  };

  public deleteItem = (key: string) => {
    this._map$.delete(key);
  };
}
