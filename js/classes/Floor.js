'use strict';

function Floor(n) {
	PIXI.Container.call(this); // Call the super constructor
	this.n = n || 0;
	this.hole = {
		position: this.n > 0 ? Math.floor(Math.random() * (game.size.width - 3)) + 1 : null,
		door: null
	}; // TODO: Create a hole class (Either that or just a door class)
	this.texture = this.n > 0 ? 'Tile_005' : 'Tile_002';

	this.init(); // Run this on creation
};

// Assign the prototype and constructor
Floor.prototype = Object.create(PIXI.Container.prototype);
Floor.prototype.constructor = Floor;

// Methods
Floor.prototype.init = function() {
	// Check if the hole position is viable
	// this.checkHole();
	// Fill the floor with tiles
	this.fillFloor();
	// Setup the initial class properties
	this.setup();

	// Add the floor to the floors container
	game.floors.addChild(this);
};

Floor.prototype.checkHole = function() {
	// If the current hole position is right above the previous floor's hole then reposition it
	while (this.hole.position && this.hole.position === game.floors.children[this.n - 1].hole) {
		this.hole.position = Math.floor(Math.random() * (game.size.width - 3)) + 1;
	};
};

Floor.prototype.fillFloor = function() {
	// Fill the floor with tiles till it cover the game width
	for (var i = 0; i < game.size.width; i++) {
		// Add a tile unless it's the hole positions in which case add a door on top of the hole
		if (i !== this.hole.position) {
			this.addTile(i * game.options.tileSize);
		} else {
			this.addDoor();
		};
	};	
};

Floor.prototype.setup = function() {
	// Setup the initial class properties
	this.y = -this.n * game.options.tileSize * 2;
	this.uid = this.n;	
};

Floor.prototype.addTile = function(x) {
	// Create the tile
	var tile = new PIXI.Sprite(
		game.assets['tiles_atlas'].textures[this.texture]
	); // TODO: Create Tile class

	// Setup the initial tile properties
	tile.x = x + (tile.width / 2 * game.options.ratio) + game.size.margin;
	tile.y = (tile.height / 2 * game.options.ratio);
	tile.scale.set(game.options.ratio);
	tile.anchor.set(.5);

	// Add the tile to the floor
	this.addChild(tile);
};

Floor.prototype.addDoor = function() {
	this.hole.door = new PIXI.Sprite(
		game.assets['objects_atlas'].textures['Box_001']
	); // TODO: Create a Door class (Either that or just a hole class - It would most likely be door as it's has a sprite)

	// Setup the initial door properties
	this.hole.door.x = (this.hole.position * game.options.tileSize) + (this.hole.door.width / 1.325 * game.options.ratio);
	this.hole.door.y = this.y + (this.hole.door.width / 2 * game.options.ratio);
	this.hole.door.scale.set(game.options.ratio);
	this.hole.door.anchor.set(.5);	

	// Add the door to the floor
	this.addChild(this.hole.door);
};