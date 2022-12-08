// Andreas Form och Marcus Asplund

import{uvCone, uvCylinder, uvTorus, uvSphere} from "./basic-object-models-IFS.js";

class Mesh {
    constructor(vertices, indices, gl, shaderProgram) {
        
        this.vertices = vertices;
        this.indices = indices;

        // Create a vertex array object
        
        this.vertexArr = gl.createVertexArray();
        this.vertexBuff = gl.createBuffer();
        this.indexBuff = gl.createBuffer();

        gl.bindVertexArray(this.vertexArr);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuff);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuff);
        

        let verticeArray = new Float32Array(this.vertices);
        let indiceArray = new Uint8Array(this.indices);

        gl.bufferData(gl.ARRAY_BUFFER, verticeArray, gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indiceArray, gl.STATIC_DRAW);
        
        let prog = shaderProgram.getProgram();
        let pos = gl.getAttribLocation(prog, "a_Position");

        gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(pos);
    }

    getVertexArrObject(){
        return this.vertexArr;
    }

    getIndices(){
        return this.indices;
    }

    getVertices(){
        return this.vertices;
    }
}


export class Star extends Mesh{
    constructor(spikes, outerDistance, innerDistance, thickness, gl, shaderProgram){
        if (spikes < 2) throw new Error("spikes must be larger than 2");
        if (outerDistance <= innerDistance) throw new Error("outerDistance must be bigger or the same as innerDistance");

        let vertices = [
            0, 0, thickness/2, 
            0, 0, -thickness/2
        ];
        for (let i = 0; i < spikes; i++) {
            let angle =  Math.PI/2 + i/spikes * 2 * Math.PI;
            let x = Math.cos(angle) * outerDistance;
            let y = Math.sin(angle) * outerDistance;
            vertices.push(x, y, 0);
        }
        
        for (let i = 0; i < spikes; i++) {
            let angle = i/spikes * 2 * Math.PI + Math.PI/2 + Math.PI/spikes;
            let x = Math.cos(angle) * innerDistance;
            let y = Math.sin(angle) * innerDistance;
            vertices.push(x, y, 0);
        }

        let indices = [];
        for (let i = 0; i < spikes; i++) {
            let last = spikes+2+(i+spikes-1)%spikes;
            indices.push(0, i+2, i+spikes+2);
            indices.push(0, i+2, last);
            indices.push(1, i+2, i+spikes+2);
            indices.push(1, i+2, last);
        }
        super(vertices, indices, gl, shaderProgram);
    }

}

export class Cuboid extends Mesh{
    constructor(width, height, depth, gl, shaderProgram){

        let vertices = [
            -width, -height, depth,
            -width, height, depth,
            width, height, depth,
            width, -height, depth,
            -width, -height, -depth,
            -width, height, -depth,
            width, height, -depth,
            width, -height, -depth,
        ];

        let indices = [
            1, 0, 3,
            3, 2, 1,
            2, 3, 7,
            7, 6, 2,
            3, 0, 4,
            4, 7, 3,
            6, 5, 1,
            1, 2, 6,
            4, 5, 6,
            6, 7, 4,
            5, 4, 0,
            0, 1, 5
        ];
        
        super(vertices, indices, gl, shaderProgram);

        this.width = width;
        this.height = height;
        this.depth = depth;
        this.gl = gl;
        this.shaderProgram = shaderProgram;
    }

    // Getters
    getCordinates(){
        let x = -this.width/2;
        let y = -this.height/2;
        let z = -this.depth/2;

        return [x,y,z];
    }

    getWidth(){
        return this.width
    }

    getHeight(){
        return this.height
    }

    getDepth(){
        return this.depth
    }
}

export class Ring extends Mesh{
    constructor(innerRadius, outerRadius, slices, gl, shaderProgram){
        let list = uvRing(innerRadius, outerRadius, slices);
        let vertices = list.vertexPositions;
        let indices = list.indices;
        super(vertices, indices, gl ,shaderProgram);
    }
}


export class Sphere extends Mesh{
    constructor(radius, slices, stacks, gl, shaderProgram){
        let list = uvSphere(radius, slices, stacks);
        let vertices = list.vertexPositions;
        let indices = list.indices;
        super(vertices, indices, gl ,shaderProgram);
    }
}

export class Torus extends Mesh{
    constructor(outerRadius, innerRadius, slices, stacks, gl, shaderProgram){
        let list = uvTorus(outerRadius, innerRadius, slices, stacks);
        let vertices = list.vertexPositions;
        let indices = list.indices;
        super(vertices, indices, gl ,shaderProgram);
    }
}

export class Cylinder extends Mesh{
    constructor(radius, height, slices, noTop, noBottom, gl, shaderProgram){
        let list = uvCylinder(radius, height, slices, noTop, noBottom);
        let vertices = list.vertexPositions;
        let indices = list.indices;
        super(vertices, indices, gl ,shaderProgram);
    }
}

export class Cone extends Mesh{
    constructor(radius, height, slices, noBottom, gl, shaderProgram){
        let list = uvCone(radius, height, slices, noBottom);
        let vertices = list.vertexPositions;
        let indices = list.indices;
        super(vertices, indices, gl ,shaderProgram);
    }
}
