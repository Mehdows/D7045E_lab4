// Andreas Form och Marcus Asplund

import { Shader } from "./shader.js";
import { ShaderProgram } from "./shaderProgram.js";
import { Camera } from "./camera.js";
import { Cuboid, Sphere, Torus, Cone, Cylinder, Star} from "./mesh.js";
import { GraphicsNode } from "./graphicsNode.js";
import { MonochromeMaterial } from "./material.js";
import { mat4, vec4 } from './node_modules/gl-matrix/esm/index.js';
import { SceneNode } from "./sceneNode.js";

var gl;
var shaderProgram;
var camera;
var world;
var accelerationVector = mat4.create();
var velocityVector = mat4.create()


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

  // Making the different meshes
  let cube = new Cuboid(0.5, 0.5, 0.5, gl, shaderProgram);
  let torus = new Torus(1, 0.5, 16, 8, gl, shaderProgram);
  let sphere = new Sphere(0.5, 16, 8, gl, shaderProgram);
  let cone = new Cone(0.5, 0.5, 16, false, gl, shaderProgram);
  let cylinder = new Cylinder(0.5, 1, 16, true, false, gl, shaderProgram);
  let star = new Star(5, 0.5, 0.25, 0.1, gl, shaderProgram);

  let worldMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
  world = new SceneNode(worldMatrix);
  let boardMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-10,1);
  let board = new SceneNode(boardMatrix);
  world.addChild(board);
  board.addChildren(getChessboard());


  doFrame();
}


function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  shaderProgram.activate();
  camera.activate();
  world.computeWorldTransform(world.localtransform);
  world.draw();
}


function doFrame() {
  const step = function () {
    render();
    requestAnimationFrame(step);
    slowDown();
    world.update(velocityVector);
  };
  step();
}


let time = 0;
let lastTime = 0;

function slowDown() {
  let d = new Date();
  time = d.getTime();
  let dt = time - lastTime;
  lastTime = time;
  let ax = accelerationVector[12];
  let ay = accelerationVector[13];
  let az = accelerationVector[14];
  
  velocityVector[12] += ax * (dt/100.0);
  velocityVector[13] += ay * (dt/100.0);
  velocityVector[14] += az * (dt/100.0);

  accelerationVector[12] *= 0.965;
  accelerationVector[13] *= 0.965;
  accelerationVector[14] *= 0.965;

  console.log("-=- vx: " + velocityVector);
}


window.addEventListener('keydown', function(event) {
  let rotationMatrix = mat4.create();
    if (event.key == 'w') {
      accelerationVector[14] += 0.03;  
    } else if (event.key == 's') {
      accelerationVector[14] -= 0.03;  
    } else if (event.key == 'a') {
      accelerationVector[12] += 0.03;  
    } else if (event.key == 'd') {
      accelerationVector[12] -= 0.03;  
    } else if (event.key == 'e') {
      accelerationVector[13] += 0.03;  
    } else if (event.key == 'c') {
      accelerationVector[13] -= 0.03;
    } else if (event.key == 'ArrowUp'){
      mat4.rotateX(rotationMatrix, rotationMatrix, 0.01);
    } else if (event.key == 'ArrowDown'){
      mat4.rotateX(rotationMatrix, rotationMatrix, -0.01);
    } else if (event.key == 'ArrowRight'){
      mat4.rotateY(rotationMatrix, rotationMatrix, 0.01);
    } else if (event.key == 'ArrowLeft'){
      mat4.rotateY(rotationMatrix, rotationMatrix, -0.01);
    } 
    world.update(rotationMatrix);
});




function getChessboard() {
  let cube = new Cuboid(.5, .5, .5, gl, shaderProgram);
  let whiteBox = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(1,1,1,1));
  let blackBox = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(0,0,0,1));
  let nodes = [];
  let y = 0;
  let white = true;
  for(let i = 0; i < 64; i = i + 1){

    if(i%8 == 0){
      y++;
      white = !white;
    }

    let x = (i%8);
    let mat = mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, y-4.5, 0,x-3.5,1);

    if(white){
      white = false;
      let randomBox = new GraphicsNode(gl, cube, whiteBox, mat);
      nodes.push(randomBox);
    }else{
      white = true;
      let randomBox = new GraphicsNode(gl, cube, blackBox, mat);
      nodes.push(randomBox);
    }
  }
  return nodes;
}

window.onload = init;