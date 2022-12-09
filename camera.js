// Andreas Form och Marcus Asplund

import { mat4 } from "./node_modules/gl-matrix/esm/index.js";

export class Camera {
    constructor(gl, shaderProgram, canvas) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;

        let aspect = canvas.width / canvas.height;

        let perspective = mat4.create();
        mat4.perspective(perspective, 45, aspect, 0.1, 100);
        this.projectionMatrix = perspective;

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