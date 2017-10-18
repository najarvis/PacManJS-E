function vector2(x, y) {
    this.x = x == undefined ? 0 : x;
    this.y = y == undefined ? 0 : y;

	// Adds two vectors together and returns the result as a new vector.
	this.add = function(other) {
		return new vector2(this.x + other.x, this.y + other.y);
	}

	// Multiplies the given vector by a scalar and returns the new vector.
	this.mul = function(scalar) {
		return new vector2(this.x * scalar, this.y * scalar);
	}

	// Returns the magitude of a vector. Magnitude = sqrt(x^2 + y^2).
	this.magnitude = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	// Returns a unit vector in the direction of the original vector. To calculate the normal divide the vector by the magnitude.
	this.normalize = function() {
		// Because division is not defined on our vector, we multiply by 1 over the magitude.
        if (this.magnitude() == 0) return this.mul(0);
		return this.mul(1 / this.magnitude());
	}

	// Returns the distance to the vector supplied as an argument.
	this.distanceTo = function(other) {
		return Math.sqrt((this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y));
	}

	// Returns the vector to the vector supplied as an argument.
	this.fromOther = function(other) {
		// The vector from vector a to vector b is just b - a, so here we just add (-1 * a) to b.
		return other.add(this.mul(-1));
	}

	this.toString = function() {
		return "vector2(" + String(this.x) + ", " + String(this.y) + ")";
	}

}
