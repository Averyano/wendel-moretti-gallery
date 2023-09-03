import Component from '../classes/Component';
import GSAP from 'gsap';
import Hamburger from './Hamburger';
import each from 'lodash/each';
import NodeEmitter from '../classes/NodeEmitter';

export default class Navigation extends Component {
	constructor() {
		super({
			element: 'nav',
			elements: {
				content: '.nav__content',
				contentLinksMetrics: '.nav__content__link',
				contentLinks: '.nav__content__link--inner',
				menuItem: '.nav__menu',
				navWrapper: '.nav__wrapper',
			},
		});
		this.isOpen = false;
		this.template = null;

		this.colors = {
			black: 'rgb(17, 17, 17)',
			stone: 'rgb(209, 201, 194)',
		};

		this.createTimeline();
		this.createHamburgerIcon();

		const isTablet = window.innerWidth < 1024;
		if (!isTablet) this.addEventListeners();
	}

	/**
	 * HAMBURGER RELATED
	 */

	createHamburgerIcon() {
		this.hamburger = new Hamburger();
		this.hamburger.create();
	}

	openMenu() {
		this.isOpen = true;

		this.elements.menuItem.classList.add('open');

		GSAP.to(this.elements.content, {
			autoAlpha: 1,
			onComplete: () => (this.hamburger.isAnimating = false),
		});

		GSAP.from(this.elements.contentLinks, {
			x: -1000,
			stagger: 0.1,
			duration: 1,
			ease: 'power4.out',
		});
	}

	closeMenu() {
		this.isOpen = false;

		this.elements.menuItem.classList.remove('open');

		GSAP.to(this.elements.content, {
			autoAlpha: 0,
			onComplete: () => (this.hamburger.isAnimating = false),
		});
	}

	closeAll() {
		this.closeMenu();

		if (this.hamburger.isOpen) this.hamburger.toggleState();
	}
	/**
	 * MENU ELEMENTS RELATED
	 */
	// @TODO

	/**
	 * NAV RELATED
	 */
	createTimeline() {
		// this.enterTl = GSAP.timeline();

		// this.enterTl.fromTo(
		// 	this.elements.logoOverlay,
		// 	{
		// 		opacity: 0,
		// 	},
		// 	{
		// 		opacity: 1,
		// 		duration: 0.5,
		// 		ease: 'out.expo',
		// 	},
		// 	0
		// );

		// this.leaveTl = GSAP.timeline();

		// this.leaveTl.fromTo(
		// 	this.elements.logoOverlay,
		// 	{
		// 		opacity: 1,
		// 	},
		// 	{
		// 		opacity: 0,
		// 		duration: 0.2,
		// 		stagger: 0.1,
		// 		ease: 'out.expo',
		// 	},
		// 	0
		// );

		// this.enterTl.pause();
		// this.leaveTl.restart();

		const isTablet = window.innerWidth < 1024;

		if (!isTablet) {
			this.navWrapperTimeline = GSAP.timeline({ paused: true });
			this.navWrapperTimeline.fromTo(
				this.elements.navWrapper,
				{
					yPercent: -100,
				},
				{
					yPercent: 0,
					duration: 1.2,
					ease: 'power4.out',
				}
			);
		}

		this.tl = GSAP.timeline({
			duration: 0.7,
			ease: 'power4.out',
			paused: true,
		});

		this.tl.fromTo(
			this.element,
			{
				yPercent: -100,
			},
			{ yPercent: 0, duration: 1, ease: 'power4.out' }
		);
	}

	show() {
		this.tl.play();
	}

	hide() {
		this.tl.reverse();
	}

	addEventListeners() {
		this.element.addEventListener('mouseenter', () => {
			this.navWrapperTimeline.play();
			console.log(`PLAY`);
		});
		this.element.addEventListener('mouseleave', () => {
			this.navWrapperTimeline.reverse();
			console.log('REVERSE');
		});
	}
}
