// -----------------------------------
// FOO GRAPH - TEST SOURCE TYPES
// -----------------------------------
export type Foo = { id: string; bar: Bar; arrayOfBar: Bar[]; mapOfBar: Bar[] };
export type Bar = { id: string };

// -----------------------------------
// LIBRARY GRAPH - TEST SOURCE TYPES
// -----------------------------------
export type Publisher = { id: string; name: string };
export type Book = { id: string; title: string; pages: number; publisher: Publisher; __type: string };
export type Author = { id: string; name: string; age: number; books: Book[] };
export type Library = { name: string; city: string; capacity: number; code: string; authors: Author[] };

// -----------------------------------
// ALL COLLECTIONS GRAPH - TEST SOURCE TYPES
// -----------------------------------
export type SimpleObject = { id: string; __type?: string };
export type AllCollections = {
  arrayOfNumbers: (number | undefined | null)[];
  arrayOfObjects: (SimpleObject | undefined | null)[];

  mapOfNumbers: (number | undefined | null)[];
  mapOfObjects: (SimpleObject | undefined | null)[];

  setOfNumbers: (number | undefined | null)[];
  setOfObjects: (SimpleObject | undefined | null)[];

  customCollectionOfNumbers: (number | undefined | null)[];
  customCollectionOfObjects: (SimpleObject | undefined | null)[];
};
