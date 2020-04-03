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
  - [Cluster](#cluster)
  - [Register](#register-1)
  - [Resolve](#resolve-1)
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

You can register entities to the Cluster by calling `.register()` with a _name_ and the _entity_.

```js
const add = (a, b) => a + b

cluster.register('add', add)


// cluster.resolve('add')(1, 2)    // 3
```

#### Register as type

You need to specifiy the entity type if you want something other than the default, by passing it through the options parameter of `.register()`.

See [types](#types) for a list of possibilities

```js
const current = () => ({
  version: Math.random()
})

cluster.register('current', current, {type: Cluster.Singleton})


// const one = cluster.resolve('current')
// one.version    // 0.3345465634534234560654992

// const two = cluster.resolve('current')
// two.version    // 0.3345465634534234560654992
```

#### Register dependencies

Functions / Classes depending on others have to pass a list of their dependency names in the option parameter of `.register()`. 

> **Note:** dependencies should be passed in the same order as their parameter ordder in the entity. _Dependencies should always be the first parameters of the entity_.

> **Note:** _entities_ can be registered in any order.

```js
const add = (a, b) => a + b

const dependend = (d1, a, b, c) => d1(a, b) * c

cluster.register('dependend', dependend, {dependencies: ['add']})
cluster.register('add', add)


// cluster.resolve('dependend')(10, 1, 3)    // 33
```

#### Register with arguments

Every argument after the first three arguments applied to `.register()` will be applied to the _entity_ on calling resolve.

```js
const add = (a, b) => a + b

cluster.register('three', add, {}, 1, 2)


// cluster.resolve('three')()   // 3
```

### Resolve

You can get registered entities from the Cluster by calling `.resolve()` with the _name_ of the required entity.

```js
// const add = (a, b) => a + b
// cluster.register('add', add)

const resolved = cluster.resolve('add')

resolved(1, 2) // 3
```

#### With arguments

You can pass arguments to `.resolve`. These will automatically be applied to the entity to resolve.

```js
// const add = (a, b) => a + b
// cluster.register('add', add)

const resolved = cluster.resolve('add', 1, 2)

resolved() // 3
```

### Working with Superclusters

You can create clusters within clusters that will resolve requested entities in itself first. If it can't find it in its own entities, it will try to resolve it from the parent cluster.

```js
const parent = new Cluster()

const child = parent.createCluster()

const add = (a, b) => a + b

parent.register('add', add)

child.resolve('add')(1, 2)    // 3
```

* * *

## API

```js
import Cluster from '@monoceros/cluster'
```

### Cluster

```js
new Cluster()
```

Returns instance of Cluster

### Register

> (name, entity\[, options[, ...arguments]])

```js
cluster.register(name, entity, options || {}, ...args)
```

Register new entity with name.

- `name` <sup>(required)</sup> - Registration name, used by `.resolve()`

- `entity` <sup>(required)</sup> - Entity to register

- `options` <sup>(optional)</sup> - Object of options.

  - `.type` <sup>(optional)</sup> - Register type entity will be resolved with. Accepted values: see [types](#types)

  - `.dependencies` <sup>(optional)</sup> - Array of entity names the current entity depends upon

- `...args` <sup>(optional)</sup> - Any arguments you want a function / class entity to be called with upon calling resolve

### Resolve

> (name, [, ...arguments])

```js
cluster.resolve(name, ...args)
```

Resolve registered entities.

- `name` <sup>(required)</sup> -- Name of registered entity to resolve

- `...args` <sup>(optional)</sup> - Arguments to apply to entity on caling resolve

### Types

| Description | Type                | Resolves                                                                    | Accepted entities                                                |
| ----------- | ------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| _default_   | `Cluster.Body`      | _as-is_                                                                     | `string`, `number`, `object`, `function`, `constructor`, `class` |
| Singleton   | `Cluster.Singleton` | [singleton](https://en.wikipedia.org/wiki/Singleton_pattern)                | `function`                                                       |
| Instance    | `Cluster.Instance`  | class [instance](https://en.wikipedia.org/wiki/Instance_(computer_science)) | `constructor`, `class`                                           |

* * *

## License

[MIT](license) @ [Folkert-Jan van der Pol](https://folkertjan.nl)
