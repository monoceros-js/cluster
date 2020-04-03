# @Monoceros/cluster

## Description

Monoceros IOC Container

* * *

## Table of contents

- [Install](#install)
  - [npm](#npm)
- [Usage](#usage)
  - [Init](#init)
  - [Register](#register)
  - [Resolve](#resolve)
  - [Working with Superclusters](#working-with-superclusters)
- [License](#license)

## Install

### npm

```bash
npm install @monoceros/cluster
```

## Usage

### Init

```js
import Cluster from '@monoceros/cluster'

const cluster = new Cluster()
```

### Register

```js
const add = (a, b) => a + b

cluster.register('add', add)
```

### Resolve

```js
const addTwo = (a, b) => a + b

cluster.register('addTwo', addTwo)

// -------- //

const addAndMultiplyBy = (a, b, c) => {
  const add = cluster.resolve('add')
  return add(a, b) * c
}

console.log(addAndMultiplyBy(10, 1, 3)) // 33
```

#### Resolve with dependencies

```js
const add = (a, b) => a + b

cluster.register('add', add)

// -------- //

const addAndMultiplyBy = (dependencyOne, a, b, c) => dependencyOne(a, b) * c

addAndMultiplyBy.$dependencies = ['add']

cluster.register('addAndMultiplyBy', addAndMultiplyBy)

const aamb = cluster.resolve('addAndMultiplyBy')

console.log(aamb(10, 1, 3)) // 33
```

### Working with Superclusters

```js
const parent = new Cluster()

const child = parent.createCluster()

const add = (a, b) => a + b

parent.register('add', add)

const a = child.resolve('add')
```

* * *

## License

[MIT](license) @ [Folkert-Jan van der Pol](https://folkertjan.nl)
