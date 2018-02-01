'use strict';

function Gorillabird(x, direction, margin, iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	Enemy.call(this, x, direction, margin, iddleAnimation);
};

// Assign the prototype and constructor
Gorillabird.prototype = Object.create(Enemy.prototype);
Gorillabird.prototype.constructor = Gorillabird;

// Methods