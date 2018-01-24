'use strict';

function Player(iddleAnimation) {
	// Extend the PIXI.extras.AnimatedSprite class
	PIXI.extras.AnimatedSprite.call(this, iddleAnimation);

	this.animations = {
		iddle: iddleAnimation,
		walk: [],
		jump: [],
		shoot: [],
		hurt: [],
		death: []
	};
	this.keys = {};
	this.collision = {};
	this.floor = {
		current: 0,
		max: 0
	};
	this.stats = {
		speed: 20,
		gravity: 10,
		fireRate: 50
	};
	this.state = {
		jumping: false,
		falling: false,
		shooting: false
	};
	this.jumpData = {
		target: null,
		height: 250
	};
	this.bullets = [];
	this.holdingTouch = false;

	this.init(); // Run this on creation
};

// Assign the prototype and constructor
Player.prototype = Object.create(PIXI.extras.AnimatedSprite.prototype);
Player.prototype.constructor = Player;

// Methods
Player.prototype.init = function() {
	// Setup the initial class properties
	this.setup();

	// Setup the class events
	this.addEvents();

	// Add the player to the stage
	game.stage.addChild(this);
};

Player.prototype.setup = function() {
	this.x = (game.size.width / 2 * game.options.tileSize) + (this.width / 2 * game.options.ratio) + game.size.margin / 2;
	this.y = game.floors.y - (game.options.tileSize / 2 + this.height / 2);
	this.scale.set(0.75 * game.options.ratio);
	this.anchor.set(0.5 * game.options.ratio);

	this.animationSpeed = .15;
	this.jumpData.height = game.options.tileSize * 2 * game.options.ratio;
	this.onFrameChange = this.test;
	this.play();
};

Player.prototype.addEvents = function() {
	document.addEventListener('keydown', this.onKeyDown.bind(this));
	document.addEventListener('keyup', this.onKeyUp.bind(this));


	if (mobileAndTabletcheck) {
		var moveIcon = document.getElementById('move');
		var jumpIcon = document.getElementById('jump');

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
			game.player.jump();
		}, false);
	};
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
	game.updateCamera();

	// Check the collisions
	this.collision = this.detectCollision();

	if (this.collision.top) {
		// If the player hits a tile above him stop jumping
		this.state.jumping = false;
	};

	if (this.collision.bottom) {
		// If the player hits a tile bellow him stop jumping
		this.state.falling = false;
	};

	if (this.state.jumping) {
		this.collision = this.detectCollision();
		if (this.collision.top) {
			// If the player hits a tile above him stop jumping
			this.state.jumping = false;
		};
		if (this.state.jumping) {
			this.y -= this.stats.speed / 2;
		};
	};


	// Update the bullets
	this.updateBullets();

	// Constantly apply gravity
	this.applyGravity();

	// Check user input
	this.checkKeys();
};

Player.prototype.checkKeys = function() {
	// Jumping
	if (this.keys.ArrowUp || this.keys.KeyW) {
		this.jump();
	};

	// Movement
	if (this.keys.ArrowLeft || this.keys.ArrowRight || this.keys.KeyA || this.keys.KeyD) {
		var direction = null;

		if (this.keys.ArrowLeft || this.keys.KeyA) {
			direction = -1;
		};
		if (this.keys.ArrowRight || this.keys.KeyD) {
			direction = 1;
		};

		this.move(direction);
	};

	if (this.holdingTouch) {
		this.move(this.directionTouch);
	};
};

Player.prototype.move = function(direction) {
	if (direction > 0 && !this.collision.right) {
		this.scale.x = 0.75 * game.options.ratio;

		this.x += this.stats.speed * game.options.ratio;
	} else if (direction < 0 && !this.collision.left) {
		this.scale.x = -0.75 * game.options.ratio;

		this.x -= this.stats.speed * game.options.ratio;
	};
};

Player.prototype.jump = function() {
	if (!this.collision.top && !this.state.falling) {
		this.state.jumping = true;
		this.jumpData.target = this.y - this.jumpData.height;
	};
};

Player.prototype.applyGravity = function() {
	if (!this.state.jumping && !this.collision.bottom) {
		this.state.falling = true;
		this.y += this.stats.gravity * game.options.ratio; // this.stats.speed;
	};
};

Player.prototype.shoot = function(mouse) {
	this.addBullet(mouse);
	if (game.player.x > mouse.x) {
		game.player.scale.x = -0.75 * game.options.ratio;
	} else {
		game.player.scale.x = 0.75 * game.options.ratio;
	}
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
			var tileTexture;

			if(tile.texture) {
				tileTexture = tile.texture.baseTexture.textureCacheIds[0];
			};
			
			if (this.intersect(tile) && tileTexture !== 'beam' && !tile.noCollision) {
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
};

/*=== BULLETS ===*/
Player.prototype.addBullet = function(mouse) {
	var bullet = new PIXI.Sprite(
		game.assets.bullet.texture
	); // TODO: Create Bullet class

	if (this.scale.x > 0) {
		bullet.x = this.x;
		bullet.y = this.y;
	} else {
		bullet.x = this.x - (this.width / 5) * game.options.ratio;
		bullet.y = this.y + 20 * game.options.ratio;
	};

	bullet.scale.set(0.5 * game.options.ratio);
	bullet.rotation = this.rotateBullet(mouse.x, mouse.y, bullet.x, bullet.y);
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
	loop: for (var i = this.bullets.length - 1; i >= 0; i--) {
		var bullet = this.bullets[i];
		if (bullet == null) continue;
		bullet.position.x += Math.cos(bullet.rotation) * this.stats.fireRate;
		bullet.position.y += Math.sin(bullet.rotation) * this.stats.fireRate;


		// Destroy the bullet if it collides with a sprite
		for (var j = 0; j < game.floors.children.length; j++) {
			if (bullet == null) continue;
			var floor = game.floors.children[j];

			for (var k = 0; k < floor.children.length; k++) {
				var tile = floor.children[k];
				var tileTexture;

				if(tile.texture) {
					tileTexture = tile.texture.baseTexture.textureCacheIds[0];
				};

				if (intersect(bullet, tile) && tileTexture !== 'beam' && !tile.noCollision) {
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
/*=== END BULLETS ===*/