import Component from './Component';
import GlobalHandler from './GlobalHandler';
import GSAP from 'gsap';

export default class Page extends Component {
	constructor(object) {
		super(object); // { element, elements }

		this.setTemplate();

		GlobalHandler.registerPage(this.setTemplate.bind(this));
		GlobalHandler.registerCreate(this.create.bind(this));
	}

	create() {}

	show() {}

	hide() {
		return new Promise((resolve) => {
			this.destroy();

			GSAP.to(this.element, {
				autoAlpha: 0,
				onComplete: resolve,
			});
		});
	}

	setTemplate() {
		this.template = GlobalHandler.getTemplate;
	}

	addEventListeners() {
		// window.addEventListener('mousewheel', this.onMouseWheelEvent);
	}

	removeEventListeners() {
		// window.removeEventListener('mousewheel', this.onMouseWheelEvent);
	}

	destroy() {
		this.removeEventListeners();
		super.destroy();
	}
}
