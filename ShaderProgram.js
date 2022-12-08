// Andreas Form och Marcus Asplund

export class ShaderProgram{
    
    constructor(gl, fragmentShader, vertexShader){
        this.gl = gl;
        this.program = gl.createProgram();
        gl.attachShader(this.program, fragmentShader.getShader());
        gl.attachShader(this.program, vertexShader.getShader());
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(this.program);
            throw new Error(`Could not compile WebGL program. \n\n${info}`);
        }
    }

    activate(){
        this.gl.useProgram(this.program);
    }
    
    getProgram(){
        return this.program;
    }
}