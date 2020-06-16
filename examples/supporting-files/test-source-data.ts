import { Library, AllCollections, PropNameTestRoot, FooWithNotes } from '.';
import { FooSimple, FooWithCollection } from './test-source-types';

// -----------------------------------
// ALL COLLECTIONS GRAPH - TEST SOURCE MODEL
// -----------------------------------
export const allCollectionsJSON_Trio: AllCollections = {
  arrayOfNumbers: [1, 2, undefined, null, 3],
  arrayOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  mapOfNumbers: [1, 2, undefined, null, 3],
  mapOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  setOfNumbers: [1, 2, undefined, null, 3],
  setOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  customCollectionOfNumbers: [1, 2, undefined, null, 3],
  customCollectionOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
};

// -----------------------------------
// ALL COLLECTIONS GRAPH - TEST SOURCE MODEL
// -----------------------------------
export const allCollectionsJSON_Uno: AllCollections = {
  arrayOfNumbers: [1],
  arrayOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }],
  mapOfNumbers: [1],
  mapOfObjects: [{ id: '1', __type: 'mapOfObjectsObject' }],
  setOfNumbers: [1],
  setOfObjects: [{ id: '1', __type: 'setOfObjectsObject' }],
  customCollectionOfNumbers: [1],
  customCollectionOfObjects: [{ id: '1', __type: 'customCollectionOfObjectsObject' }],
};

// -----------------------------------
// LIBRARY GRAPH - PROP NAME TEST MODEL
// -----------------------------------
export const targetedNodeOptionsTestRootJSON: PropNameTestRoot = {
  mapOfDefaultIdRDO: [{ id: '1A' }, { id: '1B' }],
  mapOfDefaultId$RDO: [{ id: '2A' }, { id: '2B' }],
  mapOfDefault_IdRDO: [{ id: '3A' }, { id: '3B' }],
};
