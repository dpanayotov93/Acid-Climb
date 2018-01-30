'use strict';

function Enemy(x, direction, margin, iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	PIXI.extras.AnimatedSprite.call(this, iddleAnimation);

	this.tileX = x;
	this.direction = direction;
	this.margin = margin;
	this.animations = {
		iddle: iddleAnimation
	};
	this.collision = {};
	this.stats = {
		health: 100,
		damage: 10,
		speed: 20,
		gravity: 10,
		fireRate: 30
	};

	this.init();
};

// Assign the prototype and constructor
Enemy.prototype = Object.create(PIXI.extras.AnimatedSprite.prototype);
Enemy.prototype.constructor = Enemy;

// Methods
Enemy.prototype.init = function() {
	this.x = (this.tileX * game.options.tileSize) + game.options.tileSize / 2 + game.size.margin;
	// this.y -= game.options.tileSize - (this.height / 2 * game.options.ratio) + game.size.margin;
	if(game.options.ratio === 1) {
		this.y += (this.margin * game.options.ratio) - (this.height / 2) / game.options.ratio; // TODO: FIX THIS WTF
	} else {
		this.y += (this.margin * game.options.ratio) - (this.height / 2) / game.options.ratio / 1.55; // TODO: FIX THIS WTF
	};

	this.scale.set(game.options.ratio  * this.direction, game.options.ratio);
	this.anchor.set(0.5 * game.options.ratio);//0.25 * game.options.ratio);
	this.animationSpeed = .15;
	this.play();

	return this;
};

Enemy.prototype.updater = function() {
	
};