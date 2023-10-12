import { MeshNormalMaterial, Mesh, IcosahedronGeometry } from "three";
import Entity from "./entity.js";

const GEOMETRY = new IcosahedronGeometry(0.3, 1);
GEOMETRY.scale(1, 6, 1);
const MATERIAL = new MeshNormalMaterial();

export default class Tree extends Entity {
  constructor(resolution) {
    const mesh = new Mesh(GEOMETRY, MATERIAL);
    super(mesh, resolution);
  }
}
