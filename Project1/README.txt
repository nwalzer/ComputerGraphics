The program is structured as follows:

Main.js:
    This is the central javascript file. It contains the code necessary to initialize
    webgl, a few custom items (such as the color array & pointer and projection
    matrix), and assign event handlers to the necessary HTML elements. This file also
    includes the makeDrawing() function, which simply draws everything which has been
    stored in the polyline array pointsArray().

fileMode.js:
    This file contains all the code necessary for parsing a dat file. It parses the
    extents, each vertex, and sets the appropriate projection matrix and viewport.

drawMode.js:
    This file contains the code necessary for adding a new mouse click to the ongoing
    polyline, as well as creating a new polyline when the current one maxes out at
    100 vertices.

File Mode:
    To start, the user is presented with a blank canvas and is placed in file mode.
    The user can upload a .dat file in accordance with the specifications outlined
    in the project instructions. The file is immediately drawn after it has been
    selected. Choosing to upload a different file will simply wipe the canvas of
    the old drawing and draw the new file.

Draw Mode:
    In draw mode, users are presented with a blank canvas. Clicking anywhere on the
    canvas will draw a single point in that location. Users can then click anywhere
    else on the screen to continue drawing out a line. In accordance with the project
    description, a single polyline can only hold 100 points maximum.

Features:
    'c':
       Pressing 'c' while in either draw mode or file mode will cycle the color of
       the lines being drawn between black, red, green, and blue.
    'b':
       Holding down 'b' while clicking the canvas while in draw mode will end the
       current polyline and begin another. Simply pressing 'b' and clicking will
       do nothing.
    'f':
        Pressing 'f' will switch the user to file mode. If the user is already in
        file mode when 'f' is pressed, nothing will happen.
    'd':
        Pressing 'd' will switch the user to draw mode. If the user is already in
        draw mode when 'd' is pressed, nothing will happen.

Extra Features:
    'u':
        Pressing 'u' while in draw mode will delete the most recent point. Pressing
        multiple times will continue to delete points.
    Custom Color:
        At the bottom of the screen is a custom color picker. If the user selects a
        color from the picker, the lines on the screen will immediately be redrawn
        with that color, and future lines will be drawn with that color. Once a
        custom color has been chosen, it is added to the color cycle associated with
        'c'. Note, however, that I have it set up so that only the most recently
        chosen custom color will be in the cycle. If you choose multiple custom
        colors, only one will be added in. The custom color picker applies for both
        draw mode and file mode. Also note that the color picker is on an 'onchange'
        event handler, which means that opening the picker and choosing the same
        color that is already selected will show no change to the screen.
    Point Size:
        When the user draws a polyline which contains only one vertex, the vertex is
        drawn as a point on the screen. If the user continues holding 'b' and making
        multiple clicks, multiple points will be drawn.
    Translation:
        When the user presses the arrow keys, whatever drawing is on the screen is
        translated 1px in the pressed direction. This applies to both file mode and
        draw mode. Because of the shear number of vertices in the files, holding down
        an arrow key, or pressing one rapidly, lags a bit.