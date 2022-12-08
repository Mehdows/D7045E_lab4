// Andreas Form och Marcus Asplund

class Mesh {

    constructor(vertices, indices, gl, shaderProgram) {
        
        this.vertices = vertices;
        this.indices = indices;

        // Create a vertex array object
        let vertexArr = gl.createVertexArray();
        let vertexBuff = gl.createBuffer();
        let indexBuff = gl.createBuffer();

        gl.bindVertexArray(vertexArr);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);

        let verticeArray = new Float32Array(this.vertices);
        let indiceArray = new Uint8Array(this.indices);

        gl.bufferData(gl.ARRAY_BUFFER, verticeArray, gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indiceArray, gl.STATIC_DRAW);
        
        let prog = shaderProgram.getProgram();
        let pos = gl.getAttribLocation(prog, "a_Position");

        gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(pos);
    }

    getIndices(){
        return this.indices;
    }

    getVertices(){
        return this.vertices;
    }
}

class Cuboid extends Mesh{
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
}


class Star extends Mesh{
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