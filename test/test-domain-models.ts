import { observable, computed } from 'mobx';
import { SyncableCollection } from '../src';
import { Book, Author } from '.';

// Define Test Domain Model objects
export class PublisherDomainModel {
  public id: string = '';
  @observable public name$: string = '';

  /*
    Any other domain-specific properties and methods here
  */
}

export class BookDomainModel {
  public id: string = '';
  @observable public title$: string = '';
  @observable public pages$: number = 0;
  public publisher: PublisherDomainModel = new PublisherDomainModel();

  /*
      Any other domain-specific properties and methods here
    */
}

export class AuthorDomainModel {
  public id: string = '';

  @observable private _name$: string = '';
  @computed public get name$(): string {
    return this._name$;
  }
  public set name$(val: string) {
    console.log(` AUTHOR SET NAME$ -----------------------> ${val} `);
    this._name$ = val;
  }

  @observable private _age$: number = 0;
  @computed public get age$(): number {
    return this._age$;
  }
  public set age$(val: number) {
    console.log(` AUTHOR SET AGE$ -----------------------> ${val} `);
    this._age$ = val;
  }

  @observable public books = new Array<BookDomainModel>();

  /*
      Any other domain-specific properties and methods here
  */
}

export class LibraryDomainModel {
  // Using public variable
  public name: string = '';

  // Using Observable
  @observable public city$: string = '';

  // Using Observable with Getter/Setter
  @observable private _code$: string = '';
  @computed public get code$(): string {
    return this._code$;
  }
  public set code$(val: string) {
    console.log(` LIBRARY SET CODE -----------------------> ${val} `);
    this._code$ = val;
  }

  // Using Getter/Setter
  private _capacity: number = 0;
  public get capacity(): number {
    return this._capacity;
  }
  public set capacity(val: number) {
    console.log(` LIBRARY SET CAPACITY -----------------------> ${val} `);
    this._capacity = val;
  }

  public authors: SyncableCollection<Author, AuthorDomainModel> = new SyncableCollection({
    makeKeyFromSourceElement: (author: Author) => author.id,
    makeTargetCollectionItemFromSourceItem: (book: Author) => new AuthorDomainModel(),
  });

  /*
      Any other domain-specific properties and methods here
    */
}
