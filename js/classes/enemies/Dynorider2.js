'use strict';

function Dynorider2(x, direction, margin, iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	Enemy.call(this, x, direction, margin, iddleAnimation);
};

// Assign the prototype and constructor
Dynorider2.prototype = Object.create(Enemy.prototype);
Dynorider2.prototype.constructor = Dynorider2;

// Methods
Dynorider2.prototype.addSkill = function() {
	this.onLoop = function() {
		if(this.isPlayerInRange) {
			this.attack();				
		};
	};

	game.ticker.add(this.updateLaser.bind(this));
};

Dynorider2.prototype.attack = function() {
	var laser = new PIXI.Graphics();
	laser.type = 'laser';
	laser.beginFill(0xFFFF00);
	laser.drawRect(-this.width / 2, this.height / 2 - 5, this.width, 5);

	this.addChild(laser);		
};

Dynorider2.prototype.updateLaser = function() {
	var lasers = this.children.filter(function(item) {
		return item.type === 'laser';
	});

	if(lasers.length > 0) {
		for(var i = lasers.length - 1; i >= 0; i--) {
			var laser = lasers[i];
			var isLaserInPlayerRangeX = Math.abs(laser.getGlobalPosition().x - game.player.getGlobalPosition().x) < game.player.width / 2;
			var isLaserInPlayerRangeY = Math.abs(laser.getGlobalPosition().y - game.player.getGlobalPosition().y) < game.player.width / 2;

			if(laser.getGlobalPosition().x > game.screen.width || laser.getGlobalPosition().x < 0 || (isLaserInPlayerRangeX && isLaserInPlayerRangeY)) {
				if(isLaserInPlayerRangeX && isLaserInPlayerRangeY) {
					game.player.damage(this.stats.damage);
				};	

				laser.destroy();
			} else {
				laser.x -= 20;
			};			
		};
	};
};