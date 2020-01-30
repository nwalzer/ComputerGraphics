let pointsArray = [];
let gl;
let program;
let canvas;
let colorPicker = [];
let colorPointer = 0;
let projMatrix = [];

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer:true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    projMatrix = ortho(0, 400, 0, 400, -1.0, 1.0); //initialize projection matrix and viewport
    gl.viewport(0, 0, 400, 400);

    // Get file input button and add event handler
    let fileInput = document.getElementById("drawModeFile");
    fileInput.addEventListener("change", parseFile); //add event listener to the file upload button

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    var vPointSize = gl.getUniformLocation(program, "vPointSize");
    gl.uniform1f(vPointSize, 5.0);

    colorPicker.push(vec4(0.0, 0.0, 0.0, 1.0));
    colorPicker.push(vec4(1.0, 0.0, 0.0, 1.0));
    colorPicker.push(vec4(0.0, 1.0, 0.0, 1.0));
    colorPicker.push(vec4(0.0, 0.0, 1.0, 1.0)); //initialize the color cycler

    let bHold = false; //needed for
    canvas.onclick = function(event){ //draw mode event handler
        let fmode = document.getElementById("fmode");
        if(fmode.classList.contains("hidden")){ //if we are in draw mode
            //if b is being held down and we are not already working with a new array
            if(bHold && pointsArray[pointsArray.length-1].length !== 0){
                pointsArray.push([]);
            }
            drawPoint(event); //add new click to point array
        }
    };

    let custcolor = document.getElementById("custcolor");
    custcolor.onchange = function(event){ //store and display user's choice of color
        if(colorPicker.length === 5){ //if custom color already stored
            colorPicker.pop(); //get rid of it
            //by default, I only allow one custom color to be stored
        }
        colorPointer = 4; //will make it so lines are drawn with custom color
        hex2vec4(custcolor.value.toString()); //convert hex value to RGB, store in color cycler
        makeDrawing(); //redraw using new color
    };


    window.onkeydown = function(event) {
        let key = event.key;
        let fmode = document.getElementById("fmode");
        let dmode = document.getElementById("dmode");
        switch(key){
            case 'f':
                if(fmode.classList.contains("hidden")){ //if we are in draw mode
                   dmode.classList.add("hidden"); //hide drawmode
                   fmode.classList.remove("hidden"); //show filemode
                   document.getElementById("drawModeFile").disabled = false; //enable file input
                   gl.clear(gl.COLOR_BUFFER_BIT); //clear screen
                   pointsArray = []; //wipe stored points
                }
                break;
            case 'd':
                if(dmode.classList.contains("hidden")){ //if in file mode
                    fmode.classList.add("hidden"); //hide filemode
                    dmode.classList.remove("hidden"); //show drawmode
                    document.getElementById("drawModeFile").disabled = true; //disable file input
                    gl.clear(gl.COLOR_BUFFER_BIT); //clear screen
                    pointsArray = []; //wipe stored points

                    //set default projection matrix and viewport
                    projMatrix = ortho(0, 400, 0, 400, -1.0, 1.0);
                    gl.viewport(0, 0, 400, 400);
                }
                break;
            case 'c':
                colorPointer = (colorPointer+1)%colorPicker.length; //cycle to next color
                makeDrawing(); //redraw using current color
                break;
            case 'b':
                if(!dmode.classList.contains("hidden")){ //if we are in draw mode
                    bHold = true; //update hold variable
                }
                break;
            case 'u':
                if(!dmode.classList.contains("hidden")){ //if we are in draw mode
                    const lstIdx = pointsArray.length - 1; //get the index of the current polyline
                    if(lstIdx > -1){ //if at least one polyline exists
                        if(pointsArray[lstIdx].length > 0){ //if there is a point we can delete
                            pointsArray[lstIdx].pop(); //pop it off
                        } else {
                            pointsArray.pop(); //pop the entire polyline array off
                        }
                        makeDrawing(); //redraw
                    }
                }
        }
    };

    window.onkeyup = function(evt){
        let key = evt.key;
        switch(key){
            case 'b':
                bHold = false;
                //if we let go of b, set hold variable to false
                break;
        }
    };


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

//draws the current contents of the polyline array
function makeDrawing(){
    gl.clear(gl.COLOR_BUFFER_BIT); //clear screen
    let projMatrixLoc = gl.getUniformLocation(program, "projMatrix");
    gl.uniformMatrix4fv(projMatrixLoc, false, flatten(projMatrix)); //load in projection matrix

    for(let i = 0; i < pointsArray.length; i++){ //for each line drawing in pointsArray
        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray[i]), gl.STATIC_DRAW); //create VBO

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0); //enable attribute

        let colors = [];
        for(let j = 0; j < pointsArray[i].length; j++){ //push enough color vectors for each vertex
            colors.push(colorPicker[colorPointer]);
        }

        let cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW); //create color buffer

        let vColor = gl.getAttribLocation(program, "vColor");
        gl.enableVertexAttribArray(vColor);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0); //enable coloring

        if(pointsArray[i].length !== 1){
            gl.drawArrays(gl.LINE_STRIP, 0, pointsArray[i].length); //draw one line
        } else {
            gl.drawArrays(gl.POINTS, 0, pointsArray[i].length); //draw one line
        }
    }
}
