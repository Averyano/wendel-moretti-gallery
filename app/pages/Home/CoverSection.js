import Component from '../../classes/Component';
import GSAP from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Reveal from '../../animations/Reveal';
import Button from '../../components/Button';
import each from 'lodash/each';

export default class CoverSection extends Component {
	constructor() {
		super({
			element: '.cover',
			elements: {
				button: '.circle__button',
				links: '.cover__ui__bottom__right__links a',
			},
		});
	}

	create() {
		super.createComponent();
		if (!this.button) {
			this.button = new Button(this.elements.button);
			console.log(this.button);
		}

		this.addEventListeners();
	}

	addEventListeners() {
		this.button.element.addEventListener('click', () => {
			window.globalAnalyticsInstance.trackEvent('Button', {
				action: 'Click',
				label: 'Enter Button',
			});
		});

		each(this.elements.links, (link) => {
			link.addEventListener('click', () => {
				window.globalAnalyticsInstance.trackEvent('Social Media', {
					action: 'Click',
					label: link.textContent,
				});
			});
		});
	}

	removeEventListeners() {
		console.log('remv');
		if (this.button && this.button.element)
			this.button.element.removeEventListener('click', () => {
				window.globalAnalyticsInstance.trackEvent('Button', {
					action: 'Click',
					label: 'Enter Button',
				});
			});

		each(this.elements.links, (link) => {
			link.removeEventListener('click', () => {
				window.globalAnalyticsInstance.trackEvent('Social Media', {
					action: 'Click',
					label: link.textContent,
				});
			});
		});
	}

	destroy() {
		super.destroy();
		console.log('destr');
		if (this.button) {
			this.button.removeEventListeners();
			this.button = null;
		}
	}
}
