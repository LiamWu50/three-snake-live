import { Scene, Vector2 } from 'three'

import Entity, { Candy, Rock, Tree } from './entity'
import Snake from './snake'

export default class ThreeSnakeManage {
  public scene: Scene
  public resolution: Vector2
  public snake: Snake
  private candies: Candy[] = []
  private entities: Entity[] = []
  private isRunning: null | number = null

  constructor(scene: Scene, resolution: Vector2) {
    this.scene = scene
    this.resolution = resolution
    this.snake = new Snake(scene, resolution)

    this.bindSnakeUpdateEvent()
    this.bindKeyboardEvent()
    this.addCandy()
    this.generateEntities()
  }

  private startGame() {
    if (!this.isRunning) {
      this.isRunning = setInterval(() => {
        this.snake.update()
      }, 300)
    }
  }

  private stopGame() {
    clearInterval(this.isRunning as number)
    this.isRunning = null
  }

  private restGame() {
    this.stopGame()

    let candy = this.candies.pop()
    while (candy) {
      this.scene.remove(candy.mesh)
      candy = this.candies.pop()
    }

    let entity = this.entities.pop()
    while (entity) {
      this.scene.remove(entity.mesh)
      entity = this.entities.pop()
    }

    this.addCandy()
    this.generateEntities()
  }

  private addCandy() {
    const candy = new Candy(this.resolution)

    const index = this.getFreeIndex()

    candy.mesh.position.x = index % this.resolution.x
    candy.mesh.position.z = Math.floor(index / this.resolution.x)

    this.candies.push(candy)

    this.scene.add(candy.mesh)
  }

  private bindSnakeUpdateEvent() {
    this.snake.addEventListener('update', () => {
      if (
        this.snake.checkSelfCollision() ||
        this.snake.checkEntitiesCollision(this.entities)
      ) {
        this.snake.die()
        this.restGame()
      }

      const headIndex = this.snake.indexes.at(-1)
      const candyIndex = this.candies.findIndex(
        (candy) => candy.getIndexByCoord() === headIndex
      )
      console.log(headIndex, candyIndex)

      if (candyIndex >= 0) {
        const candy = this.candies[candyIndex]
        this.scene.remove(candy.mesh)
        this.candies.splice(candyIndex, 1)
        this.snake.body.head.data.candy = candy
        this.addCandy()
      }
    })
  }

  private bindKeyboardEvent() {
    // 监听键盘事件
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const keyCode = e.code

      if (keyCode === 'Space') {
        !this.isRunning ? this.startGame() : this.stopGame()
      }

      this.snake.setDirection(keyCode)
    })
  }

  private getFreeIndex() {
    let index

    const candyIndexes = this.candies.map((candy) => candy.getIndexByCoord())
    const entityIndexes = this.entities.map((candy) => candy.getIndexByCoord())

    do {
      index = Math.floor(Math.random() * this.resolution.x * this.resolution.y)
    } while (
      this.snake.indexes.includes(index) ||
      candyIndexes.includes(index) ||
      entityIndexes.includes(index)
    )

    return index
  }

  private addEntity() {
    const entity =
      Math.random() > 0.5
        ? new Rock(this.resolution)
        : new Tree(this.resolution)

    const index = this.getFreeIndex()

    entity.mesh.position.x = index % this.resolution.x
    entity.mesh.position.z = Math.floor(index / this.resolution.x)

    this.entities.push(entity)

    this.scene.add(entity.mesh)
  }

  private generateEntities() {
    for (let i = 0; i < 20; i++) {
      this.addEntity()
    }
  }
}
