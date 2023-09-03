// Resize Handler
import GlobalHandler from '../../classes/GlobalHandler';

// Three
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { LensDistortionShader } from './LensDistortionShader.js';
// Libraries
import GSAP from 'gsap';

// Classes
import Canvas from '../../classes/Canvas';

// Canvas Components
import Gallery from './Gallery';
import Camera from './Camera';
import Debug from './Debug';
import Lights from './Lights';
import Raycaster from './Raycaster';

// Utils
import { lerp } from '../../utils/utils';
import { clamp } from 'three/src/math/MathUtils';
import map from 'lodash/map';

// 3D Models
import Roza from './Models/Roza';

// Shaders
import vertexShader from '../../../shared/shaders/vertex.glsl';
import fragmentShader from '../../../shared/shaders/fragment.glsl';

// Scene & renderer are created in Canvas.js class
export default class Experience extends Canvas {
	constructor(el) {
		super(el);

		this.topWrapper = document.querySelector('.main-div');

		this.speed = 0;
		this.y = {
			start: 0,
			distance: 0,
			end: 0,
		};
		this.extraSpeed = {
			value: 0,
		};
		// this.models = this.loadModels();

		// this.loadTextures();

		this.isReady = false; // update method is called only when true

		this.camera = new Camera({ sizes: this.sizes });
		this.scene.add(this.camera.el);
		this.isMobile = this.sizes.width < 768;

		this.gallery = new Gallery({
			scene: this.scene,
			sizes: this.sizes,
		});

		this.isTouch = false;
		this.velocity = 1;
		this.direction = 1;

		// this.createLogoScene();

		// this.controls = new OrbitControls(this.camera.el, this.element);
		// this.controls.enableDamping = true;

		this.lights = new Lights({
			scene: this.scene,
		});

		this.mouse = new THREE.Vector2();
		this.touch = {
			start: 0,
			end: 0,
		};
		this.isTouch = false;

		this.clock = new THREE.Clock();
		this.oldElapsedTime = 0;

		if (!this.isMobile) this.createComposer();

		// this.createGui();

		this.raycaster = new Raycaster({
			meshes: this.gallery.meshes,
		});
		this.addEventListeners();
		this.onResize();

		this.isReady = true;

		GlobalHandler.registerResize(this.onResize.bind(this));

		window.experience = this;

		this.gallery.on('enterredFullscreen', () => {
			GSAP.killTweensOf(this.extraSpeed);
			GSAP.to(this.extraSpeed, {
				duration: 1,
				value: 100,
			});
		});
		this.gallery.on('leftFullscreen', () => {
			GSAP.killTweensOf(this.extraSpeed);
			GSAP.to(this.extraSpeed, {
				duration: 1,
				value: 0,
			});
		});
	}

	loadTextures() {
		this.textureLoader = new THREE.TextureLoader();
		// this.logoImg = this.textureLoader.load('/images/textureTest.png');
		// this.selectionImages = {
		// 	designs: this.textureLoader.load('/images/designs.jpg'),
		// 	websites: this.textureLoader.load('/images/websites.jpg'),
		// };
	}

	/**
	 * Utility
	 */
	createGSAP() {
		this.timeline = GSAP.timeline();
		this.xSetter = GSAP.quickSetter('.dot', 'y', 'px');
		GSAP.utils.pipe(
			GSAP.utils.clamp(0, 100), //make sure the number is between 0 and 100
			GSAP.utils.snap(5), //snap to the closest increment of 5
			GSAP.quickSetter('.dot', 'y', 'px') //apply it to the #id element's x property and append a "px" unit
		);
	}

	createGui() {
		/* Add all variables to debugObject*/
		// this.debugObject = this.params;

		this.debug = new Debug(this.params);
	}

	createElements() {
		this.uniforms = {
			uTime: { value: 0 },
		};
		this.geometry = new THREE.PlaneGeometry(1, 1);
		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
		});

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.scale.set(this.sizes.width / 2, this.sizes.height / 2, 1);
		this.scene.add(this.mesh);
	}

	createGallery() {
		// this.gallery = new Gallery({
		// 	scene: this.scene,
		// 	sizes: this.sizes,
		// });
	}

	createComposer() {
		this.params = {
			enableDistortion: true,
			baseIor: 0.92,
			bandOffset: 0.0002,
			// bandOffset: 0,
			jitterIntensity: 1.3,
			samples: 7,
			distortionMode: 'rygcbv',
		};

		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.camera.el));

		this.distortPass = new ShaderPass(LensDistortionShader);
		this.distortPass.material.defines.CHROMA_SAMPLES = this.params.samples;

		this.distortPass.enabled = this.params.enableDistortion;
		this.distortPass.material.uniforms.baseIor.value = this.params.baseIor;
		this.distortPass.material.uniforms.bandOffset.value =
			this.params.bandOffset;
		this.distortPass.material.uniforms.jitterOffset.value += 0.01;
		this.distortPass.material.uniforms.jitterIntensity.value =
			this.params.jitterIntensity;

		// this.distortPass.renderToScreen = true;
		this.composer.addPass(this.distortPass);
	}
	/**
	 * Textures & Models
	 */
	loadModels() {
		return [
			(this.roza = new Roza({
				scene: this.scene,
				sizes: this.sizes,
				modelPath: 'models/roza.glb',
			})),
		];
	}

	// This method is called in app.js at onPreloaded()
	updateImages() {
		return new Promise((resolve) => {
			if (this.gallery.items.length === 0) {
				this.gallery.createItems(this.gallery.imageBounds).then(() => {
					this.isReady = true;
					resolve();
				});
			} else {
				this.gallery.updateItems(this.gallery.imageBounds);
				resolve();
			}
		});
	}

	/**
	 * Elements & Lights
	 */

	update() {
		this.velocity =
			(2 * this.gallery.speed.current + this.extraSpeed.value) / 10;
		this.velocity = clamp(this.velocity, -120, 120);
		this.elapsedTime = this.clock.getElapsedTime();

		// Cast a ray
		this.raycaster.el.setFromCamera(this.mouse, this.camera.el);
		this.raycaster.update();

		if (this.raycaster.currentIntersect) {
			this.raycaster.currentIntersect.object.material.uniforms.uMouse.value =
				this.mouse;
		}

		// Update Image mesh
		// this.selectionScene.update(this.mouse.x, this.mouse.y);
		this.gallery.update();

		// Controls update
		// this.controls.update();

		// Scene
		// this.renderer.render(this.scene, this.camera.el);
		if (this.composer) {
			this.distortPass.enabled = this.params.enableDistortion;

			// iorVal = clamp(iorVal, 0.8, 0.92);

			this.distortPass.material.uniforms.baseIor.value =
				this.params.baseIor + this.velocity * 0.001 * -1;

			this.distortPass.material.uniforms.bandOffset.value =
				this.params.bandOffset * this.velocity;

			this.distortPass.material.uniforms.jitterOffset.value += 0.01;
			this.distortPass.material.uniforms.jitterIntensity.value =
				this.params.jitterIntensity;

			this.composer.render();
		} else {
			this.renderer.render(this.scene, this.camera.el);
		}
	}

	onResize() {
		// Update sizes
		super.onResize();

		// Update camera
		this.camera.resizeCamera(this.sizes);

		// Update renderer
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// Update elements
		if (this.gallery) {
			this.gallery.sizes = this.sizes;
			if (this.gallery.onResize) this.gallery.onResize();
		} //
	}

	addEventListeners() {
		// Gallery fullscreen
		window.addEventListener('click', (e) => {
			if (e.target && e.target.classList.contains('webgl')) {
				if (this.gallery.active && !this.gallery.isAnimating) {
					this.raycaster.isFullscreen = false;
					return this.gallery.setInactive(this.element);
				}

				if (this.raycaster.currentIntersect && !this.gallery.isAnimating) {
					// UI updates
					this.raycaster.isFullscreen = true;
					this.element.classList.add('dg', 'ac');

					const intersectItem = this.gallery.items.find((item) => {
						return (
							item.mesh.uuid === this.raycaster.currentIntersect.object.uuid
						);
					});

					this.gallery.setActive(intersectItem, this.camera.el);
				}
			}
		});

		// Handle mouse events
		window.addEventListener('mousemove', (event) => {
			this.mouse.x = (event.clientX / this.sizes.width) * 2 - 1;
			this.mouse.y = -(event.clientY / this.sizes.height) * 2 + 1;
		});

		// Handle touch events
		window.addEventListener('touchstart', (event) => {
			this.isTouch = true;
			const touch = event.touches[0];

			this.mouse.x = (touch.clientX / this.sizes.width) * 2 - 1;
			this.mouse.y = -(touch.clientY / this.sizes.height) * 2 + 1;
			updateTouchPosition(event);
		});

		window.addEventListener('touchmove', (event) => {
			if (this.isTouch) {
				updateTouchPosition(event);
			}
		});

		window.addEventListener('touchend', () => {
			this.isTouch = false;
		});

		const updateTouchPosition = (event) => {
			if (event.touches.length > 0) {
				// @TODO
				// const touchEvent = event.touches[0];
				// this.speed += -(event.touches[0] / this.sizes.height) + 0.5;
				// this.mouse.x = touchEvent.clientX / this.sizes.width - 0.5;
				// this.mouse.y = -(touchEvent.clientY / this.sizes.height) + 0.5;
			}
		};
	}

	onWheel({ pixelY }) {
		this.direction = pixelY > 0 ? 1 : -1;
		this.velocity += pixelY * 0.1;

		this.gallery.onWheel(this.direction, pixelY);
	}

	onTouchDown(e) {
		this.isTouch = true;

		this.y.start = e.touches ? e.touches[0].clientY : e.clientY;

		const values = {
			y: this.y,
		};

		this.gallery.onTouchDown(values);
		// this.speed.target = this.speed.current - yDistance;
	}

	onTouchMove(e) {
		if (!this.isTouch) return;

		const y = e.touches ? e.touches[0].clientY : e.clientY;

		this.y.end = y;

		const values = {
			y: this.y,
		};

		this.gallery.onTouchMove(values);

		this.y.start = y;
		// this.speed.target = this.speed.current - yDistance;

		// this.gallery.speed.target = this.gallery.speed.current - yDistance;
	}

	onTouchUp(e) {
		this.isTouch = false;

		const y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

		this.y.end = y;

		const values = {
			y: this.y,
		};

		this.gallery.onTouchUp(values);
	}

	onKeyDown(e) {
		this.gallery.onKeyDown(e);
	}

	onKeyUp(e) {
		this.gallery.onKeyUp(e);
	}

	show() {
		if (this.gallery) this.gallery.show();
		console.log(this.gallery);
	}

	destroy() {
		super.destroy();
		if (this.gallery) {
			this.gallery.destroy();
			this.gallery = null;
		}
	}
}
