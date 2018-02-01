'use strict';

function Dynorider(x, direction, margin, iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	Enemy.call(this, x, direction, margin, iddleAnimation);
};

// Assign the prototype and constructor
Dynorider.prototype = Object.create(Enemy.prototype);
Dynorider.prototype.constructor = Dynorider;

// Methods