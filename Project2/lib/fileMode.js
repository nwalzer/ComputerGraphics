//loads file contents into appropriate spaces (ortho, viewport, pointsArray, projMatrix, etc).
function parseFile(evt){
    let files = evt.target.files; // FileList object
    if(files.length === 0){
        return;
    }
    let f = files[0];

    pointsArray = [];
    faceArray = [];
    let reader = new FileReader();
    reader.onload = (function(theFile) { //this is the only way I could figure out how to read files
        return function(e) {
            let contents = atob(e.target.result.split("base64,")[1]);
            contents = contents.split(/\n/);
            console.log(contents[0]);
            if(contents[0].replace(/\s+/, "") === ""){
                contents.shift();
            }
            if(contents[0].replace(/\s+/, "") !== "ply"){
                console.log("No Ply: " + contents[0]);
                return;
            }

            let i = 1;
            let numVerts = 0;
            let numFaces = 0;

            while(contents[i].indexOf("end_header") === -1){
                if(contents[i].indexOf("element vertex") !== -1){
                    let idx = contents[i].indexOf("element vertex");
                    numVerts = parseInt(contents[i].substring(idx+14));
                    console.log("VERTS: " + numVerts);
                } else if(contents[i].indexOf("element face") !== -1){
                    let idx = contents[i].indexOf("element face");
                    numFaces = parseInt(contents[i].substring(idx+12));
                    console.log("FACES: " + numFaces)
                }
                i++;
            }
            i++;
            let left = Number.MAX_VALUE;
            let right = Number.MIN_VALUE;
            let top = Number.MIN_VALUE;
            let bottom = Number.MAX_VALUE;
            let minZ = Number.MAX_VALUE;
            let maxZ = Number.MIN_VALUE;

            let j = 0;
            for(j = 0; j < numVerts; j++){
                if(contents[i] === ""){
                    i++;
                }
                let points = contents[i].split(/\s+/);
                if(points[0] === ""){
                    points.shift();
                }
                let x = parseFloat(points[0]);
                let y = parseFloat(points[1]);
                let z = parseFloat(points[2]);

                if(x < left){
                    left = x;
                }
                if(x > right){
                    right = x;
                }
                if(y < bottom){
                    bottom = y;
                }
                if(y > top){
                    top = y;
                }
                if(z < minZ){
                    minZ = z;
                }
                if(z > maxZ){
                    maxZ = z;
                }
                pointsArray.push(vec4(x, y, z, 1.0));
                i++;
            }
            console.log(left, right, top, bottom, minZ, maxZ);
            for(j = 0; j < numFaces; j++){
                if(contents[i] === ""){
                    i++;
                }
                let verts = contents[i].split(/\s+/);
                if(verts[0] === ""){
                    verts.shift();
                }
                let vertLen = parseInt(verts[0]);
                let thisFace = [];
                let k = 0;

                for(k = 0; k < vertLen; k++){
                    thisFace.push(pointsArray[verts[k+1]]);
                }
                faceArray.push(thisFace);
                i++;
            }

            let offsetZ = 10;
            let theta = (Math.atan(((top-bottom)/2)/offsetZ) * (180/Math.PI))*2;

            console.log("RADIANS: " + Math.atan(((top-bottom)/2)/offsetZ) + " -- " + radians(theta/2));
            console.log("COMPARE --- Expected: " + Math.tan(radians(theta/2)) + " -- Actual: " + ((top-bottom)/2)/offsetZ);
            console.log("THETA: " + theta);
            /*if(theta > 90){
                theta -= 20;
            }// */

            projMatrix = perspective(theta, ((right-left)/(top-bottom)), 0.1, 50+offsetZ+(maxZ-minZ));

            var eye = vec3(right-((right-left)/2), top-((top-bottom)/2), maxZ+offsetZ+1);
            var at = vec3(right-((right-left)/2), top-((top-bottom)/2), maxZ);
            var up = vec3(0.0, 1.0, 0.0);

            var viewMatrix = lookAt(eye, at, up);

            var viewMatrixLoc = gl.getUniformLocation(program, 'viewMatrix');
            gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

            if ((right - left) / (top - bottom) < 1) { //if h > w
                gl.viewport(0, 0, (400 * (right - left)) / (top - bottom), 400);
            } else { //if w > h
                gl.viewport(0, 0, 400, (400 * (top - bottom)) / (right - left));
            } // */

            //once we've compiled all of the vertex information, draw everything
            makeDrawing();
        };
    })(f);
    reader.readAsDataURL(f)
}
