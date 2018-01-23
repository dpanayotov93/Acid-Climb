'use strict';

function Game(options) {
	// Extend the PIXI.Application class
	PIXI.Application.call(this, options);

	// Properties
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
	this.cursor = new PIXI.Sprite();
	this.background = null;
	this.player = null;

	this.load(); // Run this on creation
}

// Assign the prototype and constructor to the class
Game.prototype = Object.create(PIXI.Application.prototype);
Game.prototype.constructor = Game;

// Methods
Game.prototype.load = function() {
	this.loader
		.add('background', 'assets/backgrounds/hull_pattern.jpg')
		.add('char_atlas', 'assets/sprites/atlas_hash.json')
		.add('gorillabird', 'assets/sprites/enemies/gorillabird.json')
		.add('flydemon', 'assets/sprites/enemies/flydemon.json')
		.add('mushdick', 'assets/sprites/enemies/mushdick.json')
		.add('tiles_atlas', 'assets/tiles/atlas_hash.json')
		.add('objects_atlas', 'assets/objects/atlas_hash.json')
		.add('beam', 'assets/objects/portal_beam.png')
		.add('crosshair', 'assets/objects/crosshair.png')
		.add('bullet', 'assets/objects/bullet.png')
		.load(function() {
			game.init(); // Call the init method once all assets have been loaded
		});
}

Game.prototype.init = function() {
	// Add the game view to the page	
	document.body.appendChild(this.view);

	// Add the background
	this.addBackground();

	// Make the stage interactive
	this.addEvents();

	// Resize the game to fit the browser width
	this.fitToScreenWidth();

	// Initialize the enemy factory
	this.enemyFactory = new Factory('ENEMY');

	// Fill the screen with platforms
	this.floors.y = game.screen.bottom - game.options.tileSize / 2;
	this.stage.addChild(this.floors);

	for (var i = 0; i < (this.size.height / 2 + 1); i++) {
		var count = this.floors.children.length;
		var floor = new Floor(count);
	};

	// Add the player
	this.player = new Player(this.getInitialPlayerAnimations());

	// Show the controls on touch devices
	if (mobileAndTabletcheck()) {
		document.getElementById('mobile-controls').style.display = 'block';
	};

	// Add the cursor on top of everything
	this.stage.addChild(this.cursor);

	// Run the update loop
	this.update(performance.now());
};

Game.prototype.addBackground = function() {
	this.background = new PIXI.extras.TilingSprite(
		game.assets['background'].texture,
		window.innerWidth,
		window.innerHeight,
	);

	this.stage.addChild(this.background);
};

Game.prototype.addEvents = function() {
	this.stage.interactive = true;

	this.cursor.anchor.set(0.5);
	this.cursor.scale.set(0.125 * this.options.ratio);

	this.renderer.plugins.interaction.cursorStyles["crosshair_blue"] = function(mode) {
		game.cursor.texture = game.assets['crosshair'].texture;
	};
	this.renderer.plugins.interaction.on("pointerover", () => {
	    //mouse is now on stage
	    game.cursor.visible = true;
	});
	this.renderer.plugins.interaction.on("pointerout", () => {
	    //mouse left stage
	    game.cursor.visible = false;
	});
	this.renderer.plugins.interaction.on("pointermove", (event) => {
	    //update cursor position on each move
	    game.cursor.x = event.data.global.x;
	    game.cursor.y = event.data.global.y + game.stage.pivot.y;
	});

	this.stage.cursor = 'crosshair_blue';
	this.stage.on('pointerdown', function(e) {
		var mouse = e.data.global;
		mouse.y += game.stage.pivot.y;
		game.player.shoot(mouse);
	});	
};

Game.prototype.getInitialPlayerAnimations = function() {
	// Extract the iddle frames from the atlas
	var animations = [];
	var iddleFrames = Object.keys(game.assets['char_atlas'].textures)
		.filter(function(key) {
			return key.includes('Walk_001') || key.includes('Walk_002') || key.includes('Walk_003')
		});
	console.log(iddleFrames)

	// Push the extracted frames to the iddle animations container
	for (var i = 0; i < Object.keys(iddleFrames).length; i++) {
		animations.push(PIXI.Texture.fromFrame(iddleFrames[i]));
	};

	return animations;
};

Game.prototype.fitToScreenWidth = function() {
	this.renderer.view.style.position = "absolute";
	this.renderer.view.style.display = "block";
	this.renderer.autoResize = true;
	this.renderer.resize(window.innerWidth, window.innerHeight);
};

Game.prototype.update = function(time) {
	this.ticker.update(time);
	this.player.update();
	this.render();
};

Game.prototype.updateCamera = function() {
	var startDelta = Math.floor((game.floors.y - (game.options.tileSize / 2 + game.player.height / 2)) / 2);

	if(this.player.y < this.screen.bottom - this.stage.height / 2) {
		this.stage.pivot.y = this.player.y - startDelta;
		this.background.y = this.stage.pivot.y;
	};
};

Game.prototype.render = function() {
	// Render the stage
	this.renderer.render(this.stage);
};