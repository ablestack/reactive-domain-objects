export interface IMakeCollectionKeyMethod<T> {
    (item: T): string | undefined;
}
export interface ICollectionKeyFactory<T> {
    makeKey: IMakeCollectionKeyMethod<T>;
}
export declare function isICollectionKeyFactory(o: any): o is ICollectionKeyFactory<any>;
export interface IMakeRdo<S, D> {
    makeRdo(sourceObject: S): D | undefined;
}
export declare function isIMakeRdo(o: any): o is IMakeRdo<any, any>;
export interface ISyncableCollection<S, D> {
    readonly size: number;
    makeRdoCollectionKeyFromSourceElement: IMakeCollectionKeyMethod<S>;
    makeRdoCollectionKeyFromRdoElement: IMakeCollectionKeyMethod<D>;
    elements(): Iterable<D>;
    getCollectionKeys: () => string[];
    getElement: (key: string) => D | null | undefined;
    insertElement: (value: D) => void;
    updateElement: (key: string, value: D) => boolean;
    deleteElement: (key: string) => boolean;
    clearElements: () => boolean;
}
export declare function IsISyncableCollection(o: any): o is ISyncableCollection<any, any>;
export interface ISyncableRDOCollection<S, D> extends IMakeRdo<S, D>, ISyncableCollection<S, D> {
}
export declare function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any>;
