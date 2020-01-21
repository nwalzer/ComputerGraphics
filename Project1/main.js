function main() {
    // Retrieve <canvas> element
    let canvas = document.getElementById('webgl');


    // Get the rendering context for WebGL
    let gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Get file input button and add event handler
    let fileInput = document.getElementById("drawModeFile");
    fileInput.addEventListener("change", draw);

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport
    gl.viewport( 0, 0, canvas.width, canvas.height );

    let points = [];
    points.push(vec4(-0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.0, 0.5, 0.0, 1.0));

    let pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);


    let colors = [];
    colors.push(vec4(1.0, 0.5, 0.0, 1.0));
    colors.push(vec4(0.0, 1.0, 0.0, 1.0));
    colors.push(vec4(0.0, 0.0, 1.0, 1.0));

    let cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    let vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);


    let vPointSize = gl.getUniformLocation(program, "vPointSize");
    gl.uniform1f(vPointSize,10.0)

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //LINE_LOOP = connect the dots sequentially
    //TRIANGLE = make consecutive triangles colored in
    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    window.onkeypress = function(event) {
        let key = event.key;
        switch(key){
            case 'a':
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLES, 0, points.length);
                break;
            case 's':
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.POINTS, 0, points.length);
                break;
        }
    }

    window.onclick = function(event) {
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}

function draw(evt){
    let files = evt.target.files; // FileList object
    for (let i = 0, f; f = files[i]; i++) {
        let reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                console.log(atob(e.target.result.split("base64,")[1]))
            };
        })(f);
        reader.readAsDataURL(f)
    }
}

//document.getElementById('files').addEventListener('change', handleFileSelect, false);
