require = require('esm')(module /*, options*/)

const Cluster = require('../src/index.js').default
const MonocerosClusterError = require('../src/errors/index.js')
  .MonocerosClusterError

const cluster = new Cluster()

test('it should throw an error if entity does not exist', () => {
  expect(() => cluster.resolve('unknown')).toThrowError(
    new MonocerosClusterError('Could not resolve entity named "unknown"')
  )
})

test('it should resolve an entity after entity creation', () => {
  const entity = 'hello'
  cluster.register('test0_entity', entity)

  expect(cluster.resolve('test0_entity')).toBe(entity)
})

test('it should return identical object after creating entity as object', () => {
  const entity = {
    id: Math.random(),
  }
  cluster.register('test1_entity', entity)

  expect(cluster.resolve('test1_entity')).toBe(entity)
})

test('it should return identical function after creating entity as function', () => {
  const add = function(a, b) {
    return a + b
  }

  cluster.register('test2_entity', add)

  expect(cluster.resolve('test2_entity')).toBe(add)
})

test('it should return an instance after creating entity as Instance', () => {
  const entity = function() {
    this.name = 'instance of entity'
  }
  cluster.register('test3_entity', entity, Cluster.Instance)

  expect(cluster.resolve('test3_entity').name).toBe('instance of entity')
})

test('it should return a singleton after creating entity as Singleton', () => {
  const entity = () => ({
    id: Math.random(),
  })
  cluster.register('test4_entity', entity, Cluster.Singleton)

  const resultOne = cluster.resolve('test4_entity')
  const resultTwo = cluster.resolve('test4_entity')

  expect(resultOne).toBe(resultTwo)
})

test('it should not register own entities in parent cluster', () => {
  const inner = cluster.createCluster()

  const entity = {
    id: Math.random(),
  }

  inner.register('test6_entity', entity)

  expect(() => cluster.resolve('test6_entity')).toThrow()
})

test('it should resolve parent-registered entities from parent cluster', () => {
  const inner = cluster.createCluster()

  const entity = {
    id: Math.random(),
  }

  cluster.register('test7_entity', entity)

  expect(inner.resolve('test7_entity')).toBe(entity)
})

test('it should let clusters return requested entity from own entities if it is self-registered', () => {
  const entityOne = {
    id: Math.random(),
  }
  const entityTwo = {
    id: Math.random(),
  }
  const inner = cluster.createCluster()

  cluster.register('test8_entity', entityOne)
  inner.register('test8_entity', entityTwo)

  const resultOne = cluster.resolve('test8_entity')
  const resultTwo = inner.resolve('test8_entity')

  expect(resultOne).toBe(entityOne)
  expect(resultTwo).toBe(entityTwo)
  expect(entityOne).not.toBe(entityTwo)
})

test('it should recursively resolve entity dependencies', () => {
  const DependencyOne = function() {
    this.name = 'dependency one'
  }

  const DependencyTwo = function(dThree) {
    expect(dThree.name).toBe('dependency three')
    return dThree.name
  }

  DependencyTwo.$dependencies = ['test9_dependency_three']

  const DependencyThree = function() {
    this.name = 'dependency three'
  }

  const DependsUpon = function(dOne, dTwo) {
    this.name = 'depends upon one and two'
    expect(dOne.name).toBe('dependency one')
    expect(dTwo()).toBe('dependency three')
  }

  DependsUpon.$dependencies = ['test9_dependency_one', 'test9_dependency_two']

  cluster.register('test9_dependency_one', DependencyOne, Cluster.Instance)
  cluster.register('test9_dependency_three', DependencyThree, Cluster.Instance)
  cluster.register('test9_dependency_two', DependencyTwo)

  cluster.register('test9_depends_upon', DependsUpon, Cluster.Instance)

  expect(cluster.resolve('test9_depends_upon').name).toBe(
    'depends upon one and two'
  )
})

test('it should apply arguments that are not dependencies when creating an Instance', () => {
  const greeting = function(name) {
    return 'hello ' + name
  }

  const Email = function(greeting, name) {
    this.greeting = greeting(name)
    expect(this.greeting).toBe('hello ' + name)
  }

  Email.$dependencies = ['test10_greeting']

  cluster.register('test10_greeting', greeting)
  cluster.register('test10_email', Email, Cluster.Instance, 'folkert')

  expect(cluster.resolve('test10_email').greeting).toBe('hello folkert')
})
