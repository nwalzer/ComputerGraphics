let pointsArray;
let gl;
let program;
let canvas;
let projMatrix;

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');


    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer:true});
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Get file input button and add event handler
    let fileInput = document.getElementById("drawModeFile");
    fileInput.addEventListener("change", drawFile);

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport

    /*let points = [];
    points.push(vec4(-0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.0, 0.5, 0.0, 1.0));

    /*let pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);*/


    /*let colors = [];
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
    gl.uniform1f(vPointSize,10.0)*/

    //gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //LINE_LOOP = connect the dots sequentially
    //TRIANGLE = make consecutive triangles colored in
    //gl.drawArrays(gl.TRIANGLES, 0, points.length);

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

function makeDrawing(total){
    gl.clear(gl.COLOR_BUFFER_BIT);
    let projMatrixLoc = gl.getUniformLocation(program, "projMatrix");
    gl.uniformMatrix4fv(projMatrixLoc, false, flatten(projMatrix));

    for(let i = 0; i < total; i++){
        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray[i]), gl.STATIC_DRAW);

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

        let colors = [];
        for(let j = 0; j < pointsArray[i].length; j++){
            colors.push(vec4(0.0, 0.0, 0.0, 1.0));
        }

        let cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

        let vColor = gl.getAttribLocation(program, "vColor");
        gl.enableVertexAttribArray(vColor);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINE_STRIP, 0, pointsArray[i].length);
        console.log(i);
    } // */
}

function drawFile(evt){
    let files = evt.target.files; // FileList object
    if(files.length === 0){
        return;
    }
    let f = files[0];

    let reader = new FileReader();
    reader.onload = (function(theFile) {
        return function(e) {
            let contents = atob(e.target.result.split("base64,")[1]);
            contents = contents.slice(contents.lastIndexOf("*")+1);
            let temp = contents.split(/\s+/);
            let left = parseFloat(temp[1]);
            let top = parseFloat(temp[2]);
            let right = parseFloat(temp[3]);
            let bottom = parseFloat(temp[4]);
            console.log(left);
            console.log(top);
            console.log(right);
            console.log(bottom);

            projMatrix = ortho(left, right, bottom, top, -1.0, 1.0);
            if((right-left) / (top-bottom) < 1){
                gl.viewport(0, 0, (400*(right-left))/(top-bottom), 400);
            } else {
                gl.viewport(0, 0, 400, (400*(top-bottom))/(right-left));
            }

            pointsArray = [];
            let vertices = [];
            let lines = contents.split("\n");
            let paCounter = 0;
            for(let i = 1; i < lines.length; i++){
                if(lines[i].includes(left) && lines[i].includes(top) && lines[i].includes(right) && lines[i].includes(bottom)){
                    paCounter = parseInt(lines[i+1])
                    console.log("# lines: " + paCounter);
                    i += 1;
                } else {
                    vertices = [];
                    let numVerts = parseInt(lines[i]);
                    for(let j = 1; j < numVerts+1; j++){
                        let thisLine = lines[i+j].split(/\s+/);
                        vertices.push(vec4(parseFloat(thisLine[1]), parseFloat(thisLine[2]), 0.0, 1.0));
                    }
                    pointsArray.push(vertices);
                    i += numVerts
                }
            }
            makeDrawing(paCounter)
        };
    })(f);
    reader.readAsDataURL(f)
}

