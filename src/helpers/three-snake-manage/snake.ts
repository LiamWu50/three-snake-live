import {
  EventDispatcher,
  Mesh,
  MeshStandardMaterial,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry'

import Entity from './entity'
import { LinkedList, ListNode } from './linked-list'

const NODE_GEOMETRY = new RoundedBoxGeometry(0.9, 0.9, 0.9, 5, 0.1)
const NODE_MATERIAL = new MeshStandardMaterial({
  color: 0xff470a
})

const UP = new Vector3(0, 0, -1)
const DOWN = new Vector3(0, 0, 1)
const LEFT = new Vector3(-1, 0, 0)
const RIGHT = new Vector3(1, 0, 0)

export default class Snake extends EventDispatcher {
  public body!: LinkedList
  private direction: Vector3 = LEFT
  private newDirection: Vector3 | null = null
  public indexes: number[] = []

  private scene: Scene
  private resolution: Vector2
  public mouthColor: number
  public mouth!: Mesh

  constructor(
    scene: Scene,
    resolution = new Vector2(10, 10),
    color: number,
    mouthColor: number
  ) {
    super()
    this.scene = scene
    this.resolution = resolution
    this.mouthColor = mouthColor

    if (color) {
      NODE_MATERIAL.color.set(color)
    }

    this.init()
  }

  get head(): ListNode {
    return this.body.head
  }

  get end(): ListNode {
    return this.body.end
  }

  private init() {
    this.direction = UP
    const head = new ListNode(new SnakeNode(this.resolution))
    head.data.mesh.position.x = this.resolution.x / 2
    head.data.mesh.position.z = this.resolution.y / 2

    this.body = new LinkedList(head)
    this.createHeadMesh()

    this.indexes.push(this.head.data.getIndexByCoord())
    for (let i = 0; i < 3; i++) {
      const position = this.end.data.mesh.position.clone()
      position.sub(this.direction)
      this.addTailNode(position)
      this.end.data.mesh.position.copy(position)

      this.indexes.push(this.end.data.getIndexByCoord())
    }

    this.scene.add(head.data.mesh)
  }

  private createHeadMesh() {
    const headMesh = this.body.head.data.mesh

    const leftEye = new Mesh(
      new SphereGeometry(0.2, 10, 10),
      new MeshStandardMaterial({
        color: 0xffffff
      })
    )
    leftEye.scale.x = 0.1
    leftEye.position.x = 0.5
    leftEye.position.y = 0.1
    leftEye.position.z = 0.1

    const rightEye = leftEye.clone()
    rightEye.position.x = -0.5

    const mouthMesh = new Mesh(
      new RoundedBoxGeometry(1.1, 0.08, 0.5, 5, 0.08),
      new MeshStandardMaterial({
        color: this.mouthColor
      })
    )

    mouthMesh.rotation.x = -Math.PI * 0.1
    mouthMesh.position.z = 0.3
    mouthMesh.position.y = -0.2

    this.mouth = mouthMesh

    headMesh.add(leftEye, rightEye, mouthMesh)

    headMesh.lookAt(headMesh.position.clone().add(this.direction))
  }

  public setDirection(keyCode: string) {
    switch (keyCode) {
      case 'ArrowUp':
        this.newDirection = UP
        break
      case 'ArrowDown':
        this.newDirection = DOWN
        break
      case 'ArrowLeft':
        this.newDirection = LEFT
        break
      case 'ArrowRight':
        this.newDirection = RIGHT
        break
    }

    if (this.newDirection) {
      const dot = this.direction.dot(this.newDirection)
      if (dot !== 0) {
        this.newDirection = null
      }
    }
  }

  public update() {
    if (this.newDirection) {
      this.direction = this.newDirection
      this.newDirection = null
    }

    let currentNode = this.end

    if (this.end.data.candy) {
      this.end.data.candy = null
      this.end.data.mesh.scale.setScalar(1)
      this.addTailNode()
    }

    while (currentNode.prev) {
      const candy = currentNode.prev.data.candy
      if (candy) {
        currentNode.data.candy = candy
        currentNode.data.mesh.scale.setScalar(1.1)
        currentNode.prev.data.candy = null
        currentNode.prev.data.mesh.scale.setScalar(1)
      }

      const position = currentNode.prev.data.mesh.position.clone()
      currentNode.data.mesh.position.copy(position)
      currentNode = currentNode.prev
    }

    const headPos = currentNode.data.mesh.position
    headPos.add(this.direction)

    const headMesh = this.body.head.data.mesh
    headMesh.lookAt(headMesh.position.clone().add(this.direction))

    if (headPos.z < 0) {
      headPos.z = this.resolution.y - 1
    } else if (headPos.z > this.resolution.y - 1) {
      headPos.z = 0
    }

    if (headPos.x < 0) {
      headPos.x = this.resolution.x - 1
    } else if (headPos.x > this.resolution.x - 1) {
      headPos.x = 0
    }

    this.updateIndexes()
    this.dispatchEvent({ type: 'update' } as never)
  }

  public die() {
    let node = this.body.head

    do {
      this.scene.remove(node.data.mesh)
      node = node.next as ListNode
    } while (node)

    this.init()
  }

  public checkSelfCollision() {
    const headIndex = this.indexes.pop() as number
    const collide = this.indexes.includes(headIndex)
    this.indexes.push(headIndex)

    return collide
  }

  public checkEntitiesCollision(entities: Entity[]): boolean {
    const headIndex = this.indexes[this.indexes.length - 1]

    const entity = entities.find(
      (entity) => entity.getIndexByCoord() === headIndex
    )

    return !!entity
  }

  private updateIndexes() {
    this.indexes = []

    let node = this.body.end

    while (node) {
      this.indexes.push(node.data.getIndexByCoord())
      node = node.prev as ListNode
    }
  }

  private addTailNode(position?: Vector3) {
    const node = new ListNode(new SnakeNode(this.resolution))

    if (position) {
      node.data.mesh.position.copy(position)
    } else {
      node.data.mesh.position.copy(this.end.data.mesh.position)
    }

    this.body.addNode(node)
    this.scene.add(node.data.mesh)
  }
}

export class SnakeNode extends Entity {
  public candy: Entity | null = null

  constructor(resolution: Vector2) {
    const mesh = new Mesh(NODE_GEOMETRY, NODE_MATERIAL)
    super(mesh, resolution)
  }
}
