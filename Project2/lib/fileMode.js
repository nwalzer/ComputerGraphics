//loads file contents into appropriate spaces (ortho, viewport, pointsArray, projMatrix, etc).
function parseFile(evt){
    let files = evt.target.files; // FileList object
    if(files.length === 0){
        return;
    }
    let f = files[0];

    let reader = new FileReader();
    reader.onload = (function(theFile) { //this is the only way I could figure out how to read files
        return function(e) {
            let contents = atob(e.target.result.split("base64,")[1]);
            contents = contents.split(/\n/);
            if(contents[0] !== "ply"){
                console.log("No Ply");
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

                if(points[0] < left){
                    left = points[0];
                }
                if(points[0] > right){
                    right = points[0];
                }
                if(points[1] < bottom){
                    bottom = points[1];
                }
                if(points[1] > top){
                    top = points[1];
                }
                if(points[2] < minZ){
                    minZ = points[2];
                }
                if(points[2] > maxZ){
                    maxZ = points[2];
                }
                pointsArray.push(vec3(points[0], points[1], points[2]));
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

            projMatrix = perspective(30, ((right-left)/(top-bottom)), 0, (maxZ - minZ));

            //once we've compiled all of the vertex information, draw everything
            makeDrawing();
        };
    })(f);
    reader.readAsDataURL(f)
}
