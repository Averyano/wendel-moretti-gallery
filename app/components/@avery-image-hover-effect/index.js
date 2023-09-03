import Component from '../../classes/Component';
import GSAP from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import each from 'lodash/each';
import { lerp } from '../../utils/utils.js';

export default class ImageHoverEffect extends Component {
	constructor({ element, elements, activeClass }) {
		super({
			element: element,
			elements: elements,
		});

		this.activeClass = activeClass;

		this.isMouseOver = false;
		this.isMouseActive = false;
		this.isAnimating = false;
		this.isIdle = false;

		this.mouse = {
			x: 0,
			y: 0,
		};

		this.position = {
			x: 0,
			y: 0,
		};

		this.scrollPosition = {
			current: 0,
			previous: 0,
			target: 0,
		};

		this.count = 0;
		this.diff = 0;
	}

	create() {
		super.createComponent();
		this.createImages();
		this.createScene();
		this.createScrollTrigger();

		this.addEventListeners();
	}

	createScrollTrigger() {
		this.scrollTrigEl = ScrollTrigger.create({
			trigger: this.element,
			onEnter: () => {
				this.getBounds();
				this.scrollTrigEl.disable();
			},
		});
	}

	/**
	 * INIT
	 */
	getBounds() {
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			const tempBound = this.element.getBoundingClientRect();

			this.selectionBounds = {};
			this.selectionBounds.top = tempBound.top + window.pageYOffset;
			this.selectionBounds.left = tempBound.left;
			this.figureBounds = this.elements.figure.getBoundingClientRect();

			each(this.elements.content, (obj) => {
				const bounds = obj.button.getBoundingClientRect();
				obj['bounds'] = bounds;
			});
		}, 200);
	}

	createImages() {
		this.imageTimeline = GSAP.timeline({
			paused: true,
		});

		this.imageTimeline.fromTo(
			this.elements.figure,
			{
				opacity: 0,
			},
			{
				duration: 0.5,
				opacity: 1,
				ease: 'power4.easeOut',
			}
		);

		this.activeImage = this.elements.content[0].image;
		this.activeImage.classList.add(this.activeClass);

		this.figureBounds = this.elements.figure.getBoundingClientRect();
	}
	createScene() {}

	/**
	 * MOUSE
	 */

	onMouseEnter(e) {
		if (this.isMouseOver) return;
		this.count = 0;

		this.activeImage.classList.remove(this.activeClass);

		each(this.elements.content, (obj) => {
			if (e.target === obj.button) this.activeImage = obj.image;
		});

		this.activeImage.classList.add(this.activeClass);

		this.imageTimeline.play();
		this.isAnimating = true;
		this.isMouseOver = true;
	}

	onMouseMove(e) {
		if (!this.isMouseOver) return;

		this.isMouseActive = true;

		this.isAnimating = true;

		if (this.timer) clearTimeout(this.timer);

		this.diff = 0;
		this.scrollPosition.previous = null;

		this.mouse.x =
			e.clientX -
			this.figureBounds.width / 2 -
			this.selectionBounds.left +
			window.scrollX;

		this.mouse.y =
			e.clientY -
			this.figureBounds.height / 2 -
			this.selectionBounds.top +
			window.scrollY;
	}

	onMouseLeave(event) {
		this.imageTimeline.reverse();
		this.isMouseOver = false;
	}

	/**
	 * TICK
	 */
	update() {
		if (!this.isAnimating) return;

		this.position.x = lerp(this.position.x, this.mouse.x, 0.2);
		this.position.y = lerp(this.position.y, this.mouse.y, 0.2);

		if (!this.isMouseOver) return;

		GSAP.to(this.elements.figure, {
			x: this.mouse.x,
			y: this.mouse.y - this.diff,
			duration: 1.5,
			immediateRender: false,
			overwrite: 'all',
		});

		GSAP.to(this.activeImage, {
			x: this.mouse.x - this.position.x,
			y: this.mouse.y - this.position.y,
			duration: 1,
			immediateRender: false,
			overwrite: 'all',
		});

		window.requestIdleCallback(this.checkIfStillAnimating.bind(this));
	}

	addEventListeners() {
		const mediaQuery = window.matchMedia('(min-width: 999px)');

		if (!mediaQuery.matches) return;

		this.element.addEventListener('mousemove', this.onMouseMove.bind(this));

		each(this.elements.content, (obj) => {
			obj.button.addEventListener('mouseover', this.onMouseEnter.bind(this));
			obj.button.addEventListener('mouseleave', this.onMouseLeave.bind(this));
		});
	}

	removeEventListeners() {
		this.element.removeEventListener('mousemove', this.onMouseMove.bind(this));

		each(this.elements.content, (obj) => {
			obj.button.removeEventListener('mouseover', this.onMouseEnter.bind(this));
			obj.button.removeEventListener(
				'mouseleave',
				this.onMouseLeave.bind(this)
			);
		});
	}

	onResize() {
		if (!this.isReady) return;
		this.getBounds();
	}

	updateMousePos(e) {
		if (!this.isMouseOver || this.isMouseActive) return;

		if (!this.scrollPosition.previous)
			this.scrollPosition.previous = e.animate.from;

		this.scrollPosition.current = e.animate.from;
		this.scrollPosition.target = e.animate.to;

		this.diff = this.scrollPosition.previous - this.scrollPosition.target;
		this.isAnimating = true;
	}

	checkIfStillAnimating() {
		if (
			Math.abs(this.mouse.x - this.position.x) < 0.01 ||
			Math.abs(this.mouse.y - this.position.y) < 0.01
		) {
			this.isMouseActive = false;

			if (!this.timer)
				this.timer = setTimeout(this.stopAnimating.bind(this), 3000);
		}
	}

	stopAnimating() {
		this.isAnimating = false;
		this.timer = null;

		// GSAP.killTweensOf(this.elements.figure);
		// GSAP.killTweensOf(this.activeImage);
	}

	destroy() {
		super.destroy();

		if (this.scrollTrigEl && this.scrollTrigEl.kill) {
			this.scrollTrigEl.kill();
		}
	}
}
