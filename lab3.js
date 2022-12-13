// Andreas Form och Marcus Asplund

import { Shader } from "./shader.js";
import { ShaderProgram } from "./shaderProgram.js";
import { Camera } from "./camera.js";
import { Cuboid, Sphere, Torus, Cone, Cylinder, Star, Cube} from "./mesh.js";
import { GraphicsNode, Light } from "./graphicsNode.js";
import { MonochromeMaterial } from "./material.js";
import { mat4, vec4, vec3 } from './node_modules/gl-matrix/esm/index.js';
import { SceneNode } from "./sceneNode.js";

var gl;
var shaderProgram;
var camera;
var world;
var accelerationVector = mat4.create();
var velocityVector = mat4.create()


var vertexShaderSource =
"attribute vec4 a_Position;\n" + // old
"attribute vec3 a_normal; \n" + // new
"uniform mat4 u_TransformMatrix;\n" + // old
"uniform mat4 u_CameraMatrix;\n" + // old
"varying vec3 v_normal; \n" + // new
"varying vec3 v_eyeCoords; \n" + // new 
"void main()\n" +
"{\n" +
"vec4 eyeCoords = u_TransformMatrix * a_Position; \n" + // new 
"gl_Position = u_CameraMatrix * eyeCoords; \n" + // new 
"v_normal = normalize(a_normal); \n" + // new 
"v_eyeCoords = eyeCoords.xyz/eyeCoords.w; \n" + // new 
"}\n";

var  fragmentShaderSource = 
"precision mediump float; \n" + // old
"struct MaterialProperties {  \n" + // new
"  vec4 diffuseColor;  \n" + // new      // diffuseColor.a is alpha for the fragment
"  vec3 specularColor;  \n" + // new
"  vec3 emissiveColor;  \n" + // new
"  float specularExponent;  \n" + // new
"};  \n" + // new

"struct LightProperties { \n" + // new
"  vec4 position; \n" + // new
"  vec3 color; \n" + // new
"  float attenuation; \n" + // new   // Linear attenuation factor, >= 0. Only point lights attenuate.
"}; \n" + // new

"uniform LightProperties light; \n" + // new
"uniform MaterialProperties material; \n" + // new // do two-sided lighting, but assume front and back materials are the same
"uniform mat3 normalMatrix; \n" + // new

"varying vec3 v_normal; \n" + // new From vertex shader.
"varying vec3 v_eyeCoords; \n" + // new From vertex shader.

"vec3 lightingEquation( LightProperties light, MaterialProperties material, \n" + // new
"  vec3 eyeCoords, vec3 N, vec3 V ) { \n" + // new
// N is normal vector, V is direction to viewer.
"vec3 L, R;  \n" + // new // Light direction and reflected light direction.
"float attenuationFactor = 1.0; \n" + // new // multiplier to account for light attenuation with distance
"if ( light.position.w == 0.0 ) { \n" + // new
"L = normalize( light.position.xyz ); \n" + // new
"} \n" + // new
"else { \n" + // new
"L = normalize( light.position.xyz/light.position.w - v_eyeCoords ); \n" + // new
"if (light.attenuation > 0.0) { \n" + // new
"float dist = distance(eyeCoords,light.position.xyz/light.position.w); \n" + // new
"attenuationFactor = 1.0 / (1.0 + dist*light.attenuation); \n" + // new
"} \n" + // new
"} \n" + // new
"if (dot(L,N) <= 0.0) { \n" + // new
"return vec3(0.0); \n" + // new
"} \n" + // new
"vec3 reflection = dot(L,N) * light.color * material.diffuseColor.rgb; \n" + // new
"R = -reflect(L,N); \n" + // new
"if (dot(R,V) > 0.0) { \n" + // new
"float factor = pow(dot(R,V),material.specularExponent); \n" + // new
"reflection += factor * material.specularColor * light.color; \n" + // new
"} \n" + // new
"return attenuationFactor*reflection; \n" + // new
"} \n" + // new



"void main() {  \n" + // new
"  vec3 normal = normalize( normalMatrix*v_normal );  \n" + // new
"  vec3 viewDirection = normalize( -v_eyeCoords);  \n" + // new  // (Assumes a perspective projection.)
"  vec3 color = material.emissiveColor; \n" + // new

"  if (gl_FrontFacing) { \n" + // new
"     color += lightingEquation( light, material, v_eyeCoords, \n" + // new
"                                              normal, viewDirection); \n" + // new
"   } \n" + // new
"   else { \n" + // new
"     color += lightingEquation( light, material, v_eyeCoords, \n" + // new
"                                              -normal, viewDirection); \n" + // new
"   } \n" + // new
"   gl_FragColor = vec4(color,material.diffuseColor.a); \n" + // new
"} \n";  // new





function init() {
  // Making the canvas
  let canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Making the shaders
  let vertexShader = new Shader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  shaderProgram = new ShaderProgram(gl, vertexShader, fragmentShader);

  // Making the camera
  camera = new Camera(gl, shaderProgram, canvas);


  // Making the different meshes
//  let cube = new Cuboid(0.5, 0.5, 0.5, gl, shaderProgram);
  let torus = new Torus(1, 0.5, 16, 8, gl, shaderProgram);
  let sphere = new Sphere(0.5, 16, 8, gl, shaderProgram);
  let cone = new Cone(0.5, 0.5, 16, false, gl, shaderProgram);
  let cylinder = new Cylinder(0.5, 1, 16, true, false, gl, shaderProgram);
//  let star = new Star(5, 0.5, 0.25, 0.1, gl, shaderProgram);

  let worldMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
  world = new SceneNode(worldMatrix);
  let boardMatrix = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-10,1);
  let board = new SceneNode(boardMatrix);
  world.addChild(board);
  //board.addChildren(getChessboard());

  let mat = mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 0,0,-5,1);
  let whiteBox = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(1,1,1,1));
  let randomBox = new Light(gl, shaderProgram, sphere, whiteBox, mat);
  randomBox.applyLight();
  board.addChild(randomBox);


  let mat1 = mat4.fromValues(1,0,0,0 ,0,1,0,0 ,0,0,1,0, 3,0,-5,1);
  let BlackBox = new MonochromeMaterial(gl, shaderProgram, vec4.fromValues(0,0,0,1));
  let randomBox1 = new GraphicsNode(gl, sphere, BlackBox, mat1);
  world.addChild(randomBox1);
  

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
  accelerationVector[14] = accelerationVector[14] * 0.965;

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
    //world.update(rotationMatrix);
});




function getChessboard() {
  let cube = new Cube(.5, .5, .5, gl, shaderProgram);
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