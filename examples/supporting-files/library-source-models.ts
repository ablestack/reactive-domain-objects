// -----------------------------------
// LIBRARY SOURCE DATA MODELS
// -----------------------------------
export type Publisher = { id: string; name: string };
export type Book = { id: string; title: string; pages: number; publisher: Publisher; __type: string };
export type Author = { id: string; name: string; age: number; books: Book[] };
export type Library = { name: string; city: string; capacity: number; code: string; authors: Author[] };
