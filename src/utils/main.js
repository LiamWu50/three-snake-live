import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Snake from "./src/snake.js";
import Candy from "./src/candy.js";
import Rock from "./src/rock.js";
import Tree from "./src/tree.js";

const resolution = new THREE.Vector2(20, 20);

const gridHelper = new THREE.GridHelper(
	resolution.x,
	resolution.y,
	0xffffff,
	0xffffff
)
gridHelper.position.set(resolution.x / 2 - 0.5, -0.49, resolution.y / 2 - 0.5)
gridHelper.material.transparent = true
gridHelper.material.opacity = 0.3

/**
 * Scene
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffac38);

scene.fog = new THREE.Fog(0xffac38, 5, 40);

scene.add(gridHelper)

/**
 * render sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
/**
 * Camera
 */
const fov = 60;
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1);
const finalPosition = new THREE.Vector3(
  -8 + resolution.x / 2,
  resolution.x / 2 + 4,
  resolution.y + 6
)
camera.position.copy(finalPosition)
// camera.lookAt(new THREE.Vector3(0, 2.5, 0));


/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
  antialias: window.devicePixelRatio < 2,
  logarithmicDepthBuffer: true,
});
document.body.appendChild(renderer.domElement);
handleResize();

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

/**
 * OrbitControls
 */
const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.enableZoom = false
// controls.enablePan = false
// controls.enableRotate = false
controls.target.set(resolution.x / 2 - 2, 0, resolution.y / 2 + 2);

/**
 * 平面
 */
const planeGeometry = new THREE.PlaneGeometry(resolution.x * 50, resolution.y * 50);
planeGeometry.rotateX(-Math.PI * 0.5);
const planMaterial = new THREE.MeshStandardMaterial({ color: 0xd68a4c });
const plane = new THREE.Mesh(planeGeometry, planMaterial);
plane.position.x = resolution.x / 2 - 0.5;
plane.position.z = resolution.y / 2 - 0.5;
plane.position.y = -0.5;
scene.add(plane);

plane.receiveShadow = true;

// 创建蛇
const snake = new Snake({ scene, resolution });
console.log(snake);

snake.addEventListener("update", function () {
  if (snake.checkSelfCollision() || snake.checkEntitiesCollision(entities)) {
    snake.die();
    restGame();
  }

  const headIndex = snake.indexes.at(-1);
  const candyIndex = candies.findIndex((candy) => candy.getIndexByCoord() === headIndex);
  console.log(headIndex, candyIndex);

  if (candyIndex >= 0) {
    const candy = candies[candyIndex];
    scene.remove(candy.mesh);
    candies.splice(candyIndex, 1);
    snake.body.head.data.candy = candy;
    addCandy();
  }
});

// 监听键盘事件
window.addEventListener("keydown", function (e) {
  const keyCode = e.code;

  if (keyCode === "Space") {
    !isRunning ? startGame() : stopGame();
  }

  snake.setDirection(keyCode);
});

let isRunning = false;

function startGame() {
  if (!isRunning) {
    isRunning = setInterval(() => {
      snake.update();
    }, 300);
  }
}

function stopGame() {
  clearInterval(isRunning);
  isRunning = null;
}

function restGame() {
  stopGame();

  let candy = candies.pop();
  while (candy) {
    scene.remove(candy.mesh);
    candy = candies.pop();
  }

  let entity = entities.pop();
  while (entity) {
    scene.remove(entity.mesh);
    entity = entities.pop();
  }

  addCandy();
  generateEntities();
}

const candies = [];
const entities = [];

function addCandy() {
  const candy = new Candy(resolution);

  let index = getFreeIndex();

  candy.mesh.position.x = index % resolution.x;
  candy.mesh.position.z = Math.floor(index / resolution.x);

  candies.push(candy);

  scene.add(candy.mesh);
}

addCandy();

function getFreeIndex() {
  let index;

  let candyIndexes = candies.map((candy) => candy.getIndexByCoord());
  let entityIndexes = entities.map((candy) => candy.getIndexByCoord());

  do {
    index = Math.floor(Math.random() * resolution.x * resolution.y);
  } while (snake.indexes.includes(index) || candyIndexes.includes(index) || entityIndexes.includes(index));

  return index;
}

function addEntity() {
  const entity = Math.random() > 0.5 ? new Rock(resolution) : new Tree(resolution);

  let index = getFreeIndex();

  entity.mesh.position.x = index % resolution.x;
  entity.mesh.position.z = Math.floor(index / resolution.x);

  entities.push(entity);

  scene.add(entity.mesh);
}

function generateEntities() {
  for (let i = 0; i < 20; i++) {
    addEntity();
  }
}

generateEntities();

const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);

dirLight.position.set(20, 20, 20);
dirLight.target.position.set(resolution.x, 0, resolution.y);
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.radius = 6;
dirLight.shadow.blurSamples = 20;
dirLight.shadow.camera.top = 30;
dirLight.shadow.camera.bottom = -30;
dirLight.shadow.camera.left = -30;
dirLight.shadow.camera.right = 30;

dirLight.castShadow = true;

scene.add(ambLight, dirLight);

/**
 * frame loop
 */
function tic() {
  controls.update();

  renderer.render(scene, camera);

  requestAnimationFrame(tic);
}

requestAnimationFrame(tic);

window.addEventListener("resize", handleResize);

function handleResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);

  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
}
