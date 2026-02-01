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

// stores a list of all of the physics blocks

var blocks = [];

var board_size = 12;

// used for handling physics block collisions
var occupied = Array.from({ length: board_size}, () => new Array(board_size).fill(0));

// used for switching directions using the spacebar
var dir_offset = 0;

// used for storing the state of the walls
var left_border_on = true;
var right_border_on = true;
var top_border_on = true;
var bottom_border_on = true;

// used for storing the state of the corner toggles
var dir_one_on = true;
var dir_two_on = true;
var dir_three_on = true;
var dir_four_on = true;

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

	PS.gridSize( board_size, board_size + 2);

	// This is also a good place to display
	// your game title or a welcome message
	// in the status line above the grid.
	// Uncomment the following code line and
	// change the string parameter as needed.

	// initial settings
	PS.statusText( "Gravity Blocks");
	PS.fade(PS.ALL, PS.ALL, 4);
	PS.border(PS.ALL, PS.ALL, 0);

	// initialize corner blocks
	occupied[0][0] = 1;
	occupied[0][board_size - 1] = 1;
	occupied[board_size - 1][0] = 1;
	occupied[board_size - 1][board_size - 1] = 1;

	PS.drawAllCorners();

	// turn borders on
	PS.setLeftBorder(true);
	PS.setRightBorder(true);
	PS.setTopBorder(true);
	PS.setBottomBorder(true);



	PS.timerStart (7, PS.hello);


	// Add any other initialization code you need here.
};

PS.drawAllCorners = function() {
	for (let i = 1; i <= 4; i++) {
		PS.drawCorner(i);
	}
}

PS.drawCorner = function(dir) {
	var x, y, toggled;

	switch (dir){
		case 1:
			x = 0;
			y = 0;
			toggled = dir_one_on;

			break;
		case 2:
			x = 0;
			y = board_size - 1;
			toggled = dir_two_on;

			break;
		case 3:
			x = board_size - 1;
			y = 0;
			toggled = dir_three_on;

			break;
		case 4:
			x = board_size - 1;
			y = board_size - 1;
			toggled = dir_four_on;

			break;
	}

	PS.color(x, y, PS.dirToColor(dir));
	PS.border(x, y, 5);
	PS.borderColor(x, y, PS.COLOR_BLACK);
	PS.glyph(x, y, toggled ? 0 : "X");
	PS.glyphScale(x, y, 100);
}

PS.setLeftBorder = function(on){
	let x = 0;
	left_border_on = on;
	for(let y = 1; y < board_size -1; y++){
		PS.drawWall(x, y);
		if(on) {
			occupied[x][y] = 1;
		}else{
			occupied[x][y] = 0;
		}
	}
};

PS.setRightBorder = function(on){
	let x = board_size - 1;
	right_border_on = on;
	for(let y = 1; y < board_size -1; y++){
		PS.drawWall(x, y);
		if(on) {
			occupied[x][y] = 1;
		}else{
			occupied[x][y] = 0;
		}
	}
};

PS.setTopBorder = function(on){
	let y = 0;
	top_border_on = on;
	for(let x = 1; x < board_size -1; x++){
		PS.drawWall(x, y);
		if(on) {
			occupied[x][y] = 1;
		}else{
			occupied[x][y] = 0;
		}
	}
};

PS.setBottomBorder = function(on){
	let y = board_size - 1;
	bottom_border_on = on;
	for(let x = 1; x < board_size - 1; x++){
		PS.drawWall(x, y);
		if(on) {
			occupied[x][y] = 1;
		}else{
			occupied[x][y] = 0;
		}
	}
};


// 5 is down, 6 is left, 7 is up, 8 is right
PS.getWallColor = function(dir){
	return PS.dirToColor(((dir - (dir_offset % 4)) % 4) + 1);
};

PS.drawWall = function(x, y){
	let dir = 0;
	// determine which wall its on
	// 5 is down, 6 is left, 7 is up, 8 is right
	if (y == board_size - 1) dir = 5;
	if (x == 0) dir = 6;
	if (y == 0) dir = 7;
	if (x == board_size - 1) dir = 8;

	// draw the main walls
	if (y == board_size - 2 || y == 1 || x == 1 || x == board_size -2) {
		PS.color(x, y, PS.COLOR_BLACK);
	} else {
		PS.color(x, y, PS.getWallColor(dir));
	}
	PS.border(x, y, 10);
	PS.borderColor(x, y, PS.COLOR_BLACK);

	let solid_alpha = 255;
	let faded_alpha = 100;


	switch(dir){
		case 5:
			PS.alpha(x, y, bottom_border_on ? solid_alpha : faded_alpha);
			PS.borderAlpha(x, y, bottom_border_on ? solid_alpha : faded_alpha);
			break;
		case 6:
			PS.alpha(x, y, left_border_on ? solid_alpha : faded_alpha);
			PS.borderAlpha(x, y, left_border_on ? solid_alpha : faded_alpha);
			break;
		case 7:
			PS.alpha(x, y, top_border_on ? solid_alpha : faded_alpha);
			PS.borderAlpha(x, y, top_border_on ? solid_alpha : faded_alpha);
			break;
		case 8:
			PS.alpha(x, y, right_border_on ? solid_alpha : faded_alpha);
			PS.borderAlpha(x, y, right_border_on ? solid_alpha : faded_alpha);
			break;
		default:
			PS.alpha(x, y, solid_alpha);
			break;
	}



	return;
};


PS.hello = function()
{
	// update all blocks
	for(var block of blocks){
		// move block if it's not locked
		if(!block.locked) {
			// record old block coords
			var oldx = block.x;
			var oldy = block.y;

			// decide a direction to move in
			var movevec = PS.dirToVector(block.dir);

			// calculate new block coors
			var newx = oldx + movevec.x;
			var newy = oldy + movevec.y;

            // move only if the new position is unoccupied

			PS.moveBlock(block, oldx, oldy, newx, newy);

		}
	}
};

PS.coordInBounds = function(x, y){
	return (x > -1 && x < board_size && y > -1 && y < board_size);
};

PS.coordWithnWalls = function(x, y){
	return (x > 0 && x < board_size - 1 && y > 0 && y < board_size - 1);
};

PS.coordIsWalls = function(x, y){
	return (x == 0 || x == board_size - 1 || y == 0 || y == board_size - 1);
};

PS.drawBlock = function(block){
	PS.color(block.x, block.y, PS.dirToColor(block.dir));
	PS.glyph(block.x, block.y, PS.dirToGlyph(block.dir));
	PS.border(block.x, block.y, 2);
	PS.alpha(block.x, block.y, 255);
	PS.borderAlpha(block.x, block.y, 255);
	PS.borderColor(block.x, block.y, PS.COLOR_BLACK);
};

PS.drawEmpty = function(x, y){
	PS.border(x, y, 0);

	if(PS.coordIsWalls(x, y)){
		PS.drawWall(x, y);
	}else {
		PS.color(x, y, 0xFFFFFF);
	}

	PS.glyph(x, y, 0);
};


PS.placeBlock = function(x, y, locked, dir){
	// do not place blocks out of bounds
	if(!PS.coordInBounds(x, y)) return;
	// do not place blocks on top of other blocks
	if(occupied[x][y] != 0) return;
	// update occupied array
	occupied[x][y] = 1;
	// add block to blocks array
	let b = {x: x, y: y, locked: locked, dir: dir, falling: false};
	blocks.push(b);
	// render block
	PS.drawBlock(b);
};

PS.moveBlock = function(block, oldx, oldy, newx, newy){
	// if moving out of bounds, remove it
	if (!PS.coordInBounds(newx, newy)){
		PS.audioPlay("fx_swoosh", {volume: 0.035});
		PS.removeBlock(block);
		return;
	}

	// play fall sound if necessary
	let difx = newx - oldx;
	let dify = newy - oldy;


	if(PS.coordInBounds(newx + difx, newy + dify) && occupied[newx + difx][newy + dify] !== 0) {
		if(block.falling) {
			PS.audioPlay("fx_click", {volume: 0.1});
			block.falling = false;
		}
	}else{
		// set falling to true
		block.falling = true;
	}

	if(occupied[newx][newy] == 0) {
		// update occupied array
		occupied[oldx][oldy] = 0;
		occupied[newx][newy] = 1;

		// update block
		block.x = newx;
		block.y = newy;

		// hide old block
		PS.drawEmpty(oldx, oldy);

		// draw new block
		PS.drawBlock(block);
	}


};

PS.removeBlock = function(block){
	var index = blocks.indexOf(block);
	if (index == -1) return;

	// update occupied array
	occupied[block.x][block.y] = 0;
	// remove block from blocks array
	blocks.splice(index, 1);
	// remove block from screen
	PS.drawEmpty(block.x, block.y);
};

PS.getBlock = function(x,y){
	for(let block of blocks){
		if(block.x == x && block.y == y){
			return block;
		}
	}
	return null;
}

/*
Gravity directions are:
0 - no gravity
1 - up
2 - right
3 - down
4 - left
 */
PS.dirToVector = function(dir){
	switch(1 + ((dir + dir_offset) % 4)){
		case 0:
			return {x: 0, y: 0};
		case 1:
			return {x: 0, y: -1};
		case 2:
			return {x: 1, y: 0};
		case 3:
			return {x: 0, y: 1};
		case 4:
			return {x: -1, y: 0};
	}
};

PS.dirToGlyph = function(dir){
	switch(1 + ((dir + dir_offset) % 4)){
		case 0:
			return 0;
		case 1:
			return "˄";
		case 2:
			return "˃";
		case 3:
			return "˅";
		case 4:
			return "˂";
	}
};

PS.dirToColor = function(dir){
	switch(dir){
		case 0:
			return 0x264653;
		case 1:
			return 0xFF595E;
		case 2:
			return 0xFFCA3A;
		case 3:
			return 0x8AC926;
		case 4:
			return 0x1982C4;
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

	// Add code here for mouse clicks/touches
	// over a bead.

	// see if we are touching a corner
	if(x == 0 && y == 0){
		dir_one_on = !dir_one_on;
		PS.drawCorner(1);
		PS.audioPlay("perc_block_high", {volume: 0.1});
		return;
	}
	if(x==0 && y == board_size -1){
		dir_two_on = !dir_two_on;
		PS.drawCorner(2);
		PS.audioPlay("perc_block_high", {volume: 0.1});
		return;
	}
	if(x==board_size-1 && y == 0){
		dir_three_on = !dir_three_on;
		PS.drawCorner(3);
		PS.audioPlay("perc_block_high", {volume: 0.1});
		return;
	}
	if(x==board_size -1 && y == board_size -1){
		dir_four_on = !dir_four_on;
		PS.drawCorner(4);
		PS.audioPlay("perc_block_high", {volume: 0.1});
		return;
	}

	// see if we are toggling a border
	if(x == 0){
		PS.setLeftBorder(!left_border_on);
		PS.audioPlay("perc_block_low", {volume: 0.15});
	}
	if (x == board_size - 1){
		PS.setRightBorder(!right_border_on);
		PS.audioPlay("perc_block_low", {volume: 0.15});
	}
	if(y == 0){
		PS.setTopBorder(!top_border_on);
		PS.audioPlay("perc_block_low", {volume: 0.15});
	}
	if(y == board_size - 1){
		PS.setBottomBorder(!bottom_border_on);
		PS.audioPlay("perc_block_low", {volume: 0.15});
	}

	if(!PS.coordWithnWalls(x, y)) return;

	// spawn beads
	if(occupied[x][y] == 0) {
		PS.spawnBead(x,y);
	}else{
		let b = PS.getBlock(x, y);
		if (b != null && !b.locked){
			// change the color of a block if it is clicked on
			PS.audioPlay("perc_shaker", {volume: 0.08});
			b.dir = ((b.dir % 4) + 1);
			PS.drawBlock({x: x, y: y, locked: false, dir: b.dir, falling: false});
		}
	}

};

PS.spawnBead = function(x, y){
	let dir = PS.randomActiveDir();
	if(dir != 0)
	{
		// spawn a block when clicking on an unoccupied spac
		PS.audioPlay("fx_rip", {volume: 0.05});
		PS.placeBlock(x, y, false, dir);
	}
}

PS.randomActiveDir = function() {
	// make an array of directions
	var dir_arr = Array.of(1, 2, 3, 4);

	// shuffle the array of directions
	PS.shuffle(dir_arr);


	for( var i = 0; i < dir_arr.length; i++){
		if(PS.isDirActive(dir_arr[i])){
			return dir_arr[i];
		}
	}

	return 0;
}

PS.shuffle = function(arr){
	for(let i = arr.length - 1; i > 0; i--){
		let random_index = PS.random(i + 1) - 1;

		let temp = arr[random_index];
		arr[random_index] = arr[i];
		arr[i] = temp;
	}
}

PS.isDirActive = function(dir){
	switch(dir){
		case 1:
			return dir_one_on;
		case 2:
			return dir_two_on;
		case 3:
			return dir_three_on;
		case 4:
			return dir_four_on;
	}
}

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
	if(options.touching && occupied[x][y] ==0){
		PS.spawnBead(x,y);
	}
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
	PS.audioPlay("fx_powerup3", {volume: 0.05});
	dir_offset += 1;
	PS.updateBlockGraphics();
	PS.setTopBorder(top_border_on);
	PS.setRightBorder(right_border_on);
	PS.setBottomBorder(bottom_border_on);
	PS.setLeftBorder(left_border_on);
};

PS.updateBlockGraphics = function() {
	for(let b of blocks){
		PS.drawBlock(b);
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

