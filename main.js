import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Snake from "./src/snake.js";
import Candy from "./src/candy.js";


const resolution = new THREE.Vector2(10, 10);

/**
 * Scene
 */
const scene = new THREE.Scene();

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
camera.position.set(resolution.x / 2 + 4, 8, resolution.y / 2 + 4);
camera.lookAt(new THREE.Vector3(0, 2.5, 0));

/**
 * Show the axes of coordinates system
 */
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
  antialias: window.devicePixelRatio < 2,
  logarithmicDepthBuffer: true,
});
document.body.appendChild(renderer.domElement);
handleResize();

/**
 * OrbitControls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(resolution.x / 2, 2, resolution.y / 2);


/**
 * 平面
 */
const planeGeometry = new THREE.PlaneGeometry(resolution.x, resolution.y, resolution.x, resolution.y);
planeGeometry.rotateX(-Math.PI * 0.5);
const planMaterial = new THREE.MeshNormalMaterial({ wireframe: true });
const plane = new THREE.Mesh(planeGeometry, planMaterial);
plane.position.x = resolution.x / 2 - 0.5;
plane.position.z = resolution.y / 2 - 0.5;
scene.add(plane);

// 创建蛇
const snake = new Snake({ scene, resolution });
console.log(snake);

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
    }, 400);
  }
}

function stopGame() {
  clearInterval(isRunning);
  isRunning = null;
}

function restGame() {}

const candies = [];

function addCandy() {
  const candy = new Candy(resolution);

  let index;
  do {
    index = Math.floor(Math.random() * resolution.x * resolution.y);
  } while (snake.indexes.includes(index));

  candy.mesh.position.x = index % resolution.x;
  candy.mesh.position.z = Math.floor(index / resolution.y);

  candies.push(candy);

  console.log(index, candy.getIndexByCoord());

  scene.add(candy.mesh);
}

addCandy();

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
