/* EXTRA FEATURES:
    - Press 'n' to draw surface normals
    - Specify custom mesh colors using the mesh color picker box
    - Specify custom surface normal colors using normal color picker box
    - Press the reset button to restore the drawing to its original positioning
    - Press the Toggle Mesh button to swap between a mesh and a filled object

    A more detailed explanation of these features can be found in the
    Extra Features section of README.txt
*/


let pointsArray = [], faceArray = [], projMatrix = [], modelMatrix = [], normalArray = [];
let gl, program, canvas;
let currentZ = 0, currentX = 0, currentY = 0, pulseDist = 0, theta = 0, across = 0, tall = 0, deep = 0, tX = 0, tY = 0, tZ = 0;
let breathingIn = false, translating = false, pulseOn = false, rotateOn = false, drawNorms = false, zoomOn = false, isMesh = true, animated = false;
let mcolor, ncolor;

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer:true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST); //enable Z buffer
    gl.clearColor(0.0, 0.0, 0.0, 1.0); //clear to black
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Get file input button and add event handler
    let fileInput = document.getElementById("drawModeFile");
    fileInput.addEventListener("change", parseFile); //add event listener to the file upload button

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    var vPointSize = gl.getUniformLocation(program, "vPointSize");
    gl.uniform1f(vPointSize, 5.0);
    gl.viewport(0, 0, 400, 400); //static viewport

    modelMatrix = mat4(); //initialize model and projection matrices
    projMatrix = mat4();

    window.onkeydown = function(event) {
        let el = document.getElementById("drawModeFile");
        if(el.value === ""){
            return;
        }
        let key = event.key;
        switch(key){
            case 'b':
                pulseOn = !pulseOn; //toghle pulsing
                if(pulseOn && !animated){ //if alter drawing is not already on, turn it on
                    animated = true;
                    alterDrawing();
                }
                break;
            case 'z':
                zoomOn = ! zoomOn; //toggle zooming
                tZ = 1; //set zoom increment
                if(zoomOn && !animated){ //if alter drawing is not already on, turn it on
                    animated = true;
                    alterDrawing();
                }
                break;
            case 'a':
                zoomOn = !zoomOn; //toggle zooming
                tZ = -1; //set zoom increment
                if(zoomOn && !animated){ //if alter drawing is not already on, turn it on
                    animated = true;
                    alterDrawing();
                }
                break;
            case 'x':
                translating = !translating; //toggle translation
                tX = 1; //set x increment
                tY = 0; //set y increment
                if(translating && !animated){ //if alter drawing is not already on, turn it on
                    animated = true;
                    alterDrawing();
                }
                break;
            case 'c':
                translating = !translating; //toggle translation
                tX = -1; //toggle x increment
                tY = 0; //toggle y increment
                if(translating && !animated){ //if alter drawing is not already on, turn it on
                    animated = true;
                    alterDrawing();
                }
                break;
            case 'y':
                translating = !translating; //toggle translation
                tX = 0; //set x increment
                tY = 1; //set y increment
                if(translating && !animated){ //if alter drawing is not already on, turn it on
                    animated = true;
                    alterDrawing();
                }
                break;
            case 'u':
                translating = !translating; //toggle translation
                tX = 0; //set x increment
                tY = -1; //set y increment
                if(translating && !animated){ //if alter drawing is not already on, turn it on
                    animated = true;
                    alterDrawing();
                }
                break;
            case 'r':
                rotateOn = !rotateOn; //toggle rotation
                if(rotateOn && !animated){ //if alter drawing is not already on, turn it on
                    animated = true;
                    alterDrawing();
                }
                break;
            case 'n':
                drawNorms = !drawNorms; //toggle drawing normals
                if(!animated){ //if we don't have an animation frame going, manually draw normals
                    makeDrawing();
                }
                break;
        }
    };

    mcolor = vec4(1.0, 1.0, 1.0, 1.0); //initialize mesh color
    ncolor = vec4(1.0, 0.0, 0.0, 1.0); //initialize normal color

    let meshcolor = document.getElementById("meshcolor");
    meshcolor.onchange = function(event){ //store and display user's choice of color
        hex2vec4(meshcolor.value.toString(), true); //convert hex value to RGB, store in color cycler
        makeDrawing(); //redraw using new color
    };
    let normcolor = document.getElementById("normcolor");
    normcolor.onchange = function(event){ //store and display user's choice of color
        hex2vec4(normcolor.value.toString(), false); //convert hex value to RGB, store in color cycler
        makeDrawing(); //redraw using new color
    };
    let rstbtn = document.getElementById("rstbtn");
    rstbtn.onclick = function(event){ //set reset button function
        reset(); //restore original drawing
        makeDrawing();
    };
    let meshToggle = document.getElementById("meshtoggle");
    meshToggle.onclick = function(){
        isMesh = !isMesh; //mesh toggle
        makeDrawing();
    };
}

//Handles rotation, pulse, and translate animations. Designed so that there is always at most one animation frame running
function alterDrawing(){
    if(rotateOn){ //if we want to rotate
        theta -= 0.5; //decrement theta
    }
    if(pulseOn){ //if we want to pulse
        if (pulseDist - 2 >= 0){ //if distance along normal > 100%
            breathingIn = true; //switch to breathing in
        } else if (pulseDist <= 0){ //if we are back to starting positions
            breathingIn = false; //switch to breathing out
        }

        if(breathingIn){ //if breathing in
            pulseDist -= 0.25; //decrement distance along normal vector
        } else { //if breathing out
            pulseDist += 0.25; //increment distance along normal vector
        }
    }
    if(translating){ //if we want to translate in the direction
        currentX += tX; //increment current x position
        currentY += tY; //increment current y position
    }
    if(zoomOn){ //if we want to zoom
        currentZ += tZ; //increment current z position
    }
    if(translating || pulseOn || rotateOn || zoomOn){ //if any of the animations are on
        makeDrawing(); //make the drawing
        id = requestAnimationFrame(alterDrawing); //loop the function
    } else {
        animated = false;
    }
}

//Takes in a string representing a color value in hex and converts it to rgb in the range of [0.0, 1.0]
function hex2vec4(hval, isMesh){
    hval = hval.replace("#", ""); //get rid of #
    dval = parseInt(hval, 16); //get color in decimal
    let r = ((dval & 0xFF0000) >> 16)/255; //get r byte
    let g = ((dval & 0x00FF00) >> 8)/255; //get g byte
    let b = (dval & 0x0000FF)/255; //get b byte
    if(isMesh){ //if we are working with mesh coloring
        mcolor = vec4(r, g, b, 1.0); //set mesh color
    } else {
        ncolor = vec4(r, g, b, 1.0); //set normal color
    }
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
            colors.push(ncolor); //default normal color is red
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
    modelMatrix = mult(translate(across*0.01*currentX, tall*0.01*currentY, deep*0.5*currentZ), rotate(theta, vec3(1, 0, 0))); //always set model matrix to be sum of translations * sum of rotations
    let MMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(MMatrixLoc, false, flatten(modelMatrix)); //load in model matrix

    for(let i = 0; i < faceArray.length; i++){ //for each polyline in pointsArray

        let colors = [];
        let rawNormal = [normalArray[i][1][0]-normalArray[i][0][0], normalArray[i][1][1]-normalArray[i][0][1], normalArray[i][1][2]-normalArray[i][0][2]];
        //raw normal is the surface normal centered on the origin
        let mVec = vec4(rawNormal[0]*pulseDist, rawNormal[1]*pulseDist, rawNormal[2]*pulseDist, 1);
        //mVec is the normal vector scaled between 0 and 2x the unit normal vector length
        let toDraw = [];
        for(let j = 0; j < faceArray[i].length; j++){ //push enough color vectors for each
            toDraw.push(vec4(faceArray[i][j][0]+mVec[0], faceArray[i][j][1]+mVec[1], faceArray[i][j][2]+mVec[2], 1.0));
            //increment each vertex by given coordinate in scaled normal vector
            colors.push(mcolor); //push mesh color vectors
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

        if(isMesh){ //if we want to draw a mesh
            gl.drawArrays(gl.LINE_LOOP, 0, toDraw.length);
        } else { //if we want to draw a filled object
            gl.drawArrays(gl.TRIANGLES, 0, toDraw.length);
        }
    }

    if(drawNorms){ //if we want to draw normals
        drawNormals();
    }
}

//reset all animation handling and custom options to initial settings
function reset(){
    breathingIn = false; //used for pulse direction
    pulseDist = 0; //scalar of normal vector for pulsing
    currentZ = 0; //total Z translation
    currentY = 0; //total Y translation
    currentX = 0; //total X translation
    tX = 0; //x translate direction
    tY = 0; //y translate direction
    tZ = 0; //z translate direction
    theta = 0; //rotation angle
    translating = false; //translation animation
    pulseOn = false; //pulse animation
    rotateOn = false; //rotation animation
    drawNorms = false; //drawing normals
    zoomOn = false; //zooming animation
    isMesh = true; //draw a mesh or object
    animated = false; //animation frame running
}
