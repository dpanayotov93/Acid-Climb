'use strict';

function Factory(type) {
	this.TYPES = {ENEMY: 'ENEMY', ITEM: 'ITEM'};
	this.type = type;
};

Factory.prototype.spawn = function() {
	var args = arguments[0];
	
	if(this.type === this.TYPES.ENEMY) {
		return this.spawnEnemy(args.x);
	};

	if(this.type === this.TYPES.ITEM) {
		this.spawnItem();
	};	
};

Factory.prototype.spawnEnemy = function(x) {
	console.log('Spawning Enemy at X', x);
	// var enemy = new Enemy(x);
	// return enemy;
};

Factory.prototype.spawnItem = function() {
	console.log('Spawning Item');	
};