

//Constants
TILE_SIZE = 32;
MAP_SIZE_X = 10;
MAP_SIZE_Y = 10;
PELLET_SIZE = 3;
// changing this from true to false will remove the red lines surrounding the tiles.
DEBUG = true;

var drawingThing = new drawing(document.getElementById("canvas3d"));
//Equivilant of the "main" function of javascript.
$(document).ready(function() {
    var canvas = document.getElementById('canvas');
    canvas.width = TILE_SIZE*MAP_SIZE_X//$(window).width();
    canvas.height = TILE_SIZE*MAP_SIZE_Y//$(window).height();

    var context = canvas.getContext("2d");
	
	//Draws 3D elements.
	//drawingThing = new drawing(document.getElementById("canvas3d"));
	
    var gh = new game_handler();
    gh.draw(context);
});

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
                this.pellets.push(new pellet(p[j], "power"));
            }
            else {
                this.pellets.push(new pellet(p[j], "default"));
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
