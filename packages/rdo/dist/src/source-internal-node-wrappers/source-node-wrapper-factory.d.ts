import { ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '..';
export declare class SourceNodeWrapperFactory {
    private _globalNodeOptions;
    constructor({ globalNodeOptions }: {
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    make<S>({ sourceNodePath, value, key, lastSourceNode, matchingNodeOptions, }: {
        sourceNodePath: string;
        value: any;
        key: string | undefined;
        lastSourceNode: any;
        matchingNodeOptions?: INodeSyncOptions<any, any> | undefined;
    }): ISourceNodeWrapper<S>;
}
