import { observable, computed } from 'mobx';
import { ISyncableRDOCollection, MakeCollectionKeyMethod, IRdoNodeWrapper, CollectionUtils, CollectionNodePatchOperation, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper, ISyncChildNode, NodeTypeUtils, NodeChange, IEqualityComparer } from '..';
import { Logger } from '../infrastructure/logger';
import { EventEmitter } from '../infrastructure/event-emitter';
import _ from 'lodash';

const logger = Logger.make('SyncableCollection');
/**
 *
 *
 * @export
 * @class ListMap
 * @implements {ISyncableRDOCollection<S, D>}
 * @implements {Map<K, D>}
 * @template S
 * @template D
 * @description: A readonly, syncable, Map-Array collection hybrid, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map so as to only trigger observable changes when necessary
 */
export class ListMap<K extends string | number, S, D> implements ISyncableRDOCollection<K, S, D> {
  @observable.shallow private _map$: Map<K, D>;
  private origSourceMap = new Map<K, S>();
  private origElementIndexMap = new Map<K, number>();

  // -----------------------------------
  // IRdoFactory
  // -----------------------------------
  private _makeCollectionKey?: MakeCollectionKeyMethod<K, S>;
  private _makeRdo?: (sourceItem: S) => D;

  @computed public get size(): number {
    return this._map$.size;
  }

  @observable.shallow private _array$ = new Array<D>();
  @computed public get array$(): Array<D> {
    return this._array$;
  }

  constructor({
    makeCollectionKey,
    makeRdo,
  }: {
    makeCollectionKey?: MakeCollectionKeyMethod<K, S>;
    makeRdo?: (sourceNode: S) => D;
  } = {}) {
    this._makeCollectionKey = makeCollectionKey;
    this._makeRdo = makeRdo;
    this._map$ = new Map<K, D>();
  }

  // -----------------------------------
  // Readonly Map Interface
  // -----------------------------------
  forEach(callbackfn: (value: D, key: K, map: Map<K, D>) => void, thisArg?: any): void {
    this._map$.forEach(callbackfn);
  }

  get(key: K): D | undefined {
    return this._map$.get(key);
  }

  has(key: K): boolean {
    return this._map$.has(key);
  }

  entries(): IterableIterator<[K, D]> {
    return this._map$.entries();
  }

  keys(): IterableIterator<K> {
    return this._map$.keys();
  }

  values(): IterableIterator<D> {
    return this._map$.values();
  }

  [Symbol.iterator](): IterableIterator<[K, D]> {
    return this._map$.entries();
  }

  [Symbol.toStringTag]: string = 'ListMap';

  // -----------------------------------
  // ISyncableRdoCollection
  // -----------------------------------
  public makeCollectionKey = (item: S): K => {
    if (!this._makeCollectionKey) throw new Error('Could not find makeCollectionKey method');
    return this._makeCollectionKey(item);
  };

  public elements(): Iterable<D> {
    return this._map$.values();
  }

  public getItem(key: K) {
    return this._map$.get(key);
  }

  public sync({ wrappedRdoNode, equalityComparer, syncChildNode, eventEmitter }: { wrappedRdoNode: IRdoInternalNodeWrapper<K, S, D>; equalityComparer: IEqualityComparer; syncChildNode: ISyncChildNode; eventEmitter: EventEmitter<NodeChange> }): boolean {
    //
    // Setup
    let changed = false;
    const wrappedSourceNode = wrappedRdoNode.wrappedSourceNode as ISourceCollectionNodeWrapper<K, S, D>;
    const origSourceMap = this.origSourceMap;
    const newSourceMap = new Map<K, S>();
    const newElementIndexMap = new Map<K, number>();
    const processedKeys = new Array<K>();

    // Loop and execute
    let indexOffset = 0;
    for (const elementKey of wrappedSourceNode.nodeKeys()) {
      const newSourceElement = wrappedSourceNode.getItem(elementKey)!;
      const previousSourceElement = origSourceMap.get(elementKey);
      processedKeys.push(elementKey);

      if (previousSourceElement === null || previousSourceElement === undefined) {
        // ---------------------------
        // New Key - ADD
        // ---------------------------
        const newRdo = wrappedRdoNode.makeRdoElement(newSourceElement);
        if (newRdo === null || newRdo === undefined) throw new Error('RDO can not be null or undefined');

        // Add operation
        this._map$.set(elementKey, newRdo);
        this._array$.splice(this.origElementIndexMap.get(elementKey)! + indexOffset, 0, newRdo);
        indexOffset++;

        // If not primitive, sync so child nodes are hydrated
        if (NodeTypeUtils.isPrimitive(newRdo)) syncChildNode({ wrappedParentRdoNode: wrappedRdoNode, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey });

        // Publish
        eventEmitter.publish('nodeChange', {
          changeType: 'add',
          sourceNodeTypePath: wrappedRdoNode.wrappedSourceNode.sourceNodeTypePath,
          index: undefined,
          sourceKey: elementKey,
          rdoKey: elementKey,
          previousSourceValue: undefined,
          newSourceValue: newSourceElement,
        });
      } else {
        // ---------------------------
        // Existing Key
        // ---------------------------
        if (equalityComparer(previousSourceElement, newSourceElement)) {
          // No change, no patch needed
        } else {
          if (NodeTypeUtils.isPrimitive(newSourceElement)) {
            // ---------------------------
            // REPLACE
            // ---------------------------
            // If non-equal primitive with same keys, just do a replace operation
            this._map$.set(elementKey, (newSourceElement as unknown) as D);
            this._array$.splice(this.origElementIndexMap.get(elementKey)! + indexOffset, 1, (newSourceElement as unknown) as D);

            // Publish
            eventEmitter.publish('nodeChange', {
              changeType: 'replace',
              sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
              index: undefined,
              sourceKey: elementKey,
              rdoKey: elementKey,
              previousSourceValue: previousSourceElement,
              newSourceValue: newSourceElement,
            });
          } else {
            // ---------------------------
            // UPDATE
            // ---------------------------
            // If non-equal non-primitive, step into child and sync
            changed = syncChildNode({ wrappedParentRdoNode: wrappedRdoNode, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey }) && changed;

            // Publish
            eventEmitter.publish('nodeChange', {
              changeType: 'update',
              sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
              index: undefined,
              sourceKey: elementKey,
              rdoKey: elementKey,
              previousSourceValue: previousSourceElement,
              newSourceValue: newSourceElement,
            });
          }
        }
      }

      const origCollectionKeys = Array.from<K>(this.origSourceMap.keys());
      const keysInOrigOnly = _.difference(origCollectionKeys, processedKeys);
      if (keysInOrigOnly.length > 0) {
        keysInOrigOnly.forEach((origKey) => {
          // ---------------------------
          // Missing Index - DELETE
          // ---------------------------
          const deletedItem = this._map$.get(origKey);

          // Delete operation
          this._map$.delete(elementKey);
          this._array$.splice(this.origElementIndexMap.get(origKey)! + indexOffset, 1);
          indexOffset--;

          // Publish
          eventEmitter.publish('nodeChange', {
            changeType: 'delete',
            sourceNodeTypePath: wrappedRdoNode.wrappedSourceNode.sourceNodeTypePath,
            index: undefined,
            sourceKey: origKey,
            rdoKey: origKey,
            previousSourceValue: deletedItem,
            newSourceValue: undefined,
          });
        });
        changed = true;
      }
    }

    // Update NodeCache
    this.origElementIndexMap = newElementIndexMap;
    this.origSourceMap = newSourceMap;

    return changed;
  }

  //------------------------------
  // RdoSyncableCollectionNW
  //------------------------------

  public makeRdo(sourceItem: S, parentRdoNodeWrapper: IRdoNodeWrapper<K, S, D>) {
    if (!this._makeRdo) return undefined;
    return this._makeRdo(sourceItem);
  }
}
