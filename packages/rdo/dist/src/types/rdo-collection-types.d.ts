export declare type MakeCollectionKeyMethod<T> = (item: T) => string | undefined;
export interface IMakeCollectionKey<T> {
    makeCollectionKey: (item: T) => string | undefined;
}
export declare function isIMakeCollectionKey(o: any): o is IMakeCollectionKey<any>;
export interface IMakeCollectionKeyFromSourceElement<T> {
    makeCollectionKeyFromSourceElement: IMakeCollectionKey<T>['makeCollectionKey'];
}
export declare function isIMakeCollectionKeyFromSourceElement(o: any): o is IMakeCollectionKeyFromSourceElement<any>;
export interface IMakeCollectionKeyFromRdoElement<T> {
    makeCollectionKeyFromRdoElement: IMakeCollectionKey<T>['makeCollectionKey'];
}
export declare function isIMakeCollectionKeyFromRdoElement(o: any): o is IMakeCollectionKeyFromRdoElement<any>;
export interface IMakeRdo<S, D> {
    makeRdo(sourceObject: S): D | undefined;
}
export declare function isIMakeRdo(o: any): o is IMakeRdo<any, any>;
export interface ISyncableCollection<S, D> extends IMakeCollectionKeyFromSourceElement<S>, IMakeCollectionKeyFromRdoElement<D> {
    readonly size: number;
    elements(): Iterable<D>;
    getCollectionKeys: () => string[];
    getElement: (key: string) => D | null | undefined;
    insertElement: (key: string, value: D) => void;
    updateElement: (key: string, value: D) => boolean;
    deleteElement: (key: string) => boolean;
    clearElements: () => boolean;
}
export declare function IsISyncableCollection(o: any): o is ISyncableCollection<any, any>;
export interface ISyncableRDOCollection<S, D> extends IMakeRdo<S, D>, ISyncableCollection<S, D> {
}
export declare function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any>;
