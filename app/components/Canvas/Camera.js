// Three
import * as THREE from 'three';

export default class Camera {
	constructor({ sizes }) {
		this.el = new THREE.OrthographicCamera(
			sizes.width / -2,
			sizes.width / 2,
			sizes.height / 2,
			sizes.height / -2,
			1,
			1000
		);

		// this.el = new THREE.PerspectiveCamera(
		// 	75,
		// 	sizes.width / sizes.height,
		// 	0.1,
		// 	10000
		// );
		// this.el.position.set(0, 0, 1.3);

		// this.el.fov = 2 * (180 / Math.PI) * Math.atan(1 / (2 * 1));
		this.el.position.set(0, -window.scrollY, 10);
	}

	resizeCamera(sizes) {
		this.el.left = sizes.width / -2;
		this.el.right = sizes.width / 2;
		this.el.top = sizes.height / 2;
		this.el.bottom = sizes.height / -2;
		// this.el.aspect = sizes.width / sizes.height;
		this.el.updateProjectionMatrix();
	}
}
