import { RdoArrayNW, RdoObjectNW, RdoPrimitiveNW, RdoMapNW, RdoSetNW } from '.';
import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, IWrapRdoNode, RdoNodeTypes, IRdoInternalNodeWrapper } from '..';
import { Logger } from '../infrastructure/logger';
import { NodeTypeUtils } from './utils/node-type.utils';
import { EventEmitter } from '../infrastructure/event-emitter';
import { NodeChange } from '../types/event-types';

const logger = Logger.make('RdoNodeWrapperFactory');

export class RdoNodeWrapperFactory {
  private _eventEmitter: EventEmitter<NodeChange>;
  private _syncChildNode: ISyncChildNode<any, any>;
  private _globalNodeOptions: IGlobalNodeOptions | undefined;
  private _targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
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
    syncChildNode: ISyncChildNode<any, any>;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
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

  public make<S, D>({
    value,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    matchingNodeOptions,
  }: {
    value: RdoNodeTypes<S, D> | undefined;
    key: string | undefined;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    matchingNodeOptions?: INodeSyncOptions<any, any> | undefined;
  }): IRdoNodeWrapper<S, D> {
    const builtInType = value ? NodeTypeUtils.getRdoNodeType(value).builtInType : wrappedSourceNode.typeInfo.builtInType;

    switch (builtInType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        return new RdoPrimitiveNW<S, D>({
          value: value as D,
          key,
          wrappedParentRdoNode,
          wrappedSourceNode,
          typeInfo: builtInType,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
          targetedOptionMatchersArray: this._targetedOptionMatchersArray,
          eventEmitter: this._eventEmitter,
        });
      }
      case '[object Object]': {
        return new RdoObjectNW({
          value,
          key,
          wrappedParentRdoNode,
          wrappedSourceNode,
          typeInfo: builtInType,
          defaultEqualityComparer: this._defaultEqualityComparer,
          syncChildNode: this._syncChildNode,
          wrapRdoNode: this._wrapRdoNode,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
          targetedOptionMatchersArray: this._targetedOptionMatchersArray,
          eventEmitter: this._eventEmitter,
        });
      }
      case '[object Array]': {
        return new RdoArrayNW<S, D>({
          value: value as Array<D>,
          typeInfo: builtInType,
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
        if (value === null || value === undefined) throw new Error('autoInstantiate of Map types not supported');
        return new RdoMapNW<S, D>({
          value: value as Map<string, D>,
          typeInfo: builtInType,
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
        if (value === null || value === undefined) throw new Error('autoInstantiate of Map types not supported');
        return new RdoSetNW<S, D>({
          value: value as Set<D>,
          typeInfo: builtInType,
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
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${builtInType}`);
      }
    }
  }
}
