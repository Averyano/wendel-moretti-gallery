import Component from '../../classes/Component';
import GSAP from 'gsap';
import map from 'lodash/map';
import GlobalHandler from '../../classes/GlobalHandler';

export default class Preloader extends Component {
	constructor() {
		super({
			element: document.querySelector('.preloader'),
			elements: {
				text: '.preloader__logo__text',
				loadingbar: '.preloader__loadingbar',
				images: document.querySelectorAll('[data-pre]'),
				main: document.querySelector('.preloader__bg--main'),
				overlay: document.querySelector('.preloader__bg--overlay'),
			},
		});

		this.isComplete = false;
		this.firstReveal = true;
		this.isIntroComplete = 0;
		this.elementToAnimate = [this.elements.overlay, this.elements.main];

		this.createTimeline();
		// this.introAnimation();
		this.onResize();
		GlobalHandler.registerResize(this.onResize.bind(this));
	}

	/**
	 * LOADER
	 */
	// called from Loader
	createLoader(template) {
		this.introAnimation();

		if (template === '404') return (this.isLoaded = true);
		this.length = 0;

		if (this.elements.images.length > 0)
			this.elements.images.forEach((img) => {
				// console.log('loadImg', img);
				this.loadImage(img);
			});

		if (this.elements.images.length === 0) {
			this.timer = setTimeout(this.onLoaded.bind(this), 100);
			console.log('No Images to load');
		}
	}

	/**
	 * ANIMATION
	 */
	animateElement(el, i) {
		GSAP.from(el, {
			yPercent: 100,
			duration: 0.7,
			delay: i,
			ease: 'out.expo',
			onComplete: () => {
				this.isIntroComplete++;

				if (this.isLoaded) {
					if (this.timer) clearTimeout(this.timer);
					this.timer = setTimeout(this.onLoaded.bind(this), 1000);
				}
			},
		});

		GSAP.set(el, { autoAlpha: 1 }, 0);
	}

	animateLine(number) {
		GSAP.to(this.elements.loadingbar, {
			scaleX: number,
		});
	}

	introAnimation() {
		let delayTime = 0;
		this.animateLine(0);
		this.isIntroComplete = 0;

		if (this.firstReveal) {
			this.revealText();
		}

		map(this.elementToAnimate, (el, i) => {
			if (this.elements.images.length === 0) {
				this.isIntroComplete = 2;
			}
			this.animateElement(el, i + 0.7);
			delayTime += i + 0.7;
		});
	}

	revealText() {
		GSAP.fromTo(
			this.elements.text.children,
			{
				y: 200,
				rotate: 10,
			},
			{
				y: 0,
				rotate: 0,
				stagger: 0.1,
				duration: 0.7,
				ease: 'out.expo',
				onComplete: () => (this.firstReveal = false),
			}
		);

		GSAP.set(this.elements.text, { opacity: 1 }, 0);
	}

	// The end animation
	createTimeline() {
		this.timeline = GSAP.timeline({
			paused: true,
		});

		this.timeline
			.fromTo(
				this.elements.loadingbar,
				{ opacity: 1 },
				{ opacity: 0, duration: 0.25, delay: 0.25, ease: 'out.expo' }
			)
			.fromTo(
				this.elements.text,
				{ opacity: 1 },
				{ opacity: 0, duration: 0.25, ease: 'out.expo' }
			)
			.fromTo(
				this.element,
				{ yPercent: 0 },
				{
					yPercent: -100,
					duration: 1.2,
					ease: 'out.expo',
					onComplete: () => {
						GSAP.set(this.elements.text, { opacity: 0 }, 0);

						this.isComplete = false;
						if (this.timer) clearTimeout(this.timer);

						setTimeout(() => {
							this.elements.loadingbar.dataset.loaded = 0;
							this.animateLine(0);
						}, 1000);
					},
				}
			);
	}

	/**
	 * IMAGE LOADING
	 */
	loadImage(img) {
		if (img.tagName.toLowerCase() === 'img') {
			// <img> tag
			// if (img.src) {
			// 	console.log(img, 'already loaded');
			// 	return this.onAssetLoaded(); // Image is already loaded
			// }

			const boundOnAssetLoaded = this.onAssetLoaded.bind(this);
			img.addEventListener('load', boundOnAssetLoaded);

			img.onload = function () {
				img.removeEventListener('load', boundOnAssetLoaded);
			};

			const imageUrl =
				GlobalHandler.isWebpSupported && img.getAttribute('data-pre-webp')
					? img.getAttribute('data-pre-webp')
					: img.getAttribute('data-pre');
			img.src = imageUrl;
		} else {
			// other tags (for background image)
			const imageUrl =
				GlobalHandler.isWebpSupported && img.getAttribute('data-pre-webp')
					? img.getAttribute('data-pre-webp')
					: img.getAttribute('data-pre');

			const tempImage = new Image();
			tempImage.onload = () => {
				img.style.backgroundImage = `url(${imageUrl})`;
				this.onAssetLoaded();
				tempImage.onload = null; // optional, goes to garbage collection anyways
			};

			tempImage.src = imageUrl;
		}
	}

	onAssetLoaded() {
		this.length++;
		let imageLength = 0;

		if (this.elements.images) {
			imageLength += this.elements.images.length;
		}

		const percent = this.length / imageLength;

		this.elements.loadingbar.dataset.loaded = percent;

		this.animateLine(percent);

		if (percent === 1) {
			this.isLoaded = true;

			if (this.timer) clearTimeout(this.timer);
			this.timer = setTimeout(this.onLoaded.bind(this), 1000);
			// if (this.isIntroComplete === 2) {
			// }
		}
	}

	onLoaded() {
		// if (this.isComplete) return;
		// this.isComplete = true;
		console.log('onLoaded');
		this.emit('completed');
	}

	show() {
		return new Promise((resolve) => {
			this.timeline.reverse().then(() => {
				resolve();
			});
		});
	}

	hide() {
		this.animateLine(1);
		this.timeline.play();
		console.log('hide');
		// .then(this.destroy.bind(this));
	}

	destroy() {
		// this.element.parentNode.removeChild(this.element);
	}

	onResize() {
		this.elements.loadingbar.style.width = `${
			this.elements.text.getBoundingClientRect().width
		}px`;
	}
}
