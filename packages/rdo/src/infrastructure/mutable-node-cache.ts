export class MutableNodeCache {
  private _sourceMap = new Map<string, any>();

  public set({ sourceNodeInstancePath, data }: { sourceNodeInstancePath: string; data: any }) {
    this._sourceMap.set(sourceNodeInstancePath, data);
  }

  public get<T>({ sourceNodeInstancePath }: { sourceNodeInstancePath: string }): T {
    return this._sourceMap.get(sourceNodeInstancePath);
  }

  public clear() {
    this._sourceMap.clear();
  }
}
