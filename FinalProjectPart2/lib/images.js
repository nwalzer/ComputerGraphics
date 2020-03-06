//load all images and create default textures
function setAllImages(){
    createATexture();
    configureCubeMap();

    wallTexture = new Image();
    wallTexture.crossOrigin = "";
    wallTexture.src = "http://web.cs.wpi.edu/~jmcuneo/stones.bmp";
    wallTexture.onload = function(){
        configureATexture(wallTexture, 0);
    };

    floorTexture = new Image();
    floorTexture.crossOrigin = "";
    floorTexture.src = "http://web.cs.wpi.edu/~jmcuneo/grass.bmp";
    floorTexture.onload = function(){
        configureATexture(floorTexture, 1);
    };


    negativeX = new Image();
    negativeX.crossOrigin = "";
    negativeX.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvnegx.bmp";
    negativeX.onload = function() {
        loadedCubeFaces++;
        configureCubeMapImage();
    };

    negativeY = new Image();
    negativeY.crossOrigin = "";
    negativeY.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvnegy.bmp";
    negativeY.onload = function() {
        loadedCubeFaces++;
        configureCubeMapImage();
    };

    negativeZ = new Image();
    negativeZ.crossOrigin = "";
    negativeZ.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvnegz.bmp";
    negativeZ.onload = function() {
        loadedCubeFaces++;
        configureCubeMapImage();
    };

    positiveX = new Image();
    positiveX.crossOrigin = "";
    positiveX.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvposx.bmp";
    positiveX.onload = function() {
        loadedCubeFaces++;
        configureCubeMapImage();
    };

    positiveY = new Image();
    positiveY.crossOrigin = "";
    positiveY.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvposy.bmp";
    positiveY.onload = function() {
        loadedCubeFaces++;
        configureCubeMapImage();
    };

    positiveZ = new Image();
    positiveZ.crossOrigin = "";
    positiveZ.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvposz.bmp";
    positiveZ.onload = function() {
        loadedCubeFaces++;
        configureCubeMapImage();
    };
}

//configure a default texture
function createATexture() {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255])
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    console.log("Default Texture Set");
}

//configure a texture using the supplied image
function configureATexture(image, id) {
    texture = gl.createTexture();
    if (id === 0) {
        gl.activeTexture(gl.TEXTURE0);
    } else {
        gl.activeTexture(gl.TEXTURE1);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    if (id === 0) {
        gl.uniform1i(gl.getUniformLocation(program, "tex0"), 0);
    } else {
        gl.uniform1i(gl.getUniformLocation(program, "tex1"), 1);
    }
    console.log("Loaded Background Texture: " + id);
}

//once all textures are loaded, configure full environment map
function configureCubeMapImage() {
    if(loadedCubeFaces !== 6){
        return;
    }

    cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    console.log("Configured cubeMap");
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, positiveX);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, negativeX);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, positiveY);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, negativeY);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, positiveZ);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, negativeZ);

    gl.uniform1i(gl.getUniformLocation(program, "cubeMap"), 2);
    console.log("Environment Map Set");
}

//configure default cube map
function configureCubeMap() {
    cubeMap = gl.createTexture();

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "cubeMap"), 3);
    console.log("Default cube map configured");
}