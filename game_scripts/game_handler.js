
//Equivilant of the "main" function of javascript.
$(document).ready(function() {
    var canvas = document.getElementById('canvas');
    canvas.width = 32*3*8//$(window).width();
    canvas.height = 32*3*8//$(window).height();

    var context = canvas.getContext("2d");

    var gh = new game_handler();
    gh.draw(context);
});


 /** A class which represents a pellet.
   * 
   * Creates a pellet with a position, a size, and a type.
   * @param pos the position of the pellet, as a vector2.
   * @param size the size of the pellet, as a number.
   * @param type the type of the pellet, as a string stating either "default" or something other than default.
   */
function pellet(pos, size, type) {
    this.pos = pos;
    this.size = size;
    this.type = type;

	
	 /** Draws the pellet.
	   * @param ctx the canvas context to draw on.
	   */
    this.draw = function(ctx) {
        if (this.type == "default") {
            ctx.fillStyle = "#DDDD00";
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.size, 0, 360);
            ctx.fill();
        }
        else {
            ctx.fillStyle = "#DDDD00";
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.size * 1.5, 0, 360);
            ctx.fill();
        }
    }
}


//Create a pellet (I think).
 /** Handles the main game loop. Equivilant of "tester" in java.
   * 
   */
function game_handler() {
	
    this.pellets = [];
    this.pacman = undefined;
    this.ghosts = [];
	
	
    this.game_map = new map();
    this.game_map.start();

    for (var i = 0; i < this.game_map.tiles.length; i++) {
        var p = this.game_map.tiles[i].get_pellets();
        for (var j = 0; j < p.length; j++) {
            if (j == 0 && this.game_map.check_corner(this.game_map.tiles[i])) {
                this.pellets.push(new pellet(p[j], this.game_map.tile_size / 4, "power"));
            }
            else {
                this.pellets.push(new pellet(p[j], this.game_map.tile_size / 4, "default"));
            }
        }
    }

	 /** Draws the game, including the pellets and the ghosts.
	   * @param ctx the canvas context to draw on.
	   */
    this.draw = function(ctx) {
        this.game_map.draw(ctx);
		
		//Tests out the methods defiend in the drawing.js file.
		for (var i = 0; i < this.game_map.tiles.length; i++) {
			drawingThing.drawTile(this.game_map.tiles[i]);
		}

        for (var i = 0; i < this.pellets.length; i++) {
            this.pellets[i].draw(ctx);
			drawingThing.drawPellet(this.pellets[i]);
        }

        for (var i = 0; i < this.ghosts.length; i++) {
            this.ghosts[i].draw(ctx);
        }
    }
}






