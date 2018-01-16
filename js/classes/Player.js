'use strict';

function Player(options) {
	this.options = options;
	this.animations = {
		iddle: []
	};
	this.keys = {};
	this.collision = {};
	this.floor = {
		current: 0,
		max: 0
	};
	this.stats = {
		speed: 20
	};
	this.state = {
		jumping: false,
		falling: false
	};
	this.jumpData = {
		origin: null,
		target: null,
		height: 250
	};
};

// Assign the prototype and constructor
Player.prototype = Object.create(PIXI.extras.AnimatedSprite.prototype);
Player.prototype.constructor = Player;

// Methods
Player.prototype.init = function() {
	// Extract the frames for the different animations and create them
	this.createAnimations();

	// Setup the initial class properties
	this.setup();

	// Setup the class events
	this.addEvents();

	// Add the player to the stage
	game.stage.addChild(this);
};

Player.prototype.createAnimations = function() {
	// Extract the iddle frames from the atlas
	var iddleFrames = Object.keys(game.assets['char_atlas'].textures).filter(function(key) {
		return key.includes('Walk_001') || key.includes('Walk_002')
	});

	// Push the extracted frames to the iddle animations container
	for (let i = 0; i < Object.keys(iddleFrames).length; i++) {
		this.animations.iddle.push(PIXI.Texture.fromFrame(iddleFrames[i]));
	};
};

Player.prototype.setup = function() {
	// Call the constructor of the AnimatedSprite class
	PIXI.extras.AnimatedSprite.call(this, this.animations.iddle);

	// Set the initial class properties
	this.x += (game.size.width / 2 * game.options.tileSize) + (this.width / 2 * game.options.ratio) + game.size.margin / 2;
	this.y = game.renderer.screen.bottom - game.options.tileSize - (this.height / 2 * game.options.ratio);
	this.scale.set(game.options.ratio);
	this.anchor.set(.5);
	this.animationSpeed = .15;
	this.jumpData.height = game.options.tileSize * 2.25;
	this.play();
};

Player.prototype.addEvents = function() {
	document.addEventListener('keydown', this.onKeyDown.bind(this));
	document.addEventListener('keyup', this.onKeyUp.bind(this));
};

Player.prototype.onKeyUp = function(e) {
	// Unregister the key
	this.keys[e.code] = false;
};

Player.prototype.onKeyDown = function(e) {
	// Register the key
	this.keys[e.code] = true;
};

Player.prototype.update = function() {
	// Check the collisions
	this.collision = this.detectCollision();

	if (this.collision.top) {		
		this.state.jumping = false;
	};

	if (this.collision.bottom) {
		this.state.falling = false;
	};

	this.applyGravity();
	this.checkKeys();
};

Player.prototype.checkKeys = function() {
	// Jumping
	if (this.keys['ArrowUp']) {
		this.jump();
	};

	// Movement
	if (this.keys['ArrowLeft'] || this.keys['ArrowRight']) {
		if (this.keys['ArrowLeft']) {
			this.scale.x = -1 * game.options.ratio;
		};
		if (this.keys['ArrowRight']) {
			this.scale.x = 1 * game.options.ratio;
		};

		this.move(this.scale.x);
	};
};

Player.prototype.move = function(direction) {
	if (direction > 0 && !this.collision.right) {
		this.x += this.stats.speed * game.options.ratio;
	} else if(direction < 0 && !this.collision.left) {
		this.x -= this.stats.speed * game.options.ratio;
	};
};

Player.prototype.jump = function() {
	if (!this.collision.top && !this.state.falling) {
		this.state.jumping = true;
		this.jumpData.target = this.y - this.jumpData.height;
		while(this.y > this.jumpData.target) {
			this.collision = this.detectCollision();

			if(this.collision.top) {
				break;
			};

			this.y -= this.stats.speed / 2 * game.options.ratio;
		};
		this.state.jumping = false;
	};
};

Player.prototype.applyGravity = function() {
	if (!this.state.jumping && !this.collision.bottom) {
		this.state.falling = true;

		// this.collision = this.detectCollision();
		this.y += this.stats.speed * 2 * game.options.ratio;
	};
};

Player.prototype.detectCollision = function() {
	var collision = {
		top: false,
		bottom: false,
		left: false,
		right: false
	};
	var floorID = this.floor.current;

	for (var i = 0; i < game.floors.children.length; i++) {
		var floor = game.floors.children[i];

		for (var j = 0; j < floor.children.length; j++) {
			var tile = floor.children[j];
			tile.tint = 0xFFFFFF;

			if (this.intersect(tile)) {
				tile.tint = 0xFFF;

				if(this.y < tile.getGlobalPosition().y + tile.height / 2 && 
					this.y > tile.getGlobalPosition().y - tile.height / 2
				) {
					if(this.x + this.width / 2 > tile.getGlobalPosition().x + this.width / 2) {
						collision.left = true;
					};

					if(this.x - this.width / 2 < tile.getGlobalPosition().x - this.width / 2) {
						collision.right = true;
					};

				} else {
					if (tile.getGlobalPosition().y - tile.height / 2 < this.y) {
						collision.top = true;
					} else if (tile.getGlobalPosition().y + tile.height / 2 > this.y) {
						collision.bottom = true;
					};
				};
			};
		};
	};

	return collision;
};

Player.prototype.intersect = function(sprite) {
	var ab = this.getBounds();
	var bb = sprite.getBounds();

	if (ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + 5 + ab.height > bb.y && ab.y < bb.y + bb.height) { // TODO: Fix the godddamn constant
		return true;
	} else {
		return false;
	};
}