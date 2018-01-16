'use strict';

var game;

// Start the program logic
window.onload = function() {
	game = new Game({
		antialias: true,
		autoResize: true,
		resolution: 1,
		screenOffset: 16,
		transparent: true,
		roundPixels: true,
		maxWidth: 1920,
		ratio: window.innerWidth / 1920,
		tileSize: 256 * (window.innerWidth / 1920)
	});
};