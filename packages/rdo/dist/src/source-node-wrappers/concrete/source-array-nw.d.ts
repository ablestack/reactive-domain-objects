import { NodeTypeInfo, ISourceCollectionNodeWrapper, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
export declare class SourceArrayNW<K extends string | number, S, D> extends SourceBaseNW<K, S, D> implements ISourceCollectionNodeWrapper<K, S, D> {
    private _value;
    constructor({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions, }: {
        value: Array<S>;
        sourceNodePath: string;
        key: K | undefined;
        typeInfo: NodeTypeInfo;
        lastSourceNode: any;
        matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get value(): S[];
    childElementCount(): number;
    nodeKeys(): any[];
    getItem(key: K): S | undefined;
    getNode(): any;
    makeCollectionKey: (item: S) => any;
    elements(): Iterable<S>;
}
