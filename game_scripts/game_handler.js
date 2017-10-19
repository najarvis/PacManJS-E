$(document).ready(function() {
    var canvas = document.getElementById('canvas');
    canvas.width = $(window).width();
    canvas.height = $(window).height();

    var context = canvas.getContext("2d");

    var gh = new game_handler();
    gh.draw(context);
});

function pellet(pos, size, type) {
    this.pos = pos;
    this.size = size;
    this.type = type;

    this.draw = function(ctx) {
        if (this.type == "default") {
            ctx.fillStyle = "#DDDD00";
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.size, 0, 360);
            ctx.fill();
        }
        else {
            ctx.fillStyle = "#DDDD00";
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.size * 1.5, 0, 360);
            ctx.fill();
        }
    }
}


function game_handler() {

    this.pellets = [];
    this.pacman = undefined;
    this.ghosts = [];

    this.game_map = new map();
    this.game_map.start();

    for (var i = 0; i < this.game_map.tiles.length; i++) {
        var p = this.game_map.tiles[i].get_pellets();
        for (var j = 0; j < p.length; j++) {
            if (j == 0 && this.game_map.check_corner(this.game_map.tiles[i])) {
                this.pellets.push(new pellet(p[j], this.game_map.tile_size / 4, "power"));
            }
            else {
                this.pellets.push(new pellet(p[j], this.game_map.tile_size / 4, "default"));
            }
        }
    }

    this.draw = function(ctx) {
        this.game_map.draw(ctx);

        for (var i = 0; i < this.pellets.length; i++) {
            this.pellets[i].draw(ctx);
        }

        for (var i = 0; i < this.ghosts.length; i++) {
            this.ghosts[i].draw(ctx);
        }
    }
}
