import { RdoArrayNW, RdoObjectNW, RdoPrimitiveNW, RdoMapNW, RdoSetNW } from '.';
import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, IWrapRdoNode, RdoNodeTypes, IRdoInternalNodeWrapper } from '..';
import { Logger } from '../infrastructure/logger';
import { NodeTypeUtils } from './utils/node-type.utils';
import { EventEmitter } from '../infrastructure/event-emitter';
import { NodeChange } from '../types/event-types';

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
    wrappedParentRdoNode,
    wrappedSourceNode,
    matchingNodeOptions,
  }: {
    value: RdoNodeTypes<K, S, D> | undefined;
    key: K | undefined;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any, any> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
    matchingNodeOptions?: INodeSyncOptions<any, any, any> | undefined;
  }): IRdoNodeWrapper<K, S, D> {
    if (value === null || value === undefined) throw new Error('Rdo value should not be null or undefined');

    const typeInfo = NodeTypeUtils.getNodeType(value);

    switch (typeInfo.builtInType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        return new RdoPrimitiveNW<K, S, D>({
          value: value as D,
          key,
          wrappedParentRdoNode,
          wrappedSourceNode,
          typeInfo,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
          targetedOptionMatchersArray: this._targetedOptionMatchersArray,
          eventEmitter: this._eventEmitter,
        });
      }
      case '[object Object]': {
        if (typeof key === 'string' || typeof key === 'undefined') {
          const wrappedSourceNodeTyped = (wrappedSourceNode as unknown) as ISourceNodeWrapper<string, S, D>;
          const o = new RdoObjectNW({
            value,
            key,
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
        } else {
          throw new Error(`Key for SourceObjects must be of type string (or undefined in the case of the root element). Found key of type ${typeof key}`);
        }
      }
      case '[object Array]': {
        return new RdoArrayNW<K, S, D>({
          value: value as Array<D>,
          typeInfo,
          key,
          wrappedParentRdoNode,
          wrappedSourceNode,
          syncChildNode: this._syncChildNode,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
          targetedOptionMatchersArray: this._targetedOptionMatchersArray,
          eventEmitter: this._eventEmitter,
        });
      }
      case '[object Map]': {
        return new RdoMapNW<K, S, D>({
          value: value as Map<K, D>,
          typeInfo,
          key,
          wrappedParentRdoNode,
          wrappedSourceNode,
          syncChildNode: this._syncChildNode,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
          targetedOptionMatchersArray: this._targetedOptionMatchersArray,
          eventEmitter: this._eventEmitter,
        });
      }
      case '[object Set]': {
        return new RdoSetNW<K, S, D>({
          value: value as Set<D>,
          typeInfo,
          key,
          wrappedParentRdoNode,
          wrappedSourceNode,
          syncChildNode: this._syncChildNode,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
          targetedOptionMatchersArray: this._targetedOptionMatchersArray,
          eventEmitter: this._eventEmitter,
        });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
