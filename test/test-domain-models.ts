import { observable, computed } from 'mobx';
import { SyncableCollection } from '../src';
import { Book, Author } from '.';

// Define Test Domain Model objects
export class PublisherDomainModel {
  public id: string = '';
  public name$: string = '';

  /*
    Any other domain-specific properties and methods here
  */
}

export class BookDomainModel {
  public id: string = '';
  public title$: string = '';
  public pages$: number = 0;
  public publisher: PublisherDomainModel = new PublisherDomainModel();

  /*
      Any other domain-specific properties and methods here
    */
}

export class AuthorDomainModel {
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

  public books = new Array<BookDomainModel>();

  /*
      Any other domain-specific properties and methods here
  */
}

export class LibraryDomainModel {
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

  public authors: SyncableCollection<Author, AuthorDomainModel> = new SyncableCollection({
    makeKeyFromSourceElement: (author: Author) => author.id,
    makeTargetCollectionItemFromSourceItem: (book: Author) => new AuthorDomainModel(),
  });

  /*
      Any other domain-specific properties and methods here
    */
}
