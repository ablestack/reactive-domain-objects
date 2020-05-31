// -----------------------------------
// LIBRARY GRAPH - TEST SOURCE TYPES
// -----------------------------------
export type Publisher = { id: string; name: string };
export type Book = { id: string; title: string; pages: number; publisher: Publisher };
export type Author = { id: string; name: string; age: number; books: Book[] };
export type Library = { name: string; city: string; capacity: number; code: string; authors: Author[] };
export type MockWatchedLibraryQueryResult = { library: Library };

// -----------------------------------
// ALL COLLECTIONS GRAPH - TEST SOURCE TYPES
// -----------------------------------
export type SimpleObject = { id: string };
export type AllCollections = {
  arrayOfNumbers: number[];
  arrayOfObjects: SimpleObject[];

  mapOfNumbers: number[];
  mapOfObjects: SimpleObject[];

  setOfNumbers: number[];
  setOfObjects: SimpleObject[];

  customCollectionOfNumbers: number[];
  customCollectionOfObjects: SimpleObject[];
};
export type MockWatchedAllCollectionsQueryResult = { data: AllCollections };
