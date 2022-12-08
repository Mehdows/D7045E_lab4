// Andreas Form och Marcus Asplund

import { mat4 } from "./node_modules/gl-matrix/esm/index.js";

export class Camera {
    constructor(gl, shaderProgram, canvas) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;

        let aspect = canvas.width / canvas.height;

        let result = mat4.create();
        mat4.perspective(result, 45, aspect, 1, 100);
        this.projectionMatrix = result;

    }

    activate(){
        let prog = this.shaderProgram.getProgram();
        let cameraMatrixSource = this.gl.getUniformLocation(prog, "u_CameraMatrix");
        
        let cameraMatrix = this.projectionMatrix;

        this.gl.uniformMatrix4fv(cameraMatrixSource, false, cameraMatrix);
    }

    getShaderProgram(){
        return this.shaderProgram;
    }

}