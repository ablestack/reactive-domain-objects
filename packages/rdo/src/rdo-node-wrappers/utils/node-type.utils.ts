import { Logger } from '../infrastructure/logger';
import { SourceNodeTypeInfo, JavaScriptBuiltInType, RdoNodeTypeInfo, IsISyncableCollection } from '..';

const logger = Logger.make('node-type.utils');

/**
 *
 */
function getSourceNodeType(sourceNodeVal: any): SourceNodeTypeInfo {
  const sourceNodeBuiltInType = toString.call(sourceNodeVal) as JavaScriptBuiltInType;

  switch (sourceNodeBuiltInType) {
    case '[object Boolean]':
    case '[object Date]':
    case '[object Number]':
    case '[object String]': {
      return { kind: 'Primitive', builtInType: sourceNodeBuiltInType };
    }
    case '[object Object]': {
      return { kind: 'Object', builtInType: sourceNodeBuiltInType };
    }
    case '[object Array]': {
      return { kind: 'Collection', builtInType: sourceNodeBuiltInType };
    }
    default: {
      logger.warn(`Unable to find Source type for sourceNodeBuiltInType: ${sourceNodeBuiltInType}`, sourceNodeVal);
      return { kind: undefined, builtInType: sourceNodeBuiltInType };
    }
  }
}

/**
 *
 */
function getRdoNodeType(rdoNodeVal: any): RdoNodeTypeInfo {
  const builtInNodeType = toString.call(rdoNodeVal) as JavaScriptBuiltInType;

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
      logger.warn(`Unable to find RDO Node Type for type: ${builtInNodeType}`, rdoNodeVal);
      return { kind: undefined, type: undefined, builtInType: builtInNodeType };
    }
  }
}

export const NodeTypeUtils = { getSourceNodeType, getRdoNodeType };
