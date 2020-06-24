import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
export declare class SourcePrimitiveNW<K extends string | number, S, D> extends SourceBaseNW<K, S, D> implements ISourceNodeWrapper<K, S, D> {
    private _value;
    constructor({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions, }: {
        value: S | null | undefined;
        sourceNodeTypePath: string;
        sourceNodeInstancePath: string;
        key: K | undefined;
        typeInfo: NodeTypeInfo;
        matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get value(): S | null | undefined;
    childElementCount(): number;
}
