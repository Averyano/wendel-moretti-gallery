// Three
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import map from 'lodash/map';

export default class Model {
	constructor({ model, material, textures, scene, sizes }) {
		this.textures = textures;
		this.textureLoader = new THREE.TextureLoader();
		this.scene = scene;
		this.sizes = sizes;
		this.gltfLoader = new GLTFLoader();
	}

	loadTextures(textures) {
		return new Promise((resolve) => {
			const promises = map(textures, (value, key) => {
				return new Promise((resolve, reject) => {
					this.textureLoader.load(
						value,
						(texture) => {
							const object = {};
							object[key] = texture;
							resolve(object);
						},
						undefined,
						(err) => {
							reject(err);
						}
					);
				});
			});

			Promise.all(promises)
				.then((loadedData) => {
					map(loadedData, (object) => {
						// We mutate this.textures with actual textures
						this.textures[Object.keys(object)] = Object.values(object)[0];
					});
				})
				.then(() => resolve())
				.catch((error) => console.error('Textures could not be loaded.'));
		});
	}

	onResize() {}
}
