// Andreas Form och Marcus Asplund

import { mat4, vec3 } from './node_modules/gl-matrix/esm/index.js';

export class SceneNode {
    constructor(transform) {
        this.children = [];
        this.localtransform = transform;
        this.worldtransform = mat4.create();
    }

    addChild(node) {
        this.children.push(node);
    }

    addChildren(nodes) {
        for (let node of nodes) {
            this.addChild(node);
        }
    }

    getChildren() {
        return this.children;
    }

    draw() {
        for (let child of this.children) {
            child.draw();
        }
    }

    update(transform) {
        mat4.multiply(this.localtransform, this.localtransform, transform);
    }
    
    computeWorldTransform(parentTransform) {
        mat4.multiply(this.worldtransform, parentTransform, this.localtransform);
        for (let child of this.getChildren()) {
            child.computeWorldTransform(this.worldtransform);
        }
    }
}

