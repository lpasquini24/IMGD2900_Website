/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-22 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these two lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

var drops = 0;
var drops_to_win = 10;

var cloudSprite;
var catUpSprites = [];
var catDownSprites = [];
var keys = ["A", "S", "D", "F"]
var activeCat = -1;
var raindrops = [];

var width = 28;
var height = 28;

var game_state = 0;

PS.init = function( system, options ) {

    PS.statusText("Umbrella Cats");


    PS.seed(300);

    PS.gridSize(width, height);


    PS.border(PS.ALL, PS.ALL, 0);
    PS.color(PS.ALL, PS.ALL, PS.COLOR_WHITE);


    // load images and create sprites

    PS.imageLoad("Images/Cloud.png", function(data) {
        cloudSprite = PS.spriteImage(data);
        PS.spriteShow(cloudSprite, true);
        PS.spriteAxis(cloudSprite, 0, 0);
        PS.spriteMove(cloudSprite, 0, -2);
    })

    var umbrellaCatUpImage, umbrellaCatDownImage;
    PS.imageLoad( "Images/UmbrellaCat-Up.png", function (data) {
        umbrellaCatUpImage = data; // save image ID
        // create sprites from images
        for(let i = 0; i < 4; i++)
        {
            let umbrellaCatUpSprite = PS.spriteImage(umbrellaCatUpImage);
            // place some images!
            PS.spriteShow(umbrellaCatUpSprite, false);
            PS.spriteAxis(umbrellaCatUpSprite, 0, 8);
            PS.spriteMove(umbrellaCatUpSprite, 7 * i, height);
            PS.glyph((7 * i) + 3, height - 7, keys[i]);
            PS.glyphColor((7 * i) + 3, height - 7, PS.COLOR_WHITE);
            PS.glyphScale((7 * i) + 3, height - 7, 100);

            catUpSprites.push(umbrellaCatUpSprite);
        }

    } );


    PS.imageLoad( "Images/UmbrellaCat-Down.png", function (data) {
        umbrellaCatDownImage = data; // save image ID
        // create sprites from images
        for(let i = 0; i < 4; i++)
        {
            var umbrellaCatDownSprite = PS.spriteImage( umbrellaCatDownImage );
            PS.spriteShow(umbrellaCatDownSprite, true);
            PS.spriteAxis(umbrellaCatDownSprite, 0, 8);
            PS.spriteMove(umbrellaCatDownSprite, 7 * i, height);

            catDownSprites.push(umbrellaCatDownSprite);
        }
    } );

    PS.timerStart(5, PS.raindropFall);
    PS.timerStart(50, PS.raindropSpawn);
};

PS.loseGame = function() {
    game_state = 1;
    PS.audioPlay("fx_bloink", {volume: 0.5});
    PS.imageLoad("Images/CatLose.png", function (data) {
        PS.glyph(PS.ALL, PS.ALL, 0);
        PS.imageBlit(data, 0, 0);
    });
}

PS.winGame = function() {
    game_state = 1;
    PS.audioPlay("fx_tada", {volume: 0.5});
    PS.imageLoad("Images/CatWin.png", function (data) {
        PS.glyph(PS.ALL, PS.ALL, 0);
        PS.imageBlit(data, 0, 0);
    });
}

PS.raindropSpawn = function(){
    if (game_state != 0) return;

    if(drops < drops_to_win) {
        drops++;
        let x = PS.random(width) - 1;
        raindrops.push({x: x, y: -1});
    }else{
        if(raindrops.length == 0){
            PS.winGame();
        }
    }
}


PS.raindropFall = function() {
    if (game_state != 0) return;
    for(var raindrop of raindrops){
        // check for collisions
        if(raindrop.y > (height - 9)){
            // if umbrella of the cat we hit is up, destroy the raindrop
            if(PS.catAtX(raindrop.x) === activeCat){
                raindrops.splice(raindrops.indexOf(raindrop), 1);
                PS.drawEmpty(raindrop.x, raindrop.y);
                PS.audioPlay("fx_drip2", {volume: 0.5});
                continue;
            }

            // otherwise, lose game
            PS.loseGame();
        }

        // move the raindrop
        PS.drawEmpty(raindrop.x, raindrop.y);
        raindrop.y++;
        PS.drawRaindrop(raindrop);

        PS.spriteShow(cloudSprite, false);
        PS.spriteShow(cloudSprite, true);
    }
}

PS.isInBounds = function(x, y){
    return (x >= 0 && x <= 31) && (y >= 0 && y <= 31);
}

PS.drawEmpty = function(x, y) {
    if(PS.isInBounds(x, y)) {
        PS.color(x, y, PS.COLOR_WHITE);
    }
    PS.drawCats();
}

PS.drawRaindrop = function(raindrop) {
    if(PS.isInBounds(raindrop.x, raindrop.y)) {
        PS.color(raindrop.x, raindrop.y, PS.COLOR_BLUE);
    }
}

PS.catAtX = function(x) {
    return Math.floor(x / 7);
}

PS.drawCats = function(){
    for(let i = 0; i < 4; i++){
        PS.spriteShow(catDownSprites[i], false);
        PS.spriteShow(catUpSprites[i], false);

        if (i === activeCat) {

            PS.spriteShow(catUpSprites[i], true);
        }else{

            PS.spriteShow(catDownSprites[i], true);
        }
    }
}

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line
	// to inspect x/y parameters:

	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	// Add code here for mouse clicks/touches
	// over a bead.
};

/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {

    if (game_state != 0) return;
	// Add code here for when a key is pressed.
    switch(key) {
        case 0x0061:
            PS.audioPlay("fx_click", {volume: 0.4});
            activeCat = 0;
            break;
        case 0x0073:
            PS.audioPlay("fx_click", {volume: 0.4});
            activeCat = 1;
            break;
        case 0x0064:
            PS.audioPlay("fx_click", {volume: 0.4});
            activeCat = 2;
            break;
        case 0x0066:
            PS.audioPlay("fx_click", {volume: 0.4});
            activeCat = 3;
            break;

    }

    PS.drawCats();
    return 0;
};

PS.

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:



};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

