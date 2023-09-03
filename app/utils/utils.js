// Map number x from range [a, b] to [c, d]
const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;

// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const calcWinsize = () => {
	return { width: window.innerWidth, height: window.innerHeight };
};

// Gets the mouse position
const getMousePos = (e) => {
	return {
		x: e.clientX,
		y: e.clientY,
	};
};

// Gets the touch position
const getTouchPos = (e) => {
	if (e.touches.length > 0) {
		return {
			x: e.touches[0].clientX / this.sizes.width - 0.5,
			y: -(e.touches[0].clientY / this.sizes.height) + 0.5,
		};
	}
};

const distance = (x1, y1, x2, y2) => {
	var a = x1 - x2;
	var b = y1 - y2;

	return Math.hypot(a, b);
};

// Generate a random float.
const getRandomFloat = (min, max) =>
	(Math.random() * (max - min) + min).toFixed(2);

// Debounce
const debounce = (func) => {
	let timer;
	return function (event) {
		if (timer) cancelAnimationFrame(timer);
		timer = requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				func(event);
			});
		});
		// if (timer) clearTimeout(timer);
		// timer = setTimeout(func, 100, event);
	};
};

// For DOM manipulations
const insertAfter = (referenceNode, newNode) => {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};

const checkWebpSupport = async () => {
	return new Promise((resolve) => {
		if (IS_DEVELOPMENT) return resolve(false);

		const webp = new Image();
		webp.onload = webp.onerror = function () {
			resolve(webp.height === 1);
		};
		webp.src =
			'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
	});
};

const requestIdleCallbackPolyfill = () => {
	// Fallback for browsers that don't support requestIdleCallback
	window.requestIdleCallback =
		window.requestIdleCallback ||
		function (callback, options) {
			var start = Date.now();
			return setTimeout(function () {
				callback({
					didTimeout: false,
					timeRemaining: function () {
						return Math.max(0, 50 - (Date.now() - start));
					},
				});
			}, 1);
		};

	window.cancelIdleCallback =
		window.cancelIdleCallback ||
		function (id) {
			clearTimeout(id);
		};
};

export {
	map,
	clamp,
	lerp,
	calcWinsize,
	getMousePos,
	getTouchPos,
	distance,
	getRandomFloat,
	debounce,
	insertAfter,
	checkWebpSupport,
	requestIdleCallbackPolyfill,
};
