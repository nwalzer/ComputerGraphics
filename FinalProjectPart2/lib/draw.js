
//draws all of the white lines which connect objects together
function connect(){
    if(enableSin){ //if we are translating due to sinusoid
        generateLines(); //regenerate lines
    }

    let diffuseProduct = mult(lightDiffuse, colorArray[6]); //set diffuse to line color
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));

    for(let i = 0; i < linesArray.length; i++) { //for each line
        let lineNormal = [];
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
            }
            mvMatrix = stack.pop();
        } else {
            //this loop tricks the program into thinking the lines are always facing the light source
            //which ensures the lines remain lit up at all theta values while they are in the spotlight
            let inv = inverse4(mvMatrix);
            for (let j = 0; j < linesArray[i].length; j++) {
                lineNormal.push(mult(inv, lightPosition));
            }
        }
        var vNormal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(lineNormal), gl.STREAM_DRAW); //load normals

        var vNormalPosition = gl.getAttribLocation( program, "vNormal");
        gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormalPosition); //load normals

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

        var vNormalPosition = gl.getAttribLocation( program, "vNormal");
        gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormalPosition); //load normals
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

        var vNormalPosition = gl.getAttribLocation( program, "vNormal");
        gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormalPosition); //load normals
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

        var vNormalPosition = gl.getAttribLocation( program, "vNormal");
        gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormalPosition); //load normals
    }

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