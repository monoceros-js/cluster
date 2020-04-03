# @monoceros/cluster

> Inversion Of Control container

* * *

## Table of contents

- [Install](#install)
  - [npm](#npm)
- [Usage](#usage)
  - [Register](#register)
  - [Resolve](#resolve)
  - [Working with Superclusters](#working-with-superclusters)
- [API](#api)
  - [`new Cluster()`](#new-cluster)
  - [`.register(name, entity[[, options = {}][, ...args]])`](#registername-entity-options---args)
  - [`.resolve(name[, ...args])`](#resolvename-args)
  - [Types](#types)
- [License](#license)

## Install

### npm

```bash
npm install @monoceros/cluster
```

* * *

## Usage

```js
import Cluster from '@monoceros/cluster'

const cluster = new Cluster()
```

### Register

You can register entities to the Cluster by calling `.register()` with a `name` and the `entity`.

```js
const add = (a, b) => a + b

cluster.register('add', add)
```

#### Register as type

You need to specifiy the entity type if you want something other than the default, by passing it through the options parameter of `.register()`.

See [types](#types) for a list of possibilities

```js
const current = {
  version: Math.random()
}

cluster.register('current', current, {type: Cluster.Singleton})
```

#### Register dependencies

Functions / Classes depending on others have to pass a list of their dependency names in the option parameter of `.register()`. 

_Note: dependencies can be registered in any order, as long as they are registered before resolving the dependend entity_

```js
const dependency = (a, b) => a + b

const dependend = (add, a, b, c) => add(a, b) * c

cluster.register('dependend', dependend, {dependencies: ['dependency']})
cluster.register('dependency', dependency)
```

#### Register with arguments

Every argument after the first three arguments applied to `.register()` will be applied to the _entity_ on calling resolve.

```js
const add = (a, b) => a + b

cluster.register('three', add, {}, 1, 2)
```

### Resolve

You can get registered entities from the Cluster by calling `.resolve()` with the _name_ of the required entity.

```js
// let's assume we registered entity 'add': const add = (a, b) => a + b
const entity = cluster.resolve('add')

entity(1, 2) // 3
```

### Working with Superclusters

You can create clusters within clusters that will resolve requested entities in itself first. If it can't find it in its own entities, it will try to resolve it from the parent cluster.

```js
const parent = new Cluster()

const child = parent.createCluster()

const add = (a, b) => a + b

parent.register('add', add)

const entity = child.resolve('add')

entity(1, 2) // 3
```

* * *

## API

```js
import Cluster from '@monoceros/cluster'
```

### `new Cluster()`

Returns instance of Cluster

### `.register(name, entity[[, options = {}][, ...args]])`

Register new entity with name.

Parameters:

- `name` <sup>(required)</sup> - Name to register entity under, resolves under same name

- `entity` <sup>(required)</sup> - Entity to register

- `options` <sup>(optional)</sup> - Object of options.

  - `.type` <sup>(optional)</sup> - Register type entity will be resolved with. Accepted values: see [types](#types)

  - `.dependencies` <sup>(optional)</sup> - Pass array of enitty names the current entity depends upon

- `...args` <sup>(optional)</sup> - Any arguments you want a function / class entity to be called with upon calling resolve

### `.resolve(name[, ...args])`

Resolve registered entites.

Parameters: 

- `name` <sup>(required)</sup> -- Name of registered entity to resolve

- `...args` <sup>(optional)</sup> - Arguments to apply to entity on caling resolve

### Types

| Description | Type                | Resolves as                                                                 | Accepted entities                                 |
| ----------- | ------------------- | --------------------------------------------------------------------------- | ------------------------------------------------- |
| _default_   | `Cluster.Body`      | _as-is_                                                                     | `string`, `number`, `object`, `class`, `function` |
| Singleton   | `Cluster.Singleton` | [singleton](https://en.wikipedia.org/wiki/Singleton_pattern)                | `object`                                          |
| Instance    | `Cluster.Instance`  | class [instance](https://en.wikipedia.org/wiki/Instance_(computer_science)) | `class`, `constructor function`                   |

* * *

## License

[MIT](license) @ [Folkert-Jan van der Pol](https://folkertjan.nl)
