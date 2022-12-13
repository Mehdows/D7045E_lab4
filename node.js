import { mat4 } from "gl-matrix/esm";

export class SceneNode{

    constructor(transformMatrix){
        this.children = [];
        this.graphicsNode = null;
        this.transform = transformMatrix;
    }

    addChild(gl, mesh, material, transformMatrix){
        mat4.multiply(this.transform, transformMatrix, this.transform);
        let child = new GraphicsNode(gl, mesh, material, this.transform);
        this.children.push(child);
    }

    addGraphicsNode(graphicsNode){
        this.graphicsNode = graphicsNode;
    }

    applyTransform(transformMatrix){
        mat4.multiply(this.transform, transformMatrix, this.transform);
        
        for(child of this.children){
            child.applyTransform(transformMatrix);
        }
        if(this.graphicsNode == null){
            return;
        }
        this.graphicsNode.applyTransform(transformMatrix);
    }



}