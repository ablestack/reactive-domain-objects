import { config, IGlobalNodeOptions, INodeSyncOptions, ISourceCollectionNodeWrapper, NodeTypeInfo, NodeTypeUtils } from '../..';
import { isIMakeCollectionKey, isITryMakeCollectionKey } from '../../types';
import { SourceBaseNW } from '../base/source-base-nw';

export class SourceArrayNW<S, D> extends SourceBaseNW<S, D> implements ISourceCollectionNodeWrapper<S, D> {
  private _value: Array<S>;

  // /**
  //  *
  //  *
  //  * @readonly
  //  * @memberof SourceArrayNW
  //  * @description Returns map of element indexes by key. Note that if elements with duplicate keys are present in the source array, the first index with the corresponding key will be in the Map
  //  */
  // public get mapOfIndexByKey() {
  //   if (!this._mapOfIndexByKey) this.initializeMaps();
  //   return this._mapOfIndexByKey!;
  // }
  // private _mapOfIndexByKey: Map<number> | undefined;

  // /**
  //  *
  //  *
  //  * @readonly
  //  * @memberof SourceArrayNW
  //  * @description Returns map of elements by key. Note that if elements with duplicate keys are present in the source array, the first element with the corresponding key will be in the Map
  //  */
  // public get mapOfElementByKey() {
  //   if (!this._mapOfElementByKey) this.initializeMaps();
  //   return this._mapOfElementByKey!;
  // }
  // private _mapOfElementByKey: Map<string | number, S> | undefined;

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
    key: string | number | undefined;
    typeInfo: NodeTypeInfo;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
  }) {
    super({ sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions });
    this._value = value.filter((element) => element !== null && element !== undefined);
  }

  // //------------------------------
  // // Private
  // //------------------------------
  // private initializeMaps() {
  //   this._mapOfElementByKey = new Map<string | number, S>();
  //   this._mapOfIndexByKey = new Map<number>();

  //   for (let i = 0; i < this.value.length; i++) {
  //     const newElementKey = this.makeCollectionKey(this.value[i], i);
  //     if (!this._mapOfElementByKey.has(newElementKey)) {
  //       this._mapOfElementByKey.set(newElementKey, this.value[i]);
  //       this._mapOfIndexByKey.set(newElementKey, i);
  //     }
  //   }
  // }

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

  public getNode(): any {
    return this._value;
  }

  //------------------------------
  // ISourceCollectionNodeWrapper
  //------------------------------

  public makeCollectionKey = (item: S, index: number): string | number => {
    if (item === null || item === undefined) throw new Error(`Can not make collection key from null or undefined source object`);

    if (this.matchingNodeOptions?.makeRdoCollectionKey?.fromSourceElement) {
      // Use IMakeCollectionKey provided on options if available
      return this.matchingNodeOptions.makeRdoCollectionKey.fromSourceElement(item);
    }

    if (isITryMakeCollectionKey(this.wrappedRdoNode)) {
      const key = this.wrappedRdoNode.value.tryMakeKeyFromSourceElement(item);
      if (key !== undefined) return key;
    }

    // Last option - look for idKey
    if (item[config.defaultIdKey]) {
      return item[config.defaultIdKey];
    }

    // If item is primitive, use that as key
    if (NodeTypeUtils.isPrimitive(item)) {
      return (item as unknown) as string | number;
    }

    // If no key here, just use index
    return index as string | number;
  };

  public elements(): Array<S> {
    return this._value;
  }
}
