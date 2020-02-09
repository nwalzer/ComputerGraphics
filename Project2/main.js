/* EXTRA FEATURES:
    - Press 'u' to delete the most recent vertex (draw mode only)
    - Draw lines using the color selected from the custom color box
    - Drawing a single point on the screen displays the point
    - Use the arrow keys to translate your file or drawing by 1px per press

    A more detailed explanation of these features can be found in the
    Extra Features section of README.txt
*/


let pointsArray = [], faceArray = [], projMatrix = [], modelMatrix = [], normalArray = [];
let gl;
let program;
let canvas;
let currentZ = 0, pulseDist = 0, theta = 0;
let breathingIn = false, moveX = false, pulseOn = false, rotateOn = false, drawNorms = false;
let eye, at;

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer:true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Get file input button and add event handler
    let fileInput = document.getElementById("drawModeFile");
    fileInput.addEventListener("change", parseFile); //add event listener to the file upload button

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    var vPointSize = gl.getUniformLocation(program, "vPointSize");
    gl.uniform1f(vPointSize, 5.0);
    modelMatrix = mat4();
    projMatrix = mat4();

    window.onkeydown = function(event) {
        let key = event.key;
        switch(key){
            case 'b':
                pulseOn = !pulseOn;
                pulse();
                break;
            case 'z':
                zoom(1);
                break;
            case 'a':
                zoom(-1);
                break;
            case 'x':
                moveX = !moveX;
                translateDraw(1, 0); //translate one pixel to the right
                break;
            case 'c':
                translateDraw(-1, 0); //translate one pixel to the left
                break;
            case 'y':
                translateDraw(0, 1); //translate one pixel up
                break;
            case 'u':
                translateDraw(0, -1); //translate one pixel down
                break;
            case 'r':
                rotateOn = !rotateOn;
                rotateDrawing();
                break;
            case 'n':
                drawNorms = !drawNorms;
                makeDrawing();
                break;
        }
    };
    //gl.viewport(0, 0, canvas.width, canvas.height);
}

function rotateDrawing(){
    if(!rotateOn){
        return;
    }
    theta -= 0.5;
    console.log(theta, currentZ);
    //let firstTransMatrix = translate(0, 0, currentZ);
    let rotMatrix = rotate(theta, vec3(1, 0, 0));
    //let secondTransMatrix = translate(0, 0, -currentZ);
    //modelMatrix = mult(secondTransMatrix, mult(rotMatrix, firstTransMatrix));
    modelMatrix = rotMatrix;

    makeDrawing();
    id = requestAnimationFrame(rotateDrawing);
}

function zoom(){
    let z = arguments[0];
    currentZ += z;
    eye[2] += z;
    makeDrawing();
}

//Translates the drawing on the screen
function translateDraw(){
    let x = 1;
    let y = 0;
    if(arguments.length === 2){
        x = parseFloat(arguments[0]);
        y = parseFloat(arguments[1]);
    }

    let currentVP = gl.getParameter(gl.VIEWPORT);
    gl.viewport(currentVP[0]+x, currentVP[1]+y, currentVP[2], currentVP[3]); //shift the viewport instead of the vertices
    makeDrawing();
    if(moveX){
        id = requestAnimationFrame(translateDraw)
    }
}

//Takes in a string representing a color value in hex and converts it to rgb in the range of [0.0, 1.0]
function hex2vec4(hval){
    hval = hval.replace("#", ""); //get rid of #
    dval = parseInt(hval, 16); //get color in decimal
    let r = ((dval & 0xFF0000) >> 16)/255; //get r byte
    let g = ((dval & 0x00FF00) >> 8)/255; //get g byte
    let b = (dval & 0x0000FF)/255; //get b byte
    colorPicker.push(vec4(r, g, b, 1.0)); //turn into vec4 and push to color cycler
}

function drawNormals(){
    for(let i = 0; i < normalArray.length; i++){ //for each normal in normalArray
        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalArray[i]), gl.STATIC_DRAW); //create VBO

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0); //enable attribute

        let colors = [];
        let pulseArray = [];
        for(let j = 0; j < faceArray[i].length; j++){ //push enough color vectors for each
            pulseArray.push(vec4(0, 0, 0, 1.0));
            colors.push(vec4(1.0, 1.0, 1.0, 1.0));
        }

        let cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW); //create color buffer

        let vColor = gl.getAttribLocation(program, "vColor");
        gl.enableVertexAttribArray(vColor);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0); //enable coloring

        let mBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pulseArray), gl.STATIC_DRAW); //create VBO

        let mPosition = gl.getAttribLocation(program, "nTranslate");
        gl.enableVertexAttribArray(mPosition);
        gl.vertexAttribPointer(mPosition, 4, gl.FLOAT, false, 0, 0); //enable attribute

        gl.drawArrays(gl.LINE_STRIP, 0, normalArray[i].length); //draw one line
    }
}

//draws the current contents of the polyline array
function makeDrawing(){
    let up = vec3(0.0, 1.0, 0.0);
    let viewMatrix = lookAt(eye, at, up);

    let viewMatrixLoc = gl.getUniformLocation(program, 'viewMatrix');
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear screen
    let projMatrixLoc = gl.getUniformLocation(program, "projMatrix");
    gl.uniformMatrix4fv(projMatrixLoc, false, flatten(projMatrix)); //load in projection matrix

    let MMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(MMatrixLoc, false, flatten(modelMatrix));

    for(let i = 0; i < faceArray.length; i++){ //for each polyline in pointsArray
        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(faceArray[i]), gl.STATIC_DRAW); //create VBO

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0); //enable attribute

        let colors = [];
        let mVec = vec4(normalArray[i][1][0]*pulseDist, normalArray[i][1][1]*pulseDist, normalArray[i][1][2]*pulseDist, 1);
        let pulseArray = [];
        for(let j = 0; j < faceArray[i].length; j++){ //push enough color vectors for each
            pulseArray.push(mVec);
            colors.push(vec4(1.0, 1.0, 1.0, 1.0));
        }

        let cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW); //create color buffer

        let vColor = gl.getAttribLocation(program, "vColor");
        gl.enableVertexAttribArray(vColor);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0); //enable coloring

        let mBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pulseArray), gl.STATIC_DRAW); //create VBO

        let mPosition = gl.getAttribLocation(program, "nTranslate");
        gl.enableVertexAttribArray(mPosition);
        gl.vertexAttribPointer(mPosition, 4, gl.FLOAT, false, 0, 0); //enable attribute

        gl.drawArrays(gl.LINE_LOOP, 0, faceArray[i].length); //draw one line
    }
    if(drawNorms){
        drawNormals();
    }
}


function pulse() {
    if(!pulseOn){
        return;
    } else if (pulseDist - 1 > 0){
        breathingIn = true;
    } else if (pulseDist < 0){
        breathingIn = false;
    }

    if(breathingIn){
        pulseDist -= 0.01;
    } else {
        pulseDist += 0.01;
    }

    makeDrawing();

    id = requestAnimationFrame(pulse);

}
