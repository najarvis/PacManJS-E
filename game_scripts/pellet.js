 /** A class which represents a pellet.
   * 
   * Creates a pellet with a position, a size, and a type.
   * @param pos the position of the pellet, as a vector2.
   * @param type the type of the pellet, as a string stating either "default" or something other than default.
   */
function Pellet(pos, type) {
    Entity.call(this, pos);
    this.type = type;
};

Pellet.prototype = Object.create(Entity.prototype);
Pellet.prototype.constructor = Pellet;
	
/** Draws the pellet.
  * @param ctx the canvas context to draw on.
  */
Pellet.prototype.draw = function(ctx) {
    if (this.type == "default") {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, PELLET_SIZE, 0, 360);
        ctx.fill();
    }
    else {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, PELLET_SIZE * 1.5, 0, 360);
        ctx.fill();
    }
}
