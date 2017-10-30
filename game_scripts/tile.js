 /** A class which represents a "tile".
   * 
   * Creates a tile with a position, a size, and given empty walls..
   * @param position the position of the tile, as a vector2.
   * @param top_e A boolean of whether or not the top part of the tile is empty.
   * @param right_e A boolean of whether or not the right part of the tile is empty.
   * @param bottom_e A boolean of whether or not the bottom part of the tile is empty.
   * @param left_e A boolean of whether or not the left part of the tile is empty.
   * @param size The size of the tile. Default is 32 (stored in the TILE_SIZE constant in game_handler).
   */
function tile(position, top_e, right_e, bottom_e, left_e, size) {
    // This is basically the constructor.
    this.top_empty = top_e;
    this.right_empty = right_e;
    this.bottom_empty = bottom_e;
    this.left_empty = left_e;
    this.position = position;
	
	if (size == undefined) {
		this.size = TILE_SIZE;
	} else {
		this.size = size;
	}
	
	 /** Draws the tile onto the given context.
	   * @param ctx the canvas context to draw on.
	   */
    this.draw = function (ctx) { 
		var third_size = this.size/3;
	
        ctx.fillColor = "#0000FF";
        ctx.fillRect(this.position.x,                 this.position.y,                 third_size, third_size); // Top left rect
        ctx.fillRect(this.position.x + third_size * 2, this.position.y,                 third_size, third_size); // Top right rect
        ctx.fillRect(this.position.x,                 this.position.y + third_size * 2, third_size, third_size); // Bottom left rect
        ctx.fillRect(this.position.x + third_size * 2, this.position.y + third_size * 2, third_size, third_size); // Bottom right rect
        
        if (!this.top_empty) {
            ctx.fillRect(this.position.x + third_size,     this.position.y,                 third_size, third_size); // Top rect
        }   
        if (!this.right_empty) {
            ctx.fillRect(this.position.x + third_size * 2, this.position.y + third_size,     third_size, third_size); // Right rect
        }   
        if (!this.bottom_empty) {
            ctx.fillRect(this.position.x + third_size,     this.position.y + third_size * 2, third_size, third_size); // Bottom rect
        }   
        if (!this.left_empty) {
            ctx.fillRect(this.position.x,                 this.position.y + third_size,     third_size, third_size); // Left rect
        }

        // If DEBUG is true, this draws a red border on each tile.
        if (DEBUG) {
            ctx.strokeStyle = "#FF0000";
            ctx.strokeRect(this.position.x, this.position.y, this.size, this.size);
        }
    }
	
	
	 /** Simply changes the stored position of a tile.
	   * @param position the new vector2 position of the tile.
	   */
    this.set_position = function(position) {
        this.position = position;
    }

	
	 /** Checks if a tile is equal to another tile.
	   * @param other The other tile to compare to.
	   */
    this.equals = function(other) {
        return (this.top_empty == other.top_empty &&
                this.right_empty == other.right_empty &&
                this.bottom_empty == other.bottom_empty &&
                this.left_empty == other.left_empty &&
                this.position.x == other.position.x &&
                this.position.y == other.position.y);
    }
	
	
	 /** Gets the positions of the pellets.
	   * @return An array of Vector2s representing the positions of all the pellets in this tile.
	   */
    this.get_pellets = function() {
        var base_pos = new vector2(this.position.x + this.size / 2, this.position.y + this.size / 2)
        var p = [base_pos];
        if (this.left_empty) {
            p.push(base_pos.add(new vector2(-this.size/3, 0)));
        }
        if (this.right_empty) {
            p.push(base_pos.add(new vector2(this.size/3, 0)));
        }
        if (this.top_empty) {
            p.push(base_pos.add(new vector2(0, -this.size/3)));
        }
        if (this.bottom_empty) {
            p.push(base_pos.add(new vector2(0, this.size/3)));
        }

        return p;
    }
}