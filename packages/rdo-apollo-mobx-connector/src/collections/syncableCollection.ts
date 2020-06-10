import { observable, computed } from 'mobx';
import { ISyncableRDOCollection, CollectionUtils, SyncUtils } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';

const logger = Logger.make('SyncableCollection');
/**
 *
 *
 * @export
 * @class SyncableCollection
 * @implements {ISyncableRDOCollection<S, D>}
 * @implements {Map<string, D>}
 * @template S
 * @template D
 * @description: A Map collection, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map in order to only trigger observable changes when necessary
 */
export class SyncableCollection<S, D> implements ISyncableRDOCollection<S, D>, Map<string, D> {
  @observable.shallow private _map$: Map<string, D>;

  // -----------------------------------
  // IRdoFactory
  // -----------------------------------
  public makeRdoCollectionKeyFromSourceElement?: (node: S) => string;
  public makeRdoCollectionKeyFromRdoElement?: (node: D) => string;
  public makeRdo: (sourceItem: S) => D;

  @computed public get size(): number {
    return this._map$.size;
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
    makeRdoCollectionKeyFromSourceElement?: (sourceNode: S) => string;
    makeRdoCollectionKeyFromRdoElement?: (rdo: D) => string;
    makeRdo: (sourceNode: S) => D;
  }) {
    this.makeRdoCollectionKeyFromSourceElement = makeRdoCollectionKeyFromSourceElement;
    this.makeRdoCollectionKeyFromRdoElement = makeRdoCollectionKeyFromRdoElement;
    this.makeRdo = makeRdo;
    this._map$ = new Map<string, D>();
  }

  // -----------------------------------
  // Map Interface
  // -----------------------------------
  delete(key: string): boolean {
    return this.tryDeleteItemFromTargetCollection(key);
  }
  forEach(callbackfn: (value: D, key: string, map: Map<string, D>) => void, thisArg?: any): void {
    this._map$.forEach(callbackfn);
  }
  get(key: string): D | undefined {
    return this._map$.get(key);
  }
  has(key: string): boolean {
    return this._map$.has(key);
  }
  set(key: string, value: D): this {
    this.insertItemToTargetCollection(key, value);
    return this;
  }
  [Symbol.iterator](): IterableIterator<[string, D]> {
    return this._map$.entries();
  }
  entries(): IterableIterator<[string, D]> {
    return this._map$.entries();
  }
  keys(): IterableIterator<string> {
    return this._map$.keys();
  }
  values(): IterableIterator<D> {
    return this._map$.values();
  }
  [Symbol.toStringTag]: string = '[object Map]';

  // -----------------------------------
  // ISyncableCollection
  // -----------------------------------
  public synchronizeCollection({ sourceCollection }: { sourceCollection: Array<S> }) {
    SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => this.size,
      getTargetCollectionKeys: this.getKeys,
      makeRdoCollectionKeyFromSourceElement: this.makeRdoCollectionKeyFromSourceElement, //TODO
      tryGetItemFromTargetCollection: (key) => this.tryGetItemFromTargetCollection(key),
      insertItemToTargetCollection: (key, value) => this.insertItemToTargetCollection(key, value),
      tryDeleteItemFromTargetCollection: (key) => this.tryDeleteItemFromTargetCollection(key),
      makeItemForTargetCollection: this.makeRdo,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          targetNodeKey: targetElementKey,
          targetNodeVal: targetElementVal,
          tryUpdateTargetNode: (key, value) => this.updateItemInTargetCollection(key, value),
        }),
    });
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
    const itemToDelete = this._map$.get(key);
    if (itemToDelete) {
      this._map$.delete(key);

      // Get index from array
      const indexOfItemToDelete = this.array$.indexOf(itemToDelete);
      if (indexOfItemToDelete !== -1) {
        this.array$.splice(indexOfItemToDelete, 1);
      } else {
        logger.error(`tryDeleteItemFromTargetCollection - could not find array item for key ${key}. Rebuilding array`);
        this._array$ = Array.from(this._map$.values());
      }

      return true;
    }
    return false;
  };

  public clear = () => {
    this._map$.clear();
    CollectionUtils.Array.clear({ collection: this._array$! });
  };
}
