// Andreas Form och Marcus Asplund

import { mat4, vec3 } from "./node_modules/gl-matrix/esm/index.js";

export class Camera {
    constructor(gl, shaderProgram, canvas) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;

        let aspect = canvas.width / canvas.height;

        let perspective = mat4.create();
        this.cameraMatrix = mat4.create();
        mat4.perspective(perspective, 45, aspect, 0.1, 100);
        let position = [0, 0, 0];
        let lookAt = [0, 0, 1];
        let up = [0, 1, 0];
        
        mat4.lookAt(this.cameraMatrix, position, lookAt, up)
        mat4.invert(this.cameraMatrix, this.cameraMatrix);
        this.perspectiveMatrix = perspective;
        console.log(this.cameraMatrix);
    }

    activate(){
        let prog = this.shaderProgram.getProgram();
        let perspectiveMatrixSource = this.gl.getUniformLocation(prog, "u_PerspectiveMatrix");
        let cameraMatrixSource = this.gl.getUniformLocation(prog, "u_CameraMatrix");
        
        this.gl.uniformMatrix4fv(perspectiveMatrixSource, false, this.perspectiveMatrix);
        this.gl.uniformMatrix4fv(cameraMatrixSource, false, this.cameraMatrix);
    }

    getShaderProgram(){
        return this.shaderProgram;
    }

    update(moveVector, xRadians, yRadians){
        let matrix = mat4.create();
        mat4.rotate(matrix, matrix, xRadians, [1, 0, 0]);
        mat4.rotate(matrix, matrix, yRadians, [0, 1, 0]);
        mat4.translate(matrix, matrix, moveVector);
        mat4.multiply(this.cameraMatrix, matrix, this.cameraMatrix);
    }


}