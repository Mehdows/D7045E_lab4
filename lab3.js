// Andreas Form och Marcus Asplund

import { Shader } from "./shader.js";
import { ShaderProgram } from "./shaderProgram.js";
import { Camera } from "./camera.js";
import { Cuboid, Sphere, Torus, Cone, Cylinder, Star} from "./mesh.js";
import { GraphicsNode } from "./graphicsNode.js";
import { MonochromeMaterial } from "./material.js";
import { mat4, vec3, vec4 } from './node_modules/gl-matrix/esm/index.js';
import { SceneNode } from "./sceneNode.js";


var gl;
var shaderProgram;
var camera;
var world;
var positionVector = vec3.create();
var horizontalRadians = 0;
var verticalRadians = 0;

var robotHat;
var robotHead;
var robot;

var vertexShaderSource =
"attribute vec4 a_Position;\n" +
"uniform mat4 u_TransformMatrix;\n" +
"uniform mat4 u_CameraMatrix;\n" +
"uniform mat4 u_PerspectiveMatrix;\n" +
"varying float v_Depth;\n" +
"void main()\n" +
"{\n" +
"  gl_Position = u_PerspectiveMatrix * u_CameraMatrix * u_TransformMatrix * a_Position;\n" +
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
  let boardMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,-2,10,1);
  let board = new SceneNode(boardMatrix);
  let wallsMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1,0,1);
  let walls = new SceneNode(wallsMatrix);
  let robotMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 2,1,0,1);
  robot = new SceneNode(robotMatrix);
  
  

  world.addChild(board);
  board.addChildren(
    getChessboard());
  board.addChild(walls);
  walls.addChildren(getWalls());
  board.addChild(robot);
  robot.addChild(getRobot());
  requestAnimationFrame(doFrame);
}


function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  shaderProgram.activate();
  camera.activate();
  shakeHead();
  growStar();
  backAndForwardMoving();
  world.computeWorldTransform(world.localtransform);
  world.draw();
}


function doFrame(time) {
    render();
    slowDown(time);
    requestAnimationFrame(doFrame);
}


let lastTime = 0;
let dt = 0;

function slowDown(time) {
  dt = time - lastTime ;
  lastTime = time;
  let dpositionVector = vec3.create()
  vec3.scale(dpositionVector, positionVector, dt);
  let dHorizontalRadians = horizontalRadians*dt;
  let dVerticalRadians = verticalRadians*dt;
  //slow down
  let friction = 0.965;
  vec3.scale(positionVector, positionVector, friction);
  horizontalRadians *= friction;
  verticalRadians *= friction;
  camera.update(dpositionVector, dHorizontalRadians, dVerticalRadians);
}


window.addEventListener('keydown', function(event) {
    
    if (event.key == 'w' && positionVector[2] < 0.005) {
      positionVector[2] += 0.001;
    } else if (event.key == 's' && positionVector[2] > -0.005) {
      positionVector[2] -= 0.001;
    } else if (event.key == 'a' && positionVector[0] < 0.005) {
      positionVector[0] += 0.001;
    } else if (event.key == 'd' && positionVector[0] > -0.005) {
      positionVector[0] -= 0.001;
    } else if (event.key == 'e' && positionVector[1] < 0.005) {
      positionVector[1] += 0.001;
    } else if (event.key == 'c' && positionVector[1] > -0.005) {
      positionVector[1] -= 0.001;
    } else if (event.key == 'ArrowUp' && horizontalRadians < 0.0005*Math.PI){
      horizontalRadians -= 0.0001*Math.PI;
    } else if (event.key == 'ArrowDown' && horizontalRadians > -0.0005*Math.PI){
      horizontalRadians += 0.0001*Math.PI;
    } else if (event.key == 'ArrowRight' && verticalRadians < 0.0005*Math.PI){
      verticalRadians += 0.0001*Math.PI;
    } else if (event.key == 'ArrowLeft' && verticalRadians > -0.0005*Math.PI){
      verticalRadians -= 0.0001*Math.PI;
    } 
});

let scaled = 1.0;
let scalefactor = 1.01;
function growStar() {
  let growMat = mat4.create();
  if (scaled <= 1.0) {
    scalefactor = 1.01;
  } else if (scaled > 2) {
    scalefactor = 0.99;
  }
  scaled *= scalefactor;
  mat4.scale(growMat, growMat, vec3.fromValues(scalefactor, scalefactor, scalefactor));
  robotHat.update(growMat);
}

let angle = 0;
let angleAdd = 0.01*Math.PI;
function shakeHead(){

  if (angle > Math.PI/2-Math.PI/16) {
    angleAdd = -0.01*Math.PI;
  } else if (angle < -Math.PI/2+Math.PI/16) {
    angleAdd = 0.01*Math.PI;
  }
  angle += angleAdd;
  let rotateMat = mat4.create();
  mat4.rotate(rotateMat, rotateMat, angleAdd, vec3.fromValues(0,1,0));
  robotHead.update(rotateMat);
}

let movefactor = 0.01;
let moved = 0;
  
function backAndForwardMoving(){
  if (moved >= 0.2) {
    movefactor = -0.01;
  }
  if (moved <= -0.2) {
    movefactor = 0.01;
  }    
  moved += movefactor;
  let moveMat = mat4.create();
  mat4.translate(moveMat, moveMat, vec3.fromValues(movefactor,0,0));
  robot.update(moveMat);
}

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

function getWalls(){
  let cubeOuterWall = new Cuboid(.1, .5, 4, gl, shaderProgram);
  let cubeInnerWall = new Cuboid(.1, .5, 1.5, gl, shaderProgram); 
  let cubeInnerWall2 = new Cuboid(.1, .5, 2, gl, shaderProgram);
  let cubeInnerWall3 = new Cuboid(.1, .5, 3.5, gl, shaderProgram);
  let redBox = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(1,0,0,1));
  let nodes = [];
  let wallOuterLeft = new GraphicsNode(gl, cubeOuterWall, redBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 4,0,0,1));
  let wallOuterRight = new GraphicsNode(gl, cubeOuterWall, redBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, -4,0,0,1));
  let wallOuterBackLeft = new GraphicsNode(gl, cubeInnerWall, redBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 2.5,0,4,1));
  let wallOuterBackRight = new GraphicsNode(gl, cubeInnerWall2, redBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, -2,0,4,1));
  let wallOuterFrontRight = new GraphicsNode(gl, cubeInnerWall, redBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, -2.5,0,-4,1));
  let wallOuterFrontLeft = new GraphicsNode(gl, cubeInnerWall2, redBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 2,0,-4,1));
  let WallInner1 = new GraphicsNode(gl, cubeInnerWall, redBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 0,0,-2.5,1));
  let WallInner2 = new GraphicsNode(gl, cubeInnerWall, redBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, -1.5,0,-1,1));
  let WallInner3 = new GraphicsNode(gl, cubeInnerWall3, redBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, -0.5,0,1,1));


  let rotateMat = mat4.create();
  mat4.rotate(rotateMat, rotateMat, Math.PI/2, vec3.fromValues(0,1,0));

  wallOuterFrontLeft.update(rotateMat);
  wallOuterFrontRight.update(rotateMat);
  wallOuterBackLeft.update(rotateMat);
  wallOuterBackRight.update(rotateMat);
  WallInner2.update(rotateMat);
  WallInner3.update(rotateMat);

  nodes.push(wallOuterBackLeft);
  nodes.push(wallOuterBackRight);
  nodes.push(wallOuterLeft);
  nodes.push(wallOuterRight);
  nodes.push(wallOuterFrontLeft);
  nodes.push(wallOuterFrontRight);
  nodes.push(WallInner1);
  nodes.push(WallInner2);
  nodes.push(WallInner3);

  return nodes;
}

function getRobot(){
  let cube = new Cuboid(.4, .5, .3, gl, shaderProgram);
  let cone = new Cone(0.5, 0.5, 16, false, gl, shaderProgram);
  let star = new Star(5, 0.4, 0.2, 0.1, gl, shaderProgram);
  let greyBox = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(0.5,1,0.5,1));
  let yellow = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(1,1,0,1));
  let robotBody = new GraphicsNode(gl, cube, greyBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 0,0,0,1));
  robotHead = new GraphicsNode(gl, cone, greyBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 0,1,0,1));
  robotHat = new GraphicsNode(gl, star, yellow, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 0,1,0,1));

  robotBody.addChild(robotHead);
  robotHead.addChild(robotHat);

  return robotBody;
}

window.onload = init;