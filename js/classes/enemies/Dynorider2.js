'use strict';

function Dynorider2(x, direction, margin, iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	Enemy.call(this, x, direction, margin, iddleAnimation);
};

// Assign the prototype and constructor
Dynorider2.prototype = Object.create(Enemy.prototype);
Dynorider2.prototype.constructor = Dynorider2;

// Methods