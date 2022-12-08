// Andreas Form och Marcus Asplund

export class Shader{

    constructor(gl, shaderType, source){
        this.shader = gl.createShader(shaderType);
        gl.shaderSource(this.shader, source);
        gl.compileShader(this.shader);
    }

    getShader(){
        return this.shader;
    }
}