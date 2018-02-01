'use strict';

function Dynorider(x, direction, margin, iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	Enemy.call(this, x, direction, margin, iddleAnimation);

	this.stats.speed = 0.5;
};

// Assign the prototype and constructor
Dynorider.prototype = Object.create(Enemy.prototype);
Dynorider.prototype.constructor = Dynorider;

// Methods
Dynorider.prototype.addSkill = function() {
	this.onFrameChange = function() {
		// if(this.isPlayerInRange && playerTileX === this.tileX && this.currentFrame % 2 === 0) {
		game.ticker.add(this.attack.bind(this));
	};
};

Dynorider.prototype.attack = function() {
		if(this.isPlayerInRange && !this._destroyed) {
			var playerTileX = Math.floor(game.player.x / game.options.tileSize);
			var direction = this.x < game.player.x ? 1 : -1;

			this.tileX = Math.floor(this.x / game.options.tileSize)
			this.x += this.stats.speed * direction;

			if(this.tileX === playerTileX) {
				// var delta = game.player.scale.x < 0 ? -1 : 1;

				game.player.damage(this.stats.damage);
				// game.player.x -= game.options.tileSize * delta;
				this.destroy();
			};
		};	
};