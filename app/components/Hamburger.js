import GSAP from 'gsap';
import Component from '../classes/Component';
import NodeEmitter from '../classes/NodeEmitter';

export default class Hamburger extends Component {
	constructor() {
		super({
			element: 'nav',
			elements: {
				menu: '.nav__menu',
				menuLines: '.nav__menu__line',
			},
		});

		this.isAnimating = false;
		this.isOpen = false;

		NodeEmitter.on('resetState', this.resetState.bind(this));
	}

	create() {
		this.createAnimation();
		this.addEventListeners();
	}

	resetState() {
		if (this.isOpen) this.toggleState();
	}

	toggleState() {
		if (window.isFullscreen || this.isAnimating) return;

		window.globalAnalyticsInstance.trackEvent('Navigation', {
			action: 'Click',
			label: 'Menu Icon',
		});

		this.isAnimating = true;
		this.isOpen = !this.isOpen;

		if (this.isOpen) {
			NodeEmitter.emit('stopScroll');
			NodeEmitter.emit('openMenu');
		} else if (!this.isOpen) {
			NodeEmitter.emit('startScroll');
			NodeEmitter.emit('closeMenu');
		}

		this.animateHamburger();
	}

	createAnimation() {
		this.tl = GSAP.timeline({
			paused: true,
		});
		this.tl.fromTo(
			this.elements.menuLines[0],
			{
				top: '15px',
				rotate: 0,
			},
			{
				rotate: 45,
				top: '50%',
				duration: 0.5,
				ease: 'out.power4',
			},
			0
		);

		this.tl.fromTo(
			this.elements.menuLines[1],
			{
				opacity: 1,
			},
			{
				opacity: 0,
				duration: 0.29,
				ease: 'out.power4',
			},
			0
		);

		this.tl.fromTo(
			this.elements.menuLines[2],
			{
				top: '31px',
				rotate: 0,
			},
			{
				rotate: -45,
				top: '50%',
				duration: 0.5,
				ease: 'out.power4',
			},
			0
		);
	}

	// animateHamburger() {
	// 	console.log('animateHamburger');
	// }

	animateHamburger = () => (this.isOpen ? this.tl.play() : this.tl.reverse());

	addEventListeners() {
		this.elements.menu.addEventListener('click', this.toggleState.bind(this));
	}
}
