// Andreas Form och Marcus Asplund

import{uvCone, uvCylinder, uvTorus, uvSphere} from "./basic-object-models-IFS.js";

import { mat4, vec3, vec4 } from './node_modules/gl-matrix/esm/index.js';

class Mesh {
    constructor(vertices, indices, normals, gl, shaderProgram) {
        
        this.vertices = vertices;
        this.indices = indices;
        this.normals = normals;

        
        let verticeArray = new Float32Array(this.vertices);
        let indiceArray = new Uint8Array(this.indices);
        let normalArray = new Float32Array(this.normals);

        let prog = shaderProgram.getProgram();
        // Create a vertex array object
        
        this.vertexArr = gl.createVertexArray();

        this.vertexBuff = gl.createBuffer();
        this.indexBuff = gl.createBuffer();
        this.normalBuff = gl.createBuffer();

        gl.bindVertexArray(this.vertexArr);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indiceArray, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuff);
        gl.bufferData(gl.ARRAY_BUFFER, verticeArray, gl.STATIC_DRAW);
        
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuff);
        gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);
        
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

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

        let normal = [
            0, 0, 1,
            0, 0, -1
        ];

        for (let i = 0; i < spikes; i++) {
            let angle =  Math.PI/2 + i/spikes * 2 * Math.PI;
            let x = Math.cos(angle) * outerDistance;
            let y = Math.sin(angle) * outerDistance;
            vertices.push(x, y, 0);
            normal.push(Math.cos(angle),Math.sin(angle),0);
        }
        
        for (let i = 0; i < spikes; i++) {
            let angle = i/spikes * 2 * Math.PI + Math.PI/2 + Math.PI/spikes;
            let x = Math.cos(angle) * innerDistance;
            let y = Math.sin(angle) * innerDistance;
            vertices.push(x, y, 0);
            normal.push(Math.cos(angle),Math.sin(angle),0);
        }

        let indices = [];
        for (let i = 0; i < spikes; i++) {
            let last = spikes+2+(i+spikes-1)%spikes;
            indices.push(0, i+2, i+spikes+2);
            indices.push(0, i+2, last);
            indices.push(1, i+2, i+spikes+2);
            indices.push(1, i+2, last);
        }

        super(vertices, indices, normal, gl, shaderProgram);
    }
}


export class Cube extends Mesh{
    constructor(width, height, depth, widthSegments, heightSegments, depthSegments, gl, shaderProgram){
       
        widthSegments = Math.floor( widthSegments );
        heightSegments = Math.floor( heightSegments );
        depthSegments = Math.floor( depthSegments );

        // buffers

        let indices = [];
        let vertices = [];
        let normals = [];
        let uvs = [];

        // helper variables

        let numberOfVertices = 0;
        let groupStart = 0;

        // build each side of the box geometry

        buildPlane( 'z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0 ); // px
        buildPlane( 'z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1 ); // nx
        buildPlane( 'x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2 ); // py
        buildPlane( 'x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, 3 ); // ny
        buildPlane( 'x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4 ); // pz
        buildPlane( 'x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5 ); // nz

        // build geometry

        function buildPlane( u, v, w, udir, vdir, width, height, depth, gridX, gridY ) {

            const segmentWidth = width / gridX;
            const segmentHeight = height / gridY;

            const widthHalf = width / 2;
            const heightHalf = height / 2;
            const depthHalf = depth / 2;

            const gridX1 = gridX + 1;
            const gridY1 = gridY + 1;

            let vertexCounter = 0;
            let groupCount = 0;

            const vector = []

            // generate vertices, normals and uvs

            for ( let iy = 0; iy < gridY1; iy ++ ) {

                const y = iy * segmentHeight - heightHalf;

                for ( let ix = 0; ix < gridX1; ix ++ ) {

                    const x = ix * segmentWidth - widthHalf;

                    // set values to correct vector component

                    vector[ u ] = x * udir;
                    vector[ v ] = y * vdir;
                    vector[ w ] = depthHalf;

                    // now apply vector to vertex buffer

                    vertices.push( vector.x, vector.y, vector.z );

                    // set values to correct vector component

                    vector[ u ] = 0;
                    vector[ v ] = 0;
                    vector[ w ] = depth > 0 ? 1 : - 1;

                    // now apply vector to normal buffer

                    normals.push( vector.x, vector.y, vector.z );

                    // uvs

                    uvs.push( ix / gridX );
                    uvs.push( 1 - ( iy / gridY ) );

                    // counters

                    vertexCounter += 1;

                }

            }

            // indices

            // 1. you need three indices to draw a single face
            // 2. a single segment consists of two faces
            // 3. so we need to generate six (2*3) indices per segment

            for ( let iy = 0; iy < gridY; iy ++ ) {

                for ( let ix = 0; ix < gridX; ix ++ ) {

                    const a = numberOfVertices + ix + gridX1 * iy;
                    const b = numberOfVertices + ix + gridX1 * ( iy + 1 );
                    const c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
                    const d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;

                    // faces

                    indices.push( a, b, d );
                    indices.push( b, c, d );

                    // increase counter

                    groupCount += 6;

                }

            }


            // calculate new start value for groups

            groupStart += groupCount;

            // update total number of vertices

            numberOfVertices += vertexCounter;

        }
        //make all lists into Float32Arrays
        vertices = new Float32Array(vertices);
        indices = new Uint16Array(indices);
        normals = new Float32Array(normals);
        uvs = new Float32Array(uvs);

        super(vertices, indices, normals, gl, shaderProgram);

    }
}


export class Ring extends Mesh{
    constructor(innerRadius, outerRadius, slices, gl, shaderProgram){
        let list = uvRing(innerRadius, outerRadius, slices);
        let vertices = list.vertexPositions;
        let indices = list.indices;
        let normals = list.vertexNormals;
        super(vertices, indices, normals, gl ,shaderProgram);
    }
}


export class Sphere extends Mesh{
    constructor(radius, slices, stacks, gl, shaderProgram){
        let list = uvSphere(radius, slices, stacks);
        let vertices = list.vertexPositions;
        let indices = list.indices;
        let normals = list.vertexNormals;
        super(vertices, indices, normals, gl ,shaderProgram);
    }
}

export class Torus extends Mesh{
    constructor(outerRadius, innerRadius, slices, stacks, gl, shaderProgram){
        let list = uvTorus(outerRadius, innerRadius, slices, stacks);
        let vertices = list.vertexPositions;
        let indices = list.indices;
        let normals = list.vertexNormals;
        super(vertices, indices, normals, gl ,shaderProgram);
    }
}

export class Cylinder extends Mesh{
    constructor(radius, height, slices, noTop, noBottom, gl, shaderProgram){
        let list = uvCylinder(radius, height, slices, noTop, noBottom);
        let vertices = list.vertexPositions;
        let indices = list.indices;
        let normals = list.vertexNormals;
        super(vertices, indices, normals, gl ,shaderProgram);
    }
}

export class Cone extends Mesh{
    constructor(radius, height, slices, noBottom, gl, shaderProgram){
        let list = uvCone(radius, height, slices, noBottom);
        let vertices = list.vertexPositions;
        let indices = list.indices;
        let normals = list.vertexNormals;
        super(vertices, indices, normals, gl ,shaderProgram);
    }
}
