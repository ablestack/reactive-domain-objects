import { RdoCollectionNWBase } from '..';
import { IGlobalNameOptions, INodeSyncOptions, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, RdoNodeTypeInfo } from '../..';
export declare class RdoArrayNW<S, D> extends RdoCollectionNWBase<S, D> {
    private _value;
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, }: {
        value: Array<D>;
        typeInfo: RdoNodeTypeInfo;
        key: string | undefined;
        wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        syncChildNode: ISyncChildNode<S, D>;
        matchingNodeOptions: INodeSyncOptions<S, D> | undefined;
        globalNodeOptions: IGlobalNameOptions | undefined;
    });
    get value(): D[];
    itemKeys(): string[];
    getElement(key: string): D | undefined;
    updateElement(key: string, value: D): boolean;
    smartSync(): boolean;
    elements(): Iterable<D>;
    childElementCount(): number;
    insertElement(key: string, value: D): void;
    deleteElement(key: string): boolean;
    clearElements(): boolean;
}
