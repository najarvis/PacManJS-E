

//Constants
TILE_SIZE = 32;
MAP_SIZE_X = 10;
MAP_SIZE_Y = 10;
PELLET_SIZE = 3;

// changing this from true to false will remove the red lines surrounding the tiles.
DEBUG = false;
DRAW_3D = true;
DRAW_2D = false;
var drawingThing;
if (DRAW_3D) {
    drawingThing = new drawing(document.getElementById("canvas3d"));
}

audio = new sound();

var gh;

//Equivilant of the "main" function of javascript.
$(document).ready(function() {
    var canvas = document.getElementById('canvas');

    if (!DRAW_2D) {
    	canvas.hidden = true;
    }

    canvas.width = TILE_SIZE * MAP_SIZE_X;
    canvas.height = TILE_SIZE * MAP_SIZE_Y;

    var context = canvas.getContext("2d");
	
    gh = new game_handler();

    var KEYS = [];
    window.addEventListener('keydown', function(e) {
    	if (e.keyCode == 32) {
    		gh.status = -gh.status;
    	}
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
    this.score = 0;
    
    // Pull the high score table from the server.
    let hs_data = null;
    $.ajax({
    	url: '/get_high_scores',
    	type: 'get',
    	dataType: 'json',
    	async: false,
    	success: function(res) {
	     	let s = res.scores;
	    	let highest = {"name": "null", "score": 0};

	    	for (let i = 0; i < s.length; i++) {
	    		if (s[i].score > highest.score) {
	    			highest = s[i];
	    		}
	    	}
	    	hs_data = highest;
    	}
    });

    this.high_score = hs_data.score;
    this.hs_name = hs_data.name;

	
	this.lives = 3;
	this.level = 1;
	
	//This is simply for the ghost scoring. When eating a ghost, this doubles.
	//When all ghosts return to normal, this resets to 200.
	this.scoreMultiplier = 200;

	this.resetLevel = function() {
		this.game_map.start();
		this.pellets = [];
		this.generate_pellets();

		this.pacman.pos = this.pacman.start_pos;
		for (var i = 0; i < this.ghosts.length; i++) {
			this.ghosts[i].pos = this.ghosts[i].start_pos;
			this.ghosts[i].removeScared();
		}
		//1 = playing, 2 = ready, 3 = dying.
		this.setStatus(2);
	}
	
	 /** Sets the status of the game. 1 = playing, 2 = ready, 3 = dying, 4 = game over.
	   * Negative numbers are puased, though this function does not support said numbers.
	   * @param ctx the canvas context to draw on.
	   */
	this.setStatus = function(status) {
		if (status == 1) {
			//GO
			this.status = 1;
			this.statusTimer = 1;
		} else if (status == 2) {
			//Before Level
			this.status = 2;
			this.statusTimer = 4.5;
		} else if (status == 3) {
			//Die
			this.status = 3;
			this.statusTimer = 1;
		} else if (status == 4) {
			//Game Over
			this.status = 4;
			this.statusTimer = 6;
		}
		audio.playStatusSound(status);
		
		
	}
	
    this.game_map = new map();
    this.game_map.start();
    this.last_frame = new Date();
    
    var GHOSTS_ENABLE = true;
    this.ghosts = [];

    if (GHOSTS_ENABLE) {
        this.ghosts = [new Ghost(this.game_map.tiles[MAP_SIZE_X + 2].get_center(),0),
                       new Ghost(this.game_map.tiles[MAP_SIZE_X * (MAP_SIZE_Y - 2) + 2].get_center(), 1),
					   new Ghost(this.game_map.tiles[MAP_SIZE_X + 3].get_center(), 2),
					   new Ghost(this.game_map.tiles[MAP_SIZE_X * (MAP_SIZE_Y - 2) + 3].get_center(), 3)];
    }

    // Start pacman in the center
    this.pacman = new Pacman(this.game_map.tiles[MAP_SIZE_X * MAP_SIZE_Y / 2 + MAP_SIZE_X - 1].get_center());
	
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
            //Clear the tiles before starting.
            drawingThing.clearTiles();
			
            for (var i = 0; i < this.pellets.length; i++) {
                drawingThing.drawPellet(this.pellets[i]);
            }
			
            for (var i = 0; i < this.ghosts.length; i++) {
                drawingThing.drawGhost(this.ghosts[i]);
            }
            
            //Draw the tiles in the 3D space.
            for (var i = 0; i < this.game_map.tiles.length; i++) {
                drawingThing.drawTile(this.game_map.tiles[i]);
            }
        }
    }
	

	//PRepare the level as soon as it's started.
	this.resetLevel();

    this.update = function(input) {
        var new_frame = new Date();
        var delta = (new_frame - this.last_frame) / 1000;
        this.last_frame = new_frame;
		
		//Prevents too large of a gap between frames. Large gaps like
		//this can cause entities to phase through walls.
		//console.log("Time Delta: "+delta);
		if (delta > 0.1) {
			delta = 0.1;
		}
		
		//Always update the audio.
		audio.update(delta);
		
		if (this.status < 0) {
			//Paused. Do nothing.
		} else if (this.status == 2) {
			//Ready status
			drawingThing.drawText("Level "+this.level, 0, 0, 0);
			//Change status
			this.statusTimer -= delta;
			if (this.statusTimer <= 0) {
				this.setStatus(1);
			}
		} else if (this.status == 3) {
			//Pacman died status
			this.statusTimer -= delta;
			if (this.statusTimer <= -1) {
				this.lives -= 1;

				// All out of lives. Start new game.
				if (this.lives == 0) {
					this.setStatus(4);
				} else {
					//If not out of new lives, respawn.
					this.pacman.pos = this.pacman.start_pos;
					for (var i = 0; i < this.ghosts.length; i++) {
						this.ghosts[i].pos = this.ghosts[i].start_pos;
					}
					this.setStatus(2);
				}
			}
		} else if (this.status == 4) {
			//Game over status
			if (this.statusTimer >= 4.7) {
				drawingThing.drawText("Game Over", 2, this.statusTimer, 0);
			} else {
				drawingThing.drawText("Game Over\n     YEAH!", 2, this.statusTimer, (4.7-this.statusTimer)/4);
			}

			//Status Timer.
			this.statusTimer -= delta;
			if (this.statusTimer <= 0) {
				//Deal with the actual "Game Over" stuff after displaying the
				//REALISTIC 3D text!
				console.log("Final score: " + this.score);
				if (this.score > this.high_score) { 
					this.high_score = this.score;
					console.log("New high score!");
					this.hs_name = prompt("New high score! What is your name?");

					// UPDATE HIGH SCORE TABLE HERE.
					let temp_scores = null;
					$.ajax({
						url: '/get_high_scores',
						type: 'get',
						dataType: 'json',
						async: false,
						success: function(res) {
							temp_scores = res;
						}
					});

					let hs = this.high_score;
					let hsn = this.hs_name;
					temp_scores.scores.push({"name": hsn, "score": hs});

					$.ajax({
						url: '/update_high_scores',
						type: 'post',
						data: JSON.stringify(temp_scores),
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						success: function(data) {console.log(data);}
					});

				}
				this.resetLevel();
				this.score = 0;
				this.lives = 3;
				this.level = 1;
			}
		} else if (this.status == 1) {


			//Deals with the "Go" text.
			this.statusTimer -= delta;
			if (this.statusTimer > 0) {
				drawingThing.drawText("GO!", 1, 0, (1-this.statusTimer));
				if (this.statusTimer <= 0) {
					//Remove the status text.
					drawingThing.drawText("", 0, 0, 0);
				}
			}
		
			this.pacman.update(this.game_map, delta, input);

			var hit = false;
			for (var i = 0; i < this.ghosts.length; i++) {
				this.ghosts[i].update(this.game_map, this.pacman, delta);

				if (this.pacman.check_collision(this.ghosts[i])) {
					if (this.ghosts[i].type >= 4) {
						audio.playEatGhostSound();
						this.ghosts[i].timer = 1;
						this.ghosts[i].pos = this.game_map.tiles[MAP_SIZE_X*MAP_SIZE_Y/2+MAP_SIZE_X-1].get_center();
						this.score += this.scoreMultiplier;
						this.scoreMultiplier = this.scoreMultiplier*2;
					} else {
						hit = true;
					}
				}
			}

			// Hit by a ghost
			if (hit) {
				//Set the status to reflect this. This will stop al updating
				//and play the Pacman death animation.
				this.setStatus(3);
			}

			// handle pellet collision
			eaten = [];
			for (var i = 0; i < this.pellets.length; i++) {
				if(this.pacman.check_collision(this.pellets[i])) {
					eaten.push(i);
				}
			}

			// Go through all the eaten pellets in a separate loop.
			for (var i = 0; i < eaten.length; i++) {
				audio.playEatDotSound();
				if (this.pellets[eaten[i]].type == "default") {
					this.score += 10;
				} else {
					this.score += 50;
					//Make the ghosts scared, and reset the scoreMultiplier.
					this.scoreMultiplier = 200;
					for (var j = 0; j < this.ghosts.length; j++) {
						this.ghosts[j].makeScared(15-this.level*3);
					}
				}

				//Remove the 3D object representing the pellet from the 3d view.
				if (DRAW_3D) {
					drawingThing.removeObject(this.pellets[eaten[i]].drawingObject3D);
				}
				//console.log(this.score);
				this.pellets.splice(eaten[i], 1);
			}
			
			
			// No pellets remaining? New map!
			if (this.pellets.length == 0) {
				this.resetLevel();
				this.level++;
			}
		}//End the status code.

		// Update game info at the top.
		document.getElementById('score').innerHTML = this.score;
		document.getElementById('h_score').innerHTML = this.hs_name + " - " + this.high_score;
		document.getElementById('lives').innerHTML = this.lives;
		document.getElementById('level').innerHTML = this.level;

    }
	
	//Used for Pacman animation.
	var testingPacmanAnimation = 0;
	
	
	 /** Draws the game, including the pellets and the ghosts.
	   * @param ctx the canvas context to draw on.
	   */
    this.draw = function(canvas, ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw in 2D.
        if (DRAW_2D) {
	        this.game_map.draw(ctx);

	        for (var i = 0; i < this.pellets.length; i++) {
	            this.pellets[i].draw(ctx);
	        }

	        for (var i = 0; i < this.ghosts.length; i++) {
	            this.ghosts[i].draw(ctx);
	        }

        	this.pacman.draw(ctx);
        }

		//Draw in 3D.
        if (DRAW_3D) {
            drawingThing.drawPacman(this.pacman.pos.x, this.pacman.pos.y, Math.abs(testingPacmanAnimation), this.pacman.vel);
            for (var i = 0; i < this.ghosts.length; i++) {
                drawingThing.drawGhost(this.ghosts[i]);
            }
			
        }
		
		if (this.status >= 3 || this.status <= -3) {
			//Pacman's death animation is displayed.
			testingPacmanAnimation -= 0.02;
			if (testingPacmanAnimation < -1) {
				testingPacmanAnimation = -1;
			}
		} else {
			//The animation loops from -0.2 to 0.2, using an absolute value to display correctly.
			testingPacmanAnimation -= 0.02;
			if (testingPacmanAnimation < -0.2) {
				testingPacmanAnimation = 0.2;	
			}
		}
    }
}
