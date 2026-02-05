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
Data structure to store the positions of all falling blocks in the world.
 */

// 0 : regular gameplay, in a level
// 1 : transition between levels
var game_state = 1;

var cur_row = 0; // the current row index for drawing levels row by row

// stores data about the player
var player = {x: -1, y: -1, dx: 0, dy: 0, sliding: false}

// the size of the board
var board_size = 12;

// used for storing the positions of walls
var occupied = Array.from({ length: board_size}, () => new Array(board_size).fill(0));

var cur_level = 0;

var blank_level =
	[
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	];

var win_level =
	[
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, "Y", "O", "U", 0, "W", "I", "N", "!", 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	];

var level1 =
	[
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1]
	];

var level2 =
	[
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1],
		[1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
		[1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 1],
		[1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1],
		[1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
		[1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1]
	];

var levels = [level1, level2];

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.init = function( system, options ) {
	// Uncomment the following code line
	// to verify operation:

	PS.debug( "PS.init() called\n" );

	// This function should normally begin
	// with a call to PS.gridSize( x, y )
	// where x and y are the desired initial
	// dimensions of the grid.
	// Call PS.gridSize() FIRST to avoid problems!
	// The sample call below sets the grid to the
	// default dimensions (8 x 8).
	// Uncomment the following code line and change
	// the x and y parameters as needed.

	PS.gridSize( board_size, board_size);
	PS.gridColor(0xa2d2ff);

	// This is also a good place to display
	// your game title or a welcome message
	// in the status line above the grid.
	// Uncomment the following code line and
	// change the string parameter as needed.

	// initial settings
	PS.statusText( "Sliders");

	PS.timerStart (7, PS.update);

	// draw blank level
	occupied = blank_level;
	PS.drawLevel();

	// draw in first level with animation
	cur_level = 0;
	occupied = levels[cur_level];
	game_state = 1;
};

PS.drawWall = function(x, y){
	PS.fade(x, y, 40);
	PS.color(x, y, 0xf8f9fa);
	PS.border(x, y, 0);

	return;
};

PS.drawPlayer = function(){
	if (!PS.coordInBounds(player.x, player.y)){
		return;
	}
	PS.color(player.x, player.y, 0xe63946);
	PS.glyph(player.x, player.y, 0);
	PS.border(player.x, player.y, 2);
	PS.alpha(player.x, player.y, 255);
	PS.borderAlpha(player.x, player.y, 255);
	PS.borderColor(player.x, player.y, PS.COLOR_BLACK);
};

PS.drawWin = function(x, y){
	PS.drawEmpty(x, y);
	PS.glyph(x, y, 0x1401);
};

PS.drawEmpty = function(x, y){
	PS.border(x, y, 0);
	PS.color(x, y, 0xa2d2ff);
	PS.glyph(x, y, 0);
};

PS.drawTracedEmpty = function(x, y){
	PS.color(x, y, 0xbde0fe);
	PS.fade(x, y, 50, {onEnd: ((x, y) => {PS.fade(x,y,0); PS.drawPlayer();}), onStep: PS.fadeHandler, params: [x, y]});
	PS.drawEmpty(x, y, 0);
}

PS.fadeHandler = function(steps, cur_step, cur_color, x, y){
	if (x === player.x && y === player.y){
		PS.drawPlayer();
		return false;
	}else {
		return true;
	}
}

PS.drawLevel = function(){
	for( var y=0; y < board_size; y++ ){
		PS.drawRowOfLevel(y);
	}
}

PS.drawRowOfLevel= function(y) {
	for( var x=0; x < board_size; x++ ){
		switch(occupied[y][x]){
			case 0:
				PS.drawEmpty(x, y);
				break;
			case 1:
				PS.drawWall(x, y);
				break;
			case 2:
				player.x = x;
				player.y = y;
				PS.drawEmpty(x, y);
				break;
			case 3:
				PS.drawWin(x, y);
				break;
			default:
				PS.drawEmpty(x, y);
				PS.glyph(x, y, occupied[y][x]);
		}
	}
}

PS.update = function()
{
	switch(game_state){
		case 0:
			if (player.sliding) PS.movePlayer();
			break;
		case 1:
			PS.audioPlay(PS.xylophone(13 - cur_row), {volume: 0.2});

			if(cur_row < board_size) {
				PS.drawRowOfLevel(cur_row++);
			}else{
				PS.drawPlayer();
				game_state = 0;
				cur_row = 0;
			}
			break;
		case 2: // switching to the next level
			// clear the screen with an animation
			PS.audioPlay(PS.xylophone(25 - cur_row),  {volume: 0.2});
			occupied = blank_level;
			if(cur_row < board_size) {
				PS.drawRowOfLevel(cur_row++);
			}else{
				// prepare to laod the next level
				occupied = levels[cur_level];
				game_state = 1;
				cur_row = 0;
			}
			break;
		case 3: // showing the win screen
			occupied = win_level;
			if(cur_row < board_size) {
				PS.audioPlay(PS.xylophone(25 - cur_row),  {volume: 0.2});
				PS.drawRowOfLevel(cur_row++);
			}
			break;
	}
};

PS.coordInBounds = function(x, y){
	return (x > -1 && x < board_size && y > -1 && y < board_size);
};

PS.isOccupied = function(x, y){
	return (occupied[y][x] == 1);
};

PS.winLevel = function(){
	if(++cur_level >= levels.length){
		// win the full game!
		game_state = 3;
	}else{
		// clear screen, then load the next level
		game_state = 2;
	}
}

PS.movePlayer = function(){
	let oldx = player.x;
	let oldy = player.y;
	let newx = player.x + player.dx;
	let newy = player.y + player.dy;

	/*
	if (!PS.coordInBounds(newx, newy)){
		PS.audioPlay("fx_swoosh", {volume: 0.035});
		PS.removeBlock(block);
		return;
	}
	*/


	// check if the player leaves the board - if so, they win

	if(!PS.coordInBounds(newx, newy)){
		// update player position
		player.x = newx;
		player.y = newy;

		// hide old player
		PS.drawTracedEmpty(oldx, oldy);

		// reset player to defaults
		player.sliding = false;
		player.dx = 0;
		player.dy = 0;

		PS.winLevel();

		return;
	}

	// check if player has collided with a wall
	// if so, stop sliding.
	// if not, keep sliding!

	if(PS.coordInBounds(newx + player.dy, newy + player.dy) && PS.isOccupied(newx + player.dx, newy + player.dy)) {
		if(player.sliding) {
			PS.audioPlay("fx_click", {volume: 0.1});
			player.sliding = false;
		}
	}else{
		player.sliding = true;
	}

	if(!PS.isOccupied(newx, newy)) {
		// update occupied array
		occupied[player.y][player.x] = 0;
		occupied[newy][newx] = 2; /// use 2 to differentiate player from blocks

		// update player position
		player.x = newx;
		player.y = newy;

		// hide old player
		PS.drawTracedEmpty(oldx, oldy);

		// draw new player
		PS.drawPlayer();
	}else{
		player.sliding = false;
	}
};

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
	// allows you to click and drag to spawn blocks

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
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.

	// do not recieve input when sliding
	if(player.sliding){
		return;
	}



	switch(key){
		case 'a':
		case PS.KEY_ARROW_LEFT:
			player.dx = -1;
			player.dy = 0;
			player.sliding = true;
			PS.audioPlay("fx_swoosh", {volume: 0.04});
			break;
		case 'd':
		case PS.KEY_ARROW_RIGHT:
			player.dx = 1;
			player.dy = 0;
			player.sliding = true;
			PS.audioPlay("fx_swoosh", {volume: 0.04});
			break;
		case 'w':
		case PS.KEY_ARROW_UP:
			player.dx = 0;
			player.dy = -1;
			player.sliding = true;
			PS.audioPlay("fx_swoosh", {volume: 0.04});
			break;
		case 's':
		case PS.KEY_ARROW_DOWN:
			player.dx = 0;
			player.dy = 1;
			player.sliding = true;
			PS.audioPlay("fx_swoosh", {volume: 0.04});
			break;
	}
};


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

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
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

