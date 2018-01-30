'use strict';

function Factory(type) {
	this.TYPES = {ENEMY: 'ENEMY', ITEM: 'ITEM'};
	this.enemies = ['gorillabird', 'flydemon', 'dynorider', 'dynorider2'];
	this.margins = [10, -50, -5, 0];
	this.type = type;
};

Factory.prototype.spawn = function() {
	var args = arguments[0];
	
	if(this.type === this.TYPES.ENEMY) {
		return this.spawnEnemy(args.x, args.direction);
	};

	if(this.type === this.TYPES.ITEM) {
		this.spawnItem();
	};	
};

Factory.prototype.spawnEnemy = function(x, direction) {
	var enemyTypeId = rnd(0, this.enemies.length -1 );
	var enemyType = this.enemies[enemyTypeId];
	var margin = this.margins[enemyTypeId];
	var frames = Object.keys(game.assets[enemyType].textures);
	var animations = [];

	// Push the extracted frames to the iddle animations container
	for (var i = 0; i < Object.keys(frames).length; i++) {
		animations.push(PIXI.Texture.fromFrame(frames[i]));
	};	

	return new Enemy(x, direction, margin, animations);
};

Factory.prototype.spawnItem = function() {
	console.log('Spawning Item');	
};
