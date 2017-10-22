
 /** A class which handles the drawing of everything.
   * @param canvas The canvas to draw to.
   */

var drawingThing = new drawing(document.getElementById("canvas3d"));
drawingThing.drawDebugCube(3);


function drawing(canvas) {
	
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 1000 );
	//From https://stackoverflow.com/questions/41786413/render-three-js-scene-in-html5-canvas
	var renderer = new THREE.WebGLRenderer( { canvas: canvas } );
	//renderer.setSize( window.innerWidth, window.innerHeight );
	
	
	//All of the "colors" are stored here.
	var blueBasicMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff} );
	var blueMaterial = new THREE.MeshStandardMaterial( { color: 0x0000ff} );
	var wallMaterial = new THREE.MeshStandardMaterial( { color: 0x6666ff } );
	
	
	//The camera is 5 units away from the thing.
	camera.position.z = 5;
	var light = new THREE.PointLight( 0xffffff, 1, 100 );
	light.position.set( 0, 0, 5 );
	scene.add( light );

	
    this.tiles = [];
	
	
	var cube;
	 /** Draws a cube with the given size.
	   * @param size the size of the cube.
	   */
	this.drawDebugCube = function(size) {		
		var geometry = new THREE.BoxGeometry( size, size, size );
		cube = new THREE.Mesh( geometry, blueMaterial );
		scene.add( cube );
	}
	
	
	
	 /** Draws a tile.
	   * @param tile the tile to draw.
	   */
    this.drawTile = function(tile) {
        createWallRect(tile.position.x,                 tile.position.y,                 tile.size, tile.size); // Top left rect
        createWallRect(tile.position.x + tile.size * 2, tile.position.y,                 tile.size, tile.size); // Top right rect
        createWallRect(tile.position.x,                 tile.position.y + tile.size * 2, tile.size, tile.size); // Bottom left rect
        createWallRect(tile.position.x + tile.size * 2, tile.position.y + tile.size * 2, tile.size, tile.size); // Bottom right rect
        
        if (!tile.top_empty) {
            createWallRect(tile.position.x + tile.size,     tile.position.y,                 tile.size, tile.size); // Top rect
        }   
        if (!tile.right_empty) {
            createWallRect(tile.position.x + tile.size * 2, tile.position.y + tile.size,     tile.size, tile.size); // Right rect
        }   
        if (!tile.bottom_empty) {
            createWallRect(tile.position.x + tile.size,     tile.position.y + tile.size * 2, tile.size, tile.size); // Bottom rect
        }   
        if (!tile.left_empty) {
            createWallRect(tile.position.x,                 tile.position.y + tile.size,     tile.size, tile.size); // Left rect
        }
    }
	
	 /** Draws a tile.
	   * @param tile the tile to draw.
	   */
	function createWallRect(x, y, xSize, ySize) {
		var geometry = new THREE.BoxGeometry( xSize, ySize, xSize );
		cube = new THREE.Mesh( geometry, wallMaterial );
		cube.position.set( x+xSize/2, y+ySize/2, 0 );
		scene.add( cube );
	}
	
	function animate() {
		requestAnimationFrame( animate );
		if (cube != undefined) {
			cube.rotation.y += 0.01;
		}
		renderer.render( scene, camera );
	}
	animate();
	
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