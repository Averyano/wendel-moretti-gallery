// Three
import * as THREE from 'three';

import Component from './Component';

export default class Canvas extends Component {
	constructor(el) {
		super({ element: el });

		this.sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		};
		this.sizes.aspect = this.sizes.width / this.sizes.height;

		this.createScene();
		this.createRenderer();
	}

	/**
	 * Camera & Scene
	 */
	createScene() {
		this.scene = new THREE.Scene();
	}

	createRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.element,
			alpha: true,
			antialias: true,
		});

		this.renderer.setClearColor('rgb(255, 255, 255)');
		// this.renderer.setClearColor('rgb(255, 252, 247)');
		// this.renderer.setClearColor(0x050505);

		this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	onResize() {
		this.sizes.width = window.innerWidth;
		this.sizes.height = window.innerHeight;
		this.sizes.aspect = this.sizes.width / this.sizes.height;
	}

	destroy() {
		console.log('Canvas Class Destroy');
		// Traverse scene

		this.scene.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				for (const key in child.material) {
					const value = child.material[key];

					if (value && typeof value.dispose === 'function') {
						console.log(value);
						value.dispose();
					}
				}
			}
		});

		// Controls
		if (this.camera.controls) this.camera.controls.dispose();
		this.renderer.dispose();
		super.destroy();
	}
}
