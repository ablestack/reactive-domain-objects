# Overview

reactive-domain-graphs helps make a dumb graph of nested JSON data into a fully reactive graph of smart Domain Model objects. It supports deeply data-structures (graphs), built-in and custom collection types, and observable Domain Model nodes. It tracks previous state, and will only update Domain values that have changed - essentially negating the need for much of the pervasive memoization code often found in downstream consumers, such as React projects.

## Key Features

- **Automatic synchronization** of a nested Domain Model graph with s JSON data-source
- **Tracks previous data-source state**, and only updates Domain Model nodes where changes are detected
- **Configurable equality comparers**, defaulting to optimized deep structural equality checks (handling circular references)
- **4 milliseconds for a full synchronization** of a medium sized graph in approx (as measured on a 2015 quad-core laptop)
- **Domain Model nodes support** Public properties, getters/Setters, and Observables, Arrays, Maps, Sets, and custom collection types
- **A suite of tests**, including performance tests
- **Deep instrumentation**, with configurable logging levels from Tracing through to Error

## Installation

```
    npm i @shallyware/reactive-domain-graphs --save
```

Or

```
    yarn add @shallyware/reactive-domain-graphs
```

## Usage

1. Instantiate a GraphSynchronizer object

```
 const graphSynchronizer = new GraphSynchronizer({ /* options */ });
```

2. Call the synchronize method, passing in a the root Domain Model object, and root JSON node, to load initial data (optional)

```
graphSynchronizer.synchronize({ rootDomainNode, rootSourceNode });
```

3. Every time the source JSON is updated (or may have been updated), call the synchronize method again\*

```
graphSynchronizer.synchronize({ rootDomainNode, rootSourceNode });
```

\*The GraphSynchronize object maintains state to track previous source values. So, in order to ensure that only the changed values are updated, it is important that subsequent synchronize calls are made using the original instance of the GraphSynchronize object.

## Usage Example

Multiple usage examples can be found in tests/graph-sync/test.ts

```TypeScript

```

## The Problem Being Solved

## Use Cases

The initial use-case the library was designed to support

## Related/Companion Libraries

## API

## Disclaimers & Known Issues

This code was initially developed for use in a single commercial project. It is being shared in case useful to others, and as a contribution to the development community and the great GraphQL and TypeScript tools that already exist.

Known Issues Include:

TBD

## Refinements and Enhancements Needed

TBD

## Notes

- This is development is not affiliated with either the [MobX](https://mobx.js.org/) team, or the [Apollo GraphQL](https://www.apollographql.com/) team

## Release Notes

### Notes 1.0.0

- TBD
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
- makeKeyFromDomainNode needs to be specified for any Domain Array or Set collections
- Domain Array and Set collections are more processing intensive. It is suggested that they are avoided for collections that may contain a large number of elements (100+)
- Public Properties, Getters/Setters, Observables all supported
- Instrumented
