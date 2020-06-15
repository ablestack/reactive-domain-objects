import { IRdoCollectionNodeWrapper, ISyncChildNode } from '../..';
/** */
declare function synchronizeCollection<S, D>({ rdo, syncChildNode }: {
    rdo: IRdoCollectionNodeWrapper<S, D>;
    syncChildNode: ISyncChildNode<S, D>;
}): boolean;
export declare const SyncUtils: {
    synchronizeCollection: typeof synchronizeCollection;
};
export {};
