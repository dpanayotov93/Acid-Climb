'use strict';

function Flydemon(x, direction, margin, iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	Enemy.call(this, x, direction, margin, iddleAnimation);
};

// Assign the prototype and constructor
Flydemon.prototype = Object.create(Enemy.prototype);
Flydemon.prototype.constructor = Flydemon;

// Methods
Flydemon.prototype.addSkill = function() {
	this.onLoop = function() {
		if(this.isPlayerInRange) {
			this.attack();				
		};
	};
};

Flydemon.prototype.attack = function() {
	var fireball = new PIXI.Sprite(
		game.assets.fireball.texture
	);

	fireball.x = this.x - 100 * this.direction;
	fireball.y = this.y + this.height;
	fireball.scale.set(game.options.ratio);

	game.stage.addChild(fireball);			
};