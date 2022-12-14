// Andreas Form och Marcus Asplund

import { Shader } from "./shader.js";
import { ShaderProgram } from "./shaderProgram.js";
import { Camera } from "./camera.js";
import {  Sphere, Torus, Cone, Cylinder, Star, Cube} from "./mesh.js";
import { GraphicsNode } from "./graphicsNode.js";
import { LightMaterial, MonochromeMaterial } from "./material.js";
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

var vertexShaderSource =`
attribute vec3 a_Position;
attribute vec3 a_Normal;
uniform mat4 u_TransformMatrix;
uniform mat4 u_CameraMatrix;
uniform mat4 u_PerspectiveMatrix;
varying vec3 v_Normal;
varying vec3 v_eyeCoords;
void main()
{
  vec4 coords = vec4(a_Position, 1.0);
  vec4 eyeCoords = u_TransformMatrix * coords;
  gl_Position = u_PerspectiveMatrix * u_CameraMatrix * eyeCoords;
  v_Normal = normalize(a_Normal);
  v_eyeCoords = eyeCoords.xyz/eyeCoords.w;
}`;

var  fragmentShaderSource =` 
precision mediump float;

uniform vec4 u_DiffuseColor;
uniform vec3 u_SpecularColor;
uniform vec3 u_EmissiveColor;
uniform float u_SpecularExponent;
uniform mat3 u_NormalMatrix;

uniform vec4 u_LightPosition;
uniform vec3 u_LightColor;
uniform float u_Attenuation;

varying vec3 v_Normal;
varying vec3 v_eyeCoords;

vec3 lightningEquation(vec3 N, vec3 V) {
  vec3 L, R;
  float attenuationFactor = 1.0;
  if ( u_LightPosition.w == 0.0 ) {
    L = normalize(u_LightPosition.xyz);
  } else {
    L = normalize(u_LightPosition.xyz/u_LightPosition.w - v_eyeCoords);
    if ( u_Attenuation > 0.0 ) {
      float dist = distance(v_eyeCoords, u_LightPosition.xyz/u_LightPosition.w);
      attenuationFactor = 1.0/(1.0 + u_Attenuation * dist);
    }
  }
  if (dot(L,N) <= 0.0) {
    return vec3(0.0);
  }
  vec3 reflection = dot(L,N) * u_LightColor * u_DiffuseColor.rgb;
  R = -reflect(L,N);
  if (dot(R,V) > 0.0) {
    float factor = pow(dot(R,V),u_SpecularExponent);
    reflection += factor * u_LightColor * u_SpecularColor;
  }
  return attenuationFactor * reflection;
}


void main() {
    vec3 normal = normalize(u_NormalMatrix * v_Normal);
    vec3 viewDirection = normalize(-v_eyeCoords);
    vec3 color = u_EmissiveColor;
    if (gl_FrontFacing) {    
      color += lightningEquation(normal, viewDirection);
    } else {
      color += lightningEquation(-normal, viewDirection);
    }
    gl_FragColor = vec4(color,u_DiffuseColor.a);
    
}`;



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

  let worldMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
  world = new SceneNode(worldMatrix);
  let boardMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,-2,10,1);
  let board = new SceneNode(boardMatrix);
  let wallsMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1,0,1);
  let walls = new SceneNode(wallsMatrix);
  let robotMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 2,1,0,1);
  robot = new SceneNode(robotMatrix);
  let sunMat = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,6,0,1);
  let lightmaterial = new LightMaterial(gl, shaderProgram, vec4.fromValues(1,1,1,1), vec3.fromValues(1,1,1), vec3.fromValues(1,1,1), 16, vec3.fromValues(1,1,1), 0.1);
  let sphere = new Sphere( 2, 16, 8, gl, shaderProgram);
  let sun = new GraphicsNode(gl, sphere, lightmaterial, sunMat);
  
  

  world.addChild(board);
  board.addChildren(getChessboard());
  board.addChild(walls);
  walls.addChildren(getWalls());
  board.addChild(robot);
  robot.addChild(getRobot());
  board.addChild(sun);
  board.addChildren(getDetails());
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
  let cube = new Cube(1, 1, 1, 1, 1, 1, gl, shaderProgram);
  let whiteBox = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(1,1,1,1), vec3.fromValues(0.3,0.3,0.3));
  let blackBox = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(0,0,0,1), vec3.fromValues(0,0,0));
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

function getDetails(){
  let nodes = [];
  let cylinder = new Cylinder(0.5, 1, 16, false, false, gl, shaderProgram);
  let torus = new Torus(1, 0.5, 16, 8, gl, shaderProgram);

  let blue = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(0,0,1,1), vec3.fromValues(0,0,0.3));
  let yellow = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(1,1,0,1), vec3.fromValues(0.3,0.3,0));

  let cylinderObjectLeft = new GraphicsNode(gl, cylinder, blue, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0,  2.25,1,3.5,1));
  let torusObjectLeft = new GraphicsNode(gl, torus, yellow, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0,      2.25,1,3.5,1));

  let cylinderObjectRight = new GraphicsNode(gl, cylinder, blue, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0,  -2.25,1,3.5,1));
  let torusObjectRight = new GraphicsNode(gl, torus, yellow, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0,      -2.25,1,3.5,1));

  nodes.push(cylinderObjectLeft);
  nodes.push(torusObjectLeft);

  nodes.push(cylinderObjectRight);
  nodes.push(torusObjectRight);

  return nodes;
}

function getWalls(){
  let cubeOuterWall = new Cube(.2, 1, 8, 1, 1, 1, gl, shaderProgram);
  let cubeInnerWall = new Cube(.2, 1, 3, 1, 1, 1, gl, shaderProgram); 
  let cubeInnerWall2 = new Cube(.2, 1, 4, 1, 1, 1, gl, shaderProgram);
  let cubeInnerWall3 = new Cube(.2, 1, 7, 1, 1, 1, gl, shaderProgram);
  let redBox = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(1,0,0,1), vec3.fromValues(0.1,0,0));
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
  let cube = new Cube(.8, 1, .6, 1, 1, 1, gl, shaderProgram);
  let cone = new Cone(0.5, 0.5, 16, false, gl, shaderProgram);
  let star = new Star(5, 0.4, 0.2, 0.1, gl, shaderProgram);
  let greyBox = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(0.5,1,0.5,1), vec3.fromValues(0,0,0), vec3.fromValues(0.1,0.1,0), 0);
  let yellow = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(1,1,0,1), vec3.fromValues(0.1,0.1,0), vec3.fromValues(0.1,0.1,0), 0);
  let robotBody = new GraphicsNode(gl, cube, greyBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 0,0,0,1));
  robotHead = new GraphicsNode(gl, cone, greyBox, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 0,1,0,1));
  robotHat = new GraphicsNode(gl, star, yellow, mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 0,1,0,1));

  robotBody.addChild(robotHead);
  robotHead.addChild(robotHat);

  return robotBody;
}

window.onload = init;