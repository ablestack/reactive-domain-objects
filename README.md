# Reactive Domain Graphs

## Overview

The [Reactive-domain-graphs](https://github.com/ablestack/reactive-domain-objects) library facilitates building and running graphs of [Reactive Domain Objects](#reactive-domain-objects). A primary use case is connecting GraphQL client libraries (such as [ApolloGraphQL](https://github.com/apollographql/apollo-client)) with reactive client libraries (such as [MobX](https://mobx.js.org/)). However, it can also be useful tool for connecting any source of JSON data reactive client applications.

This library does not exclusively support an _Imperative_ or _Reactive_ coding model. Rather, it acts a bridge from an _Imperative programming model_ of stateful objects to a _Reactive programming model_ of observables and data streams.

## The Problems Being Solved

The problems being solved primarily revolve around consuming and using JSON data in TypeScript/JavaScript client applications:

- Most modern state management frameworks rely on plain JavaScript object trees. This makes encapsulation (of data, logic, and behavior) difficult which, in turn, makes managing complexity in large codebases or complex business domains much more challenging
- When working directly with plain JavaScript trees of any non-trivial complexity, denormalization (and corresponding normalization) is usually required for efficient graph traversal. This adds additional complexity and maintenance requirements
- Many client UI frameworks, such as React, rely on referential equality of state data. Results returned from external data sources, including REST and GraphQL, will never be referentially equal, even if their structures and values are actually the same. Extensive memoization code, or poor performance result

<!-- TODO: For an in-depth review of these issues, and to contribute to the discussion, see the [following article](TODO). Feedback, input, and contributions welcomed and encouraged. -->

## Key Features

- **Interfaces and Custom Collection Types** to support the construction of [Reactive Domain Object](#definition-reactive-domain-object) Graphs
- **Automatic synchronization** of [Reactive Domain Object](#definition-reactive-domain-object) Graphs with an external data-source
- **Automatic Change tracking**, of external data-sources, with [Reactive Domain Object](#definition-reactive-domain-object) Nodes only being updated only where changes are detected. When combined with Observable properties, this is a very powerful feature, that
- **Performance Optimized**, with update synchronizations on a medium sized graph in sub 0.1 milliseconds, a full initial graph load in sub 0.5 milliseconds (as measured on a 2015 quad-core laptop)
- **One way data flow paradigm**: Actions --> External Data Source --> State
- **Custom Collection Types**, to support easy graph traversal, and reduce the need for denormalization of data

## Installation

```
    // npm
    npm i @ablestack/rdo, @ablestack/rdo-apollo-mobx-connector --save

    // yarn
    yarn add @ablestack/rdo, @ablestack/rdo-apollo-mobx-connector
```

## Abridge Usage Example

```TypeScript
// DEFINE REACTIVE DOMAIN GRAPH
class FooSimpleDomainGraph {
  public bar = new BarRDO(); //*1
}

export class BarRDO {
  public id: string = '';
  public name: string = '';
}

// INSTANTIATE DOMAIN RDO AND GRAPH SYNCHRONIZER
const fooSimpleRDO = new FooDomainGraphSimple();
const graphSynchronizer = new GraphSynchronizer(/* Config Options Here */);

// SYNC
graphSynchronizer.smartSync({ rootRdo: fooSimpleRDO, rootSourceNode: { bar: { id: 'bar-1', name: 'Original Name' } } });

// Make any changes to the source data

// RESYNC
graphSynchronizer.smartSync({ rootRdo: fooSimpleRDO, rootSourceNode: { bar: { id: 'bar-1', name: 'New Name' } } });

```

## Full Documentation

- See [Full Documentation](https://github.com/ablestack/reactive-domain-objects/blob/master/TECHNICAL.md) for a detailed description of all the functionality, configuration options, and additional usage examples.

## Definitions

### Reactive Domain Object

A Reactive Domain Object (RDO) is any object which satisfies the following conditions:

1. **Contains state, and optionally behavior and logic**, relating a discrete entity in a program domain
2. **Internal state is automatically synchronized** with changes in an external data-source
3. **Action methods are provided** for all acceptable state mutations
4. **Follows a one-way data-flow paradigm**, from: Action-Method --> External Data Source --> Internal-State (though synchronization)
5. **Observable Public Properties** (optional but recommended)
6. **Child nodes exposed as Maps** for efficient graph traversal (optional but recommended)

## Notes

### Known Issues & Limitations

- **Source & Target Structural Similarity**. While field names can be adjusted, by configuration, the overall 'shape' and nesting structure of the graph must match between the source and target graphs. This library does not, yet, have the capability of automatically manipulating the shape of a graph during the synchronization process
- **Array and Set collections types** in RDOs are more processing intensive. It is suggested that they are avoided for collections that may contain a large number of elements (100+)

### Disclaimers

This code was initially developed for use in a single commercial project. It is being shared in case useful to others, and as a contribution to the development community and the great tools and libraries that already exist.

### Refinements and Enhancements Needed

- Open to suggestions
- Find a clever way to provide a default mechanism to instantiate Domain Objects without the need for user configuration to provide these. Will probably require some kind of TypeScript reflection, as in 'empty domain collection' scenarios, an instance will not be available, and nor will type runtime type information
- Provide decorators that can be applied to the Domain Types to perform useful functions in lieu of configuration options, such as 'ignore'

## Companion Libraries

This library is part of a collection of companion tools and libraries under the [AbleStack](https://github.com/ablestack) umbrella. All of these libraries share the common goal:

> Help solo developers and small teams build big ideas rapidly and affordably

To achieve these goals, the following principles are applied:

- Selectively **leverage existing open source tools and libraries**, where, high quality, open source tools and libraries where possible
  - Curate usage examples, and guidance where available, and create where not available
- Prioritize technology choices that** embrace open source**
  - TypeScript over C#, and Node over .Net an example of this
- **Avoid** technology choices that could result in **hosting vendor lock-in**
  - ApolloGraphQL over AWS Amplify is an example of this
- **Automate wherever possible**, from development, through testing, to deployment, monitoring, and maintenance
  - Codegen from strongly types schemas is a good example of this.
- Where needed, **develop high quality, open source tools and libraries** to augment and automate existing open source tooling and libraries

<!-- This is an ongoing effort, that is never done. If you'd like to check out the companion libraries, even contribute to them, you can find them at the [AbleStack on GitHub](https://github.com/ablestack) -->

## Alternative Solutions

While this library solves several challenges relating to client-side JavaScript development, it was developed to solve some very specific use cases, and might not be the right solution for everyone. It is definitely worth checkout out these alternative solutions before making your choice:

- [MobX-state-tree](https://mobx-state-tree.js.org/) is similar in many respects to this library. **Reactive-domain-graphs** is designed to solve similar problems, but is less opinionated, less complicated, but also less sophisticated. For more advanced features and a more opinionated solution, MobX-state-tree is definitely worth checking out

- [Vanilla MobX](https://mobx.js.org/). Many of the benefits **Reactive-domain-graphs** come from the integration with the great **MobX** library. For small and even mid-sized solutions, the same result can be achieved with MobX alone. The primary added benefit that **Reactive-domain-graphs** provides is automating the synchronization of data with external data sources. The point at which that task becomes more complex or tiresome than adding another dependency, or learning another library, is the right point at which to get **Reactive-domain-graphs** in the mix

## Release Notes

### Notes 0.1.0

- Initial release
