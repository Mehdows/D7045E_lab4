// Andreas Form och Marcus Asplund

import { mat4, vec3 } from './node_modules/gl-matrix/esm/index.js';

export class SceneNode {
    constructor(transform) {
        this.children = [];
        this.transform = transform;
    }

    addChild(node) {
        node.update(this.transform);
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

    getPosition() {
        let pos = vec3.create();
        console.log(pos);
        mat4.getTranslation(pos, this.transform);
        
        return pos;
    }

    draw() {
        for (let child of this.children) {
            child.draw(this.transform);
        }
    }

    update(transform) {
        mat4.multiply(this.transform, this.transform, transform);
        for (let child of this.children) {
            child.update(transform);
        }
    }
}

