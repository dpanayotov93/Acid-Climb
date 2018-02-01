'use strict';

function Flydemon(x, direction, margin, iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	Enemy.call(this, x, direction, margin, iddleAnimation);

	this.fireballs = [];
};

// Assign the prototype and constructor
Flydemon.prototype = Object.create(Enemy.prototype);
Flydemon.prototype.constructor = Flydemon;

// Methods
Flydemon.prototype.addSkill = function() {
	this.onFrameChange = function() {
		if(this.isPlayerInRange && this.currentFrame === 5) {
			this.attack();				
		};
	};

	game.ticker.add(this.updateFireballs.bind(this));
};

Flydemon.prototype.attack = function() {
	var fireball = new PIXI.Sprite(
		game.assets.fireball.texture
	);

	fireball.x = this.x;
	fireball.y = this.y + this.height * 1.5;
	fireball.anchor.set(0.5);
	fireball.scale.set(game.options.ratio);

	this.fireballs.push(fireball);			
	game.stage.addChild(fireball);			
};

Flydemon.prototype.updateFireballs = function() {
	if(this.fireballs.length > 0) {
		for(var i = this.fireballs.length - 1; i >= 0; i--) {
			var fireball = this.fireballs[i];
			var isFireballInPlayerRange = Math.abs(fireball.getGlobalPosition().x - game.player.getGlobalPosition().x) < game.player.width / 2;

			if (fireball.x > game.screen.width || fireball.x < 0 || isFireballInPlayerRange) {
				if(isFireballInPlayerRange) {
					game.player.damage(this.stats.damage);
				};	

				fireball.destroy();
				this.fireballs.splice(i, 1);

			} else {
				fireball.x += 15 * -this.direction;
				fireball.rotation += 1;
			};
		};
	};
};