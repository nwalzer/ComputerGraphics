//taken from class example
//build cube
function cube() {
    let verts = [];
    verts = verts.concat(quad( 1, 0, 3, 2 )); //front
    verts = verts.concat(quad( 2, 3, 7, 6 )); //right
    verts = verts.concat(quad( 3, 0, 4, 7 )); //bottom
    verts = verts.concat(quad( 6, 5, 1, 2 )); //top
    verts = verts.concat(quad( 4, 5, 6, 7 )); //back
    verts = verts.concat(quad( 5, 4, 0, 1 )); //left
    return verts;
}

//taken from class example
//used for cube building
function quad(a, b, c, d) {
    let verts = [];

    let vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ), //bottom left front  0
        vec4( -0.5,  0.5,  0.5, 1.0 ), //top left front     1
        vec4(  0.5,  0.5,  0.5, 1.0 ), //top right front    2
        vec4(  0.5, -0.5,  0.5, 1.0 ), //bottom right front 3

        vec4( -0.5, -0.5, -0.5, 1.0 ), //botton left back   4
        vec4( -0.5,  0.5, -0.5, 1.0 ), //top left back      5
        vec4(  0.5,  0.5, -0.5, 1.0 ), //top right back     6
        vec4(  0.5, -0.5, -0.5, 1.0 )  //bottom right back  7
    ];

    let indices = [ a, b, c, a, c, d ];
    for ( let i = 0; i < indices.length; ++i) {
        verts.push( vertices[indices[i]] );
    }

    return verts;
}

//build a square of the given size
function buildSquare(size){
    let a = vec4( size, -size,  0, 1.0 ); //bottom left front  0
    let b = vec4( size,  size,  0, 1.0 ); //top left front     1
    let c =vec4(  -size,  size,  0, 1.0 ); //top right front    2
    let d = vec4(  -size, -size,  0, 1.0 ); //bottom right front 3

    return [a, b, c, a, c, d];
}

//taken from class example
//used for sphere generation
function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        let ab = mix( a, b, 0.5);
        let ac = mix( a, c, 0.5);
        let bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        sphereArray.push(a);
        sphereArray.push(c);
        sphereArray.push(b);

        index += 3;
    }
}

//taken from class example
//used for sphere making
function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

//given right-most, top-most, and front-most values, generates bounding box
function generateBB(right, top, front){
    let box = [];
    box.push([]);
    box[0].push(vec4(right, top, -front)); //top right back
    box[0].push(vec4(-right, top, -front)); //top left back
    box[0].push(vec4(-right, -top, -front)); //bottom left back
    box[0].push(vec4(right, -top, -front)); //bottom right back

    //top face
    box.push([]);
    box[1].push(vec4(right, top, -front)); //top right back
    box[1].push(vec4(-right, top, -front)); //top right back
    box[1].push(vec4(-right, top, front)); //top left front
    box[1].push(vec4(right, top, front)); //top right front

    //right face
    box.push([]);
    box[2].push(vec4(right, top, -front)); //top right back
    box[2].push(vec4(right, top, front)); //top right front
    box[2].push(vec4(right, -top, front)); //bottom right front
    box[2].push(vec4(right, -top, -front)); //bottom right back

    //bottom face
    box.push([]);
    box[3].push(vec4(right, -top, -front)); //bottom right back
    box[3].push(vec4(right, -top, front)); //bottom right front
    box[3].push(vec4(-right, -top, front)); //bottom left front
    box[3].push(vec4(-right, -top, -front)); //bottom left back

    //left face
    box.push([]);
    box[4].push(vec4(-right, top, -front)); //top left back
    box[4].push(vec4(-right, top, front)); //top left front
    box[4].push(vec4(-right, -top, front)); //bottom left front
    box[4].push(vec4(-right, -top, -front)); //bottom left back

    //front face
    box.push([]);
    box[5].push(vec4(right, top, front)); //top right front
    box[5].push(vec4(-right, top, front)); //top left front
    box[5].push(vec4(-right, -top, front)); //bottom left front
    box[5].push(vec4(right, -top, front)); //bottom right front

    return box;
}

//generates lines connecting all of the objects
function generateLines(){
    linesArray = [];
    let topmost = vec4(0.0, topVert, 0.0, 1.0);
    let firstSplit = vec4(0.0, topVert - (topVert - vert)/2, 0.0, 1.0);

    let L = vec4(hor, topVert - (topVert - vert)/2, 0.0, 1.0);
    let topL = vec4(hor, vert+1, 0.0, 1.0); //top of yellow sphere
    let botL = vec4(hor, vert-1, 0.0, 1.0); //bottom of yellow sphere
    let LSplit = vec4(hor, -2, 0.0, 1.0);
    let LL = vec4(hor+hor2, -2, 0.0, 1.0);
    let centerLL = vec4(hor+hor2, vert2+2-sinOffset, 0.0, 1.0); //magenta sphere
    let LR = vec4(hor-hor2, -2, 0.0, 1.0);
    let centerLR = vec4(hor-hor2, vert2+1+sinOffset, 0.0, 1.0); //green cube

    let R = vec4(-hor, topVert - (topVert - vert)/2, 0.0, 1.0);
    let RSplit = vec4(-hor, -2, 0.0, 1.0);
    let RL = vec4(-hor-hor2, -2, 0.0, 1.0);
    let centerRL = vec4(-hor-hor2, vert2+2+sinOffset, 0.0, 1.0); //cyan sphere

    linesArray.push([]); //top vertical
    linesArray[0].push(topmost);
    linesArray[0].push(firstSplit);

    linesArray.push([]); //top horizontal
    linesArray[1].push(L);
    linesArray[1].push(R);

    linesArray.push([]); //left vertical
    linesArray[2].push(L);
    linesArray[2].push(topL);

    linesArray.push([]); //left vertical -> right
    linesArray[3].push(botL);
    linesArray[3].push(LSplit);
    linesArray[3].push(LR);
    linesArray[3].push(centerLR);

    linesArray.push([]); //left vertical -> left
    linesArray[4].push(LSplit);
    linesArray[4].push(LL);
    linesArray[4].push(centerLL);

    linesArray.push([]); //right vertical
    linesArray[5].push(R);
    linesArray[5].push(RSplit);

    linesArray.push([]); //right vertical -> left
    linesArray[6].push(RSplit);
    linesArray[6].push(RL);
    linesArray[6].push(centerRL);

    if(fileUploaded){ //creates lines to connect to bounding box of file
        let RR = vec4(-hor+hor2, -2, 0.0, 1.0);
        let centerRR = vec4(-hor+hor2, vert2+1-sinOffset+fileBB[0][0][1], 0.0, 1.0);
        linesArray.push([]); //right vertical -> right
        linesArray[7].push(RSplit);
        linesArray[7].push(RR);
        linesArray[7].push(centerRR);
    }
}