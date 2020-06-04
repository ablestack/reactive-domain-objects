# Overview

reactive-domain-graphs lets you turn a dumb graph of nested JSON data into a fully reactive graph of smart Domain Model objects. The previous source data state is tracked, and only changes are copied to the Domain Graph. This is especially powerful when Domain Graph nodes are Observable, as the Domain Model becomes a bridge from an _Imperative programming model_ to a _Reactive programming model_. This also has the effect of, in many circumstances,negating the need for much of the memoization code often found in downstream dependent code, such as React projects

## Key Features

- **Automatic synchronization** of a nested Domain Model graph with s JSON data-source
- **Tracks previous data-source state**, and only updates Domain Model nodes where changes are detected
- **Configurable equality comparers**, defaulting to optimized deep structural equality checks (handling circular references)
- **Less than 5 milliseconds for full synchronization** of a medium sized graph in approx (as measured on a 2015 quad-core laptop)
- **Domain Model support** for all build-in structures, including public properties, getters/Setters, Observables, Arrays, Maps, Sets, and custom collection types
- **A suite of tests**, including performance tests
- **Deep instrumentation**, with configurable logging levels from Tracing through to Error

## The Problem Being Solved

## Use Cases

The initial use-case the library was designed to support

# Installation

```
    npm i @ablestack/reactive-domain-graphs --save
```

Or

```
    yarn add @ablestack/reactive-domain-graphs
```

# Usage

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

## Simple Usage Example

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

1. \* Source JSON data can be locally constructed (such as a Redux State Tree), or from an API (such as REST or GraphQL query results)
   , but it must have a consistent and predictable structure that can be mapped to a Domain Model graph
2. \* For any subsequent change to the source data, call the smartSync method again. Only the changed values will be updated

### A Note About Domain Models

1. Domain Model Properties must be initialized with a value other than undefined, otherwise the sync may not work properly
2. Domain Model Properties are only updated when the source data changes. This feature is especially powerful when the properties are Observable
3. Domain Models may be enriched with any methods and properties in addition to those that contain the transferred source data

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

1. \* Nested Domain Objects (other than when in collections) should be initialized with a instance. It is not necessary to seed with data, as the initial smartSync method will load the data from the source

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
  targetedOptions: [
    {
      selector: { sourceNodePath: 'collectionOfBar' }, // *2
      domainModelCreation: { makeDomainModel: (sourceNode: Bar) => new BarDomainModel() }
    }
  ],
};

// INSTANTIATE
const fooSimpleDomainModel = new FooDomainGraphSimple();
const graphSynchronizer = new GraphSynchronizer(syncOptions); // Note - passing in sync options here

// SYNC
graphSynchronizer.smartSync({ rootDomainNode: fooSimpleDomainModel, rootSourceNode: fooSourceJSONSimple });

```

1. \* Because the BarDomainModel type lives in a parent collection, there is a need for it to be dynamically created as corresponding source collection items are added). As such, we need to define a 'make' function, and supply it through the options object
2. The options can be mapped to their corresponding JSON node either by specifying the `sourceNodePath` (as with this example), or by supplying a `matcher` method that can identify the object type from it's contained data (such a `__type` field). See the configuration options documentation for more information

## Additional Usage Examples and Documentation

- Multiple additional usage examples can be found in src/tests/graph-sync/test.ts.
- See the Configuration section for a detailed description of all the configuration options

# API Documentation

## GraphSyncronizer

See Usage Examples above for primary documentation for usage.

## GraphSyncronizer Configuration Options

# Important Notes

## Companion Libraries

This library is part of a group of companion libraries under the [Ablestack](https://github.com/ablestack) umbrella. All of these libraries share the common goal:

    Contribute to an ecosystem of reusable building blocks and patterns for small teams to build modern, sophisticated, full stack web-applications that are, reliable, affordable to run, and easy to maintain

## Limitations

- **Source & Tartet Structural Similarity**. While field names can be adjusted, by configuration, the overall 'shape' and nesting structure of the graph must match between the source and target graphs. This library does not, yet, have the capability of automatically manipulating the shape of a graph during the synchronization process

## Disclaimers

This code was initially developed for use in a single commercial project. It is being shared in case useful to others, and as a contribution to the development community and the great GraphQL and TypeScript tools that already exist.

## Known Issues

Known Issues Include:

TBD

## Refinements and Enhancements Needed

TBD

# Release Notes

### Notes 1.0.0

- Expect non collection properties to be not null or undefined
- Presidence: PathMap, TypeMap, Interfaces
- Requires properties are initialized. Use strict TypeScript compile option
- LOG_LEVEL .env

### Terminology

- Element: an item of a collection
- Node: An Property of an Object, or an Element of a collection
- Source: Json source data
- Domain: JavaScript Target Objects
- Target: Usually synonymous with Domain, but used in the context of collection manipulation (abstracted)
- makeDomainNodeKeyFromDomainModel needs to be specified for any Domain Array or Set collections
- Domain Array and Set collections are more processing intensive. It is suggested that they are avoided for collections that may contain a large number of elements (100+)
- Public Properties, Getters/Setters, Observables all supported
- Instrumented
