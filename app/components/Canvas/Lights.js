// Three
import * as THREE from 'three';

export default class Lights {
	constructor({ scene }) {
		this.scene = scene;
		this.createLights();
	}
	createLights() {
		this.ambientLight = new THREE.AmbientLight(0xffffff, 1);

		this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
		this.directionalLight.position.x = 2;
		this.directionalLight.castShadow = true;

		this.scene.add(this.ambientLight, this.directionalLight);
	}
}
