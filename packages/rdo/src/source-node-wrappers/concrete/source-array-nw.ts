import { NodeTypeInfo, ISourceCollectionNodeWrapper, INodeSyncOptions, IGlobalNodeOptions, NodeKind, config } from '../..';
import { CollectionUtils } from '../../rdo-node-wrappers/utils/collection.utils';
import { SourceBaseNW } from '../base/source-base-nw';
import { NodeTypeUtils } from '../../rdo-node-wrappers/utils/node-type.utils';
import { isIMakeCollectionKeyFromSourceElement } from '../../types';

export class SourceArrayNW<K extends string | number, S, D> extends SourceBaseNW<K, S, D> implements ISourceCollectionNodeWrapper<K, S, D> {
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
    key: K | undefined;
    typeInfo: NodeTypeInfo;
    lastSourceNode: any;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
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

  // private _childElementsNodeKind: ChildElementsNodeKind | undefined;
  // public get ChildElementsNodeKind(): ChildElementsNodeKind {
  //   if (this._childElementsNodeKind === undefined) {
  //     const firstElement = this.elements()[Symbol.iterator]().next().value;
  //     if (firstElement) {
  //       this._childElementsNodeKind = NodeTypeUtils.getSourceNodeType(firstElement).kind;
  //     } else this._childElementsNodeKind = null;
  //   }
  //   return this._childElementsNodeKind;
  // }

  public makeCollectionKey = (item: S) => {
    if (item === null || item === undefined) return undefined;

    if (this.matchingNodeOptions?.makeRdoCollectionKey?.fromSourceElement) {
      // Use IMakeCollectionKey provided on options if available
      return this.matchingNodeOptions.makeRdoCollectionKey.fromSourceElement(item);
    }

    if (isIMakeCollectionKeyFromSourceElement(this.wrappedRdoNode)) {
      return this.wrappedRdoNode.value.makeKeyFromSourceElement(item);
    }

    // If primitive, the item is the key
    if (NodeTypeUtils.isPrimitive(item)) {
      return String(item);
    }

    // Last option - look for idKey
    if (item[config.defaultIdKey]) {
      return item[config.defaultIdKey];
    }

    return undefined;
  };

  public elements(): Iterable<S> {
    return this._value;
  }
}
