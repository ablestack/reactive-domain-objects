import { Author } from '.';
import { SyncableCollection } from '@ablestack/rdg-apollo-mobx-connector';
import { SimpleObject } from './test-source-types';

// -----------------------------------
// LIBRARY GRAPH - FOO BAR
// -----------------------------------
export class FooRDO {
  public id: string = '';
  public name: string = '';
}

export class FooDomainGraphSimple {
  public bar = new BarRDO();
}

export class FooDomainGraphWithCollection {
  public collectionOfBar = new Map<string, BarRDO>();
}

export class BarRDO {
  public id: string = '';
  public name: string = '';
}

// -----------------------------------
// LIBRARY GRAPH - FOO BAR WITH NOTES
// -----------------------------------
export class FooWithNotesRDO {
  // Public properties. Getters and Setters will work fine also
  public id = '';

  // Child RDOs
  public bar = new BarWithNotesRDO();

  // Collections of Child RDOs
  public arrayOfBar = new Array<BarWithNotesRDO>();
  public mapOfBar = new Map<string, BarWithNotesRDO>();

  /* Any other domain-specific properties and methods here */

  // Note, all values must be initialized to a default value on instantiation, or they will be removed by the TS -> JS compilation step and will not sync
}

export class BarWithNotesRDO {
  public id: string = '';

  /* Further nesting of RDOs or collections of RDOs here */

  /* Any other domain-specific properties and methods here */
}

// -----------------------------------
// LIBRARY GRAPH - TEST RDOS
// -----------------------------------

/**
 * @export
 * @class PublisherRDO
 */
export class PublisherRDO {
  public id: string = '';
  public name$: string = '';
}

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

/**
 * @export
 * @class AuthorRDO
 */
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

/**
 *
 *
 * @export
 * @class LibraryRDO
 */
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

  public authors: SyncableCollection<Author, AuthorRDO> = new SyncableCollection({
    makeRDOCollectionKeyFromSourceElement: (author: Author) => author.id,
    makeRdoCollectionKeyFromRdoElement: (author: AuthorRDO) => author.id,
    makeRDO: (book: Author) => new AuthorRDO(),
  });

  /* Any other domain-specific properties and methods here */
}

// ------------------------------------------------
// ALL COLLECTION TYPES GRAPH - TEST RDOS
// ------------------------------------------------
export class AllCollectionTypesWithObjectsRDO {
  public arrayOfObjects = new Array<SimpleRDO>();
  public mapOfObjects = new Map<string, SimpleRDO>();
  public setOfObjects = new Set<SimpleRDO>();
  public customCollectionOfObjects = new SyncableCollection({
    makeRDOCollectionKeyFromSourceElement: (o: SimpleObject) => o.id,
    makeRdoCollectionKeyFromRdoElement: (o: SimpleRDO) => o.id,
    makeRDO: (o: SimpleRDO) => new SimpleRDO(),
  });
}

export class AllCollectionTypesWithPrimitivesRDO {
  public arrayOfNumbers = new Array<Number>();
  public mapOfNumbers = new Map<string, number>();
  public setOfNumbers = new Set<number>();
}

export class AllCollectionTypesRDO {
  public arrayOfObjects = new Array<SimpleRDO>();
  public mapOfObjects = new Map<string, SimpleRDO>();
  public setOfObjects = new Set<SimpleRDO>();
  public customCollectionOfObjects = new SyncableCollection({
    makeRDOCollectionKeyFromSourceElement: (o: SimpleObject) => o.id,
    makeRdoCollectionKeyFromRdoElement: (o: SimpleRDO) => o.id,
    makeRDO: (o: SimpleRDO) => new SimpleRDO(),
  });
  public arrayOfNumbers = new Array<Number>();
  public mapOfNumbers = new Map<string, number>();
  public setOfNumbers = new Set<number>();
}

export class SimpleRDO {
  public id = '';
}

// -----------------------------------
// LIBRARY GRAPH - PROP NAME TEST MODEL
// -----------------------------------
export class TargetedOptionsTestRootRDO {
  public mapOfDefaultIdRDO = new Array<DefaultIdRDO>();
  public mapOfDefaultId$RDO = new Array<DefaultId$RDO>();
  public mapOfDefault_IdRDO = new Array<Default_IdRDO>();
}

export class DefaultIdRDO {
  private _id: string = '';
  public get id(): string {
    return this._id;
  }
  public set id(value) {
    this._id = value;
  }
}

export class DefaultId$RDO {
  private _id$: string = '';
  public get id$(): string {
    return this._id$;
  }
  public set id$(value) {
    this._id$ = value;
  }
}

export class Default_IdRDO {
  private __id: string = '';
  public get _id(): string {
    return this.__id;
  }
  public set _id(value) {
    this.__id = value;
  }
}
