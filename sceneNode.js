
import { mat4 } from './node_modules/gl-matrix/esm/index.js';
import { GraphicsNode } from './graphicsNode.js';

export class SceneNode {
    constructor(transform) {
        this.children = [];
        this.transform = transform;
    }

    addChild(node) {
        node.update(this.transform);
        this.children.push(node);
    }

    draw() {
        for (let child of this.children) {
            child.draw(this.transform);
        }
    }

    update(transform) {
        mat4.multiply(this.transform, this.transform, transform);
        for (let child of this.children) {
            child.update(this.transform);
        }
    }
}

