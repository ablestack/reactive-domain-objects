import { IRdoNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, isIRdoInternalNodeWrapper } from '../types';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('RdoPrimitiveINW');

export class RdoPrimitiveINW implements IRdoNodeWrapper {
  private _value: object;
  private _key: string | undefined;
  private _parent: IRdoNodeWrapper | undefined;
  private _typeInfo: RdoNodeTypeInfo;
  private _wrappedSourceNode: ISourceNodeWrapper;

  constructor({
    node,
    key,
    parent,
    wrappedSourceNode,
    typeInfo,
  }: {
    node: Record<string, any>;
    key: string | undefined;
    parent: IRdoNodeWrapper | undefined;
    wrappedSourceNode: ISourceNodeWrapper;
    typeInfo: RdoNodeTypeInfo;
  }) {
    this._value = node;
    this._key = key;
    this._parent = parent;
    this._typeInfo = typeInfo;
    this._wrappedSourceNode = wrappedSourceNode;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get value() {
    return this._value;
  }

  public get key() {
    return this.key;
  }
  public get parent() {
    return this._parent;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return this._typeInfo;
  }

  public get wrappedSourceNode(): ISourceNodeWrapper {
    return this._wrappedSourceNode;
  }

  childElementCount(): number {
    return 0;
  }

  smartSync(): boolean {
    if (this._wrappedSourceNode.typeInfo.builtInType !== this.typeInfo.builtInType) {
      throw Error(`For primitive types, the source type and the domain type must match. Source type: '${this._wrappedSourceNode.typeInfo.builtInType}', rdoNodeTypeInfo: ${this.typeInfo.builtInType}`);
    }
    if (this._wrappedSourceNode.value !== this.value) {
      logger.trace(`primitive value found in domainPropKey ${this.key}. Setting from old value to new value`, this.value, this._wrappedSourceNode.value);
      if (!this._parent) throw new Error('Primitive RDO Node wrappers must have a Parent node, and can not be root Nodes');
      if (!isIRdoInternalNodeWrapper(this._parent)) throw new Error('Parent RDO Node wrappers must implement IRdoInternalNodeWrapper');
      if (!this._key) throw new Error('Primitive RDO Node Wrapper - Key must not be null when synching');

      return this._parent.updateItem(this._key, this._wrappedSourceNode.value);
    }
    return false;
  }
}
