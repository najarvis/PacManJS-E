function Entity(pos) {
    this.pos = pos;
    this.speed = 60 // in pixels per second
    this.vel = new vector2(0, 0);
    this.size = 5;
	//The 3d drawing object to be associated with the entity.
	this.drawingObject3D = null;

};

/* @map is a reference to the game map
 * @time_delta is a floating point number of the time since the last frame in seconds.
 */
Entity.prototype.update = function(map, time_delta) {
    this.pos = this.pos.add(this.vel.mul(this.speed * time_delta));

};

Entity.prototype.draw = function(ctx) {
    ctx.fillStyle = "#00DDFF";
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size, 0, 360);
    ctx.fill();
};

 /** Gets the next valid postion given the given map.
   * @param map The game map to check valid positions on.
   * @return true or false
   */
Entity.prototype.valid_pos = function(map) {
    var TOLERANCE = 5;
    curr_tile = map.get_tile_pos(this.pos);
    if (curr_tile != undefined) {
        if (this.vel.x != 0) {
            // On center line
            if (Math.abs(this.pos.y - (curr_tile.position.y + curr_tile.size / 2)) <= TOLERANCE && !this.in_wall(curr_tile)) {
                this.pos.y = curr_tile.position.y + curr_tile.size / 2;
                return true;
            }
        }
        else if (this.vel.y != 0) {
            // on center line
            if (Math.abs(this.pos.x - (curr_tile.position.x + curr_tile.size / 2)) <= TOLERANCE && !this.in_wall(curr_tile)) {
                this.pos.x = curr_tile.position.x + curr_tile.size / 2;
                return true;
            }
        }
        else {
            return (Math.abs(this.pos.x - (curr_tile.position.x + curr_tile.size / 2)) <= TOLERANCE ||
                    Math.abs(this.pos.y - (curr_tile.position.y + curr_tile.size / 2)) <= TOLERANCE);
        }

    }
    return false;
};

Entity.prototype.in_wall = function(tile) {
    // This assumes that the player is already on one of the grid lines.
    var s = tile.size;
    var wall_width = s / 3;
    var into = this.pos.add(tile.position.mul(-1));
    if (into.x < wall_width && into.y < wall_width || // Corner walls. Always there.
        into.x < wall_width && into.y > wall_width * 2 ||
        into.x > wall_width * 2 && into.y < wall_width ||
        into.x > wall_width * 2 && into.y > wall_width * 2) {
        return true;
    }
    if (!tile.top_empty && into.y < wall_width + this.size) {
        return true;
    }
    if (!tile.bottom_empty && into.y > wall_width * 2 - this.size) {
        return true;
    }
    if (!tile.left_empty && into.x < wall_width + this.size) {
        return true;
    }
    if (!tile.right_empty && into.x > wall_width * 2 - this.size) {
        return true;
    }
    return false;
};

Entity.prototype.check_collision = function(other_entity) {
    return this.pos.distanceTo(other_entity.pos) < this.size + other_entity.size;
};



 /** Gets the next valid postion given the given position, speed, and "desired direction".
   * Returns a status and a valid position. The status can be 0 for "not a valid position",
   * 1 for "A valid position using the current speed", or 2 for "A valid position for the potential
   * speed". 2 Will only be returned if the new speed is different from the old speed, as it resets 
   * the position to tie origin of the tile.
   * @param map The game map to check valid positions on.
   * @param currentPosition 
   * @param currentSpeed 
   * @param potentialSpeed 
   * @return An object with parameters "status" and "newPosition"
   */
Entity.prototype.valid_pos2 = function(map, currentPosition, currentSpeed, potentialSpeed) {
	if (currentPosition == undefined || currentPosition == null) {
		currentPosition = this.pos;
	}
	if (currentSpeed == undefined || currentSpeed == null) {
		currentSpeed = this.vel;
	}
	
	//Stores the current tile.
    var currentTile = map.get_tile_pos(currentPosition);
	
	//In this case, see if the object can move in the potential direction.
	if (potentialSpeed != undefined) {
		//Only execute the case if the potential direction is different from the 
		//current direction, and if the potential direction isn't zero.
		if ((potentialSpeed.x != currentSpeed.x || potentialSpeed.y != currentSpeed.y) && (potentialSpeed.x != 0 || potentialSpeed.y != 0)) {
			console.log("Trying case 2:");
			
			//First, we must see if the box made from the postion, and the
			//sum of the current/poential directions contains the center of a tile (16,16).
			var left = currentPosition.x;
			var right = currentPosition.x+currentSpeed.x+potentialSpeed.x;
			var top = currentPosition.y;
			var bottom = currentPosition.y+currentSpeed.y+potentialSpeed.y;
			
			//Make it so they are with respect to the current tile.
			left = left - currentTile.position.x;
			right = right - currentTile.position.x;
			top = top - currentTile.position.y;
			bottom = bottom - currentTile.position.y;
			
			//Ensure that the left > right, and top < bottom.
			if (right < left) {
				var temp = left;
				left = right;
				right = temp;
			}
			if (top > bottom) {
				var temp = bottom;
				bottom = top;
				top = temp;
			}
			
			//Check if the center of the tile is within the box...
			if (left <= TILE_SIZE/2 && right >= TILE_SIZE/2 && top <= TILE_SIZE/2 && bottom >= TILE_SIZE/2) {
				//If it is, then check if the requested direction is possible...
				if (currentTile.isVectorPointingInEmptyDirection(potentialSpeed)) {
					console.log("Suceeded case 2");
					return {
						"status": 2,
						"newPosition": new vector2(currentTile.position.x+TILE_SIZE/2+potentialSpeed.x, currentTile.position.y+TILE_SIZE/2+potentialSpeed.y)
					};
				}
			}
		}
	}
	
	//This happens if potentialSpeed is null, or it cannot be used.
	//First, check if the speed is pointing toward an open direction.
	//In this case, the movement is good.
	if (currentTile.isVectorPointingInEmptyDirection(currentSpeed)) {
		console.log("Suceeded case 1 trial 1");
		return {
			"status": 1,
			"newPosition": currentPosition.add(currentSpeed)
		}
	} else {
		//If it is NOT pointing in a valid direction...
		//The entity could either not have reached the wall yet, or it has, and needs to stop.
		
		//This vector represents the new position relative to the CENTER of the tile.
		var newPosX = currentPosition.x+currentSpeed.x-currentTile.position.x-TILE_SIZE/2;
		var newPosY = currentPosition.y+currentSpeed.y-currentTile.position.y-TILE_SIZE/2;
		var vectorRepresentingNewPosition = new vector2(newPosX,newPosY);
		
		//Check if the position is valid.
		if (currentTile.isVectorPointingInEmptyDirection(vectorRepresentingNewPosition)) {
			console.log("Suceeded case 1 trial 2");
			return {
				"status": 1,
				"newPosition": currentPosition.add(currentSpeed)
			};
		} else {
			//If not in a valid position, the offending object should be moved to the center fo the tile.
			console.log("Failed case 0");
			return {
				"status": 0,
				"newPosition": new vector2(currentTile.position.x+TILE_SIZE/2,currentTile.position.y+TILE_SIZE/2)
			};
		}
	}
};
