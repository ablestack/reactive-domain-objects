import { NodeTypeInfo, ISourceCollectionNodeWrapper, INodeSyncOptions, IGlobalNodeOptions, NodeKind, config } from '../..';
import { CollectionUtils } from '../../rdo-node-wrappers/utils/collection.utils';
import { SourceBaseNW } from '../base/source-base-nw';
import { NodeTypeUtils } from '../../rdo-node-wrappers/utils/node-type.utils';
import { isIMakeCollectionKey } from '../../types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

export class SourceArrayNW<K extends string | number, S, D> extends SourceBaseNW<K, S, D> implements ISourceCollectionNodeWrapper<K, S, D> {
  private _value: Array<S>;

  constructor({
    value,
    sourceNodePath,
    key,
    typeInfo,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    value: Array<S>;
    sourceNodePath: string;
    key: K | undefined;
    typeInfo: NodeTypeInfo;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
  }) {
    super({ sourceNodePath, key, typeInfo, matchingNodeOptions, globalNodeOptions });
    this._value = value.filter((element) => element !== null && element !== undefined);
  }

  //------------------------------
  // ISourceNodeWrapper
  //------------------------------

  public get value() {
    return this._value;
  }

  public childElementCount(): number {
    return this._value.length;
  }

  //------------------------------
  // ISourceInternalNodeWrapper
  //------------------------------

  public nodeKeys() {
    return CollectionUtils.Array.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
  }

  public getItem(key: K) {
    return CollectionUtils.Array.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  }

  public getNode(): any {
    return this._value;
  }

  //------------------------------
  // ISourceCollectionNodeWrapper
  //------------------------------

  public makeCollectionKey = (item: S) => {
    if (item === null || item === undefined) throw new Error(`Can not make collection key from null or undefined source object`);

    if (this.matchingNodeOptions?.makeRdoCollectionKey?.fromSourceElement) {
      // Use IMakeCollectionKey provided on options if available
      return this.matchingNodeOptions.makeRdoCollectionKey.fromSourceElement(item);
    }

    if (isIMakeCollectionKey(this.wrappedRdoNode)) {
      return this.wrappedRdoNode.value.makeKeyFromSourceElement(item);
    }

    // If primitive, the item is the key
    if (NodeTypeUtils.isPrimitive(item)) {
      return item;
    }

    // Last option - look for idKey
    if (item[config.defaultIdKey]) {
      return item[config.defaultIdKey];
    }

    throw new Error(`Could not make collection `);
  };

  public elements(): Iterable<S> {
    return this._value;
  }
}
