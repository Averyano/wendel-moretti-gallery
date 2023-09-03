import Component from '../classes/Component';
import GSAP from 'gsap';

export default class Footer extends Component {
	constructor() {
		super({
			element: 'footer',
			elements: {
				top: '.footer__top',
				container: '.footer__container',
				items: '.footer__item',
				logo: '.footer__logo',
			},
		});

		this.createTimeline();
	}

	createTimeline() {}

	addEventListeners() {
		this.elements.logo.addEventListener('click', () => {
			window.globalAnalyticsInstance.trackEvent('Footer', {
				action: 'Click',
				label: 'Logo',
			});
		});
	}

	destroy() {
		super.destroy();

		if (this.timeline) {
			this.timeline.kill();
			this.timeline = null;
		}
	}
}
