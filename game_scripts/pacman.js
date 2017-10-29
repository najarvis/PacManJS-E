/** A class which represents Pacman!
   * 
   * Creates Pacman in the specified tile coordinates.
   * @param x The x-value of the tile.
   * @param y The y-value of the tile.
   */
function pacman(xTile, yTile) {
    // This is basically the constructor.
    this.xTile = xTile;
    this.yTile = yTile;
	this.direction = 0;
	
	if (size == undefined) {
		this.size = TILE_SIZE;
	} else {
		this.size = size;
	}
	
	 /** Draws the tile onto the given context.
	   * @param ctx the canvas context to draw on.
	   */
    this.draw = function (ctx) { 
        ctx.fillColor = "#FFFF00";
        ctx.fillRect(this.xTile, this.yTile, 16, 16);
    }
	


	 /** Gets the position of Pacman in normal coordinates
	   * @return A vector2 
	   */
    this.getPosition = function() {
        var position = new vector2(xTile, yTile)
		return position;
    }
}