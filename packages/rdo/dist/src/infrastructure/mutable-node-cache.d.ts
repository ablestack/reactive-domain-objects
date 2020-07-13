export declare class MutableNodeCache {
    private _sourceMap;
    set({ sourceNodeInstancePath, dataKey, data }: {
        sourceNodeInstancePath: string;
        dataKey?: string;
        data: any;
    }): void;
    get<T>({ sourceNodeInstancePath, dataKey }: {
        sourceNodeInstancePath: string;
        dataKey?: string;
    }): T | undefined;
    clear(): void;
}
