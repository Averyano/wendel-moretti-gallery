import {
	lerp,
	getMousePos,
	getTouchPos,
	calcWinsize,
	distance,
} from '../utils/utils.js';
import Component from '../classes/Component.js';
import GSAP from 'gsap';

export default class Button extends Component {
	constructor(el) {
		super({
			element: el,
			elements: {
				el: '.circle__wrapper',
				text: '.circle__button__text',
				textInner: '.circle__button__text--inner',
				svg: 'svg',
				path: 'path',
			},
		});

		this.renderedStyles = {
			tx: { previous: 0, current: 0, amt: 0.1 },
			ty: { previous: 0, current: 0, amt: 0.1 },
		};

		this.colors = {
			black: 'rgb(17, 17, 17)',
			stone: 'rgb(209, 201, 194)',
		};
		this.isRunning = false;
		this.isTouch = false;

		this.state = {
			hover: false,
		};

		this.calculateBounds();
		this.createMouse();
		this.addEventListeners();

		this.frameCount = 0;
		requestAnimationFrame(() => this.update());
	}

	createMouse() {
		this.mousepos = { x: 0, y: 0 };
	}

	calculateBounds() {
		// size/position
		const bounds = this.elements.el.getBoundingClientRect();
		this.rect = {
			top: bounds.top + window.scrollY,
			left: bounds.left,
			width: bounds.width,
			height: bounds.height,
		};

		// the movement will take place when the distance from the mouse to the center of the button is lower than this value
		this.distanceToTrigger = this.rect.width * 0.8;
	}

	addEventListeners() {
		// Launches raf
		this.elements.el.addEventListener('mouseover', () => {
			if (!this.isRunning) {
				this.frameCount = 0;
				this.isRunning = true;
				this.update();
			}
		});

		// Handle resize events
		window.addEventListener('resize', this.onResize.bind(this));

		// Handle mouse events
		window.addEventListener(
			'mousemove',
			(e) => (this.mousepos = getMousePos(e))
		);
	}

	removeEventListeners() {
		// Launches raf
		this.elements.el.removeEventListener('mouseover', () => {
			if (!this.isRunning) {
				this.frameCount = 0;
				this.isRunning = true;
				this.update();
			}
		});

		// Handle resize events
		window.removeEventListener('resize', this.onResize.bind(this));

		// Handle mouse events
		window.removeEventListener(
			'mousemove',
			(e) => (this.mousepos = getMousePos(e))
		);
	}

	onResize() {
		this.winsize = calcWinsize();
		this.calculateBounds();
		this.element.style.bottom = '32px';
	}

	update() {
		if (!this.isRunning) return;

		const distanceMouseButton = distance(
			this.mousepos.x + window.scrollX,
			this.mousepos.y + window.scrollY,
			this.rect.left + this.rect.width / 2,
			this.rect.top + this.rect.height / 2
		);

		let x = 0;
		let y = 0;

		if (distanceMouseButton < this.distanceToTrigger) {
			if (!this.state.hover) {
				this.enter();
			}
			x =
				(this.mousepos.x +
					window.scrollX -
					(this.rect.left + this.rect.width / 2)) *
				0.3;
			y =
				(this.mousepos.y +
					window.scrollY -
					(this.rect.top + this.rect.height / 2)) *
				0.3;
		} else if (this.state.hover) {
			this.leave();
		}

		this.renderedStyles['tx'].current = x;
		this.renderedStyles['ty'].current = y;

		for (const key in this.renderedStyles) {
			this.renderedStyles[key].previous = lerp(
				this.renderedStyles[key].previous,
				this.renderedStyles[key].current,
				this.renderedStyles[key].amt
			);
		}

		this.elements.el.style.transform = `translate3d(${this.renderedStyles['tx'].previous}px, ${this.renderedStyles['ty'].previous}px, 0)`;

		requestAnimationFrame(() => this.update());
		requestIdleCallback(() => {
			this.stopRender();
		});
	}

	stopRender() {
		if (!this.state.hover) {
			this.frameCount += 1;
			if (this.frameCount >= 90) this.isRunning = false;
			return;
		}

		this.frameCount = 0;
	}

	revealButton() {
		GSAP.to(this.element, {
			opacity: 1,
			duration: 1.2,
			ease: 'back.out(1.7)',
		});
	}

	enter() {
		this.isRunning = true;
		this.state.hover = true;

		this.elements.text.classList.add('active');

		GSAP.killTweensOf(this.elements.path);
		GSAP.killTweensOf(this.elements.el);

		GSAP.timeline()
			.to(this.elements.path, {
				fill: '#111111',
				duration: 0.5,
				ease: 'Power2.easeOut',
			})
			.to(
				this.elements.el,
				{
					background: this.colors.stone,
					duration: 0.5,
					ease: 'Power2.easeOut',
				},
				0
			)
			.to(
				this.elements.text,
				{
					color: this.colors.black,
					duration: 0.5,
					ease: 'Power2.easeOut',
				},
				0
			);
		// .to(
		// 	this.elements.svg,
		// 	{
		// 		rotateY: 180,
		// 		duration: 0.5,
		// 		ease: 'Power2.easeOut',
		// 	},
		// 	0
		// )
		// .to(
		// 	this.elements.svg,
		// 	{
		// 		rotateY: 360,
		// 		duration: 0.5,
		// 		ease: 'Power2.easeOut',
		// 	},
		// 	'>-0.25'
		// );
	}

	leave() {
		this.state.hover = false;
		this.elements.text.classList.remove('active');

		GSAP.killTweensOf(this.elements.path);
		GSAP.killTweensOf(this.elements.el);

		GSAP.timeline()
			.to(this.elements.path, {
				fill: '#ffffff',
				duration: 0.5,
				ease: 'Power2.easeOut',
			})
			.to(
				this.elements.el,
				{
					background: this.colors.black,
					duration: 0.5,
					ease: 'Power2.easeOut',
				},
				0
			)
			.to(
				this.elements.text,
				{
					color: '#ffffff',
					duration: 0.5,
					ease: 'Power2.easeOut',
				},
				0
			);
		// .set(
		// 	this.elements.svg,
		// 	{
		// 		rotateY: 0,
		// 	},
		// 	0
		// );

		// GSAP.killTweensOf(this.elements.textInner);

		// GSAP.timeline()
		// 	.to(this.elements.textInner, {
		// 		duration: 0.15,
		// 		ease: 'Power2.easeIn',
		// 		opacity: 0,
		// 		x: '-20%',
		// 	})
		// 	.to(this.elements.textInner, {
		// 		duration: 0.2,
		// 		ease: 'Expo.easeOut',
		// 		opacity: 1,
		// 		startAt: { x: '20%' },
		// 		x: '0%',
		// 	});
	}
}
