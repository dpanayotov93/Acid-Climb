'use strict';

function Gorillabird(x, direction, margin, iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	Enemy.call(this, x, direction, margin, iddleAnimation);

	this.addSkill();
}
;
// Assign the prototype and constructor
Gorillabird.prototype = Object.create(Enemy.prototype);
Gorillabird.prototype.constructor = Gorillabird;

// Methods
Gorillabird.prototype.addSkill = function() {
	this.onLoop = function() {
		if(this.isPlayerInRange) {
			this.attack();				
		};
	};

	this.onFrameChange = function() {
		var playerTileX = Math.floor(game.player.x / game.options.tileSize);
		if(this.isPlayerInRange && playerTileX === this.tileX && this.currentFrame % 2 === 0) {
			game.player.damage(this.stats.damage);
			console.log(game.player.stats.health);
		};	
	};
};

Gorillabird.prototype.attack = function() {
	var holeID = this.parent.parent.hole.position;
	var newTileID = rnd(0, game.size.width - 1);

	while(newTileID === holeID) {
		newTileID = rnd(0, game.size.width - 1);
	};

	this.tileX = newTileID;
	this.x = (this.tileX * game.options.tileSize) + game.options.tileSize / 2 + game.size.margin;
	this.direction = this.tileX > holeID ? 1 : -1;
	this.scale.set(game.options.ratio  * this.direction, game.options.ratio);
};