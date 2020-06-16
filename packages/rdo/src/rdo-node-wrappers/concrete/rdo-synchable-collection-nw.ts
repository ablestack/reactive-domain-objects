import { RdoCollectionNWBase } from '..';
import { IGlobalNameOptions, INodeSyncOptions, IRdoNodeWrapper, isISourceCollectionNodeWrapper, ISourceNodeWrapper, ISyncableRDOCollection, ISyncChildNode, RdoNodeTypeInfo } from '../..';
import { Logger } from '../../infrastructure/logger';
import { SyncUtils } from '../utils/sync.utils';

const logger = Logger.make('RdoSyncableCollectionNW');

export class RdoSyncableCollectionNW<S, D> extends RdoCollectionNWBase<S, D> {
  private _value: ISyncableRDOCollection<S, D>;

  constructor({
    value,
    typeInfo,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    syncChildNode,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    value: ISyncableRDOCollection<S, D>;
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildNode: ISyncChildNode<S, D>;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNameOptions | undefined;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions });
    this._value = value;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get value() {
    return this._value;
  }

  public itemKeys() {
    return this._value.getCollectionKeys();
  }

  public getElement(key: string) {
    return this._value.getElement(key);
  }

  public updateElement(key: string, value: D) {
    return this._value.updateElement(key, value);
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync(): boolean {
    if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearElements();
    } else {
      if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);
      return SyncUtils.synchronizeCollection({ rdo: this, syncChildNode: this._syncChildNode });
    }
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public elements(): Iterable<D> {
    return this._value.elements();
  }

  public childElementCount(): number {
    return this._value.size;
  }

  public insertElement(value: D) {
    const key = this.makeKey(value);
    if (!key) {
      this._value.insertElement(key, value);
    } else {
      throw new Error('insertElement - makeKey did not return a value');
    }
  }

  public deleteElement(key: string): boolean {
    return this._value.deleteElement(key);
  }

  public clearElements(): boolean {
    return this._value.clearElements();
  }
}
