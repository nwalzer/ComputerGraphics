
function drawPoint(evt){
    if(pointsArray.length === 0){
        pointsArray.push([])
    }
    pointsArray[0].push(vec4(evt.offsetX, evt.offsetY, 0.0, 1.0))

    gl.clear(gl.COLOR_BUFFER_BIT); //clear screen
    projMatrix = ortho(0, 400, 0, 400, -1.0, 1.0);
    gl.viewport(0, 0, 400, 400);
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

        gl.drawArrays(gl.LINE_STRIP, 0, pointsArray[i].length); //draw one line
    }
    console.log(evt);
}