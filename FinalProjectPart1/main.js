
let shapeArray = [], colorArray = [], sphereArray = [], linesArray = [], fileFaces = [];
let cubeFlatNormal = [], cubeGNormal = [], sphereFlatNormal = [], sphereGNormal = [], fileFlatNormal = [], fileGNormal = [];
let sphereBB = [], cubeBB = [], fileBB = [];

let gl;
let va = vec4(0.0, 0.0, -1.0,1);
let vb = vec4(0.0, 0.942809, 0.333333, 1);
let vc = vec4(-0.816497, -0.471405, 0.333333, 1);
let vd = vec4(0.816497, -0.471405, 0.333333,1);
let numTimesToSubdivide = 5;
let index = 0;

let lightPosition = vec4(7.0, 3.0, 3.0, 1.0 );
let lightDirection = vec3(-1, 0, -5);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;
var angle = 0.9;

let fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
let program;

let mvMatrix, pMatrix;
let modelView, projection;
let fileUploaded = false, useFlat = true, enableSin = false, enableBB = false;
let theta = 0, theta2 = 0, theta3 = 0, sinOffset = 0, sinTheta = 0;
let hor = 5, hor2 = 2, vert = 1, vert2 = -5, topVert = 5;
const eye = vec3(0.0, 0.0, 22);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

let stack = [];

function main()
{
    // Retrieve <canvas> element
    let canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas);

    //Check that the return value is not null.
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport
    gl.viewport( 0, 0, canvas.width, canvas.height);

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas> by clearing the color buffer
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);



    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    shapeArray.push(cube());
    colorArray.push(vec4(1.0, 0.0, 0.0, 1.0)); //red cube
    colorArray.push(vec4(0.0, 1.0, 0.0, 1.0)); //green cube
    colorArray.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue cube
    cubeFlatNormal = fNormals(shapeArray[0]); //calculate cube flat normals
    cubeGNormal = gNormals(shapeArray[0]); //calculate cube gouraud normals
    cubeBB = generateBB(0.5, 0.5, 0.5);

    shapeArray.push(sphereArray);
    colorArray.push(vec4(1.0, 0.0, 1.0, 1.0)); //magenta sphere
    colorArray.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow sphere
    colorArray.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan sphere
    sphereFlatNormal = fNormals(shapeArray[1]); //calculate sphere flat normals
    sphereBB = generateBB(1, 1, 1);

    colorArray.push(vec4(1.0, 1.0, 1.0, 1.0)); //White Lines
    colorArray.push(vec4(1.0, 0.4, 0.0, 1.0)); //orange file color

    generateLines(); //generate the lines that will connect all of the models together

    projection = gl.getUniformLocation(program, "projectionMatrix");
    modelView = gl.getUniformLocation(program, "modelMatrix");

    pMatrix = perspective(fovy, 1, .1, 100); //perspective calculation
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    let specularProduct = mult(lightSpecular, materialSpecular);
    let ambientProduct = mult(lightAmbient, materialAmbient);

    gl.uniform3fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    gl.uniform1f(gl.getUniformLocation(program, "angle"), angle);

    window.onkeydown = function(event) {
        let key = event.key;
        switch(key){
            case 'p':
                if(angle > 0){ //increase angle
                    angle -= 0.01;
                }
                gl.uniform1f(gl.getUniformLocation(program, "angle"), angle);
                break;
            case 'i':
                if(angle < 1){ //decrease angle
                    angle += 0.01;
                }
                gl.uniform1f(gl.getUniformLocation(program, "angle"), angle);
                break;
            case 'm':
                useFlat = false; //change to gouraud
                var shadeType = document.getElementById("shadeType");
                shadeType.innerText = "You are currently using Gouraud Shading";
                break;
            case 'n':
                useFlat = true; //change to flat
                var shadeType = document.getElementById("shadeType");
                shadeType.innerText = "You are currently using Flat Shading";
                break;
            case 'w':
                updateLightDir(0.0, 0.1, 0.0); //shift light direction up
                break;
            case 's':
                updateLightDir(0.0, -0.1, 0.0); //shift light position down
                break;
            case 'a':
                updateLightDir(-0.1, 0, 0.0); //shift light position left
                break;
            case 'd':
                updateLightDir(0.1, 0, 0.0); //shift light position right
                break;
            case 'q':
                updateLightDir(0, 0, 0.1); //shift light position closer
                break;
            case 'e':
                updateLightDir(0, 0, -0.1); //shift light position further
                break;
            case 'v':
                enableSin = !enableSin; //toggle sinusoid
                break;
            case 'b':
                enableBB = !enableBB; //toggle bounding boxes
                break;
        }
    };

    let fileInput = document.getElementById("custFile");
    fileInput.addEventListener("change", parseFile); //add event listener to the file upload button

    render();
}

//Translates light direction by x, y, z
function updateLightDir(x, y, z){
    lightDirection[0] += x;
    lightDirection[1] += y;
    lightDirection[2] += z;
    var lightDir = document.getElementById("lightDir");
    lightDir.innerText = "The light is pointing at: (" + lightDirection[0] + ", " + lightDirection[1] + ", " + lightDirection[2] + ")";
    gl.uniform3fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
}

//generates lines connecting all of the objects
function generateLines(){
    linesArray = [];
    let topmost = vec4(0.0, topVert, 0.0, 1.0);
    let firstSplit = vec4(0.0, topVert - (topVert - vert)/2, 0.0, 1.0);

    let L = vec4(hor, topVert - (topVert - vert)/2, 0.0, 1.0);
    let topL = vec4(hor, vert+1, 0.0, 1.0); //top of yellow sphere
    let botL = vec4(hor, vert-1, 0.0, 1.0); //bottom of yellow sphere
    let LSplit = vec4(hor, -2, 0.0, 1.0);
    let LL = vec4(hor+hor2, -2, 0.0, 1.0);
    let centerLL = vec4(hor+hor2, vert2+2-sinOffset, 0.0, 1.0); //magenta sphere
    let LR = vec4(hor-hor2, -2, 0.0, 1.0);
    let centerLR = vec4(hor-hor2, vert2+1+sinOffset, 0.0, 1.0); //green cube

    let R = vec4(-hor, topVert - (topVert - vert)/2, 0.0, 1.0);
    let RSplit = vec4(-hor, -2, 0.0, 1.0);
    let RL = vec4(-hor-hor2, -2, 0.0, 1.0);
    let centerRL = vec4(-hor-hor2, vert2+2+sinOffset, 0.0, 1.0); //cyan sphere

    linesArray.push([]); //top vertical
    linesArray[0].push(topmost);
    linesArray[0].push(firstSplit);

    linesArray.push([]); //top horizontal
    linesArray[1].push(L);
    linesArray[1].push(R);

    linesArray.push([]); //left vertical
    linesArray[2].push(L);
    linesArray[2].push(topL);

    linesArray.push([]); //left vertical -> right
    linesArray[3].push(botL);
    linesArray[3].push(LSplit);
    linesArray[3].push(LR);
    linesArray[3].push(centerLR);

    linesArray.push([]); //left vertical -> left
    linesArray[4].push(LSplit);
    linesArray[4].push(LL);
    linesArray[4].push(centerLL);

    linesArray.push([]); //right vertical
    linesArray[5].push(R);
    linesArray[5].push(RSplit);

    linesArray.push([]); //right vertical -> left
    linesArray[6].push(RSplit);
    linesArray[6].push(RL);
    linesArray[6].push(centerRL);

    if(fileUploaded){ //creates lines to connect to bounding box of file
        let RR = vec4(-hor+hor2, -2, 0.0, 1.0);
        let centerRR = vec4(-hor+hor2, vert2+1-sinOffset+fileBB[0][0][1], 0.0, 1.0);
        linesArray.push([]); //right vertical -> right
        linesArray[7].push(RSplit);
        linesArray[7].push(RR);
        linesArray[7].push(centerRR);
    }
}

//update drawing
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta += 0.5;
    theta = theta % 360; //top level rotation
    theta2 -= 2.3;
    theta2 = theta2 % 360; //second level rotation
    theta3 += 4;
    theta3 = theta3 % 360; //third level rotation

    if(enableSin){ //if sinusoid enabled
        sinTheta += 0.5;
        sinTheta = sinTheta % 360;
        sinOffset = Math.sin(sinTheta * (Math.PI/90)); //calculate vertical offset
    }

    mvMatrix = lookAt(eye, at , up); //calculate model matrix

    stack.push(mvMatrix); //push initial model matrix
    mvMatrix = mult(mvMatrix, rotateY(theta)); //rotation at top level
    gl.uniformMatrix4fv( modelView, false, flatten(mult(translate(0, 5, 0), mvMatrix)));
    drawShape(shapeArray[0], colorArray[0], true); //level 1 cube (root)

    if(enableBB) drawBB(cubeBB);

    stack.push(mvMatrix); //push two copies
    stack.push(mvMatrix);
        mvMatrix = mult(mult(mvMatrix, translate(hor, vert, 0)), rotateY(theta2)); //rotate in second level direction
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(hor2, vert2, 0)), rotateY(theta3)); //rotate in third level direction
            mvMatrix = mult(mvMatrix, translate(0, -sinOffset, 0)); //shift by -vertical offset
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            drawShape(shapeArray[1], colorArray[3], false); //level 3 sphere
            if(enableBB) drawBB(sphereBB);
        mvMatrix = stack.pop();
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(-hor2, vert2, 0)), rotateY(theta3)); //rotate in third level direction
            mvMatrix = mult(mvMatrix, translate(0, sinOffset, 0)); //shift by vertical offset
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            drawShape(shapeArray[0], colorArray[1], true); //level 3 cube
            if(enableBB)drawBB(cubeBB);
        mvMatrix = stack.pop();
        mvMatrix = stack.pop(); //pop one of the original copies off
        mvMatrix = mult(mult(mvMatrix, translate(hor, vert, 0)), rotateY(-theta2)); //rotate counter clockwise
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        drawShape(shapeArray[1], colorArray[4], false); //level 2 sphere
        if(enableBB) drawBB(sphereBB);
    mvMatrix = stack.pop();


    stack.push(mvMatrix);
    stack.push(mvMatrix); //push two copies to stack
        mvMatrix = mult(mult(mvMatrix, translate(-hor, vert, 0)), rotateY(theta2)); //rotate by second level theta
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(-hor2, vert2, 0)), rotateY(theta3)); //rotate in third level direction
            mvMatrix = mult(mvMatrix, translate(0, sinOffset, 0)); //translate by vertical offset
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix));
            drawShape(shapeArray[1], colorArray[5], false); //level 3 sphere
            if(enableBB) drawBB(sphereBB);
        mvMatrix = stack.pop();
        if(fileUploaded){ //for custom uploaded .ply files
            stack.push(mvMatrix);
                mvMatrix = mult(mult(mvMatrix, translate(hor2, vert2, 0)), rotateY(theta3)); //rotate in third level direction
                mvMatrix = mult(mvMatrix, translate(0, -sinOffset, 0)); //translate by -vertical offset
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
                drawShape(shapeArray[2], colorArray[7], false, true); //draw file
                drawBB(fileBB); //draw file bounding box
            mvMatrix = stack.pop();
        }
        mvMatrix = stack.pop();
        mvMatrix = mult(mult(mvMatrix, translate(-hor, vert, 0)), rotateY(-theta2)); //rotate counter clockwise
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        drawShape(shapeArray[0], colorArray[2], true); //blue cube
        if(enableBB) drawBB(cubeBB);
    mvMatrix = stack.pop();

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

    connect(); //draw lines
    requestAnimationFrame(render)
}

//calculates Gouraud normals for given shape
//though it comes out negative for spheres
//which is why spheres have their own gouraud generation
function gNormals(shape) {
    let normals = [];
    for (let i = 0; i < shape.length; i++) {
        normals.push( vec4( shape[i][0],
            shape[i][1],
            shape[i][2],
            0.0));
    }
    return normals;
}

//calculate flat normals
function fNormals(shape){
    let normals = [];
    for (let i = 0; i < shape.length; i += 3){
        //calculate face normal using newell method
        let n = doNewell([shape[i], shape[i+1], shape[i+2]]);
        normals.push(n); //push face normal for each vertex
        normals.push(n);
        normals.push(n);

    }
    return normals;
}

//does the newell method for normal calculation
function doNewell(intersect){
    let nx = 0;
    let ny = 0;
    let nz = 0;
    let current;
    let next;
    let i;

    for (i = 0; i < intersect.length; i++) {
        current = vec4(intersect[i % intersect.length]);
        next = vec4(intersect[(i + 1) % intersect.length]);
        nx += (current[1]-next[1])*(current[2]+next[2]);
        ny += (current[2]-next[2])*(current[0]+next[0]);
        nz += (current[0]-next[0])*(current[1]+next[1]);
    }
    return normalize(vec4(nx, ny, nz, 0.0));
}
