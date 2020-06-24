import { Marray } from '@ablestack/rdo';
import { Author } from './library-source-models';

// -----------------------------------
// LIBRARY RDO MODELS
// -----------------------------------

export class PublisherRDO {
  public id: string = '';
  public name$: string = '';
}

// -----

export class BookRDO {
  public id: string = '';

  // Title. Using Getter/Setter so we can use a testing spy
  private _title$: string = '';
  public get title$(): string {
    return this._title$;
  }
  public set title$(value: string) {
    this._title$ = value;
  }

  // pages. Using Getter/Setter so we can use a testing spy
  private _pages$: number = 0;
  public get pages$(): number {
    return this._pages$;
  }
  public set pages$(value: number) {
    this._pages$ = value;
  }

  public publisher: PublisherRDO = new PublisherRDO();

  /* Any other domain-specific properties and methods here */
}

// -----

export class AuthorRDO {
  public id: string = '';

  private _name$: string = '';
  public get name$(): string {
    return this._name$;
  }
  public set name$(value: string) {
    this._name$ = value;
  }

  private _age$: number = 0;
  public get age$(): number {
    return this._age$;
  }
  public set age$(value: number) {
    this._age$ = value;
  }

  public books = new Array<BookRDO>();

  /* Any other domain-specific properties and methods here */
}

// -----

export class LibraryRDO {
  // Using public variable
  public name: string = '';

  // Using Observable $ naming convention
  public city$: string = '';

  // Using Observable $ naming convention with Getter/Setter
  private _code$: string = '';
  public get code$(): string {
    return this._code$;
  }
  public set code$(value: string) {
    this._code$ = value;
  }

  // Using Getter/Setter
  private _capacity: number = 0;
  public get capacity(): number {
    return this._capacity;
  }
  public set capacity(value: number) {
    this._capacity = value;
  }

  public authors: Marray<string, Author, AuthorRDO> = new Marray({
    makeCollectionKey: (author: Author) => author.id,
    makeRdo: (book: Author) => new AuthorRDO(),
  });

  /* Any other domain-specific properties and methods here */
}
