export class MonocerosClusterError extends Error {
  constructor(message) {
    super()
    this.name = this.constructor.name
    this.message = message
  }
}
