# @ablestack/rdo-apollo-mobx-connector

## Summary

This is a package from the [reactive-domain-objects](https://github.com/ablestack/reactive-domain-objects) Library.

## Overview

The [reactive-domain-objects](https://github.com/ablestack/reactive-domain-objects) library intelligently synchronizes any source of JSON data with rich observable Domain Models, providing a bridge from an _Imperative programming model_ of stateful objects to a _Reactive programming model_ of observables, data streams, and reactive user interfaces.

A primary use case is connecting GraphQL client libraries (such as [ApolloGraphQL](https://github.com/apollographql/apollo-client)) to reactive client libraries (such as [React](https://reactjs.org/)) with Observables (such as [MobX](https://mobx.js.org/)).

See below for an introduction to the library, and [Full Technical/Usage Documentation](https://github.com/ablestack/reactive-domain-objects/blob/master/TECHNICAL.md) for a detailed description of all the functionality, configuration options, and additional usage examples.

## The Problems Being Solved

The problems being solved primarily revolve around consuming and using JSON data in TypeScript/JavaScript client applications:

- **The Encapsulation Problem**: Most modern state management frameworks rely on plain JavaScript object trees. This makes encapsulation (of data, logic, and behavior) difficult which, in turn, makes managing complexity in large codebases or complex business domains much more challenging

- **The Denormalization Difficulty**: When working directly with plain JavaScript trees of any non-trivial complexity, denormalization (and corresponding normalization) is usually required for efficient graph traversal. This adds additional complexity and maintenance requirements

- **External Data Sync**: Many client UI frameworks, such as React, rely on referential equality of state data. Results returned from external data sources, including REST and GraphQL, will never be referentially equal, even if their structures and values are actually the same. Extensive memoization code, or poor performance result

<!-- TODO: For an in-depth review of these issues, and to contribute to the discussion, see the [following article](TODO). Feedback, input, and contributions welcomed and encouraged. -->

## Key Features

- **Automatic synchronization** of [Reactive Domain Object](#definition-reactive-domain-object) Graphs with an external data-source
- **Automatic Change tracking**, of external data-sources, with [Reactive Domain Object](#definition-reactive-domain-object) Nodes only being updated only where changes are detected. When combined with Observable properties, this is a very powerful feature that reduces or eliminates the need for memoization code in dependent UI code
- **Convention, Configuration, or Code** options for specifying the construction of [Reactive Domain Object](#definition-reactive-domain-object) Graphs
- **Automatic Creation of Observable Domain Model Objects**, (base on configuration settings)
- **Emits Node Change Events**, which can be subscribed to via the GraphSynchronizer object
- **Rdo Synchronization Lifecycle Hooks**, which can be implemented via interfaces
- **Performance Optimized**, with sub 0.3 millisecond synchronizations for a medium sized graph (as measured on a 2015 quad-core laptop. Performanc test available for local performance verification)
- **One way data flow paradigm**: Actions --> External Data Source --> State
- **Custom Collection Types**, to support easy graph traversal, and reduce the need for denormalization of data

## Instructions

See the associated [reactive-domain-objects github repo](https://github.com/ablestack/reactive-domain-objects) for usage and configuration information.
