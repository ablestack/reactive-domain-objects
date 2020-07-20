import { IGlobalNodeOptions, INodeSyncOptions, ISourceCollectionNodeWrapper, NodeTypeInfo } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
export declare class SourceArrayNW<S, D> extends SourceBaseNW<S, D> implements ISourceCollectionNodeWrapper<S, D> {
    private _value;
    constructor({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions, }: {
        value: Array<S>;
        sourceNodeTypePath: string;
        sourceNodeInstancePath: string;
        key: string | number | undefined;
        typeInfo: NodeTypeInfo;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get value(): S[];
    childElementCount(): number;
    getNode(): any;
    makeCollectionKey: (item: S, index: number) => string | number;
    elements(): Array<S>;
}
