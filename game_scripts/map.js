// changing this from true to false will remove the red lines surrounding the tiles.
DEBUG = false;


 /** A class which represents a "tile".
   * 
   * Creates a tile with a position, a size, and given empty walls..
   * @param position the position of the tile, as a vector2.
   * @param top_e A boolean of whether or not the top part of the tile is empty.
   * @param right_e A boolean of whether or not the right part of the tile is empty.
   * @param bottom_e A boolean of whether or not the bottom part of the tile is empty.
   * @param left_e A boolean of whether or not the left part of the tile is empty.
   * @param size The size of 1/3 of the tile.
   */
function tile(position, top_e, right_e, bottom_e, left_e, size) {
    // This is basically the constructor.
    this.top_empty = top_e;
    this.right_empty = right_e;
    this.bottom_empty = bottom_e;
    this.left_empty = left_e;
    this.position = position;

    this.full_size = size * 3 // Pixels
    this.size = size; // Size here is the size of each sub square that gets drawn. Full_size is the size of the entire tile.

	
	 /** Draws the tile onto the given context.
	   * @param ctx the canvas context to draw on.
	   */
    this.draw = function (ctx) { 
        ctx.fillColor = "#0000FF";
        ctx.fillRect(this.position.x,                 this.position.y,                 this.size, this.size); // Top left rect
        ctx.fillRect(this.position.x + this.size * 2, this.position.y,                 this.size, this.size); // Top right rect
        ctx.fillRect(this.position.x,                 this.position.y + this.size * 2, this.size, this.size); // Bottom left rect
        ctx.fillRect(this.position.x + this.size * 2, this.position.y + this.size * 2, this.size, this.size); // Bottom right rect
        
        if (!this.top_empty) {
            ctx.fillRect(this.position.x + this.size,     this.position.y,                 this.size, this.size); // Top rect
        }   
        if (!this.right_empty) {
            ctx.fillRect(this.position.x + this.size * 2, this.position.y + this.size,     this.size, this.size); // Right rect
        }   
        if (!this.bottom_empty) {
            ctx.fillRect(this.position.x + this.size,     this.position.y + this.size * 2, this.size, this.size); // Bottom rect
        }   
        if (!this.left_empty) {
            ctx.fillRect(this.position.x,                 this.position.y + this.size,     this.size, this.size); // Left rect
        }

        // If DEBUG is true, this draws a red border on each tile.
        if (DEBUG) {
            ctx.strokeStyle = "#FF0000";
            ctx.strokeRect(this.position.x, this.position.y, this.full_size, this.full_size);
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

    this.get_pellets = function() {
        var base_pos = new vector2(this.position.x + this.full_size / 2, this.position.y + this.full_size / 2)
        var p = [base_pos];
        if (this.left_empty) {
            p.push(base_pos.add(new vector2(-this.size, 0)));
        }
        if (this.right_empty) {
            p.push(base_pos.add(new vector2(this.size, 0)));
        }
        if (this.top_empty) {
            p.push(base_pos.add(new vector2(0, -this.size)));
        }
        if (this.bottom_empty) {
            p.push(base_pos.add(new vector2(0, this.size)));
        }

        return p;
    }
}



function map() {

    this.tiles = [];
    this.game_size = 8;
    this.tile_size = 24;

    // Gets a tile object from x, y coordinates. The coordinates don't need to
    // know anything about the size of the tiles themselves. Think about it as
    // '2nd tile from the left, 3rd tile down.'
    this.get_tile = function(x, y, tile_size) {
        for (var i = 0; i < this.tiles.length; i++) {
            item = this.tiles[i];
            if (item.position.x / tile_size == x &&
                item.position.y / tile_size == y) {
                return item;
            }
        }
    },

    this.start = function () {

        var s = this.tile_size;
        var w = s * 3;
        var attempt = 0;
        
        console.log("Creating the map...");
        while (true) {
            // My current solution is basically to retry creating the map until it works.
            this.tiles = [];

            // i stores the number of times we've had to retry a specific tile.
            // 100 might be overkill but it's not very noticeable.
            var i = 0;
            var max_i = 100;

            for (var y = 0; y < this.game_size; y++) {
                if (i > max_i) break;

                for (var x = 0; x < this.game_size / 2; x++) {
                    if (i > max_i) break;

                    // Randomly generate whether or not each side is open.   
                    var t = Boolean(Math.floor(Math.random() * 2));
                    var r = Boolean(Math.floor(Math.random() * 2));
                    var b = Boolean(Math.floor(Math.random() * 2));
                    var l = Boolean(Math.floor(Math.random() * 2));

                    if (x == 0)                       l = false; // Sides
                    if (y == 0)                       t = false;
                    if (y == this.game_size-1)             b = false;
                    if (x == 0 && y == 0)           { r = true; b = true; } // Corners
                    if (x == 0 && y == this.game_size-1) { r = true; t = true; }

                    // Make each tile connect to the tile to it's left.
                    if (x > 0) {
                        l = this.get_tile(x-1, y, w).right_empty;
                    }

                    // Make each tile connect to the tile above it.
                    if (y > 0) {
                        t = this.get_tile(x, y-1, w).bottom_empty;
                    }

                    // This sums the number of 'true' values between t, r, b, and l.
                    var sum = [t, r, b, l].reduce((a, b) => a + b, 0);

                    if (sum < 2) {
                        // There should be a better solution than this, because this could theoretically take O(inf) time.
                        // This just checks to see if a tile has 0 or 1 outgoing connections and redoes this iteration of the loop.
                        x--;
                        i++;
                        continue;
                    }

                    this.tiles.push(new tile(new vector2(x * w, y * w), t, r, b, l, s));
                    this.tiles.push(new tile(new vector2((this.game_size - x - 1) * w, y * w), t, l, b, r, s)); // Mirror the map left / right
                }
            }
            if (i <= max_i) break;
            console.log("Attempt #" + ++attempt + " failed...");
        }

        console.log("Going into the fill algorithm...");
        // Fill algorithm
        var seen_tiles = [];
        while (seen_tiles.length < this.tiles.length) {
            var seen_tiles = [];
            t1 = this.tiles[0];
            var tile_queue = [t1];

            while (tile_queue.length > 0) {
                var curr = tile_queue.shift(); // Pop left
                if (checkIn(seen_tiles, curr)) continue;

                seen_tiles.push(curr);

                // Push all connected tiles.
                if (curr.right_empty) {
                    tile_queue.push(this.get_tile((curr.position.x / w) + 1, (curr.position.y / w), w));
                }
                if (curr.bottom_empty) {
                    tile_queue.push(this.get_tile((curr.position.x / w), (curr.position.y / w) + 1, w));
                }
                if (curr.left_empty) {
                    tile_queue.push(this.get_tile((curr.position.x / w) - 1, (curr.position.y / w), w));
                }
                if (curr.top_empty) {
                    tile_queue.push(this.get_tile((curr.position.x / w), (curr.position.y / w) - 1, w));
                }
            }
            console.log(seen_tiles.length);
 
            // Each time there isn't a continuous map, we connect two tiles together.
            if (seen_tiles.length < this.tiles.length) {

                // Loop over each tile and stop on the first one that isn't in the 'seen' array.
                for (var i = 0; i < this.tiles.length; i++) {
                    var curr = this.tiles[i];
                    if (!checkIn(seen_tiles, curr)) {

                        // If it's right side is closed off, and on it's right is a tile that is in the 'seen' array, connect the two.
                        if (!curr.right_empty && curr.position.x < (this.game_size - 1) * w) {
                            if (checkIn(seen_tiles, this.get_tile((curr.position.x / w) + 1, (curr.position.y / w), w))) {

                                curr.right_empty = true;
                                this.get_tile((curr.position.x / w) + 1, (curr.position.y / w), w).left_empty = true;

                                // Deal with the mirror side.
                                this.get_tile((this.game_size - (curr.position.x / w) - 1), (curr.position.y / w), w).left_empty = true;
                                this.get_tile((this.game_size - (curr.position.x / w)), (curr.position.y / w), w).right_empty = true;
                                break;
                            }
                        }

                        // If it's bottom side is closed off, and on it's bottom is a tile that is in the 'seen' array, connect the two.
                        if (!curr.bottom_empty && curr.position.y < (this.game_size - 1) * w) {
                            if (checkIn(seen_tiles, this.get_tile((curr.position.x / w), (curr.position.y / w) + 1, w))) {

                                curr.bottom_empty = true;
                                this.get_tile((curr.position.x / w), (curr.position.y / w) + 1, w).top_empty = true;

                                // Deal with the mirror side.
                                this.get_tile((this.game_size - (curr.position.x / w) - 1), (curr.position.y / w), w).bottom_empty = true;
                                this.get_tile((this.game_size - (curr.position.x / w) - 1), (curr.position.y / w) + 1, w).top_empty = true;

                                break;
                            }
                        }

                        // If it's left side is closed off, and on it's left is a tile that is in the 'seen' array, connect the two.
                        if (!curr.left_empty && curr.position.x > 0) {
                            if (checkIn(seen_tiles, this.get_tile((curr.position.x / w) - 1, (curr.position.y / w), w))) {

                                curr.left_empty = true;
                                this.get_tile((curr.position.x / w) - 1, (curr.position.y / w), w).right_empty = true;

                                // Deal with the mirror side.
                                this.get_tile((this.game_size - (curr.position.x / w) - 1), (curr.position.y / w), w).right_empty = true;
                                this.get_tile((this.game_size - (curr.position.x / w)), (curr.position.y / w), w).left_empty = true;

                                break;
                            }
                        }

                        // If it's top side is closed off, and on it's top is a tile that is in the 'seen' array, connect the two.
                        if (!curr.top_empty && curr.position.y > 0) {
                            if (checkIn(seen_tiles, this.get_tile((curr.position.x / w), (curr.position.y / w) - 1, w))) {

                                curr.top_empty = true;
                                this.get_tile((curr.position.x / w), (curr.position.y / w) - 1, w).bottom_empty = true;

                                // Deal with the mirror side.
                                this.get_tile((this.game_size - (curr.position.x / w) - 1), (curr.position.y / w), w).top_empty = true;
                                this.get_tile((this.game_size - (curr.position.x / w) - 1), (curr.position.y / w) - 1, w).bottom_empty = true;

                                break;
                            }
                        }
                    }
                }
            }
        }

    }

    this.draw = function(ctx) {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].draw(ctx);
        }
    }

    this.check_corner = function(tile) {
        return (tile.position.x == 0 && tile.position.y == 0 ||
                tile.position.x == 0 && tile.position.y == (this.game_size - 1) * this.tile_size * 3 ||
                tile.position.x == (this.game_size - 1) * this.tile_size * 3 && tile.position.y == 0 ||
                tile.position.x == (this.game_size - 1) * this.tile_size * 3 && tile.position.y == (this.game_size - 1) * this.tile_size * 3);
    }
}

function randInt(min, max) {
    // Generate a random number between min and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkIn(array, val) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].equals(val)) return true;
    }
    return false;
}
