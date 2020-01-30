
//Adds a point to the pointsArray
function drawPoint(evt){
    if(pointsArray.length === 0){ //if empty array
        pointsArray.push([]); //push an empty array
    } else if (pointsArray[pointsArray.length-1].length === 100){ //if current array is filled
        pointsArray.push([]); //push a new empty array
    }
    pointsArray[pointsArray.length-1].push(vec4(evt.offsetX, 400-evt.offsetY, 0.0, 1.0)); //always write to most recent polyline
    makeDrawing(); //draw everything
}