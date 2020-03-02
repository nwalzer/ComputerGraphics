NO FILE UPLOADS ARE NEEDED TO RUN THE PROGRAM. ALL SPHERE AND CUBE GENERATION IS DONE
WITHIN THE PROGRAM.

The light is located at (7, 3, 3, 1)
The light is pointed in direction (-1, 0, -5)

The program is structured as follows:

Main.js:
    This is the central javascript file. It contains the code necessary to initialize
    webgl, initialize uniform light values, create the animation frame, create the cube
    and sphere objects, and calculate surface normals.

fileParse.js:
    This file contains all the code necessary for parsing a ply file.

draw.js:
    Contains all code directly related to drawing objects, including drawing arbitrary
    shapes, bounding boxes, and drawing the lines between each object

shapes.js:
    Contains the code to generate all of the shapes (excluding .ply files). Allows for
    cube and sphere generation, updating the connecting lines, and creating bounding
    boxes

Features:
    'i':
        Pressing 'i' decreases the spotlight angle
    'p':
        Pressing 'p' increases the spotlight angle
    'm':
        Pressing 'm' enables Gouraud shading
    'n':
        Pressing 'n' enables flat shading

Extra Features:
    Adjust lighting direction:
        w, a, s, d, q, e adjust the lighting in the given direction (w = up, a = left,
        s = down, d = right, q = closer, e = deeper)
    'v':
        Pressing 'v' toggles the sinusoid y-axis translation of the objects in the third
        level hierarchy
    'b':
        Pressing 'b' toggles whether bounding boxes are drawn around each cube and sphere
    File upload:
        You can upload any of the .ply files from project 2 and it will take the place
        of the final piece of the 3rd level hierarchy.
