import { Logger } from '../../infrastructure/logger';
import { NodeTypeInfo, JavaScriptBuiltInType, IsISyncableCollection } from '../..';

const logger = Logger.make('node-type.utils');

/**
 *
 */
function getNodeType(rdoNodeVal: any): NodeTypeInfo {
  const builtInNodeType = toString.call(rdoNodeVal) as JavaScriptBuiltInType;
  //console.log(` ----------- rdoNodeVal`, rdoNodeVal);

  if (IsISyncableCollection(rdoNodeVal)) {
    return { kind: 'Collection', type: 'ISyncableCollection', builtInType: builtInNodeType };
  }

  switch (builtInNodeType) {
    case '[object Boolean]':
    case '[object Date]':
    case '[object Number]':
    case '[object String]': {
      return { kind: 'Primitive', type: 'Primitive', builtInType: builtInNodeType };
    }
    case '[object Object]': {
      return { kind: 'Object', type: 'Object', builtInType: builtInNodeType };
    }
    case '[object Array]': {
      return { kind: 'Collection', type: 'Array', builtInType: builtInNodeType };
    }
    case '[object Map]': {
      return { kind: 'Collection', type: 'Map', builtInType: builtInNodeType };
    }
    case '[object Set]': {
      return { kind: 'Collection', type: 'Set', builtInType: builtInNodeType };
    }
    default: {
      throw new Error(`Unable to find RDO Node Type for type: ${builtInNodeType}`);
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
