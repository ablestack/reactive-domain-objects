import { SourceNodeTypeInfo, ISourceCollectionNodeWrapper, IMakeCollectionKey, INodeSyncOptions, IGlobalNameOptions } from '../..';
import { CollectionUtils } from '../../rdo-node-wrappers/utils/collection.utils';
import { SourceBaseNW } from '../base/source-base-nw';

export class SourceArrayNW<S> extends SourceBaseNW<S> implements ISourceCollectionNodeWrapper<S> {
  private _value: Array<S>;

  constructor({
    value,
    sourceNodePath,
    key,
    typeInfo,
    lastSourceNode,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    value: Array<S>;
    sourceNodePath: string;
    key: string | undefined;
    typeInfo: SourceNodeTypeInfo;
    lastSourceNode: any;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNameOptions | undefined;
  }) {
    super({ sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions });
    this._value = value;
  }

  //------------------------------
  // ISourceNodeWrapper
  //------------------------------

  public get value() {
    return this._value;
  }

  public childElementCount(): number {
    return 0;
  }

  //------------------------------
  // ISourceInternalNodeWrapper
  //------------------------------

  public itemKeys() {
    if (this.makeItemKey) return CollectionUtils.Array.getKeys({ collection: this._value, makeItemKey: this.makeItemKey });
    else return [];
  }

  public getItem(key: string) {
    if (this.makeItemKey) return CollectionUtils.Array.getItem({ collection: this._value, makeItemKey: this.makeItemKey!, key });
    else return undefined;
  }

  public updateItem(value: any) {
    if (this.makeItemKey) return CollectionUtils.Array.updateItem({ collection: this._value, makeItemKey: this.makeItemKey!, value });
    else throw new Error('make key from RDO element must be available for Array update operations');
  }

  public getNode(): any {
    return this._value;
  }

  //------------------------------
  // ISourceCollectionNodeWrapper
  //------------------------------

  public elements(): Iterable<S> {
    return this._value;
  }

  public get makeItemKey(): IMakeCollectionKey<S> | undefined {
    return this.makeItemKey;
  }
}
