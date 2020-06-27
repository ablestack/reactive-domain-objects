import _ from 'lodash';
import { MakeCollectionKeyMethod } from '../..';
import { Logger } from '../../infrastructure/logger';

const logger = Logger.make('CollectionUtils');

const _Array = {
  clear: <T>({ collection }: { collection: Array<T> }) => collection.splice(0, collection.length).length > 0,
};

const _Record = {
  deleteElement: <T>({ record, key }: { record: Record<string, T>; key: string }): T | undefined => {
    if (key in record) {
      const item = record[key];
      delete record[key];
      return item;
    }
    return undefined;
  },
};

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

//
//
//
export const CollectionUtils = { Array: _Array, Record: _Record, isIterable };
