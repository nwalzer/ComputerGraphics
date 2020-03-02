//Reused from my projects 1 and 2
//loads file contents into appropriate spaces (ortho, viewport, pointsArray, projMatrix, etc).
function parseFile(evt){
    let files = evt.target.files; // FileList object
    if(files.length === 0){ //if no files
        return;
    }
    let f = files[0];

    let pointsArray = [];
    fileFaces = [];
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
                } else if(contents[i].indexOf("element face") !== -1){ //if this line indicates # of faces
                    let idx = contents[i].indexOf("element face");
                    numFaces = parseInt(contents[i].substring(idx+12)); //parse # of faces
                }
                i++;
            }
            i++; //increment to line just after end_header
            let left = vec4(Number.MAX_VALUE, 0.0, 0.0, 0.0);
            let right = vec4(Number.MIN_VALUE, 0.0, 0.0, 0.0);
            let top = vec4(0.0, Number.MIN_VALUE, 0.0, 0.0);
            let bottom = vec4(0.0, Number.MAX_VALUE, 0.0, 0.0);
            let minZ = vec4(0.0, 0.0, Number.MAX_VALUE, 0.0);
            let maxZ = vec4(0.0, 0.0, Number.MIN_VALUE, 0.0); //initialize extents to easily-overridden values

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
                let thisPoint = vec4(x, y, z, 1.0);

                if(x < left[0]){ //if x is further left
                    left = thisPoint;
                }
                if(x > right[0]){ //if x is further right
                    right = thisPoint;
                }
                if(y < bottom[1]){ //if y is lower
                    bottom = thisPoint;
                }
                if(y > top[1]){ //if y is higher
                    top = thisPoint;
                }
                if(z < minZ[2]){ //if Z is further
                    minZ = thisPoint;
                }
                if(z > maxZ[2]){ //if Z is closer
                    maxZ = thisPoint;
                }
                pointsArray.push(thisPoint);
                i++;
            }

            let divisor = Math.max(right[0]-left[0], top[1]-bottom[1], maxZ[2]-minZ[2]) / 2; //calculate largest dimension
            let shiftX = (-(right[0] - (right[0]-left[0])/2))/divisor; //X axis translation to center at origin
            let shiftY = (-(top[1] - (top[1]-bottom[1])/2))/divisor; //Y axis translation to center at origin
            let shiftZ = (-(maxZ[2] - (maxZ[2]-minZ[2])/2))/divisor; //Z axis translation to center at origin
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

                for(let k = 0; k < vertLen; k++){ //for # of vertices
                    let currVert = pointsArray[verts[k]];
                    fileFaces.push(vec4(currVert[0]/divisor + shiftX, currVert[1]/divisor + shiftY, currVert[2]/divisor + shiftZ, 1.0));
                    //shift vertex so whole object is centered on origin and [-1, 1], push to face
                }
                i++;
            }
            let rightBB = right[0]/divisor + shiftX;
            let topBB = top[1]/divisor + shiftY;
            let maxZBB = maxZ[2]/divisor + shiftZ;

            //back face
            fileBB = generateBB(rightBB, topBB, maxZBB);

            fileUploaded = true;
            if(shapeArray.length === 3){ //if another file is already loaded
                shapeArray.pop(); //get rid of it
            }
            shapeArray.push(fileFaces); //push this file to shape array
            fileFlatNormal = fNormals(shapeArray[2]); //calculate flat normals
            fileGNormal = gNormals(shapeArray[2]); //calculate gouraud normals
            generateLines(); //regenerate lines to account fo new bounding box
        };
    })(f);
    reader.readAsDataURL(f);
}
