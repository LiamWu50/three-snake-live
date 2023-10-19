import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  VSMShadowMap,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import arrowsImg from '@/assets/images/arrows.png'
import wasdImg from '@/assets/images/wasd.png'
import palettes from '@/common/theme'

const paletteName = localStorage.getItem('paletteName') || 'green'
const palette = palettes[paletteName as keyof typeof palettes]

export default new (class ThreeSceneManage {
  private container!: HTMLDivElement
  public resolution: Vector2
  public scene!: Scene
  private sizes: { width: number; height: number }
  private controls!: OrbitControls
  public camera!: PerspectiveCamera
  private renderer!: WebGLRenderer
  private plane!: Mesh

  constructor() {
    this.resolution = new Vector2(20, 20)
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  /**
   * 初始化
   */
  public init(container: HTMLDivElement) {
    this.container = container

    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.createLight()
    this.createControls()
    this.createGridHelper()
    this.createScenePlane()
    this.createKeyboardHelper()

    this.tic()

    window.addEventListener('resize', this.handleResize.bind(this))
  }

  /**
   * 创建场景
   */
  private createScene() {
    this.scene = new Scene()
    this.scene.background = new Color(palette.fogColor)
    this.scene.fog = new Fog(palette.fogColor, 20, 55)
  }

  /**
   * 创建相机
   */
  private createCamera() {
    const fov = 60
    const aspect = this.sizes.width / this.sizes.height
    this.camera = new PerspectiveCamera(fov, aspect, 0.1)
    const initoalPosition = new Vector3(
      this.resolution.x / 2 + 5,
      4,
      this.resolution.y / 2 + 4
    )
    this.camera.position.copy(initoalPosition)
  }

  /**
   * 创建渲染器
   */
  private createRenderer() {
    const renderer = new WebGLRenderer({
      antialias: window.devicePixelRatio < 2,
      logarithmicDepthBuffer: true
    })

    this.container.appendChild(renderer.domElement)

    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = VSMShadowMap
    this.renderer = renderer
    this.handleResize()
  }

  /**
   * 创建控制器
   */
  private createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.enableZoom = false
    this.controls.enablePan = false
    this.controls.enableRotate = false
    this.controls.target.set(
      this.resolution.x / 2 - 2,
      0,
      this.resolution.y / 2 + 2
    )
  }

  /**
   * 创建网格辅助
   */
  private createGridHelper() {
    const gridHelper = new GridHelper(
      this.resolution.x,
      this.resolution.y,
      0xffffff,
      0xffffff
    )
    gridHelper.position.set(
      this.resolution.x / 2 - 0.5,
      -0.49,
      this.resolution.y / 2 - 0.5
    )
    gridHelper.material.transparent = true
    gridHelper.material.opacity = 0.3
    this.scene.add(gridHelper)
  }

  /**
   * 创建光源
   */
  private createLight() {
    const ambLight = new AmbientLight(0xffffff, 0.6)
    const dirLight = new DirectionalLight(0xffffff, 0.7)

    dirLight.position.set(20, 20, 20)
    dirLight.target.position.set(
      this.resolution.x / 2,
      0,
      this.resolution.y / 2
    )
    dirLight.shadow.mapSize.set(1024, 1024)
    dirLight.shadow.radius = 7
    dirLight.shadow.blurSamples = 20
    dirLight.shadow.camera.top = 30
    dirLight.shadow.camera.bottom = -30
    dirLight.shadow.camera.left = -30
    dirLight.shadow.camera.right = 30

    dirLight.castShadow = true

    this.scene.add(ambLight, dirLight)
  }

  /**
   * 创建场景平面
   */
  private createScenePlane() {
    const resolution = this.resolution
    const planeGeometry = new PlaneGeometry(
      resolution.x * 50,
      resolution.y * 50
    )
    planeGeometry.rotateX(-Math.PI * 0.5)
    const planMaterial = new MeshStandardMaterial({
      color: palette.groundColor
    })
    const plane = new Mesh(planeGeometry, planMaterial)
    plane.position.x = resolution.x / 2 - 0.5
    plane.position.z = resolution.y / 2 - 0.5
    plane.position.y = -0.5
    plane.receiveShadow = true
    this.plane = plane
    this.scene.add(plane)
  }

  /**
   * 创建键盘按钮辅助
   */
  private createKeyboardHelper() {
    const textureLoader = new TextureLoader()
    const wasd = textureLoader.load(wasdImg)
    const arrows = textureLoader.load(arrowsImg)

    const wasdGeometry = new PlaneGeometry(3.5, 2)
    wasdGeometry.rotateX(-Math.PI * 0.5)

    const planeWasd = new Mesh(
      wasdGeometry,
      new MeshStandardMaterial({
        transparent: true,
        map: wasd,
        opacity: 0.5
      })
    )

    const planeArrows = new Mesh(
      wasdGeometry,
      new MeshStandardMaterial({
        transparent: true,
        map: arrows,
        opacity: 0.5
      })
    )

    planeArrows.position.set(8.7, 0, 21)
    planeWasd.position.set(13, 0, 21)

    this.scene.add(planeArrows, planeWasd)
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize() {
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight

    this.camera.aspect = this.sizes.width / this.sizes.height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.sizes.width, this.sizes.height)

    const pixelRatio = Math.min(window.devicePixelRatio, 2)
    this.renderer.setPixelRatio(pixelRatio)
  }

  /**
   * 渲染
   */
  private tic() {
    this.controls.update()

    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(() => {
      this.tic()
    })
  }

  /**
   *  应用调色板
   * @param paletteName
   */
  public applyPalette(paletteName: string) {
    const palette = palettes[paletteName as keyof typeof palettes]
    const { groundColor, fogColor } = palette

    const material = this.plane.material as MeshStandardMaterial
    material.color.set(groundColor)
    this.scene.fog?.color.set(fogColor)
    const background = this.scene.background as Color
    background.set(fogColor)
  }
})()
