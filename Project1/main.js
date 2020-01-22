let pointsArray;
let gl;
let program;

function main() {
    // Retrieve <canvas> element
    let canvas = document.getElementById('webgl');


    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas);
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
    gl.viewport( 0, 0, canvas.width, canvas.height );

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
                makeDrawing()
                break;
            case 's':
                makeDrawing()
                break;
        }
    }


}

function makeDrawing(total){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    let colors = [];
    colors.push(vec4(0.0, 0.0, 0.0, 1.0));

    let cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    let vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

    let vPointSize = gl.getUniformLocation(program, "vPointSize");
    gl.uniform1f(vPointSize,50.0)

    let i = 0;
    //TODO: Find out why every call of this overwrites previous data
    setInterval(function(){
        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray[i]), gl.STATIC_DRAW);

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINE_LOOP, 0, pointsArray[i].length);
        console.log(i);
        console.log(pointsArray[i]);
        i++;
    }, 1000) // */
    /*let pBuffer = [total]
    for(let i = 0; i < total; i++){
        pBuffer[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer[i]);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray[i]), gl.STATIC_DRAW);

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINE_LOOP, 0, pointsArray[i].length);
        console.log(i);
        //console.log(pointsArray[i]);
        //i = 100
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
            let contents = atob(e.target.result.split("base64,")[1])
            contents = contents.slice(contents.lastIndexOf("*")+1)
            let temp = contents.split(/\s+/)
            let left = temp[1];
            let top = temp[2];
            let right = temp[3];
            let bottom = temp[4];
            console.log(left)
            console.log(top)
            console.log(right)
            console.log(bottom)
            //TODO: Figure out what left, top, right, and bottom do
            gl.viewport( 0, 0, Math.abs(left-right)*400, Math.abs(top-bottom)*400);

            pointsArray = []
            let vertices = [];
            let lines = contents.split("\n");
            let paCounter = 0;
            for(let i = 1; i < lines.length; i++){
                if(lines[i].includes(left) && lines[i].includes(top) && lines[i].includes(right) && lines[i].includes(bottom)){
                    paCounter = parseInt(lines[i+1])
                    console.log("# lines: " + parseInt(lines[i+1]));
                    i += 1;
                } else {
                    vertices = [];
                    let numVerts = parseInt(lines[i])
                    //console.log(numVerts)
                    for(let j = 1; j < numVerts+1; j++){
                        var thisLine = lines[i+j].split(/\s+/)
                        vertices.push(vec4(parseFloat(thisLine[1]), parseFloat(thisLine[2]), 0.0, 1.0));
                    }
                    pointsArray.push(vertices)
                    i += numVerts
                }
            }
            makeDrawing(paCounter)
        };
    })(f);
    reader.readAsDataURL(f)
}

