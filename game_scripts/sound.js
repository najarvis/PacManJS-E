
 /** A class which handles the drawing of everything.
   * @param canvas The canvas to draw to.
   */
function sound() {
	this.COOL_SOUNDS = true;
	
	if (this.COOL_SOUNDS) {
		this.startSound = new Audio("/sounds/pacman_beginning.wav");
		this.loopingSound = new Audio("/sounds/pacman_chomp.wav");
		this.deathSound = new Audio("/sounds/pacman_death.wav");
		this.eatGhostSound = new Audio("/sounds/pacman_eatghost.wav");
		this.gameOverSound = new Audio("/sounds/Game-over-yeah.mp3");
		this.goSound = null;
	} else {
		this.startSound = new Audio("/sounds/pacman_beginning.wav");
		this.loopingSound = new Audio("/sounds/pacman_chomp.wav");
		this.deathSound = new Audio("/sounds/pacman_death.wav");
		this.eatGhostSound = new Audio("/sounds/pacman_eatghost.wav");
		this.gameOverSound = new Audio("/sounds/Game-over-yeah.mp3");
		this.goSound = null;
	}
	
	 /** Draws Pacman at the given locaiton with the mouth open the specified amount. This amount
	   * can range from 0 for closed, to 0.2 for open, to 1 for the "dead animation".
	   * @param x The x-position of Pacman.ws
	   * @param y The y-position of Pacman.
	   * @param mouthOpen the amount open that the mouth is. Ranges from 0 for closed, to 0.2 for open.
	   * @param direction the direction that Pacman faces, ranging from 0 for right to 3 to bottom.
	   */
	this.playStatusSound = function(status) {		
		if (status == 1) {
			//Gameplay.
			if (this.goSound != null) {
				this.goSound.play();
			}
		} else if (status == 2) {
			//Start
			if (this.startSound != null) {
				this.startSound.play();
			}
		} else if (status == 3) {
			//Die
			this.deathSound.play();
		} else if (status == 4) {
			if (this.gameOverSound != null) {
				this.gameOverSound.play();
			}
		}
	}
	
	this.loopingTimer = 0;
	
	this.playEatDotSound = function() {	
		if (this.loopingSound != null) {
			this.loopingSound.play();
			this.loopingTimer = 0.3;
		}
	}
	
	this.update = function(delta) {
		if (this.loopingTimer > 0) {
			this.loopingTimer -= delta;
			if (this.loopingSound.currentTime > 0.62) {
				this.loopingSound.currentTime = 0;
			}
			if (this.loopingTimer == 0) {
				this.loopingSound.pause();
			}
		}
	}
	
	this.playEatGhostSound = function() {	
		if (this.eatGhostSound != null) {
			this.eatGhostSound.play();
		}
	}
}