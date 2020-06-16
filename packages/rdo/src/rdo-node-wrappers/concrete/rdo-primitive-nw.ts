import { RdoNWBase } from '..';
import { IGlobalNameOptions, INodeSyncOptions, IRdoNodeWrapper, isIRdoInternalNodeWrapper, ISourceNodeWrapper, RdoNodeTypeInfo } from '../..';
import { Logger } from '../../infrastructure/logger';

const logger = Logger.make('RdoPrimitiveNW');

export class RdoPrimitiveNW<S, D> extends RdoNWBase<S, D> {
  private _value: D;

  constructor({
    value,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    typeInfo,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    value: D;
    key: string | undefined;
    wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    typeInfo: RdoNodeTypeInfo;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNameOptions | undefined;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions });

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
      if (!this.wrappedParentRdoNode) throw new Error('Primitive RDO Node wrappers must have a Parent node, and can not be root Nodes. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}');
      if (!isIRdoInternalNodeWrapper(this.wrappedParentRdoNode)) throw new Error(`Parent RDO Node wrappers must implement IRdoInternalNodeWrapper. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}`);
      if (!this.key) throw new Error('Primitive RDO Node Wrapper - Key must not be null when synching. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}');

      return this.wrappedParentRdoNode.updateElement(this.key, this.wrappedSourceNode.value);
    }
    return false;
  }
}
