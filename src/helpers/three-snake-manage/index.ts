import gsap from 'gsap'
import {
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  Vector4
} from 'three'
import fontSrc from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'

import palettes from '@/common/theme'

import Entity, { Candy, Rock, Tree } from './entity'
import Snake from './snake'

const loader = new FontLoader()
const paletteName = localStorage.getItem('paletteName') || 'green'

export default class ThreeSnakeManage {
  public scene: Scene
  private camera!: PerspectiveCamera
  public resolution: Vector2
  public snake: Snake
  private candies: Candy[] = []
  private entities: Entity[] = []
  private score = 0
  private scoreEntity!: Entity
  private font: any
  private isRunning: null | number = null
  private selectedPalette!: (typeof palettes)[keyof typeof palettes]

  constructor(scene: Scene, camera: PerspectiveCamera, resolution: Vector2) {
    this.scene = scene
    this.camera = camera
    this.resolution = resolution
    this.font = null
    this.selectedPalette = palettes[paletteName as keyof typeof palettes]
    this.snake = new Snake(
      scene,
      resolution,
      this.selectedPalette.snakeColor,
      this.selectedPalette.mouthColor
    )

    loader.load(fontSrc, (loadedFont: any) => {
      this.font = loadedFont
      this.printScore()
    })

    this.bindSnakeUpdateEvent()
    this.addCandy()
    this.generateEntities()
    this.createEnvironment()
  }

  public initGame() {
    const finalPosition = new Vector3(
      -8 + this.resolution.x / 2,
      this.resolution.x / 2 + 4,
      this.resolution.y + 6
    )
    gsap.to(this.camera.position, { ...finalPosition, duration: 2 })
    gsap.to(this.scene.fog, { duration: 2, near: 20, far: 55 })

    this.bindKeyboardEvent()
  }

  public applyPalette(paletteName: string) {
    const palette = palettes[paletteName as keyof typeof palettes]

    this.selectedPalette = palette

    if (!palette) return

    const { rockColor, treeColor, candyColor, snakeColor, mouthColor } = palette

    const rock = this.entities.find((entity) => entity instanceof Rock)
    const rockMaterial = rock?.mesh.material as MeshStandardMaterial
    rockMaterial.color.set(rockColor)

    const tree = this.entities.find((entity) => entity instanceof Tree)
    const treeMaterial = tree?.mesh.material as MeshStandardMaterial
    treeMaterial.color.set(treeColor)

    const candiesMaterial = this.candies[0].mesh
      .material as MeshStandardMaterial
    candiesMaterial.color.set(candyColor)

    const headMaterial = this.snake.body.head.data.mesh
      .material as MeshStandardMaterial
    headMaterial.color.set(snakeColor)

    this.snake.mouthColor = mouthColor
    const snakeMaterial = this.snake.mouth.material as MeshStandardMaterial
    snakeMaterial.color.set(mouthColor)
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
    const candy = new Candy(this.resolution, this.selectedPalette.candyColor)

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

      if (candyIndex >= 0) {
        const candy = this.candies[candyIndex]
        this.scene.remove(candy.mesh)
        this.candies.splice(candyIndex, 1)
        this.snake.body.head.data.candy = candy
        this.addCandy()

        this.score += candy.points
        this.printScore()
      }
    })
  }

  private bindKeyboardEvent() {
    window.addEventListener('keyup', (e: KeyboardEvent) => {
      const keyCode = e.code
      this.snake.setDirection(keyCode)

      if (keyCode === 'Space') {
        !this.isRunning ? this.startGame() : this.stopGame()
      } else if (!this.isRunning) {
        this.startGame()
      }
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
        ? new Rock(this.resolution, this.selectedPalette.rockColor)
        : new Tree(this.resolution, this.selectedPalette.treeColor)

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

    this.entities.sort((a, b) => {
      const c = new Vector3(
        this.resolution.x / 2 - 0.5,
        0,
        this.resolution.y / 2 - 0.5
      )

      const distanceA = a.position.clone().sub(c).length()
      const distanceB = b.position.clone().sub(c).length()

      return distanceA - distanceB
    })

    gsap.from(
      this.entities.map((entity) => entity.mesh.scale),
      {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        ease: 'elastic.out(1.5, 0.5)',
        stagger: {
          grid: [20, 20],
          amount: 0.7
        }
      }
    )
  }

  private printScore() {
    if (!this.font) return

    if (!this.score) this.score = 0

    if (this.scoreEntity) {
      this.scene.remove(this.scoreEntity.mesh)
      this.scoreEntity.mesh.geometry.dispose()
      ;(this.scoreEntity.mesh.material as MeshStandardMaterial).dispose()
    }

    const geometry = new TextGeometry(`${this.score}`, {
      font: this.font,
      size: 3,
      height: 1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 5
    })

    geometry.center()
    const { material } = this.snake.body.head.data.mesh
    const mesh = new Mesh(geometry, material)

    mesh.position.x = this.resolution.x / 2 - 0.5
    mesh.position.z = -4
    mesh.position.y = 1.8
    mesh.castShadow = true

    this.scoreEntity = new Entity(mesh, this.resolution, {
      size: 0.8,
      number: 0.3
    })

    this.scoreEntity.in()
    this.scene.add(this.scoreEntity.mesh)
  }

  private createEnvironment() {
    const treeData = [
      new Vector4(-5, 0, 10, 1),
      new Vector4(-6, 0, 15, 1.2),
      new Vector4(-5, 0, 16, 0.8),
      new Vector4(-10, 0, 4, 1.3),
      new Vector4(-5, 0, -3, 2),
      new Vector4(-4, 0, -4, 1.5),
      new Vector4(-2, 0, -15, 1),
      new Vector4(5, 0, -20, 1.2),
      new Vector4(24, 0, -12, 1.2),
      new Vector4(2, 0, -6, 1.2),
      new Vector4(3, 0, -7, 1.8),
      new Vector4(1, 0, -9, 1.0),
      new Vector4(15, 0, -8, 1.8),
      new Vector4(17, 0, -9, 1.1),
      new Vector4(18, 0, -7, 1.3),
      new Vector4(24, 0, -1, 1.3),
      new Vector4(26, 0, 0, 1.8),
      new Vector4(32, 0, 0, 1),
      new Vector4(28, 0, 6, 1.7),
      new Vector4(24, 0, 15, 1.1),
      new Vector4(16, 0, 23, 1.1),
      new Vector4(12, 0, 24, 0.9),
      new Vector4(-13, 0, -13, 0.7),
      new Vector4(35, 0, 10, 0.7)
    ]
    const tree = new Tree(this.resolution)

    treeData.forEach(({ x, y, z, w }) => {
      const clone = tree.mesh.clone()
      clone.position.set(x, y, z)
      clone.scale.setScalar(w)
      this.scene.add(clone)
    })

    const resX = this.resolution.x

    const rockData = [
      [new Vector3(-7, -0.5, 2), new Vector4(2, 8, 3, 2.8)],
      [new Vector3(-3, -0.5, -10), new Vector4(3, 2, 2.5, 1.5)],
      [new Vector3(-5, -0.5, 3), new Vector4(1, 1.5, 2, 0.8)],
      [new Vector3(resX + 5, -0.5, 3), new Vector4(4, 1, 3, 1)],
      [new Vector3(resX + 4, -0.5, 2), new Vector4(2, 2, 1, 1)],
      [new Vector3(resX + 8, -0.5, 16), new Vector4(6, 2, 4, 4)],
      [new Vector3(resX + 6, -0.5, 13), new Vector4(3, 2, 2.5, 3.2)],
      [new Vector3(resX + 5, -0.5, -8), new Vector4(1, 1, 1, 0)],
      [new Vector3(resX + 6, -0.5, -7), new Vector4(2, 4, 1.5, 0.5)],
      [new Vector3(-5, -0.5, 14), new Vector4(1, 3, 2, 0)],
      [new Vector3(-4, -0.5, 15), new Vector4(0.8, 0.6, 0.7, 0)],
      [new Vector3(resX / 2 + 5, -0.5, 25), new Vector4(2.5, 0.8, 4, 2)],
      [new Vector3(resX / 2 + 9, -0.5, 22), new Vector4(1.2, 2, 1.2, 1)],
      [new Vector3(resX / 2 + 8, -0.5, 21.5), new Vector4(0.8, 1, 0.8, 2)]
    ]

    rockData.forEach(([position, vector4]) => {
      const { x, y, z, w } = vector4 as Vector4
      const clone = new Rock(this.resolution).mesh
      clone.position.copy(position as Vector3)
      clone.scale.set(x, y, z)
      clone.rotation.y = w
      this.scene.add(clone)
    })
  }
}
