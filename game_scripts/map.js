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
        context.fillRect(this.position.elements[0],                 this.position.elements[1],                 this.size, this.size); // Top left rect
        context.fillRect(this.position.elements[0] + this.size * 2, this.position.elements[1],                 this.size, this.size); // Top right rect
        context.fillRect(this.position.elements[0],                 this.position.elements[1] + this.size * 2, this.size, this.size); // Bottom left rect
        context.fillRect(this.position.elements[0] + this.size * 2, this.position.elements[1] + this.size * 2, this.size, this.size); // Bottom right rect
        
        if (!this.top_empty) {
            context.fillRect(this.position.elements[0] + this.size,     this.position.elements[1],                 this.size, this.size); // Top rect
        }   
        if (!this.right_empty) {
            context.fillRect(this.position.elements[0] + this.size * 2, this.position.elements[1] + this.size,     this.size, this.size); // Right rect
        }   
        if (!this.bottom_empty) {
            context.fillRect(this.position.elements[0] + this.size,     this.position.elements[1] + this.size * 2, this.size, this.size); // Bottom rect
        }   
        if (!this.left_empty) {
            context.fillRect(this.position.elements[0],                 this.position.elements[1] + this.size,     this.size, this.size); // Left rect
        }

        // If DEBUG is true, this draws a red border on each tile.
        if (DEBUG) {
            context.strokeStyle = "#FF0000";
            context.strokeRect(this.position.elements[0], this.position.elements[1], this.full_size, this.full_size);
        }
    }

    set_position = function(position) {
        this.position = position;
    }

}

var map = {

    start : function () {
        this.canvas = document.getElementById('canvas'),
        this.canvas.width = $(window).width();
        this.canvas.height = $(window).height();

        this.context = this.canvas.getContext("2d");

        var tiles = [];

        var s = 24;
        var w = s * 3;
        var game_size = 8;
        for (var y = 0; y < game_size; y++) {
            for (var x = 0; x < game_size / 2; x++) {
                var t = Boolean(Math.floor(Math.random() * 2));
                var r = Boolean(Math.floor(Math.random() * 2));
                var b = Boolean(Math.floor(Math.random() * 2));
                var l = Boolean(Math.floor(Math.random() * 2));
                if (x == 0)                       l = false; // Sides
                if (y == 0)                       t = false;
                if (y == game_size-1)             b = false;
                if (x == 0 && y == 0)           { r = true; b = true; } // Corners
                if (x == 0 && y == game_size-1) { r = true; t = true; }
                if (!t && !r && !b && !l) {
                    // There should be a better solution than this, because this could theoretically take O(inf) time.
                    // This just checks to see if a tile has no outgoing connections and redoes this iteration of the loop.
                    // This should happen to roughly 1/256 tiles.
                    x--;
                    continue;
                }

                tiles.push(new tile(new vector(x * w, y * w), t, r, b, l, s));
                tiles.push(new tile(new vector((game_size - x - 1) * w, y * w), t, l, b, r, s)); // Mirror the map left / right
            }
        }

        for (var i = 0; i < tiles.length; i++) {
            tiles[i].draw(this.context);
        }
    }
}
