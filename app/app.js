import GlobalHandler from './classes/GlobalHandler';
import NodeEmitter from './classes/NodeEmitter';

import Experience from './components/Canvas/Experience';
import Navigation from './components/Navigation';
import Loader from './components/@avery-loader/Loader';
import CookieBanner from './components/CookieBanner';

import { Detection } from './classes/Detection';
import createGlobalAnalytics from './classes/GlobalAnalytics';
const firebaseConfig = {
	apiKey: 'AIzaSyC-jLcAJH75IMU6tc1Q4kOXzU4H0jWhTss',
	authDomain: 'daria-utkina-2023.firebaseapp.com',
	projectId: 'daria-utkina-2023',
	storageBucket: 'daria-utkina-2023.appspot.com',
	messagingSenderId: '887696507797',
	appId: '1:887696507797:web:fda41cbb34883cead12c9c',
	measurementId: 'G-6H0E9Z8TSR',
};

createGlobalAnalytics(firebaseConfig, Detection);
import HomePage from './pages/Home';

import Lenis from '@studio-freight/lenis';

import { debounce } from './utils/utils';
import { checkWebpSupport, requestIdleCallbackPolyfill } from './utils/utils';

import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import normalizeWheel from 'normalize-wheel';
import TermsPage from './pages/Terms';

class App {
	constructor() {
		this.isCreated = false;

		this.create();
	}

	async create() {
		window.scrollTo(0, 0);

		await GlobalHandler.initWebpSupport();

		requestIdleCallbackPolyfill(); // for Safari iOS

		// Scroll
		// this.scroll = new Lenis({
		// 	// infinite: true,
		// });

		// this.scroll.scrollTo('top');

		// Canvas
		this.createContent();
		this.createPreloader();
		this.createNavigation();
		this.registerNodeEvents();

		// Other
		this.addEventListeners();
		this.update();
	}

	createPreloader() {
		this.loader = new Loader({
			pages: this.pages,
			onLeave: () => {
				if (this.scroll) this.scroll.destroy();

				if (this.experience) {
					this.experience.destroy();
					this.experience = null;
				}

				this.navigation.closeAll();
				GlobalHandler.handleDestroy(); // Runs destroy() on each component
			},

			onEnter: () => {
				GlobalHandler.setTemplate = this.loader.template;
			},

			afterEnter: () => {
				console.log(`Enterred ${this.loader.template}`);
				GlobalHandler.handlePageTemplate(); // sets this.template on all pages

				GlobalHandler.handleCreate(); // Run create() on each page
				GlobalHandler.handleResize(); // Runs onResize() on each component

				if (this.loader.template === 'home') {
					// this.experience = new Experience('.webgl');
				} else {
					this.scroll = new Lenis();
				}
			},
		});
		this.loader.on('scrollTo', (e) => {
			// e looks like '.awards'

			// const value = document.querySelector(e).getBoundingClientRect().top;
			if (this.scroll) this.scroll.scrollTo(e);
		});

		GlobalHandler.handlePageTemplate();

		GlobalHandler.handleCreate();
		GlobalHandler.handleResize(); // Runs onResize() on each component

		if (this.loader.template === 'home') {
			this.experience = new Experience('.webgl');
			this.loader.preloader.createLoader('home');
		}

		if (this.loader.template === 'main') {
			this.scroll = new Lenis();
			this.loader.preloader.createLoader('main');
		}

		if (this.loader.template === 'terms') {
			this.scroll = new Lenis();
			this.loader.preloader.createLoader('terms');
		}

		if (this.loader.template === '404') {
			this.loader.preloader.createLoader('notfound');
		}

		this.loader.preloader.on('completed', this.onPreloaded.bind(this));
	}

	createNavigation() {
		this.navigation = new Navigation();
		this.navigation.show();
	}

	createContent() {
		// Pages
		this.mainDiv = document.querySelector('.main-div');

		this.home = new HomePage('.cover', (e) => this.loader.clickLink(e));
		this.terms = new TermsPage('.terms');
		this.notfound = new NotFound('.notfound');

		this.pages = [
			{ page: this.home, url: ['/', '/home'] },
			{ page: this.terms, url: '/terms' },
			{ page: this.notfound, url: '/404' },
		];

		this.pageLength = this.mainDiv.getBoundingClientRect().height;
		this.isCreated = true;

		this.cookieBanner = new CookieBanner();
		this.footer = new Footer();
	}

	registerNodeEvents() {
		NodeEmitter.on('openMenu', () => {
			this.navigation.openMenu();
		});

		NodeEmitter.on('closeMenu', () => {
			this.navigation.closeMenu();
		});

		NodeEmitter.on('showMenu', () => {
			this.navigation.show();
		});
		NodeEmitter.on('hideMenu', () => this.navigation.hide());

		// NodeEmitter.on('stopScroll', () => this.scroll.stop());
		// NodeEmitter.on('startScroll', () => this.scroll.start());
	}

	async onPreloaded() {
		console.log('%c Preloaded');
		if (this.loader.template === 'home') {
			document.body.classList.add('refresh');

			// this.loader.preloader.hide();
			// this.navigation.updateNav(this.loader.template);
			// this.show();
			console.log('Update Images');
			await this.experience.updateImages();

			this.loader.preloader.hide();

			this.show();
		} else {
			document.body.classList.remove('refresh');

			// this.loader.preloader.animateLine(1);
			this.loader.preloader.hide();

			this.show();
		}
	}

	show() {
		if (this.loader.template === 'home') {
			document.body.classList.add('refresh');
			this.home.show();
		}
	}

	update(time) {
		if (this.scroll) {
			this.scroll.raf(time);
		}

		if (this.experience && this.experience.isReady) this.experience.update();
		if (this.home && this.home.update) this.home.update();

		this.frame = window.requestAnimationFrame(this.update.bind(this));
	}

	addEventListeners() {
		console.log('add', this);
		window.addEventListener('resize', debounce(this.onResize.bind(this))); // runs on the next frame

		window.addEventListener('wheel', this.onWheel.bind(this));

		window.addEventListener('mousedown', this.onTouchDown.bind(this));
		window.addEventListener('mousemove', this.onTouchMove.bind(this));
		window.addEventListener('mouseup', this.onTouchUp.bind(this));

		window.addEventListener('touchstart', this.onTouchDown.bind(this));
		window.addEventListener('touchmove', this.onTouchMove.bind(this));
		window.addEventListener('touchend', this.onTouchUp.bind(this));

		window.addEventListener('keydown', this.onKeyDown.bind(this));
		window.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	onTouchDown(event) {
		if (this.experience && this.experience.onTouchDown) {
			this.experience.onTouchDown(event);
		}
	}

	onTouchMove(event) {
		if (this.experience && this.experience.onTouchMove) {
			this.experience.onTouchMove(event);
		}
	}

	onTouchUp(event) {
		if (this.experience && this.experience.onTouchUp) {
			this.experience.onTouchUp(event);
		}
	}

	onWheel(event) {
		const normalizedWheel = normalizeWheel(event);

		if (this.experience && this.experience.onWheel) {
			this.experience.onWheel(normalizedWheel);
		}
	}

	onKeyDown(event) {
		if (
			(this.loader.template === 'home' && event.key === 'Enter') ||
			event.keyCode === 13
		) {
			document.querySelector('.circle__button').click();
		}

		if (this.experience && this.experience.onKeyDown) {
			this.experience.onKeyDown(event);
		}
	}

	onKeyUp(event) {
		if (this.experience && this.experience.onKeyUp) {
			this.experience.onKeyUp(event);
		}
	}

	onResize() {
		window.isMobile = window.innerWidth < 768;

		GlobalHandler.handleResize();
	}
}

new App();
