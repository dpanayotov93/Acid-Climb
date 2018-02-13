'use strict';

function Enemy(x, direction, margin, iddleAnimation, floor) {
	// Extend the PIXI.extras.AnimatedSprite class
	PIXI.extras.AnimatedSprite.call(this, iddleAnimation);

	this.tileX = x;
	this.direction = direction;
	this.floor = floor;
	this.margin = margin * game.options.ratio;
	this.animations = {
		iddle: iddleAnimation
	};
	this.collision = {};
	this.stats = {
		health: 100,
		damage: 10,
		speed: 20,
		gravity: 10,
		fireRate: 30
	};
	this.isPlayerInRange = false;
	this.healthbar = new PIXI.Graphics();

	this.init();
	this.addSkill();
};

// Assign the prototype and constructor
Enemy.prototype = Object.create(PIXI.extras.AnimatedSprite.prototype);
Enemy.prototype.constructor = Enemy;

// Methods
Enemy.prototype.init = function() {
	var enemyHalfHeight = this.height / 2 * game.options.ratio;
	var enemyMargin = this.margin * game.options.ratio;

	this.x = (this.tileX * game.options.tileSize) + game.options.tileSize / 2 + game.size.margin;
	this.y = (enemyHalfHeight + enemyMargin) * game.options.ratio;
	
	this.scale.set(this.direction * game.options.ratio, game.options.ratio);
	this.anchor.set(0.5 * game.options.ratio);
	this.animationSpeed = .15;
	this.play();

	this.addHealthbar();

	return this;
};

Enemy.prototype.updater = function() {
	this.healthbar.scale.x = this.stats.health / 100;
	if(this.stats.health <= 0) {
		this.destroy();
		return;
	};	

	this.isPlayerInRange = this.getPlayerInRange();
};

Enemy.prototype.addHealthbar = function() {	
	this.healthbar.beginFill(0xFF0000);
	this.healthbar.lineStyle(1, 0xFFFF00);
	this.healthbar.drawRect(-this.width / 2, -this.height / 2 - 50, this.width, 10);

	this.addChild(this.healthbar);	
};

Enemy.prototype.damage = function(value) {	
	this.stats.health -= value;
};

Enemy.prototype.getPlayerInRange = function() {
	var dist = Math.abs(this.getGlobalPosition().y - game.player.getGlobalPosition().y);
	var floor = this.parent.parent;
	var inRangeX = dist < game.options.tileSize;
	var inRangeY = Math.abs(game.player.getGlobalPosition().y - floor.getGlobalPosition().y) > game.options.tileSize / 1.35;

	if(inRangeX && inRangeY) {
		return true;
	};

	return false;
};