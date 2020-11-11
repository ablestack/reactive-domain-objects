import { ISourceObjectNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
export declare class SourceObjectNW<S extends Record<string | number, any>, D> extends SourceBaseNW<S, D> implements ISourceObjectNodeWrapper<S, D> {
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
    getNodeKeys(): (string | number)[];
    getNodeItem(key: string | number): any;
}
