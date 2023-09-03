import * as THREE from 'three';

import Model from '../../../classes/Model';

export default class Roza extends Model {
	constructor(data) {
		super(data);
		this.path = data.modelPath;

		this.textures = {
			color: 'images/textures/MCh_S_12_Rzezba_Popiersie_Rozy_Loewenfeld.jpg',
			normal: 'images/textures/MCh_S_12_Rzezba_Popiersie_Rozy_Loewenfeld_.jpg',
		};

		this.loadTextures(this.textures).then(this.loadModel.bind(this));
	}

	loadModel() {
		const footerBounds = document
			.querySelector('footer')
			.getBoundingClientRect();

		this.gltfLoader.load(this.path, (gltf) => {
			// Mesh
			this.model = gltf.scene.children[0].children[0].children[0].children[0];

			// Material
			const material = new THREE.MeshBasicMaterial({
				// roughness: 0.7,
				map: this.textures.color,
				// normalMap: this.textures.normal,
				// wireframe: true,
			});

			this.model.material = material;

			// Rotation
			this.model.rotation.x = Math.PI * 0.5;
			this.model.rotation.y = -Math.PI;

			// Position
			const x = (footerBounds.left + footerBounds.right) / 2;
			const y =
				(footerBounds.top + footerBounds.bottom + window.scrollY * 2) / 2;

			this.model.position.set(
				x - this.sizes.width / 2,
				-y + this.sizes.height / 2,
				-140
			);

			// Scale
			this.modelScale = Math.max(0.65, this.sizes.aspect * 0.4);
			this.model.scale.set(this.modelScale, this.modelScale, this.modelScale);

			this.model.geometry.center();

			// Add to scene
			this.scene.add(this.model);
		});
	}

	onResize() {
		if (this.model) {
			const footerBounds = document
				.querySelector('footer')
				.getBoundingClientRect();

			// Position
			const x = (footerBounds.left + footerBounds.right) / 2;
			const y =
				(footerBounds.top + footerBounds.bottom + window.scrollY * 2) / 2;

			this.model.position.set(
				x - this.sizes.width / 2,
				-y + this.sizes.height / 2,
				-140
			);

			// Scale
			this.modelScale = Math.max(0.65, this.sizes.aspect * 0.4);
			this.model.scale.set(this.modelScale, this.modelScale, this.modelScale);
		}
	}
}
