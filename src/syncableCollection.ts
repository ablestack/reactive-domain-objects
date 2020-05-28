import { observable, computed, action } from 'mobx';
import { Logger, ISyncableDomainObject, ISyncableDomainObjectFactory } from '.';

const logger = Logger.make('SyncableCollection');

export class SyncableCollection<S extends object, K, D extends ISyncableDomainObject<S>> implements ISyncableDomainObjectFactory<S, D> {
  private _sourceCollection: Iterable<S>;
  private _getItemKey: (soureItem: S) => K;
  private _createItem: (sourceItem: S) => D;

  @observable.shallow private _map$: Map<K, D>;

  @computed public get size$(): number {
    return this._map$.size;
  }

  @computed public get map$(): Map<K, D> {
    return this._map$;
  }

  @observable.shallow private _array$: Array<D> | null | undefined;
  @computed public get array$(): Array<D> {
    if (!this._array$) {
      this._array$ = Array.from(this.map$.values());
    }
    return this._array$;
  }

  constructor({ getItemKey, createItem }: { getItemKey: (soureItem: S) => K; createItem: (sourceItem: S) => D }) {
    this._getItemKey = getItemKey;
    this._createItem = createItem;
    this._map$ = new Map<K, D>();
  }

  public makeKey: (soureItem: S) => string;
  public makeDomainObject: (sourceItem: S) => D;
}
