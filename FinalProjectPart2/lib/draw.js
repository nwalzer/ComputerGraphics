
//draws all of the white lines which connect objects together
function connect(){
    if(enableSin){ //if we are translating due to sinusoid
        generateLines(); //regenerate lines
    }

    let diffuseProduct = mult(lightDiffuse, colorArray[6]); //set diffuse to line color
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));

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
        var vNormal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(lineNormal), gl.STREAM_DRAW); //load normals

        var vNormalPosition = gl.getAttribLocation( program, "vNormal");
        gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormalPosition); //load normals

        let tBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(tCoordBuff), gl.STATIC_DRAW );

        let tPosition = gl.getAttribLocation( program, "vTexCoord" );
        gl.vertexAttribPointer( tPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( tPosition );

        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(linesArray[i]), gl.STREAM_DRAW); //load vertices

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition); //load vertices

        gl.drawArrays(gl.LINE_STRIP, 0, linesArray[i].length); //draw this line
    }
}

//Draws the given shape using the given color
function drawShape(shape, color, isCube) {
    gl.uniform1f(gl.getUniformLocation(program, "vTexture"), 2.0);
    let tCoordBuff = [];
    for(let i = 0; i < shape.length; i++){
        tCoordBuff.push(texCoord[0]);
    }

    let tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(tCoordBuff), gl.STATIC_DRAW );

    let tPosition = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( tPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( tPosition );

    if(arguments.length === 4){ //if this is a .ply file
        if(useFlat){ //if we are using flat shading
            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(fileFlatNormal), gl.STREAM_DRAW); //load flat normals
        } else {
            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(fileGNormal), gl.STREAM_DRAW); //load gouraud normals
        }
    }
    else if(isCube){ //if shape is cube
        if(useFlat){ //if using flat shading
            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeFlatNormal), gl.STREAM_DRAW); //load flat normals
        } else {
            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeGNormal), gl.STREAM_DRAW); //load gouraud normals
        }
    } else { //if shape is sphere
        if(useFlat){ //if using flat shading
            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereFlatNormal), gl.STREAM_DRAW); //load flat normals
        } else {
            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereGNormal), gl.STREAM_DRAW); //load gouraud normals
        }
    }

    var vNormalPosition = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition); //load normals

    let diffuseProduct = mult(lightDiffuse, color); //set diffuse lighting to use provided color
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));

    let pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(shape), gl.STREAM_DRAW); //load vertices

    let vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition); //load vertices

    gl.drawArrays( gl.TRIANGLES, 0, shape.length );

}

//Draws the given shape using the given color
function drawWall(wall, id) {
    if(!enableTextures){
        gl.uniform1f(gl.getUniformLocation(program, "vTexture"), 2.0);
    } else if(id === "Wall"){
        gl.uniform1f(gl.getUniformLocation(program, "vTexture"), 1.0);
    } else {
        gl.uniform1f(gl.getUniformLocation(program, "vTexture"), 0.0);
    }
    let tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    let tPosition = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( tPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( tPosition );

    var vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(wallNormals), gl.STREAM_DRAW); //load flat normals

    var vNormalPosition = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition); //load normals

    let diffuseProduct = mult(lightDiffuse, colorArray[6]); //set diffuse lighting to use provided color
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));

    let pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(wall), gl.STREAM_DRAW); //load vertices

    let vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition); //load vertices

    gl.drawArrays( gl.TRIANGLES, 0, wall.length);

}

//draws a given bounding box
function drawBB(box){
    let diffuseProduct = mult(lightDiffuse, colorArray[6]); //set diffuse to color of box
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));

    for(let i = 0; i < box.length; i++){ //for each face of bounding box
        let lineNormal = [];
        //the same logic applies to this loop as it did in the connect() function
        //we trick the program in thinking all lines are facing the light all the time
        let inv = inverse4(mvMatrix);
        for (let j = 0; j < box[i].length; j++) {
            lineNormal.push(mult(inv, lightPosition));
        }
        var vNormal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(lineNormal), gl.STREAM_DRAW); //load normals

        var vNormalPosition = gl.getAttribLocation( program, "vNormal");
        gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormalPosition); //load normals

        let pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(box[i]), gl.STREAM_DRAW); //load positions

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition); //load positions

        gl.drawArrays(gl.LINE_LOOP, 0, box[i].length); //draw box face
    }
}

function configureATexture(image, id) {
    texture = gl.createTexture();
    if(id === 0){
        gl.activeTexture(gl.TEXTURE0);
    } else {
        gl.activeTexture(gl.TEXTURE1);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    if(id === 0){
        gl.uniform1i(gl.getUniformLocation(program, "tex0"), 0);
    } else {
        gl.uniform1i(gl.getUniformLocation(program, "tex1"), 1);
    }


}

function createATexture() {

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255])
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[3]);

}