"use strict";
// import { Logger } from '../infrastructure/logger';
// import { IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, IGraphSyncOptions, ICollectionKeyFactory, IMakeRdo, INodeSyncOptions, IsISyncableRDOCollection } from '..';
// import { NodeTypeUtils } from './utils/node-type.utils';
// import { RdoSyncableCollectionNW, RdoArrayNW, RdoMapNW, RdoSetNW } from '.';
// const logger = Logger.make('RdoCollectionNodeWrapperFactory');
// export class RdoCollectionNodeWrapperFactory {
//   /** */
//   private tryGetRdoCollectionProcessingMethods({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: any }) {
//     let makeRdoCollectionKey: ICollectionKeyFactory<any, any> | undefined;
//     let makeRdo: IMakeRdo<any, any> | undefined;
//     const collectionElementType = this.getCollectionElementType({ sourceCollection, targetCollection });
//     //
//     // If types are primitive, provide auto methods, else try and get from configuration
//     //
//     if (collectionElementType === 'primitive' || collectionElementType === 'empty') {
//       makeRdoCollectionKey = { fromSourceElement: (primitive) => primitive.toString(), fromRdoElement: (primitive) => primitive.toString() };
//       makeRdo = (primitive) => primitive;
//     } else {
//       const targetDerivedOptions = this.getMatchingOptionsForCollectionNode({ sourceCollection, targetCollection });
//       const typeDerivedOptions: Partial<INodeSyncOptions<any, any>> | undefined = IsISyncableRDOCollection(targetCollection)
//         ? {
//             makeRdoCollectionKey: {
//               fromSourceElement: targetCollection.makeCollectionKeyFromSourceElement,
//               fromRdoElement: targetCollection.makeCollectionKeyFromRdoElement,
//             },
//             makeRdo: targetCollection.makeRdo,
//           }
//         : undefined;
//       // GET CONFIG ITEM: makeCollectionKeyFromSourceElement
//       makeRdoCollectionKey = targetDerivedOptions?.makeRdoCollectionKey || typeDerivedOptions?.makeRdoCollectionKey || this.tryMakeAutoKeyMaker({ sourceCollection, targetCollection });
//       // GET CONFIG ITEM: makeRdo
//       makeRdo = targetDerivedOptions?.makeRdo || typeDerivedOptions?.makeRdo;
//     }
//     return { makeRdoCollectionKey, makeRdo };
//   }
//   /** */
//   private getMatchingOptionsForCollectionNode({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: Iterable<any> }): INodeSyncOptions<any, any> | undefined {
//     let options = this.getMatchingOptionsForNode();
//     if (options) {
//       return options;
//     }
//     if (this._targetedOptionMatchersArray.length === 0) return;
//     // Selector targeted options could be matching elements of a collection
//     // So look at the first element of source or domain collections to check
//     // Try and get options from Source collection
//     if (sourceCollection && sourceCollection.length > 0) {
//       const firstItemInSourceCollection = sourceCollection[0];
//       options = this._targetedOptionMatchersArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInSourceCollection) : false));
//       if (options) return options;
//     }
//     // Try and get options from Target collection
//     // ASSUMPTION - all supported collection types implement Iterable<>
//     const firstItemInTargetCollection = targetCollection[Symbol.iterator]().next().value;
//     options = this._targetedOptionMatchersArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInTargetCollection) : false));
//     return options;
//   }
//   /** */
//   /** */
//   // private getCollectionElementType({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: Iterable<any> }): 'empty' | 'primitive' | 'object' {
//   //   // Try and get collection type from source collection
//   //   if (sourceCollection && sourceCollection.length > 0) {
//   //     const firstItemInSourceCollection = sourceCollection[0];
//   //     const sourceNodeTypeInfo = NodeTypeUtils.getSourceNodeType(firstItemInSourceCollection);
//   //     if (sourceNodeTypeInfo.kind === 'Primitive') return 'primitive';
//   //     else return 'object';
//   //   }
//   //   // Try and get collection type from Target collection
//   //   // ASSUMPTION - all supported collection types implement Iterable<>
//   //   const firstItemInTargetCollection = targetCollection[Symbol.iterator]().next().value;
//   //   if (!firstItemInTargetCollection) return 'empty';
//   //   const rdoFieldTypeInfo = NodeTypeUtils.getRdoNodeType(firstItemInTargetCollection);
//   //   if (rdoFieldTypeInfo.type === 'Primitive') return 'primitive';
//   //   else return 'object';
//   // }
// }
// // private synchronizeTargetCollectionWithSourceArray({    wrappedRdoCollectionNode,    wrappedSourceCollectionNode  }: {    wrappedRdoCollectionNode: IRdoCollectionNodeWrapper<any>,    wrappedSourceCollectionNode: ISourceNodeWrapper  }): boolean {
// //   if (wrappedRdoCollectionNode.typeInfo.builtInType !== '[object Undefined]') throw Error(`Destination types must not be null when transforming Array source type. Source type: '${wrappedSourceCollectionNode.typeInfo.builtInType}', rdoNodeTypeInfo: ${wrappedRdoCollectionNode.typeInfo.builtInType} `);
// //   const { makeRdoCollectionKey, makeRdo } = this.tryGetRdoCollectionProcessingMethods({ sourceCollection:wrappedRdoCollectionNode.value, targetCollection: wrappedRdoCollectionNode.value });
// //   // VALIDATE
// //   if (wrappedSourceCollectionNode.length > 0 && !makeRdoCollectionKey?.fromSourceElement) {
// //     throw new Error(
// //       `Could not find 'makeRdoCollectionKey?.fromSourceElement)' (Path: '${this.getSourceNodePath()}', type: ${rdoNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRdoFactory on the contained type`,
// //     );
// //   }
// //   if (sourceCollection.length > 0 && !makeRdo) {
// //     throw new Error(`Could not find 'makeRdo' (Path: '${this.getSourceNodePath()}', type: ${rdoNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRdoFactory on the contained type`);
// //   }
// //   // Execute
// //   return wrappedRdoCollectionNode.smartSync({ lastSourceObject: wrappedSourceCollectionNode.value})
// // }
//# sourceMappingURL=rdo-collection-node-wrapper-factory.js.map