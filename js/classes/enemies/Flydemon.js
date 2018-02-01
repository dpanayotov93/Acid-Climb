'use strict';

function Flydemon(x, direction, margin, iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	Enemy.call(this, x, direction, margin, iddleAnimation);
};

// Assign the prototype and constructor
Flydemon.prototype = Object.create(Enemy.prototype);
Flydemon.prototype.constructor = Flydemon;

// Methods
Flydemon.prototype.attack = function() {

};