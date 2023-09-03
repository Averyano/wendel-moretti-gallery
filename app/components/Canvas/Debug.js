import * as dat from 'dat.gui';
import GSAP from 'gsap';
import each from 'lodash/each';
export default class Debug {
	constructor(variables) {
		this.active = window.location.hash === '#debug';
		this.active = true;

		this.variables = variables; // we point to actual variables in debugObject

		this.gui = new dat.GUI();

		if (!this.active) {
			this.gui.hide();
		} else {
			this.create();
		}
	}

	create() {
		this.gui.add(this.variables, 'enableDistortion');

		this.gui
			.add(this.variables, 'baseIor')
			.min(0)
			.max(2)
			.step(0.001)
			.onFinishChange((value) => {
				console.log(value);
				this.variables.baseIor = value;
			});

		this.gui
			.add(this.variables, 'jitterIntensity')
			.min(0)
			.max(2)
			.step(0.001)
			.onFinishChange((value) => {
				this.variables.jitterIntensity = value;
			});

		this.gui
			.add(this.variables, 'bandOffset')
			.min(0)
			.max(0.5)
			.step(0.0001)
			.onFinishChange((value) => {
				this.variables.bandOffset = value;
			});

		this.variables.runProgress = () => {
			// Forward & Backward progress
			const value = this.variables.progress < 1 ? 1 : 0;
			GSAP.to(this.variables, {
				progress: value,
				duration: 1,
				ease: 'expo.out',
			});
		};
		this.gui.add(this.variables, 'runProgress');
	}
}
