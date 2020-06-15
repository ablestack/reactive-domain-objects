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
export interface ISyncableCollection<T> extends IMakeCollectionKeyMethod<T>, Iterable<T> {
    readonly size: number;
    getCollectionKeys: () => string[];
    getElement: (key: string) => T | null | undefined;
    insertElement: (value: T) => void;
    updateElement: (key: string, value: T) => boolean;
    deleteElement: (key: string) => boolean;
    clearElements: () => boolean;
}
export declare function IsISyncableCollection(o: any): o is ISyncableCollection<any>;
export interface ISyncableRDOCollection<S, D> extends IMakeRdo<S, D>, ISyncableCollection<D> {
}
export declare function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any>;
