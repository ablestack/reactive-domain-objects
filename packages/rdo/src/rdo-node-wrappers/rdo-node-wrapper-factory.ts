import { RdoArrayNW, RdoObjectNW, RdoMapNW, RdoSetNW, RdoSyncableCollectionNW } from '.';
import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, IWrapRdoNode, RdoNodeTypes, IRdoInternalNodeWrapper, ISyncableRDOKeyBasedCollection } from '..';
import { Logger } from '../infrastructure/logger';
import { NodeTypeUtils } from './utils/node-type.utils';
import { EventEmitter } from '../infrastructure/event-emitter';
import { NodeChange } from '../types/event-types';
import { MutableNodeCache } from '../infrastructure/mutable-node-cache';

const logger = Logger.make('RdoNodeWrapperFactory');

export class RdoNodeWrapperFactory {
  private _eventEmitter: EventEmitter<NodeChange>;
  private _syncChildNode: ISyncChildNode;
  private _globalNodeOptions: IGlobalNodeOptions | undefined;
  private _targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
  private _wrapRdoNode: IWrapRdoNode;
  private _defaultEqualityComparer: IEqualityComparer;

  constructor({
    eventEmitter,
    syncChildNode,
    globalNodeOptions,
    targetedOptionMatchersArray,
    wrapRdoNode,
    defaultEqualityComparer,
  }: {
    eventEmitter: EventEmitter<NodeChange>;
    syncChildNode: ISyncChildNode;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
    wrapRdoNode: IWrapRdoNode;
    defaultEqualityComparer: IEqualityComparer;
  }) {
    this._eventEmitter = eventEmitter;
    this._syncChildNode = syncChildNode;
    this._globalNodeOptions = globalNodeOptions;
    this._wrapRdoNode = wrapRdoNode;
    this._defaultEqualityComparer = defaultEqualityComparer;
    this._targetedOptionMatchersArray = targetedOptionMatchersArray;
  }

  public make<K extends string | number, S, D>({
    value,
    key,
    mutableNodeCache,
    wrappedParentRdoNode,
    wrappedSourceNode,
    matchingNodeOptions,
  }: {
    value: RdoNodeTypes<K, S, D> | undefined;
    key: K | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any, any> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
    matchingNodeOptions?: INodeSyncOptions<any, any, any> | undefined;
  }): IRdoNodeWrapper<K, S, D> {
    if (value === null || value === undefined) throw new Error('Rdo value should not be null or undefined');

    const typeInfo = NodeTypeUtils.getNodeType(value);

    // Check if custom collection type
    if (typeInfo.type === 'ISyncableKeyBasedCollection') {
      logger.trace(`Wrapping Node ${key} with RdoMapNW - sourceNodeTypePath: ${wrappedSourceNode.sourceNodeTypePath}`);
      return new RdoSyncableCollectionNW<K, S, D>({
        value: value as ISyncableRDOKeyBasedCollection<K, S, D>,
        typeInfo,
        key,
        mutableNodeCache,
        wrappedParentRdoNode,
        wrappedSourceNode,
        syncChildNode: this._syncChildNode,
        defaultEqualityComparer: this._defaultEqualityComparer,
        matchingNodeOptions,
        globalNodeOptions: this._globalNodeOptions,
        targetedOptionMatchersArray: this._targetedOptionMatchersArray,
        eventEmitter: this._eventEmitter,
      });
    }

    // Else use built in stringified types to generate appropriate wrapper
    switch (typeInfo.stringifiedType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        throw new Error(`Can not wrap primitive nodes. Primitive node sync should be handled in objects and collection wrappers. Key:${key}. SourceNodePath:${wrappedSourceNode.sourceNodeTypePath}`);
      }
      case '[object Object]': {
        logger.trace(`Wrapping Node ${key} with RdoObjectNW - sourceNodeTypePath: ${wrappedSourceNode.sourceNodeTypePath}`);
        const wrappedSourceNodeTyped = (wrappedSourceNode as unknown) as ISourceNodeWrapper<string | number, S, D>;
        const o = new RdoObjectNW({
          value,
          key,
          mutableNodeCache,
          wrappedParentRdoNode,
          wrappedSourceNode: wrappedSourceNodeTyped,
          typeInfo,
          defaultEqualityComparer: this._defaultEqualityComparer,
          syncChildNode: this._syncChildNode,
          wrapRdoNode: this._wrapRdoNode,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
          targetedOptionMatchersArray: this._targetedOptionMatchersArray,
          eventEmitter: this._eventEmitter,
        });
        return (o as unknown) as IRdoNodeWrapper<K, S, D>;
      }
      case '[object Array]': {
        logger.trace(`Wrapping Node ${key} with RdoArrayNW - sourceNodeTypePath: ${wrappedSourceNode.sourceNodeTypePath}`);
        const wrappedSourceNodeTyped = (wrappedSourceNode as unknown) as ISourceNodeWrapper<number, S, D>;
        const a = new RdoArrayNW<S, D>({
          value: value as Array<D>,
          typeInfo,
          key: key as number,
          mutableNodeCache,
          wrappedParentRdoNode,
          wrappedSourceNode: wrappedSourceNodeTyped,
          syncChildNode: this._syncChildNode,
          defaultEqualityComparer: this._defaultEqualityComparer,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
          targetedOptionMatchersArray: this._targetedOptionMatchersArray,
          eventEmitter: this._eventEmitter,
        });
        return (a as unknown) as IRdoNodeWrapper<K, S, D>;
      }
      case '[object Map]': {
        logger.trace(`Wrapping Node ${key} with RdoMapNW - sourceNodeTypePath: ${wrappedSourceNode.sourceNodeTypePath}`);
        return new RdoMapNW<K, S, D>({
          value: value as Map<K, D>,
          typeInfo,
          key,
          mutableNodeCache,
          wrappedParentRdoNode,
          wrappedSourceNode,
          syncChildNode: this._syncChildNode,
          defaultEqualityComparer: this._defaultEqualityComparer,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
          targetedOptionMatchersArray: this._targetedOptionMatchersArray,
          eventEmitter: this._eventEmitter,
        });
      }
      case '[object Set]': {
        logger.trace(`Wrapping Node ${key} with RdoSetNW - sourceNodeTypePath: ${wrappedSourceNode.sourceNodeTypePath}`);
        return new RdoSetNW<K, S, D>({
          value: value as Set<D>,
          typeInfo,
          key,
          mutableNodeCache,
          wrappedParentRdoNode,
          wrappedSourceNode,
          syncChildNode: this._syncChildNode,
          defaultEqualityComparer: this._defaultEqualityComparer,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
          targetedOptionMatchersArray: this._targetedOptionMatchersArray,
          eventEmitter: this._eventEmitter,
        });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.stringifiedType}`);
      }
    }
  }
}
