'use strict';

function Factory(type) {
	this.TYPES = {ENEMY: 'ENEMY', ITEM: 'ITEM'};
	this.margins = [10, -50, -5, 0];
	this.enemies = ['gorillabird', 'flydemon', 'dynorider', 'dynorider2'];
	this.classes = {
		'gorillabird': Gorillabird, 
		'flydemon': Flydemon, 
		'dynorider': Dynorider,
		'dynorider2': Dynorider2
	};
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
	// var enemyTypeId = rnd(0, this.enemies.length -1 );
	var enemyTypeId = 1;
	var enemyType = this.enemies[enemyTypeId];
	var enemyClass = this.classes[enemyType];
	var margin = this.margins[enemyTypeId];
	var frames = Object.keys(game.assets[enemyType].textures);
	var animations = [];

	// Push the extracted frames to the iddle animations container
	for (var i = 0; i < Object.keys(frames).length; i++) {
		animations.push(PIXI.Texture.fromFrame(frames[i]));
	};	

	return new enemyClass(x, direction, margin, animations);
};

Factory.prototype.spawnItem = function() {
	console.log('Spawning Item');	
};
