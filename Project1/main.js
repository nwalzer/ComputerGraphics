function main()
{
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Get file input button and add event handler
    var fileInput = document.getElementById("drawModeFile");
    fileInput.addEventListener("change", draw);

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport
    gl.viewport( 0, 0, canvas.width, canvas.height );

    var points = [];
    points.push(vec4(-0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.0, 0.5, 0.0, 1.0));

    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);


    var colors = [];
    colors.push(vec4(1.0, 0.5, 0.0, 1.0));
    colors.push(vec4(0.0, 1.0, 0.0, 1.0));
    colors.push(vec4(0.0, 0.0, 1.0, 1.0));

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);


    var vPointSize = gl.getUniformLocation(program, "vPointSize");
    gl.uniform1f(vPointSize,10.0)

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //LINE_LOOP = connect the dots sequentially
    //TRIANGLE = make consecutive triangles colored in
    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    window.onkeypress = function(event) {
        var key = event.key;
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

function draw(){
    var fileInput = document.getElementById("drawModeFile");
    if(fileInput.files.length == 0){
        console.log("No File Detected");
        return;
    } else if(fileInput.files.length == 1){
        var file = fileInput.files[0];
        console.log(file);
        console.log(fileInput.files[0].toString());
        console.log(fileInput.files[0].valueOf());
        var contents = String(file.text());
        console.log(contents);
    } else {
        console.log("Error: Multiple Files Detected");
        return;
    }
}