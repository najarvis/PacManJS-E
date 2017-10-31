

//Constants
TILE_SIZE = 32;
MAP_SIZE_X = 10;
MAP_SIZE_Y = 10;
PELLET_SIZE = 3;
// changing this from true to false will remove the red lines surrounding the tiles.
DEBUG = false;

//var drawingThing = new drawing(document.getElementById("canvas3d"));
//Equivilant of the "main" function of javascript.
$(document).ready(function() {
    var canvas = document.getElementById('canvas');
    canvas.width = TILE_SIZE*MAP_SIZE_X//$(window).width();
    canvas.height = TILE_SIZE*MAP_SIZE_Y//$(window).height();

    var context = canvas.getContext("2d");
	
	//Draws 3D elements.
	//drawingThing = new drawing(document.getElementById("canvas3d"));
	
    var gh = new game_handler();

    var KEYS = [];
    window.addEventListener('keydown', function(e) {
        KEYS[e.keyCode] = true;
    });

    window.addEventListener('keyup', function(e) {
        KEYS[e.keyCode] = false;
    });
    
    setInterval(function() {
        gh.update(KEYS);
        gh.draw(canvas, context);
    }, 1000 / 60);
});

 /** Handles the main game loop. Equivilant of "tester" in java.
   * 
   */
function game_handler() {
	
    this.pellets = [];
    this.ghosts = [];
    this.score = 0;
    this.lives = 3;
	
    this.game_map = new map();
    this.game_map.start();
    this.last_frame = new Date();

    this.pacman = new Pacman(this.game_map.tiles[0].get_center());
    this.pacman.vel.y = 1;

    for (var i = 0; i < this.game_map.tiles.length; i++) {
        var p = this.game_map.tiles[i].get_pellets();
        for (var j = 0; j < p.length; j++) {
            if (j == 0 && this.game_map.check_corner(this.game_map.tiles[i])) {
                this.pellets.push(new Pellet(p[j], "power"));
            }
            else {
                this.pellets.push(new Pellet(p[j], "default"));
            }
        }
    }

    this.update = function(input) {
        var new_frame = new Date();
        var delta = (new_frame - this.last_frame) / 1000;
        this.last_frame = new_frame;

        this.pacman.update(this.game_map, delta, input);

        eaten = [];
        for (var i = 0; i < this.pellets.length; i++) {
            if(this.pacman.check_collision(this.pellets[i])) {
                eaten.push(i);
            }
        }

        for (var i = 0; i < eaten.length; i++) {
            if (this.pellets[eaten[i]].type == "default") {
                this.score += 10;
            } else {
                this.score += 50;
                // Power pellet code should go here.
            }
            console.log(this.score);
            this.pellets.splice(eaten[i], 1);
        }
    }

	 /** Draws the game, including the pellets and the ghosts.
	   * @param ctx the canvas context to draw on.
	   */
    this.draw = function(canvas, ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.game_map.draw(ctx);
		
		//Tests out the methods defiend in the drawing.js file.
		for (var i = 0; i < this.game_map.tiles.length; i++) {
			//drawingThing.drawTile(this.game_map.tiles[i]);
		}

        for (var i = 0; i < this.pellets.length; i++) {
            this.pellets[i].draw(ctx);
			//drawingThing.drawPellet(this.pellets[i]);
        }

        for (var i = 0; i < this.ghosts.length; i++) {
            this.ghosts[i].draw(ctx);
        }

        this.pacman.draw(ctx);
    }
}
