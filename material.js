// Andreas Form och Marcus Asplund

import { mat3, mat4} from './node_modules/gl-matrix/esm/index.js';

class material {
    constructor(gl, shaderProgram){
        this.gl = gl;
        this.shaderProgram = shaderProgram;
    }

    applyMaterial(){
        throw new Error("abstract method, must be implemented");
    }
}

export class MonochromeMaterial extends material{
    
    constructor(gl, shaderProgram, color){
        super(gl, shaderProgram);
        this.color = color;
    }

    applyMaterial(transformMatrix){
        let prog = this.shaderProgram.getProgram();
        

        // new
        let diffuseColor = this.gl.getUniformLocation(prog, "material.diffuseColor");
        this.gl.uniform4fv(diffuseColor, this.color);

//        let colorLocation = this.gl.getVaryingLocation(prog, "a_Color");
        let transformLocation = this.gl.getUniformLocation(prog, "u_TransformMatrix");


        let normalMatrix = mat3.create(); 
        mat3.normalFromMat4(normalMatrix, transformMatrix);
        
        let u_normalMatrix =  this.gl.getUniformLocation(prog, "normalMatrix");
        this.gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);

//        this.gl.uniform4fv(colorLocation, this.color);
        this.gl.uniformMatrix4fv(transformLocation, false, transformMatrix);

    }
}
