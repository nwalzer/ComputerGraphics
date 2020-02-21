
let shapeArray = [], colorArray = [], pointsArray = [], normalsArray = [], linesArray = [];

let gl;
let va = vec4(0.0, 0.0, -1.0,1);
let vb = vec4(0.0, 0.942809, 0.333333, 1);
let vc = vec4(-0.816497, -0.471405, 0.333333, 1);
let vd = vec4(0.816497, -0.471405, 0.333333,1);
let numTimesToSubdivide = 5;
let index = 0;

let fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
let program;

let mvMatrix, pMatrix;
let modelView, projection;
let fileUploaded = false;
let theta = 0, theta2 = 0, theta3 = 0;
let hor = 5, hor2 = 2, vert = 1, vert2 = -5, topVert = 5;
const eye = vec3(0.0, 0.0, 20);
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
    gl.viewport( 0, 0, 400, 400);

    // Set clear color
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Clear <canvas> by clearing the color buffer
    gl.enable(gl.DEPTH_TEST);



    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    shapeArray.push(cube());
    colorArray.push(vec4(1.0, 0.0, 0.0, 1.0)); //red cube

    shapeArray.push(cube());
    colorArray.push(vec4(0.0, 1.0, 0.0, 1.0)); //green cube

    shapeArray.push(cube());
    colorArray.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue cube

    shapeArray.push(pointsArray);
    colorArray.push(vec4(1.0, 0.0, 0.0, 1.0)); //red sphere

    shapeArray.push(pointsArray);
    colorArray.push(vec4(0.0, 1.0, 0.0, 1.0)); //green sphere

    shapeArray.push(pointsArray);
    colorArray.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue sphere

    generateLines();

    projection = gl.getUniformLocation(program, "projectionMatrix");
    modelView = gl.getUniformLocation(program, "modelMatrix");

    pMatrix = perspective(fovy, 1, .1, 100);
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    render();
}

function generateLines(){
    let topmost = vec4(0.0, topVert, 0.0, 1.0);
    let firstSplit = vec4(0.0, topVert - vert, 0.0, 1.0);

    let L = vec4(hor, topVert - vert, 0.0, 1.0); //left branch
    let LSplit = vec4(hor, -2, 0.0, 1.0);
    let LL = vec4(hor+hor2, -2, 0.0, 1.0); //left branch of left branch
    let centerLL = vec4(hor+hor2, vert2+1, 0.0, 1.0);
    let LR = vec4(hor-hor2, -2, 0.0, 1.0); //right branch of left branch
    let centerLR = vec4(hor-hor2, vert2+1, 0.0, 1.0);

    let R = vec4(-hor, topVert - vert, 0.0, 1.0);
    let RSplit = vec4(-hor, -2, 0.0, 1.0);
    let RR = vec4(-hor+hor2, -2, 0.0, 1.0);
    let centerRR = vec4(-hor+hor2, vert2+1, 0.0, 1.0);
    let RL = vec4(-hor-hor2, -2, 0.0, 1.0);
    let centerRL = vec4(-hor-hor2, vert2+1, 0.0, 1.0);

    linesArray.push([]); //top -> left
    linesArray[0].push(topmost);
    linesArray[0].push(firstSplit);
    linesArray[0].push(L);
    linesArray[0].push(LSplit);

    linesArray.push([]); //top -> right
    linesArray[1].push(topmost);
    linesArray[1].push(firstSplit);
    linesArray[1].push(R);
    linesArray[1].push(RSplit);

    linesArray.push([]); //left -> left
    linesArray[2].push(LSplit);
    linesArray[2].push(LL);
    linesArray[2].push(centerLL);

    linesArray.push([]); //left -> right
    linesArray[3].push(LSplit);
    linesArray[3].push(LR);
    linesArray[3].push(centerLR);

    //linesArray.push([]); //right -> right
    //linesArray[4].push(RSplit);
    //linesArray[4].push(RR);
    //linesArray[4].push(centerRR);

    linesArray.push([]); //right -> left
    linesArray[4].push(RSplit);
    linesArray[4].push(RL);
    linesArray[4].push(centerRL);
}

function cube()
{
    let verts = [];
    verts = verts.concat(quad( 1, 0, 3, 2 ));
    verts = verts.concat(quad( 2, 3, 7, 6 ));
    verts = verts.concat(quad( 3, 0, 4, 7 ));
    verts = verts.concat(quad( 6, 5, 1, 2 ));
    verts = verts.concat(quad( 4, 5, 6, 7 ));
    verts = verts.concat(quad( 5, 4, 0, 1 ));
    return verts;
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta += 0.5;
    theta2 -= 2;
    theta3 += 4;

    mvMatrix = lookAt(eye, at , up);

    stack.push(mvMatrix);
    mvMatrix = mult(mvMatrix, rotateY(theta)); //rotation at top level
    gl.uniformMatrix4fv( modelView, false, flatten(mult(translate(0, 5, 0), mvMatrix)));
    drawShape(shapeArray[0], colorArray[0]);

    stack.push(mvMatrix);
        mvMatrix = mult(mult(mvMatrix, translate(hor, vert, 0)), rotateY(theta2));
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(hor2, vert2, 0)), rotateY(theta3));
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            drawShape(shapeArray[3], colorArray[3]);
        mvMatrix = stack.pop();
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(-hor2, vert2, 0)), rotateY(theta3));
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            drawShape(shapeArray[1], colorArray[1]);
        mvMatrix = stack.pop();
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        drawShape(shapeArray[4], colorArray[4]);
    mvMatrix = stack.pop();


    stack.push(mvMatrix);
        mvMatrix = mult(mult(mvMatrix, translate(-hor, vert, 0)), rotateY(theta2));
        stack.push(mvMatrix);
            mvMatrix = mult(mult(mvMatrix, translate(-hor2, vert2, 0)), rotateY(theta3));
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            drawShape(shapeArray[5], colorArray[5]);
        mvMatrix = stack.pop();
        if(fileUploaded){ //for custom uploaded .ply files
            stack.push(mvMatrix);
                mvMatrix = mult(mult(mvMatrix, translate(hor2, vert2, 0)), rotateY(theta3));
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
                drawShape(shapeArray[6], colorArray[6]);
            mvMatrix = stack.pop();
        }
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        drawShape(shapeArray[2], colorArray[2]);
    mvMatrix = stack.pop();

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

    connect();
    requestAnimationFrame(render)
}

function connect(){
    for(let i = 0; i < linesArray.length; i++) {

        if(i > 1){
            stack.push(mvMatrix);
                let temp = linesArray[i][0];
                mvMatrix = mult(mvMatrix, translate(temp[0], temp[1], temp[2]));
                mvMatrix = mult(mvMatrix, rotateY(theta2));
                mvMatrix = mult(mvMatrix, translate(-temp[0], -temp[1], -temp[2]));
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            mvMatrix = stack.pop();
        }
        let fragColors = [];

        for (let j = 0; j < linesArray[i].length; j++) {
            fragColors.push(vec4(0.0, 0.0, 0.0, 1.0));
        }

        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(linesArray[i]), gl.STATIC_DRAW);

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        let cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(fragColors), gl.STATIC_DRAW);

        let vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        gl.drawArrays(gl.LINE_STRIP, 0, linesArray[i].length);
    }
}

function drawShape(shape, color) {
    let fragColors = [];

    for(let i = 0; i < shape.length; i++)
    {
        fragColors.push(color);
    }

    let pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(shape), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    let cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fragColors), gl.STATIC_DRAW);

    let vColor= gl.getAttribLocation(program,  "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.drawArrays( gl.TRIANGLES, 0, shape.length );

}


function quad(a, b, c, d)
{
    let verts = [];

    let vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
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

    normalsArray.push(a[0],a[1], a[2], 0.0);
    normalsArray.push(b[0],b[1], b[2], 0.0);
    normalsArray.push(c[0],c[1], c[2], 0.0);

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
