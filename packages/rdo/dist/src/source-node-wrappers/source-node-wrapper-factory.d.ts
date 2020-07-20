import { ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '..';
export declare class SourceNodeWrapperFactory {
    private _globalNodeOptions;
    constructor({ globalNodeOptions }: {
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    make<S, D>({ sourceNodeTypePath, sourceNodeInstancePath, value, key, matchingNodeOptions, }: {
        sourceNodeTypePath: string;
        sourceNodeInstancePath: string;
        value: any;
        key: string | number | undefined;
        matchingNodeOptions?: INodeSyncOptions<S, D> | undefined;
    }): ISourceNodeWrapper<S, D>;
}
