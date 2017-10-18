$(document).ready(function() {
    map.start();
});

DEBUG = true;

function tile(position, t, r, b, l, s) {
    this.top_empty = t;
    this.right_empty = r;
    this.bottom_empty = b;
    this.left_empty = l;
    this.position = position;

    this.full_size = s * 3 // Pixels
    this.size = s;

    this.draw = function (context) { 
        context.fillColor = "#0000FF";
        context.fillRect(this.position.x,                 this.position.y,                 this.size, this.size); // Top left rect
        context.fillRect(this.position.x + this.size * 2, this.position.y,                 this.size, this.size); // Top right rect
        context.fillRect(this.position.x,                 this.position.y + this.size * 2, this.size, this.size); // Bottom left rect
        context.fillRect(this.position.x + this.size * 2, this.position.y + this.size * 2, this.size, this.size); // Bottom right rect
        
        if (!this.top_empty) {
            context.fillRect(this.position.x + this.size,     this.position.y,                 this.size, this.size); // Top rect
        }   
        if (!this.right_empty) {
            context.fillRect(this.position.x + this.size * 2, this.position.y + this.size,     this.size, this.size); // Right rect
        }   
        if (!this.bottom_empty) {
            context.fillRect(this.position.x + this.size,     this.position.y + this.size * 2, this.size, this.size); // Bottom rect
        }   
        if (!this.left_empty) {
            context.fillRect(this.position.x,                 this.position.y + this.size,     this.size, this.size); // Left rect
        }

        // If DEBUG is true, this draws a red border on each tile.
        if (DEBUG) {
            context.strokeStyle = "#FF0000";
            context.strokeRect(this.position.x, this.position.y, this.full_size, this.full_size);
        }
    }

    set_position = function(position) {
        this.position = position;
    }

}

var map = {

    get_tile : function(x, y, tile_size, tiles) {
        for (var i = 0; i < tiles.length; i++) {
            item = tiles[i];
            //console.log(item.position.elements[0], tile_size, x, item.position.elements[0] / (tile_size * 3 ))
            if (item.position.x / tile_size == x &&
                item.position.y / tile_size == y) {
                return item;
            }
        }
    },

    start : function () {
        this.canvas = document.getElementById('canvas'),
        this.canvas.width = $(window).width();
        this.canvas.height = $(window).height();

        this.context = this.canvas.getContext("2d");

        var tiles;

        // So a decent amount of times this works great, however there is a chance it can hang because it can get in a loop.
        var s = 24;
        var w = s * 3;
        var game_size = 8;

        while (true) {
            tiles = [];
            var i = 0;
            var max_i = 100;

            for (var y = 0; y < game_size; y++) {
                if (i > max_i) break;

                for (var x = 0; x < game_size / 2; x++) {
                    if (i > max_i) break;

                    var t = Boolean(Math.floor(Math.random() * 2));
                    var r = Boolean(Math.floor(Math.random() * 2));
                    var b = Boolean(Math.floor(Math.random() * 2));
                    var l = Boolean(Math.floor(Math.random() * 2));

                    if (x == 0)                       l = false; // Sides
                    if (y == 0)                       t = false;
                    if (y == game_size-1)             b = false;
                    if (x == 0 && y == 0)           { r = true; b = true; } // Corners
                    if (x == 0 && y == game_size-1) { r = true; t = true; }

                    if (x > 0) {
                        l = map.get_tile(x-1, y, w, tiles).right_empty;
                    }
                    if (y > 0) {
                        t = map.get_tile(x, y-1, w, tiles).bottom_empty;
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

                    tiles.push(new tile(new vector2(x * w, y * w), t, r, b, l, s));
                    tiles.push(new tile(new vector2((game_size - x - 1) * w, y * w), t, l, b, r, s)); // Mirror the map left / right
                }
            }
            if (i <= max_i) break;
        }

        for (var i = 0; i < tiles.length; i++) {
            tiles[i].draw(this.context);
        }
    }
}
