function Pacman(pos) {
    Entity.call(this, pos);
};

Pacman.prototype = Object.create(Entity.prototype);
Pacman.prototype.constructor = Pacman;


 /** Handles updating the "pacman" class every frame.
   * @param map The game map to check valid positions on.
   * @param map The game map to check valid positions on.
   * @param map The game map to check valid positions on.
   * @param map The game map to check valid positions on.
   */
Pacman.prototype.update = function(map, time_delta, input, entities) {
    // Handle user input
    //var pos = this.vel;
    if (input[87] || input[38]){ // W
        this.vel.y = -1;
        this.vel.x = 0;
        //pos = pos.add(new vector2(0, -1));
    }
    if (input[83] || input[40]){ // S
        this.vel.y = 1;
        this.vel.x = 0;
        //pos = pos.add(new vector2(0, 1));
    }
    if (input[65] || input[37]){ // A
        this.vel.x = -1;
        this.vel.y = 0;
        //pos = pos.add(new vector2(-1, 0));
    }
    if (input[68] || input[39]){ // D
        this.vel.x = 1;
        this.vel.y = 0;
        //pos = pos.add(new vector2(1, 0));
    }
    //this.vel = pos;
	
	console.log("Pacman position: "+this.pos.x+","+this.pos.y);

    old_pos = this.pos;
    this.pos = this.pos.add(this.vel.mul(this.speed * time_delta));
    if (!this.valid_pos(map)) {
        this.pos = old_pos;
    }

};
