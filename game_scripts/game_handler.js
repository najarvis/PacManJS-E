

//Constants
TILE_SIZE = 32;
MAP_SIZE_X = 10;
MAP_SIZE_Y = 10;
PELLET_SIZE = 3;
// changing this from true to false will remove the red lines surrounding the tiles.
DEBUG = false;
DRAW_3D = true;
var drawingThing;
if (DRAW_3D) {
    drawingThing = new drawing(document.getElementById("canvas3d"));
}

//Equivilant of the "main" function of javascript.
$(document).ready(function() {
    var canvas = document.getElementById('canvas');
    canvas.width = TILE_SIZE*MAP_SIZE_X//$(window).width();
    canvas.height = TILE_SIZE*MAP_SIZE_Y//$(window).height();

    var context = canvas.getContext("2d");
	
    var gh = new game_handler();

    var KEYS = [];
    window.addEventListener('keydown', function(e) {
        KEYS[e.keyCode] = true;
        console.log(e.keyCode);
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

    // Start pacman in the topleft corner. TODO: Change this to something in the center of the screen.
    this.pacman = new Pacman(this.game_map.tiles[0].get_center());
    //this.generate_pellets();

    this.generate_pellets = function() {
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
			//Draw the pellet in the 3D plane.
        }
        if (DRAW_3D) {
            for (var i = 0; i < this.pellets.length; i++) {
                drawingThing.drawPellet(this.pellets[i]);
            }
            
            //Clear the tiles before starting.
            drawingThing.clearTiles();
            //Draw the tiles in the 3D space.
            for (var i = 0; i < this.game_map.tiles.length; i++) {
                drawingThing.drawTile(this.game_map.tiles[i]);
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
			//Remove the 3D object representing the pellet from the 3d view.
            if (DRAW_3D) {
                drawingThing.removeObject(this.pellets[eaten[i]].drawingObject3D);
            }
            console.log(this.score);
            this.pellets.splice(eaten[i], 1);
        }

        if (this.pellets.length == 0) {
            this.game_map.start();
            this.generate_pellets();
        }
    }

	
	//Used for Pacman animation.
	var testingPacmanAnimation = 0;
	 /** Draws the game, including the pellets and the ghosts.
	   * @param ctx the canvas context to draw on.
	   */
    this.draw = function(canvas, ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.game_map.draw(ctx);

        for (var i = 0; i < this.pellets.length; i++) {
            this.pellets[i].draw(ctx);
        }

        for (var i = 0; i < this.ghosts.length; i++) {
            this.ghosts[i].draw(ctx);
        }

        this.pacman.draw(ctx);
		//Draw in 3D.
        if (DRAW_3D) {
            drawingThing.drawPacman(this.pacman.pos.x, this.pacman.pos.y, Math.abs(testingPacmanAnimation), this.pacman.vel);
        }
        //The animation loops from -0.2 to 0.2, using an absolute value to display correctly.
        testingPacmanAnimation += 0.02;
        if (testingPacmanAnimation > 0.2) {
            testingPacmanAnimation = -0.2;	
        }
    }
}
