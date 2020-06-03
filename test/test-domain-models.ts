import { Author } from '.';
import { SyncableCollection } from '../src';
import { SimpleObject } from './test-source-types';

// -----------------------------------
// LIBRARY GRAPH - FOO BAR
// -----------------------------------
export class FooDomainModel {
  // Public properties. Getters and Setters will work fine also
  public id = '';

  // Child Domain Models
  public bar = new BarDomainModel();

  // Collections of Child Domain Models
  public arrayOfBar = new Array<BarDomainModel>();
  public mapOfBar = new Map<string, BarDomainModel>();

  /* Any other domain-specific properties and methods here */

  // Note, all values must be initialized to a default value on instantiation, or they will be removed by the TS -> JS compilation step and will not sync
}

export class BarDomainModel {
  public id: string = '';

  /* Further nesting of Domain Models or collections of Domain Models here */

  /* Any other domain-specific properties and methods here */
}

// -----------------------------------
// LIBRARY GRAPH - TEST DOMAIN MODELS
// -----------------------------------

/**
 * @export
 * @class PublisherDomainModel
 */
export class PublisherDomainModel {
  public id: string = '';
  public name$: string = '';
}

export class BookDomainModel {
  public id: string = '';
  public title$: string = '';
  public pages$: number = 0;
  public publisher: PublisherDomainModel = new PublisherDomainModel();

  /* Any other domain-specific properties and methods here */
}

/**
 * @export
 * @class AuthorDomainModel
 */
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

  /* Any other domain-specific properties and methods here */
}

/**
 *
 *
 * @export
 * @class LibraryDomainModel
 */
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
    makeDomainNodeKeyFromSourceNode: (author: Author) => author.id,
    makeDomainNodeKeyFromDomainModel: (author: AuthorDomainModel) => author.id,
    makeDomainModel: (book: Author) => new AuthorDomainModel(),
  });

  /* Any other domain-specific properties and methods here */
}

// ------------------------------------------------
// ALL COLLECTION TYPES GRAPH - TEST DOMAIN MODELS
// ------------------------------------------------
export class AllCollectionTypesWithObjectsDomainModel {
  public arrayOfObjects = new Array<SimpleObjectDomainModel>();
  public mapOfObjects = new Map<string, SimpleObjectDomainModel>();
  public setOfObjects = new Set<SimpleObjectDomainModel>();
  public customCollectionOfObjects = new SyncableCollection({
    makeDomainNodeKeyFromSourceNode: (o: SimpleObject) => o.id,
    makeDomainNodeKeyFromDomainModel: (o: SimpleObjectDomainModel) => o.id,
    makeDomainModel: (o: SimpleObjectDomainModel) => new SimpleObjectDomainModel(),
  });
}

export class AllCollectionTypesWithPrimitivesDomainModel {
  public arrayOfNumbers = new Array<Number>();
  public mapOfNumbers = new Map<string, number>();
  public setOfNumbers = new Set<number>();
}

export class AllCollectionTypesDomainModel {
  public arrayOfObjects = new Array<SimpleObjectDomainModel>();
  public mapOfObjects = new Map<string, SimpleObjectDomainModel>();
  public setOfObjects = new Set<SimpleObjectDomainModel>();
  public customCollectionOfObjects = new SyncableCollection({
    makeDomainNodeKeyFromSourceNode: (o: SimpleObject) => o.id,
    makeDomainNodeKeyFromDomainModel: (o: SimpleObjectDomainModel) => o.id,
    makeDomainModel: (o: SimpleObjectDomainModel) => new SimpleObjectDomainModel(),
  });
  public arrayOfNumbers = new Array<Number>();
  public mapOfNumbers = new Map<string, number>();
  public setOfNumbers = new Set<number>();
}

export class SimpleObjectDomainModel {
  public id = '';
}

// -----------------------------------
// LIBRARY GRAPH - PROP NAME TEST MODEL
// -----------------------------------
export class TargetedOptionsTestRootDomainModel {
  public mapOfDefaultIdDomainModel = new Array<DefaultIdDomainModel>();
  public mapOfDefaultId$DomainModel = new Array<DefaultId$DomainModel>();
  public mapOfDefault_IdDomainModel = new Array<Default_IdDomainModel>();
}

export class DefaultIdDomainModel {
  private _id: string = '';
  public get id(): string {
    return this._id;
  }
  public set id(value) {
    this._id = value;
  }
}

export class DefaultId$DomainModel {
  private _id$: string = '';
  public get id$(): string {
    return this._id$;
  }
  public set id$(value) {
    this._id$ = value;
  }
}

export class Default_IdDomainModel {
  private __id: string = '';
  public get _id(): string {
    return this.__id;
  }
  public set _id(value) {
    this.__id = value;
  }
}
