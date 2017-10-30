 /** A class which represents a pellet.
   * 
   * Creates a pellet with a position, a size, and a type.
   * @param pos the position of the pellet, as a vector2.
   * @param type the type of the pellet, as a string stating either "default" or something other than default.
   */
function pellet(pos, type) {
    this.pos = pos;
    this.type = type;

	
	 /** Draws the pellet.
	   * @param ctx the canvas context to draw on.
	   */
    this.draw = function(ctx) {
        if (this.type == "default") {
            ctx.fillStyle = "#DDDD00";
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, PELLET_SIZE, 0, 360);
            ctx.fill();
        }
        else {
            ctx.fillStyle = "#DDDD00";
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, PELLET_SIZE * 1.5, 0, 360);
            ctx.fill();
        }
    }
}