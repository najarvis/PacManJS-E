

 /** A class which represents the game map.
   * 
   * Creates a map with the 
   */
function map() {

    this.tiles = [];
    this.tile_size = TILE_SIZE;

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

    this.get_tile_pos = function(pos) {
        for (var i = 0; i < this.tiles.length; i++) {
            item = this.tiles[i];
            if (item.position.x <= pos.x && item.position.x + item.size > pos.x &&
                item.position.y <= pos.y && item.position.y + item.size > pos.y) {
                return item;
            }
        }
    }

    this.start = function () {

        var s = this.tile_size;
        var w = s;

        while (true) {
            // My current solution is basically to retry creating the map until it works.
            this.tiles = [];

            // i stores the number of times we've had to retry a specific tile.
            // 100 might be overkill but it's not very noticeable.
            var i = 0;
            var max_i = 100;

            for (var y = 0; y < MAP_SIZE_Y; y++) {
                if (i > max_i) break;

                for (var x = 0; x < MAP_SIZE_X / 2; x++) {
                    if (i > max_i) break;

                    // Randomly generate whether or not each side is open.   
                    var t = Boolean(Math.floor(Math.random() * 2));
                    var r = Boolean(Math.floor(Math.random() * 2));
                    var b = Boolean(Math.floor(Math.random() * 2));
                    var l = Boolean(Math.floor(Math.random() * 2));

                    if (x == 0)                       l = false; // Sides
                    if (y == 0)                       t = false;
                    if (y == MAP_SIZE_Y-1)             b = false;
                    if (x == 0 && y == 0)           { r = true; b = true; } // Corners
                    if (x == 0 && y == MAP_SIZE_Y-1) { r = true; t = true; }

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
                    this.tiles.push(new tile(new vector2((MAP_SIZE_X - x - 1) * w, y * w), t, l, b, r, s)); // Mirror the map left / right
                }
            }
            if (i <= max_i) break;
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
                        if (!curr.right_empty && curr.position.x < (MAP_SIZE_X - 1) * w) {
                            if (checkIn(seen_tiles, this.get_tile((curr.position.x / w) + 1, (curr.position.y / w), w))) {

                                curr.right_empty = true;
                                this.get_tile((curr.position.x / w) + 1, (curr.position.y / w), w).left_empty = true;

                                // Deal with the mirror side.
                                this.get_tile((MAP_SIZE_X - (curr.position.x / w) - 1), (curr.position.y / w), w).left_empty = true;
                                this.get_tile((MAP_SIZE_X - (curr.position.x / w)), (curr.position.y / w), w).right_empty = true;
                                break;
                            }
                        }

                        // If it's bottom side is closed off, and on it's bottom is a tile that is in the 'seen' array, connect the two.
                        if (!curr.bottom_empty && curr.position.y < (MAP_SIZE_Y - 1) * w) {
                            if (checkIn(seen_tiles, this.get_tile((curr.position.x / w), (curr.position.y / w) + 1, w))) {

                                curr.bottom_empty = true;
                                this.get_tile((curr.position.x / w), (curr.position.y / w) + 1, w).top_empty = true;

                                // Deal with the mirror side.
                                this.get_tile((MAP_SIZE_X - (curr.position.x / w) - 1), (curr.position.y / w), w).bottom_empty = true;
                                this.get_tile((MAP_SIZE_X - (curr.position.x / w) - 1), (curr.position.y / w) + 1, w).top_empty = true;

                                break;
                            }
                        }

                        // If it's left side is closed off, and on it's left is a tile that is in the 'seen' array, connect the two.
                        if (!curr.left_empty && curr.position.x > 0) {
                            if (checkIn(seen_tiles, this.get_tile((curr.position.x / w) - 1, (curr.position.y / w), w))) {

                                curr.left_empty = true;
                                this.get_tile((curr.position.x / w) - 1, (curr.position.y / w), w).right_empty = true;

                                // Deal with the mirror side.
                                this.get_tile((MAP_SIZE_X - (curr.position.x / w) - 1), (curr.position.y / w), w).right_empty = true;
                                this.get_tile((MAP_SIZE_X - (curr.position.x / w)), (curr.position.y / w), w).left_empty = true;

                                break;
                            }
                        }

                        // If it's top side is closed off, and on it's top is a tile that is in the 'seen' array, connect the two.
                        if (!curr.top_empty && curr.position.y > 0) {
                            if (checkIn(seen_tiles, this.get_tile((curr.position.x / w), (curr.position.y / w) - 1, w))) {

                                curr.top_empty = true;
                                this.get_tile((curr.position.x / w), (curr.position.y / w) - 1, w).bottom_empty = true;

                                // Deal with the mirror side.
                                this.get_tile((MAP_SIZE_X - (curr.position.x / w) - 1), (curr.position.y / w), w).top_empty = true;
                                this.get_tile((MAP_SIZE_X - (curr.position.x / w) - 1), (curr.position.y / w) - 1, w).bottom_empty = true;

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
                tile.position.x == 0 && tile.position.y == (MAP_SIZE_Y - 1) * this.tile_size ||
                tile.position.x == (MAP_SIZE_X - 1) * this.tile_size && tile.position.y == 0 ||
                tile.position.x == (MAP_SIZE_X - 1) * this.tile_size && tile.position.y == (MAP_SIZE_Y - 1) * this.tile_size);
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
