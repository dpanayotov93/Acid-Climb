'use strict';

function Player(options) {
	this.options = options;
	this.animations = {
		iddle: []
	};
	this.keys = {};
	this.collision = {};
	this.floor = {
		current: 0,
		max: 0
	};
	this.stats = {
		speed: 20,
		fireRate: 50
	};
	this.state = {
		jumping: false,
		falling: false
	};
	this.jumpData = {
		origin: null,
		target: null,
		height: 250
	};
	this.bullets = [];
	this.crosshair = null;
	this.holdingTouch = false;
};

// Assign the prototype and constructor
Player.prototype = Object.create(PIXI.extras.AnimatedSprite.prototype);
Player.prototype.constructor = Player;

// Methods
Player.prototype.init = function() {
	// Extract the frames for the different animations and create them
	this.createAnimations();

	// Setup the initial class properties
	this.setup();

	// Add the crosshair
	this.addCrosshair();

	// Setup the class events
	this.addEvents();

	// Add the player to the stage
	game.stage.addChild(this);
};

Player.prototype.createAnimations = function() {
	// Extract the iddle frames from the atlas
	var iddleFrames = Object.keys(game.assets['char_atlas'].textures).filter(function(key) {
		return key.includes('Walk_001') || key.includes('Walk_002')
	});

	// Push the extracted frames to the iddle animations container
	for (let i = 0; i < Object.keys(iddleFrames).length; i++) {
		this.animations.iddle.push(PIXI.Texture.fromFrame(iddleFrames[i]));
	};
};

Player.prototype.setup = function() {
	// Call the constructor of the AnimatedSprite class
	PIXI.extras.AnimatedSprite.call(this, this.animations.iddle);

	// Set the initial class properties
	this.x = (game.size.width / 2 * game.options.tileSize) + (this.width / 2 * game.options.ratio) + game.size.margin / 2;
	this.y = game.screen.bottom - game.options.tileSize - (this.height / 2);
	this.scale.set(.75 * game.options.ratio);
	this.anchor.set(.5 * game.options.ratio);
	this.animationSpeed = .15;
	this.jumpData.height = game.options.tileSize * 2.25;

	this.play();
	this.jump(); // TODO: Change this dirty fix for the wrong initial and after falling Y positioning ...
};

Player.prototype.addEvents = function() {
	document.addEventListener('keydown', this.onKeyDown.bind(this));
	document.addEventListener('keyup', this.onKeyUp.bind(this));
	document.addEventListener('pointerlockchange', game.lockChange, false);
	document.addEventListener('mozpointerlockchange', game.lockChange, false);
	canvas.addEventListener('mousedown', game.requestLock);


	// Touch controls
	if(mobileAndTabletcheck) {
		var moveIcon = document.getElementById('move');
		var jumpIcon = document.getElementById('jump');

		canvas.addEventListener('touchend', game.requestLock);
		moveIcon.addEventListener('touchstart', function(e) {
			game.player.directionTouch = e.target.clientWidth / 2 < e.changedTouches[0].clientX ? 1 : -1;
			game.player.holdingTouch = true;			
		}, false);

		moveIcon.addEventListener('touchmove', function(e) {
			game.player.directionTouch = e.target.clientWidth / 2 < e.changedTouches[0].clientX ? 1 : -1;
		}, false);	

		moveIcon.addEventListener('touchend', function() {
			game.player.holdingTouch = false;			
		}, false);		

		jumpIcon.addEventListener('touchend', function() {
			game.player.jump()
		}, false);
	};
};

Player.prototype.addCrosshair = function() {
	this.crosshair = new PIXI.Sprite(
		game.assets['crosshair'].texture
	);
	this.crosshair.scale.set(.25 * game.options.ratio);
	this.crosshair.anchor.set(.25 * game.options.ratio);
	this.crosshair.x = game.screen.width / 2 - this.crosshair.width / 2;
	this.crosshair.y = game.screen.height / 2 - this.crosshair.height / 2;

	if(mobileAndTabletcheck()) {
		this.crosshair.visible = false;
	};

	game.stage.addChild(this.crosshair);
};

Player.prototype.updateCrosshair = function(e) {
	var x = e.movementX;
	var y = e.movementY;

	game.player.crosshair.x += x;
	game.player.crosshair.y += y;

	if (game.player.x > game.player.crosshair.x) {
		game.player.scale.x = -.75 * game.options.ratio;
	} else {
		game.player.scale.x = .75 * game.options.ratio;
	}
};

Player.prototype.updateCrosshairTouch = function() {
	if (this.x > this.crosshair.x) {
		this.scale.x = -.75 * game.options.ratio;
	} else {
		this.scale.x = .75 * game.options.ratio;
	}
};

Player.prototype.onKeyUp = function(e) {
	// Unregister the key
	this.keys[e.code] = false;
};

Player.prototype.onKeyDown = function(e) {
	// Register the key
	this.keys[e.code] = true;
};

Player.prototype.update = function() {
	// Update the camera
	if(game.screen.height / 2 <= game.screen.height - this.y) {
		game.updateCamera();
	} else {
		game.stage.pivot.y = 0;
	};	

	// Check the collisions
	this.collision = this.detectCollision();

	if(this.state.jumping) {
		this.collision = this.detectCollision();
		if (this.collision.top) {
			// If the player hits a tile above him stop jumping
			this.state.jumping = false;
		};
		if(this.state.jumping) {
			this.y -= this.stats.speed / 2;	
		};
	};

	if (this.collision.top) {
		// If the player hits a tile above him stop jumping
		this.state.jumping = false;
	};

	if (this.collision.bottom) {
		// If the player hits a tile bellow him stop jumping
		this.state.falling = false;
		// TODO: Fix this mess bellow - repositioning after gravity falling
		// if (game.screen.width >= 1700) {
		// 	this.y = (this.collision.bottom.getGlobalPosition().y - this.collision.bottom.height / 2 - this.height / 2) - (game.screen.width / game.options.ratio / 2) / game.options.tileSize;
		// } else {
		// 	this.y = (this.collision.bottom.getGlobalPosition().y - this.collision.bottom.height / 2 - this.height / 2) - (game.screen.width / game.options.ratio) / game.options.tileSize;
		// };
	};

	// Update the bullets
	this.updateBullets();

	// Constantly apply gravity
	this.applyGravity();

	if(this.holdingTouch) {
		this.move(this.directionTouch);
	};

	// Check user input
	this.checkKeys();
};

Player.prototype.checkKeys = function() {
	// Jumping
	if (this.keys['ArrowUp'] || this.keys['KeyW']) {
		this.jump();
	};

	// Movement
	if (this.keys['ArrowLeft'] || this.keys['ArrowRight'] || this.keys['KeyA'] || this.keys['KeyD']) {
		var direction = null;

		if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
			direction = -1;
		};
		if (this.keys['ArrowRight'] || this.keys['KeyD']) {
			direction = 1;
		};

		this.move(direction);
	};
};

Player.prototype.move = function(direction) {
	if (direction > 0 && !this.collision.right) {
		this.scale.x = .75 * game.options.ratio;

		this.x += this.stats.speed * game.options.ratio;
	} else if (direction < 0 && !this.collision.left) {
		this.scale.x = -.75 * game.options.ratio;
		
		this.x -= this.stats.speed * game.options.ratio;
	};
};

Player.prototype.jump = function() {
	if (!this.collision.top && !this.state.falling) {
		this.state.jumping = true;
		this.jumpData.target = this.y - this.jumpData.height;
		/*
		while (this.y > this.jumpData.target) {
			this.collision = this.detectCollision();

			if (this.collision.top) {
				break;
			};

			this.y -= 1; // TODO: Not really working - implement some kind of tweening
		};
		*/
		// this.state.jumping = false;
	};
};

Player.prototype.applyGravity = function() {
	if (!this.state.jumping && !this.collision.bottom) {
		this.state.falling = true;

		this.collision = this.detectCollision();
		this.y += this.stats.speed * 1.5 * game.options.ratio;
	};
};

Player.prototype.shoot = function() {
	this.addBullet();
	if (game.player.x > game.player.crosshair.x) {
		game.player.scale.x = -.75 * game.options.ratio;
	} else {
		game.player.scale.x = .75 * game.options.ratio;
	}	
};

Player.prototype.addBullet = function() {
	var bullet = new PIXI.Sprite(
		game.assets['bullet'].texture
	); // TODO: Create Bullet class

	if(this.scale.x > 0) {
		bullet.x = this.x;
		bullet.y = this.y;
	} else {
		bullet.x = this.x - (this.width / 5) * game.options.ratio;
		bullet.y = this.y + 20 * game.options.ratio;
	};
	
	bullet.scale.set(.5 * game.options.ratio);
	bullet.rotation = this.rotateBullet(this.crosshair.x, this.crosshair.y, bullet.x, bullet.y);
	this.bullets.push(bullet);
	game.stage.addChild(bullet);
};

Player.prototype.rotateBullet = function(mx, my, px, py) {
	var dist_Y = my - py;
	var dist_X = mx - px;
	var angle = Math.atan2(dist_Y, dist_X);
	//var degrees = angle * 180/ Math.PI;
	return angle;
};

Player.prototype.updateBullets = function() {
	loop:
	for (var i = this.bullets.length - 1; i >= 0; i--) {
		var bullet = this.bullets[i];
		if(bullet == null) continue;
		bullet.position.x += Math.cos(bullet.rotation) * this.stats.fireRate;
		bullet.position.y += Math.sin(bullet.rotation) * this.stats.fireRate;


		// Destroy the bullet if it collides with a sprite
		for (var j = 0; j < game.floors.children.length; j++) {
			if(bullet == null) continue;
			var floor = game.floors.children[j];

			for(var k = 0; k < floor.children.length; k++) {
				var tile = floor.children[k];

				if(intersect(bullet, tile)) {
					bullet.destroy();
					this.bullets.splice(i, 1);
					break loop;
				};
			};
		};

		// Destroy the bullet if out of world bounds
		if (bullet.position && (bullet.x > game.screen.width || bullet.x < 0)) {
			bullet.destroy();
			this.bullets.splice(i, 1);
		};
	};

	function intersect(a, b) {
		var ab = a.getBounds();
		var bb = b.getBounds();

		if (ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + 5 + ab.height > bb.y && ab.y < bb.y + bb.height) { // TODO: Fix the godddamn constant
			return true;
		} else {
			return false;
		};		
	};
};

Player.prototype.detectCollision = function() {
	var collision = {
		top: false,
		bottom: false,
		left: false,
		right: false
	};

	for (var i = 0; i < game.floors.children.length; i++) {
		var floor = game.floors.children[i];

		for (var j = 0; j < floor.children.length; j++) {
			var tile = floor.children[j];
			var tileGlobalX = tile.getGlobalPosition().x + game.stage.pivot.x;
			var tileGlobalY = tile.getGlobalPosition().y + game.stage.pivot.y;

			if (this.intersect(tile)) {
				if (this.y < tileGlobalY + tile.height / 2 &&
					this.y > tileGlobalY - tile.height / 2
				) {
					if (this.x + this.width / 2 > tileGlobalX + this.width / 2) {
						collision.left = tile;
					};

					if (this.x - this.width / 2 < tileGlobalX - this.width / 2) {
						collision.right = tile;
					};

				} else {
					if (tileGlobalY - tile.height / 2 < this.y) {
						collision.top = tile;
					} else if (tileGlobalY + tile.height / 2 > this.y) {
						collision.bottom = tile;
					};
				};
			};
		};
	};

	return collision;
};

Player.prototype.intersect = function(sprite) {
	var ab = this.getBounds();
	var bb = sprite.getBounds();

	if (ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + 5 + ab.height > bb.y && ab.y < bb.y + bb.height) { // TODO: Fix the godddamn constant
		return true;
	} else {
		return false;
	};
}