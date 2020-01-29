let pointsArray = [];
let gl;
let program;
let canvas;
let colorPicker = [];
let colorPointer;

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
    colorPointer = 0;
    colorPicker.push(vec4(0.0, 0.0, 0.0, 1.0));
    colorPicker.push(vec4(1.0, 0.0, 0.0, 1.0));
    colorPicker.push(vec4(0.0, 1.0, 0.0, 1.0));
    colorPicker.push(vec4(0.0, 0.0, 1.0, 1.0));

    window.onclick = function(event){
        let fmode = document.getElementById("fmode");
        if(fmode.classList.contains("hidden")){
            drawPoint(event);
        }
    };

    window.onkeypress = function(event) {
        let key = event.key;
        switch(key){
            case 'f':
                let fmode = document.getElementById("fmode");
                if(fmode.classList.contains("hidden")){
                   let dmode = document.getElementById("dmode");
                   dmode.classList.add("hidden");
                   fmode.classList.remove("hidden");
                   gl.clear(gl.COLOR_BUFFER_BIT);
                   pointsArray = [];
                }
                break;
            case 'd':
                let dmode = document.getElementById("dmode");
                if(dmode.classList.contains("hidden")){
                    let fmode = document.getElementById("fmode");
                    fmode.classList.add("hidden");
                    dmode.classList.remove("hidden");
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    pointArray = [];
                }
                break;
            case 'c':
                colorPointer = (colorPointer+1)%3;
                makeDrawing();
                break;
        }
    }


}
