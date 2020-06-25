import { config, IGlobalNodeOptions, INodeSyncOptions, ISourceCollectionNodeWrapper, NodeTypeInfo } from '../..';
import { isIMakeCollectionKey } from '../../types';
import { SourceBaseNW } from '../base/source-base-nw';

export class SourceArrayNW<K extends string | number, S, D> extends SourceBaseNW<K, S, D> implements ISourceCollectionNodeWrapper<K, S, D> {
  private _value: Array<S>;

  constructor({
    value,
    sourceNodeTypePath,
    sourceNodeInstancePath,
    key,
    typeInfo,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    value: Array<S>;
    sourceNodeTypePath: string;
    sourceNodeInstancePath: string;
    key: K | undefined;
    typeInfo: NodeTypeInfo;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
  }) {
    super({ sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions });
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

  // public nodeKeys() {
  //   return CollectionUtils.Array.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
  // }

  // public getItem(key: K) {
  //   return CollectionUtils.Array.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  // }

  public getNode(): any {
    return this._value;
  }

  //------------------------------
  // ISourceCollectionNodeWrapper
  //------------------------------

  public makeCollectionKey = (item: S; index: number): K => {
    if (item === null || item === undefined) throw new Error(`Can not make collection key from null or undefined source object`);

    if (this.matchingNodeOptions?.makeRdoCollectionKey?.fromSourceElement) {
      // Use IMakeCollectionKey provided on options if available
      return this.matchingNodeOptions.makeRdoCollectionKey.fromSourceElement(item);
    }

    if (isIMakeCollectionKey(this.wrappedRdoNode)) {
      return this.wrappedRdoNode.value.makeKeyFromSourceElement(item);
    }

    // Last option - look for idKey
    if (item[config.defaultIdKey]) {
      return item[config.defaultIdKey];
    }

    // If no key here, just use index
    return index as K;
  };

  public elements(): Iterable<S> {
    return this._value;
  }
}
