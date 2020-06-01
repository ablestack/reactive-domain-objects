# Overview

apollo-mobx-connector is a collection of utility classes and methods designed to simplify the integration points between ApolloGraphQL and MobX. In particular, it is designed to transform ApolloGraphQL watched Query results into an observable Domain Model graph.

## Key Features

- Runs the entire synchronization routine in a mobx transaction

## Status: BETA

This project is at "Beta" status, with an evolving codebase. However, any breaking changes will be released with new minor or major version bumps in order to minimize disruption to any consumers, and detailed in [Release Notes](##Release-Notes)

## The Problem Being Solved

## Usage

## Usage Example

TBD

```TypeScript
TBD
```

## Disclaimers & Known Issues

TBD

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
