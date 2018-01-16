'use strict';

function Game(options) {
	PIXI.Application.call(this, options); // Call the super constructor
	this.name = 'Acid Run';
	this.options = options;
	this.size = {
		width: Math.floor(window.innerWidth / options.tileSize),
		height: Math.floor(window.innerHeight / options.tileSize),
		margin: (window.innerWidth - (options.tileSize * Math.floor(window.innerWidth / options.tileSize))) / 2
	};
	this.ticker = PIXI.ticker.shared;
	this.assets = this.loader.resources;
	this.floors = new PIXI.Container;
	this.player = new Player(this.size, this.options.tileSize);

	this.load(); // Run this on creation
}

// Assign the prototype and constructor
Game.prototype = Object.create(PIXI.Application.prototype);
Game.prototype.constructor = Game;

// Methods
Game.prototype.load = function() {
	this.loader
		.add('char_atlas', 'assets/sprites/atlas_hash.json')
		.add('enemy_gorillabird', 'assets/sprites/enemy_gorillabird_cropped.json')
		.add('enemy_flydemon', 'assets/sprites/enemy_flydemon.json')
		.add('enemy_mushdick', 'assets/sprites/enemy_mushdick.json')
		.add('tiles_atlas', 'assets/tiles/atlas_hash.json')
		.add('objects_atlas', 'assets/objects/atlas_hash.json')
		.add('crosshair', 'assets/objects/crosshair.png')
		.add('bullet', 'assets/objects/bullet.png')
		.load(function() {
			game.init(); // Call the init method once all assets have been loaded
		});
}

Game.prototype.init = function() {
	// Add the game view to the page	
	document.body.appendChild(this.view);

	// Setup pointerlock
	canvas = document.getElementsByTagName('canvas')[0];

	canvas.requestPointerLock = canvas.requestPointerLock ||
	                            canvas.mozRequestPointerLock;

	document.exitPointerLock = document.exitPointerLock ||
	                           document.mozExitPointerLock;	

	// Resize the game to fit the browser width
	this.fitToScreenWidth();

	// Fill the screen with platforms
	this.floors.y = game.screen.bottom - game.options.tileSize;
	this.stage.addChild(this.floors);
	for (var i = 0; i < this.size.height / 2 + 1; i++) {
		var floor = new Floor(this.floors.children.length);
	};

	// Add the player
	this.player.init();

	if(mobileAndTabletcheck()) {
		// TODO: Add mobile controls
	};

	// Add the debug screen - REMOVE WHEN DONE
	this.debug_text = new PIXI.Text('', {
		fontFamily: 'Courier New',
		fontSize: 16,
		fill: 0xffffff,
		align: 'right'
	});
	this.debug_text.x = game.screen.left + this.options.tileSize;
	this.debug_text.anchor.set(1, 0);
	this.stage.addChild(this.debug_text);

	// Run the update loop
	this.update(performance.now());
};

Game.prototype.fitToScreenWidth = function() {
	this.renderer.view.style.position = "absolute";
	this.renderer.view.style.display = "block";
	this.renderer.autoResize = true;
	this.renderer.resize(window.innerWidth, window.innerHeight);
};

Game.prototype.requestLock = function(e) {
  	if(e.type === 'touchend') {
  		game.player.crosshair.x = e.changedTouches[0].clientX;
  		game.player.crosshair.y = e.changedTouches[0].clientY;
  		game.player.updateCrosshairTouch();
  		game.player.shoot();  		
  	} else {
		canvas.requestPointerLock();
		if(document.pointerLockElement === canvas ||
		  document.mozPointerLockElement === canvas) {
			game.player.shoot();
		};
	};
};

Game.prototype.lockChange = function() {
  if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
    document.addEventListener("mousemove", game.player.updateCrosshair, false);
	game.ticker.start();
  } else {
    document.removeEventListener("mousemove", game.player.updateCrosshair, false);
    
    for(var key in game.player.keys) {
		game.player.keys[key] = false;
	};

    game.ticker.stop();
  }
};

Game.prototype.update = function(time) {
	this.ticker.update(time);
	this.player.update();
	this.render();
};

Game.prototype.render = function() {
	this.renderer.render(this.stage);

	// Update the debug screen - REMOVE WHEN DONE
	if(this.player && this.debug_text) {		
		this.debug_text.text = `
			------DEBUG------
			__ PLAYER DATA __
			\n\n
			Floor: ${this.player.floor.current}
			\n
			[STATES]
			Jumping: ${this.player.state.jumping}
			Falling: ${this.player.state.falling}
			\n
			[COLLISIONS]
			Top: ${this.player.collision.top}
			Bottom: ${this.player.collision.bottom}
			Left: ${this.player.collision.left}
			Right: ${this.player.collision.right}
		`;	
	};
};