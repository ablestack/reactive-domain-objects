import { RdoCollectionNWBase, RdoWrapperValidationUtils } from '..';
import { IGlobalNodeOptions, MakeCollectionKeyMethod, IMakeRdo, INodeSyncOptions, IRdoNodeWrapper, isISourceCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, RdoNodeTypeInfo, IRdoInternalNodeWrapper } from '../..';
import { Logger } from '../../infrastructure/logger';
import { CollectionUtils } from '../utils/collection.utils';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';

const logger = Logger.make('RdoArrayNW');

export class RdoArrayNW<S, D> extends RdoCollectionNWBase<S, D> {
  private _value: Array<D>;

  constructor({
    value,
    typeInfo,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    syncChildNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    value: Array<D> | undefined;
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildNode: ISyncChildNode<S, D>;
    matchingNodeOptions: INodeSyncOptions<S, D> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    if (!value && !globalNodeOptions?.autoInstantiateRdoItems?.objectFieldsAsObservableObjectLiterals) throw new Error(`Null value only allowed when globalNodeOptions.autoInstantiateRdoItems. sourceNodePath: ${this.wrappedSourceNode.sourceNodePath}`);
    this._value = value || [];
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get value() {
    return this._value;
  }

  public itemKeys() {
    if (this.childElementCount() === 0) return [];
    return CollectionUtils.Array.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
  }

  public getElement(key: string) {
    if (this.childElementCount() === 0) return undefined;
    return CollectionUtils.Array.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  }

  public updateElement(key: string, value: D) {
    if (this.childElementCount() === 0) return false;
    return CollectionUtils.Array.updateElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, value });
  }

  public insertElement(key: string, value: D) {
    CollectionUtils.Array.insertElement({ collection: this._value, key, value });
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public smartSync(): boolean {
    if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearElements();
    } else {
      RdoWrapperValidationUtils.nonKeyedCollectionSizeCheck({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, collectionSize: this.childElementCount(), collectionType: this.typeInfo.builtInType });

      if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);

      // Execute
      return super.synchronizeCollection();
    }
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public elements(): Iterable<D> {
    return this._value;
  }

  public childElementCount(): number {
    return this._value.length;
  }

  public deleteElement(key: string): boolean {
    return CollectionUtils.Array.deleteElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  }

  public clearElements(): boolean {
    return CollectionUtils.Array.clear({ collection: this._value });
  }
}
