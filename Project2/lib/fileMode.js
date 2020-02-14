//loads file contents into appropriate spaces (ortho, viewport, pointsArray, projMatrix, etc).
function parseFile(evt){
    let files = evt.target.files; // FileList object
    if(files.length === 0){ //if no files
        return;
    }
    let f = files[0];

    pointsArray = [];
    faceArray = [];
    let reader = new FileReader();
    reader.onload = (function(theFile) {
        return function(e) {
            let contents = atob(e.target.result.split("base64,")[1]);
            contents = contents.split(/\n/); //split contents into lines
            if(contents[0].replace(/\s+/, "") === ""){ //if first line is blank
                contents.shift(); //delete it
            }
            if(contents[0].replace(/\s+/, "") !== "ply"){ //if first line does not contain "ply"
                console.log("No Ply: " + contents[0]); //do nothing with the file
                return;
            }

            let i = 1;
            let numVerts = 0;
            let numFaces = 0;

            while(contents[i].indexOf("end_header") === -1){ //while we haven't hit the end of the header
                if(contents[i].indexOf("element vertex") !== -1){ //if this line indicates # vertices
                    let idx = contents[i].indexOf("element vertex");
                    numVerts = parseInt(contents[i].substring(idx+14)); //parse # of vertices
                    console.log("VERTS: " + numVerts);
                } else if(contents[i].indexOf("element face") !== -1){ //if this line indicates # of faces
                    let idx = contents[i].indexOf("element face");
                    numFaces = parseInt(contents[i].substring(idx+12)); //parse # of faces
                    console.log("FACES: " + numFaces)
                }
                i++;
            }
            i++; //increment to line just after end_header
            let left = Number.MAX_VALUE;
            let right = Number.MIN_VALUE;
            let top = Number.MIN_VALUE;
            let bottom = Number.MAX_VALUE;
            let minZ = Number.MAX_VALUE;
            let maxZ = Number.MIN_VALUE; //initialize extents to easily-overridden values

            let j = 0;
            for(j = 0; j < numVerts; j++){ //for each vertex
                while(contents[i].replace(/\s+/, "") === ""){ //ignore empty lines
                    i++;
                }
                let points = contents[i].split(/\s+/); //split along spaces
                if(points[0].replace(/\s+/, "") === ""){ //ignore empty first element
                    points.shift();
                }
                let x = parseFloat(points[0]);
                let y = parseFloat(points[1]);
                let z = parseFloat(points[2]);

                if(x < left){ //if x is further left
                    left = x;
                }
                if(x > right){ //if x is further right
                    right = x;
                }
                if(y < bottom){ //if y is lower
                    bottom = y;
                }
                if(y > top){ //if y is higher
                    top = y;
                }
                if(z < minZ){ //if Z is further
                    minZ = z;
                }
                if(z > maxZ){ //if Z is closer
                    maxZ = z;
                }
                pointsArray.push(vec4(x, y, z, 1.0));
                i++;
            }
            console.log(left, right, top, bottom, minZ, maxZ);
            normalArray = [];
            for(j = 0; j < numFaces; j++){ //for each face
                while(contents[i].replace(/\s+/, "") === ""){ //ignore empty lines
                    i++;
                }
                let verts = contents[i].split(/\s+/);
                if(verts[0].replace(/\s+/, "") === ""){ //if empty first element
                    verts.shift();
                }
                let vertLen = parseInt(verts[0]); //parse # vertices
                verts.shift();
                let thisFace = [];
                let nx = 0, ny = 0, nz = 0, xavg = 0, yavg = 0, zavg = 0;

                for(let k = 0; k < vertLen; k++){ //for # of vertices
                    thisFace.push(pointsArray[verts[k]]); //push relevant vertex
                    xavg += pointsArray[verts[k]][0]; //calculate avg x value
                    yavg += pointsArray[verts[k]][1]; //calculate avg y value
                    zavg += pointsArray[verts[k]][2]; //calculate avg z value
                    nx += (pointsArray[verts[k]][1] - pointsArray[verts[(k+1)%vertLen]][1])*(pointsArray[verts[k]][2] + pointsArray[verts[(k+1)%vertLen]][2]); //newell method for X
                    ny += (pointsArray[verts[k]][2] - pointsArray[verts[(k+1)%vertLen]][2])*(pointsArray[verts[k]][0] + pointsArray[verts[(k+1)%vertLen]][0]); //newell method for Y
                    nz += (pointsArray[verts[k]][0] - pointsArray[verts[(k+1)%vertLen]][0])*(pointsArray[verts[k]][1] + pointsArray[verts[(k+1)%vertLen]][1]); //newell method for Z
                }
                xavg /= vertLen; //get avg x
                yavg /= vertLen; //get avg y
                zavg /= vertLen; //get avg z
                let nlength = Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2) + Math.pow(nz, 2)); //get normal vector magnitude
                if((right-left) > (top-bottom)){ //if aspect < 1
                    nx /= nlength/(0.1*(top-bottom)); //set normals to be function of height
                    ny /= nlength/(0.1*(top-bottom));
                    nz /= nlength/(0.1*(top-bottom));
                } else {
                    nx /= nlength/(0.1*(right-left)); //set normals to be function of width
                    ny /= nlength/(0.1*(right-left));
                    nz /= nlength/(0.1*(right-left));
                } // */

                normalArray.push([vec4(xavg, yavg, zavg, 1.0), vec4(nx+xavg, ny+yavg, nz+zavg, 1.0)]); //push line representing this face's normal
                faceArray.push(thisFace);
                i++;
            }

            let offsetZ = 10; //set default distance from mesh
            let aspect = (right-left)/(top-bottom); //calculate aspect ratio
            if(aspect < 0.9 || (right - left) > 100 || (top-bottom) > 100){ //if height > width or coordinates in the hundreds
                offsetZ = 1000; //Increase the distance to the mesh
            }
            let theta = (Math.atan((Math.max(right-left, top-bottom)/2)/offsetZ) * (180/Math.PI))*2; //calculate fovY

            projMatrix = perspective(theta, 1, 0.1, 1000+offsetZ+100*(maxZ-minZ)); //set perspective matrix, increase drawing depth

            let eye = vec3(right-((right-left)/2), top-((top-bottom)/2), maxZ + offsetZ + 10);
            let at = vec3(right-((right-left)/2), top-((top-bottom)/2), maxZ); //set at to center on object
            let up = vec3(0.0, 1.0, 0.0); //up
            let viewMatrix = lookAt(eye, at, up); //set view matrix

            let viewMatrixLoc = gl.getUniformLocation(program, 'viewMatrix');
            gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix)); //load in view matrix

            gl.viewport(0, 0, 400, 400);
            /*if (aspect < 1) { //if h > w
                let width = (400 * (right-left)) / (top-bottom);
                gl.viewport((400-width)/2, 0, width, 400);
            } else { //if w > h
                let height = (400 * (top-bottom)) / (right-left);
                gl.viewport(0, (400-height)/2, 400, height);
            } // */
            across = right-left; //set global translation variables
            tall = top-bottom; //these make translating a function of dimensions rather than hardcoded values
            deep = maxZ-minZ;

            reset(); //reset transformation variables
            makeDrawing();
        };
    })(f);
    reader.readAsDataURL(f);
}
