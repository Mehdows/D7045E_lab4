// Andreas Form och Marcus Asplund

import { mat4, vec3, vec4 } from './node_modules/gl-matrix/esm/index.js';
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

export class Light extends GraphicsNode{

    constructor(gl, shaderProgram, mesh, material, transform) {
        super(gl, mesh, material, transform);
        this.shaderProgram = shaderProgram; 
    }

    applyLight() {

        let prog = this.shaderProgram.getProgram();

        
        let lightColor = this.gl.getUniformLocation(prog, "light.color");
        let lightAttenuation = this.gl.getUniformLocation(prog, "light.attenuation");
        let lightPosition = this.gl.getUniformLocation(prog, "light.position");
        
        
        let transformedPosition = vec4.create();
        vec4.transformMat4(transformedPosition, vec4.fromValues(0,0,0,1), this.localtransform);
        this.gl.uniform4fv(lightPosition, transformedPosition);

        // uniform locations for the light properties:
        this.gl.uniform3f( lightColor, 1, 1, 0.8 );
        this.gl.uniform1f( lightAttenuation, 2 );


        // uniform locations for the material properties:
        let MaterialProperties = {
            specularColor: this.gl.getUniformLocation(prog, "material.specularColor"),
            emissiveColor: this.gl.getUniformLocation(prog, "material.emissiveColor"),
            specularExponent: this.gl.getUniformLocation(prog, "material.specularExponent")
        };

        this.gl.uniform1f( MaterialProperties.specularColor, vec3.fromValues(1, 1, 1));  // specular properties don't change
        this.gl.uniform1f( MaterialProperties.specularExponent, 16 );
        this.gl.uniform1f( MaterialProperties.emissiveColor, vec3.fromValues(0.5, 0.5, 0));  // default

    }
}