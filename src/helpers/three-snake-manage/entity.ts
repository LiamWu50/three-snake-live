import gsap from 'gsap'
import {
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Vector2
} from 'three'

/**
 * 实体类
 */
export default class Entity {
  public mesh: Mesh
  private resolution: Vector2
  public option: { size: number; number: number }

  constructor(
    mesh: Mesh,
    resolution: Vector2,
    option = { size: 1.5, number: 0.5 }
  ) {
    this.mesh = mesh
    mesh.castShadow = true
    mesh.receiveShadow = true

    this.resolution = resolution
    this.option = option
  }

  get position() {
    return this.mesh.position
  }

  getIndexByCoord() {
    const { x } = this.resolution
    return this.position.z * x + this.position.x
  }

  in() {
    gsap.from(this.mesh.scale, {
      duration: 1,
      x: 0,
      y: 0,
      z: 0,
      ease: `elastic.out(${this.option.size}, ${this.option.number})`
    })
  }
}

/**
 * 糖果
 */
const CANDY_GEOMETRY = new SphereGeometry(0.3, 10, 10)
const CANDY_MATERIAL = new MeshStandardMaterial({
  color: 0x614bdd
})

export class Candy extends Entity {
  public points: number

  constructor(resolution: Vector2) {
    const mesh = new Mesh(CANDY_GEOMETRY, CANDY_MATERIAL)
    super(mesh, resolution)

    this.points = Math.floor(Math.random() * 3) + 1
    this.mesh.scale.setScalar(0.5 + (this.points * 0.5) / 3)
  }
}

/**
 * 石头
 */
const ROCK_GEOMETRY = new IcosahedronGeometry(0.5)
const ROCK_MATERIAL = new MeshStandardMaterial({
  color: 0xacacac,
  flatShading: true
})

export class Rock extends Entity {
  constructor(resolution: Vector2) {
    const mesh = new Mesh(ROCK_GEOMETRY, ROCK_MATERIAL)
    mesh.scale.set(Math.random() * 0.5 + 0.5, 0.1 + Math.random() ** 2 * 1.9, 1)
    mesh.rotation.y = Math.random() * Math.PI * 2
    mesh.rotation.x = Math.random() * Math.PI * 0.1
    mesh.rotation.order = 'YXZ'
    mesh.position.y = -0.5

    super(mesh, resolution)
  }
}

/**
 * 树
 */
const TREE_GEOMETRY = new IcosahedronGeometry(0.3, 1)
TREE_GEOMETRY.scale(1, 6, 1)
const TREE_MATERIAL = new MeshStandardMaterial({
  flatShading: true,
  color: 0xa2d109
})

export class Tree extends Entity {
  constructor(resolution: Vector2) {
    const mesh = new Mesh(TREE_GEOMETRY, TREE_MATERIAL)
    mesh.scale.setScalar(0.6 + Math.random() * 0.6)
    mesh.rotation.y = Math.random() * Math.PI * 2

    super(mesh, resolution)
  }
}
