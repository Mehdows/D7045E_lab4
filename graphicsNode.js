// Andreas Form och Marcus Asplund

import { mat4 } from './node_modules/gl-matrix/esm/index.js';
import { SceneNode } from './sceneNode.js';

export class GraphicsNode extends SceneNode{

    constructor(gl, mesh, material, transform) {
        super(transform);
        this.gl = gl;
        this.mesh = mesh;
        this.material = material;
    }

    draw() {
        this.gl.bindVertexArray(this.mesh.getVertexArrObject());
        this.material.applyMaterial(this.worldtransform);
        let indicesLength = this.mesh.getIndices().length;
        this.gl.drawElements(this.gl.TRIANGLES, indicesLength, this.gl.UNSIGNED_BYTE, 0);
        for (let child of this.children) {
            child.draw();
        }
    }
}

