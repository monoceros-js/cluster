import { isInfinite, isFunction } from './utils/value'
import { MonocerosClusterError } from './errors'

function Cluster(superCluster) {
  this.superCluster = superCluster || Infinity
  this.celestials = {}

  this.register = function(name, celestial, CelestialType, ...args) {
    CelestialType = CelestialType || Cluster.Body
    celestial = this.resolveDependencies(celestial, args)
    this.celestials[name] = new CelestialType(celestial)
  }

  this.createCluster = function() {
    return new Cluster(this)
  }

  this.resolve = function(name) {
    if (this.celestials.hasOwnProperty(name)) {
      return this.celestials[name].resolve()
    }
    if (
      isInfinite(this.superCluster) ||
      !this.superCluster.celestials.hasOwnProperty(name)
    ) {
      throw new MonocerosClusterError(
        `Could not resolve celestial named "${name}"`
      )
    }
    return this.superCluster.celestials[name].resolve()
  }

  this.resolveDependencies = function(celestial, args) {
    if (!isFunction(celestial) || !celestial.$dependencies) return celestial
    const deps = celestial.$dependencies.map(dep => {
      return this.resolve(dep)
    })
    deps.unshift({})
    return celestial.bind.apply(celestial, deps.concat(args))
  }
}

Cluster.Body = function(celestial) {
  this.resolve = () => celestial
}

Cluster.Singleton = function(celestial) {
  let instance

  this.resolve = () => {
    if (!instance) instance = celestial()
    return instance
  }
}

Cluster.Instance = function(celestial) {
  this.resolve = () => new celestial()
}

export default Cluster
