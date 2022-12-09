// Andreas Form och Marcus Asplund

import { Shader } from "./shader.js";
import { ShaderProgram } from "./shaderProgram.js";
import { Camera } from "./camera.js";
import { Cuboid, Sphere, Torus, Cone, Cylinder, Star} from "./mesh.js";
import { GraphicsNode } from "./graphicsNode.js";
import { MonochromeMaterial } from "./material.js";
import { mat4, vec4 } from './node_modules/gl-matrix/esm/index.js';
import { SceneNode } from "./node.js";

var gl;
var shaderProgram;
var nodes = [];
var camera;
var playableBox;

var vertexShaderSource =
"attribute vec4 a_Position;\n" +
"uniform mat4 u_TransformMatrix;\n" +
"uniform mat4 u_CameraMatrix;\n" +
"varying float v_Depth;\n" +
"void main()\n" +
"{\n" +
"  gl_Position = u_CameraMatrix * u_TransformMatrix * a_Position;\n" +
"  v_Depth = sqrt( pow( gl_Position.x , 2.0) + pow( gl_Position.y , 2.0) + pow(gl_Position.z , 2.0));\n" +
"}\n";

var  fragmentShaderSource = 
"precision mediump float;\n" +
"uniform vec4 u_Color;\n" +
"varying float v_Depth;\n" +
"void main() {\n" +
    "gl_FragColor = vec4(u_Color[0]*1.5/v_Depth, u_Color[1]*1.5/v_Depth, u_Color[2]*1.5/v_Depth, 1);\n" +
"}\n";



function init() {
  // Making the canvas
  let canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.9, 0.2, 0.9, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Making the shaders
  let vertexShader = new Shader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  shaderProgram = new ShaderProgram(gl, vertexShader, fragmentShader);

  // Making the camera
  camera = new Camera(gl, shaderProgram, canvas);

  // Making the mesh
  let width = 0.5;
  let height = 0.5;
  let depth = 0.5;

  // Making invisble node for the scengraph
  let invisible = new Cuboid(0, 0, 0, gl, shaderProgram)

  // Making the different meshes
  let cube = new Cuboid(width, height, depth, gl, shaderProgram);
  let torus = new Torus(1, 0.5, 16, 8, gl, shaderProgram);
  let sphere = new Sphere(0.5, 16, 8, gl, shaderProgram);
  let cone = new Cone(0.5, 0.5, 16, false, gl, shaderProgram);
  let cylinder = new Cylinder(0.5, 1, 16, true, false, gl, shaderProgram);
  let star = new Star(5, 0.5, 0.25, 0.1, gl, shaderProgram);

  // Set colar and different information
  let randomBoxesColor = [0, 1, 0, 1]; // Green
  let playableBoxColor = [1, 0, 1, 1]; // Red
  //let randomBoxesMaterial = new MonochromeMaterial(gl, shaderProgram, randomBoxesColor);
  let playableBoxMaterial = new MonochromeMaterial(gl, shaderProgram, playableBoxColor);
  let playableBoxMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-3,1);

  let worldMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-5,1);
  let world = new SceneNode(worldMatrix)
  let boardMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
  let board = new SceneNode(boardMatrix)




  let blackcol = vec4.fromValues(0, 0, 0, 1);
  let whitecol = vec4.fromValues(1, 1, 1, 1);

  let blackBox = new MonochromeMaterial(gl, shaderProgram, blackcol);
  let whiteBox = new MonochromeMaterial(gl, shaderProgram, whitecol);

  let black = true;
  
  for(let i = 0; i < 8; i += 1) {
    for(let j = 0; j < 8; j += 1) {
      
      let x = 0.5*i-2;
      let y = 0.5*j-2;
      let mat = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0,x,y,-10,1)
      
      let randomBox = new GraphicsNode(gl, cube, black ? blackBox : whiteBox, mat);
      nodes.push(randomBox);
    }
  }

  doFrame();
}


function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  shaderProgram.activate();
  camera.activate();

  for (let node of nodes) {
    node.draw();
  }
  //playableBox.draw();
}


function doFrame() {
  const start = performance.now();
  const step = function () {
    const now = performance.now();
    render();
    requestAnimationFrame(step);
    
  };
  step();
}


window.addEventListener('keydown', function(event) {
    let moveVector = mat4.fromValues(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
    if (event.key == 'w') {
      moveVector[13] += 0.03;  
    } if (event.key == 's') {
      moveVector[13] -= 0.03;  
    } if (event.key == 'a') {
      moveVector[12] -= 0.03;  
    } if (event.key == 'd') {
      moveVector[12] += 0.03;  
    } if (event.key == 'e') {
      moveVector[14] += 0.03; 
    } if (event.key == 'c') {
      moveVector[14] -= 0.03;  
    }

    for(let node of nodes) {
      node.update(moveVector);
    }

    playableBox.update(moveVector);
});

window.onload = init;