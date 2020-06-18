import { NodeTypeInfo, ISourceCollectionNodeWrapper, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
export declare class SourceArrayNW<S> extends SourceBaseNW<S> implements ISourceCollectionNodeWrapper<S> {
    private _value;
    constructor({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions, }: {
        value: Array<S>;
        sourceNodePath: string;
        key: string | undefined;
        typeInfo: NodeTypeInfo;
        lastSourceNode: any;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get value(): S[];
    childElementCount(): number;
    nodeKeys(): string[];
    getItem(key: string): S | undefined;
    getNode(): any;
    makeCollectionKey: (item: S) => any;
    elements(): Iterable<S>;
}
