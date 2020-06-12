import {
  IRdoInternalNodeWrapper,
  IMakeCollectionKey,
  IRdoNodeWrapper,
  ISourceInternalNodeWrapper,
  ISourceNodeWrapper,
  IGraphSyncOptions,
  IRdoCollectionKeyFactory,
  IMakeRdo,
  INodeSyncOptions,
  IsISyncableRDOCollection,
  ISyncChildElement,
} from '../types';
import { NodeTypeUtils } from '../utilities/node-type.utils';
import { RdoSyncableCollectionINW } from './rdo-synchable-collection-inw';
import { RdoObjectINW } from './rdo-object-inw';
import { RdoArrayINW } from './rdo-array-inw';
import { RdoMapINW } from './rdo-map-inw';
import { RdoSetINW } from './rdo-set-inw';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('RdoCollectionNodeWrapperFactory');

export class RdoCollectionNodeWrapperFactory {
  public static make<S, D>({
    value,
    key,
    parent,
    wrappedSourceNode,
    syncChildElement,
    options,
  }: {
    value: any;
    key: string | undefined;
    parent: IRdoNodeWrapper | undefined;
    wrappedSourceNode: ISourceNodeWrapper;
    syncChildElement: ISyncChildElement<S, D>;
    options?: IGraphSyncOptions;
  }): IRdoNodeWrapper {
    const typeInfo = NodeTypeUtils.getRdoNodeType(node);

    if (typeInfo.type === 'ISyncableCollection') {
      return new RdoSyncableCollectionINW({ node, wrappedSourceNode });
    } else {
      switch (typeInfo.builtInType) {
        case '[object Array]': {
          if (!makeKey) throw new Error('RdoNodeWrapperFactory-make - makeKey required for non-primitive types');
          return new RdoArrayINW({ value, key, parent, wrappedSourceNode, syncChildElement, makeKey });
        }
        case '[object Map]': {
          if (!makeKey) throw new Error('RdoNodeWrapperFactory-make - makeKey required for non-primitive types');
          return new RdoMapINW({ value, key, parent, wrappedSourceNode, syncChildElement makeKey });
        }
        case '[object Set]': {
          if (!makeKey) throw new Error('RdoNodeWrapperFactory-make - makeKey required for non-primitive types');
          return new RdoSetINW({ value, key, parent, wrappedSourceNode, syncChildElement makeKey });
        }
        default: {
          throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
        }
      }
    }
  }

  /** */
  private tryGetRdoCollectionProcessingMethods({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: any }) {
    let makeRdoCollectionKey: IRdoCollectionKeyFactory<any, any> | undefined;
    let makeRdo: IMakeRdo<any, any> | undefined;

    const collectionElementType = this.getCollectionElementType({ sourceCollection, targetCollection });

    //
    // If types are primitive, provide auto methods, else try and get from configuration
    //
    if (collectionElementType === 'primitive' || collectionElementType === 'empty') {
      makeRdoCollectionKey = { fromSourceElement: (primitive) => primitive.toString(), fromRdoElement: (primitive) => primitive.toString() };
      makeRdo = (primitive) => primitive;
    } else {
      const targetDerivedOptions = this.getMatchingOptionsForCollectionNode({ sourceCollection, targetCollection });
      const typeDerivedOptions: Partial<INodeSyncOptions<any, any>> | undefined = IsISyncableRDOCollection(targetCollection)
        ? {
            makeRdoCollectionKey: {
              fromSourceElement: targetCollection.makeRdoCollectionKeyFromSourceElement,
              fromRdoElement: targetCollection.makeRdoCollectionKeyFromRdoElement,
            },
            makeRdo: targetCollection.makeRdo,
          }
        : undefined;

      // GET CONFIG ITEM: makeRdoCollectionKeyFromSourceElement
      makeRdoCollectionKey = targetDerivedOptions?.makeRdoCollectionKey || typeDerivedOptions?.makeRdoCollectionKey || this.tryMakeAutoKeyMaker({ sourceCollection, targetCollection });

      // GET CONFIG ITEM: makeRdo
      makeRdo = targetDerivedOptions?.makeRdo || typeDerivedOptions?.makeRdo;
    }

    return { makeRdoCollectionKey, makeRdo };
  }

  /** */
  private getMatchingOptionsForCollectionNode({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: Iterable<any> }): INodeSyncOptions<any, any> | undefined {
    let options = this.getMatchingOptionsForNode();
    if (options) {
      return options;
    }

    if (this._targetedOptionMatchersArray.length === 0) return;

    // Selector targeted options could be matching elements of a collection
    // So look at the first element of source or domain collections to check

    // Try and get options from Source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      options = this._targetedOptionMatchersArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInSourceCollection) : false));
      if (options) return options;
    }

    // Try and get options from Target collection
    // ASSUMPTION - all supported collection types implement Iterable<>
    const firstItemInTargetCollection = targetCollection[Symbol.iterator]().next().value;
    options = this._targetedOptionMatchersArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInTargetCollection) : false));
    return options;
  }

  /** */
  private tryMakeAutoKeyMaker({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: Iterable<any> }): IRdoCollectionKeyFactory<any, any> | undefined {
    let makeRdoCollectionKey: IRdoCollectionKeyFactory<any, any> = {} as any;

    // Try and get options from source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      if (firstItemInSourceCollection && firstItemInSourceCollection.id) {
        makeRdoCollectionKey.fromSourceElement = (sourceNode: any) => {
          return sourceNode.id;
        };
      }
    }

    // Try and get options from domain collection
    const firstItemInTargetCollection = targetCollection[Symbol.iterator]().next().value;
    if (firstItemInTargetCollection) {
      let idKey = 'id';
      let hasIdKey = idKey in firstItemInTargetCollection;

      // If matching id key not found, try with standardPostfix if config setting supplied
      if (!hasIdKey && this._globalNodeOptions?.commonRdoFieldnamePostfix) {
        idKey = `${idKey}${this._globalNodeOptions.commonRdoFieldnamePostfix}`;
        hasIdKey = idKey in firstItemInTargetCollection;
      }

      if (hasIdKey) {
        makeRdoCollectionKey.fromRdoElement = (rdo: any) => {
          return rdo[idKey];
        };
      }
    }

    // Allow to return if fromRdoElement is null, even though this is not allowed in user supplied options
    //  When defaultKeyMaker, the code can handle a special case where fromRdoElement is null (when no items in domain collection)
    if (!makeRdoCollectionKey || !makeRdoCollectionKey.fromSourceElement) return undefined;
    else return makeRdoCollectionKey;
  }

  /** */
  private getCollectionElementType({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: Iterable<any> }): 'empty' | 'primitive' | 'object' {
    // Try and get collection type from source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      const sourceNodeTypeInfo = NodeTypeUtils.getSourceNodeType(firstItemInSourceCollection);
      if (sourceNodeTypeInfo.kind === 'Primitive') return 'primitive';
      else return 'object';
    }

    // Try and get collection type from Target collection
    // ASSUMPTION - all supported collection types implement Iterable<>
    const firstItemInTargetCollection = targetCollection[Symbol.iterator]().next().value;
    if (!firstItemInTargetCollection) return 'empty';
    const rdoFieldTypeInfo = NodeTypeUtils.getRdoNodeType(firstItemInTargetCollection);
    if (rdoFieldTypeInfo.type === 'Primitive') return 'primitive';
    else return 'object';
  }
}
