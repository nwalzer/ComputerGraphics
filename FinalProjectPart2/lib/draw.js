
//draws all of the white lines which connect objects together
function connect(){
    gl.uniform1f(gl.getUniformLocation(program, "type"), 2.0);
    if(enableSin){ //if we are translating due to sinusoid
        generateLines(); //regenerate lines
    }

    setDiffuseColor(colorArray[6]);

    gl.uniform1f(gl.getUniformLocation(program, "vTexture"), 2.0);

    for(let i = 0; i < linesArray.length; i++) { //for each line
        let lineNormal = [];
        let tCoordBuff = [];
        if(i > 1){ //if we are dealing with a non-top-level line
            stack.push(mvMatrix); //store current model matrix
            let temp = linesArray[i][0]; //get first vertex value
            mvMatrix = mult(mvMatrix, translate(temp[0], 0, temp[2])); //translate back from origin
            mvMatrix = mult(mvMatrix, rotateY(theta2)); //rotate on y axis
            mvMatrix = mult(mvMatrix, translate(-temp[0], 0, -temp[2])); //translate to origin
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) ); //load model matrix

            //this loop tricks the program into thinking the lines are always facing the light source
            //which ensures the lines remain lit up at all theta values while they are in the spotlight
            let inv = inverse4(mvMatrix);
            for (let j = 0; j < linesArray[i].length; j++) {
                lineNormal.push(mult(inv, lightPosition));
                lineNormal[j][3] = 1.0;
                tCoordBuff.push(texCoord[0]);
            }
            mvMatrix = stack.pop();
        } else {
            //this loop tricks the program into thinking the lines are always facing the light source
            //which ensures the lines remain lit up at all theta values while they are in the spotlight
            let inv = inverse4(mvMatrix);
            for (let j = 0; j < linesArray[i].length; j++) {
                lineNormal.push(mult(inv, lightPosition));
                tCoordBuff.push(texCoord[0]);
            }
        }

        loadNormals(lineNormal);
        loadTexCoords(tCoordBuff);
        loadVertices(linesArray[i]);

        gl.drawArrays(gl.LINE_STRIP, 0, linesArray[i].length); //draw this line
    }
}

//Draws the given shape using the given color
function drawShape(shape, color, isCube) {
    gl.uniform1f(gl.getUniformLocation(program, "type"), 0.0);
    gl.uniform1f(gl.getUniformLocation(program, "vTexture"), 2.0);

    let tCoordBuff = [];
    for (let i = 0; i < shape.length; i++) {
        tCoordBuff.push(texCoord[0]);
    }

    loadTexCoords(tCoordBuff);

    if (arguments.length === 4) { //if this is a .ply file
        if (useFlat && !enableRefract && !enableReflect) { //if we are using flat shading
            loadNormals(fileFlatNormal);
        } else {
            loadNormals(fileGNormal);
        }
    } else if (isCube) { //if shape is cube
        if (useFlat && !enableRefract && !enableReflect) { //if using flat shading
            console.log("Loaded Flat", enableReflect, enableRefract);
            loadNormals(cubeFlatNormal);
        } else {
            console.log("Loaded G");
            loadNormals(cubeGNormal);
        }
    } else { //if shape is sphere
        if (useFlat && !enableRefract && !enableReflect) { //if using flat shading
            loadNormals(sphereFlatNormal);
        } else {
            loadNormals(sphereGNormal);
        }
    }

    setDiffuseColor(color);
    loadVertices(shape);

    gl.drawArrays(gl.TRIANGLES, 0, shape.length);

    if(enableShadows){
        if (arguments.length === 4) {
            loadNormals(fileFlatNormal)
        } else if (isCube) {
            loadNormals(cubeFlatNormal)
        } else {
            loadNormals(sphereFlatNormal)
        }
    }
}

//Draws the given shape using the given color
function drawWall(wall, id) {
    gl.uniform1f(gl.getUniformLocation(program, "type"), -1.0);

    setDiffuseColor(colorArray[6]);

    if(!enableTextures){
        gl.uniform1f(gl.getUniformLocation(program, "vTexture"), 2.0);
        if(id === "Wall"){
            setDiffuseColor(colorArray[2]);
        } else {
            setDiffuseColor(colorArray[6]);
        }
    } else if(id === "Wall"){
        gl.uniform1f(gl.getUniformLocation(program, "vTexture"), 1.0);
    } else {
        gl.uniform1f(gl.getUniformLocation(program, "vTexture"), 0.0);
    }

    loadTexCoords(texCoordsArray);
    loadNormals(wallNormals);
    loadVertices(wall);

    gl.drawArrays( gl.TRIANGLES, 0, wall.length);

}

//draws a given bounding box
function drawBB(box){
    gl.uniform1f(gl.getUniformLocation(program, "type"), 2.0);

    if(enableShadows){
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix));
    }

    setDiffuseColor(colorArray[6]);

    for(let i = 0; i < box.length; i++){ //for each face of bounding box
        let lineNormal = [];
        //the same logic applies to this loop as it did in the connect() function
        //we trick the program in thinking all lines are facing the light all the time
        let inv = inverse4(mvMatrix);
        for (let j = 0; j < box[i].length; j++) {
            lineNormal.push(mult(inv, lightPosition));
        }
        loadNormals(lineNormal);
        loadVertices(box[i]);

        gl.drawArrays(gl.LINE_LOOP, 0, box[i].length); //draw box face
    }
}

function drawShadow(shape, level, x, y, x2){
    gl.uniform1f(gl.getUniformLocation(program, "type"), 1.0);
    let modelMatrix = lookAt(eye, at , up);

    if(level === 1){
        modelMatrix = mult(modelMatrix, translate(lightPosition[0]+x, lightPosition[1]+y, lightPosition[2]-wallSize+1));
        modelMatrix = mult(modelMatrix, shadowMatrix);
        modelMatrix = mult(modelMatrix, translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]));
        modelMatrix = mult(modelMatrix, rotateY(theta));
    } else if(level === 2){
        let xPos = x*Math.cos(theta * Math.PI/180);
        modelMatrix = mult(modelMatrix, translate(lightPosition[0]+xPos, lightPosition[1]+y, lightPosition[2]-wallSize+1));
        modelMatrix = mult(modelMatrix, shadowMatrix);
        modelMatrix = mult(modelMatrix, translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]));
        modelMatrix = mult(modelMatrix, rotateY(theta2+theta));
    } else {
        let xPos = x*Math.cos(theta * Math.PI/180);
        xPos += x2*Math.cos((theta2+theta) * Math.PI/180);
        modelMatrix = mult(modelMatrix, translate(lightPosition[0]+xPos, lightPosition[1]+y, lightPosition[2]-wallSize+1));
        modelMatrix = mult(modelMatrix, shadowMatrix);
        modelMatrix = mult(modelMatrix, translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]));
        modelMatrix = mult(modelMatrix, rotateY(theta3+theta2+theta));
    }

    gl.uniformMatrix4fv( modelView, false, flatten(modelMatrix));

    setDiffuseColor(colorArray[8]);

    gl.drawArrays( gl.TRIANGLES, 0, shape.length );
}

function loadNormals(normArray){
    var vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normArray), gl.STREAM_DRAW); //load flat normals

    var vNormalPosition = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition); //load normals
}

function loadVertices(vertexArray){
    let pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexArray), gl.STREAM_DRAW); //load vertices

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition); //load vertices
}

function loadTexCoords(coordArray){
    let tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(coordArray), gl.STATIC_DRAW );

    let tPosition = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( tPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( tPosition );
}

function setDiffuseColor(color){
    let diffuseProduct = mult(lightDiffuse, color); //set diffuse lighting to use provided color
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
}