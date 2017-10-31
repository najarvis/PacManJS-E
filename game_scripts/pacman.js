function Pacman(pos) {
    Entity.call(this, pos);
};

Pacman.prototype = Object.create(Entity.prototype);
Pacman.prototype.constructor = Pacman;

Pacman.prototype.update = function(map, time_delta, input, entities) {
    // Handle user input
    //var pos = this.vel;
    if (input[87]){ // W
        this.vel.y = -1;
        this.vel.x = 0;
        //pos = pos.add(new vector2(0, -1));
    }
    if (input[83]){ // S
        this.vel.y = 1;
        this.vel.x = 0;
        //pos = pos.add(new vector2(0, 1));
    }
    if (input[65]){ // A
        this.vel.x = -1;
        this.vel.y = 0;
        //pos = pos.add(new vector2(-1, 0));
    }
    if (input[68]){ // D
        this.vel.x = 1;
        this.vel.y = 0;
        //pos = pos.add(new vector2(1, 0));
    }
    //this.vel = pos;

    old_pos = this.pos;
    this.pos = this.pos.add(this.vel.mul(this.speed * time_delta));
    if (!this.valid_pos(map)) {
        this.pos = old_pos;
    }

};