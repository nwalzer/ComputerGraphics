/* EXTRA FEATURES:
    - Press 'u' to delete the most recent vertex (draw mode only)
    - Draw lines using the color selected from the custom color box
    - Drawing a single point on the screen displays the point
    - Use the arrow keys to translate your file or drawing by 1px per press

    A more detailed explanation of these features can be found in the
    Extra Features section of README.txt
*/


let pointsArray = [], faceArray = [], projMatrix = [];
let gl;
let program;
let canvas;

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


    window.onkeydown = function(event) {
        let key = event.key;
        switch(key){
            case 'c':
                makeDrawing(); //redraw using current color
                break;
            case 'b':
                break;
            case 'u':
                break;
            case 'ArrowRight':
                translateDraw(1, 0); //translate one pixel to the right
                break;
            case 'ArrowLeft':
                translateDraw(-1, 0); //translate one pixel to the left
                break;
            case 'ArrowUp':
                translateDraw(0, 1); //translate one pixel up
                break;
            case 'ArrowDown':
                translateDraw(0, -1); //translate one pixel down
                break;
        }
    };
    //gl.viewport(0, 0, canvas.width, canvas.height);
}

//Translates the drawing on the screen
function translateDraw(){
    let x = parseFloat(arguments[0]);
    let y = parseFloat(arguments[1]);

    makeDrawing();
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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear screen
    let projMatrixLoc = gl.getUniformLocation(program, "projMatrix");
    gl.uniformMatrix4fv(projMatrixLoc, false, flatten(projMatrix)); //load in projection matrix

    for(let i = 0; i < faceArray.length; i++){ //for each polyline in pointsArray
        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(faceArray[i]), gl.STATIC_DRAW); //create VBO

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0); //enable attribute

        let colors = [];
        for(let j = 0; j < faceArray[i].length; j++){ //push enough color vectors for each vertex
            colors.push(vec4(1.0, 1.0, 1.0, 1.0));
        }

        let cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW); //create color buffer

        let vColor = gl.getAttribLocation(program, "vColor");
        gl.enableVertexAttribArray(vColor);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0); //enable coloring

        gl.drawArrays(gl.LINE_LOOP, 0, faceArray[i].length); //draw one line
    }
}
