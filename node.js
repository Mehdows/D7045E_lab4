export class Node{
    constructor(graphicsNode){
        this.children = [];
        this.graphicsNode = graphicsNode;
    }

    addChild(child){
        this.children.push(child);
    }

    applyTransform(transformMatrix){
        this.graphicsNode.applyMaterial(transformMatrix);
        for(child of this.children){
            child.applyTransform(transformMatrix);
        }
    }

}