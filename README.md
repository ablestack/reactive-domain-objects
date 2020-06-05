# Reactive Domain Graphs

## Overview

reactive-domain-graphs lets you turn a dumb graph of nested JSON data into a fully reactive graph of smart Domain Model objects. The previous source data state is tracked, and only changes are copied to the Domain Graph. This is especially powerful when Domain Graph nodes are Observable, as the Domain Model becomes a bridge from an _Imperative programming model_ to a _Reactive programming model_. This also has the effect of, in many circumstances,negating the need for much of the memoization code often found in downstream dependent code, such as React projects

## Key Features

- **Automatic synchronization** of a nested Domain Model graph with s JSON data-source
- **Tracks previous data-source state**, and only updates Domain Model nodes where changes are detected
- **Configurable equality comparers**, defaulting to optimized deep structural equality checks (handling circular references)
- **Less than 0.2 milliseconds for an update synchronization** of a medium sized graph in approx (as measured on a 2015 quad-core laptop). Less than 5 milliseconds for an full initial graph load
- **Domain Model support** for all build-in structures, including public properties, getters/Setters, Observables, Arrays, Maps, Sets, and custom collection types
- **A suite of tests**, including performance tests
- **Deep instrumentation**, with configurable logging levels from Tracing through to Error

## The Problem Being Solved

## Use Cases

The initial use-case the library was designed to support

## Installation

```
    npm i @ablestack/reactive-domain-graphs --save
```

Or

```
    yarn add @ablestack/reactive-domain-graphs
```

## Usage

Below are some simple usage examples for common scenarios, with the goal of illustrating the core concepts. Each example follows the same basic pattern:

1. Instantiate a GraphSynchronizer object, passing in configuration options as necessary

```
 const graphSynchronizer = new GraphSynchronizer({ /* options */ });
```

2. Call the smartSync method, passing in a root Domain Model object, and root JSON node, to load initial data (optional)

```
graphSynchronizer.smartSync({ rootDomainNode, rootSourceNode });
```

3. Every time the source JSON is updated (or may have been updated), call the smartSync method again\*

```
graphSynchronizer.smartSync({ rootDomainNode, rootSourceNode });
```

\*The GraphSynchronize object maintains state to track previous source values. So, in order to ensure that only the changed values are updated, it is important that subsequent smartSync calls are made using the original instance of the GraphSynchronize object.

### Simple Usage Example

```TypeScript
// SOURCE JSON DATA *1
const fooSourceJSON = { id: 'foo-1', name: 'Simple Foo 1' };

// DEFINE
export class FooDomainModel {                        // Domain Model Object
  public id: string = '';
  public name: string = '';

// INSTANTIATE
const fooDomainModel = new FooDomainModel();        // Empty Domain Model
const graphSynchronizer = new GraphSynchronizer();  // GraphSynchronizer

// SYNC
graphSynchronizer.smartSync({ rootDomainNode: fooDomainModel, rootSourceNode: fooSourceJSON }); //*2

```

> Note: **smartSync**
>
> 1. \* Source JSON data can be locally constructed (such as a Redux State Tree), or from an API (such as REST or GraphQL query results)
>    , but it must have a consistent and predictable structure that can be mapped to a Domain Model graph
> 2. \* For any subsequent change to the source data, call the smartSync method again. Only the changed values will be updated

> Note: **Domain Models**
>
> - Domain Model Properties must be initialized with a value other than undefined, otherwise the sync may not work properly
> - Domain Model Properties are only updated when the source data changes. This feature is especially powerful when the properties are Observable
> - Domain Models may be enriched with any methods and properties in addition to those that contain the transferred source data

## Nested Domain Model Object Graph Example

Domain Models with nested objects are still a simple use case, but have some notable differences, highlighted in the comments:

```TypeScript
// SOURCE JSON DATA
const fooSourceJSONSimple: FooSimple = { bar: { id: 'bar-1', name: 'Bar 1' } };

// DEFINE
class FooSimpleDomainGraph {
  public bar = new BarDomainModel(); //*1
}

export class BarDomainModel {
  public id: string = '';
  public name: string = '';
}

// INSTANTIATE
const fooSimpleDomainModel = new FooDomainGraphSimple();
const graphSynchronizer = new GraphSynchronizer();

// SYNC
graphSynchronizer.smartSync({ rootDomainNode: fooSimpleDomainModel, rootSourceNode: fooSourceJSONSimple });
```

> Note: **Domain Model Instances**
>
> 1. \* Nested Domain Objects (other than when in collections) should be initialized with an instance. \* However, it is not necessary (or recommended) to seed with data, as the initial smartSync method will load the data from the source

## Simple Usage Example With Collections

Nested collections are really the complexity starts to increase. However, reactive-domain-graphs takes care of most of this complexity, just requiring that some basic configuration options are supplied. See example below, with notable differences from above examples highlighted in comments

```TypeScript
// SOURCE JSON DATA
const fooSourceJSONSimple: FooSimple = { bar: { id: 'bar-1', name: 'Bar 1' } };

// DEFINE
class FooSimpleDomainGraph {
  public bar = new BarDomainModel(); //*1
}

export class BarDomainModel {
  public id: string = '';
  public name: string = '';
}

// Configuration Options
const syncOptions: IGraphSyncOptions = {
  targetedNodeOptions: [
    {
      sourceNodeMatcher: { nodePath: 'collectionOfBar' }, // *2
      domainCollection: { makeDomainModel: (sourceNode: Bar) => new BarDomainModel() }
    }
  ],
};

// INSTANTIATE
const fooSimpleDomainModel = new FooDomainGraphSimple();
const graphSynchronizer = new GraphSynchronizer(syncOptions); // Note - passing in sync options here

// SYNC
graphSynchronizer.smartSync({ rootDomainNode: fooSimpleDomainModel, rootSourceNode: fooSourceJSONSimple });

```

> Note: **Domain Model Instantiation**
>
> 1. \* Because the BarDomainModel type lives in a parent collection, it will need to be dynamically instantiated as corresponding source collection items are created. As such, a corresponding 'make' function needs to be supplied to the GraphSynchronizer
>
> 2. \* There are several ways the options can be mapped to their corresponding JSON node either by specifying the `nodePath` (as with this example), or by supplying a `nodeContent` method that can identify the object type from it's contained data (such a `__type` field). See the [configuration options documentation](TODO) for more information

## Additional Usage Examples and Documentation

- Multiple additional usage examples can be found in src/tests/graph-sync/test.ts.
- See the [Configuration section](#GraphSynchronizer-Configuration-Options) for a detailed description of all the configuration options

# Usage Documentation

## General Usage Notes & Tips

- Domain Models must be instantiated with properties initialized to non-undefined values. Use strict TypeScript compile option to help enforce this
- A LOG_LEVEL value can be set in a .env file to turn on logging: `# 0:off, 1:error, 2:warn, 3:info, 4:debug, 5:trace`

## Source Node Paths

There are two types of path: NodePath and NodeInstancePath:

### NodePath

This is a dot-delimited string that represents the path _from_ the root of the source graph _to_ the targeted node

For example, the NodePath: `child.grandchild` matches the `grandchild` node of the following sourceJSON:

```TypeScript
const rootSourceNode = {
  child: {
    grandchild:{
      data:'some data'
    }
  }
}
```

The NodePath is: `child.grandchild`

For arrays items in the source JSON, the NodePath doesn't need to factor in the element index or key.

For example, the NodePath:`children.grandchildren` matches the `grandchild` type in the following source graph:

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

### NodeInstancePath

> Note: This is currently only used internally, to track previous state. However, the details are being provided for completeness, and to facilitate any developers who are looking to contribute or enhance this library

NodeInstancePath is the same as NodePath, with the exception that collection keys are _included_ in the path. So, in the first example of the [NodePath section](TODO) the path string is identical. However when collections are in the Source graph, it would differ.

For example, the path `children.child-1.grandchildren.grandchild-1` would be a match for the specific data node 'grandchild1' below:

```TypeScript
const rootSourceNode = {
  children:[ {
    id: 'child-1',
    grandchildren:[{ id: 'grandchild-1', data:'some data' }]
  }]
}
```

## GraphSynchronizer

See [Usage Section](#Usage) Examples above for primary documentation for usage. See below for notes and configuration documentation.

### Notes

- **Equality Checking**: by default the [@wry/equality](https://github.com/benjamn/wryware/tree/master/packages/equality) comparer is used. This was chosen because
  - It is the same equality comparer used by the ApolloGraphQL client, which was a major use-case for this project
  - It provides structural equality checking, with correct handling of cyclic references, and minimal bundle size

## GraphSynchronizer.smartSync Configuration Options

The following provides an overview of the GraphSynchronizer.smartSync options

```TypeScript
{
  customEqualityComparer: IEqualityComparer, // --> // Custom Equality Comparer

  globalNodeOptions: { // ------------------------> // Options that apply to all source nodes
    commonDomainFieldnamePostfix: string;
    computeDomainFieldname: (sourceNodeKey) => string;
  },

  targetedNodeOptions:[ // -----------------------> // Options that only apply to source nodes that
  {                                                 // meet the sourceNodeMatcher criteria

    sourceNodeMatcher: {
      nodePath: string; // -----------------------> // Selector can be targeted at a specific source node path
      nodeContent: (sourceNode) => boolean;         // or by specific source node contents
    },

    ignore: boolean, // --------------------------> // A source node can be ignored

    domainCollection: { // ----------------------> // Configuration pertaining to the creation of Domain Models

      makeCollectionKey: { // --------------------> // If makeCollectionKey creation methods not supplied
        fromSourceNode: (sourceNode) => string;     // a default key creation method will be supplied which
        fromDomainNode: (domainNode) => string; // assumes an `id` field id available (or an error will be thrown)
      },
      makeDomainModel: (sourceNode) => any;         // Required when Domain Models are contained in a parent collection
    }                                               // so they can be automatically instantiated as items are added to the
  }]                                                // source collection
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

#### commonDomainFieldnamePostfix

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

Upon graphSynchronizer.smartSync of the above supplied source and target models would fail due to the mismatch of the `source.name` and the `target.name$` field names.
However, the following configuration would allow for the smartSync to successfully match the fields:

```
  { globalNodeOptions: { commonDomainFieldnamePostfix: '$' } }
```

Note that the matching algorithm will first try to find a field match _without_ the fieldname prefix. And, if it finds one, it will use that and not continue to look for a match with the common postfix.

#### computeDomainFieldname

If the names of the Domain Models are predictable, but not the same, a method can be supplied to custom generate the Domain Name properties from the source items. The method has the following signature:

```TypeScript
({ sourceNodePath, sourcePropKey, sourcePropVal }: { sourceNodePath: string; sourcePropKey: string; sourcePropVal: any }) => string;
```

The parameters that are supplied to the method are as follows:

- `sourceNodePath`: The source path for the parent object of the current item (see the config section on Paths)
- `sourcePropKey`: The key for the current source item on it's parent property
- `sourcePropVal`: The value for the current source item

### Targeted Node Options

Targeted Node Options provide configuration data for specific source nodes. The primary use case for this is telling the graphSynchronizer how to instantiate the Domain Model objects. This is required for every Domain Model object that is contained in a parent collection (so that new Domain Models can be added dynamically to reflect changes in the corresponding source collection node)

### Matchers

The sourceNodeMatcher configuration lets the graphSynchronizer know which source node the configuration item relates to. There are two types of Matchers:

#### SourceNodeInstancePath

This is a dot-delimited string that represents the path _from_ the root of the source graph _to_ the targeted node. See [Source Node Paths Section](#Source-Node-Paths) for further details.

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
      sourceNodeMatcher: { nodePath: 'child.grandchild' },
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

If the `ignore` configuration item is present, and set to false, the matching source node will not be copied to the corresponding Domain Model node. Otherwise, it will be synchronized when a change is detected

#### domainCollection

Contains configuration that inform GraphSynchronizer how to handle collections of Domain Objects

##### makeCollectionKey

The two contained configuration properties are:

```
  fromSourceNode: (sourceNode) => string;
  fromDomainNode: (domainNode) => string;
```

These methods:

- Are are used to create unique keys for each Domain collection element, and should be idempotent
- They are only required for Domain Models that are contained in a Domain Collection AND where there is no `id` field
- If they are not supplied, default methods will be supplied that look for an `id` field in the node (and throw an error if not found)

#### makeDomainModel

This configuration property had the following signature:

```
(sourceNode) => any;
```

This property is required for every Domain Model type that is contained in a parent collection, so they can be automatically instantiated as items are added to the source collection

## Domain Model Sync Customizations

Domain Models and Custom Collection Types can influence synchronization behavior and, in some cases, replace the need for configuration options, by implementing one of several interfaces

### Domain Model Interfaces

#### ICustomEqualityDomainModel

```TypeScript
interface ICustomEqualityDomainModel<S> {
  isStateEqual: (sourceObject: S | null | undefined, previousSourceObject: S | null | undefined): boolean;
}
```

When Domain Models implement this interface, this isStateEqual method will be used for equality comparison instead of the default equality comparer

#### ICustomSyncDomainModel

```TypeScript
interface ICustomSyncDomainModel<S> {
  synchronizeState: ({ sourceObject, graphSynchronizer }: { sourceObject: S | null | undefined; graphSynchronizer: IGraphSynchronizer }): boolean;
}
```

- This interface allows you to take over full control of the synchronization for a specific type. When Domain Models implement this interface, the synchronizeState method will be used to synchronize the source data with the Domain Model, instead of the internal auto-synchronization algorithm.
- **Please note**: Any child objects and collections of Domain Models that implement ICustomSyncDomainModel will no longer be auto-synchronized. To address this, you can either:
  - Implement, and recursively call, the ICustomSyncDomainModel interface on child types
  - Alternatively you can call the 'continueAutoSync' method, passing in the child property, and its full [Object Path](TODO)

## Custom Collection Types

#### ISyncableCollection

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

#### IDomainModelFactory

```TypeScript
interface IDomainModelFactory<S, D> {
  makeCollectionKey: IDomainNodeKeyFactory<S, D>;
  makeDomainModel: IMakeDomainModel<S, D>;
}
```

# Notes

## Terminology

For clarity, this is a brief reference for some terminology that is used throughout the documentation and the source code. Please feel free to update if you see any terms being used incorrectly:

- Element: an item of a collection
- Node: An Property of an Object, or an Element of a collection
- Source: JSON source data, and the 'source of truth'
- Domain Model: JavaScript objects that contain the Source data, as well as any other methods that support their purpose in the Domain
- Target: Usually synonymous with Domain, but used in the context of collection manipulation (abstracted)

## Limitations

- **Source & Target Structural Similarity**. While field names can be adjusted, by configuration, the overall 'shape' and nesting structure of the graph must match between the source and target graphs. This library does not, yet, have the capability of automatically manipulating the shape of a graph during the synchronization process

## Disclaimers

This code was initially developed for use in a single commercial project. It is being shared in case useful to others, and as a contribution to the development community and the great tools and libraries that already exist.

## Known Issues

Known Issues Include:

- Array and Set collections types in Domain Models are more processing intensive. It is suggested that they are avoided for collections that may contain a large number of elements (100+)

## Refinements and Enhancements Needed

- Open to suggestions
- Find a clever way to provide a default mechanism to instantiate Domain Objects without the need for user configuration to provide these. Will probably require some kind of TypeScript reflection, as in 'empty domain collection' scenarios, an instance will not be available, and nor will type runtime type information
- Provide decorators that can be applied to the Domain Types to perform useful functions in lieu of configuration options, such as 'ignore'

# Companion Libraries

This library is part of a collection of companion tools and libraries under the [AbleStack](https://github.com/ablestack) umbrella. All of these libraries share the common goal:

> Help **small tech** startups and businesses **rapidly and affordably build big ideas** with tools, libraries, patterns, examples, and guidance

To achieve these goals, the following principles are applied:

- \*Leverage existing, high quality, open source platforms and libraries where possible
- Prioritize technology choices that embrace open source. TypeScript over C#, and Node over .Net an example of this
- Where possible, avoid technology choices that could result in hosting vendor lock-in. ApolloGraphQL over AWS Amplify is an example of this
- Automate wherever possible, from development, through testing, to deployment, monitoring, and maintenance. Codegen from strongly types schemas is a good example of this.

This is an ongoing effort, that is never done. If you'd like to check out the companion libraries, even contribute to them, you can find them at the [AbleStack on GitHub](https://github.com/ablestack)

# Release Notes

### Notes 1.0.0

- TBD
