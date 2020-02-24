
let shapeArray = [], colorArray = [], pointsArray = [], linesArray = [];
let cubeFlatNormal = [], cubeGNormal = [], sphereFlatNormal = [], sphereGNormal = [];

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
let fileUploaded = false, useFlat = true;
let theta = 0, theta2 = 0, theta3 = 0;
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
    cubeFlatNormal = fNormals(shapeArray[0]);
    cubeGNormal = gNormals(shapeArray[0]);

    shapeArray.push(pointsArray);
    colorArray.push(vec4(1.0, 0.0, 0.0, 1.0)); //red sphere
    colorArray.push(vec4(0.0, 1.0, 0.0, 1.0)); //green sphere
    colorArray.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue sphere
    sphereFlatNormal = fNormals(shapeArray[1]);
    sphereGNormal = fNormals(shapeArray[1]);

    colorArray.push(vec4(1.0, 1.0, 1.0, 1.0)); //White Lines

    generateLines();

    projection = gl.getUniformLocation(program, "projectionMatrix");
    modelView = gl.getUniformLocation(program, "modelMatrix");

    pMatrix = perspective(fovy, 1, .1, 100);
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
                if(angle > 0){
                    angle -= 0.01;
                }
                gl.uniform1f(gl.getUniformLocation(program, "angle"), angle);
                break;
            case 'i':
                if(angle < 1){
                    angle += 0.01;
                }
                gl.uniform1f(gl.getUniformLocation(program, "angle"), angle);
                break;
            case 'm':
                useFlat = false;
                break;
            case 'n':
                useFlat = true;
                break;
            case 'Shift':
                shiftPressed = true;
                break;
            case 'w':
                lightDirection[1] += 0.1;
                gl.uniform3fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
                break;
            case 'a':
                lightDirection[0] -= 0.1;
                gl.uniform3fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
                break;
            case 'd':
                lightDirection[0] += 0.1;
                gl.uniform3fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
                break;
            case 's':
                lightDirection[1] -= 0.1;
                gl.uniform3fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
                break;
            case 'q':
                lightDirection[2] += 0.1;
                gl.uniform3fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
                break;
            case 'e':
                lightDirection[2] -= 0.1;
                gl.uniform3fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
                break;
        }
    };

    render();
}

function generateLines(){
    linesArray = [];
    let topmost = vec4(0.0, topVert, 0.0, 1.0);
    let firstSplit = vec4(0.0, topVert - (topVert - vert)/2, 0.0, 1.0);

    let L = vec4(hor, topVert - (topVert - vert)/2, 0.0, 1.0); //left branch
    let topL = vec4(hor, vert+1, 0.0, 1.0);
    let botL = vec4(hor, vert-1, 0.0, 1.0);
    let LSplit = vec4(hor, -2, 0.0, 1.0);
    let LL = vec4(hor+hor2, -2, 0.0, 1.0); //left branch of left branch
    let centerLL = vec4(hor+hor2, vert2+2, 0.0, 1.0);
    let LR = vec4(hor-hor2, -2, 0.0, 1.0); //right branch of left branch
    let centerLR = vec4(hor-hor2, vert2+1, 0.0, 1.0);

    let R = vec4(-hor, topVert - (topVert - vert)/2, 0.0, 1.0);
    let RSplit = vec4(-hor, -2, 0.0, 1.0);
    let RL = vec4(-hor-hor2, -2, 0.0, 1.0);
    let centerRL = vec4(-hor-hor2, vert2+2, 0.0, 1.0);
    let RR = vec4(-hor+hor2, -2, 0.0, 1.0);
    let centerRR = vec4(-hor+hor2, vert2+1, 0.0, 1.0);

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

    /*linesArray.push([]); //right vertical -> right
    linesArray[7].push(RSplit);
    linesArray[7].push(RR);
    linesArray[7].push(centerRR);*/
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta += 0.5;
    theta = theta % 360;
    theta2 -= 2.3;
    theta2 = theta2 % 360;
    theta3 += 4;
    theta3 = theta3 % 360;

    mvMatrix = lookAt(eye, at , up);

    stack.push(mvMatrix);
    mvMatrix = mult(mvMatrix, rotateY(theta)); //rotation at top level
    gl.uniformMatrix4fv( modelView, false, flatten(mult(translate(0, 5, 0), mvMatrix)));
    drawShape(shapeArray[0], colorArray[0], true);

    stack.push(mvMatrix);
        mvMatrix = mult(mult(mvMatrix, translate(hor, vert, 0)), rotateY(theta2));
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(hor2, vert2, 0)), rotateY(theta3));
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            drawShape(shapeArray[1], colorArray[3], false);
        mvMatrix = stack.pop();
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(-hor2, vert2, 0)), rotateY(theta3));
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            drawShape(shapeArray[0], colorArray[1], true);
        mvMatrix = stack.pop();
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        drawShape(shapeArray[1], colorArray[4], false);
    mvMatrix = stack.pop();


    stack.push(mvMatrix);
        mvMatrix = mult(mult(mvMatrix, translate(-hor, vert, 0)), rotateY(theta2));
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(-hor2, vert2, 0)), rotateY(theta3));
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            drawShape(shapeArray[1], colorArray[5], false);
        mvMatrix = stack.pop();
        if(fileUploaded){ //for custom uploaded .ply files
            stack.push(mvMatrix);
                mvMatrix = mult(mult(mvMatrix, translate(hor2, vert2, 0)), rotateY(theta3));
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
                drawShape(shapeArray[3], colorArray[6], false);
            mvMatrix = stack.pop();
        }
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        drawShape(shapeArray[0], colorArray[2], true);
    mvMatrix = stack.pop();

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

    connect();
    requestAnimationFrame(render)
}

function connect(){
    for(let i = 0; i < linesArray.length; i++) {
        let diffuseProduct = mult(lightDiffuse, colorArray[6]);
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));

        let lineNormal = [];
        if(i > 1){
            stack.push(mvMatrix);
                let temp = linesArray[i][0];
                mvMatrix = mult(mvMatrix, translate(temp[0], 0, temp[2]));
                mvMatrix = mult(mvMatrix, rotateY(theta2));
                mvMatrix = mult(mvMatrix, translate(-temp[0], 0, -temp[2]));
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

                //this loop tricks the program into thinking the lines are always facing the light source
                //which ensures the lines remain lit up at all theta values while they are in the spotlight
                for (let j = 0; j < linesArray[i].length; j++) {
                    lineNormal.push(mult(inverse4(mvMatrix), lightPosition));
                }
            mvMatrix = stack.pop();
        } else {
            for (let j = 0; j < linesArray[i].length; j++) {
                lineNormal.push(mult(inverse4(mvMatrix), lightPosition));
            }
        }
        var vNormal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(lineNormal), gl.STREAM_DRAW);

        var vNormalPosition = gl.getAttribLocation( program, "vNormal");
        gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormalPosition);

        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(linesArray[i]), gl.STREAM_DRAW);

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.drawArrays(gl.LINE_STRIP, 0, linesArray[i].length);
    }
}

function drawShape(shape, color, isCube) {
    if(isCube){
        if(useFlat){
            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeFlatNormal), gl.STREAM_DRAW);
        } else {
            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeGNormal), gl.STREAM_DRAW);
        }

        var vNormalPosition = gl.getAttribLocation( program, "vNormal");
        gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormalPosition);
    } else {
        if(useFlat){
            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereFlatNormal), gl.STREAM_DRAW);
        } else {
            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereGNormal), gl.STREAM_DRAW);
        }

        var vNormalPosition = gl.getAttribLocation( program, "vNormal");
        gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormalPosition);    
    }

    let diffuseProduct = mult(lightDiffuse, color);
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    
    let fragColors = [];

    let pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(shape), gl.STREAM_DRAW);

    let vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    let cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fragColors), gl.STREAM_DRAW);

    gl.drawArrays( gl.TRIANGLES, 0, shape.length );

}

function cube() {
    let verts = [];
    verts = verts.concat(quad( 1, 0, 3, 2 )); //front
    verts = verts.concat(quad( 2, 3, 7, 6 )); //right
    verts = verts.concat(quad( 3, 0, 4, 7 )); //bottom
    verts = verts.concat(quad( 6, 5, 1, 2 )); //top
    verts = verts.concat(quad( 4, 5, 6, 7 )); //back
    verts = verts.concat(quad( 5, 4, 0, 1 )); //left
    return verts;
}

function quad(a, b, c, d) {
    let verts = [];

    let vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ), //bottom left front  0
        vec4( -0.5,  0.5,  0.5, 1.0 ), //top left front     1
        vec4(  0.5,  0.5,  0.5, 1.0 ), //top right front    2
        vec4(  0.5, -0.5,  0.5, 1.0 ), //bottom right front 3

        vec4( -0.5, -0.5, -0.5, 1.0 ), //botton left back   4
        vec4( -0.5,  0.5, -0.5, 1.0 ), //top left back      5
        vec4(  0.5,  0.5, -0.5, 1.0 ), //top right back     6
        vec4(  0.5, -0.5, -0.5, 1.0 )  //bottom right back  7
    ];

    let indices = [ a, b, c, a, c, d ];

    for ( let i = 0; i < indices.length; ++i )
    {
        verts.push( vertices[indices[i]] );
    }

    return verts;
}

function triangle(a, b, c) {



    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    // normals are vectors

    index += 3;

}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        let ab = mix( a, b, 0.5);
        let ac = mix( a, c, 0.5);
        let bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}
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

function fNormals(shape){
    let normals = [];
    for (let i = 0; i < shape.length; i += 3){

        let intersections = [];
        intersections.push(shape[i]);
        intersections.push(shape[i+1]);
        intersections.push(shape[i+2]);
        let n = doNewell(intersections);
        normals.push(n);
        normals.push(n);
        normals.push(n);

    }
    return normals;
}

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
    return vec4(nx, ny, nz, 0.0);
}
