The program is structured as follows:

Main.js:
    This is the central javascript file. It contains the code necessary to initialize
    webgl, a few custom items (such as the color vectors & animation booleans), and
    assigns event handlers to the necessary HTML elements. This file
    includes the makeDrawing() function, which simply draws everything which has been
    stored in the face array, the alterDrawing() function, which handles all animations
    as a single animation frame, the reset() function, restoring a drawings original
    positioning, and the drawNormals() function, which draws surface normals

fileParse.js:
    This file contains all the code necessary for parsing a ply file. It parses the
    extents, each vertex and face, calculates surface normals using the newell method,
    sets appropriate perspective matrices, and utilizes the lookAt() function to place
    the object in the user's field of view.

Features:
    'X':
        Pressing 'X' toggles translating the drawing in the positive x direction
    'C':
        Pressing 'C' toggles translating the drawing in the negative x direction
    'Y':
        Pressing 'Y' toggles translating the drawing in the positive y direction
    'U':
        Pressing 'U' toggles translating the drawing in the negative y direction
    'A':
        Pressing 'A' toggles translating the drawing in the negative z direction
    'Z':
        Pressing 'Z' toggles translating the drawing in the positive z direction
    'R':
        Pressing 'R' toggles rotation about the x axis
    'B':
        Pressing 'B' toggles pulsing

Extra Features:
    'N':
        Pressing 'N' toggles the drawing of surface normals. While surface normals will
        rotate and translate with the mesh, they will not pulse
    Custom Colors:
        At the bottom of the screen are two custom color pickers. If the user selects a
        new mesh color, the mesh on the screen will be immediately redrawn in that color,
        and all future meshes will be drawn in the same color, unless the color gets
        switched. If the user selects a new surface normal color, the surface normals,
        when they get drawn, will be drawn in the specified color
    Reset Button:
        Pressing the reset button will stop any animations and restore the drawing to its
        original orientation and positioning without surface normals. Custom colors will
        be retained, however
    Mesh Toggle:
        Pressing the mesh toggle button will switch the current drawing from a mesh to a
        filled object. No shading is done on the object, so discerning 3 dimensions is
        difficult. Pressing this button again switches back to a mesh.