import { Logger } from '../../infrastructure/logger';
import { RdoNWBase } from '..';
import { IRdoNodeWrapper, ISourceNodeWrapper, RdoNodeTypeInfo, isIRdoInternalNodeWrapper } from '../..';
import { comparers } from '../../utilities';

const logger = Logger.make('RdoPrimitiveNW');

export class RdoPrimitiveNW<S, D> extends RdoNWBase<S, D> {
  private _value: D;

  constructor({ value, key, parent, wrappedSourceNode, typeInfo }: { value: D; key: string | undefined; parent: IRdoNodeWrapper<S, D> | undefined; wrappedSourceNode: ISourceNodeWrapper<S>; typeInfo: RdoNodeTypeInfo }) {
    super({ typeInfo, key, parent, wrappedSourceNode });

    this._value = value;
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
    if (!Object.is(this.wrappedSourceNode.value, this.value)) {
      logger.trace(`primitive value found in domainPropKey ${this.key}. Setting from old value to new value`, this.value, this.wrappedSourceNode.value);
      if (!this.parent) throw new Error('Primitive RDO Node wrappers must have a Parent node, and can not be root Nodes');
      if (!isIRdoInternalNodeWrapper(this.parent)) throw new Error('Parent RDO Node wrappers must implement IRdoInternalNodeWrapper');
      if (!this.key) throw new Error('Primitive RDO Node Wrapper - Key must not be null when synching');

      return this.parent.updateItem(this.key, this.wrappedSourceNode.value);
    }
    return false;
  }
}
