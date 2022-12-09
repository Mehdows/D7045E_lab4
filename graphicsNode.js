// Andreas Form och Marcus Asplund

import { mat4 } from './node_modules/gl-matrix/esm/index.js';

export class GraphicsNode {

    constructor(gl, mesh, material, transform) {
        this.gl = gl;
        this.mesh = mesh;
        this.material = material;
        this.transform = transform;
    }

    draw() {
        this.gl.bindVertexArray(this.mesh.getVertexArrObject());
        this.material.applyMaterial(this.transform);
        let indicesLength = this.mesh.getIndices().length;
        this.gl.drawElements(this.gl.TRIANGLES, indicesLength, this.gl.UNSIGNED_BYTE, 0);
    }

    update(transform) {
        mat4.multiply(this.transform, this.transform, transform);
    }

}

