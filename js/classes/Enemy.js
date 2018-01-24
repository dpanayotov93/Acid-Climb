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

	this.init();
};

// Assign the prototype and constructor
Enemy.prototype = Object.create(PIXI.extras.AnimatedSprite.prototype);
Enemy.prototype.constructor = Enemy;

// Methods
Enemy.prototype.init = function() {
	this.x = (this.tileX * game.options.tileSize) + game.options.tileSize / 2 + game.size.margin;
	// this.y -= game.options.tileSize - (this.height / 2 * game.options.ratio) + game.size.margin;
	this.y += this.margin * game.options.ratio;
	this.scale.set(game.options.ratio  * this.direction, game.options.ratio);
	this.anchor.set(0.5 * game.options.ratio);
	this.animationSpeed = .15;
	this.play();

	return this;
};