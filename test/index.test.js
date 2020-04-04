require = require('esm')(module /*, options*/)

const Cluster = require('../dist/monoceros-cluster.js').default
const MonocerosClusterError = require('../src/errors/index.js')
  .MonocerosClusterError

const cluster = new Cluster()

test('it should throw an error if entity does not exist', () => {
  expect(() => cluster.resolve('unknown')).toThrowError(
    new MonocerosClusterError('Could not resolve entity named "unknown"')
  )
})

test('it should resolve an entity after entity creation', () => {
  const entity = { hello: 'world' }
  cluster.register('test0', entity)

  expect(cluster.resolve('test0')).toBe(entity)
})

test('it should resolve identical function after creating entity as function', () => {
  const add = (a, b) => a + b

  cluster.register('test1', add)

  expect(cluster.resolve('test1')).toBe(add)
})

test('it should resolve an instance after registering entity as instance', () => {
  const entity = function () {
    this.name = 'instance of entity'
  }
  cluster.register('test3', entity, { type: Cluster.Instance })

  expect(cluster.resolve('test3').name).toBe('instance of entity')
})

test('it should resolve a singleton after registering entity as singleton', () => {
  const entity = () => ({
    id: Math.random(),
  })
  cluster.register('test4', entity, { type: Cluster.Singleton })

  const resultOne = cluster.resolve('test4')
  const resultTwo = cluster.resolve('test4')

  expect(resultOne).toBe(resultTwo)
})

test('it should take type as replacement for options object', () => {
  const entity = function () {
    this.name = 'instance of entity'
  }

  cluster.register('test5', entity, Cluster.Instance)

  expect(cluster.resolve('test5').name).toBe('instance of entity')
})

test('it should take dependencies as replacement for options object', () => {
  const one = (a, b) => a + b
  const two = (add, a, b, c) => add(a, b) * c

  cluster.register('test6_one', one)
  cluster.register('test6_two', two, ['test6_one'])

  expect(cluster.resolve('test6_two', 1, 2, 3)()).toBe(9)
})

test('it should take dependencies as property of options object', () => {
  const one = (a, b) => a + b
  const two = (add, a, b, c) => add(a, b) + c

  cluster.register('test7_two', two, { dependencies: ['test7_one'] })
  cluster.register('test7_one', one)

  expect(cluster.resolve('test7_two')(1, 2, 3)).toBe(6)
})

test('it should take dependencies as property of entity', () => {
  const one = (a, b) => a + b
  const two = (add, a, b, c) => add(a, b) + c
  two.$dependencies = ['test8_one']

  cluster.register('test8_two', two)
  cluster.register('test8_one', one)

  expect(cluster.resolve('test8_two')(1, 2, 3)).toBe(6)
})

test('it should not register own entities in parent cluster', () => {
  const child = cluster.createCluster()

  const add = (a, b) => a + b

  child.register('test9', add)

  expect(() => cluster.resolve('test9')).toThrow()
})

test('it should resolve parent-registered entities from parent cluster', () => {
  const child = cluster.createCluster()

  const add = (a, b) => a + b

  cluster.register('test10', add)

  expect(child.resolve('test10')).toBe(add)
})

test('it should let clusters return requested entity from own entities if it is self-registered', () => {
  const entityOne = {
    id: Math.random(),
  }
  const entityTwo = {
    id: Math.random(),
  }
  const child = cluster.createCluster()

  cluster.register('test11', entityOne)
  child.register('test11', entityTwo)

  const resultOne = cluster.resolve('test11')
  const resultTwo = child.resolve('test11')

  expect(resultOne).toBe(entityOne)
  expect(resultTwo).toBe(entityTwo)
  expect(entityOne).not.toBe(entityTwo)
})

test('it should recursively resolve entity dependencies', () => {
  const one = function () {
    this.name = 'dependency one'
  }

  const two = (d3, name) => {
    expect(d3.name).toBe('dependency three')
    return d3.name + ' ' + name
  }

  const three = function () {
    this.name = 'dependency three'
  }

  const four = function (d1, d2, d3) {
    this.name = 'depends upon one, two and three'
    expect(d1.name).toBe('dependency one')
    expect(d2('test')).toBe('dependency three test')
    expect(d3.name).toBe('dependency three')
  }

  cluster.register('test12_one', one, Cluster.Instance)
  cluster.register('test12_two', two, { dependencies: ['test12_three'] })
  cluster.register('test12_three', three, Cluster.Instance)

  cluster.register('test12_four', four, {
    type: Cluster.Instance,
    dependencies: ['test12_one', 'test12_two', 'test12_three'],
  })

  expect(cluster.resolve('test12_four').name).toBe(
    'depends upon one, two and three'
  )
})

test('it should apply arguments that are not dependencies when registering an instance', () => {
  const one = function (name) {
    return 'hello ' + name
  }

  const two = function (name) {
    expect(name).toBe('monoceros')
    return name
  }

  const three = function (d1, d2, argument) {
    this.greeting = `${d1(d2())}. passed: "${argument}"`
  }

  cluster.register('test13_one', one)
  cluster.register('test13_two', two, null, 'monoceros')
  cluster.register(
    'test13_three',
    three,
    {
      type: Cluster.Instance,
      dependencies: ['test13_one', 'test13_two'],
    },
    'parameter'
  )

  expect(cluster.resolve('test13_three').greeting).toBe(
    'hello monoceros. passed: "parameter"'
  )
})

test('it should correctly resolve overwritten entities', () => {
  const entity = {
    add: (a, b) => a + b,
  }

  cluster.register('test14', entity)

  entity.add = (a, b) => a - b

  expect(cluster.resolve('test14').add(1, 2)).toBe(-1)
})

test('it should apply extra arguments passed to register to entity on resolve', () => {
  const add = (a, b) => a + b

  cluster.register('test15_one', add)
  cluster.register('test15_two', add, {}, 1, 2)

  expect(cluster.resolve('test15_one', 1, 2)()).toBe(3)
  expect(cluster.resolve('test15_one')(1, 2)).toBe(3)
  expect(cluster.resolve('test15_two')('something', 'else')).toBe(3)
})

test('it should apply extra object arguments passed to resolve', () => {
  const one = (a, b) => a.one + b.one

  cluster.register('test16_one', one)
  cluster.register('test16_two', one, null, { one: 1 }, { one: 2 })

  expect(cluster.resolve('test16_one', { one: 1 }, { one: 2 })()).toBe(3)
  expect(cluster.resolve('test16_one')({ one: 1 }, { one: 2 })).toBe(3)
  expect(cluster.resolve('test16_two')('something', 'else')).toBe(3)
})
