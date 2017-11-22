function Ghost(pos) {
    Entity.call(this, pos);
    this.requestedVel = new vector2(0,0);
};

Ghost.prototype = Object.create(Entity.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.update = function(map, pacman_pos, delta) {
    // This just goes in general to pacman.
    var goal_x = pacman_pos.x - this.pos.x;
    var goal_y = pacman_pos.y - this.pos.y;
    var norm_x = goal_x == 0 ? 0 : goal_x / Math.abs(goal_x);
    var norm_y = goal_y == 0 ? 0 : goal_y / Math.abs(goal_y);
	
    //console.log(parseInt(goal_x), parseInt(goal_y), norm_x, norm_y);
	
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
	
    /*this.pos = this.pos.add(this.vel);
	
    if (!this.valid_pos(map) || this.in_wall(map.get_tile_pos(this.pos)) || Math.abs(goal_y) < 1) {
        this.pos = this.pos.add(this.vel.mul(-1));

        this.vel = new vector2(norm_x * this.speed * delta, 0);
        this.pos = this.pos.add(this.vel);

        if (!this.valid_pos(map) || this.in_wall(map.get_tile_pos(this.pos))) {
            this.pos = this.pos.add(this.vel.mul(-1));
        }
    }*/
}
