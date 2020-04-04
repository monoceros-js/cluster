import { isInfinite, isFunction, isArray } from './utils/value'
import { MonocerosClusterError } from './errors'

function Cluster(parent) {
  this.parent = parent || Infinity
  this.entities = {}

  this.register = function (name, entity, options, ...args) {
    if (!name) throw new MonocerosClusterError('Entity name must be provided')
    if (!entity)
      throw new MonocerosClusterError(
        `Could not find entity trying to be registered as ${name}`
      )
    if (options) {
      if (isFunction(options)) {
        options = { type: options }
      }
      if (isArray(options)) {
        options = { dependencies: options }
      }
    }
    options = options || {}
    this.entities[name] = {
      $uninitialized: entity,
      $type: options.type || Cluster.Body,
      $dependencies: options.dependencies || entity.$dependencies || [],
      $args: args && args.length > 0 ? args : [],
    }
  }

  this.createCluster = function () {
    return new Cluster(this)
  }

  this.resolve = function (name, ...args) {
    if (!name) {
      throw new MonocerosClusterError(
        'Resolve requires the name of an entity to resolve'
      )
    }
    args = args || []
    if (this.entities.hasOwnProperty(name)) {
      return this.applyEntityType(name, args).resolve()
    }
    if (!isInfinite(this.parent) && this.parent.entities.hasOwnProperty(name)) {
      return this.parent.applyEntityType(name, args).resolve()
    }

    throw new MonocerosClusterError(`Could not resolve entity named "${name}"`)
  }

  this.applyEntityType = function (name, args) {
    let entity = this.entities[name]
    const { $uninitialized, $type, $dependencies, $args } = entity
    if (!$uninitialized) return entity
    entity = this.resolveDependencies(
      $uninitialized,
      $dependencies,
      $args.concat(args)
    )
    this.entities[name] = new $type(entity)
    return this.entities[name]
  }

  this.resolveDependencies = function (entity, dependencies, args) {
    if (!isFunction(entity)) return entity
    if (dependencies.length === 0 && args.length === 0) return entity

    const deps = []
    if (dependencies.length > 0) {
      dependencies.forEach(dep => {
        deps.push(this.resolve(dep))
      })
    }
    deps.unshift({})
    return entity.bind.apply(entity, deps.concat(args))
  }
}

Cluster.Body = function (entity) {
  this.resolve = () => entity
}

Cluster.Singleton = function (entity) {
  let instance

  this.resolve = () => {
    if (!instance) instance = entity()
    return instance
  }
}

Cluster.Instance = function (entity) {
  this.resolve = () => new entity()
}

export default Cluster
