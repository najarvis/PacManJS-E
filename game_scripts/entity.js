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

Entity.prototype.valid_pos = function(map) {
    var TOLERANCE = 3;
    curr_tile = map.get_tile_pos(this.pos);
    if (curr_tile != undefined) {
        if (this.vel.x != 0) {
            // On center line
            if (this.pos.y - (curr_tile.position.y + curr_tile.size / 2) <= TOLERANCE && !this.in_wall(curr_tile)) {
                this.pos.y = curr_tile.position.y + curr_tile.size / 2;
                return true;
            }
        }
        else if (this.vel.y != 0) {
            // on center line
            if (this.pos.x - (curr_tile.position.x + curr_tile.size / 2) <= TOLERANCE && !this.in_wall(curr_tile)) {
                this.pos.x = curr_tile.position.x + curr_tile.size / 2;
                return true;
            }
        }
        else {
            return (this.pos.x - (curr_tile.position.x + curr_tile.size / 2) <= TOLERANCE ||
                    this.pos.y - (curr_tile.position.y + curr_tile.size / 2) <= TOLERANCE);
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
}
