# Reactive Domain Graphs - Technical Documentation

## Usage

Below are some simple usage examples for common scenarios, with the goal of illustrating the core concepts. Each example follows the same basic pattern:

1. Instantiate a GraphSynchronizer object, passing in configuration options as necessary

```
 const graphSynchronizer = new GraphSynchronizer({ /* options */ });
```

2. Call the smartSync method, passing in a root RDO, and root JSON node, to load initial data (optional)

```
graphSynchronizer.smartSync({ rootRdo, rootSourceNode });
```

3. Every time the source JSON is updated (or may have been updated), call the smartSync method again\*

```
graphSynchronizer.smartSync({ rootRdo, rootSourceNode });
```

\*The GraphSynchronize object maintains state to track previous source values. So, in order to ensure that only the changed values are updated, it is important that subsequent smartSync calls are made using the original instance of the GraphSynchronize object.

### Simple Usage Example

```TypeScript
// SOURCE JSON DATA *1
const fooSourceJSON = { id: 'foo-1', name: 'Simple Foo 1' };

// DEFINE
export class FooRDO {                        // RDO
  public id: string = '';
  public name: string = '';

// INSTANTIATE
const fooRDO = new FooRDO();        // Empty RDO
const graphSynchronizer = new GraphSynchronizer();  // GraphSynchronizer

// SYNC
graphSynchronizer.smartSync({ rootRdo: fooRDO, rootSourceNode: fooSourceJSON }); //*2

```

> Note: **smartSync**
>
> 1. \* Source JSON data can be locally constructed (such as a Redux State Tree), or from an API (such as REST or GraphQL query results)
>    , but it must have a consistent and predictable structure that can be mapped to an Reactive Domain Graph
> 2. \* For any subsequent change to the source data, call the smartSync method again. Only the changed values will be updated

> Note: **RDOs**
>
> - RDO Properties must be initialized with a value other than undefined, otherwise the sync may not work properly
> - RDO Properties are only updated when the source data changes. This feature is especially powerful when the properties are Observable
> - RDOs may be enriched with any methods and properties in addition to those that contain the transferred source data

## Nested RDO Example

RDOs with nested objects are still a simple use case, but have some notable differences, highlighted in the comments:

```TypeScript
// SOURCE JSON DATA
const fooSourceJSONSimple: FooSimple = { bar: { id: 'bar-1', name: 'Bar 1' } };

// DEFINE
class FooSimpleDomainGraph {
  public bar = new BarRDO(); //*1
}

export class BarRDO {
  public id: string = '';
  public name: string = '';
}

// INSTANTIATE
const fooSimpleRDO = new FooDomainGraphSimple();
const graphSynchronizer = new GraphSynchronizer();

// SYNC
graphSynchronizer.smartSync({ rootRdo: fooSimpleRDO, rootSourceNode: fooSourceJSONSimple });
```

> Note: **RDO Instances**
>
> 1. \* Nested Domain Objects (other than when in collections) should be initialized with an instance. \* However, it is not necessary (or recommended) to seed with data, as the initial smartSync method will load the data from the source

## Simple Usage Example With Collections

Nested collections are where the complexity starts to increase for any manual sync solution. However, reactive-domain-objects takes care of most of this complexity, just requiring that some basic configuration options are supplied. See example below, with notable differences from above examples highlighted in comments

```TypeScript
// SOURCE JSON DATA
const fooSourceJSONSimple: FooSimple = { bar: { id: 'bar-1', name: 'Bar 1' } };

// DEFINE
class FooSimpleDomainGraph {
  public bar = new BarRDO(); //*1
}

export class BarRDO {
  public id: string = '';
  public name: string = '';
}

// Configuration Options
const syncOptions: IGraphSyncOptions = {
  targetedNodeOptions: [
    {
      sourceNodeMatcher: { nodePath: 'collectionOfBar' }, // *2
      domainCollection: { makeRdo: (sourceNode: Bar) => new BarRDO() }
    }
  ],
};

// INSTANTIATE
const fooSimpleRDO = new FooDomainGraphSimple();
const graphSynchronizer = new GraphSynchronizer(syncOptions); // Note - passing in sync options here

// SYNC
graphSynchronizer.smartSync({ rootRdo: fooSimpleRDO, rootSourceNode: fooSourceJSONSimple });

```

> Note: **RDO Instantiation**
>
> 1.  \* Because the BarRDO type lives in a parent collection, it will need to be dynamically instantiated as corresponding source collection items are created.
>
> 2.  \* There are several ways RDO can be made:
>
>     - As with the above example, a make method can be contained in an Options object, and mapped to the corresponding JSON node by specifying the `nodePath`
>     - A make method can be contained in an Options object, and mapped to the corresponding JSON node by supplying a `nodeContent` method that can identify the object type from it's contained data (such a `__type` field).
>     - The 'IRdoFactory' interface can be implemented by the containing collection
>     - The RDOs can be auto-created (see example below)
>
>     See the [configuration options documentation](TODO) for more information

## Simple Usage Example With Automatic Observable RDO Creation

If Domain objects don't require any custom behavior, it is possible to set the configuration to auto-create the RDO objects. This will make the objects in the exact shape fo the source data, but with the following two advantages:

- The properties will be automatically be converted to Mobx Observables (configurable)
- Only the _changed_ fields will be updated on each sync, reducing/eliminating the need for memoization code form downstream dependent UIs

```TypeScript
// SOURCE JSON DATA
const fooSourceJSONSimple: FooSimple = { bar: { id: 'bar-1', name: 'Bar 1' } };

// Configuration Options
const syncOptions: IGraphSyncOptions = {
  globalNodeOptions: {
    autoMakeRdoTypes: { as: 'mobx-observable-object-literals', collectionElements: true, objectFields: true },
  },
};

// INSTANTIATE
const fooSimpleRDO = {} as FooSimple; // Note - only an empty object literal needs supply here. The RDO graph will be auto created
const graphSynchronizer = new GraphSynchronizer(syncOptions);

// SYNC
graphSynchronizer.smartSync({ rootRdo: fooSimpleRDO, rootSourceNode: fooSourceJSONSimple });

```

## General Usage Notes & Tips

- RDOs must be instantiated with properties initialized to non-undefined values. Use strict TypeScript compile option to help enforce this
- A LOG_LEVEL value can be set in a .env file to turn on logging: `# 0:off, 1:error, 2:warn, 3:info, 4:debug, 5:trace`

## GraphSynchronizer

The GraphSynchronizer class is at the center of the reactive-domain-objects library.
An instance of this class allows a Reactive Domain Graph to be synchronized with a source JSON graph via the smartSync method. The GraphSynchronizer tracks the source JSON previous state, and used it, along with several other optimizations, to perform efficient synchronizations and, importantly, only update the RDO nodes where changes have been detected.

> Note: **Equality Checking**
> By default the [@wry/equality](https://github.com/benjamn/wryware/tree/master/packages/equality) comparer is used. This was chosen because:
>
> - It is the same equality comparer used by the ApolloGraphQL client, which was a major use-case for this project
> - It provides structural equality checking, with correct handling of cyclic references, and minimal bundle size

### Synchroniation Events

The GraphSynchronizer has an built-in EventEmitter, which broadcast key lifecycle events to subscribers. Clients can be notified of all node-change events by subscribing per the following example:

```TypeScript
graphSynchronizer.subscribeToNodeChanges((data) => { /* custom code here */ });
```

The data payload contains the following properties:

| Parameter          | Description                                     |
| ------------------ | ----------------------------------------------- |
| changeType         | 'create' or 'update' or 'delete'                |
| sourceNodeTypePath | The nodePath of the given node                  |
| sourceKey          | The fieldname/element key of the given node     |
| rdoKey             | The corresponding fieldname/key of the RDO node |
| oldSourceValue     | The original value of the source node           |
| newSourceValue     | The new value of the source node                |

See [Usage Section](#Usage) Examples above for primary documentation for usage. See below for notes and configuration documentation.

### Collection Types

A note on the subtle differences in synchronization behavior based on RDO collection choice

| Collection Type   | Duplicate Key Handling                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Array             | Duplicates supported. Deletion events will apply to the first matching item                                                               |
| Map               | Elements with duplicate keys will be filtered out, and only the first item of a given key will be present in the resulting RDO collection |
| Set               | Elements with duplicate keys will be filtered out, and only the first item of a given key will be present in the resulting RDO collection |
| ListMap           | Elements with duplicate keys will be filtered out, and only the first item of a given key will be present in the resulting RDO collection |
| ICustomCollection | Varies based on custom implementation                                                                                                     |

### Key Generation Steps

Keys are required in order to reconcile source collection items across synchronizations, and determine which Rdo items need adding, updating, or deleting. The following mechanisms are used, in the given order, to determine a key:
TODO

### RDO Generation Steps

The following mechanisms are used, in the given order, when attempting to generate a new RDO object from a source item:
TODO

## GraphSynchronizer.smartSync Configuration Options

### Core Concept: Source Node Paths

There are two types of path that are used throughout the configuration: NodePath and NodeInstancePath:

#### NodePath

This is a slash-delimited string that represents the path _from_ the root of the source graph _to_ the targeted node

For example, the NodePath: `child/grandchild` matches the `grandchild` node of the following sourceJSON:

```TypeScript
const rootSourceNode = {
  child: {
    grandchild:{
      data:'some data'
    }
  }
}
```

The NodePath is: `child/grandchild`

For arrays items in the source JSON, the NodePath doesn't need to factor in the element index or key.

For example, the NodePath:`children/grandchildren` matches the `grandchild` type in the following source graph:

```TypeScript
const rootSourceNode = {
  children:[ {
    grandchildren:[{
      data:'some data'
    }]
  }]
}
```

In this instance, the NodePath represents _all_ the `grandchildren` nodes (of _all_ `children` nodes). This is correct, because NodePaths are for identifying the _type_ of object rather than specific object instances.

#### NodeInstancePath

> Note: This is currently only used internally, to track previous state. However, the details are being provided for completeness, and to facilitate any developers who are looking to contribute or enhance this library

NodeInstancePath is the same as NodePath, with the exception that collection keys are _included_ in the path. So, in the first example of the [NodePath section](TODO) the path string is identical. However when collections are in the Source graph, it would differ.

For example, the path `children/child-1/grandchildren/grandchild-1` would be a match for the specific data node 'grandchild1' below:

```TypeScript
const rootSourceNode = {
  children:[ {
    id: 'child-1',
    grandchildren:[{ id: 'grandchild-1', data:'some data' }]
  }]
}
```

The following provides an overview of the GraphSynchronizer.smartSync options

```TypeScript
{
  customEqualityComparer: IEqualityComparer, // ----> // Custom Equality Comparer

  globalNodeOptions: { // ----------------------==--> // Options that apply to all source nodes
    commonRdoFieldnamePostfix: string;
    computeDomainFieldname: (sourceNodeKey) => string;
  },

  targetedNodeOptions:[ // -------------------------> // Options that only apply to source nodes that
    {                                                 // meet the sourceNodeMatcher criteria

      sourceNodeMatcher: {
        nodePath: string; // -----------------------> // Selector can be targeted at a specific source node path
        nodeContent: (sourceNode) => boolean;         // or by specific source node contents
      },

      ignore: boolean, // --------------------------> // A source node can be ignored

      makeRdoCollectionKey: { // -------------------> // If makeRdoCollectionKey creation methods not supplied
        fromSourceElement: (sourceNode) => string;    // a default key creation method will be supplied which
        fromRdoElement: (rdo) => string;    // assumes an `id` field id available (or an error will be thrown)
      },
      makeRdo: (sourceNode) => any;                   // Use when RDOs are contained in a parent collection
                                                      // so they can be automatically instantiated as items are added to the
    }                                                 // source collection
  ]
}

```

### Root Options

#### CustomEqualityComparer

A custom equality comparer can be provided to evaluate if an object has changed. It must satisfy the following interface:

```TypeScript
interface IEqualityComparer {
  (a: any, b: any): boolean;
}
```

### Global Node Options

#### CommonDomainFieldnamePostfix

Instructs the sync algorithm to attempt to look for a Domain Node field with the same property name as the Source Node with the supplied postfix appended. This options was added to primarily support the convention of adding a `$` to the end of observable property names.

For example:

```TypeScript
const source = {
  name: 'Simple Foo 1',     // <-- NOTE the 'name' key
};

// DEFINE
export class Target {
  public name$: string = ''; // <-- NOTE the `$` Symbol on the end of name
```

Upon graphSynchronizer.smartSync of the above supplied source and target objects would fail due to the mismatch of the `source.name` and the `target.name$` field names.
However, the following configuration would allow for the smartSync to successfully match the fields:

```
  { globalNodeOptions: { commonRdoFieldnamePostfix: '$' } }
```

Note that the matching algorithm will first try to find a field match _without_ the fieldname prefix. And, if it finds one, it will use that and not continue to look for a match with the common postfix.

#### computeDomainFieldname

If the names of the RDOs are predictable, but not the same, a method can be supplied to custom generate the Domain Name properties from the source items. The method has the following signature:

```TypeScript
({ sourceNodeTypePath, sourcePropKey, sourcePropVal }: { sourceNodeTypePath: string; sourcePropKey: string; sourcePropVal: any }) => string;
```

The parameters that are supplied to the method are as follows:

- `sourceNodeTypePath`: The source path for the parent object of the current item (see the config section on Paths)
- `sourcePropKey`: The key for the current source item on it's parent property
- `sourcePropVal`: The value for the current source item

### Targeted Node Options

Targeted Node Options provide configuration data for specific source nodes. The primary use case for this is telling the graphSynchronizer how to instantiate the RDOs. This is required for every RDO that is contained in a parent collection (so that new RDOs can be added dynamically to reflect changes in the corresponding source collection node)

### Matchers

The sourceNodeMatcher configuration lets the graphSynchronizer know which source node the configuration item relates to. There are two types of Matchers:

#### SourceNodeInstancePath

This is a slash-delimited string that represents the path _from_ the root of the source graph _to_ the targeted node. See [Source Node Paths Section](#Source-Node-Paths) for further details.

For example, to target the grandchildren node of the following sourceJSON:

```TypeScript
const rootSourceNode = {
  child: {
    grandchild:{
      data:'some data'
    }
  }
}
```

The configuration item would be:

```TypeScript
const graphSynchronizerOptions = {
    targetedNodeOptions: [{
      sourceNodeMatcher: { nodePath: 'child/grandchild' },
      //... config options here
    }],
  }
```

#### SourceNodeContent

Instead of matching nodes based on path, the sourceContentNode configuration option allows a node type to be identified by its content. The configuration takes the form of function that must match the following signature.

```
  (sourceNode: S) => boolean
```

The returned boolean indicates if the given node is a match. For example, to target the grandchild node of the following sourceJSON:

```TypeScript
const rootSourceNode = {
  child: {
    grandchild:{
      data:'some data',
      __type: 'grandchild'
    }
  }
}
```

The targetedNodeOptions configuration item could be:

```TypeScript
const graphSynchronizerOptions = {
    targetedNodeOptions: [{
      sourceNodeMatcher: { nodeContent: (sourceNode) => sourceNode && sourceNode.__type === 'grandchild' },
      //... config options here
    }],
  }
```

> Note: the matching algorithm only passes the _first_ item from a collection to check for match. If this matches, it is assumed that all other items in the collection will be of the same type (and indeed, the synchronization would not work if they were not)

#### Ignore

If the `ignore` configuration item is present, and set to false, the matching source node will not be copied to the corresponding RDO node. Otherwise, it will be synchronized when a change is detected

#### DomainCollection

Contains configuration that inform GraphSynchronizer how to handle collections of Domain Objects, as detailed below

##### makeRdoCollectionKey

The two contained configuration properties are:

```
  fromSourceElement: (sourceNode) => string;
  fromRdoElement: (rdo) => string;
```

These methods:

- Are are used to create unique keys for each Domain collection element, and should be idempotent
- They are only required for RDOs that are contained in a Domain Collection AND where there is no `id` field
- If they are not supplied, default methods will be supplied that look for an `id` field in the node (and throw an error if not found)

#### makeRdo

This configuration property had the following signature:

```
(sourceNode) => any;
```

This property is required for every RDO type that is contained in a parent collection, so they can be automatically instantiated as items are added to the source collection

## RDO Sync Customizations & Lifecycle Methods

RDOs and Custom Collection Types can influence synchronization behavior and, in some cases, replace the need for configuration options, by implementing one of several interfaces

### IBeforeSyncIfNeeded

Signature:

```TypeScript
interface IBeforeSyncIfNeeded<S> {
  beforeSyncIfNeeded: ({ sourceObject, isSyncNeeded }: { sourceObject: S; isSyncNeeded: boolean }) => void;
}
```

This lifecycle method is called before the synchronization stage for every instance of the RDO that implements it

> Note: If the parent RDO evaluate to being equal, this lifecycle method will not be called, as the smartSync algorithm will not recurse down a tree of nodes that evaluate to being equal

### IBeforeSyncUpdate

Signature:

```TypeScript
interface IBeforeSyncUpdate<S> {
  beforeSyncUpdate: ({ sourceObject }: { sourceObject: S }) => void;
}
```

This lifecycle method is called before the synchronization step of an RDO instance IF the node is evaluated as having changed and is about to be updated

### IBeforeSyncIfNeeded

Signature:

```TypeScript
interface IAfterSyncUpdate<S> {
  afterSyncUpdate: ({ sourceObject }: { sourceObject: S }) => void;
}
```

This lifecycle method is called after an update of an RDO instance

### IBeforeSyncIfNeeded

Signature:

```TypeScript
interface IAfterSyncIfNeeded<S> {
  afterSyncIfNeeded: ({ sourceObject, syncAttempted, RDOChanged }: { sourceObject: S; syncAttempted: boolean; RDOChanged: boolean }) => void;
}
```

This lifecycle method is called after the synchronization stage for every instance of an RDO that implements it

> Note: If the parent RDOs evaluate to being equal, this lifecycle method will not be called, as the smartSync algorithm will not recurse down a tree of nodes that evaluate to being equal

### ICustomEqualityRDO

```TypeScript
interface ICustomEqualityRDO<S> {
  isStateEqual: (sourceObject: S | null | undefined, previousSourceObject: S | null | undefined): boolean;
}
```

When RDOs implement this interface, this isStateEqual method will be used for equality comparison instead of the default equality comparer

### IHasCustomRdoFieldNames

When implemented this interface allows an RDO to determine the names of the fields that each of the corresponding source object fields map to.

The interface has the following signature:

```TypeScript
interface IHasCustomRdoFieldNames<S extends Record<string, any>, D extends Record<string, any>> {
  tryGetRdoFieldname: ({ sourceNodeTypePath, sourceFieldname, sourceFieldVal }: { sourceNodeTypePath: string; sourceFieldname: string; sourceFieldVal: any }) => string | undefined;
}
```

The interface requires a single method is implemented, which receives:

| Parameter          | Description              |
| ------------------ | ------------------------ |
| sourceNodeTypePath | Path of source node      |
| sourceFieldname    | Fieldname of source node |
| sourceFieldVal     | Value of source node     |

The method should return a string for the RDO fieldname that the source field corresponds to, or undefined if it does not correspond with any RDO fields

> Note: If null is returned, the matching algorithm will still look for a direct naming match

### ICustomSync

This interface allows an RDO to take over full control of the synchronization for a specific type. When implemented this interface, the GraphSynchronizer will hand off the synchronization of the source data to the RDO (instead of using the internal auto-synchronization algorithm).

The interface has the following signature:

```TypeScript
interface ICustomSync<S> {
  synchronizeState: ({ sourceObject, graphSynchronizer }: { sourceObject: S | null | undefined; graphSynchronizer: IGraphSynchronizer }): boolean;
}
```

> Note: any child objects and collections of RDOs that implement ICustomSync will no longer be auto-synchronized. To subsequently synchronize a child object or collection, of of the following options are available:

- A custom recursive sync routine, which could take advantage of the ICustomSync interface by implementing on child Domain objects
- The 'continueSmartSync' function (passed into the method), can be called from withing the customSync routine on any RDO sub-node where the smartSync should continue

## Custom Collection Types

### ISyncableCollection

```TypeScript
interface ISyncableCollection<T> extends Iterable<T> {
  readonly size: number;
  getKeys: () => string[];
  tryGetItemFromTargetCollection: (key: string) => T | null | undefined;
  insertItemToTargetCollection: (key: string, value: T) => void;
  updateItemInTargetCollection: (key: string, value: T) => void;
  tryDeleteItemFromTargetCollection: (key: string) => void;
  clear: () => void;
}
```

### IRdoFactory

```TypeScript
interface IRdoFactory<S, D> {
  makeRdoCollectionKey: IRdoCollectionKeyFactory<S, D>;
  makeRdo: IMakeRdo<S, D>;
}
```

## Terminology

For clarity, this is a brief reference for some terminology that is used throughout the documentation and the source code. Please feel free to update if you see any terms being used incorrectly:

- **Node**: An Property of an Object, or an Element of a collection. Has:
  - _Value_: The contained value
  - _Key_: A unique identifier for the node within the parent Node. Is Either the Fieldname (for object Nodes), or the collection key (for collection Nodes). Note, that for non-keyed collections, such as Arrays and Sets, the collection key is still relevant. However, it does not exist on the collection itself, but is still a unique identifier for the item, which can be used to locate it
  - _Parent_: unless the Toot node, in which case this is null
- **Internal Node**: A Node with child nodes
- **Leaf Node**: A Node without any child nodes, such as one with a Primitive value
- **Source**: JSON source data, and the 'source of truth'
- **RDO**: Reactive Domain Object. See definition in [README](https://github.com/ablestack/reactive-domain-objects/blob/master/README.md)
- **Target**: Usually synonymous with RDO, but used in the context of collection manipulation (so no specific to RDOs)
- **Element**: a member of a collection
- **Field**: A Property of an Object Node
- **Item**: A child member of an Object or a collection. So, essentially, a Element or a Field.
- **Operations** There is surprising importance in the nuance of each operation:
  - _Set_: essentially an _upsert_ operation. Only valid on collection Node types
  - _Update_: trus to update value on Node for given key. If key does not exist, no change occurs. If value is identical, no change is made. Returns true if change occurs, els false.
  - _Insert_: adds value to Node with given key. Only valid on collection Node types. Does not check for duplicates. May end up with unexpected behavior or errors if item already exists
  - _Get_: gets value from Node for given key. May return undefined if key not present on Node
  - _Delete_: trys to remove given key from Node. If not present, no change is made. Returns true if deletion occurs, otherwise false.
