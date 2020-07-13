import { IGlobalNodeOptions, INodeSyncOptions, ISourceCollectionNodeWrapper, NodeTypeInfo } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
export declare class SourceArrayNW<K extends string | number, S, D> extends SourceBaseNW<K, S, D> implements ISourceCollectionNodeWrapper<K, S, D> {
    private _value;
    constructor({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions, }: {
        value: Array<S>;
        sourceNodeTypePath: string;
        sourceNodeInstancePath: string;
        key: K | undefined;
        typeInfo: NodeTypeInfo;
        matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get value(): S[];
    childElementCount(): number;
    getNode(): any;
    makeCollectionKey: (item: S, index: number) => K;
    elements(): Array<S>;
}
