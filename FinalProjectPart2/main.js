/* EXTRA CREDIT FEATURES
    Press V to toggle sinusoid y-axis transition of 3rd level hierarchy
    Press X to toggle drawing bounding boxes around cubes and spheres
    Upload any of the .ply files from project 2 to be one of the models
    Press + to increase tiling frequency
    Press - to decrease tiling frequency
 */

//a lot of these variables were taken directly from class examples
let shapeArray = [], colorArray = [], sphereArray = [], linesArray = [], fileFaces = [];
let cubeFlatNormal = [], cubeGNormal = [], sphereFlatNormal = [], sphereGNormal = [], fileFlatNormal = [],
    fileGNormal = [];
let sphereBB = [], cubeBB = [], fileBB = [];
let wallCube = [], wallNormals = [];

let gl;
let va = vec4(0.0, 0.0, -1.0, 1), vb = vec4(0.0, 0.942809, 0.333333, 1), vc = vec4(-0.816497, -0.471405, 0.333333, 1),
    vd = vec4(0.816497, -0.471405, 0.333333, 1);
let numTimesToSubdivide = 5, index = 0;

let lightPosition = vec4(0, 0, 14, 1.0);
let lightDirection = vec3(0, -1, -5);
let lightAmbient = vec4(0.3, 0.3, 0.3, 1.0), lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0),
    lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

let materialAmbient = vec4(1.0, 1.0, 1.0, 1.0), materialSpecular = vec4(1.0, 1.0, 1.0, 1.0), materialShininess = 20.0;
let angle = 0.9;

let fovy = 45.0;
let program;

let minT = 0.0, maxT = 3.0;

let texCoordsArray;
let texCoord;
let texture;

let mvMatrix, pMatrix, wallTexture, floorTexture, shadowMatrix, cubeMap;
let negativeX, negativeY, negativeZ, positiveX, positiveY, positiveZ;
let modelView, projection;
let fileUploaded = false, useFlat = true, enableSin = false, enableBB = false, enableShadows = true,
    enableTextures = true, enableRefract = false, enableReflect = false;
let theta = 0, theta2 = 0, theta3 = 0, sinOffset = 0, sinTheta = 0, loadedCubeFaces = 0;
let hor = 5, hor2 = 2, vert = 1, vert2 = -5, topVert = 5, wallSize = 20;
const eye = vec3(0.0, 0, 26);
const at = vec3(0.0, -1, 0.0);
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
    gl.cullFace(gl.BACK); //enable depth testing and backface culling


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide); //build sphere

    shapeArray.push(cube());
    colorArray.push(vec4(1.0, 0.0, 0.0, 1.0)); //red cube
    colorArray.push(vec4(0.0, 1.0, 0.0, 1.0)); //green cube
    colorArray.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue cube
    cubeFlatNormal = fNormals(shapeArray[0]); //calculate cube flat normals
    cubeGNormal = gNormals(shapeArray[0]); //calculate cube gouraud normals
    cubeBB = generateBB(0.5, 0.5, 0.5); //calculate cube bounding box

    shapeArray.push(sphereArray); //load sphere
    colorArray.push(vec4(1.0, 0.0, 1.0, 1.0)); //magenta sphere
    colorArray.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow sphere
    colorArray.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan sphere
    sphereFlatNormal = fNormals(shapeArray[1]); //calculate sphere flat normals
    sphereGNormal = gNormals(shapeArray[1]); //calculate sphere gouraud normals
    sphereBB = generateBB(1, 1, 1); //calculate sphere bounding box

    colorArray.push(vec4(1.0, 1.0, 1.0, 1.0)); //white Lines
    colorArray.push(vec4(1.0, 0.4, 0.0, 1.0)); //orange file color
    colorArray.push(vec4(0.0, 0.0, 0.0, 1.0)); //black shadow

    wallCube = buildSquare(wallSize); //build a single wall
    wallNormals = fNormals(wallCube); //calculate flat normals for the wall

    setAllImages(); //load textures
    setTexCoords(); //load texture coordinates

    shadowMatrix = mat4();
    shadowMatrix[3][3] = 0;
    shadowMatrix[3][2] = -1 / lightPosition[2];

    generateLines(); //generate the lines that will connect all of the models together

    projection = gl.getUniformLocation(program, "projectionMatrix");
    modelView = gl.getUniformLocation(program, "modelMatrix");

    pMatrix = perspective(fovy, 1, .1, 100); //perspective calculation
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    //taken from class examples
    let specularProduct = mult(lightSpecular, materialSpecular);
    let ambientProduct = mult(lightAmbient, materialAmbient);

    gl.uniform3fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    gl.uniform1f(gl.getUniformLocation(program, "angle"), angle);
    gl.uniform1f(gl.getUniformLocation(program, "refractVal"), 0.0);
    gl.uniform1f(gl.getUniformLocation(program, "reflectVal"), 0.0);
    gl.uniform1f(gl.getUniformLocation(program, "usingFlat"), 1.0);

    console.log("Set uniforms");

    window.onkeydown = function(event) {
        let key = event.key;
        switch(key){
            case 'p':
                if(angle > 0){ //increase angle
                    angle -= 0.005;
                }
                gl.uniform1f(gl.getUniformLocation(program, "angle"), angle);
                break;
            case 'i':
                if(angle < 1){ //decrease angle
                    angle += 0.005;
                }
                gl.uniform1f(gl.getUniformLocation(program, "angle"), angle);
                break;
            case 'm':
                useFlat = false; //change to gouraud
                var shadeType = document.getElementById("shadeType");
                shadeType.innerText = "You are currently using Gouraud Shading";
                gl.uniform1f(gl.getUniformLocation(program, "usingFlat"), 0.0);
                break;
            case 'n':
                useFlat = true; //change to flat
                var shadeType = document.getElementById("shadeType");
                shadeType.innerText = "You are currently using Flat Shading";
                if (!enableRefract && !enableReflect) {
                    gl.uniform1f(gl.getUniformLocation(program, "usingFlat"), 1.0);
                }
                break;
            case 'a':
                enableShadows = !enableShadows; //toggle shadows
                break;
            case 'd':
                enableRefract = !enableRefract; //toggle refraction
                if (enableRefract) {
                    gl.uniform1f(gl.getUniformLocation(program, "usingFlat"), 0.0);
                    gl.uniform1f(gl.getUniformLocation(program, "refractVal"), 1.0);
                } else {
                    if (!enableReflect && useFlat) {
                        gl.uniform1f(gl.getUniformLocation(program, "usingFlat"), 1.0);
                    }
                    gl.uniform1f(gl.getUniformLocation(program, "refractVal"), 0.0);
                }
                break;
            case 'c':
                enableReflect = !enableReflect; //toggle reflection
                if (enableReflect) {
                    gl.uniform1f(gl.getUniformLocation(program, "usingFlat"), 0.0);
                    gl.uniform1f(gl.getUniformLocation(program, "reflectVal"), 1.0);
                } else {
                    if (!enableRefract && useFlat) {
                        gl.uniform1f(gl.getUniformLocation(program, "usingFlat"), 1.0);
                    }
                    gl.uniform1f(gl.getUniformLocation(program, "reflectVal"), 0.0);
                }
                break;
            case 'v':
                enableSin = !enableSin; //toggle sinusoid
                break;
            case 'b':
                enableTextures = !enableTextures; //toggle textures
                break;
            case 'x':
                enableBB = !enableBB; //toggle bounding boxes
                break;
            case '+':
                if (maxT < 10) { //increase tiling frequency
                    maxT++;
                }
                setTexCoords();
                break;
            case '-':
                if (maxT > 0) { //decrease tiling frequency
                    maxT--;
                }
                setTexCoords();
                break;
        }
    };

    let fileInput = document.getElementById("custFile");
    fileInput.addEventListener("change", parseFile); //add event listener to the file upload button

    render();
}

//sets the texCoordsArray values to reflect the current min and max T
function setTexCoords() {
    texCoord = [
        vec2(minT, minT),
        vec2(minT, maxT),
        vec2(maxT, maxT),
        vec2(maxT, minT)
    ];

    texCoordsArray = [];
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[3]);
    document.getElementById("tilingFreq").innerText = "The tiling frequency is currently set to: " + maxT
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
        mvMatrix = mult(mvMatrix, translate(wallSize/1.25, 0, 0)); //position left wall
        mvMatrix = mult(mvMatrix, rotateY(270));
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix));
        drawWall(wallCube, "Wall"); //draw left wall
    mvMatrix = stack.pop();

    stack.push(mvMatrix);
        mvMatrix = mult(mvMatrix, translate(-wallSize/1.25, 0, 0)); //position right wall
        mvMatrix = mult(mvMatrix, rotateY(-270));
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix));
        drawWall(wallCube, "Wall"); //draw right wall
    mvMatrix = stack.pop();

    stack.push(mvMatrix);
        mvMatrix = mult(mvMatrix, translate(0, 0, -wallSize)); //position back wall
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix));
        drawWall(wallCube, "Wall"); //draw right wall
    mvMatrix = stack.pop();

    stack.push(mvMatrix);
        mvMatrix = mult(mvMatrix, translate(0, -wallSize/2, 0));
        mvMatrix = mult(mvMatrix, rotateX(-90));
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix));
        drawWall(wallCube, "Floor");
    mvMatrix = stack.pop();

    mvMatrix = mult(mvMatrix, rotateY(theta)); //rotation at top level
    stack.push(mvMatrix);
    mvMatrix = mult(translate(0, 5, 0), mvMatrix);
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix));
        drawShape(shapeArray[0], colorArray[0], true); //level 1 cube (root)
        if(enableShadows) drawShadow(shapeArray[0], 1, 0, 5);
        if(enableBB) drawBB(cubeBB);
    mvMatrix = stack.pop();

    stack.push(mvMatrix); //push two copies
    stack.push(mvMatrix);
        mvMatrix = mult(mult(mvMatrix, translate(hor, vert, 0)), rotateY(theta2)); //rotate in second level direction
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(hor2, vert2, 0)), rotateY(theta3)); //rotate in third level direction
            mvMatrix = mult(mvMatrix, translate(0, -sinOffset, 0)); //shift by -vertical offset
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            drawShape(shapeArray[1], colorArray[3], false); //level 3 sphere
            if(enableShadows) drawShadow(shapeArray[1], 3, hor, vert+vert2-sinOffset, hor2);
            if(enableBB) drawBB(sphereBB);
        mvMatrix = stack.pop();
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(-hor2, vert2, 0)), rotateY(theta3)); //rotate in third level direction
            mvMatrix = mult(mvMatrix, translate(0, sinOffset, 0)); //shift by vertical offset
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            drawShape(shapeArray[0], colorArray[1], true); //level 3 cube
            if(enableShadows) drawShadow(shapeArray[0], 3, hor, vert+vert2+sinOffset, -hor2);
            if(enableBB)drawBB(cubeBB);
        mvMatrix = stack.pop();
        mvMatrix = stack.pop(); //pop one of the original copies off
        mvMatrix = mult(mult(mvMatrix, translate(hor, vert, 0)), rotateY(-theta2)); //rotate counter clockwise
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        drawShape(shapeArray[1], colorArray[4], false); //level 2 sphere
        if(enableShadows) drawShadow(shapeArray[1], 2, hor, vert);
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
            if(enableShadows) drawShadow(shapeArray[1], 3, -hor, vert+vert2+sinOffset, -hor2);
            if(enableBB) drawBB(sphereBB);
        mvMatrix = stack.pop();
        if(fileUploaded){ //for custom uploaded .ply files
            stack.push(mvMatrix);
                mvMatrix = mult(mult(mvMatrix, translate(hor2, vert2, 0)), rotateY(theta3)); //rotate in third level direction
                mvMatrix = mult(mvMatrix, translate(0, -sinOffset, 0)); //translate by -vertical offset
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
                drawShape(shapeArray[2], colorArray[7], false, true); //draw file
                if(enableShadows) drawShadow(shapeArray[2], 3, -hor, vert+vert2-sinOffset, hor2);
                drawBB(fileBB); //draw file bounding box
            mvMatrix = stack.pop();
        }
        mvMatrix = stack.pop();
        mvMatrix = mult(mult(mvMatrix, translate(-hor, vert, 0)), rotateY(-theta2)); //rotate counter clockwise
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        drawShape(shapeArray[0], colorArray[2], true); //blue cube
        if(enableShadows) drawShadow(shapeArray[0], 2, -hor, vert);
        if(enableBB) drawBB(cubeBB);
    mvMatrix = stack.pop();
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

    connect(); //draw lines
    requestAnimationFrame(render)
}

//calculates Gouraud normals for given shape
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

    for (let i = 0; i < intersect.length; i++) {
        let current = vec4(intersect[i % intersect.length]);
        let next = vec4(intersect[(i + 1) % intersect.length]);
        nx += (current[1]-next[1])*(current[2]+next[2]);
        ny += (current[2]-next[2])*(current[0]+next[0]);
        nz += (current[0]-next[0])*(current[1]+next[1]);
    }
    return normalize(vec4(nx, ny, nz, 1.0));
}
