import { Mesh, Vector2 } from 'three'

export default class Entity {
  public mesh: Mesh
  private resolution: Vector2

  constructor(mesh: Mesh, resolution: Vector2) {
    this.mesh = mesh
    mesh.castShadow = true
    mesh.receiveShadow = true

    this.resolution = resolution
  }

  get position() {
    return this.mesh.position
  }

  getIndexByCoord() {
    const { x } = this.resolution
    return this.position.z * x + this.position.x
  }
}
