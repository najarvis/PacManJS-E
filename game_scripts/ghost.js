function Ghost(pos) {
    Entity.call(this, pos);
};

Ghost.prototype = Object.create(Entity.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.update = function(map, pacman_pos, delta) {
    // This just goes in general to pacman.
    var goal_x = pacman_pos.x - this.pos.x;
    var goal_y = pacman_pos.y - this.pos.y;
    var norm_x = goal_x == 0 ? 0 : goal_x / Math.abs(goal_x);
    var norm_y = goal_y == 0 ? 0 : goal_y / Math.abs(goal_y);
    console.log(parseInt(goal_x), parseInt(goal_y), norm_x, norm_y);
    
    // Prioritize vertical movement over horizontal movement.
    this.vel = new vector2(0, norm_y * this.speed * delta);
    this.pos = this.pos.add(this.vel);
    if (!this.valid_pos(map) || this.in_wall(map.get_tile_pos(this.pos)) || Math.abs(goal_y) < 1) {
        this.pos = this.pos.add(this.vel.mul(-1));

        this.vel = new vector2(norm_x * this.speed * delta, 0);
        this.pos = this.pos.add(this.vel);

        if (!this.valid_pos(map) || this.in_wall(map.get_tile_pos(this.pos))) {
            this.pos = this.pos.add(this.vel.mul(-1));
        }
    }
}
