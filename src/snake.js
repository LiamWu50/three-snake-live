import LinkedList from "./linked-list";
import { Mesh, MeshNormalMaterial, EventDispatcher } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import ListNode from "./list-node";
import * as THREE from "three";
import Entity from "./entity.js";

const NODE_GEOMETRY = new RoundedBoxGeometry(0.9, 0.9, 0.9, 5, 0.1);
const NODE_MATERIAL = new MeshNormalMaterial();

const UP = new THREE.Vector3(0, 0, -1);
const DOWN = new THREE.Vector3(0, 0, 1);
const LEFT = new THREE.Vector3(-1, 0, 0);
const RIGHT = new THREE.Vector3(1, 0, 0);

export default class Snake extends EventDispatcher {
  direction = LEFT;
  indexes = [];

  constructor({ scene, resolution = new Vector2(10, 10) }) {
    // 创建一个头部
    super();

    this.scene = scene;
    this.resolution = resolution;

    this.init();
  }

  get head() {
    return this.body.head;
  }

  get end() {
    return this.body.end;
  }

  init() {
    this.direction = UP
    const head = new ListNode(new SnakeNode(this.resolution));
    head.data.mesh.position.x = this.resolution.x / 2;
    head.data.mesh.position.z = this.resolution.y / 2;
    this.body = new LinkedList(head);

    this.indexes.push(this.head.data.getIndexByCoord());
    for (let i = 0; i < 3; i++) {
      const position = this.end.data.mesh.position.clone();
      position.sub(this.direction);
      this.addTailNode();
      this.end.data.mesh.position.copy(position);

      this.indexes.push(this.end.data.getIndexByCoord());
    }

    this.scene.add(head.data.mesh);
  }

  setDirection(keyCode) {
    switch (keyCode) {
      case "ArrowUp":
        this.newDirection = UP;
        break;
      case "ArrowDown":
        this.newDirection = DOWN;
        break;
      case "ArrowLeft":
        this.newDirection = LEFT;
        break;
      case "ArrowRight":
        this.newDirection = RIGHT;
        break;
    }

    if (this.newDirection) {
      const dot = this.direction.dot(this.newDirection);
      if (dot !== 0) {
        this.newDirection = null;
      }
    }
  }

  update() {
    if (this.newDirection) {
      this.direction = this.newDirection;
      this.newDirection = null;
    }

    let currentNode = this.end;

    if (this.end.data.candy) {
      this.end.data.candy = null;
      this.addTailNode();
    }

    while (currentNode.prev) {
      const candy = currentNode.prev.data.candy;
      if (candy) {
        currentNode.data.candy = candy;
        currentNode.prev.data.candy = null;
      }

      const position = currentNode.prev.data.mesh.position;
      currentNode.data.mesh.position.copy(position);
      currentNode = currentNode.prev;
    }

    const headPos = currentNode.data.mesh.position;
    headPos.add(this.direction);

    if (headPos.z < 0) {
      headPos.z = this.resolution.y - 1;
    } else if (headPos.z > this.resolution.y - 1) {
      headPos.z = 0;
    }

    if (headPos.x < 0) {
      headPos.x = this.resolution.x - 1;
    } else if (headPos.x > this.resolution.x - 1) {
      headPos.x = 0;
    }

    this.updateIndexes();
    this.dispatchEvent({ type: "update" });
  }

  die() {
    let node = this.body.head;

    do {
      this.scene.remove(node.data.mesh);
      node = node.next;
    } while (node);

    this.init();
    this.addEventListener({ type: "die" });
  }

  checkSelfCollision() {
    const headIndex = this.indexes.pop();
    const collide = this.indexes.includes(headIndex);
    this.indexes.push(headIndex);

    return collide;
  }

  checkEntitiesCollision(entities) {
    const headIndex = this.indexes.at(-1);

    const entity = entities.find((entity) => entity.getIndexByCoord() === headIndex);

    return !!entity; 
  }

  updateIndexes() {
    this.indexes = [];

    let node = this.body.end;

    while (node) {
      this.indexes.push(node.data.getIndexByCoord());
      node = node.prev;
    }
  }

  addTailNode(position) {
    const node = new ListNode(new SnakeNode(this.resolution));

    if (position) {
      node.data.mesh.position.copy(position);
    } else {
      node.data.mesh.position.copy(this.end.data.mesh.position);
    }

    this.body.addNode(node);
    this.scene.add(node.data.mesh);
  }
}

class SnakeNode extends Entity {
  constructor(resolution) {
    const mesh = new Mesh(NODE_GEOMETRY, NODE_MATERIAL);
    super(mesh, resolution);
  }
}
