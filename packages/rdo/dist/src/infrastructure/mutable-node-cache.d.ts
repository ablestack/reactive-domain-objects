export declare class MutableNodeCache {
    private _sourceMap;
    set({ sourceNodeInstancePath, data }: {
        sourceNodeInstancePath: string;
        data: any;
    }): void;
    get<T>({ sourceNodeInstancePath }: {
        sourceNodeInstancePath: string;
    }): T;
    clear(): void;
}
