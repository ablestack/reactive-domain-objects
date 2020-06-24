import { ISourceInternalNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
export declare class SourceObjectNW<K extends string, S extends Record<K, any>, D> extends SourceBaseNW<K, S, D> implements ISourceInternalNodeWrapper<K, S, D> {
    private _value;
    constructor({ value, sourceNodePath, key, typeInfo, matchingNodeOptions, globalNodeOptions, }: {
        value: S | null | undefined;
        sourceNodePath: string;
        key: K | undefined;
        typeInfo: NodeTypeInfo;
        matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get value(): S | null | undefined;
    childElementCount(): number;
    nodeKeys(): K[];
    getItem(key: K): S[K] | null | undefined;
}
