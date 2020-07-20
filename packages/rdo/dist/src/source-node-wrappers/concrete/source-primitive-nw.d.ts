import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
export declare class SourcePrimitiveNW<S, D> extends SourceBaseNW<S, D> implements ISourceNodeWrapper<S, D> {
    private _value;
    constructor({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions, }: {
        value: S | null | undefined;
        sourceNodeTypePath: string;
        sourceNodeInstancePath: string;
        key: string | number | undefined;
        typeInfo: NodeTypeInfo;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get value(): S | null | undefined;
    childElementCount(): number;
}
