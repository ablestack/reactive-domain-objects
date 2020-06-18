import { RdoNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, IRdoNodeWrapper, isIRdoInternalNodeWrapper, ISourceNodeWrapper, RdoNodeTypeInfo, IRdoInternalNodeWrapper } from '../..';
import { Logger } from '../../infrastructure/logger';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';

const logger = Logger.make('RdoPrimitiveNW');

export class RdoPrimitiveNW<S, D> extends RdoNWBase<S, D> {
  private _value: D | undefined;

  constructor({
    value,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    value: D | undefined;
    key: string | undefined;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    typeInfo: RdoNodeTypeInfo;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });

    if (!value && !globalNodeOptions?.autoInstantiateRdoItems?.objectFieldsAsObservableObjectLiterals) throw new Error(`Undefined value only allowed when globalNodeOptions.autoInstantiateRdoItems. sourceNodePath: ${this.wrappedSourceNode.sourceNodePath}`);
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
    if (Object.is(this.wrappedSourceNode.value, this.value)) {
      logger.trace(`smartSync - SourceNodePath:${this.wrappedSourceNode.sourceNodePath}, values evaluate to Object.is equal. Not allocating value`, this.wrappedSourceNode.value, this.value);
    } else {
      logger.trace(`primitive value found in domainPropKey ${this.key}. Setting from old value to new value`, this.value, this.wrappedSourceNode.value);
      if (!this.wrappedParentRdoNode) throw new Error('Primitive RDO Node wrappers must have a Parent node, and can not be root Nodes. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}');
      if (!isIRdoInternalNodeWrapper(this.wrappedParentRdoNode)) throw new Error(`Parent RDO Node wrappers must implement IRdoInternalNodeWrapper. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}`);
      if (!this.key) throw new Error('Primitive RDO Node Wrapper - Key must not be null when synching. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}');

      const changed = this.wrappedParentRdoNode.updateElement(this.key, (this.wrappedSourceNode.value as unknown) as D);
      if (changed)
        this.eventEmitter.publish('nodeChange', { changeType: 'update', sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceKey: this.wrappedSourceNode.key!, rdoKey: this.key, rdoOldValue: this.value, rdoNewValue: this.wrappedSourceNode.value });
      return changed;
    }
    return false;
  }
}
