import { isInfinite, isFunction } from './utils/value'
import { MonocerosClusterError } from './errors'

function Cluster(parent) {
  this.parent = parent || Infinity
  this.entities = {}

  this.register = function(name, entity, options, ...args) {
    if (options && !options.type && !options.dependencies) {
      options = { type: options }
    }
    options = options || {}
    this.entities[name] = {
      $uninitialized: entity,
      $type: options.type || Cluster.Body,
      $dependencies: options.dependencies || entity.$dependencies || [],
      $args: args || [],
    }
  }

  this.createCluster = function() {
    return new Cluster(this)
  }

  this.resolve = function(name, ...args) {
    if (this.entities.hasOwnProperty(name)) {
      return this.applyEntityType(name, args).resolve()
    }
    if (!isInfinite(this.parent) && this.parent.entities.hasOwnProperty(name)) {
      return this.parent.applyEntityType(name, args).resolve()
    }

    throw new MonocerosClusterError(`Could not resolve entity named "${name}"`)
  }

  this.applyEntityType = function(name, args) {
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

  this.resolveDependencies = function(entity, dependencies, args) {
    if (!isFunction(entity) || dependencies.length === 0) return entity
    const deps = dependencies.map(dep => {
      return this.resolve(dep)
    })
    deps.unshift({})
    return entity.bind.apply(entity, deps.concat(args))
  }
}

Cluster.Body = function(entity) {
  this.resolve = () => entity
}

Cluster.Singleton = function(entity) {
  let instance

  this.resolve = () => {
    if (!instance) instance = entity()
    return instance
  }
}

Cluster.Instance = function(entity) {
  this.resolve = () => new entity()
}

export default Cluster
