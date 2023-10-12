import { MeshNormalMaterial, Mesh, IcosahedronGeometry } from "three";
import Entity from "./entity.js";

const GEOMETRY = new IcosahedronGeometry(0.5);
const MATERIAL = new MeshNormalMaterial();

export default class Rock extends Entity {
  constructor(resolution) {
    const mesh = new Mesh(GEOMETRY, MATERIAL);
    super(mesh, resolution);
  }
}
