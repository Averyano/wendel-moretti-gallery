// Three & GSAP
import * as THREE from 'three';
import GSAP from 'gsap';
import each from 'lodash/each';
import map from 'lodash/map';
import normalizeWheel from 'normalize-wheel';

import GlobalHandler from '../../../classes/GlobalHandler';

// Classes
import Component from '../../../classes/Component';
import GalleryItem from './GalleryItem';

// Utils
import { threeCover } from '../../../utils/threeCover';
import { lerp } from '../../../utils/utils';
import { clamp } from 'three/src/math/MathUtils';

export default class Gallery extends Component {
	constructor({ scene, sizes }) {
		super({
			element: '.cover',
			elements: {
				wrapper: '.cover__wrapper',
				images: '.cover__image',
			},
		});

		this.scene = scene;
		this.sizes = sizes;
		this.extraSpeed = 200;
		this.textureLoader = new THREE.TextureLoader();
		this.isBoundReady = false;

		this.isPlayed = false;

		this.meshes = [];
		this.items = [];

		// Animation related
		this.speed = {
			current: 0,
			target: 0,
			lerp: 0.1,
		};

		this.velocity = 1;
		this.direction = 1;

		this.maxHeight = 0;

		this.isDesktop = this.sizes.width > 1919;
		this.isLaptop = this.sizes.width < 1440;
		this.isTablet = this.sizes.width < 1024;
		this.isMobile = this.sizes.width < 768;

		if (this.isMobile) {
			this.padding = 6;
		} else if (this.isTablet) {
			this.padding = 24;
		} else if (this.isLaptop) {
			this.padding = 32;
		} else if (this.isDesktop) {
			this.padding = 64;
		}

		this.active = false;
		this.previous = null;
		this.isAnimating = false;
		this.isShowing = false;
		this.isRescaling = false;
		this.isPlayed = false;
		this.isKeyDown = false;
		this.isFullscreen = false;
		this.time = {
			start: 0,
			current: 0,
			end: 0,
		};

		this.metricsLength = 0;
		this.metricsTargetBreakdown = -1;
		this.metricsBreakdowns = [];
		this.currentBreakdownIndex = -1;
		this.metricsBreakdownsNamings = ['25%', '50%', '75%', '100%'];

		this.addEventListeners();
	}

	createItems() {
		return new Promise((res) => {
			this.getBounds().then((imageBounds) => {
				this.uniforms = {
					uSpeed: { value: 0 },
					uOffset: {
						value: new THREE.Vector2(0.0, 0.0),
					},
				};

				// Load all textures in the correct order
				const loadTexturesPromises = this.imageBounds.map((obj, index) => {
					return new Promise((resolve) => {
						this.textureLoader.load(obj.src, (texture) => {
							const aspect = threeCover(
								texture,
								obj.bounds.width / obj.bounds.height
							);

							resolve({ obj, texture, aspect, index });
						});
					});
				});

				// Create a mesh for each image and add it to the scene
				Promise.all(loadTexturesPromises).then((loadedData) => {
					loadedData.forEach(({ obj, texture, aspect, index }) => {
						const item = new GalleryItem({
							obj,
							texture,
							aspect,
							sizes: this.sizes,
							uniforms: this.uniforms,
						});

						// Add to scene
						this.scene.add(item.mesh);

						// Also to arrays for later usage
						this.meshes.push(item.mesh);
						this.items.push(item);
					});

					if (this.items.length === imageBounds.length) {
						this.isReady = true;
						res();
						this.scene.traverse((obj) => (obj.frustumCulled = false)); // Workaround to avoid lag, renders all objects at all times. Not the best performance
						this.onResize();
					} // fin
				});

				this.isBoundReady = true;
				GSAP.set(this.elements.wrapper, { autoAlpha: 0 }); // hides the DOM element
			});
		});
	}

	updateItems(imageBounds) {
		if (!imageBounds) {
			console.warn('No image bounds');
			return;
		}
		this.items.map((item, i) => {
			const x = (imageBounds[i].bounds.left + imageBounds[i].bounds.right) / 2;
			const y =
				(imageBounds[i].bounds.top +
					imageBounds[i].bounds.bottom +
					window.scrollY * 2) /
				2;

			const pos = new THREE.Vector3(
				x - this.sizes.width / 2,
				-y + this.sizes.height / 2,
				-1
			);

			item.original.position = pos;
			item.mesh.position.copy(pos);

			item.bounds = imageBounds[i].bounds;
			item.mesh.scale.set(item.bounds.width, item.bounds.height, 1);
			item.extraY = 0;
			item.getParams();
		});
	}

	checkMaxHeight(bounds) {
		this.maxHeight = Math.max(this.maxHeight, bounds.height + bounds.top);
	}

	getBounds() {
		this.wrapperBounds = this.element.getBoundingClientRect();

		return new Promise((resolve) => {
			// Create Images Array
			if (!this.imagesArray) {
				this.imagesArray = new Array(this.elements.images.length);
				each(this.elements.images, (image, i) => {
					this.imagesArray[i] = {
						bounds: image.getBoundingClientRect(),
						src: GlobalHandler.isWebpSupported
							? image.dataset.preWebp
							: image.dataset.pre,
					};
					this.checkMaxHeight(this.imagesArray[i].bounds);
				});
				this.maxHeight += this.padding; // padding for the last image
			}

			// Update Existing Images Array
			if (this.imagesArray) {
				this.maxHeight = 0;
				this.imagesArray.map((image, i) => {
					image.bounds = this.elements.images[i].getBoundingClientRect();
					this.checkMaxHeight(this.imagesArray[i].bounds);
				});
				this.maxHeight += this.padding; // padding for the last image
			}

			this.metricsBreakdowns = [
				this.maxHeight * 0.25,
				this.maxHeight * 0.5,
				this.maxHeight * 0.75,
				this.maxHeight,
			];
			this.metricsTargetBreakdown = this.metricsBreakdowns[0];
			this.currentBreakdownIndex = 0;
			// Return bounds
			this.imageBounds = this.imagesArray;

			resolve(this.imagesArray);
		});
	}

	/* INITIAL ANIMATION */
	show() {
		this.isShowing = true;
		this.direction = 1;

		// @TODO create a different animation
		// if (this.items.length > 0) {
		// 	GSAP.killTweensOf(this.speed);
		// 	GSAP.fromTo(
		// 		this.speed,
		// 		{
		// 			target: 1000,
		// 		},
		// 		{
		// 			target: 2,
		// 			duration: 3,
		// 			ease: 'power4.inOut',
		// 			// ease: 'in.expo',
		// 			onComplete: () => {
		// 				this.isShowing = false;
		// 				this.isPlayed = true;
		// 			},
		// 		}
		// 	);
		// }
	}

	hide() {
		// this overlay mesh opacity 1
	}

	/* RAF */
	update() {
		if (this.isRescaling || !this.isBoundReady) return;
		if (this.isFullscreen) return;

		this.speed.current = lerp(
			this.speed.current,
			this.speed.target,
			this.speed.lerp
		);

		if (!this.isShowing)
			this.speed.current = clamp(this.speed.current, -120, 120);

		this.speed.target = this.velocity * this.direction;

		map(this.items, (item) => {
			item.update();

			item.extraY += this.speed.current;

			// up

			if (this.direction === 1) {
				// down
				if (
					item.mesh.position.y >
					this.maxHeight - item.bounds.height - this.sizes.height / 2
				) {
					item.extraY -= this.maxHeight;
					// console.log(item.mesh.position.y);
					// console.log('------------------ 1');
				}
			} else if (this.direction === -1) {
				// up
				if (
					item.mesh.position.y <
					-this.maxHeight + item.bounds.height + this.sizes.height / 2
				) {
					item.extraY += this.maxHeight;
					// console.log(item.mesh.position.y);
					// console.log('------------------ -1 ');
				}
			}
		});

		if (this.currentBreakdownIndex === -1) return;

		requestIdleCallback(() => {
			this.metricsLength += Math.abs(this.speed.current);

			if (this.metricsLength >= this.metricsTargetBreakdown) {
				window.globalAnalyticsInstance.trackEvent(
					'Home Gallery',
					{
						action: 'Reached',
						label: `${
							this.metricsBreakdownsNamings[this.currentBreakdownIndex]
						}`,
					},
					1
				);

				// Move to next breakdown target
				this.currentBreakdownIndex++;

				if (this.currentBreakdownIndex < this.metricsBreakdowns.length) {
					this.metricsTargetBreakdown =
						this.metricsBreakdowns[this.currentBreakdownIndex];
					console.log('New Target', this.metricsTargetBreakdown);
				} else {
					// Handle the case when you have reached the end of the breakdowns array.
					// For example, you might want to stop further checks or reset the index.
					console.log('All targets reached!');
					this.currentBreakdownIndex = -1; // This line resets the index if needed
				}
			}
		});
	}

	onResize() {
		this.isRescaling = true;
		this.hide();
		// Gets bounds, updates meshes positions and scaling
		if (this.imageBounds) {
			this.getBounds().then(() => {
				this.updateItems(this.imageBounds);

				requestIdleCallback(() => {
					this.isRescaling = false;
				});

				if (this.isPlayed) {
					// this.show();
					this.playRaf();
				} // to show it one time only
				// this.show();
				this.isPlayed = true;
				console.log('show WebGL');
			});
		}
	}

	/* EVENTS */
	addEventListeners() {
		/* added in app.js */
	}

	onTouchDown({ x, y }) {
		// this.speed.target = this.speed.current - yDistance;
		this.speedCurrent = this.speed.current;

		if (this.timer) clearTimeout(this.timer);
	}

	onTouchMove({ y }) {
		if (!this.isPlayed) return;
		const yDistance = y.start - y.end;
		this.direction = yDistance < 0 ? -1 : 1;
		// this.speed.target = this.speed.current - yDistance;
		// this.speed.target = clamp(this.speedCurrent + yDistance, -40, 40);
		this.speed.target = this.speedCurrent + yDistance * 3;
	}

	onTouchUp({ x, y }) {
		if (!this.isPlayed) return;
		this.speed.target = 2 * this.velocity * this.direction;

		this.pauseRaf();
	}

	onWheel(direction, pixelY) {
		if (!this.isPlayed) return;
		this.direction = direction;
		this.speed.target += pixelY * 3;

		this.pauseRaf();
	}

	onKeyDown(e) {
		if (!this.isKeyDown) {
			this.time.start = Date.now();
			this.isKeyDown = true;
		}

		this.time.current = Date.now();
		let diff = 100 * ((this.time.current - this.time.start) / 1000);

		this.pauseRaf();

		if (e.code === 'ArrowUp' || e.keyCode === 38) {
			e.preventDefault();
			this.direction = -1;
			this.speed.target -= diff;
		}
		if (e.code === 'ArrowDown' || e.keyCode === 40) {
			e.preventDefault();
			this.direction = 1;
			this.speed.target += diff;
		}
	}

	onKeyUp(e) {
		this.time = {
			start: null,
			current: null,
			end: null,
		};

		this.isKeyDown = false;

		// this.speed.target = 0;
	}

	destroy() {
		map(this.items, (item) => {
			this.scene.remove(item.mesh);
			item.destroy();
		});
	}

	/* FOR FULLSCREEN MODE (NOT USED) */
	calculateAspect(imageResolution, meshSize) {
		const padding = 10; // adjust this value to change the amount of padding
		const imageAspect = imageResolution.x / imageResolution.y;
		const screenAspect =
			(this.sizes.width - 2 * padding) / (this.sizes.height - 2 * padding);

		if (imageAspect > screenAspect) {
			// image is wider relative to the screen (with padding) - scale based on width
			return {
				x: (this.sizes.width - 2 * padding) / meshSize.width,
				y: (this.sizes.width - 2 * padding) / meshSize.width / imageAspect,
			};
		} else {
			// image is taller relative to the screen (with padding) - scale based on height
			return {
				x: ((this.sizes.height - 2 * padding) / meshSize.height) * imageAspect,
				y: (this.sizes.height - 2 * padding) / meshSize.height,
			};
		}
	}

	animateMesh(item, camera, canvas, isActive) {
		if (this.isAnimating) return;

		this.isAnimating = true;

		if (this.active) {
			this.emit('enterredFullscreen');

			const padding = this.isTablet ? 1 : 0.7; // 20% padding

			const maxImageWidthMultiplier =
				item.mesh.material.uniforms.uImageRes.value.x / item.mesh.scale.x;
			const maxImageHeightMultiplier =
				item.mesh.material.uniforms.uImageRes.value.y / item.mesh.scale.y;

			const maxScreenWidthMultiplier =
				(padding * this.sizes.width) / item.mesh.scale.x;
			const maxScreenHeightMultiplier =
				(padding * this.sizes.height) / item.mesh.scale.y;
			const scaleFactor = Math.min(
				maxImageWidthMultiplier,
				maxImageHeightMultiplier,
				maxScreenWidthMultiplier,
				maxScreenHeightMultiplier
			);

			GSAP.killTweensOf(item.mesh.scale);
			GSAP.killTweensOf(item.mesh.position);
			GSAP.killTweensOf(item.mesh.material.uniforms.uResolution.value);

			GSAP.to(item.mesh.scale, {
				x: item.mesh.scale.x * scaleFactor,
				y: item.mesh.scale.y * scaleFactor,
			});

			GSAP.to(item.mesh.material.uniforms.uResolution.value, {
				x: item.original.uResolution.x,
				y: item.original.uResolution.y,
			});

			this.isFullscreen = true;
		} else {
			this.emit('leftFullscreen');
			GSAP.killTweensOf(item.mesh.scale);
			GSAP.killTweensOf(item.mesh.position);
			GSAP.killTweensOf(item.mesh.material.uniforms.uResolution.value);

			GSAP.to(item.mesh.scale, {
				x: item.bounds.width,
				y: item.bounds.height,
			});

			GSAP.to(item.mesh.material.uniforms.uResolution.value, {
				x: item.original.uResolution.x,
				y: item.original.uResolution.y,
			});
		}

		GSAP.to(item.mesh.material.uniforms.uProgress, {
			value: this.active ? 1 : 0,
		});

		if (this.active) {
			item.original.position.y = item.mesh.position.y;

			GSAP.to(item.mesh.position, {
				x: camera.position.x,
				y: camera.position.y,
				z: 1,
				onComplete: () => (this.isAnimating = false),
			});
		} else {
			GSAP.to(item.mesh.position, {
				x: item.original.position.x,
				y: item.original.position.y,
				z: item.original.position.z,
				duration: 0.2,
				onComplete: () => {
					this.isFullscreen = false;
				},
			});
		}

		this.isAnimating = false;
	}

	pauseRaf() {
		this.velocity = 0;

		if (this.timer) clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.playRaf();
		}, 5000);
	}

	playRaf() {
		this.velocity = 1;
	}

	setActive(item, camera) {
		// get data from item
		this.emit('active'); // calls this.scroll.stop(); at app.js
		this.active = true;

		this.animateMesh(item, camera, null);
		this.previous = item;
		clearTimeout(this.timer);
	}

	setInactive(canvas) {
		this.emit('inactive'); // calls this.scroll.start(); at app.js
		this.active = false;

		this.animateMesh(this.previous, null, canvas);
		this.previous = null;
		this.timer = setTimeout(() => canvas.classList.remove('dg', 'ac'), 1000); // canvas z-index 99999
	}
}
