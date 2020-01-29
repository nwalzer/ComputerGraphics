let pointsArray;
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

    // Get file input button and add event handler
    let fileInput = document.getElementById("drawModeFile");
    fileInput.addEventListener("change", drawFile);

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    window.onkeypress = function(event) {
        let key = event.key;
        switch(key){
            case 'a':
                makeDrawing(62)
                break;
            case 's':
                makeDrawing(62)
                break;
        }
    }


}
