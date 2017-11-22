function Pacman(pos) {
    Entity.call(this, pos);
    this.requestedVel = new vector2(0,0);
    this.color = "#FFDD00";
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
        this.requestedVel.y = -1;
        this.requestedVel.x = 0;
        //pos = pos.add(new vector2(0, -1));
    }
    if (input[83] || input[40]){ // S
        this.requestedVel.y = 1;
        this.requestedVel.x = 0;
        //pos = pos.add(new vector2(0, 1));
    }
    if (input[65] || input[37]){ // A
        this.requestedVel.x = -1;
        this.requestedVel.y = 0;
        //pos = pos.add(new vector2(-1, 0));
    }
    if (input[68] || input[39]){ // D
        this.requestedVel.x = 1;
        this.requestedVel.y = 0;
        //pos = pos.add(new vector2(1, 0));
    }
    //this.vel = pos;
	
	/*console.log("Pacman position: "+this.pos.x+","+this.pos.y+
			" Vel: "+this.vel.x+","+this.vel.y+" Requested: "+
			this.requestedVel.x+","+this.requestedVel.y);*/

    //old_pos = this.pos;
	var validPos = this.valid_pos2(map, this.pos,
			this.vel.mul(this.speed * time_delta), this.requestedVel.mul(this.speed * time_delta));
	
	//The requested speed is set to the normal speed if it is a valid speed,
	//or the requested speed is paralell to the current speed (so Pacman can turn around).
	if (validPos.status == 2 || this.requestedVel.dotProduct(this.vel) != 0) {
		this.vel.x = this.requestedVel.x;
		this.vel.y = this.requestedVel.y;
		this.requestedVel.x = 0;
		this.requestedVel.y = 0;
	}
	this.pos = validPos.newPosition;

};
