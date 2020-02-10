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
let currentZ = 0, currentX = 0, currentY = 0, pulseDist = 0, theta = 0, across = 0, tall = 0, deep = 0;
let breathingIn = false, moveX = false, pulseOn = false, rotateOn = false, drawNorms = false;

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
        let el = document.getElementById("drawModeFile");
        if(el.value === ""){
            return;
        }
        let key = event.key;
        switch(key){
            case 'b':
                pulseOn = !pulseOn;
                if(pulseOn && !moveX && !rotateOn){ //if alter drawing is not already on, turn it on
                    alterDrawing();
                }
                break;
            case 'z':
                zoom(1); //translate drawing 1 unit in +z direction
                break;
            case 'a':
                zoom(-1); //translate drawing 1 unit in -z direction
                break;
            case 'x':
                moveX = !moveX;
                if(moveX && !pulseOn && !rotateOn){ //if alter drawing is not already on, turn it on
                    alterDrawing();
                }
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
                if(rotateOn && !pulseOn && !moveX){ //if alter drawing is not already on, turn it on
                    alterDrawing();
                }
                break;
            case 'n':
                drawNorms = !drawNorms;
                if(!rotateOn && !pulseOn && !moveX){ //if we don't have an animation frame going, manually draw normals
                    makeDrawing();
                }
                break;
        }
    };
}

//Handles rotation, pulse, and translate animations. Designed so that there is always at most one animation frame running
function alterDrawing(){
    if(rotateOn){ //if we want to rotate
        theta -= 0.5; //decrement theta
    }
    if(pulseOn){ //if we want to pulse
        if (pulseDist - 0.5 >= 0){ //if distance along normal > 100%
            breathingIn = true; //switch to breathing in
        } else if (pulseDist <= 0){ //if we are back to starting positions
            breathingIn = false; //switch to breathing out
        }

        if(breathingIn){ //if breathing in
            pulseDist -= 0.01; //decrement distance along normal vector
        } else { //if breathing out
            pulseDist += 0.01; //increment distance along normal vector
        }
    }
    if(moveX){ //if we want to translate in the +x direction
        currentX += 1; //increment current x position
    }
    if(moveX || pulseOn || rotateOn){ //if any of the animations are on
        makeDrawing(); //make the drawing
        id = requestAnimationFrame(alterDrawing); //loop the function
    }
}

//handles zooming
function zoom(){
    currentZ += arguments[0]; //increment currentZ position by given amount
    if(!moveX && !pulseOn && !rotateOn){ //if no animations are running, manually draw
        makeDrawing();
    }
}

//Translates the drawing on the screen in x and y directions
function translateDraw(){
    currentX += parseFloat(arguments[0]); //increment x position by first argument
    currentY += parseFloat(arguments[1]); //increment y position by second argument
    if(!moveX && !pulseOn && !rotateOn){ //if no animations are running, manually draw
        makeDrawing();
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

//virtually the exact same code as make drawings, except this will draw the normal array rather than the face array
function drawNormals(){
    for(let i = 0; i < normalArray.length; i++){ //for each normal in normalArray
        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalArray[i]), gl.STREAM_DRAW); //create VBO

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0); //enable attribute

        let colors = [];
        for(let j = 0; j < normalArray[i].length; j++){ //push enough color vectors for each
            colors.push(vec4(1.0, 0.0, 0.0, 1.0)); //default normal color is red
        }

        let cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STREAM_DRAW); //create color buffer

        let vColor = gl.getAttribLocation(program, "vColor");
        gl.enableVertexAttribArray(vColor);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0); //enable coloring

        gl.drawArrays(gl.LINE_STRIP, 0, normalArray[i].length); //draw one line
    }
}

//draws the current contents of the face array
function makeDrawing(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear screen

    let projMatrixLoc = gl.getUniformLocation(program, "projMatrix");
    gl.uniformMatrix4fv(projMatrixLoc, false, flatten(projMatrix)); //load in projection matrix

    //create model matrix from current relevant information
    modelMatrix = mult(translate(across*0.01*currentX, tall*0.01*currentY, deep*0.01*currentZ), rotate(theta, vec3(1, 0, 0)));
    let MMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(MMatrixLoc, false, flatten(modelMatrix)); //load in model matrix

    for(let i = 0; i < faceArray.length; i++){ //for each polyline in pointsArray

        let colors = [];
        let rawNormal = [normalArray[i][1][0]-normalArray[i][0][0], normalArray[i][1][1]-normalArray[i][0][1], normalArray[i][1][2]-normalArray[i][0][2]];
        //let mVec = vec4(normalArray[i][1][0]*pulseDist, normalArray[i][1][1]*pulseDist, normalArray[i][1][2]*pulseDist, 1);
        let mVec = vec4(rawNormal[0]*pulseDist, rawNormal[1]*pulseDist, rawNormal[2]*pulseDist, 1);
        let toDraw = [];
        for(let j = 0; j < faceArray[i].length; j++){ //push enough color vectors for each
            toDraw.push(vec4(faceArray[i][j][0]+mVec[0], faceArray[i][j][1]+mVec[1], faceArray[i][j][2]+mVec[2], 1.0));
            //pulseArray.push(mVec);
            colors.push(vec4(1.0, 1.0, 1.0, 1.0));
        }
        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(toDraw), gl.STREAM_DRAW); //create VBO

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0); //enable attribute

        let cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STREAM_DRAW); //create color buffer

        let vColor = gl.getAttribLocation(program, "vColor");
        gl.enableVertexAttribArray(vColor);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0); //enable coloring

        gl.drawArrays(gl.LINE_LOOP, 0, toDraw.length);
    }

    if(drawNorms){ //if we want to draw normals
        drawNormals();
    }
}
