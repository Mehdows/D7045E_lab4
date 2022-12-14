// Andreas Form och Marcus Asplund


import { mat3, vec3, vec4 } from './node_modules/gl-matrix/esm/index.js';

class material {
    constructor(gl, shaderProgram, diffuseColor, emissiveColor, specularColor, specularExponent){
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.diffuseColor = diffuseColor;
        this.specularColor = specularColor;
        this.emissiveColor = emissiveColor;
        this.specularExponent = specularExponent;
    }

    applyMaterial(){
        throw new Error("abstract method, must be implemented");
    }
}

export class MonochromeMaterial extends material{
    
    constructor(gl, shaderProgram, diffuseColor, emissiveColor){
        
        let specularExponent = 16;
        let specularColor = vec3.create();
        vec3.scale(specularColor, diffuseColor, 0.1);

        super(gl, shaderProgram, diffuseColor, specularColor, emissiveColor, specularExponent);
    }

    applyMaterial(transformMatrix){

        let prog = this.shaderProgram.getProgram();
        let normalMatrix = mat3.create();

        mat3.normalFromMat4(normalMatrix, transformMatrix);
        
        let transformLocation =         this.gl.getUniformLocation(prog, "u_TransformMatrix");
        let normalLocation =            this.gl.getUniformLocation(prog, "u_NormalMatrix");
        let colorLocation =             this.gl.getUniformLocation(prog, "u_DiffuseColor");
        let specularColorLocation =     this.gl.getUniformLocation(prog, "u_SpecularColor");
        let emissiveColorLocation =     this.gl.getUniformLocation(prog, "u_EmissiveColor");
        let specularExponentLocation =  this.gl.getUniformLocation(prog, "u_SpecularExponent");

        this.gl.uniformMatrix4fv(transformLocation, false, transformMatrix);
        this.gl.uniformMatrix3fv(normalLocation, false, normalMatrix);

        this.gl.uniform4fv(colorLocation, this.diffuseColor);
        this.gl.uniform3fv(specularColorLocation, this.specularColor);
        this.gl.uniform3fv(emissiveColorLocation, this.emissiveColor);
        this.gl.uniform1f(specularExponentLocation, this.specularExponent);

    }

}

export class LightMaterial extends material{

    constructor(gl, shaderProgram, diffuseColor, emissiveColor, lightColor){

        let specularExponent = 16;
        let specularColor = vec3.fromValues(1, 1, 0);
        
        super(gl, shaderProgram, diffuseColor, specularColor, emissiveColor, specularExponent);

        this.lightColor = lightColor;
        this.lightPosition = vec4.fromValues(0, 4, 10, 1);
        this.attenuation = 0.1;
        
    }

    applyMaterial(transformMatrix){
        
        

        let prog = this.shaderProgram.getProgram();
        let normalMatrix = mat3.create();

        mat3.normalFromMat4(normalMatrix, transformMatrix);
        
        let transformLocation =         this.gl.getUniformLocation(prog, "u_TransformMatrix");
        let normalLocation =            this.gl.getUniformLocation(prog, "u_NormalMatrix");
        let colorLocation =             this.gl.getUniformLocation(prog, "u_DiffuseColor");
        let specularColorLocation =     this.gl.getUniformLocation(prog, "u_SpecularColor");
        let emissiveColorLocation =     this.gl.getUniformLocation(prog, "u_EmissiveColor");
        let specularExponentLocation =  this.gl.getUniformLocation(prog, "u_SpecularExponent");
        let lightPositionLocation =     this.gl.getUniformLocation(prog, "u_LightPosition");
        let lightColorLocation =        this.gl.getUniformLocation(prog, "u_LightColor");
        let attenuationLocation =       this.gl.getUniformLocation(prog, "u_Attenuation");

        this.gl.uniformMatrix4fv(transformLocation, false, transformMatrix);
        this.gl.uniformMatrix3fv(normalLocation, false, normalMatrix);

        this.gl.uniform4fv(colorLocation, this.diffuseColor);
        this.gl.uniform3fv(specularColorLocation, this.specularColor);
        this.gl.uniform3fv(emissiveColorLocation, this.emissiveColor);
        this.gl.uniform1f(specularExponentLocation, this.specularExponent);


        this.gl.uniform4fv(lightPositionLocation, this.lightPosition);
        this.gl.uniform3fv(lightColorLocation, this.lightColor);
        this.gl.uniform1f(attenuationLocation, this.attenuation);

    }
}

