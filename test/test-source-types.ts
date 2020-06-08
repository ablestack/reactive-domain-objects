// -----------------------------------
// FOO GRAPH - TEST SOURCE TYPES
// -----------------------------------
export type Foo = { id: string; name: string };
export type FooSimple = { bar: Bar };
export type FooWithCollection = { collectionOfBar: Bar[] };
export type Bar = { id: string; name: string };

// -----------------------------------
// FOO WITH NOTES GRAPH - TEST SOURCE TYPES
// -----------------------------------
export type FooWithNotes = { id: string; bar: BarWithNotes; arrayOfBar: BarWithNotes[]; mapOfBar: BarWithNotes[] };
export type BarWithNotes = { id: string };

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

// -----------------------------------
// LIBRARY GRAPH - TEST SOURCE TYPES
// -----------------------------------
export type PropNameTestRoot = { mapOfDefaultIdDomainModel: DefaultIdSourceObject[]; mapOfDefaultId$DomainModel: DefaultIdSourceObject[]; mapOfDefault_IdDomainModel: DefaultIdSourceObject[] };
export type DefaultIdSourceObject = { id: string };
