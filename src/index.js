import { isInfinite, isFunction } from './utils/value'
import { MonocerosClusterError } from './errors'

function Cluster(parent) {
  this.parent = parent || Infinity
  this.entities = {}

  this.register = function(name, entity, EntityType, ...args) {
    EntityType = EntityType || Cluster.Body
    entity = this.resolveDependencies(entity, args)
    this.entities[name] = new EntityType(entity)
  }

  this.createCluster = function() {
    return new Cluster(this)
  }

  this.resolve = function(name) {
    if (this.entities.hasOwnProperty(name)) {
      return this.entities[name].resolve()
    }
    if (isInfinite(this.parent) || !this.parent.entities.hasOwnProperty(name)) {
      throw new MonocerosClusterError(
        `Could not resolve entity named "${name}"`
      )
    }
    return this.parent.entities[name].resolve()
  }

  this.resolveDependencies = function(entity, args) {
    if (!isFunction(entity) || !entity.$dependencies) return entity
    const deps = entity.$dependencies.map(dep => {
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
