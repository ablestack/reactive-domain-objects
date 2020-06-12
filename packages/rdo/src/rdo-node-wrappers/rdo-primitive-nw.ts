import { IRdoNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, isIRdoInternalNodeWrapper } from '../types';
import { Logger } from '../infrastructure/logger';
import { RdoNWBase } from './rdo-nw-base';
import { SourceNodeWrapperFactory } from '../source-internal-node-wrappers/source-node-wrapper-factory';

const logger = Logger.make('RdoPrimitiveNW');

export class RdoPrimitiveNW<S, D> extends RdoNWBase<S, D> {
  private _value: object;

  constructor({
    node,
    key,
    parent,
    wrappedSourceNode,
    typeInfo,
  }: {
    node: Record<string, any>;
    key: string | undefined;
    parent: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    typeInfo: RdoNodeTypeInfo;
  }) {
    super({ typeInfo, key, parent, wrappedSourceNode });

    this._value = node;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get value() {
    return this._value;
  }

  childElementCount(): number {
    return 0;
  }

  smartSync(): boolean {
    if (this.wrappedSourceNode.typeInfo.builtInType !== this.typeInfo.builtInType) {
      throw Error(`For primitive types, the source type and the domain type must match. Source type: '${this.wrappedSourceNode.typeInfo.builtInType}', rdoNodeTypeInfo: ${this.typeInfo.builtInType}`);
    }
    if (this.wrappedSourceNode.value !== this.value) {
      logger.trace(`primitive value found in domainPropKey ${this.key}. Setting from old value to new value`, this.value, this.wrappedSourceNode.value);
      if (!this.parent) throw new Error('Primitive RDO Node wrappers must have a Parent node, and can not be root Nodes');
      if (!isIRdoInternalNodeWrapper(this.parent)) throw new Error('Parent RDO Node wrappers must implement IRdoInternalNodeWrapper');
      if (!this.key) throw new Error('Primitive RDO Node Wrapper - Key must not be null when synching');

      return this.parent.updateItem(this.key, this.wrappedSourceNode.value);
    }
    return false;
  }
}
