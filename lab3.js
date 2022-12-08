// Andreas Form och Marcus Asplund

var gl;
var shaderProgram;
var nodes = [];
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
  let playableBoxMatrix = mat4([1,0,0,0],[0,1,0,0],[0,0,1,-3],[0,0,0,1]);
  playableBox = new GraphicsNode(gl, cube, playableBoxMaterial, playableBoxMatrix);


  // Making sceneNodes and matrixes
  let cameraNode = new GraphicsNode(gl, invisible, playableBoxMaterial, playableBoxMatrix);
  let mazeNode = new GraphicsNode(gl, invisible, playableBoxMaterial, playableBoxMatrix);
  let robotNode = new GraphicsNode(gl, invisible, playableBoxMaterial, playableBoxMatrix);
  let headNode = new GraphicsNode(gl, cube, playableBoxMaterial, playableBoxMatrix);
  let starNode = new GraphicsNode(gl, star, playableBoxMaterial, playableBoxMatrix);

  // Set children
  cameraNode.addChild(mazeNode);
  mazeNode.addChild(robotNode);
  robotNode.addChild(headNode);
  headNode.addChild(starNode);

  /* 
  for (let i = 0; i < 0; i++) {
    let x = Math.random() * 5 -2.5;
    let y = Math.random() * 5 -2.5;
    let z = -Math.random()*10 - 5;
    let mat = move([x, y, z]);
    let randomBox = new GraphicsNode(gl, torus, randomBoxesMaterial, mat);
    nodes.push(randomBox);
  }
  */

  let blackBox = new MonochromeMaterial(gl, shaderProgram, [0, 0, 0, 1]);
  let whiteBox = new MonochromeMaterial(gl, shaderProgram, [1, 1, 1, 1]);

  let black = true;
  
  for(let i = -1.75; i < 1.75; i = i + 0.5) {
    if(black) black = false;
    else black = true;
    for(let j = -1.75; j < 1.75; j = j + 0.5) {

      let mat = mat4([1,0,0,i],[0,1,0,j],[0,0,1,-10],[0,0,0,1])
      let randomBox;

      if(black){
        randomBox = new GraphicsNode(gl, cube, blackBox, mat);
        black = false;

      }else{
        randomBox = new GraphicsNode(gl, cube, whiteBox, mat);
        black = true;
      }
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
    let moveVector = mat4([1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]);
    if (event.key == 'w') {
      moveVector[1][3] -= 0.03;  
    } if (event.key == 's') {
      moveVector[1][3] += 0.03;  
    } if (event.key == 'a') {
      moveVector[0][3] += 0.03;  
    } if (event.key == 'd') {
      moveVector[0][3] -= 0.03;  
    } if (event.key == 'e') {
      moveVector[2][3] -= 0.03; 
    } if (event.key == 'c') {
      moveVector[2][3] += 0.03;  
    }


    /**
     * mat4.rotateX( modelview, modelview, radians );
      mat4.rotateY( modelview, modelview, radians );
      mat4.rotateZ( modelview, modelview, radians );
      mat4.rotate( modelview, modelview, radians, [dx,dy,dz] );
     */
    for(let node of nodes){
      node.update(moveVector);
    }

    playableBox.update(moveVector);
});

window.onload = init;