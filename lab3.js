// Andreas Form och Marcus Asplund

var gl;
var shaderProgram;
var boxes = [];
var camera;

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
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Making the shaders
  let vertexShader = new Shader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  shaderProgram = new ShaderProgram(gl, vertexShader, fragmentShader);

  // Making the camera
  camera = new Camera(gl, shaderProgram, canvas);

  // Making the mesh
  let width = 0.1;
  let height = 0.3;
  let depth = 0.1;

  let cube = new Cuboid(0.1, 0.1, 0.1, gl, shaderProgram);
  let star = new Star(5, 0.2, 0.1, 1, gl, shaderProgram);
  
  let randomBoxesColor = [0, 1, 0, 1]; // Green
  let playableBoxColor = [1, 0, 1, 1]; // Red
  let randomBoxesMaterial = new MonochromeMaterial(gl, shaderProgram, randomBoxesColor);
  let playableBoxMaterial = new MonochromeMaterial(gl, shaderProgram, playableBoxColor);
  let playableBoxMatrix = mat4([1,0,0,0],[0,1,0,0],[0,0,1,-3],[0,0,0,1]);
  playableBox = new GraphicsNode(gl, cube, playableBoxMaterial, playableBoxMatrix);

  for (let i = 0; i < 50; i++) {
    let x = Math.random() * 5 -2.5;
    let y = Math.random() * 5 -2.5;
    let z = -Math.random()*10 + 2;
    let mat = move([x, y, z]);
    let randomBox = new GraphicsNode(gl, star, randomBoxesMaterial, mat);
    boxes.push(randomBox);
  }
  render();
}


function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  shaderProgram.activate();
  camera.activate();

  for (let box of boxes) {
    box.draw();
  }
  playableBox.draw();
}


window.addEventListener('keydown', function(event) {
    let moveVector = mat4([1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]);
    if (event.key == 'w') {
      moveVector[1][3] += 0.03;  
    } if (event.key == 's') {
      moveVector[1][3] -= 0.03;  
    } if (event.key == 'a') {
      moveVector[0][3] -= 0.03;  
    } if (event.key == 'd') {
      moveVector[0][3] += 0.03;  
    } if (event.key == 'e') {
      moveVector[2][3] += 0.03;  
    } if (event.key == 'c') {
      moveVector[2][3] -= 0.03;  
    }
    
    playableBox.update(moveVector);
    render();
});

window.onload = init;