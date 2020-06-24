import { Logger } from '../../infrastructure/logger';
import { NodeTypeInfo, JavaScriptStringifiedType, IsISyncableCollection } from '../..';

const logger = Logger.make('node-type.utils');

/**
 *
 */
function getNodeType(rdoNodeVal: any): NodeTypeInfo {
  const stringifiedNodeType = toString.call(rdoNodeVal) as JavaScriptStringifiedType;

  if (IsISyncableCollection(rdoNodeVal)) {
    return { kind: 'Collection', type: 'ISyncableCollection', stringifiedType: stringifiedNodeType };
  }

  switch (stringifiedNodeType) {
    case '[object Boolean]':
    case '[object Date]':
    case '[object Number]':
    case '[object String]': {
      return { kind: 'Primitive', type: 'Primitive', stringifiedType: stringifiedNodeType };
    }
    case '[object Object]': {
      return { kind: 'Object', type: 'Object', stringifiedType: stringifiedNodeType };
    }
    case '[object Array]': {
      return { kind: 'Collection', type: 'Array', stringifiedType: stringifiedNodeType };
    }
    case '[object Map]': {
      return { kind: 'Collection', type: 'Map', stringifiedType: stringifiedNodeType };
    }
    case '[object Set]': {
      return { kind: 'Collection', type: 'Set', stringifiedType: stringifiedNodeType };
    }
    default: {
      throw new Error(`Unable to find RDO Node Type for type: ${stringifiedNodeType}`);
    }
  }
}

function isPrimitive(val: any): boolean {
  switch (typeof val) {
    case 'bigint':
    case 'boolean':
    case 'number':
    case 'string': {
      return true;
    }
    case 'undefined':
    case null:
    default: {
      return false;
    }
  }
}

export const NodeTypeUtils = { getNodeType, isPrimitive };
