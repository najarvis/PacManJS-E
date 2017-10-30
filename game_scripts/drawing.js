
 /** A class which handles the drawing of everything.
   * @param canvas The canvas to draw to.
   */
function drawing(canvas) {
	
	var scene = new THREE.Scene();
	//From https://stackoverflow.com/questions/41786413/render-three-js-scene-in-html5-canvas
	var renderer = new THREE.WebGLRenderer( { canvas: canvas } );
	//renderer.setSize( window.innerWidth, window.innerHeight );
	
	
	//All of the "colors" are stored here.
	var blueBasicMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff} );
	var blueMaterial = new THREE.MeshStandardMaterial( { color: 0x0000ff} );
	var wallMaterial = new THREE.MeshStandardMaterial( { color: 0x6666ff } );
	var pelletMaterial = new THREE.MeshStandardMaterial( { color: 0xffff00 } );
	var pacmanMaterial = new THREE.MeshStandardMaterial( { color: 0xcccc00 } );
	
	
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
    var pellets = [];
	
	
	var cube;
	
	 /** Draws a cube with the given size.
	   * @param size the size of the cube.
	   */
	this.drawDebugCube = function(size) {		
		var geometry = new THREE.BoxGeometry( size, size, size );
		cube = new THREE.Mesh( geometry, blueMaterial );
		scene.add( cube );
	}
	
	this.drawDebugCube(1);
	
	
	 /** Draws a tile.
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
	
	
	
	 /** Draws a pellet.
	   * @param pellet the pellet to draw.
	   */
    this.drawPellet = function(pellet) {
        if (pellet.type == "default") {
			createPelletSphere(pellet.pos.x, pellet.pos.y, PELLET_SIZE);
        }
        else {
            createPelletSphere(pellet.pos.x, pellet.pos.y, PELLET_SIZE*1.5);
        }
	
		//Creates the actual sphere.
		function createPelletSphere(x, y, size) {
			//Creates a shpere with a given size and a "fidelity" of 5 and 4 for the width and height.
			var geometry = new THREE.SphereGeometry( size, 5, 4 );
			var mesh = new THREE.Mesh( geometry, pelletMaterial );
			mesh.position.set( x, y, 0 );
			pellets.push(mesh);
			scene.add( mesh );
		}
    }
	
	//Holds the "mesh" object that represents Pacman.
	var pacman = null;
	
	 /** Draws Pacman at the given locaiton with the mouth open the specified amount. This amount
	   * can range from 0 for closed, to 0.2 for open, to 1 for the "dead animation".
	   * @param x The x-position of Pacman.
	   * @param y The y-position of Pacman.
	   * @param mouthOpen the amount open that the mouth is. Ranges from 0 for closed, to 0.2 for open.
	   * @param direction the direction that Pacman faces, ranging from 0 for right to 3 to bottom.
	   */
	this.drawPacman = function(x, y, mouthOpen, direction) {
		if (pacman != null) {
			scene.remove(pacman);
		}
		
		var geometry = new THREE.SphereGeometry( TILE_SIZE/4, 16, 16, (mouthOpen)*Math.PI, (1-mouthOpen)*Math.PI*2);
		pacman = new THREE.Mesh( geometry, pacmanMaterial );
		pacman.position.set( x, y, 0 );
		//makes sure Pacman faces the correct way.
		pacman.rotateX(Math.PI/2);
		pacman.rotateZ((direction+2)*Math.PI/2);
		scene.add( pacman );
	}
	
	
	var testingPacmanAnimation = 0;
	
	//The animation/draw loop.
	this.animate = function() {
		requestAnimationFrame( this.animate.bind(this) );
		
		
		//Testing the Pacman drawing function.
		this.drawPacman(TILE_SIZE*2.5, TILE_SIZE*2.5, Math.abs(testingPacmanAnimation), 0);
		//The animation loops from -0.2 to 0.2, using an absolute value to display correctly.
		testingPacmanAnimation += 0.02;
		if (testingPacmanAnimation > 0.2) {
			testingPacmanAnimation = -0.2;	
		}
		
		
		//Loop through all the tiles and rotate them
		tiles.forEach(function(item, index, array) {
			//item.rotation.y += 0.01;
		});
		
		//If the debug cube exists, rotate it.
		if (cube != undefined) {
			cube.rotation.y += 0.01;
		}
		renderer.render( scene, camera );
	}
	this.animate();
	
	/*
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
	*/
}