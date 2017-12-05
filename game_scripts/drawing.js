
 /** A class which handles the drawing of everything.
   * @param canvas The canvas to draw to.
   */
function drawing(canvas) {
	var SPHERE_QUALITY = 10;
	
	var scene = new THREE.Scene();
	//From https://stackoverflow.com/questions/41786413/render-three-js-scene-in-html5-canvas
	var renderer = new THREE.WebGLRenderer( { canvas: canvas } );
	//renderer.setSize( window.innerWidth, window.innerHeight );
	
	
	//All of the "colors" are stored here.
	var blueBasicMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff} );
	var blueMaterial = new THREE.MeshStandardMaterial( { color: 0x0000ff} );
	var wallMaterial = new THREE.MeshStandardMaterial( { color: 0x6666ff } );
	var pelletMaterial = new THREE.MeshStandardMaterial( { color: 0xffff00 } );
	var pacmanMaterial = new THREE.MeshStandardMaterial( { color: 0xcccc00, side: THREE.DoubleSide } );
	var whiteMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff} );
	//Determines the colors of the ghosts.
	//0 = Clyde (Orange), 1 = Blinky (Red), 2 = Pinky (Pink), 3 = Inky (Blue), 4 = Scared (Blue)
	var ghostMaterials = [
		new THREE.MeshStandardMaterial( { color: 0xff8800} ),
		new THREE.MeshStandardMaterial( { color: 0xff0000} ),
		new THREE.MeshStandardMaterial( { color: 0xff8888} ),
		new THREE.MeshStandardMaterial( { color: 0x00ffff} ),
		new THREE.MeshStandardMaterial( { color: 0x0000ff} )
	];
	
	//Load the font.
	var loader = new THREE.FontLoader();
	this.font = null;
	var THIS = this;
	loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
		THIS.font = font;
	});
	
	
	//The camera is 5 units away from the thing.
	var camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 1000 );
	var CAMERA_DISTANCE = MAP_SIZE_X*TILE_SIZE*0.75;
	camera.scale.set(1,-1,-1);
	//camera.scale.z = -1;
	camera.position.set(MAP_SIZE_X*TILE_SIZE/2, MAP_SIZE_Y*TILE_SIZE/2, -CAMERA_DISTANCE);
	var light = new THREE.PointLight( 0xffffff, 2, CAMERA_DISTANCE*5 );
	light.position.set( MAP_SIZE_X*TILE_SIZE/2, MAP_SIZE_Y*TILE_SIZE/2, -CAMERA_DISTANCE*2);
	scene.add( light );
	
	
	//Holds all geometry related to tiles.
    var tiles = [];
	//Holds all geometry related to pellets.
    var entities = [];
	
	
	var cube;
	
	 /** Draws a cube with the given size.
	   * @param size the size of the cube.
	   */
	this.drawDebugCube = function(size) {		
		var geometry = new THREE.BoxGeometry( size, size, size );
		cube = new THREE.Mesh( geometry, blueMaterial );
		scene.add( cube );
	}
	
	//this.drawDebugCube(1);
	
	
	 /** Draws a tile. This method should only be called once.
	   * @param tile the tile to draw.
	   */
    this.drawTile = function(tile) {
		//This variable determines the width of the walls.
		//The walls will be 1/SIZE_DIVISOR the size of a tile.
		var SIZE_DIVISOR = 8;
		var wallSize = tile.size/SIZE_DIVISOR;
		var sDMinus1 = SIZE_DIVISOR-1;
		var sDMinus2 = SIZE_DIVISOR-2;
		
        createWallRect(tile.position.x,                 tile.position.y,                 wallSize, wallSize); // Top left rect
        createWallRect(tile.position.x + wallSize*sDMinus1, tile.position.y,                 wallSize, wallSize); // Top right rect
        createWallRect(tile.position.x,                 tile.position.y + wallSize*sDMinus1, wallSize, wallSize); // Bottom left rect
        createWallRect(tile.position.x + wallSize*sDMinus1, tile.position.y + wallSize*sDMinus1, wallSize, wallSize); // Bottom right rect
        
        if (!tile.top_empty) {
            createWallRect(tile.position.x + wallSize,     tile.position.y,                 wallSize*sDMinus2, wallSize); // Top rect
        }   
        if (!tile.right_empty) {
            createWallRect(tile.position.x + wallSize*sDMinus1, tile.position.y + wallSize,     wallSize, wallSize*sDMinus2); // Right rect
        }   
        if (!tile.bottom_empty) {
            createWallRect(tile.position.x + wallSize,     tile.position.y + wallSize*sDMinus1, wallSize*sDMinus2, wallSize); // Bottom rect
        }   
        if (!tile.left_empty) {
            createWallRect(tile.position.x,                 tile.position.y + wallSize,     wallSize, wallSize*sDMinus2); // Left rect
        }
	
		function createWallRect(x, y, xSize, ySize) {
			var geometry = new THREE.BoxGeometry( xSize, ySize, 16 );
			var mesh = new THREE.Mesh( geometry, wallMaterial );
			mesh.position.set( x+xSize/2, y+ySize/2, 0 );
			tiles.push(mesh);
			scene.add( mesh );
		}
    }
	
	
	 /** Removes all of the tiles and entities from the scene.
	   * Used when the level is regenerated.
	   */
	this.clearTiles = function() {
		for (i=0; i<tiles.length; i++) {
			scene.remove(tiles[i]);
		}
		for (i=0; i<entities.length; i++) {
			scene.remove(entities[i]);
		}
		entities = [];
	}
	
	
	 /** Draws a pellet. This method should only be called once.
	   * @param pellet the pellet to draw.
	   * @return the graphics object that represents the pellet.
	   */
    this.drawPellet = function(pellet) {
        if (pellet.type == "default") {
			var obj3D = createPelletSphere(pellet.pos.x, pellet.pos.y, PELLET_SIZE);
        }
        else {
            var obj3D = createPelletSphere(pellet.pos.x, pellet.pos.y, PELLET_SIZE*1.5);
        }
		//Set the pellet's drawingObject3D to be the correct object.
		pellet.drawingObject3D = obj3D;
		return obj3D;
	
		//Creates the actual sphere.
		function createPelletSphere(x, y, size) {
			//Creates a shpere with a given size and a "fidelity" of 3 and 2 for the width and height.
			var geometry = new THREE.SphereGeometry( size, 4, 3 );
			var mesh = new THREE.Mesh( geometry, pelletMaterial );
			mesh.position.set( x, y, 0 );
			entities.push(mesh);
			scene.add( mesh );
			return mesh;
		}
    }
	
	
	//Creates the Pacman object.
	//Holds the "mesh" object that represents Pacman.
	var pacmanGeometry = new THREE.SphereBufferGeometry( TILE_SIZE/4, SPHERE_QUALITY, SPHERE_QUALITY);
	var pacman = new THREE.Mesh( pacmanGeometry, pacmanMaterial );
	var pacmanLight = new THREE.PointLight( pacmanMaterial.color/*"#FFFFFF"/*/, 3, TILE_SIZE*3 );
	pacmanLight.position.set(0,-TILE_SIZE*0,0);
	pacman.add(pacmanLight);
	scene.add( pacman );
	
	
	
	 /** Draws Pacman at the given locaiton with the mouth open the specified amount. This amount
	   * can range from 0 for closed, to 0.2 for open, to 1 for the "dead animation".
	   * @param x The x-position of Pacman.ws
	   * @param y The y-position of Pacman.
	   * @param mouthOpen the amount open that the mouth is. Ranges from 0 for closed, to 0.2 for open.
	   * @param direction the direction that Pacman faces, ranging from 0 for right to 3 to bottom.
	   */
	this.drawPacman = function(x, y, mouthOpen, direction) {		
		pacmanGeometry = new THREE.SphereBufferGeometry( TILE_SIZE/4, SPHERE_QUALITY, SPHERE_QUALITY, (mouthOpen)*Math.PI, (1-mouthOpen)*Math.PI*2);
		pacman.geometry = pacmanGeometry;
		pacman.position.set( x, y, 0 );
		if (direction.x != undefined) {
			//makes sure Pacman faces the correct way.
			if (direction.x > 0) {
				pacman.rotation.set(Math.PI/2, (2)*Math.PI/2, 0);
			} else if (direction.x < 0) {
				pacman.rotation.set(Math.PI/2, (4)*Math.PI/2, 0);
			} else if (direction.y > 0) {
				pacman.rotation.set(Math.PI/2, (3)*Math.PI/2, 0);
			} else {
				pacman.rotation.set(Math.PI/2, (5)*Math.PI/2, 0);
			}
		} else {
			//makes sure Pacman faces the correct way.
			pacman.rotation.set(Math.PI/2, 0, (direction+2)*Math.PI/2);
		}
	}
	
	
	
	this.createGhost = function(ghostNumber) {
		var GHOST_RADIUS = TILE_SIZE/4;
		//Represents the whole ghost.
		var ghost = new THREE.Group();
		ghost.ghostNumber = ghostNumber;
		
		//Create the "base" of the ghost.
		var ghostBase = new THREE.Mesh( new THREE.CylinderGeometry( GHOST_RADIUS, GHOST_RADIUS, GHOST_RADIUS, SPHERE_QUALITY ),
				ghostMaterials[ghostNumber]);
		ghostBase.position.y = GHOST_RADIUS/2;
		ghost.add(ghostBase);
		
		//Create the "head" of the ghost.
		var ghostHead = new THREE.Mesh( new THREE.SphereGeometry( GHOST_RADIUS, SPHERE_QUALITY, SPHERE_QUALITY,  0, Math.PI*2, 0 ,Math.PI/2),
				ghostMaterials[ghostNumber]);
		ghostHead.rotateZ(Math.PI);
		ghost.add(ghostHead);
		
		ghost.ghostPupils = new THREE.Group();
		
		var EYE_POS = 1.2;
		var ghostLeftEye = new THREE.Mesh( new THREE.SphereGeometry( GHOST_RADIUS/3, SPHERE_QUALITY/2, SPHERE_QUALITY/2),
				whiteMaterial);
		ghostLeftEye.position.x = -GHOST_RADIUS*Math.cos(EYE_POS);
		ghostLeftEye.position.y = -1;
		ghostLeftEye.position.z = -GHOST_RADIUS*Math.sin(EYE_POS);
		ghostLeftEye.scale.y = 1.1;
		ghostLeftEye.scale.z = 0.2;
		ghost.add(ghostLeftEye);
		
		var ghostLeftPupil = new THREE.Mesh( new THREE.SphereGeometry( GHOST_RADIUS/6, 4, 4),
				blueBasicMaterial);
		ghostLeftPupil.position.x = -GHOST_RADIUS*Math.cos(EYE_POS)*1.1;
		ghostLeftPupil.position.z = -GHOST_RADIUS*Math.sin(EYE_POS)*1.1;
		ghost.ghostPupils.add(ghostLeftPupil);
		
		var ghostRightEye = new THREE.Mesh( new THREE.SphereGeometry( GHOST_RADIUS/3, SPHERE_QUALITY/2, SPHERE_QUALITY/2),
				whiteMaterial);
		ghostRightEye.position.x = GHOST_RADIUS*Math.cos(EYE_POS);
		ghostRightEye.position.y = -1;
		ghostRightEye.position.z = -GHOST_RADIUS*Math.sin(EYE_POS);
		ghostRightEye.scale.y = 1.1;
		ghostRightEye.scale.z = 0.2;
		ghost.add(ghostRightEye);
		
		var ghostRightPupil = new THREE.Mesh( new THREE.SphereGeometry( GHOST_RADIUS/6, 4, 4),
				blueBasicMaterial);
		ghostRightPupil.position.x = GHOST_RADIUS*Math.cos(EYE_POS)*1.1;
		ghostRightPupil.position.z = -GHOST_RADIUS*Math.sin(EYE_POS)*1.1;
		ghost.ghostPupils.add(ghostRightPupil);
		
		ghost.add(ghost.ghostPupils);
		
		//Create a realistic light on the ghosts to make the game look more tacky.
		var light = new THREE.PointLight( ghostMaterials[ghostNumber].color, 3, TILE_SIZE*2 );
		ghost.add(light);
		
		scene.add( ghost );
		return ghost;
	}
	
	this.removeObject = function(obj3D) {
		scene.remove(obj3D);
	}
	
	
	 /** Draws the given ghost. Creates a 3d version if it doesn't exist.
	   * @param ghost The ghost to draw.
	   */
	this.drawGhost = function(ghost) {
		if (ghost.drawingObject3D == undefined || ghost.drawingObject3D == null) {
			ghost.drawingObject3D = this.createGhost(ghost.displayType);
			//entities.push(ghost.drawingObject3D);
		} else if (ghost.displayType != ghost.drawingObject3D.ghostNumber) {
			scene.remove(ghost.drawingObject3D);
			ghost.drawingObject3D = this.createGhost(ghost.displayType);
		}
		ghost.drawingObject3D.position.set( ghost.pos.x, ghost.pos.y, 0 );
		ghost.drawingObject3D.ghostPupils.position.x = ghost.vel.x;
		ghost.drawingObject3D.ghostPupils.position.y = ghost.vel.y-1;
	}
	
	
	this.text = "";
	this.createText = function(text) {
		if (this.font == null) {
		console.log("Not loaded")
			return null;
		}
		
		var textGeometry = new THREE.TextGeometry( text, {
			font: this.font,
			size: 80,
			height: 5,
			curveSegments: 1,
			bevelEnabled: true,
			bevelThickness: 10,
			bevelSize: 8,
			bevelSegments: 3
		} );
		var textMesh = new THREE.Mesh( textGeometry, pacmanMaterial );
		var textLight = new THREE.PointLight( pacmanMaterial.color, 3, TILE_SIZE*3 );
		textLight.position.set(0,0,0);
		textMesh.scale.y = -1;
		textMesh.add(textLight);
		scene.add( textMesh );
		return textMesh;
	}
	
	this.textMesh = null;
	
	this.drawText = function(text, animationRotate, animationExit) {
		if (this.textMesh == null || this.textMesh == undefined || (this.text !== text && text !== "")) {
			this.textMesh = this.createText(text);
		} else if (text === "") {
			canvas.remove(this.textMesh);
			this.textMesh = null;
		}
		if (this.textMesh != null) {
			this.textMesh.position.z = animationExit;
			this.textMesh.rotation.set(animationExit*Math.PI/2, animationRotate*Math.PI*2, 0);
		}
		this.text = text;
	}
	
	
	
	
	var testingPacmanAnimation = 0;
	var testingGhostAnimation = 0;
	
	//The animation/draw loop.
	this.animate = function() {
		requestAnimationFrame( this.animate.bind(this) );
		
		/*
		//Testing the Pacman drawing function.
		this.drawPacman(TILE_SIZE*2.5, TILE_SIZE*2.5, Math.abs(testingPacmanAnimation), 0);
		//The animation loops from -0.2 to 0.2, using an absolute value to display correctly.
		testingPacmanAnimation += 0.02;
		if (testingPacmanAnimation > 0.2) {
			testingPacmanAnimation = -0.2;	
		}
		*/
		
		//Testing the ghost drawing function.	
		/*	
		this.drawGhost(testingGhostAnimation,TILE_SIZE*0.5,0);
		this.drawGhost(testingGhostAnimation,TILE_SIZE*1.5,1);
		this.drawGhost(testingGhostAnimation,TILE_SIZE*3.5,2);
		this.drawGhost(testingGhostAnimation,TILE_SIZE*4.5,3);
		testingGhostAnimation += 1;
		if (testingGhostAnimation > TILE_SIZE*MAP_SIZE_X) {
			testingGhostAnimation = 0;	
		}
		*/
		renderer.render( scene, camera );
	}
	this.animate();
}