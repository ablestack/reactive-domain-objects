export type Publisher = { id: string; name: string };
export type Book = { id: string; title: string; pages: number; publisher: Publisher };
export type Author = { id: string; name: string; age: number; books: Book[] };
export type MockWatchedQueryResult = { author: Author };
