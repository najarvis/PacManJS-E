

 /** Constructor for the ghost.
   * @param pos The position of the ghost.
   * @param type Which ghost it is. 0 = Clyde (Orange), 1 = Blinky (Red), 2 = Pinky (Pink), 3 = Inky (Blue)
   * @param map The game map to check valid positions on.
   * @param map The game map to check valid positions on.
   */
function Ghost(pos, type) {
    Entity.call(this, pos);
	this.type = type;
	//This variable is used to know which ghost to go back to if it becomes 
	//"type 4" - the edible ghost.
	this.origionalType = type;
	//This one is used for displaying the ghost and creating the flashing
	//effect when changing from scared to normal.
	this.displayType = type;
    this.requestedVel = new vector2(0,0);
	
	//The timer is used for when the ghost becomes scared.
	this.timer = 0;
};

Ghost.prototype = Object.create(Entity.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.update = function(map, pacman, delta) {
	
	//This code determines which point the ghost targets.
	if (this.type == 0) {	
		//The behavior of Clyde alternates between the behavior of
		//Blinky the red ghost (see below) and movement
		//towards the lower-left corner of the screen.
		if (Math.random() > 0.5) {
			var goal_x = pacman.pos.x - this.pos.x;
			var goal_y = pacman.pos.y - this.pos.y;
		} else {
			var goal_x = -1;
			var goal_y = 1;
		}
	} else if (this.type == 1) {
		//The behavior of Blinky is to actively chase Pac-Man.
		var goal_x = pacman.pos.x - this.pos.x;
		var goal_y = pacman.pos.y - this.pos.y;
	} else if (this.type == 2) {
		//The behavior of Pinky is to aim for a position in front of Pac-Man.
		var goal_x = pacman.pos.x+ pacman.vel.x*TILE_SIZE*2 - this.pos.x;
		var goal_y = pacman.pos.y + pacman.vel.x*TILE_SIZE*2 - this.pos.y;
	} else if (this.type == 3) {
		// The behavior of Inky is to randomly switch between chasing and running away from Pac-Man.
		var goal_x = pacman.pos.x - this.pos.x;
		var goal_y = pacman.pos.y - this.pos.y;
		
		//Randomly switch to running away by multiplying by -1.
		if (Math.random() > 0.5) {
			goal_x = -goal_x;
			goal_y = -goal_y;
		}
	} else if (this.type == 4) {
		// The behavior of a scared ghost is to run away from Pacman.
		var goal_x = -(pacman.pos.x - this.pos.x);
		var goal_y = -(pacman.pos.y - this.pos.y);
	}
	//Sets the goal directions so that they are 0, 1, or -1.
	var norm_x = goal_x == 0 ? 0 : goal_x / Math.abs(goal_x);
	var norm_y = goal_y == 0 ? 0 : goal_y / Math.abs(goal_y);
	
	if (this.vel.x == 0 && this.vel.y == 0) {
		
	}
	
	
	
	
	
    //console.log(parseInt(goal_x), parseInt(goal_y), norm_x, norm_y);
	
	
	//The following code actually makes the ghost move toward the target.
	
	
    // Desire to move in a different axis than the one you already are moving in.
	if (this.vel.y == 0) {
		this.requestedVel = new vector2(0, norm_y);
	} else {
        this.requestedVel = new vector2(norm_x, 0);
	}
    
	/*console.log("Ghost position: "+this.pos.x+","+this.pos.y+
			" Vel: "+this.vel.x+","+this.vel.y+" Requested: "+
			this.requestedVel.x+","+this.requestedVel.y);*/
	
	var validPos = this.valid_pos2(map, this.pos,
			this.vel.mul(this.speed * delta), this.requestedVel.mul(this.speed * delta));
			
	if (validPos.status == 2) {
		//If this is the case, make the actual velocity into the requested velocity.
		this.vel.x = this.requestedVel.x;
		this.vel.y = this.requestedVel.y;
	} else if (validPos.status == 0) {
		//If this is the state, then neither the actual or requested speeds
		//are valid directions. As these are perpendicular, that leaves the
		//inverse of the velocity and the inverse of the requested velocity as
		//options. We just came from the inverse of the velocity, so go in the
		//direction of the inverse of the requested velocity.
		
		//But first, we must ensure that the requested velocity is not zero.
		//If it is zero, then the ghost will get stuck, or bounce back and forth aimlessly.
		if (this.requestedVel.x == 0 && this.requestedVel.y == 0) {
			
			//Make it so that the requested velocity points in an arbitrary direction that
			//is perpendicular to the current velocity.
			this.requestedVel.x = this.vel.y;
			this.requestedVel.y = this.vel.x;
			
			//If the requestedVel is still 0 (due to the normal velocity being 0),
			//then choose an arbitrary direction, in this case y.
			if (this.requestedVel.x == 0 && this.requestedVel.y == 0) {
				this.requestedVel.y = 1;
			}
			
			console.log("Invoking breakaway code. New velocity vector: "+this.requestedVel);
			
			//Now we must run the code again to see if the new requested velocity is valid.
			//We test the inverse, as the code below uses the inverse.
			var validPos = this.valid_pos2(map, this.pos,
					this.vel.mul(this.speed * delta), this.requestedVel.mul(-1*this.speed * delta));
			if (validPos.status == 0) {
				//If it is not valid, flip it. This guarantees a valid direction.
				this.requestedVel.x = -this.requestedVel.x;
				this.requestedVel.y = -this.requestedVel.y;
			}
		}
		
		this.vel.x = -this.requestedVel.x;
		this.vel.y = -this.requestedVel.y;
	}
	this.pos = validPos.newPosition;
	

	//This code handles the timer for when the ghost blinks.
	if (this.timer > 0) {
		this.timer -= delta;
		
		if (this.timer <= 0) {
			//The timer has run out. Reset the type.
			this.type = this.origionalType;
			this.displayType = this.origionalType;
			this.speed = 60;
		} else if (this.timer <= 2) {
			//Make the ghost blink.
			if (this.timer*20 % 10 <= 5) {
				this.displayType = this.origionalType;
			} else {
				this.displayType = 4;
			}
			
		}
		
		
	}
}


 /** Makes the ghost into the "scared" state for the given time.
   * @param time The time in seconds that the ghost will be scared.
   */
Ghost.prototype.makeScared = function(time) {
	this.type = 4;
	this.displayType = 4;
	this.timer = time;
	this.speed = 30;
	if (this.vel.x == this.goal_x) {
		this.vel.x = -this.vel.x;
	}
	if (this.vel.y == this.goal_y) {
		this.vel.y = -this.vel.y;
	}
}
