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
      return { type: 'Primitive', builtInType: sourceNodeBuiltInType };
    }
    case '[object Object]': {
      return { type: 'Object', builtInType: sourceNodeBuiltInType };
    }
    case '[object Array]': {
      return { type: 'Collection', builtInType: sourceNodeBuiltInType };
    }
    default: {
      logger.warn(`Unable to find Source type for sourceNodeBuiltInType: ${sourceNodeBuiltInType}`, sourceNodeVal);
      return { type: undefined, builtInType: sourceNodeBuiltInType };
    }
  }
}

/**
 *
 */
function getRdoNodeType(rdoNodeVal: any): RdoNodeTypeInfo {
  const builtInNodeType = toString.call(rdoNodeVal) as JavaScriptBuiltInType;

  if (IsISyncableCollection(rdoNodeVal)) {
    return { type: 'ISyncableCollection', builtInType: builtInNodeType };
  }

  switch (builtInNodeType) {
    case '[object Boolean]':
    case '[object Date]':
    case '[object Number]':
    case '[object String]': {
      return { type: 'Primitive', builtInType: builtInNodeType };
    }
    case '[object Object]': {
      return { type: 'Object', builtInType: builtInNodeType };
    }
    case '[object Array]': {
      return { type: 'Array', builtInType: builtInNodeType };
    }
    case '[object Map]': {
      return { type: 'Map', builtInType: builtInNodeType };
    }
    case '[object Set]': {
      return { type: 'Set', builtInType: builtInNodeType };
    }
    default: {
      logger.warn(`Unable to find RDO Node Type for type: ${builtInNodeType}`, rdoNodeVal);
      return { type: undefined, builtInType: builtInNodeType };
    }
  }
}

export const NodeTypeUtils = { getSourceNodeType, getRdoNodeType };
