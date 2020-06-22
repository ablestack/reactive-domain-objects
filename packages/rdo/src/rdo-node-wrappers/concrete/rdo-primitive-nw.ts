import { RdoNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, IRdoNodeWrapper, isIRdoInternalNodeWrapper, ISourceNodeWrapper, NodeTypeInfo, IRdoInternalNodeWrapper } from '../..';
import { Logger } from '../../infrastructure/logger';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';

const logger = Logger.make('RdoPrimitiveNW');

export class RdoPrimitiveNW<K extends string | number, S, D> extends RdoNWBase<K, S, D> {
  private _value: D | undefined;

  constructor({
    value,
    typeInfo,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    value: D;
    typeInfo: NodeTypeInfo;
    key: K | undefined;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<any, S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    this._value = value;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get leafNode() {
    return true;
  }

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

    if (!this.wrappedParentRdoNode) throw new Error('Primitive RDO Node wrappers must have a Parent node, and can not be root Nodes. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}');
    if (!isIRdoInternalNodeWrapper(this.wrappedParentRdoNode)) throw new Error(`Parent RDO Node wrappers must implement IRdoInternalNodeWrapper. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}`);
    if (!this.key) throw new Error('Primitive RDO Node Wrapper - Key must not be null when synching. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}');

    return RdoPrimitiveNW.sync<S, D>({
      wrappedParentNode: this.wrappedParentRdoNode,
      sourceKey: this.wrappedSourceNode.key!,
      rdoKey: this.key,
      newValue: (this.wrappedSourceNode.value as unknown) as D,
      eventEmitter: this.eventEmitter,
    });
  }

  public static sync<S, D>({
    wrappedParentNode,
    sourceKey,
    rdoKey,
    newValue,
    eventEmitter,
  }: {
    wrappedParentNode: IRdoInternalNodeWrapper<any, S, D>;
    sourceKey: string | number;
    rdoKey: string | number;
    newValue: D;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    const oldValue = wrappedParentNode.getItem(rdoKey);
    if (Object.is(oldValue, newValue)) {
      logger.trace(`smartSync - SourceNodePath:${wrappedParentNode.wrappedSourceNode.sourceNodePath}, values evaluate to Object.is equal. Not allocating value`, newValue);
      return false;
    }

    logger.trace(`primitive value found in domainPropKey ${rdoKey}. Setting from old value to new value`, newValue, oldValue);
    const changed = wrappedParentNode.updateItem(rdoKey, newValue);
    if (changed)
      eventEmitter.publish('nodeChange', {
        changeType: 'update',
        sourceNodePath: wrappedParentNode.wrappedSourceNode.sourceNodePath,
        sourceKey,
        rdoKey,
        oldSourceValue: oldValue,
        newSourceValue: newValue,
      });

    return changed;
  }
}
