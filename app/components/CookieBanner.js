import Component from '../classes/Component';
import GSAP from 'gsap';

export default class CookieBanner extends Component {
	constructor() {
		super({
			element: '.cookies',
			elements: {
				description: '.cookies__description',
				settingsWrapper: '.cookies__settings__wrapper',

				cookieEssential: '#cookie-essential',
				cookieAnalytics: '#cookie-analytics',

				button: {
					accept: '.cookies__button--accept',
					leave: '.cookies__button--leave',
				},
			},
		});

		const essentialString = localStorage.getItem('cookieEssential');
		const cookieString = localStorage.getItem('cookieAnalytics');
		this.updateCheckedStatus(essentialString, cookieString);

		window.cookieEssential = essentialString === 'true';
		window.cookieAnalytics = cookieString === 'true';

		this.settingsVisible = false;
		this.create();
	}

	updateCheckedStatus(essentialString, cookieString) {
		if (essentialString === 'false') {
			this.elements.cookieEssential.checked = false;
		}

		if (cookieString === 'false') {
			this.elements.cookieAnalytics.checked = false;
		}
	}

	create() {
		console.log(`CREATE 💣`);
		if (window.cookieEssential) window.cookieEssential = true;
		if (window.cookieAnalytics) this.initAnalytics();

		if (window.cookieEssential && window.cookieAnalytics)
			return this.removeElementFromDOM();

		this.show();
		this.addEventListeners();
	}

	show() {
		GSAP.fromTo(
			this.element,
			{
				autoAlpha: 0,
				yPercent: 100,
			},
			{
				autoAlpha: 1,
				yPercent: 0,
				duration: 1.25,
				ease: 'expo.out',
			}
		);
	}

	close() {
		console.log(`CLOSE 💣`);
		const cookieEssential = this.elements.cookieEssential.checked;
		const cookieAnalytics = this.elements.cookieAnalytics.checked;

		if (cookieEssential) {
			localStorage.setItem('cookieEssential', true);
			window.cookieEssential = true;
		}

		if (cookieAnalytics) {
			localStorage.setItem('cookieAnalytics', true);
			window.cookieAnalytics = true;
			this.initAnalytics();
		}

		if (cookieEssential && !cookieAnalytics) {
			localStorage.setItem('cookieAnalytics', false);
		}

		GSAP.to(this.element, {
			autoAlpha: 0,
			duration: 0.3,
			ease: 'expo.out',
			onComplete: () => this.removeElementFromDOM(),
		});
	}

	reject() {
		GSAP.to(this.element, {
			autoAlpha: 0,
			duration: 0.3,
			ease: 'expo.out',
			onComplete: () => this.removeElementFromDOM(),
		});
	}

	initAnalytics() {
		window.cookieAnalytics = true;
		window.globalAnalyticsInstance.initAnalytics();
	}

	initEssential() {}

	addEventListeners() {
		this.elements.button.accept.addEventListener(
			'click',
			this.close.bind(this)
		);

		this.elements.button.leave.addEventListener(
			'click',
			this.reject.bind(this)
		);
	}

	removeElementFromDOM() {
		this.element.remove();
	}
}
