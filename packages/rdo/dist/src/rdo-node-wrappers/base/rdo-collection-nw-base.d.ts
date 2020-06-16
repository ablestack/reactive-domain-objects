import { IGlobalNameOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, RdoNodeTypeInfo } from '../..';
import { RdoInternalNWBase } from './rdo-internal-nw-base';
export declare abstract class RdoCollectionNWBase<S, D> extends RdoInternalNWBase<S, D> implements IRdoCollectionNodeWrapper<S, D> {
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, }: {
        typeInfo: RdoNodeTypeInfo;
        key: string | undefined;
        wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        syncChildNode: ISyncChildNode<S, D>;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNameOptions | undefined;
    });
    makeCollectionKey(item: D): any;
    makeRdo(sourceObject: any): any;
    abstract elements(): Iterable<D>;
    abstract childElementCount(): any;
    abstract clearElements(): any;
    abstract insertElement(value: D): any;
    abstract deleteElement(key: string): any;
}
