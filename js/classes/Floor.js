'use strict';

function Floor(n) {
	// Extend the PIXI.Container class
	PIXI.Container.call(this); 
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
	// Check if the hole position is viable - Not sure if I want this functionallity or not gameplay wise
	// TODO: Decide if the game should work like this
	// this.checkHole();

	// Fill the floor with tiles
	this.fillFloor();
	
	// Position the current floor two tile spaces above the previous flor / the ground
	this.y = -this.n * game.options.tileSize * 2;

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
		// Add a tile unless it's the hole positions in which case add a door on top of that hole
		if (i !== this.hole.position) {
			this.addTile(i * game.options.tileSize);
		} else if(this.n > 1) {
			this.addDoor();
		};
	};	
};

Floor.prototype.addTile = function(x) {
	// Create the tile
	var tile = new PIXI.Sprite(
		game.assets['tiles_atlas'].textures[this.texture]
	); // TODO: Create Tile class

	tile.x = x + (tile.width / 2 * game.options.ratio) + game.size.margin;
	tile.scale.set(game.options.ratio);
	tile.anchor.set(.5);

	// Add the tile to the floor
	this.addChild(tile);
};

Floor.prototype.addDoor = function() {
	this.hole.door = new PIXI.Sprite(
		game.assets['objects_atlas'].textures['Box_001']
	); // TODO: Create a Door class (Either that or just a hole class - It would most likely be door as it's has a sprite)

	this.hole.door.x = (this.hole.position * game.options.tileSize) + (this.hole.door.width / 1.325 * game.options.ratio);
	this.hole.door.scale.set(game.options.ratio);
	this.hole.door.anchor.set(.5);	

	// Add the door to the floor
	this.addChild(this.hole.door);
};