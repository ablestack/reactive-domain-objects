import { ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '..';
export declare class SourceNodeWrapperFactory {
    private _globalNodeOptions;
    constructor({ globalNodeOptions }: {
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    make<K extends string | number, S, D>({ sourceNodePath, value, key, matchingNodeOptions, }: {
        sourceNodePath: string;
        value: any;
        key: K | undefined;
        matchingNodeOptions?: INodeSyncOptions<K, S, D> | undefined;
    }): ISourceNodeWrapper<K, S, D>;
}
