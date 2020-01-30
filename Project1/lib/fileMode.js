//loads file contents into appropriate spaces (ortho, viewport, pointsArray, projMatrix, etc).
function parseFile(evt){
    let files = evt.target.files; // FileList object
    if(files.length === 0){
        return;
    }
    let f = files[0];

    let reader = new FileReader();
    reader.onload = (function(theFile) { //this is the only way I could figure out how to read files :(
        return function(e) {
            let contents = atob(e.target.result.split("base64,")[1]);
            let j = 0;
            if(contents.lastIndexOf("*") !== -1){ //if line of asteriks exist
                contents = contents.slice(contents.lastIndexOf("*") + 1); //get all contents after asteriks

                while(contents.charAt(j) !== '\n'){ //find end of this line, just in case of extra spaces
                    j++;
                }
                contents = contents.substring(j); //get everything after the whole asterik line
            }
            //split contents along spaces
            let temp = contents.split(/\s+/);
            j = 0;
            while(temp[j] === ""){ //sometimes split() returns empty elements, iterate through all of the leading ones
                j++;
            }
            let left = parseFloat(temp[j]);
            let top = parseFloat(temp[j+1]);
            let right = parseFloat(temp[j+2]);
            let bottom = parseFloat(temp[j+3]); //get the first 4 numbers that appear
            let extentsExist = false;

            let lines = contents.split("\n"); //split contents along lines
            let i = 0;
            while(lines[i] === ""){ //Iterate through leading blank lines
                i++;
            }
            //If we can find all 4 extents on the same line, extents are defined in file
            if(lines[i].includes(left.toString()) && lines[i].includes(top.toString()) && lines[i].includes(right.toString()) && lines[i].includes(bottom.toString())){
                extentsExist = true;
                i++; //move to next line
                console.log("Custom Extents");
                while(lines[i] === ""){ //iterate through blank lines
                    i++
                }
            } else {
                //if extents not defined in file, manually set to beginning, ridiculous values
                left = Number.MAX_VALUE;
                right = Number.MIN_VALUE;
                top = Number.MIN_VALUE;
                bottom = Number.MAX_VALUE;
                console.log("Default Extents");
            }

            let paCounter = parseInt(lines[i]); //whether extents exist, i at this pointer will be the line containing paCounter
            i++;

            pointsArray = [];
            let vertices = [];
            for(i; i < lines.length; i++){ //starting after paCounter, iterate through remaining lines
                vertices = [];
                while(i < lines.length && lines[i] === ""){ //continue past blank lines
                    i++
                }
                console.log(lines[i]);
                let numVerts = parseInt(lines[i]); //get number of vertices

                let emptyLines = 0;
                for(let j = 1; j < numVerts+1; j++){
                    while(isNaN(parseInt(lines[i+j+emptyLines]))){ //iterate through and keep track of blank lines
                        emptyLines++;
                    }
                    let thisLine = lines[i+j+emptyLines].split(/\s+/); //split this line along spaces
                    console.log(thisLine);
                    let first;
                    let second;
                    if(thisLine[0] === ""){ //sometimes first element is a space, if so then take next two elements
                        first = parseFloat(thisLine[1]);
                        second = parseFloat(thisLine[2]);
                    } else { //if first element isn't a space, take first two
                        first = parseFloat(thisLine[0]);
                        second = parseFloat(thisLine[1]);
                    }

                    //if the extents weren't defined in the file, we calculate using the left-, right-, top-, and bottom-most points
                    if(!extentsExist){
                        //first coordinate pertains to left vs right.
                        if(first < left){ //If we find a smaller x coordinate, assign it to left
                            left = first;
                        }
                        if(first > right){ //if we find a larger right coordinate, assign it to right
                            right = first;
                        }
                        //second coordinate pertains to top vs bottom
                        if(second < bottom){ //if we find a smaller bottom coordinate, assign it to bottom
                            bottom = second;
                        }
                        if(second > top){ //if we find a larger top coordinate, assign it to top
                            top = second
                        }
                    }
                    vertices.push(vec4(first, second, 0.0, 1.0)); //push our two coordinates to the vertex array
                }
                pointsArray.push(vertices); //push this line to the main vertex array
                i += numVerts + emptyLines; //increment i to next line

            }

            projMatrix = ortho(left, right, bottom, top, -1.0, 1.0);
            if ((right - left) / (top - bottom) < 1) { //if h > w
                gl.viewport(0, 0, (400 * (right - left)) / (top - bottom), 400);
            } else { //if w > h
                gl.viewport(0, 0, 400, (400 * (top - bottom)) / (right - left));
            }

            //once we've compiled all of the vertex information, draw everything
            makeDrawing()
        };
    })(f);
    reader.readAsDataURL(f)
}
