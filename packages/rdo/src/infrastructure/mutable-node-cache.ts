import { Logger } from './logger';

const logger = Logger.make('MutableNodeCache');
const defaultDataKey = 'default';

export class MutableNodeCache {
  private _sourceMap = new Map<string, Map<string, any>>();

  public set({ sourceNodeInstancePath, dataKey = defaultDataKey, data }: { sourceNodeInstancePath: string; dataKey?: string; data: any }) {
    let dataItem = this._sourceMap.get(sourceNodeInstancePath);
    if (!dataItem) dataItem = new Map<string, any>();
    dataItem.set(dataKey, data);
    this._sourceMap.set(sourceNodeInstancePath, dataItem);

    console.log(`MutableNodeCache - set(${sourceNodeInstancePath}, ${dataKey})`, dataItem);
    //logger.trace('set', dataItem);
  }

  public get<T>({ sourceNodeInstancePath, dataKey = defaultDataKey }: { sourceNodeInstancePath: string; dataKey?: string }): T | undefined {
    return this._sourceMap.get(sourceNodeInstancePath)?.get(dataKey);
  }

  public clear() {
    this._sourceMap.clear();
  }
}
