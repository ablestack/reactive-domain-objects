import { RdoNWBase } from '..';
import { IGlobalNameOptions, INodeSyncOptions, IRdoNodeWrapper, ISourceNodeWrapper, RdoNodeTypeInfo } from '../..';
export declare class RdoPrimitiveNW<S, D> extends RdoNWBase<S, D> {
    private _value;
    constructor({ value, key, wrappedParentRdoNode, wrappedSourceNode, typeInfo, matchingNodeOptions, globalNodeOptions, }: {
        value: D;
        key: string | undefined;
        wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        typeInfo: RdoNodeTypeInfo;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNameOptions | undefined;
    });
    get value(): D;
    childElementCount(): number;
    smartSync(): boolean;
}
