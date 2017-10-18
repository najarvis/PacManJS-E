$(document).ready(function() {
    var canvas = document.getElementById('canvas');
    canvas.width = $(window).width();
    canvas.height = $(window).height();

    var context = canvas.getContext("2d");

    var m = new map();
    m.start();
    m.draw(context);
});

// changing this from true to false will remove the red lines surrounding the tiles.
DEBUG = true;

function tile(position, top_e, right_e, bottom_e, left_e, size) {
    // This is basically the constructor.
    this.top_empty = top_e;
    this.right_empty = right_e;
    this.bottom_empty = bottom_e;
    this.left_empty = left_e;
    this.position = position;

    this.full_size = size * 3 // Pixels
    this.size = size; // Size here is the size of each sub square that gets drawn. Full_size is the size of the entire tile.

    // Draws the tile onto the given context.
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

    // Simply changes the stored position of a tile.
    set_position = function(position) {
        this.position = position;
    }
}

function map() {

    this.tiles = [];
    this.game_size = 8;

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

        var s = 24;
        var w = s * 3;

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

                    if (x == this.game_size / 2 - 1 && y > 0) {
                        // Check to make sure each row connects to the previous
                        var connects = false;
                        for (var x2 = 0; x2 < this.game_size / 2; x2++) {
                            connects = this.get_tile(x2, y, w).top_empty;
                            if (connects) {
                                break;
                            }
                        }

                        if (!connects) {
                            xf = randInt(0, this.game_size / 2 - 1);
                            this.get_tile(xf, y, w).top_empty = true;
                            this.get_tile(xf, y-1, w).bottom_empty = true;
                            this.get_tile((this.game_size - xf - 1), y, w).top_empty = true;
                            this.get_tile((this.game_size - xf - 1), y-1, w).bottom_empty = true;
                        }

                    }

                    if (y == this.game_size - 1 && x > 0) {
                        // Check each column to make sure it is connected at some point to next.
                        var connects = false;
                        for (var y2 = 0; y2 < this.game_size; y2++) {
                            connects = this.get_tile(x-1, y2, w).right_empty;
                            if (connects) {
                                break;
                            }
                        }

                        if (!connects) {
                            yf = randInt(0, this.game_size - 1);
                            console.log(x, yf);
                            this.get_tile(x-1, yf, w).right_empty = true;
                            this.get_tile(x, yf, w).left_empty = true;
                            this.get_tile((this.game_size - x - 2), yf, w).left_empty = true;
                            this.get_tile((this.game_size - x - 1), yf, w).right_empty = true;
                        }
                    }
                }
            }
            if (i <= max_i) break;
        }

    }

    this.draw = function(ctx) {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].draw(ctx);
        }
    }
}

function randInt(min, max) {
    // Generate a random number between min and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
